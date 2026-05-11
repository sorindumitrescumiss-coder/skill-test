import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { askAI, parseJsonFromAI } from '@/lib/ai';
import { tryServerMintSkillCredential } from '@/lib/nft/serverMintSkillCredential';

type GradePayload = { score: number; feedback: string };

type MCQQuestion = {
  id: string;
  text: string;
  options: string[];
  correctOption: number;
};
type OpenQuestion = { id: string; text: string };
type PracticalQuestion = { id: string; text: string };
type StoredQuestions = {
  topic?: string;
  mcq?: MCQQuestion[];
  openEnded?: OpenQuestion[];
  correctingMistakes?: OpenQuestion[];
  practical?: PracticalQuestion[] | PracticalQuestion;
  aiInterview?: OpenQuestion[];
};

function isMissingColumnError(message?: string) {
  const m = (message ?? '').toLowerCase();
  return m.includes("could not find the 'questions_json' column") || (m.includes('column') && m.includes('does not exist'));
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    attemptId?: string;
    mcAnswers?: Record<string, number>;
    openAnswers?: Record<string, string>;
    correctingAnswers?: Record<string, string>;
    practicalAnswers?: Record<string, string>;
    aiInterviewAnswers?: Record<string, string>;
    proctoringReport?: string;
  };
  if (!body.attemptId || !body.mcAnswers || !body.openAnswers || typeof body.openAnswers !== 'object') {
    return NextResponse.json(
      {
        error:
          'Body must include { attemptId, mcAnswers, openAnswers, correctingAnswers, practicalAnswers, aiInterviewAnswers }',
      },
      { status: 400 },
    );
  }

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  }

  const { data: attempt, error: aErr } = await supabase
    .from('test_attempts')
    .select('id, user_id, questions_json, status')
    .eq('id', body.attemptId)
    .maybeSingle();

  let mcq: MCQQuestion[] = [];
  let openEnded: OpenQuestion[] = [];
  let correctingMistakes: OpenQuestion[] = [];
  let practical: PracticalQuestion[] = [];
  let aiInterview: OpenQuestion[] = [];
  let isLegacySchema = true;

  if (!aErr && attempt) {
    if (attempt.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (attempt.status !== 'in_progress') {
      return NextResponse.json({ error: 'This attempt is already completed' }, { status: 400 });
    }
    const questions = (attempt.questions_json ?? {}) as StoredQuestions;
    mcq = Array.isArray(questions.mcq) ? questions.mcq : [];
    openEnded = Array.isArray(questions.openEnded) ? questions.openEnded : [];
    correctingMistakes = Array.isArray(questions.correctingMistakes) ? questions.correctingMistakes : [];
    practical = Array.isArray(questions.practical)
      ? questions.practical
      : questions.practical
        ? [questions.practical]
        : [];
    aiInterview = Array.isArray(questions.aiInterview) ? questions.aiInterview : [];
  } else {
    if (!isMissingColumnError(aErr?.message)) {
      return NextResponse.json({ error: aErr?.message || 'Attempt not found' }, { status: 404 });
    }
    isLegacySchema = false;
    const { data: attemptNew, error: attemptNewErr } = await supabase
      .from('test_attempts')
      .select('id, user_id, test_id')
      .eq('id', body.attemptId)
      .maybeSingle();
    if (attemptNewErr || !attemptNew) {
      return NextResponse.json({ error: attemptNewErr?.message || 'Attempt not found' }, { status: 404 });
    }
    if (attemptNew.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const { data: questionRows, error: qErr } = await supabase
      .from('questions')
      .select('id, question, options')
      .eq('test_id', attemptNew.test_id);
    if (qErr || !questionRows) {
      return NextResponse.json({ error: qErr?.message || 'Questions not found' }, { status: 404 });
    }
    const parsedRows = questionRows
      .map((row) => {
        const meta = (row.options ?? {}) as {
          id?: string;
          type?: 'mcq' | 'open' | 'practical' | 'correcting' | 'ai_interview';
          options?: string[];
          correctOption?: number;
        };
        return {
          id: meta.id ?? row.id,
          type: meta.type,
          text: row.question as string,
          options: Array.isArray(meta.options) ? meta.options : [],
          correctOption: typeof meta.correctOption === 'number' ? meta.correctOption : -1,
        };
      })
      .filter((row) => row.type);
    mcq = parsedRows
      .filter((row) => row.type === 'mcq')
      .map((row) => ({
        id: row.id,
        text: row.text,
        options: Array.isArray(row.options) ? row.options.map((s) => String(s ?? '')) : [],
        correctOption: typeof row.correctOption === 'number' ? row.correctOption : -1,
      }));
    openEnded = parsedRows
      .filter((row) => row.type === 'open')
      .map((row) => ({ id: row.id, text: row.text }));
    correctingMistakes = parsedRows
      .filter((row) => row.type === 'correcting')
      .map((row) => ({ id: row.id, text: row.text }));
    practical = parsedRows
      .filter((row) => row.type === 'practical')
      .map((row) => ({ id: row.id, text: row.text }));
    aiInterview = parsedRows
      .filter((row) => row.type === 'ai_interview')
      .map((row) => ({ id: row.id, text: row.text }));
  }

  const mcCorrect = mcq.reduce((acc, q) => {
    return acc + ((body.mcAnswers?.[q.id] ?? -1) === q.correctOption ? 1 : 0);
  }, 0);
  const mcScore = Math.round((mcCorrect / Math.max(1, mcq.length)) * 40);

  const openParts = openEnded.map((q) => {
    const a = (body.openAnswers?.[q.id] ?? '').trim() || '(no answer)';
    return `Open ${q.id}: ${q.text}\nAnswer: ${a}`;
  });
  const correctingParts = correctingMistakes.map((q) => {
    const a = (body.correctingAnswers?.[q.id] ?? '').trim() || '(no answer)';
    return `Correcting ${q.id}: ${q.text}\nAnswer: ${a}`;
  });
  const practicalParts = practical.map((q) => {
    const a = (body.practicalAnswers?.[q.id] ?? '').trim() || '(no answer)';
    return `Practical ${q.id}: ${q.text}\nAnswer: ${a}`;
  });
  const interviewParts = aiInterview.map((q) => {
    const a = (body.aiInterviewAnswers?.[q.id] ?? '').trim() || '(no answer)';
    return `AI Interview ${q.id}: ${q.text}\nAnswer: ${a}`;
  });

  const gradePrompt = `You are grading the non-MCQ section of a skills test.
Rubric:
- Score only openEnded + correcting + practical + ai interview parts, from 0 to 60.
- Evaluate correctness, clarity, depth, practical reasoning, communication quality, and consistency.
Return JSON only:
{ "score": <integer 0-60>, "feedback": "<3-5 concise sentences with strengths and gaps>" }

Proctoring signals:
${body.proctoringReport?.trim() || 'No proctoring signals provided.'}

${[...openParts, ...correctingParts, ...practicalParts, ...interviewParts].join('\n\n')}`;

  let raw: string;
  try {
    raw = await askAI(gradePrompt);
  } catch (e) {
    const m = e instanceof Error ? e.message : 'AI error';
    return NextResponse.json({ error: m }, { status: 502 });
  }

  let grade: GradePayload;
  try {
    grade = parseJsonFromAI<GradePayload>(raw);
  } catch {
    return NextResponse.json({ error: 'Grading model returned invalid JSON' }, { status: 502 });
  }

  const feedback = String(grade.feedback ?? '');
  const nonMcScore = Math.min(60, Math.max(0, Math.round(Number(grade.score) || 0)));
  const totalScore = Math.min(100, Math.max(0, mcScore + nonMcScore));
  const passed = totalScore >= 60;

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch (e) {
    const m = e instanceof Error ? e.message : 'Config error';
    return NextResponse.json({ error: m }, { status: 500 });
  }

  const { data: insertedRow, error: insErr } = await admin.from('skill_test_results').insert({
    user_id: user.id,
    attempt_id: body.attemptId,
    score: totalScore,
    passed,
    feedback: `MCQ: ${mcCorrect}/${Math.max(1, mcq.length)} correct (${mcScore}/40). ${feedback}`,
    eligible_nft: passed,
  }).select('id').maybeSingle();

  if (!insErr) {
    const { error: upErr } = await supabase
      .from('test_attempts')
      .update({ status: 'completed', submitted_at: new Date().toISOString() })
      .eq('id', body.attemptId)
      .eq('user_id', user.id);
    if (upErr) {
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }

    void tryServerMintSkillCredential({
      admin,
      userId: user.id,
      attemptId: body.attemptId,
      resultId: insertedRow?.id ?? null,
      score: totalScore,
      passed,
      credentialId: null,
      trigger: 'submit',
    });
  } else if (!isLegacySchema) {
    const { error: updateAttemptErr } = await admin
      .from('test_attempts')
      .update({ score: totalScore, passed })
      .eq('id', body.attemptId)
      .eq('user_id', user.id);
    if (updateAttemptErr) {
      return NextResponse.json({ error: updateAttemptErr.message }, { status: 500 });
    }

    void tryServerMintSkillCredential({
      admin,
      userId: user.id,
      attemptId: body.attemptId,
      resultId: null,
      score: totalScore,
      passed,
      credentialId: null,
      trigger: 'submit',
    });
  } else {
    return NextResponse.json(
      { error: 'Your results could not be saved. Please try again or contact support.' },
      { status: 500 },
    );
  }

  return NextResponse.json({
    score: totalScore,
    passed,
    feedback: `MCQ: ${mcCorrect}/${Math.max(1, mcq.length)} correct (${mcScore}/40). ${feedback}`,
    eligibleNft: passed,
  });
}
