'use client';

import React from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Wallet,
  ChevronRight,
  FileText,
  Loader2,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Shield,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

type ProfileDTO = {
  id: string;
  email: string;
  fullName: string;
  role: 'candidate' | 'recruiter';
  companyName: string;
  firstName?: string;
  lastName?: string;
  pronoun?: string;
  birthday?: string;
  age?: number | null;
  education?: string;
  workExperience?: string;
  mainSkill?: string;
  phone: string;
  location: string;
  summary: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  websiteUrl?: string;
  resumeFileName: string;
  resumeUploadedAt: string;
  walletAddress?: string;
};

const MAIN_SKILL_SUGGESTIONS = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C',
  'C++',
  'C#',
  'Go',
  'Rust',
  'PHP',
  'Ruby',
  'Swift',
  'Kotlin',
  'Dart',
  'Scala',
  'R',
  'SQL',
  'React',
  'Next.js',
  'Node.js',
  'Angular',
  'Vue.js',
  'Svelte',
  'Express.js',
  'Django',
  'Flask',
  'FastAPI',
  '.NET',
  'Spring Boot',
  'Laravel',
  'Ruby on Rails',
  'Other',
];

function parseMainSkillValue(raw: string) {
  const text = String(raw ?? '').trim();
  if (!text) return { selected: [] as string[], otherText: '' };
  try {
    const parsed = JSON.parse(text) as { selected?: string[]; otherText?: string };
    if (Array.isArray(parsed.selected)) {
      const selected = parsed.selected.filter((v) => typeof v === 'string' && v.trim().length > 0);
      const otherText = String(parsed.otherText ?? '').trim();
      if (otherText && !selected.includes('Other')) selected.push('Other');
      return { selected, otherText };
    }
  } catch {
    // backward-compatible fallback
  }
  return { selected: text.split(',').map((v) => v.trim()).filter(Boolean), otherText: '' };
}

function buildMainSkillValue(selected: string[], otherText: string) {
  const selectedWithoutOther = selected.filter((s) => s !== 'Other');
  return JSON.stringify({
    selected: selectedWithoutOther.filter(Boolean),
    otherText: selected.includes('Other') ? otherText.trim() : '',
  });
}

function splitOtherSkillLines(otherText: string): string[] {
  return otherText.split('\n').map((s) => s.trim()).filter(Boolean);
}

type OtherThingsSkillInputProps = {
  formOtherThings: string;
  setFormOtherThings: React.Dispatch<React.SetStateAction<string>>;
  draft: string;
  setDraft: React.Dispatch<React.SetStateAction<string>>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  inputId: string;
};

