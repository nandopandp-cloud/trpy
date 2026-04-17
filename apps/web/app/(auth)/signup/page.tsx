'use client';

import { useState, useRef, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Loader2, Mail, Lock, User, Phone,
  Eye, EyeOff, ChevronDown, ShieldCheck, ArrowLeft, Globe,
} from 'lucide-react';
import { useLocale, t } from '@/lib/i18n';

// Country code mapping
const COUNTRY_CODES: Record<string, { code: string; flag: string; name: string }> = {
  BR: { code: '55', flag: '🇧🇷', name: 'Brasil' },
  US: { code: '1', flag: '🇺🇸', name: 'EUA' },
  MX: { code: '52', flag: '🇲🇽', name: 'México' },
  AR: { code: '54', flag: '🇦🇷', name: 'Argentina' },
  PT: { code: '351', flag: '🇵🇹', name: 'Portugal' },
  ES: { code: '34', flag: '🇪🇸', name: 'Espanha' },
  FR: { code: '33', flag: '🇫🇷', name: 'França' },
  DE: { code: '49', flag: '🇩🇪', name: 'Alemanha' },
  IT: { code: '39', flag: '🇮🇹', name: 'Itália' },
  GB: { code: '44', flag: '🇬🇧', name: 'Reino Unido' },
  AU: { code: '61', flag: '🇦🇺', name: 'Austrália' },
  JP: { code: '81', flag: '🇯🇵', name: 'Japão' },
  CN: { code: '86', flag: '🇨🇳', name: 'China' },
};

type Step = 'form' | 'verify';

const ERROR_MAP: Record<string, string> = {
  name_required: 'auth.error_name_required',
  email_required: 'auth.error_email_required',
  email_invalid: 'auth.error_email_invalid',
  password_min_length: 'auth.error_password_min',
  phone_required: 'auth.error_phone_required',
  phone_invalid: 'auth.error_phone_invalid',
  email_taken: 'auth.error_email_taken',
  internal_error: 'auth.error_internal',
  invalid_or_expired: 'auth.verify_invalid',
  invalid_code: 'auth.verify_invalid',
  max_attempts: 'auth.verify_max_attempts',
};

