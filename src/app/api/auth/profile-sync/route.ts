import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { getSupabaseServer } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { includeWalletInProfileDb, isProfilesWalletColumnError } from '@/lib/supabase/profileWalletColumn';

type Body = {
  fullName?: string;
  role?: 'candidate' | 'recruiter';
  companyName?: string;
  firstName?: string | null;
  lastName?: string | null;
  pronoun?: string | null;
  birthday?: string | null;
  age?: number | null;
  education?: string | null;
  workExperience?: string | null;
  mainSkill?: string | null;
  phone?: string | null;
  location?: string | null;
  summary?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  portfolioUrl?: string | null;
  websiteUrl?: string | null;
  resumeFileName?: string | null;
  resumeUploadedAt?: string | null;
  walletAddress?: string | null;
  /** After email confirm or login: copy signup / OAuth metadata into empty profile fields. */
  applyUserMetadata?: boolean;
  /** Remove resume metadata only (no file storage yet). */
  clearResume?: boolean;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  role: 'candidate' | 'recruiter' | null;
  company_name: string | null;
  first_name: string | null;
  last_name: string | null;
  pronoun: string | null;
  birthday: string | null;
  age: number | null;
  education: string | null;
  work_experience: string | null;
  main_skill: string | null;
  phone: string | null;
  location: string | null;
  summary: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  website_url: string | null;
  resume_file_name: string | null;
  resume_uploaded_at: string | null;
  wallet_address: string | null;
};

/** Columns for select/upsert when `wallet_address` exists on `profiles`. */
const PROFILE_SELECT_WITH_WALLET =
  'id,full_name,role,company_name,first_name,last_name,pronoun,birthday,age,education,work_experience,main_skill,phone,location,summary,linkedin_url,github_url,portfolio_url,website_url,resume_file_name,resume_uploaded_at,wallet_address';

/** Legacy deployments before `supabase/skill_test_nft_mints.sql`. */
const PROFILE_SELECT_NO_WALLET =
  'id,full_name,role,company_name,first_name,last_name,pronoun,birthday,age,education,work_experience,main_skill,phone,location,summary,linkedin_url,github_url,portfolio_url,website_url,resume_file_name,resume_uploaded_at';

function asProfileRow(
  row: Omit<ProfileRow, 'wallet_address'> & { wallet_address?: string | null },
): ProfileRow {
  return { ...row, wallet_address: row.wallet_address ?? null };
}

function stripWalletForLegacyUpsert(row: ProfileRow): Omit<ProfileRow, 'wallet_address'> {
  const { wallet_address: _drop, ...rest } = row;
  void _drop;
  return rest;
}

function normalizeFromAny(input: string | null | undefined) {
  const value = String(input ?? '').trim();
  return value.length > 0 ? value : null;
}

/** Prefer DB `profiles.wallet_address`; when missing (or no column), use auth metadata from connect-wallet flow. */
function resolvedWalletForResponse(profileWallet: string | null | undefined, user: User): string {
  const fromProfile = normalizeFromAny(profileWallet ?? '');
  if (fromProfile) return fromProfile;
  const md = (user.user_metadata ?? {}) as Record<string, unknown>;
  return normalizeFromAny(String(md.wallet_address ?? md.walletAddress ?? '')) ?? '';
}

/** When `applyUserMetadata`, fill empty DB fields from `auth.users.raw_user_meta_data`. */
function mergeMetaField(
  bodyVal: string | null | undefined,
  existingVal: string | null,
  metaVal: unknown,
  applyMd: boolean,
): string | null {
  if (bodyVal !== undefined) return normalizeFromAny(bodyVal);
  if (applyMd && !normalizeFromAny(existingVal)) return normalizeFromAny(String(metaVal ?? ''));
  return normalizeFromAny(existingVal);
}

async function getAuthUser() {
  const sb = await getSupabaseServer();
  const {
    data: { user },
    error: authErr,
  } = await sb.auth.getUser();
  if (authErr || !user) return null;
  return user;
}

