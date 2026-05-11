import fs from 'fs/promises';

function parseEnv(src) {
  const out = {};
  for (const line of src.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    out[key] = value;
  }
  return out;
}

function isPlaceholder(v = '') {
  const s = String(v).toLowerCase();
  return (
    !s ||
    s.includes('your_') ||
    s.includes('your-') ||
    s.includes('your_project') ||
    s.includes('replace') ||
    s === 'xxx'
  );
}

async function loadEnv() {
  const files = ['.env', '.env.local'];
  const merged = {};
  for (const f of files) {
    try {
      const content = await fs.readFile(f, 'utf8');
      Object.assign(merged, parseEnv(content));
    } catch {
      /* file not found is ok */
    }
  }
  return merged;
}

async function checkSupabase(env) {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (isPlaceholder(url) || isPlaceholder(anon)) {
    return { ok: false, detail: 'Missing/placeholder NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY' };
  }
  try {
    const res = await fetch(`${url}/rest/v1/results?select=id&limit=1`, {
      headers: {
        apikey: anon,
        Authorization: `Bearer ${anon}`,
      },
    });
    if (!res.ok) {
      const txt = await res.text();
      return { ok: false, detail: `Supabase REST ${res.status}: ${txt.slice(0, 180)}` };
    }
    return { ok: true, detail: 'Supabase REST reachable with anon key' };
  } catch (e) {
    return { ok: false, detail: `Supabase fetch failed: ${e instanceof Error ? e.message : 'unknown error'}` };
  }
}

async function checkOpenRouter(env) {
  const key = env.OPENROUTER_API_KEY;
  if (isPlaceholder(key)) {
    return { ok: false, detail: 'Missing/placeholder OPENROUTER_API_KEY' };
  }
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4028',
      },
      body: JSON.stringify({
        model: env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
        messages: [{ role: 'user', content: 'Reply exactly: ok' }],
      }),
    });
    if (!res.ok) {
      const txt = await res.text();
      return { ok: false, detail: `OpenRouter ${res.status}: ${txt.slice(0, 180)}` };
    }
    return { ok: true, detail: 'OpenRouter reachable and model responded' };
  } catch (e) {
    return { ok: false, detail: `OpenRouter fetch failed: ${e instanceof Error ? e.message : 'unknown error'}` };
  }
}

async function run() {
  const env = await loadEnv();
  const checks = [];

  checks.push({
    name: 'Supabase URL+anon env',
    ok: !isPlaceholder(env.NEXT_PUBLIC_SUPABASE_URL) && !isPlaceholder(env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    detail: 'Checks NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY',
  });
  checks.push({
    name: 'Service role env',
    ok: !isPlaceholder(env.SUPABASE_SERVICE_ROLE_KEY),
    detail: 'Needed for secure insert into skill_test_results in /api/skill-test/submit',
  });
  checks.push({
    name: 'OpenRouter env',
    ok: !isPlaceholder(env.OPENROUTER_API_KEY),
    detail: 'Checks OPENROUTER_API_KEY',
  });

  checks.push({ name: 'Supabase connectivity', ...(await checkSupabase(env)) });
  checks.push({ name: 'OpenRouter connectivity', ...(await checkOpenRouter(env)) });

  console.log('\nSkillMint doctor\n');
  let failures = 0;
  for (const c of checks) {
    const icon = c.ok ? 'OK' : 'FAIL';
    if (!c.ok) failures += 1;
    console.log(`[${icon}] ${c.name}`);
    console.log(`      ${c.detail}`);
  }

  console.log('\nNext steps');
  console.log('1) Run SQL: supabase/results.sql and supabase/app_schema.sql in Supabase SQL Editor');
  console.log('2) Restart app: npm run dev');
  console.log('3) Sign in at /sign-up-login-screen then test /skill-test');

  if (failures > 0) process.exit(1);
}

run();