export default function SignupPage() {
  const router = useRouter();
  const [locale] = useLocale();

  const [step, setStep] = useState<Step>('form');
  const [emailExpanded, setEmailExpanded] = useState(false);
  const [countryCode, setCountryCode] = useState('BR');
  const [countryDropdown, setCountryDropdown] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Detect user location on mount
  useEffect(() => {
    const getCountry = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        if (data.country_code && COUNTRY_CODES[data.country_code]) {
          setCountryCode(data.country_code);
        }
      } catch {
        // Default to BR if detection fails
        setCountryCode('BR');
      }
    };
    getCountry();
  }, []);

  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'email' | 'verify' | 'resend' | null>(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const verificationCode = digits.join('');

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  function getErrorMessage(errorKey: string) {
    const translationKey = ERROR_MAP[errorKey];
    if (translationKey) return t(locale, translationKey as any);
    return t(locale, 'auth.error_internal' as any);
  }

  const formValid =
    name.trim().length >= 2 &&
    email.trim().length > 0 &&
    phone.trim().length >= 8 &&
    password.length >= 8;

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!formValid) return;
    setIsLoading(true);
    setLoadingProvider('email');
    setError('');
    try {
      const fullPhone = `+${COUNTRY_CODES[countryCode].code}${phone}`;
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          phone: fullPhone,
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(getErrorMessage(data.error)); return; }
      if (data.requiresVerification) {
        setDigits(['', '', '', '', '', '']);
        setStep('verify');
        setResendCooldown(60);
      }
    } catch {
      setError(t(locale, 'auth.error_connection' as any));
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (verificationCode.length !== 6) return;
    setIsLoading(true);
    setLoadingProvider('verify');
    setError('');
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), code: verificationCode }),
      });
      const data = await res.json();
      if (!res.ok) { setError(getErrorMessage(data.error)); return; }
      if (data.verified) {
        setSuccessMsg(t(locale, 'auth.verify_success' as any));
        const result = await signIn('credentials', {
          email: email.toLowerCase().trim(),
          password,
          redirect: false,
          callbackUrl: '/dashboard',
        });
        router.push(result?.url ?? '/dashboard');
      }
    } catch {
      setError(t(locale, 'auth.error_connection' as any));
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  }

  async function handleResendCode() {
    if (resendCooldown > 0) return;
    setLoadingProvider('resend');
    setError('');
    try {
      await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });
      setSuccessMsg(t(locale, 'auth.verify_resent' as any));
      setResendCooldown(60);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      setError(t(locale, 'auth.error_connection' as any));
    } finally {
      setLoadingProvider(null);
    }
  }

  async function handleOAuthLogin() {
    setIsLoading(true);
    setLoadingProvider('google');
    setError('');
    await signIn('google', { callbackUrl: '/dashboard' });
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="wait">

        {step === 'form' ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            <div className="hidden md:block space-y-1 mb-5">
              <h2 className="text-xl font-semibold text-white tracking-tight">
                {t(locale, 'auth.signup_title' as any)}
              </h2>
              <p className="text-[13px] text-white/60">
                {t(locale, 'auth.signup_desc' as any)}
              </p>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="text-[13px] text-red-200 bg-red-500/15 border border-red-400/30 rounded-2xl px-4 py-2.5">
                {error}
              </motion.div>
            )}

            <OAuthButton
              label={t(locale, 'auth.google' as any)}
              onClick={handleOAuthLogin}
              loading={loadingProvider === 'google'}
              disabled={isLoading}
            />

            <div className="md:hidden">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setEmailExpanded((v) => !v)}
                disabled={isLoading}
                className="w-full flex items-center justify-between h-12 px-4 rounded-2xl bg-white/[0.06] border border-white/12 text-[13px] text-white/65 hover:bg-white/[0.1] hover:text-white/80 transition-all"
              >
                <span>{t(locale, 'auth.signup_email' as any)}</span>
                <motion.span animate={{ rotate: emailExpanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
                  <ChevronDown className="w-4 h-4" />
                </motion.span>
              </motion.button>
              <AnimatePresence initial={false}>
                {emailExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <SignupForm
                      locale={locale} name={name} setName={setName} email={email} setEmail={setEmail}
                      phone={phone} setPhone={setPhone} password={password} setPassword={setPassword}
                      showPassword={showPassword} setShowPassword={setShowPassword}
                      isLoading={isLoading} loadingProvider={loadingProvider} formValid={formValid}
                      countryCode={countryCode} setCountryCode={setCountryCode}
                      onSubmit={handleSignup} className="pt-2"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="hidden md:block">
              <div className="relative flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-white/15" />
                <span className="text-[11px] font-medium tracking-wider uppercase text-white/50">
                  {t(locale, 'auth.or_email' as any)}
                </span>
                <div className="flex-1 h-px bg-white/15" />
              </div>
              <SignupForm
                locale={locale} name={name} setName={setName} email={email} setEmail={setEmail}
                phone={phone} setPhone={setPhone} password={password} setPassword={setPassword}
                showPassword={showPassword} setShowPassword={setShowPassword}
                isLoading={isLoading} loadingProvider={loadingProvider} formValid={formValid}
                countryCode={countryCode} setCountryCode={setCountryCode}
                onSubmit={handleSignup}
              />
            </div>

            <p className="text-center text-[13px] text-white/60 pt-1">
              {t(locale, 'auth.has_account' as any)}{' '}
              <Link href="/login" className="text-white font-semibold hover:underline underline-offset-4">
                {t(locale, 'auth.login' as any)}
              </Link>
            </p>
          </motion.div>

        ) : (

          <motion.div
            key="verify"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <button
              onClick={() => { setStep('form'); setError(''); setSuccessMsg(''); setDigits(['', '', '', '', '', '']); }}
              className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors mb-5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t(locale, 'common.back' as any)}</span>
            </button>

            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-7 h-7 text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold text-white tracking-tight mb-1">
                {t(locale, 'auth.verify_title' as any)}
              </h2>
              <p className="text-[13px] text-white/60">
                Enviamos um código de 6 dígitos para
              </p>
              <p className="text-[13px] font-semibold text-white/80 mt-0.5">
                {email}
              </p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div key="err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-[13px] text-red-200 bg-red-500/15 border border-red-400/30 rounded-2xl px-4 py-2.5 mb-3">
                  {error}
                </motion.div>
              )}
              {successMsg && (
                <motion.div key="ok" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-[13px] text-emerald-200 bg-emerald-500/15 border border-emerald-400/30 rounded-2xl px-4 py-2.5 mb-3">
                  {successMsg}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleVerify} className="space-y-4">
              <CodeInput digits={digits} setDigits={setDigits} />

              <motion.button
                type="submit"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading || verificationCode.length !== 6}
                className="w-full h-12 bg-white text-zinc-900 rounded-2xl text-sm font-semibold hover:bg-white/95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group shadow-lg shadow-black/30"
              >
                {loadingProvider === 'verify'
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <><span>{t(locale, 'auth.verify_button' as any)}</span><ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>
                }
              </motion.button>
            </form>

            <div className="text-center mt-4">
              <button
                onClick={handleResendCode}
                disabled={resendCooldown > 0 || loadingProvider === 'resend'}
                className="text-[13px] text-white/60 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loadingProvider === 'resend'
                  ? t(locale, 'auth.verify_resending' as any)
                  : resendCooldown > 0
                    ? `${t(locale, 'auth.verify_resend' as any)} (${resendCooldown}s)`
                    : t(locale, 'auth.verify_resend' as any)
                }
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Signup Form ─────────────────────────────────────────────────────────────

