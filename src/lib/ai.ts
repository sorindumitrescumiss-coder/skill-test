function stripCodeFence(text: string): string {
  return String(text)
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
}

function extractFirstJsonObject(text: string): string | null {
  const s = text.trim();
  const start = s.indexOf('{');
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < s.length; i += 1) {
    const ch = s[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === '{') {
      depth += 1;
      continue;
    }

    if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        return s.slice(start, i + 1);
      }
    }
  }

  return null;
}

export type AskAIOptions = {
  /** OpenRouter `max_tokens` — use a high value for large JSON (e.g. 25 MCQs × 10 options). */
  maxTokens?: number;
};

/**
 * OpenRouter (server only). Set OPENROUTER_API_KEY in .env.
 */
export async function askAI(prompt: string, options?: AskAIOptions): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key || key.startsWith('your-')) {
    throw new Error('Set OPENROUTER_API_KEY in .env');
  }
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4028',
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: options?.maxTokens ?? 8192,
    }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`OpenRouter error ${res.status}: ${text.slice(0, 500)}`);
  }
  const data = JSON.parse(text) as {
    choices?: { message?: { content?: string } }[];
  };
  return (data.choices?.[0]?.message?.content ?? '').trim() || '';
}

export function parseJsonFromAI<T>(raw: string): T {
  const s = stripCodeFence(raw);
  try {
    return JSON.parse(s) as T;
  } catch {
    // Some models prepend/append commentary while still containing valid JSON.
    const extracted = extractFirstJsonObject(s);
    if (!extracted) throw new Error('No JSON object found in AI output');
    return JSON.parse(extracted) as T;
  }
}
