import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const nextPath = requestUrl.searchParams.get('next') ?? '/dashboard';

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return NextResponse.redirect(new URL('/sign-up-login-screen', request.url));
  }

  let response = NextResponse.redirect(new URL(nextPath, request.url));

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const md = (user.user_metadata ?? {}) as Record<string, unknown>;
      const roleRaw = String(md.role ?? 'candidate');
      const role = roleRaw === 'recruiter' ? 'recruiter' : 'candidate';
      const fullName = String(md.full_name ?? '').trim() || null;
      const companyName =
        role === 'recruiter' ? String(md.company_name ?? '').trim() || null : null;
      const phone = String(md.phone ?? '').trim() || null;
      const location = String(md.location ?? '').trim() || null;
      const summary = String(md.summary ?? '').trim() || null;

      const admin = getSupabaseAdmin();
      await admin
        .from('profiles')
        .upsert(
          {
            id: user.id,
            full_name: fullName,
            role,
            company_name: companyName,
            phone,
            location,
            summary,
          },
          { onConflict: 'id' },
        )
        .throwOnError();

      const username = user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`;
      const baseUserRow = {
        id: user.id,
        username,
        email: user.email ?? `${user.id}@local.invalid`,
      };
      const richUserRow = {
        ...baseUserRow,
        full_name: fullName,
        role,
        company_name: companyName,
        phone,
        location,
        summary,
      };
      const richUpsert = await admin.from('users').upsert(richUserRow, { onConflict: 'id' });
      if (richUpsert.error) {
        const msg = richUpsert.error.message.toLowerCase();
        if (
          !msg.includes("relation 'users' does not exist") &&
          !msg.includes('column') &&
          !msg.includes('schema cache')
        ) {
          throw richUpsert.error;
        }
        await admin.from('users').upsert(baseUserRow, { onConflict: 'id' });
      }
    }
  }

  return response;
}