async function ensureProfile(admin: ReturnType<typeof getSupabaseAdmin>, userId: string) {
  const withWallet = includeWalletInProfileDb();

  if (!withWallet) {
    const { data: existingNoW, error: errNoW } = await admin
      .from('profiles')
      .select(PROFILE_SELECT_NO_WALLET)
      .eq('id', userId)
      .maybeSingle<Omit<ProfileRow, 'wallet_address'>>();
    if (errNoW) throw new Error(errNoW.message);
    if (existingNoW) return asProfileRow({ ...existingNoW, wallet_address: null });
  } else {
    let { data: existing, error } = await admin
      .from('profiles')
      .select(PROFILE_SELECT_WITH_WALLET)
      .eq('id', userId)
      .maybeSingle<ProfileRow>();
    if (error && isProfilesWalletColumnError(error.message)) {
      const retry = await admin
        .from('profiles')
        .select(PROFILE_SELECT_NO_WALLET)
        .eq('id', userId)
        .maybeSingle<Omit<ProfileRow, 'wallet_address'>>();
      existing = retry.data ? asProfileRow({ ...retry.data, wallet_address: null }) : null;
      error = retry.error;
    }
    if (error) throw new Error(error.message);
    if (existing) return existing;
  }

  const { data: authUserResult, error: authUserErr } = await admin.auth.admin.getUserById(userId);
  if (authUserErr || !authUserResult.user) throw new Error(authUserErr?.message ?? 'User not found');

  const md = (authUserResult.user.user_metadata ?? {}) as Record<string, unknown>;
  const roleRaw = String(md.role ?? 'candidate');
  const role = roleRaw === 'recruiter' ? 'recruiter' : 'candidate';

  const bootstrap: ProfileRow = {
    id: userId,
    full_name: normalizeFromAny(String(md.full_name ?? '')),
    role,
    company_name: role === 'recruiter' ? normalizeFromAny(String(md.company_name ?? '')) : null,
    first_name: normalizeFromAny(String(md.first_name ?? '')),
    last_name: normalizeFromAny(String(md.last_name ?? '')),
    pronoun: normalizeFromAny(String(md.pronoun ?? '')),
    birthday: normalizeFromAny(String(md.birthday ?? '')),
    age: Number.isFinite(Number(md.age)) ? Number(md.age) : null,
    education: normalizeFromAny(String(md.education ?? '')),
    work_experience: normalizeFromAny(String(md.work_experience ?? '')),
    main_skill: normalizeFromAny(String(md.main_skill ?? '')),
    phone: normalizeFromAny(String(md.phone ?? '')),
    location: normalizeFromAny(String(md.location ?? '')),
    summary: normalizeFromAny(String(md.summary ?? '')),
    linkedin_url: normalizeFromAny(String(md.linkedin_url ?? '')),
    github_url: normalizeFromAny(String(md.github_url ?? '')),
    portfolio_url: normalizeFromAny(String(md.portfolio_url ?? '')),
    website_url: normalizeFromAny(String(md.website_url ?? '')),
    resume_file_name: normalizeFromAny(String(md.resume_filename ?? '')),
    resume_uploaded_at: normalizeFromAny(String(md.resume_uploaded_at ?? '')),
    wallet_address: null,
  };

  const upsertRow = withWallet ? bootstrap : stripWalletForLegacyUpsert(bootstrap);
  const selectCols = withWallet ? PROFILE_SELECT_WITH_WALLET : PROFILE_SELECT_NO_WALLET;

  let { data: inserted, error: insertErr } = await admin
    .from('profiles')
    .upsert(upsertRow, { onConflict: 'id' })
    .select(selectCols)
    .single();

  if (insertErr && withWallet && isProfilesWalletColumnError(insertErr.message)) {
    const retry = await admin
      .from('profiles')
      .upsert(stripWalletForLegacyUpsert(bootstrap), { onConflict: 'id' })
      .select(PROFILE_SELECT_NO_WALLET)
      .single<Omit<ProfileRow, 'wallet_address'>>();
    insertErr = retry.error;
    inserted = retry.data ?? null;
  }

  if (insertErr) throw new Error(insertErr.message);
  if (!inserted) throw new Error('Profile insert returned no row');

  if (!withWallet || !('wallet_address' in (inserted as Record<string, unknown>))) {
    return asProfileRow({ ...(inserted as Omit<ProfileRow, 'wallet_address'>), wallet_address: null });
  }
  return inserted as ProfileRow;
}