function SignupForm({
  locale, name, setName, email, setEmail, phone, setPhone,
  password, setPassword, showPassword, setShowPassword,
  isLoading, loadingProvider, formValid, countryCode, setCountryCode,
  onSubmit, className,
}: {
  locale: string;
  name: string; setName: (v: string) => void;
  email: string; setEmail: (v: string) => void;
  phone: string; setPhone: (v: string) => void;
  password: string; setPassword: (v: string) => void;
  showPassword: boolean; setShowPassword: (v: boolean) => void;
  isLoading: boolean; loadingProvider: string | null;
  formValid: boolean; countryCode: string; setCountryCode: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  className?: string;
}) {
  return (
    <form onSubmit={onSubmit} className={`space-y-2.5 ${className ?? ''}`}>
      <GlassInput icon={User} type="text" value={name} onChange={setName}
        placeholder={t(locale as any, 'auth.name_placeholder' as any)} autoComplete="name" required />
      <GlassInput icon={Mail} type="email" value={email} onChange={setEmail}
        placeholder={t(locale as any, 'auth.email_placeholder' as any)} autoComplete="email" required />
      <PhoneInput
        countryCode={countryCode} setCountryCode={setCountryCode}
        phone={phone} setPhone={setPhone}
      />
      <div className="space-y-1.5">
        <GlassInput
          icon={Lock} type={showPassword ? 'text' : 'password'} value={password} onChange={setPassword}
          placeholder={t(locale as any, 'auth.password_create' as any)} autoComplete="new-password" required minLength={8}
          rightSlot={
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="text-white/50 hover:text-white/90 transition-colors" tabIndex={-1}>
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />
        <p className="text-[11px] text-white/40 pl-2">{t(locale as any, 'auth.password_min' as any)}</p>
      </div>
      <motion.button type="submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
        disabled={isLoading || !formValid}
        className="w-full h-12 bg-white text-zinc-900 rounded-2xl text-sm font-semibold hover:bg-white/95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group shadow-lg shadow-black/30">
        {loadingProvider === 'email'
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <><span>{t(locale as any, 'auth.create_account' as any)}</span><ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>
        }
      </motion.button>
    </form>
  );
}

// ─── Code Input ─────────────────────────────────────────────────────────────

function CodeInput({ digits, setDigits }: { digits: string[]; setDigits: (d: string[]) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setTimeout(() => refs.current[0]?.focus(), 100);
  }, []);

  function handleChange(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      const next = [...digits];
      next[index] = '';
      setDigits(next);
      return;
    }
    if (raw.length > 1) {
      // paste via onChange (mobile)
      const next = ['', '', '', '', '', ''];
      for (let i = 0; i < raw.length && i < 6; i++) next[i] = raw[i];
      setDigits(next);
      refs.current[Math.min(raw.length, 5)]?.focus();
    } else {
      const next = [...digits];
      next[index] = raw;
      setDigits(next);
      if (index < 5) refs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const next = [...digits]; next[index] = ''; setDigits(next);
      } else if (index > 0) {
        const next = [...digits]; next[index - 1] = ''; setDigits(next);
        refs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      refs.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = ['', '', '', '', '', ''];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    refs.current[Math.min(pasted.length, 5)]?.focus();
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-center gap-2">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={digit}
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            style={{ width: '44px', height: '52px' }}
            className={[
              'rounded-xl border-2 text-center text-xl font-bold transition-all duration-150 outline-none',
              digit
                ? 'bg-indigo-500/20 border-indigo-400 text-white shadow-[0_0_0_3px_rgba(99,102,241,0.2)]'
                : 'bg-white/10 border-white/30 text-white hover:border-white/50 focus:bg-indigo-500/15 focus:border-indigo-400 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]',
            ].join(' ')}
          />
        ))}
      </div>
      <p className="text-center text-[11px] text-white/40">
        Digite ou cole o código de 6 dígitos
      </p>
    </div>
  );
}

// ─── Primitives ─────────────────────────────────────────────────────────────

