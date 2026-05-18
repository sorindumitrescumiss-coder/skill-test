import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { askAI, parseJsonFromAI } from '@/lib/ai';
import { isStripePaymentRequired } from '@/lib/stripe/config';
import {
  consumePayment,
  findAvailableCredit,
  isMissingPaymentsTable,
} from '@/lib/stripe/payments';

const MCQ_COUNT = 25;
const MCQ_OPTIONS_PER_QUESTION = 10;
const CORRECTING_MISTAKES_COUNT = 15;

type MCQQuestion = {
  id: string;
  text: string;
  /** Exactly MCQ_OPTIONS_PER_QUESTION strings */
  options: string[];
  /** Index 0 .. MCQ_OPTIONS_PER_QUESTION - 1 */
  correctOption: number;
};

type OpenQuestion = { id: string; text: string };
type PracticalQuestion = { id: string; text: string };

type StartPayload = {
  topic: string;
  mcq: MCQQuestion[];
  openEnded: OpenQuestion[];
  correctingMistakes: OpenQuestion[];
  practical: PracticalQuestion[];
  aiInterview: OpenQuestion[];
};

function isValidMcqList(mcq: unknown): mcq is MCQQuestion[] {
  if (!Array.isArray(mcq) || mcq.length !== MCQ_COUNT) return false;
  return mcq.every((q) => {
    if (!q || typeof q !== 'object') return false;
    const o = q as Record<string, unknown>;
    return (
      typeof o.id === 'string' &&
      typeof o.text === 'string' &&
      Array.isArray(o.options) &&
      o.options.length === MCQ_OPTIONS_PER_QUESTION &&
      o.options.every((x) => typeof x === 'string') &&
      typeof o.correctOption === 'number' &&
      Number.isInteger(o.correctOption) &&
      o.correctOption >= 0 &&
      o.correctOption < MCQ_OPTIONS_PER_QUESTION
    );
  });
}

function isValidRestPayload(p: StartPayload): boolean {
  return (
    Array.isArray(p.openEnded) &&
    p.openEnded.length === 10 &&
    Array.isArray(p.correctingMistakes) &&
    p.correctingMistakes.length === CORRECTING_MISTAKES_COUNT &&
    Array.isArray(p.practical) &&
    p.practical.length === 2 &&
    !p.practical.some((q) => !q?.id || !q?.text) &&
    Array.isArray(p.aiInterview) &&
    p.aiInterview.length === 5
  );
}

/** Large output: 25×10 MCQ + other parts must not be truncated. */
const SKILL_TEST_AI_MAX_TOKENS = 28_000;

function buildMcqRepairPrompt(
  topic: string,
  difficulty: string,
  contentFocus: string,
  failed: StartPayload,
): string {
  const n = Array.isArray(failed.mcq) ? failed.mcq.length : 0;
  const firstOpts = Array.isArray(failed.mcq?.[0]?.options) ? failed.mcq[0].options.length : 0;
  return `Your previous JSON was INVALID for the multiple-choice section.
You returned ${n} mcq items (required: ${MCQ_COUNT}) and the first question had ${firstOpts} options (required: ${MCQ_OPTIONS_PER_QUESTION} each).

Regenerate the COMPLETE assessment. Return JSON only (no markdown).
Topic: ${topic}
Difficulty: ${difficulty}
Content focus: ${contentFocus}

Shape (must match exactly):
{
  "topic": string,
  "mcq": [ ${MCQ_COUNT} items, each: { "id", "text", "options": [${MCQ_OPTIONS_PER_QUESTION} strings], "correctOption": 0..${MCQ_OPTIONS_PER_QUESTION - 1} } ],
  "openEnded": [ 10 items ],
  "correctingMistakes": [ ${CORRECTING_MISTAKES_COUNT} items ],
  "practical": [ 2 items ],
  "aiInterview": [ 5 items ]
}
Do not use 4 options or 10 total mcq — that is the old format. Every mcq must have ${MCQ_OPTIONS_PER_QUESTION} options.`;
}

