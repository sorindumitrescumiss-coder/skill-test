import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

type RecordingStatus = 'started' | 'capture_stopped' | 'uploaded' | 'upload_failed';

type Body = {
  attemptId?: string;
  status?: RecordingStatus;
  startedAt?: string | null;
  captureStoppedAt?: string | null;
  storagePath?: string | null;
  mimeType?: string | null;
  bytes?: number | null;
  capturedBytes?: number | null;
  uploadError?: string | null;
};

function normalizeText(v: unknown): string {
  const s = String(v ?? '').trim();
  return s;
}

function normalizeIso(v: unknown): string | null {
  const s = normalizeText(v);
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function normalizeInt(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return Math.max(0, Math.round(v));
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.round(n));
}

function isTableMissingError(message?: string) {
  const m = (message ?? '').toLowerCase();
  return m.includes("relation 'skill_test_recordings' does not exist");
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Body;
  const attemptId = normalizeText(body.attemptId);
  const status = normalizeText(body.status) as RecordingStatus;

  if (!attemptId || !status) {
    return NextResponse.json({ error: 'Body must include { attemptId, status }.' }, { status: 400 });
  }
  if (!['started', 'capture_stopped', 'uploaded', 'upload_failed'].includes(status)) {
    return NextResponse.json({ error: 'Invalid recording status.' }, { status: 400 });
  }

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

  const { data: attempt, error: attemptErr } = await supabase
    .from('test_attempts')
    .select('id, user_id')
    .eq('id', attemptId)
    .maybeSingle();
  if (attemptErr || !attempt) {
    return NextResponse.json({ error: attemptErr?.message || 'Attempt not found' }, { status: 404 });
  }
  if (attempt.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const startedAt = normalizeIso(body.startedAt);
  const captureStoppedAt = normalizeIso(body.captureStoppedAt);
  const storagePath = normalizeText(body.storagePath) || null;
  const mimeType = normalizeText(body.mimeType) || null;
  const bytes = normalizeInt(body.bytes);
  const capturedBytes = normalizeInt(body.capturedBytes);
  const uploadError = normalizeText(body.uploadError) || null;

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch (e) {
    const m = e instanceof Error ? e.message : 'Config error';
    return NextResponse.json({ error: m }, { status: 500 });
  }

  const { error } = await admin.from('skill_test_recordings').upsert(
    {
      attempt_id: attemptId,
      user_id: user.id,
      status,
      started_at: startedAt,
      capture_stopped_at: captureStoppedAt,
      uploaded_at: status === 'uploaded' ? new Date().toISOString() : null,
      storage_path: storagePath,
      mime_type: mimeType,
      bytes,
      captured_bytes: capturedBytes,
      upload_error: uploadError,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'attempt_id' },
  );

  if (error) {
    if (isTableMissingError(error.message)) {
      return NextResponse.json(
        { error: 'Missing table public.skill_test_recordings. Run supabase/skill_test_recordings.sql.' },
        { status: 501 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
