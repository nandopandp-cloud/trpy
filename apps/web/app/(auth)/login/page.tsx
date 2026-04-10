'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard';
  const errorParam = searchParams.get('error');

  const [mode, setMode] = useState<'oauth' | 'email'>('oauth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'apple' | 'email' | null>(null);
  const [error, setError] = useState(
    errorParam === 'CredentialsSignin'
      ? 'Email ou senha incorretos.'
      : errorParam
        ? 'Ocorreu um erro. Tente novamente.'
        : ''
  );

  async function handleCredentialsLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setIsLoading(true);
    setLoadingProvider('email');
    setError('');

    const result = await signIn('credentials', {
      email: email.toLowerCase().trim(),
      password,
      redirect: false,
      callbackUrl,
    });

    if (result?.error) {
      setError('Email ou senha incorretos.');
      setIsLoading(false);
      setLoadingProvider(null);
    } else if (result?.url) {
      router.push(result.url);
    }
  }

  async function handleOAuthLogin(provider: 'google' | 'apple') {
    setIsLoading(true);
    setLoadingProvider(provider);
    setError('');
    await signIn(provider, { callbackUrl });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.6 }}
      className="space-y-5"
    >
      {/* Heading */}
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          Bem-vindo de volta
        </h2>
        <p className="text-[13px] text-white/60">
          Entre para continuar planejando.
        </p>
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[13px] text-red-200 bg-red-500/15 border border-red-400/30 rounded-2xl px-4 py-2.5"
        >
          {error}
        </motion.div>
      )}

      {/* OAuth Buttons */}
      <div className="space-y-2.5">
        <OAuthButton
          provider="google"
          onClick={() => handleOAuthLogin('google')}
          loading={loadingProvider === 'google'}
          disabled={isLoading}
        />
        <OAuthButton
          provider="apple"
          onClick={() => handleOAuthLogin('apple')}
          loading={loadingProvider === 'apple'}
          disabled={isLoading}
        />
      </div>

      {/* Divider */}
      <div className="relative flex items-center gap-3 py-1">
        <div className="flex-1 h-px bg-white/15" />
        <span className="text-[11px] font-medium tracking-wider uppercase text-white/50">
          ou com email
        </span>
        <div className="flex-1 h-px bg-white/15" />
      </div>

      {/* Email Form */}
      <form onSubmit={handleCredentialsLogin} className="space-y-3">
        <GlassInput
          icon={Mail}
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="seu@email.com"
          autoComplete="email"
          required
        />
        <GlassInput
          icon={Lock}
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={setPassword}
          placeholder="Sua senha"
          autoComplete="current-password"
          required
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-white/50 hover:text-white/90 transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />

        <motion.button
          type="submit"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          disabled={isLoading || !email.trim() || !password.trim()}
          className="w-full h-12 bg-white text-zinc-900 rounded-2xl text-sm font-semibold hover:bg-white/95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group relative overflow-hidden shadow-lg shadow-black/30"
        >
          {loadingProvider === 'email' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Começar a jornada</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </motion.button>
      </form>

      {/* Sign up link */}
      <p className="text-center text-[13px] text-white/60 pt-1">
        Ainda não tem conta?{' '}
        <Link href="/signup" className="text-white font-semibold hover:underline underline-offset-4">
          Criar conta
        </Link>
      </p>
    </motion.div>
  );
}

// ─── Shared glass UI primitives ──────────────────────────────────────────────

function GlassInput({
  icon: Icon,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  rightSlot,
  minLength,
}: {
  icon: React.ComponentType<{ className?: string }>;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete?: string;
  required?: boolean;
  rightSlot?: React.ReactNode;
  minLength?: number;
}) {
  return (
    <div className="relative group">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 group-focus-within:text-white/80 transition-colors" />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        minLength={minLength}
        className="w-full h-12 pl-11 pr-11 rounded-2xl bg-white/[0.08] border border-white/15 text-[14px] text-white placeholder:text-white/40 focus:outline-none focus:bg-white/[0.12] focus:border-white/30 transition-all backdrop-blur-sm"
      />
      {rightSlot && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {rightSlot}
        </div>
      )}
    </div>
  );
}

function OAuthButton({
  provider,
  onClick,
  loading,
  disabled,
}: {
  provider: 'google' | 'apple';
  onClick: () => void;
  loading: boolean;
  disabled: boolean;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-3 h-12 px-4 rounded-2xl bg-white/[0.08] backdrop-blur-sm border border-white/15 text-[14px] font-medium text-white hover:bg-white/[0.14] hover:border-white/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : provider === 'google' ? (
        <>
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continuar com Google
        </>
      ) : (
        <>
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          Continuar com Apple
        </>
      )}
    </motion.button>
  );
}
