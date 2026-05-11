'use client';

import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';
import AuthBrandPanel from './AuthBrandPanel';

export default function AuthClient() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  return (
    <div className="min-h-screen flex bg-parchment-50">
      {/* Brand Panel */}
      <AuthBrandPanel />

      {/* Form Panel */}
      <div className="flex-1 lg:w-3/5 flex flex-col justify-center items-center p-8 bg-parchment-50 min-h-screen">
        <div className="w-full max-w-lg">
          {/* Tab Toggle */}
          <div className="mb-7 flex items-center gap-1 rounded-xl border border-parchment-300/70 bg-parchment-100 p-1">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
                mode === 'login' ? 'bg-parchment-50 text-parchment-950 shadow-sm' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
                mode === 'signup' ? 'bg-parchment-50 text-parchment-950 shadow-sm' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              Create Account
            </button>
          </div>

          {mode === 'login' ? (
            <LoginForm onSwitch={() => setMode('signup')} />
          ) : (
            <SignUpForm onSwitch={() => setMode('login')} />
          )}
        </div>
      </div>
    </div>
  );
}