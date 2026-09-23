import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Loader2, KeyRound } from 'lucide-react';
import * as authApi from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { notify } from '../context/ToastContext';
import WarehouseScene from '../components/common/WarehouseScene';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const RegisterPage = () => {
  const { setSession } = useAuth();
  const navigate = useNavigate();

  const [checkingStatus, setCheckingStatus] = useState(true);
  const [hasAdmin, setHasAdmin] = useState(true);

  const [step, setStep] = useState('details'); // 'details' | 'otp'
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    authApi.getSetupStatus()
      .then((res) => setHasAdmin(res.data.hasAdmin))
      .catch(() => setHasAdmin(true))
      .finally(() => setCheckingStatus(false));
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const requestOtp = async (e) => {
    e.preventDefault();
    const errs = {};
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await authApi.requestSetupOtp(form);
      notify.success('Verification code sent to your email.');
      setStep('otp');
    } catch (err) {
      setErrors(err.errors || { form: err.message });
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const res = await authApi.verifySetupOtp({ email: form.email, otp });
      setSession(res.data);
      notify.success('Admin account created. Welcome to IntelliStock Pro!');
      navigate('/');
    } catch (err) {
      setErrors({ otp: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <Loader2 className="h-6 w-6 animate-spin text-ink-faint" />
      </div>
    );
  }

  return (
    <div className="grid min-h-screen bg-canvas lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-[#0B0F14] lg:block">
        <div className="card-grid-bg absolute inset-0 opacity-30" />
        <div className="absolute inset-0"><WarehouseScene /></div>
        <div className="relative z-10 flex h-full flex-col justify-end p-12">
          <h2 className="max-w-md font-display text-3xl font-semibold leading-tight text-white">
            {hasAdmin ? 'Every account starts with an invitation.' : 'Set up your workspace in minutes.'}
          </h2>
          <p className="mt-3 max-w-md text-sm text-white/60">
            {hasAdmin
              ? 'For security, new accounts are created by your workspace Admin from User Management.'
              : "You'll be the first Admin — verify your email and you're in."}
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mx-auto w-full max-w-sm">
          <div className="mb-10 flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink font-display text-sm font-bold text-canvas dark:bg-amber-500 dark:text-[#1a1206]">IS</div>
            <div>
              <p className="font-display text-sm font-semibold text-ink">IntelliStock</p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-ink-faint">Pro</p>
            </div>
          </div>

          {hasAdmin ? (
            <>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2 text-ink-faint">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Registration is disabled</h1>
              <p className="mt-2 text-sm text-ink-muted">
                This workspace already has an Administrator. New accounts can only be created by an Admin from
                <span className="font-medium text-ink"> User Management</span>. Please contact your administrator to request access.
              </p>
              <Link to="/login" className="mt-6 inline-block">
                <Button variant="accent">Back to login <ArrowRight className="h-4 w-4" /></Button>
              </Link>
            </>
          ) : step === 'details' ? (
            <>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Create Admin Account</h1>
              <p className="mt-1.5 text-sm text-ink-muted">You're setting up this workspace for the first time — this account will be the Administrator.</p>

              <form onSubmit={requestOtp} className="mt-8 space-y-4">
                <Input label="Full name" icon={User} placeholder="Priya Sharma" value={form.name} onChange={set('name')} error={errors.name} required />
                <Input label="Email address" type="email" icon={Mail} placeholder="you@company.com" value={form.email} onChange={set('email')} error={errors.email} required />
                <Input label="Password" type="password" icon={Lock} placeholder="At least 8 characters, with a number" value={form.password} onChange={set('password')} error={errors.password} required />
                <Input label="Confirm password" type="password" icon={Lock} placeholder="Re-enter your password" value={form.confirmPassword} onChange={set('confirmPassword')} error={errors.confirmPassword} required />

                {errors.form && <p className="rounded-lg bg-danger-100 px-3 py-2 text-xs text-danger">{errors.form}</p>}

                <Button type="submit" variant="accent" className="w-full" loading={loading}>
                  Send verification code <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                <KeyRound className="h-6 w-6" />
              </div>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Verify your email</h1>
              <p className="mt-1.5 text-sm text-ink-muted">Enter the 6-digit code we sent to <span className="font-medium text-ink">{form.email}</span>.</p>

              <form onSubmit={verifyOtp} className="mt-8 space-y-4">
                <Input label="Verification code" inputMode="numeric" maxLength={6} placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} error={errors.otp} className="text-center font-mono text-lg tracking-[0.5em]" required />
                <Button type="submit" variant="accent" className="w-full" loading={loading}>
                  Verify & Create Admin <ArrowRight className="h-4 w-4" />
                </Button>
                <button type="button" onClick={() => setStep('details')} className="w-full text-center text-xs font-medium text-ink-muted hover:text-ink">
                  ‹ Back to details
                </button>
              </form>
            </>
          )}

          {!hasAdmin && (
            <p className="mt-6 text-center text-sm text-ink-muted">
              Already have an account? <Link to="/login" className="font-medium text-ink hover:underline">Sign in</Link>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