function isMissingColumnError(message?: string) {
  const m = (message ?? '').toLowerCase();
  return m.includes("column") && m.includes("does not exist") || m.includes("could not find the 'questions_json' column");
}

function mapDifficultyForTests(
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master',
) {
  if (difficulty === 'beginner') return 'easy';
  if (difficulty === 'intermediate') return 'medium';
  return 'hard';
}

async function insertTestWithCompatibleDifficulty(
  admin: ReturnType<typeof getSupabaseAdmin>,
  title: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master',
) {
  const mapped = mapDifficultyForTests(difficulty);
  const candidates = [
    difficulty,
    mapped,
    difficulty.toUpperCase(),
    mapped.toUpperCase(),
    'beginner',
    'intermediate',
    'advanced',
    'expert',
    'master',
    'easy',
    'medium',
    'hard',
    'EASY',
    'MEDIUM',
    'HARD',
  ];
  const tried = new Set<string>();
  let lastError: string | null = null;

  for (const value of candidates) {
    if (tried.has(value)) continue;
    tried.add(value);
    const { data, error } = await admin
      .from('tests')
      .insert({
        title,
        difficulty: value,
      })
      .select('id')
      .single();
    if (!error && data) {
      return { id: data.id as string, difficultyUsed: value };
    }
    lastError = error?.message ?? 'Failed to create test';
  }

  // Some schemas enforce a custom check on difficulty or have a default value.
  // Try inserting without difficulty so DB default/check can take over.
  const { data: noDifficultyData, error: noDifficultyError } = await admin
    .from('tests')
    .insert({
      title,
    })
    .select('id')
    .single();
  if (!noDifficultyError && noDifficultyData) {
    return { id: noDifficultyData.id as string, difficultyUsed: null };
  }

  return { id: null, difficultyUsed: null, error: noDifficultyError?.message ?? lastError };
}

export async function POST(request: Request) {
  let topic = 'JavaScript & web fundamentals';
  let difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master' = 'intermediate';
  let contentFocus = 'Core practical concepts and reasoning';
  let paymentId: string | undefined;
  try {
    const b = (await request.json().catch(() => ({}))) as {
      topic?: string;
      difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
      contentFocus?: string;
      paymentId?: string;
    };
    if (typeof b.paymentId === 'string' && b.paymentId.trim()) {
      paymentId = b.paymentId.trim();
    }
    if (b.topic?.trim()) topic = b.topic.trim().slice(0, 120);
    if (b.difficulty && ['beginner', 'intermediate', 'advanced', 'expert', 'master'].includes(b.difficulty)) {
      difficulty = b.difficulty;
    }
    if (b.contentFocus?.trim()) contentFocus = b.contentFocus.trim().slice(0, 400);
  } catch {
    /* default topic */
  }

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  }

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch (e) {
    const m = e instanceof Error ? e.message : 'Config error';
    return NextResponse.json({ error: m }, { status: 500 });
  }

  let resolvedPaymentId: string | null = null;
  if (isStripePaymentRequired()) {
    if (paymentId) {
      const { data: paymentRow, error: payErr } = await admin
        .from('skill_test_payments')
        .select('id, user_id, status, consumed_at')
        .eq('id', paymentId)
        .maybeSingle();
      if (payErr) {
        if (isMissingPaymentsTable(payErr.message)) {
          return NextResponse.json(
            { error: 'Payments are not set up. Run supabase/stripe_payments.sql.', code: 'PAYMENT_SETUP' },
            { status: 503 },
          );
        }
        return NextResponse.json({ error: payErr.message }, { status: 500 });
      }
      if (!paymentRow || paymentRow.user_id !== user.id) {
        return NextResponse.json(
          { error: 'Valid payment required before starting a test.', code: 'PAYMENT_REQUIRED' },
          { status: 402 },
        );
      }
      if (paymentRow.status !== 'paid' || paymentRow.consumed_at) {
        return NextResponse.json(
          { error: 'Complete payment before entering the exam room.', code: 'PAYMENT_REQUIRED' },
          { status: 402 },
        );
      }
      resolvedPaymentId = paymentRow.id;
    } else {
      const credit = await findAvailableCredit(admin, user.id);
      if (!credit) {
        return NextResponse.json(
          {
            error: 'Pay the exam fee before starting your attempt.',
            code: 'PAYMENT_REQUIRED',
          },
          { status: 402 },
        );
      }
      resolvedPaymentId = credit.id;
    }
  }

  const username = user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`;
  const { error: ensureUserErr } = await admin.from('users').upsert(
    {
      id: user.id,
      username,
      email: user.email ?? `${user.id}@local.invalid`,
    },
    { onConflict: 'id' },
  );
  if (ensureUserErr && !ensureUserErr.message.toLowerCase().includes("relation 'users' does not exist")) {
    return NextResponse.json({ error: ensureUserErr.message }, { status: 500 });
  }

  const prompt = `You write short skills assessments.
