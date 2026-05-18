'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, User, Building2, Check } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { PENDING_WALLET_SESSION_KEY } from '@/lib/wallet/syncProfileWallet';
import WalletConnectButton from './WalletConnectButton';

interface SignUpFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'candidate' | 'recruiter';
  companyName?: string;
  agreeTerms: boolean;
}

interface ProfileFormData {
  phone: string;
  location: string;
  summary: string;
}

interface SignUpFormProps {
  onSwitch: () => void;
}

const PENDING_SIGNIN_KEY = 'trueassess_pending_signin';
const PENDING_SIGNIN_EVENT = 'trueassess-pending-signin';

export default function SignUpForm({ onSwitch }: SignUpFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);
  const [signupStep, setSignupStep] = useState<'account' | 'profile'>('account');
  const [pendingData, setPendingData] = useState<SignUpFormData | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignUpFormData>({
    defaultValues: { role: 'candidate' },
  });
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      phone: '',
      location: '',
      summary: '',
    },
  });

  const selectedRole = watch('role');
  const passwordValue = watch('password');

  const signInWithProvider = async (provider: 'google' | 'github') => {
    setOauthLoading(provider);
    try {
      const supabase = getSupabaseBrowser();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo:
            typeof window !== 'undefined'
              ? `${window.location.origin}/auth/callback?next=/dashboard`
              : undefined,
        },
      });
      if (error) {
        toast.error(`${provider === 'google' ? 'Google' : 'GitHub'} sign up failed`, {
          description: error.message,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected social sign up error.';
      toast.error('Social sign up failed', { description: message });
    } finally {
      setOauthLoading(null);
    }
  };

  const createAccount = async (data: SignUpFormData, profile?: ProfileFormData) => {
    setLoading(true);
    try {
      const supabase = getSupabaseBrowser();
      const email = data.email.trim().toLowerCase();
      const pendingWallet =
        typeof window !== 'undefined'
          ? sessionStorage.getItem(PENDING_WALLET_SESSION_KEY)?.trim()
          : undefined;
      const walletMeta =
        pendingWallet && /^0x[a-fA-F0-9]{40}$/.test(pendingWallet) ? pendingWallet : undefined;
      const { data: auth, error } = await supabase.auth.signUp({
        email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            role: data.role,
            company_name: data.role === 'recruiter' ? (data.companyName?.trim() ?? '') : undefined,
            phone: profile?.phone?.trim() ?? '',
            location: profile?.location?.trim() ?? '',
            summary: profile?.summary?.trim() ?? '',
            ...(walletMeta ? { wallet_address: walletMeta } : {}),
          },
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      });
      if (error) {
        toast.error('Sign up failed', { description: error.message });
        return;
      }
      if (walletMeta && typeof window !== 'undefined') {
        try {
          sessionStorage.removeItem(PENDING_WALLET_SESSION_KEY);
        } catch {
          /* ignore */
        }
      }
      if (typeof window !== 'undefined') {
        if (auth.session) {
          window.localStorage.removeItem(PENDING_SIGNIN_KEY);
        } else {
          window.localStorage.setItem(PENDING_SIGNIN_KEY, '1');
        }
        window.dispatchEvent(new Event(PENDING_SIGNIN_EVENT));
      }
      if (auth.session) {
        const syncRes = await fetch('/api/auth/profile-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: data.fullName,
            role: data.role,
            companyName: data.companyName ?? '',
            phone: profile?.phone?.trim() ?? '',
            location: profile?.location?.trim() ?? '',
            summary: profile?.summary?.trim() ?? '',
            ...(walletMeta ? { walletAddress: walletMeta } : {}),
            applyUserMetadata: true,
          }),
        }).catch(() => null);
        if (syncRes && !syncRes.ok) {
          const body = (await syncRes.json().catch(() => ({}))) as { error?: string };
          toast.error('Profile could not be saved', {
            description: body.error ?? `Server returned ${syncRes.status}. Open Profile later to complete details.`,
          });
        }
        toast.success('Account created', { description: 'Welcome to TrueAssess.' });
        router.push('/skill-test');
      } else {
        toast.success('Check your email', {
          description: 'Confirm the link we sent you to finish registration, then sign in here.',
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error while creating your account.';
      toast.error('Sign up failed', { description: message });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: SignUpFormData) => {
    setPendingData(data);
    setSignupStep('profile');
  };

  const onSubmitProfile = async (profileData: ProfileFormData) => {
    if (!pendingData) {
      toast.error('Missing account data', { description: 'Please fill account information first.' });
      setSignupStep('account');
      return;
    }
    await createAccount(pendingData, profileData);
  };

  const passwordStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = passwordStrength(passwordValue || '');
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-emerald-500'];
  const strengthTextColors = ['', 'text-red-500', 'text-amber-500', 'text-blue-500', 'text-emerald-600'];

  if (signupStep === 'profile' && pendingData) {
    return (
      <div className="animate-fade-in">
        <div className="mb-5">
          <h2 className="text-3xl font-bold text-slate-900">Complete your profile</h2>
          <p className="mt-1 text-base text-slate-600">Add personal information before creating your account.</p>
        </div>

        <div className="mb-4 rounded-xl border border-parchment-300/70 bg-parchment-100/75 p-3 text-sm text-slate-700">
          <p><span className="font-semibold">Name:</span> {pendingData.fullName}</p>
          <p><span className="font-semibold">Email:</span> {pendingData.email}</p>
          <p><span className="font-semibold">Role:</span> {pendingData.role === 'recruiter' ? 'Recruiter' : 'Candidate'}</p>
        </div>

        <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
          <div>
            <label htmlFor="profile-phone" className="block text-sm font-medium text-slate-700 mb-1.5">Phone number</label>
            <input
              id="profile-phone"
              type="tel"
              placeholder="+1 999 999 9999"
              className={`input-field ${profileErrors.phone ? 'border-red-400 ring-1 ring-red-400' : ''}`}
              {...registerProfile('phone', {
                required: 'Phone number is required',
                minLength: { value: 6, message: 'Enter a valid phone number' },
              })}
            />
            {profileErrors.phone ? <p className="text-xs text-red-500 mt-1.5">{profileErrors.phone.message}</p> : null}
          </div>

          <div>
            <label htmlFor="profile-location" className="block text-sm font-medium text-slate-700 mb-1.5">Location</label>
            <input
              id="profile-location"
              type="text"
              placeholder="Boston, MA, US"
              className={`input-field ${profileErrors.location ? 'border-red-400 ring-1 ring-red-400' : ''}`}
              {...registerProfile('location', {
                required: 'Location is required',
                minLength: { value: 2, message: 'Enter a valid location' },
              })}
            />
            {profileErrors.location ? <p className="text-xs text-red-500 mt-1.5">{profileErrors.location.message}</p> : null}
          </div>

          <div>
            <label htmlFor="profile-summary" className="block text-sm font-medium text-slate-700 mb-1.5">Short profile summary</label>
            <textarea
              id="profile-summary"
              rows={4}
              placeholder="Tell us about your background, strengths, and goals."
              className={`input-field resize-none ${profileErrors.summary ? 'border-red-400 ring-1 ring-red-400' : ''}`}
              {...registerProfile('summary', {
                required: 'Profile summary is required',
                minLength: { value: 20, message: 'Write at least 20 characters' },
              })}
            />
            {profileErrors.summary ? <p className="text-xs text-red-500 mt-1.5">{profileErrors.summary.message}</p> : null}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setSignupStep('account')}
              className="flex-1 rounded-xl border border-slate-300 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading || oauthLoading !== null}
              className="flex-1 rounded-xl bg-parchment-800 py-3 text-sm font-semibold text-white hover:bg-parchment-900 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-5">
        <h2 className="text-3xl font-bold text-slate-900">Create your account</h2>
        <p className="mt-1 text-base text-slate-600">Start earning verified on-chain credentials today</p>
      </div>

      {/* Social Auth */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          onClick={() => {
            void signInWithProvider('google');
          }}
          disabled={loading || oauthLoading !== null}
          className="btn-secondary justify-center gap-2 py-2.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" className="shrink-0">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {oauthLoading === 'google' ? 'Connecting...' : 'Google'}
        </button>
        <button
          type="button"
          onClick={() => {
            void signInWithProvider('github');
          }}
          disabled={loading || oauthLoading !== null}
          className="btn-secondary justify-center gap-2 py-2.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-slate-900 shrink-0">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
          </svg>
          {oauthLoading === 'github' ? 'Connecting...' : 'GitHub'}
        </button>
      </div>
      <WalletConnectButton className="mb-6" />

      <div className="relative flex items-center mb-6">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="mx-4 text-xs text-slate-400 font-medium">or sign up with email</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Role Selector */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">I am a</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'candidate', label: 'Candidate', desc: 'Job seeker / Learner', icon: <User size={18} /> },
              { value: 'recruiter', label: 'Recruiter', desc: 'Hiring for a company', icon: <Building2 size={18} /> },
            ].map((r) => (
              <button
                key={`role-${r.value}`}
                type="button"
                onClick={() => setValue('role', r.value as 'candidate' | 'recruiter')}
                className={`relative flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all duration-150 ${
                  selectedRole === r.value
                    ? 'border-[#4f46e5] bg-parchment-100'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                {selectedRole === r.value && (
                  <span className="absolute top-2 right-2 w-5 h-5 bg-[#4f46e5] rounded-full flex items-center justify-center">
                    <Check size={11} className="text-white" />
                  </span>
                )}
                <span className={selectedRole === r.value ? 'text-[#4f46e5]' : 'text-slate-500'}>
                  {r.icon}
                </span>
                <span className={`text-sm font-semibold ${selectedRole === r.value ? 'text-[#1e293b]' : 'text-slate-700'}`}>
                  {r.label}
                </span>
                <span className="text-xs text-slate-500">{r.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label htmlFor="signup-name" className="block text-sm font-medium text-slate-700 mb-1.5">
            Full name
          </label>
          <input
            id="signup-name"
            type="text"
            autoComplete="name"
            placeholder="Arjun Kumar"
            className={`input-field ${errors.fullName ? 'border-red-400 ring-1 ring-red-400' : ''}`}
            {...register('fullName', {
              required: 'Full name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' },
            })}
          />
          {errors.fullName && (
            <p className="text-xs text-red-500 mt-1.5">{errors.fullName.message}</p>
          )}
        </div>

        {/* Company Name (recruiter only) */}
        {selectedRole === 'recruiter' && (
          <div className="animate-fade-in">
            <label htmlFor="signup-company" className="block text-sm font-medium text-slate-700 mb-1.5">
              Company name
            </label>
            <p className="text-xs text-slate-400 mb-1.5">Your job postings will be listed under this company</p>
            <input
              id="signup-company"
              type="text"
              placeholder="Coinbase, Stripe, Polygon Labs..."
              className={`input-field ${errors.companyName ? 'border-red-400 ring-1 ring-red-400' : ''}`}
              {...register('companyName', {
                required: selectedRole === 'recruiter' ? 'Company name is required for recruiters' : false,
              })}
            />
            {errors.companyName && (
              <p className="text-xs text-red-500 mt-1.5">{errors.companyName.message}</p>
            )}
          </div>
        )}

        {/* Email */}
        <div>
          <label htmlFor="signup-email" className="block text-sm font-medium text-slate-700 mb-1.5">
            Email address
          </label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={`input-field ${errors.email ? 'border-red-400 ring-1 ring-red-400' : ''}`}
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
            })}
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1.5">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="signup-password" className="block text-sm font-medium text-slate-700 mb-1.5">
            Password
          </label>
          <p className="text-xs text-slate-400 mb-1.5">At least 8 characters with a number and symbol</p>
          <div className="relative">
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              className={`input-field pr-10 ${errors.password ? 'border-red-400 ring-1 ring-red-400' : ''}`}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
                pattern: {
                  value: /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/,
                  message: 'Must include uppercase, number, and symbol',
                },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 mt-1.5">{errors.password.message}</p>
          )}
          {/* Strength meter */}
          {passwordValue && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={`strength-bar-${i}`}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      i <= strength ? strengthColors[strength] : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
              <p className={`text-[11px] font-medium ${strengthTextColors[strength]}`}>
                {strengthLabels[strength]}
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="signup-confirm" className="block text-sm font-medium text-slate-700 mb-1.5">
            Confirm password
          </label>
          <div className="relative">
            <input
              id="signup-confirm"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              className={`input-field pr-10 ${errors.confirmPassword ? 'border-red-400 ring-1 ring-red-400' : ''}`}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (val) => val === passwordValue || 'Passwords do not match',
              })}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-500 mt-1.5">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Terms */}
        <div>
          <div className="flex items-start gap-2.5">
            <input
              id="agree-terms"
              type="checkbox"
              className="w-4 h-4 rounded border-slate-300 text-[#4f46e5] focus:ring-[#6366f1] mt-0.5"
              {...register('agreeTerms', { required: 'You must agree to the terms to continue' })}
            />
            <label htmlFor="agree-terms" className="text-sm text-slate-600 leading-relaxed">
              I agree to TrueAssess&apos;s{' '}
              <Link href="#" className="text-[#4f46e5] hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link href="#" className="text-[#4f46e5] hover:underline">Privacy Policy</Link>
            </label>
          </div>
          {errors.agreeTerms && (
            <p className="text-xs text-red-500 mt-1.5">{errors.agreeTerms.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || oauthLoading !== null}
          className="w-full py-3 bg-parchment-800 text-white font-semibold rounded-xl hover:bg-parchment-900 active:scale-[0.99] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating account...
            </>
          ) : (
            `Create ${selectedRole === 'recruiter' ? 'Recruiter' : 'Candidate'} Account`
          )}
        </button>
      </form>

      {/* Wallet Option */}
      <div className="mt-4">
        <p className="w-full text-center text-xs text-slate-500 py-1">
          Wallet sign-in can be expanded later; email registration saves your profile securely with TrueAssess.
        </p>
      </div>

      <p className="text-center text-sm text-slate-500 mt-6">
        Already have an account?{' '}
        <button onClick={onSwitch} className="text-[#4f46e5] font-semibold hover:text-[#1e293b]">
          Sign in
        </button>
      </p>

    </div>
  );
}