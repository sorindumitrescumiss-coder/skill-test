import express from 'express';
import dotenv from 'dotenv';
import { supabase } from './db.mjs';
import { askAI } from './ai.mjs';

dotenv.config();

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

function normalizeScore(parsed) {
  const raw = Number(parsed?.score);
  if (Number.isNaN(raw)) return 0;
  if (raw <= 10) return Math.round(raw * 10);
  return Math.min(100, Math.round(raw));
}

/** Optional: test AI only (no DB) */
app.post('/test', async (req, res) => {
  const { question, answer } = req.body ?? {};
  if (!question || !answer) {
    return res.status(400).json({ error: 'Body needs { question, answer }' });
  }
  const prompt = `You are a strict skill evaluator.\n\nQuestion: ${question}\nAnswer: ${answer}\n\nReturn JSON only:\n{"score": number (0-10), "feedback": string}\n`;
  try {
    const result = await askAI(prompt);
    return res.json({ result });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'AI request failed' });
  }
});

/**
 * Full flow: score with AI, then insert a row into public.results
 * (matches supabase/results.sql: wallet_address, score 0-100, passed)
 */
app.post('/eval', async (req, res) => {
  const { name, question, answer } = req.body ?? {};
  if (!name || !question || !answer) {
    return res
      .status(400)
      .json({ error: 'Body needs { name, question, answer }' });
  }
  const prompt = `Return JSON only:\n{\n  "score": number,\n  "feedback": string\n}\n\nQuestion: ${question}\nAnswer: ${answer}\nUse score 0-10 for difficulty, we will store as 0-100 in the database.`;
  try {
    const aiText = await askAI(prompt);
    const jsonStr = String(aiText)
      .replace(/^```json\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
    const parsed = JSON.parse(jsonStr);
    const score100 = normalizeScore(parsed);
    const { error } = await supabase.from('results').insert([
      {
        wallet_address: String(name).slice(0, 256),
        score: score100,
        passed: score100 >= 50,
      },
    ]);
    if (error) throw error;
    return res.json({ success: true, result: { score: score100, feedback: String(parsed?.feedback ?? '') } });
  } catch (err) {
    return res
      .status(500)
      .json({ error: err?.message || 'eval failed' });
  }
});

app.get('/leaderboard', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('results')
      .select('*')
      .order('score', { ascending: false });
    if (error) throw error;
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'db error' });
  }
});

const port = Number(process.env.API_PORT) || 3000;
app.listen(port, () => {
  console.log(`API: http://localhost:${port}  (POST /test, /eval, GET /leaderboard)`);
});