Topic: ${topic}
Difficulty: ${difficulty}
Content focus: ${contentFocus}
Return JSON only (no markdown) with this exact shape:
{
  "topic": string,
  "mcq": [
    {
      "id": "mcq-1",
      "text": "question text",
      "options": ["option 0", "option 1", "option 2", "option 3", "option 4", "option 5", "option 6", "option 7", "option 8", "option 9"],
      "correctOption": 0
    }
  ],
  "openEnded": [
    { "id": "open-1", "text": "question text" }
  ],
  "correctingMistakes": [
    { "id": "correct-1", "text": "buggy code or wrong statement to fix" }
  ],
  "practical": [
    { "id": "practical-1", "text": "one practical task question" }
  ],
  "aiInterview": [
    { "id": "interview-1", "text": "one interview-style reasoning question" }
  ]
}
Rules:
- Create exactly ${MCQ_COUNT} mcq questions.
- Each mcq must have exactly ${MCQ_OPTIONS_PER_QUESTION} distinct options (strings); place plausible distractors — only one is correct.
- correctOption must be an integer from 0 through ${MCQ_OPTIONS_PER_QUESTION - 1} (index into options).
- Create exactly 10 openEnded questions.
- Create exactly ${CORRECTING_MISTAKES_COUNT} correctingMistakes questions.
- Create exactly 2 practical questions.
- Create exactly 5 aiInterview questions.
- All questions must match topic, difficulty, and content focus.
- Keep questions concise but challenging.`;

  let raw: string;
  try {
    raw = await askAI(prompt, { maxTokens: SKILL_TEST_AI_MAX_TOKENS });
  } catch (e) {
    const m = e instanceof Error ? e.message : 'AI error';
    return NextResponse.json({ error: m }, { status: 502 });
  }

  let payload: StartPayload;
  try {
    payload = parseJsonFromAI<StartPayload>(raw);
  } catch {
    return NextResponse.json(
      { error: 'The assessment service returned invalid data. Please try again in a moment.' },
      { status: 502 },
    );
  }

  if (!isValidMcqList(payload.mcq) || !isValidRestPayload(payload)) {
    try {
      raw = await askAI(buildMcqRepairPrompt(topic, difficulty, contentFocus, payload), {
        maxTokens: SKILL_TEST_AI_MAX_TOKENS,
      });
      payload = parseJsonFromAI<StartPayload>(raw);
    } catch {
      return NextResponse.json(
        {
          error:
            'The assessment could not be generated in the expected format. Please try again; if it keeps failing, try again later.',
        },
        { status: 502 },
      );
    }
  }

  if (!isValidMcqList(payload.mcq) || !isValidRestPayload(payload)) {
    return NextResponse.json(
      {
        error:
          'The assessment could not be generated in the expected format. Please start a new attempt or try again later.',
      },
      { status: 502 },
    );
  }

  const { data: row, error } = await supabase
    .from('test_attempts')
    .insert({
      user_id: user.id,
      topic: payload.topic || topic,
      status: 'in_progress',
      questions_json: payload,
    })
    .select('id')
    .single();

  if (!error) {
    if (resolvedPaymentId) {
      const consumed = await consumePayment(admin, resolvedPaymentId, user.id, row.id);
      if (!consumed.ok) {
        await admin.from('test_attempts').delete().eq('id', row.id);
        return NextResponse.json({ error: consumed.error, code: 'PAYMENT_REQUIRED' }, { status: 402 });
      }
    }
    return NextResponse.json({
      attemptId: row.id,
      topic: payload.topic || topic,
      mcq: payload.mcq.map((q) => ({ id: q.id, text: q.text, options: q.options })),
      openEnded: payload.openEnded.map((q) => ({ id: q.id, text: q.text })),
      correctingMistakes: payload.correctingMistakes.map((q) => ({ id: q.id, text: q.text })),
      practical: payload.practical.map((q) => ({ id: q.id, text: q.text })),
      aiInterview: payload.aiInterview.map((q) => ({ id: q.id, text: q.text })),
    });
  }

  if (!isMissingColumnError(error.message)) {
    return NextResponse.json(
      { error: 'Could not start your test attempt. Please try again later.' },
      { status: 500 },
    );
  }

  const testInsert = await insertTestWithCompatibleDifficulty(admin, payload.topic || topic, difficulty);
  if (!testInsert.id) {
    return NextResponse.json(
      { error: testInsert.error || 'Failed to create test (difficulty constraint mismatch)' },
      { status: 500 },
    );
  }

  const normalizedQuestions = [
    ...payload.mcq.map((q) => ({
      test_id: testInsert.id,
      question: q.text,
      options: {
        id: q.id,
        type: 'mcq',
        options: q.options,
        correctOption: q.correctOption,
      },
      correct_answer: String(q.correctOption),
    })),
    ...payload.openEnded.map((q) => ({
      test_id: testInsert.id,
      question: q.text,
      options: { id: q.id, type: 'open' },
      correct_answer: '',
    })),
    ...payload.correctingMistakes.map((q) => ({
      test_id: testInsert.id,
      question: q.text,
      options: { id: q.id, type: 'correcting' },
      correct_answer: '',
    })),
    ...payload.practical.map((q) => ({
      test_id: testInsert.id,
      question: q.text,
      options: { id: q.id, type: 'practical' },
      correct_answer: '',
    })),
    ...payload.aiInterview.map((q) => ({
      test_id: testInsert.id,
      question: q.text,
      options: { id: q.id, type: 'ai_interview' },
      correct_answer: '',
    })),
  ];

  const { error: qErr } = await admin.from('questions').insert(normalizedQuestions);
  if (qErr) {
    return NextResponse.json({ error: qErr.message }, { status: 500 });
  }

  const { data: attemptRow, error: aErr } = await admin
    .from('test_attempts')
    .insert({
      user_id: user.id,
      test_id: testInsert.id,
      score: 0,
      passed: false,
    })
    .select('id')
    .single();
  if (aErr || !attemptRow) {
    return NextResponse.json({ error: aErr?.message || 'Failed to create attempt' }, { status: 500 });
  }

  if (resolvedPaymentId) {
    const consumed = await consumePayment(admin, resolvedPaymentId, user.id, attemptRow.id);
    if (!consumed.ok) {
      await admin.from('test_attempts').delete().eq('id', attemptRow.id);
      return NextResponse.json({ error: consumed.error, code: 'PAYMENT_REQUIRED' }, { status: 402 });
    }
  }

  return NextResponse.json({
    attemptId: attemptRow.id,
    topic: payload.topic || topic,
    mcq: payload.mcq.map((q) => ({ id: q.id, text: q.text, options: q.options })),
    openEnded: payload.openEnded.map((q) => ({ id: q.id, text: q.text })),
    correctingMistakes: payload.correctingMistakes.map((q) => ({ id: q.id, text: q.text })),
    practical: payload.practical.map((q) => ({ id: q.id, text: q.text })),
    aiInterview: payload.aiInterview.map((q) => ({ id: q.id, text: q.text })),
  });
}
