import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const admin = getSupabaseAdmin();
    const startedAt = Date.now();

    // Lightweight connectivity check against an existing table.
    const { error } = await admin.from('profiles').select('id', { count: 'exact', head: true });
    if (error) {
      return NextResponse.json(
        {
          ok: false,
          service: 'supabase',
          error: error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      service: 'supabase',
      latencyMs: Date.now() - startedAt,
      checkedTable: 'profiles',
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        service: 'supabase',
        error: e instanceof Error ? e.message : 'Unexpected DB health error',
      },
      { status: 500 },
    );
  }
}