async function syncPublicUsersTable(
  admin: ReturnType<typeof getSupabaseAdmin>,
  row: {
    id: string;
    email: string;
    fullName: string;
    role: 'candidate' | 'recruiter';
    companyName: string;
    firstName: string;
    lastName: string;
    pronoun: string;
    birthday: string;
    age: number | null;
    education: string;
    workExperience: string;
    mainSkill: string;
    phone: string;
    location: string;
    summary: string;
    linkedinUrl: string;
    githubUrl: string;
    portfolioUrl: string;
    websiteUrl: string;
  },
) {
  const username = row.email.split('@')[0] || `user_${row.id.slice(0, 8)}`;
  const minimal = { id: row.id, username, email: row.email };
  const rich = {
    ...minimal,
    full_name: normalizeFromAny(row.fullName),
    role: normalizeFromAny(row.role),
    company_name: normalizeFromAny(row.companyName),
    first_name: normalizeFromAny(row.firstName),
    last_name: normalizeFromAny(row.lastName),
    pronoun: normalizeFromAny(row.pronoun),
    birthday: normalizeFromAny(row.birthday),
    age: row.age ?? null,
    education: normalizeFromAny(row.education),
    work_experience: normalizeFromAny(row.workExperience),
    main_skill: normalizeFromAny(row.mainSkill),
    phone: normalizeFromAny(row.phone),
    location: normalizeFromAny(row.location),
    summary: normalizeFromAny(row.summary),
    linkedin_url: normalizeFromAny(row.linkedinUrl),
    github_url: normalizeFromAny(row.githubUrl),
    portfolio_url: normalizeFromAny(row.portfolioUrl),
    website_url: normalizeFromAny(row.websiteUrl),
  };

  // Some deployments have only (id, username, email) in public.users.
  // Try rich payload first; if columns are missing, gracefully fallback.
  const richRes = await admin.from('users').upsert(rich, { onConflict: 'id' });
  if (!richRes.error) return;
  const msg = richRes.error.message.toLowerCase();
  if (
    msg.includes("relation 'users' does not exist") ||
    msg.includes('column') ||
    msg.includes('schema cache')
  ) {
    await admin.from('users').upsert(minimal, { onConflict: 'id' });
  } else {
    throw new Error(richRes.error.message);
  }
}

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = getSupabaseAdmin();
    const profile = await ensureProfile(admin, user.id);
    await syncPublicUsersTable(admin, {
      id: user.id,
      email: user.email ?? `${user.id}@local.invalid`,
      fullName: profile.full_name ?? '',
      role: profile.role ?? 'candidate',
      companyName: profile.company_name ?? '',
      firstName: profile.first_name ?? '',
      lastName: profile.last_name ?? '',
      pronoun: profile.pronoun ?? '',
      birthday: profile.birthday ?? '',
      age: profile.age ?? null,
      education: profile.education ?? '',
      workExperience: profile.work_experience ?? '',
      mainSkill: profile.main_skill ?? '',
      phone: profile.phone ?? '',
      location: profile.location ?? '',
      summary: profile.summary ?? '',
      linkedinUrl: profile.linkedin_url ?? '',
      githubUrl: profile.github_url ?? '',
      portfolioUrl: profile.portfolio_url ?? '',
      websiteUrl: profile.website_url ?? '',
    });
    return NextResponse.json({
      profile: {
        id: profile.id,
        email: user.email ?? '',
        fullName: profile.full_name ?? '',
        role: profile.role ?? 'candidate',
        companyName: profile.company_name ?? '',
        firstName: profile.first_name ?? '',
        lastName: profile.last_name ?? '',
        pronoun: profile.pronoun ?? '',
        birthday: profile.birthday ?? '',
        age: profile.age ?? null,
        education: profile.education ?? '',
        workExperience: profile.work_experience ?? '',
        mainSkill: profile.main_skill ?? '',
        phone: profile.phone ?? '',
        location: profile.location ?? '',
        summary: profile.summary ?? '',
        linkedinUrl: profile.linkedin_url ?? '',
        githubUrl: profile.github_url ?? '',
        portfolioUrl: profile.portfolio_url ?? '',
        websiteUrl: profile.website_url ?? '',
        resumeFileName: profile.resume_file_name ?? '',
        resumeUploadedAt: profile.resume_uploaded_at ?? '',
        walletAddress: resolvedWalletForResponse(profile.wallet_address, user),
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unexpected profile fetch error' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = (await req.json().catch(() => ({}))) as Body;
    const admin = getSupabaseAdmin();
    const existing = await ensureProfile(admin, user.id);

    const applyMd = Boolean(body.applyUserMetadata);
    const md = (user.user_metadata ?? {}) as Record<string, unknown>;

    const roleFromMeta =
      applyMd && body.role === undefined
        ? String(md.role ?? '').trim() === 'recruiter'
          ? ('recruiter' as const)
          : String(md.role ?? '').trim() === 'candidate'
            ? ('candidate' as const)
            : undefined
        : undefined;
    const role = body.role ?? roleFromMeta ?? existing.role ?? 'candidate';

    const nextRow: ProfileRow = {
      id: user.id,
      full_name: mergeMetaField(body.fullName, existing.full_name, md.full_name, applyMd),
      role,
      company_name:
        role === 'recruiter'
          ? mergeMetaField(body.companyName, existing.company_name, md.company_name, applyMd)
          : null,
      first_name:
        body.firstName !== undefined ? normalizeFromAny(body.firstName) : normalizeFromAny(existing.first_name),
      last_name:
        body.lastName !== undefined ? normalizeFromAny(body.lastName) : normalizeFromAny(existing.last_name),
      pronoun:
        body.pronoun !== undefined ? normalizeFromAny(body.pronoun) : normalizeFromAny(existing.pronoun),
      birthday:
        body.birthday !== undefined ? normalizeFromAny(body.birthday) : normalizeFromAny(existing.birthday),
      age:
        body.age !== undefined
          ? body.age === null
            ? null
            : Number.isFinite(Number(body.age))
              ? Number(body.age)
              : existing.age
          : existing.age,
      education:
        body.education !== undefined ? normalizeFromAny(body.education) : normalizeFromAny(existing.education),
      work_experience:
        body.workExperience !== undefined
          ? normalizeFromAny(body.workExperience)
          : normalizeFromAny(existing.work_experience),
      main_skill:
        body.mainSkill !== undefined ? normalizeFromAny(body.mainSkill) : normalizeFromAny(existing.main_skill),
      phone: mergeMetaField(body.phone, existing.phone, md.phone, applyMd),
      location: mergeMetaField(body.location, existing.location, md.location, applyMd),
      summary: mergeMetaField(body.summary, existing.summary, md.summary, applyMd),
      linkedin_url:
        body.linkedinUrl !== undefined
          ? normalizeFromAny(body.linkedinUrl)
          : normalizeFromAny(existing.linkedin_url),
      github_url:
        body.githubUrl !== undefined ? normalizeFromAny(body.githubUrl) : normalizeFromAny(existing.github_url),
      portfolio_url:
        body.portfolioUrl !== undefined
          ? normalizeFromAny(body.portfolioUrl)
          : normalizeFromAny(existing.portfolio_url),
      website_url:
        body.websiteUrl !== undefined ? normalizeFromAny(body.websiteUrl) : normalizeFromAny(existing.website_url),
      resume_file_name: body.clearResume
        ? null
        : body.resumeFileName !== undefined
          ? normalizeFromAny(body.resumeFileName)
          : normalizeFromAny(existing.resume_file_name),
      resume_uploaded_at: body.clearResume
        ? null
        : body.resumeUploadedAt !== undefined
          ? normalizeFromAny(body.resumeUploadedAt)
          : normalizeFromAny(existing.resume_uploaded_at),
      wallet_address: mergeMetaField(
        body.walletAddress,
        existing.wallet_address,
        md.wallet_address ?? md.walletAddress,
        applyMd,
      ),
    };

    const withWallet = includeWalletInProfileDb();
    const upsertPayload = withWallet ? nextRow : stripWalletForLegacyUpsert(nextRow);
    const selectCols = withWallet ? PROFILE_SELECT_WITH_WALLET : PROFILE_SELECT_NO_WALLET;

    let { data: saved, error } = await admin
      .from('profiles')
      .upsert(upsertPayload, { onConflict: 'id' })
      .select(selectCols)
      .single();

    if (error && withWallet && isProfilesWalletColumnError(error.message)) {
      const retry = await admin
        .from('profiles')
        .upsert(stripWalletForLegacyUpsert(nextRow), { onConflict: 'id' })
        .select(PROFILE_SELECT_NO_WALLET)
        .single<Omit<ProfileRow, 'wallet_address'>>();
      error = retry.error;
      saved = retry.data ?? null;
    }

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!saved) return NextResponse.json({ error: 'Profile save returned no row' }, { status: 500 });

    const savedRow =
      !withWallet || !('wallet_address' in (saved as Record<string, unknown>))
        ? asProfileRow({ ...(saved as Omit<ProfileRow, 'wallet_address'>), wallet_address: null })
        : (saved as ProfileRow);

    await syncPublicUsersTable(admin, {
      id: user.id,
      email: user.email ?? `${user.id}@local.invalid`,
      fullName: savedRow.full_name ?? '',
      role: savedRow.role ?? 'candidate',
      companyName: savedRow.company_name ?? '',
      firstName: savedRow.first_name ?? '',
      lastName: savedRow.last_name ?? '',
      pronoun: savedRow.pronoun ?? '',
      birthday: savedRow.birthday ?? '',
      age: savedRow.age ?? null,
      education: savedRow.education ?? '',
      workExperience: savedRow.work_experience ?? '',
      mainSkill: savedRow.main_skill ?? '',
      phone: savedRow.phone ?? '',
      location: savedRow.location ?? '',
      summary: savedRow.summary ?? '',
      linkedinUrl: savedRow.linkedin_url ?? '',
      githubUrl: savedRow.github_url ?? '',
      portfolioUrl: savedRow.portfolio_url ?? '',
      websiteUrl: savedRow.website_url ?? '',
    });

    return NextResponse.json({
      ok: true,
      profile: {
        id: savedRow.id,
        email: user.email ?? '',
        fullName: savedRow.full_name ?? '',
        role: savedRow.role ?? 'candidate',
        companyName: savedRow.company_name ?? '',
        firstName: savedRow.first_name ?? '',
        lastName: savedRow.last_name ?? '',
        pronoun: savedRow.pronoun ?? '',
        birthday: savedRow.birthday ?? '',
        age: savedRow.age ?? null,
        education: savedRow.education ?? '',
        workExperience: savedRow.work_experience ?? '',
        mainSkill: savedRow.main_skill ?? '',
        phone: savedRow.phone ?? '',
        location: savedRow.location ?? '',
        summary: savedRow.summary ?? '',
        linkedinUrl: savedRow.linkedin_url ?? '',
        githubUrl: savedRow.github_url ?? '',
        portfolioUrl: savedRow.portfolio_url ?? '',
        websiteUrl: savedRow.website_url ?? '',
        resumeFileName: savedRow.resume_file_name ?? '',
        resumeUploadedAt: savedRow.resume_uploaded_at ?? '',
        walletAddress: resolvedWalletForResponse(savedRow.wallet_address, user),
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unexpected profile sync error' },
      { status: 500 },
    );
  }
}