function GlassInput({
  icon: Icon, type, value, onChange, placeholder, autoComplete, required, rightSlot, minLength,
}: {
  icon: React.ComponentType<{ className?: string }>;
  type: string; value: string; onChange: (v: string) => void;
  placeholder: string; autoComplete?: string; required?: boolean;
  rightSlot?: React.ReactNode; minLength?: number;
}) {
  return (
    <div className="relative group">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 group-focus-within:text-white/80 transition-colors" />
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} required={required} autoComplete={autoComplete} minLength={minLength}
        className="w-full h-12 pl-11 pr-11 rounded-2xl bg-white/[0.08] border border-white/15 text-[14px] text-white placeholder:text-white/40 focus:outline-none focus:bg-white/[0.12] focus:border-white/30 transition-all backdrop-blur-sm"
      />
      {rightSlot && <div className="absolute right-4 top-1/2 -translate-y-1/2">{rightSlot}</div>}
    </div>
  );
}

function PhoneInput({
  countryCode, setCountryCode, phone, setPhone,
}: {
  countryCode: string; setCountryCode: (v: string) => void;
  phone: string; setPhone: (v: string) => void;
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const currentCountry = COUNTRY_CODES[countryCode];

  // Split phone into area code and number
  const areaCode = phone.slice(0, 2);
  const number = phone.slice(2);

  const handleAreaCodeChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 2);
    setPhone(cleaned + number);
  };

  const handleNumberChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 8);
    setPhone(areaCode + cleaned);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        {/* Country selector */}
        <div className="relative">
          <motion.button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="h-12 px-3 rounded-2xl bg-white/[0.08] border border-white/15 hover:bg-white/[0.12] transition-all flex items-center gap-2 text-[13px] font-medium text-white"
          >
            <span className="text-lg">{currentCountry?.flag}</span>
            <span>+{currentCountry?.code}</span>
          </motion.button>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 z-50 w-64 bg-zinc-900 border border-white/15 rounded-2xl shadow-xl overflow-hidden backdrop-blur-xl"
              >
                <div className="max-h-64 overflow-y-auto">
                  {Object.entries(COUNTRY_CODES).map(([code, { flag, name, code: phoneCode }]) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => {
                        setCountryCode(code);
                        setShowDropdown(false);
                      }}
                      className={`w-full px-4 py-2.5 flex items-center gap-3 text-[13px] transition-colors ${
                        countryCode === code
                          ? 'bg-indigo-500/20 border-l-2 border-indigo-400 text-white'
                          : 'hover:bg-white/[0.08] text-white/80 hover:text-white border-l-2 border-transparent'
                      }`}
                    >
                      <span className="text-lg">{flag}</span>
                      <span className="flex-1 text-left">{name}</span>
                      <span className="text-white/50">+{phoneCode}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Area code input */}
        <div className="relative group w-20">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-white/50 font-medium">
            DDD
          </div>
          <input
            type="tel"
            value={areaCode}
            onChange={(e) => handleAreaCodeChange(e.target.value)}
            placeholder="11"
            maxLength={2}
            required
            inputMode="numeric"
            className="w-full h-12 pl-10 pr-3 rounded-2xl bg-white/[0.08] border border-white/15 text-[14px] text-white placeholder:text-white/40 focus:outline-none focus:bg-white/[0.12] focus:border-white/30 transition-all backdrop-blur-sm text-center"
          />
        </div>

        {/* Phone number input */}
        <div className="relative group flex-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 group-focus-within:text-white/80 transition-colors">
            <Phone className="w-4 h-4" />
          </div>
          <input
            type="tel"
            value={number}
            onChange={(e) => handleNumberChange(e.target.value)}
            placeholder="99999-9999"
            maxLength={8}
            required
            inputMode="numeric"
            className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white/[0.08] border border-white/15 text-[14px] text-white placeholder:text-white/40 focus:outline-none focus:bg-white/[0.12] focus:border-white/30 transition-all backdrop-blur-sm"
          />
        </div>
      </div>
      <p className="text-[11px] text-white/40 pl-2">
        Exemplo: DDD 11 + número 99999-9999 = +55 11 99999-9999
      </p>
    </div>
  );
}

function OAuthButton({ label, onClick, loading, disabled }: {
  label?: string; onClick: () => void; loading: boolean; disabled: boolean;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
      onClick={onClick} disabled={disabled}
      className="w-full flex items-center justify-center gap-3 h-12 px-4 rounded-2xl bg-white/[0.08] backdrop-blur-sm border border-white/15 text-[14px] font-medium text-white hover:bg-white/[0.14] hover:border-white/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
        <>
          <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          {label}
        </>
      )}
    </motion.button>
  );
}