/** Blank input opens when “Other” is selected; Enter commits each custom skill as a saved line. */
function OtherThingsSkillInput({
  formOtherThings,
  setFormOtherThings,
  draft,
  setDraft,
  inputRef,
  inputId,
}: OtherThingsSkillInputProps) {
  const lines = splitOtherSkillLines(formOtherThings);

  const removeLine = (index: number) => {
    const next = lines.filter((_, i) => i !== index);
    setFormOtherThings(next.join('\n'));
  };

  const commitDraft = () => {
    const t = draft.trim();
    if (!t) return;
    if (lines.some((l) => l.toLowerCase() === t.toLowerCase())) {
      setDraft('');
      return;
    }
    setFormOtherThings(lines.length > 0 ? `${lines.join('\n')}\n${t}` : t);
    setDraft('');
  };

  return (
    <div className="mt-3">
      <label className="mb-1 block text-sm font-semibold text-slate-800" htmlFor={inputId}>
        Other Things
      </label>
      {lines.length > 0 ? (
        <ul className="mb-2 flex flex-wrap gap-2">
          {lines.map((line, i) => (
            <li key={`${i}-${line}`}>
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1 text-sm text-slate-800">
                {line}
                <button
                  type="button"
                  className="rounded-full p-0.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  aria-label={`Remove ${line}`}
                  onClick={() => removeLine(i)}
                >
                  ×
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      <input
        id={inputId}
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commitDraft();
          }
        }}
        className="input-field h-11 w-full text-base"
        placeholder="Type a skill, then press Enter"
        autoComplete="off"
      />
      <p className="mt-1 text-xs text-slate-500">Press Enter to save each item. Click × to remove one.</p>
    </div>
  );
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

function formatResumeDate(iso: string | undefined): string {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function isContactThin(profile: ProfileDTO): boolean {
  return !profile.phone.trim() || !profile.location.trim();
}

export default function ProfilePageClient() {
  const [profile, setProfile] = React.useState<ProfileDTO | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [editOpen, setEditOpen] = React.useState(false);
  const [sheet, setSheet] = React.useState<'preferences' | 'visibility' | null>(null);
  const [cvMenuOpen, setCvMenuOpen] = React.useState(false);
  const cvMenuRef = React.useRef<HTMLDivElement>(null);

  const [formPhone, setFormPhone] = React.useState('');
  const [formLocation, setFormLocation] = React.useState('');
  const [formSummary, setFormSummary] = React.useState('');
  const [formLinkedinUrl, setFormLinkedinUrl] = React.useState('');
  const [formGithubUrl, setFormGithubUrl] = React.useState('');
  const [formPortfolioUrl, setFormPortfolioUrl] = React.useState('');
  const [formWebsiteUrl, setFormWebsiteUrl] = React.useState('');
  const [formWalletAddress, setFormWalletAddress] = React.useState('');
  const [formFirstName, setFormFirstName] = React.useState('');
  const [formLastName, setFormLastName] = React.useState('');
  const [formPronoun, setFormPronoun] = React.useState('');
  const [formBirthday, setFormBirthday] = React.useState('');
  const [formAge, setFormAge] = React.useState('');
  const [formEducation, setFormEducation] = React.useState('');
  const [formWorkExperience, setFormWorkExperience] = React.useState('');
  const [formMainSkills, setFormMainSkills] = React.useState<string[]>([]);
  const [formOtherThings, setFormOtherThings] = React.useState('');
  const [otherDraft, setOtherDraft] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const otherDraftInlineRef = React.useRef<HTMLInputElement>(null);
  const otherDraftModalRef = React.useRef<HTMLInputElement>(null);

  const toggleMainSkill = React.useCallback((skill: string) => {
    let selectedOther = false;
    let deselectedOther = false;
    setFormMainSkills((prev) => {
      const isActive = prev.includes(skill);
      if (isActive) {
        if (skill === 'Other') deselectedOther = true;
        return prev.filter((s) => s !== skill);
      }
      if (skill === 'Other') selectedOther = true;
      return [...prev, skill];
    });
    if (deselectedOther) {
      setFormOtherThings('');
      setOtherDraft('');
    }
    if (selectedOther) {
      setOtherDraft('');
      window.setTimeout(() => {
        if (editOpen) {
          otherDraftModalRef.current?.focus();
        } else {
          otherDraftInlineRef.current?.focus();
        }
      }, 0);
    }
  }, [editOpen]);

  const refreshProfile = React.useCallback(async () => {
    const res = await fetch('/api/auth/profile-sync', { method: 'GET' });
    const body = (await res.json().catch(() => ({}))) as {
      error?: string;
      profile?: ProfileDTO;
    };
    if (res.status === 401) {
      setProfile(null);
      setLoadError(null);
      return;
    }
    if (!res.ok || !body.profile) {
      throw new Error(body.error ?? 'Could not load profile');
    }
    setProfile(body.profile);
    setLoadError(null);
  }, []);

  React.useEffect(() => {
    void (async () => {
      try {
        await refreshProfile();
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : 'Could not load profile');
      }
      setLoading(false);
    })();
  }, [refreshProfile]);

  React.useEffect(() => {
    if (!cvMenuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (cvMenuRef.current && !cvMenuRef.current.contains(e.target as Node)) setCvMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [cvMenuOpen]);

  React.useEffect(() => {
    if (!profile) return;
    setFormFirstName(String(profile.firstName ?? ''));
    setFormLastName(String(profile.lastName ?? ''));
    setFormPronoun(String(profile.pronoun ?? ''));
    setFormBirthday(String(profile.birthday ?? ''));
    setFormAge(profile.age === null || profile.age === undefined ? '' : String(profile.age));
    setFormEducation(String(profile.education ?? ''));
    setFormWorkExperience(String(profile.workExperience ?? ''));
    {
      const parsedSkill = parseMainSkillValue(String(profile.mainSkill ?? ''));
      setFormMainSkills(parsedSkill.selected);
      setFormOtherThings(parsedSkill.otherText);
      setOtherDraft('');
    }
    setFormWalletAddress(String(profile.walletAddress ?? '').trim());
  }, [profile]);

  const openEdit = () => {
    setFormPhone(profile?.phone ?? '');
    setFormLocation(profile?.location ?? '');
    setFormSummary(profile?.summary ?? '');
    setFormLinkedinUrl(String(profile?.linkedinUrl ?? ''));
    setFormGithubUrl(String(profile?.githubUrl ?? ''));
    setFormPortfolioUrl(String(profile?.portfolioUrl ?? ''));
    setFormWebsiteUrl(String(profile?.websiteUrl ?? ''));
    setFormWalletAddress(String(profile?.walletAddress ?? '').trim());
    setFormFirstName(String(profile?.firstName ?? ''));
    setFormLastName(String(profile?.lastName ?? ''));
    setFormPronoun(String(profile?.pronoun ?? ''));
    setFormBirthday(String(profile?.birthday ?? ''));
    setFormAge(profile?.age === null || profile?.age === undefined ? '' : String(profile.age));
    setFormEducation(String(profile?.education ?? ''));
    setFormWorkExperience(String(profile?.workExperience ?? ''));
    {
      const parsedSkill = parseMainSkillValue(String(profile?.mainSkill ?? ''));
      setFormMainSkills(parsedSkill.selected);
      setFormOtherThings(parsedSkill.otherText);
      setOtherDraft('');
    }
    setEditOpen(true);
  };

  const saveContact = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/auth/profile-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formPhone.trim(),
          location: formLocation.trim(),
          summary: formSummary.trim(),
          linkedinUrl: formLinkedinUrl.trim(),
          githubUrl: formGithubUrl.trim(),
          portfolioUrl: formPortfolioUrl.trim(),
          websiteUrl: formWebsiteUrl.trim(),
          walletAddress: formWalletAddress.trim(),
          firstName: formFirstName.trim(),
          lastName: formLastName.trim(),
          pronoun: formPronoun.trim(),
          birthday: formBirthday.trim(),
          age: formAge.trim() ? Number(formAge.trim()) : null,
          education: formEducation.trim(),
          workExperience: formWorkExperience.trim(),
          mainSkill: buildMainSkillValue(formMainSkills, formOtherThings),
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(body.error ?? 'Save failed');
      await refreshProfile();
      toast.success('Profile updated');
      setEditOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const onResumePick = async (f: FileList | null) => {
    const file = f?.[0];
    if (!file) return;
    setSaving(true);
    try {
      const res = await fetch('/api/auth/profile-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeFileName: file.name,
          resumeUploadedAt: new Date().toISOString(),
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(body.error ?? 'Save failed');
      await refreshProfile();
      toast.success('Resume details saved');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save resume');
    } finally {
      setSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeResumeMeta = async () => {
    setCvMenuOpen(false);
    setSaving(true);
    try {
      const res = await fetch('/api/auth/profile-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearResume: true }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(body.error ?? 'Remove failed');
      await refreshProfile();
      toast.success('Resume removed from profile');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not remove');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center pb-12">
        <Loader2 className="size-8 animate-spin text-parchment-700" aria-hidden />
      </div>
    );
  }

  if (!profile && !loadError) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-parchment-300/80 bg-white p-8 text-center shadow-sm">
        <h1 className="font-sans text-2xl font-semibold text-slate-900">Sign in to view your profile</h1>
        <p className="mt-2 text-sm text-slate-600">Manage how you show up to recruiters and save preferences.</p>
        <Link
          href="/sign-up-login-screen"
          className="mt-6 inline-flex rounded-lg bg-parchment-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-parchment-950"
        >
          Sign in or join
        </Link>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-900 shadow-sm">
        <h1 className="font-sans text-2xl font-semibold">Could not load profile</h1>
        <p className="mt-2 text-sm">{loadError ?? 'Try refreshing this page.'}</p>
      </div>
    );
  }

  const fullName = String(profile.fullName ?? '').trim() || String(profile.email ?? '').split('@')[0] || 'Member';
  const role = profile.role;
  const email = String(profile.email ?? '');
  const phone = String(profile.phone ?? '').trim();
  const location = String(profile.location ?? '').trim();
  const resumeName = String(profile.resumeFileName ?? '').trim();
  const resumeAt = String(profile.resumeUploadedAt ?? '').trim();
  const company = String(profile.companyName ?? '').trim();
  const linkedinUrl = String(profile.linkedinUrl ?? '').trim();
  const githubUrl = String(profile.githubUrl ?? '').trim();
  const portfolioUrl = String(profile.portfolioUrl ?? '').trim();
  const websiteUrl = String(profile.websiteUrl ?? '').trim();
  const walletAddressSaved = String(profile.walletAddress ?? '').trim();
  const firstName = String(profile.firstName ?? '').trim();
  const lastName = String(profile.lastName ?? '').trim();
  const pronoun = String(profile.pronoun ?? '').trim();
  const birthday = String(profile.birthday ?? '').trim();
  const age = profile.age ?? null;
  const education = String(profile.education ?? '').trim();
  const workExperience = String(profile.workExperience ?? '').trim();
  const thin = isContactThin(profile);

  return (
    <div className="mx-auto w-full max-w-4xl pb-16">
      <header className="mb-6 flex items-start justify-between gap-4 border-b border-slate-200/90 pb-8">
        <div className="min-w-0 flex-1">
          <h1 className="font-sans text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{fullName}</h1>
          <p className="mt-1 text-sm text-slate-500">{role === 'recruiter' ? 'Recruiter' : 'Candidate'}</p>
        </div>
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-700 text-lg font-semibold text-white shadow-inner sm:h-[72px] sm:w-[72px] sm:text-xl"
          aria-hidden
        >
          {initialsFromName(fullName)}
        </div>
      </header>

      <div className="space-y-5 px-2 text-sm text-slate-800 sm:px-4">
        <div className="flex items-start gap-3">
          <Mail className="mt-0.5 size-[18px] shrink-0 text-slate-500" aria-hidden />
          <span className="break-all">{email}</span>
        </div>

        {walletAddressSaved ? (
          <div className="flex items-start gap-3">
            <Wallet className="mt-0.5 size-[18px] shrink-0 text-slate-500" aria-hidden />
            <span className="break-all font-mono text-xs text-slate-700 sm:text-sm">{walletAddressSaved}</span>
          </div>
        ) : null}

        <button
          type="button"
          onClick={openEdit}
          className="flex w-full items-start gap-3 rounded-lg text-left transition hover:bg-slate-50/80"
        >
          <Phone className="mt-0.5 size-[18px] shrink-0 text-slate-500" aria-hidden />
          <span className="min-w-0 flex-1">{phone || 'Add phone number'}</span>
          <ChevronRight className="mt-0.5 size-5 shrink-0 text-slate-400" aria-hidden />
        </button>

        <button
          type="button"
          onClick={openEdit}
          className="flex w-full items-start gap-3 rounded-lg text-left transition hover:bg-slate-50/80"
        >
          <MapPin className="mt-0.5 size-[18px] shrink-0 text-slate-500" aria-hidden />
          <span className="min-w-0 flex-1">{location || 'Add location'}</span>
          <ChevronRight className="mt-0.5 size-5 shrink-0 text-slate-400" aria-hidden />
        </button>

        {role === 'recruiter' && company ? (
          <div className="flex items-start gap-3 border-t border-slate-100 pt-4">
            <Sparkles className="mt-0.5 size-[18px] shrink-0 text-slate-500" aria-hidden />
            <span>{company}</span>
          </div>
        ) : null}
        <div className="space-y-4 border-t border-slate-100 pt-5 text-sm text-slate-700">
          <h2 className="font-sans text-3xl font-semibold tracking-tight text-slate-900">General</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block font-semibold text-slate-800">First Name <span className="text-rose-500">*</span></label>
              <input className="input-field h-11 w-full rounded-full px-4 text-base" value={formFirstName} onChange={(e) => setFormFirstName(e.target.value)} placeholder="emma" />
            </div>
            <div>
              <label className="mb-1.5 block font-semibold text-slate-800">Last Name <span className="text-rose-500">*</span></label>
              <input className="input-field h-11 w-full rounded-full px-4 text-base" value={formLastName} onChange={(e) => setFormLastName(e.target.value)} placeholder="smith" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block font-semibold text-slate-800">Contact number <span className="font-normal text-slate-500">(optional)</span></label>
            <input className="input-field h-11 w-full rounded-full px-4 text-base" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="+1 509 816 7650" />
          </div>
          <div className="flex items-center gap-3">
            <label className="w-28 shrink-0 font-semibold text-slate-800">Pronoun</label>
            <input className="input-field h-10 w-full text-base" value={formPronoun} onChange={(e) => setFormPronoun(e.target.value)} />
          </div>
          <div className="flex items-center gap-3">
            <label className="w-28 shrink-0 font-semibold text-slate-800">Birthday</label>
            <input type="date" className="input-field h-10 w-full text-base" value={formBirthday} onChange={(e) => setFormBirthday(e.target.value)} />
          </div>
          <div className="flex items-center gap-3">
            <label className="w-28 shrink-0 font-semibold text-slate-800">Age</label>
            <input type="number" min={0} max={120} className="input-field h-10 w-full text-base" value={formAge} onChange={(e) => setFormAge(e.target.value)} />
          </div>
          <div className="flex items-start gap-3">
            <label className="w-28 shrink-0 pt-2 font-semibold text-slate-800">Main skill</label>
            <div className="w-full rounded-lg border border-slate-200 p-3">
              <div className="flex flex-wrap gap-2">
                {MAIN_SKILL_SUGGESTIONS.map((skill) => {
                  const active = formMainSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleMainSkill(skill)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition ${
                        active
                          ? 'border-parchment-900 bg-parchment-900 text-white'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
              {formMainSkills.includes('Other') ? (
                <OtherThingsSkillInput
                  formOtherThings={formOtherThings}
                  setFormOtherThings={setFormOtherThings}
                  draft={otherDraft}
                  setDraft={setOtherDraft}
                  inputRef={otherDraftInlineRef}
                  inputId="pf-main-skill-other-inline"
                />
              ) : null}
              <p className="mt-2 text-xs text-slate-500">Click skills to toggle selection.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <label className="w-28 shrink-0 pt-2 font-semibold text-slate-800">Education</label>
            <textarea rows={2} className="input-field w-full resize-y text-base" value={formEducation} onChange={(e) => setFormEducation(e.target.value)} />
          </div>
          <div className="flex items-start gap-3">
            <label className="w-28 shrink-0 pt-2 font-semibold text-slate-800">Work exp.</label>
            <textarea rows={2} className="input-field w-full resize-y text-base" value={formWorkExperience} onChange={(e) => setFormWorkExperience(e.target.value)} />
          </div>
        </div>
        <div className="mt-6 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-700">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-800" htmlFor="ln-url">LinkedIn URL</label>
            <input
              id="ln-url"
              type="url"
              value={formLinkedinUrl}
              onChange={(e) => setFormLinkedinUrl(e.target.value)}
              className="input-field h-10 w-full text-base"
              placeholder="https://www.linkedin.com/in/your-profile"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-800" htmlFor="gh-url">GitHub URL</label>
            <input
              id="gh-url"
              type="url"
              value={formGithubUrl}
              onChange={(e) => setFormGithubUrl(e.target.value)}
              className="input-field h-10 w-full text-base"
              placeholder="https://github.com/your-username"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-800" htmlFor="pf-url">Portfolio URL</label>
            <input
              id="pf-url"
              type="url"
              value={formPortfolioUrl}
              onChange={(e) => setFormPortfolioUrl(e.target.value)}
              className="input-field h-10 w-full text-base"
              placeholder="https://your-portfolio.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-800" htmlFor="site-url">Site URL</label>
            <input
              id="site-url"
              type="url"
              value={formWebsiteUrl}
              onChange={(e) => setFormWebsiteUrl(e.target.value)}
              className="input-field h-10 w-full text-base"
              placeholder="https://your-site.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-800" htmlFor="nft-wallet">
              Wallet address (credential NFT){' '}
              <span className="font-normal text-slate-500">optional</span>
            </label>
            <input
              id="nft-wallet"
              type="text"
              value={formWalletAddress}
              onChange={(e) => setFormWalletAddress(e.target.value)}
              className="input-field h-10 w-full font-mono text-sm"
              placeholder="0x..."
              spellCheck={false}
              autoComplete="off"
            />
            <p className="mt-1 text-xs text-slate-500">
              If server minting is enabled, passing scores can send NFTs here. Use the same wallet you verify on-chain.
            </p>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => void saveContact()}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-parchment-900 px-6 py-3 text-base font-semibold text-white hover:bg-parchment-950 disabled:opacity-50"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              Save Change
            </button>
          </div>
        </div>
      </div>

      {thin ? (
        <div
          className="mt-8 flex gap-3 rounded-lg border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm text-rose-950"
          role="status"
        >
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-rose-600" aria-hidden />
          <div>
            <p className="font-semibold">Finish your contact details</p>
            <p className="mt-1 text-rose-900/90">
              Add a phone number and location so recruiters and TrueAssess can reach you and improve job matches.
            </p>
            <button
              type="button"
              onClick={openEdit}
              className="mt-2 text-sm font-semibold text-rose-800 underline-offset-2 hover:underline"
            >
              Update now
            </button>
          </div>
        </div>
      ) : null}

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Resume</h2>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf"
          className="sr-only"
          onChange={(e) => void onResumePick(e.target.files)}
        />

        {resumeName ? (
          <div className="relative mt-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
                <FileText className="size-5 text-slate-600" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-900">{resumeName}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Added {resumeAt ? formatResumeDate(resumeAt) : 'recently'}
                </p>
              </div>
              <div className="relative shrink-0" ref={cvMenuRef}>
                <button
                  type="button"
                  onClick={() => setCvMenuOpen((o) => !o)}
                  className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100"
                  aria-expanded={cvMenuOpen}
                  aria-label="Resume actions"
                >
                  <MoreHorizontal className="size-5" />
                </button>
                {cvMenuOpen ? (
                  <div className="absolute right-0 top-full z-20 mt-1 min-w-[10rem] rounded-md border border-slate-200 bg-white py-1 shadow-lg">
                    <button
                      type="button"
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                      onClick={() => {
                        setCvMenuOpen(false);
                        fileInputRef.current?.click();
                      }}
                    >
                      Replace file…
                    </button>
                    <button
                      type="button"
                      className="block w-full px-3 py-2 text-left text-sm text-rose-700 hover:bg-rose-50"
                      onClick={() => void removeResumeMeta()}
                    >
                      Remove from profile
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={saving}
            onClick={() => fileInputRef.current?.click()}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white px-4 py-8 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 disabled:opacity-60"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <FileText className="size-5 text-slate-500" />}
            Upload resume (PDF or Word)
          </button>
        )}
      </section>

      {editOpen ? (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/35 p-4 backdrop-blur-[2px] sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-edit-title"
          onClick={() => !saving && setEditOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="profile-edit-title" className="font-sans text-xl font-semibold text-slate-900">
              Contact & bio
            </h2>
            <p className="mt-1 text-sm text-slate-600">Used on your profile and for recruiter outreach.</p>

            <label className="mt-6 block text-sm font-medium text-slate-700" htmlFor="pf-phone">
              Phone
            </label>
            <input
              id="pf-phone"
              type="tel"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              className="input-field mt-1.5 w-full"
              placeholder="+1 555 123 4567"
              autoComplete="tel"
            />

            <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="pf-location">
              Location
            </label>
            <input
              id="pf-location"
              type="text"
              value={formLocation}
              onChange={(e) => setFormLocation(e.target.value)}
              className="input-field mt-1.5 w-full"
              placeholder="City, region or country"
              autoComplete="address-level2"
            />

            <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="pf-summary">
              Short summary
            </label>
            <textarea
              id="pf-summary"
              value={formSummary}
              onChange={(e) => setFormSummary(e.target.value)}
              rows={4}
              className="input-field mt-1.5 w-full resize-y"
              placeholder="Headline or bio visible on your profile."
            />

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="pf-first-name">First name</label>
                <input id="pf-first-name" type="text" value={formFirstName} onChange={(e) => setFormFirstName(e.target.value)} className="input-field mt-1.5 w-full" placeholder="Rose" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="pf-last-name">Last name</label>
                <input id="pf-last-name" type="text" value={formLastName} onChange={(e) => setFormLastName(e.target.value)} className="input-field mt-1.5 w-full" placeholder="Potter" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="pf-pronoun">Pronoun</label>
                <input id="pf-pronoun" type="text" value={formPronoun} onChange={(e) => setFormPronoun(e.target.value)} className="input-field mt-1.5 w-full" placeholder="She / Her" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="pf-birthday">Birthday</label>
                <input id="pf-birthday" type="date" value={formBirthday} onChange={(e) => setFormBirthday(e.target.value)} className="input-field mt-1.5 w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="pf-age">Age</label>
                <input id="pf-age" type="number" min={0} max={120} value={formAge} onChange={(e) => setFormAge(e.target.value)} className="input-field mt-1.5 w-full" placeholder="24" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Main skills</label>
                <div className="mt-1.5 rounded-lg border border-slate-200 p-3">
                  <div className="flex flex-wrap gap-2">
                    {MAIN_SKILL_SUGGESTIONS.map((skill) => {
                      const active = formMainSkills.includes(skill);
                      return (
                        <button
                          key={`modal-skill-${skill}`}
                          type="button"
                          onClick={() => toggleMainSkill(skill)}
                          className={`rounded-full border px-3 py-1.5 text-sm transition ${
                            active
                              ? 'border-parchment-900 bg-parchment-900 text-white'
                              : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                          }`}
                        >
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                  {formMainSkills.includes('Other') ? (
                    <OtherThingsSkillInput
                      formOtherThings={formOtherThings}
                      setFormOtherThings={setFormOtherThings}
                      draft={otherDraft}
                      setDraft={setOtherDraft}
                      inputRef={otherDraftModalRef}
                      inputId="pf-main-skill-other-modal"
                    />
                  ) : null}
                  <p className="mt-2 text-xs text-slate-500">Click skills to toggle selection.</p>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700" htmlFor="pf-education">Education</label>
                <textarea id="pf-education" value={formEducation} onChange={(e) => setFormEducation(e.target.value)} rows={3} className="input-field mt-1.5 w-full resize-y" placeholder="BSc Computer Science, University ..." />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700" htmlFor="pf-work-exp">Work experience</label>
                <textarea id="pf-work-exp" value={formWorkExperience} onChange={(e) => setFormWorkExperience(e.target.value)} rows={3} className="input-field mt-1.5 w-full resize-y" placeholder="3+ years frontend development ..." />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => setEditOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void saveContact()}
                className="inline-flex items-center gap-2 rounded-lg bg-parchment-900 px-4 py-2 text-sm font-semibold text-white hover:bg-parchment-950 disabled:opacity-50"
              >
                {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {sheet ? (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/35 p-4 backdrop-blur-[2px] sm:items-center"
          role="dialog"
          aria-modal="true"
          onClick={() => setSheet(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-sans text-xl font-semibold text-slate-900">
              {sheet === 'preferences' ? 'Job preferences' : 'Visibility & data'}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {sheet === 'preferences'
                ? 'You’ll soon set salary range, remote vs on-site, and hours here so TrueAssess can tune job matches.'
                : 'Controls for profile visibility, hiding certain roles, and data exports will live here.'}
            </p>
            <button
              type="button"
              onClick={() => setSheet(null)}
              className="mt-6 w-full rounded-lg bg-parchment-900 py-2.5 text-sm font-semibold text-white hover:bg-parchment-950"
            >
              Got it
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
