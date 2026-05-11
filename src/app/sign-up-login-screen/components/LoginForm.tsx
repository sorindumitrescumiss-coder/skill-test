'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { flushPendingWalletToProfile } from '@/lib/wallet/syncProfileWallet';
import WalletConnectButton from './WalletConnectButton';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const mockCredentials = [
  { role: 'Candidate', email: 'arjun.kumar@skillmint.io', password: 'Skill#2026' },
  { role: 'Recruiter', email: 'priya.recruiter@techcorp.io', password: 'Recruit#2026' },
  { role: 'Admin', email: 'admin@skillmint.io', password: 'Admin#2026' },
];

const PENDING_SIGNIN_KEY = 'trueassess_pending_signin';
const PENDING_SIGNIN_EVENT = 'trueassess-pending-signin';

interface LoginFormProps {
  onSwitch: () => void;
}

export default function LoginForm({ onSwitch }: LoginFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    getValues,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: { rememberMe: false },
  });

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
        toast.error(`${provider === 'google' ? 'Google' : 'GitHub'} sign in failed`, {
          description: error.message,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected social sign in error.';
      toast.error('Social sign in failed', { description: message });
    } finally {
      setOauthLoading(null);
    }
  };

  const onForgotPassword = async () => {
    const email = getValues('email')?.trim().toLowerCase();
    if (!email) {
      setError('email', { message: 'Enter your email first, then click Forgot password.' });
      return;
    }
    try {
      const supabase = getSupabaseBrowser();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/sign-up-login-screen` : undefined,
      });
      if (error) {
        toast.error('Password reset failed', { description: error.message });
        return;
      }
      toast.success('Reset email sent', { description: 'Check your inbox for a password reset link.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected reset error.';
      toast.error('Password reset failed', { description: message });
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const supabase = getSupabaseBrowser();
      const email = data.email.trim().toLowerCase();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: data.password,
      });
      if (error) {
        const demo = mockCredentials.some(
          (c) => c.email === email && c.password === data.password,
        );
        const msg = demo
          ? 'Sign-in was rejected. Create the account under “Create Account” first, or confirm your email if registration required it.'
          : error.message;
        setError('email', { message: msg });
        if (msg.toLowerCase().includes('email not confirmed')) {
          toast.error('Email confirmation required', {
            description: 'Please confirm your email first, then try signing in again.',
          });
        }
        return;
      }
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(PENDING_SIGNIN_KEY);
        window.dispatchEvent(new Event(PENDING_SIGNIN_EVENT));
      }
      const flushed = await flushPendingWalletToProfile();
      if (flushed && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('trueassess-profile-wallet-updated'));
      }
      const syncRes = await fetch('/api/auth/profile-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applyUserMetadata: true }),
      });
      if (syncRes && !syncRes.ok) {
        const errBody = (await syncRes.json().catch(() => ({}))) as { error?: string };
        toast.error('Profile could not be synced', {
          description: errBody.error ?? `Server returned ${syncRes.status}. You can update Profile later.`,
        });
      }
      toast.success('Signed in', { description: 'Welcome back.' });
      router.push('/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error while signing in.';
      setError('email', { message });
      toast.error('Sign in failed', { description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-900">Welcome back</h2>
        <p className="mt-1.5 text-lg text-slate-600">Sign in to your TrueAssess account</p>
      </div>

      {/* Social Auth */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => {
            void signInWithProvider('google');
          }}
          disabled={loading || oauthLoading !== null}
          className="btn-secondary justify-center gap-2 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
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
          className="btn-secondary justify-center gap-2 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-slate-900 shrink-0">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
          </svg>
          {oauthLoading === 'github' ? 'Connecting...' : 'GitHub'}
        </button>
      </div>
      <WalletConnectButton className="mb-6" />

      <div className="relative mb-6 flex items-center">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="mx-4 text-sm font-medium text-slate-500">or continue with email</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-slate-700">
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={`input-field py-2.5 text-sm ${errors.email ? 'border-red-400 ring-1 ring-red-400' : ''}`}
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
            })}
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="login-password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <button
              type="button"
              onClick={() => {
                void onForgotPassword();
              }}
              className="text-xs font-medium text-[#6b5344] hover:text-[#5c4033]"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              className={`input-field py-2.5 pr-10 text-sm ${errors.password ? 'border-red-400 ring-1 ring-red-400' : ''}`}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2.5">
          <input
            id="remember-me"
            type="checkbox"
            className="w-4 h-4 rounded border-slate-300 text-[#6b5344] focus:ring-[#8b7355]"
            {...register('rememberMe')}
          />
          <label htmlFor="remember-me" className="text-sm text-slate-600">
            Remember me for 30 days
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || oauthLoading !== null}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-800 py-3 text-lg font-semibold text-white transition-all duration-150 hover:bg-stone-900 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Signing in...
            </>) : (
            'Sign In'
          )}
        </button>
      </form>

      <p className="mt-4 w-full text-center text-xs text-slate-500">
        Wallet sign-in can be expanded later; use the same email as your TrueAssess account when signing in with a wallet.
      </p>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{' '}
        <button onClick={onSwitch} className="text-[#6b5344] font-semibold hover:text-[#5c4033]">
          Create a free account
        </button>
      </p>

    </div>
  );
}