import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, KeyRound, CheckCircle2 } from 'lucide-react';
import * as authApi from '../api/auth';
import { notify } from '../context/ToastContext';
import WarehouseScene from '../components/common/WarehouseScene';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('email'); // email -> otp -> reset -> done
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [passwords, setPasswords] = useState({ next: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const requestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      await authApi.requestPasswordResetOtp({ email });
      notify.info('If that email is registered, a verification code has been sent.');
      setStep('otp');
    } catch (err) {
      setErrors({ email: err.message });
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const res = await authApi.verifyPasswordResetOtp({ email, otp });
      setResetToken(res.data.resetToken);
      setStep('reset');
    } catch (err) {
      setErrors({ otp: err.message });
    } finally {
      setLoading(false);
    }
  };

  const submitNewPassword = async (e) => {
    e.preventDefault();
    const errs = {};
    if (passwords.next !== passwords.confirm) errs.confirm = 'Passwords do not match.';
    if (passwords.next.length < 8) errs.next = 'Password must be at least 8 characters.';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await authApi.resetPassword({ resetToken, newPassword: passwords.next, confirmPassword: passwords.confirm });
      setStep('done');
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-canvas lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-[#0B0F14] lg:block">
        <div className="card-grid-bg absolute inset-0 opacity-30" />
        <div className="absolute inset-0"><WarehouseScene /></div>
        <div className="relative z-10 flex h-full flex-col justify-end p-12">
          <h2 className="max-w-md font-display text-3xl font-semibold leading-tight text-white">Locked out happens to everyone.</h2>
          <p className="mt-3 max-w-md text-sm text-white/60">Verify your email and you'll be back in within a minute.</p>
        </div>
      </div>

      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mx-auto w-full max-w-sm">
          <div className="mb-10 flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink font-display text-sm font-bold text-canvas dark:bg-amber-500 dark:text-[#1a1206]">IS</div>
            <div><p className="font-display text-sm font-semibold text-ink">IntelliStock</p><p className="text-[10px] font-medium uppercase tracking-wider text-ink-faint">Pro</p></div>
          </div>

          {step === 'email' && (
            <>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Forgot password</h1>
              <p className="mt-1.5 text-sm text-ink-muted">Enter your registered email — we'll send a verification code.</p>
              <form onSubmit={requestOtp} className="mt-8 space-y-4">
                <Input label="Email address" type="email" icon={Mail} placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} required />
                <Button type="submit" variant="accent" className="w-full" loading={loading}>Send code <ArrowRight className="h-4 w-4" /></Button>
              </form>
            </>
          )}

          {step === 'otp' && (
            <>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"><KeyRound className="h-6 w-6" /></div>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Enter verification code</h1>
              <p className="mt-1.5 text-sm text-ink-muted">We sent a 6-digit code to <span className="font-medium text-ink">{email}</span> if that account exists.</p>
              <form onSubmit={verifyOtp} className="mt-8 space-y-4">
                <Input label="Verification code" inputMode="numeric" maxLength={6} placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} error={errors.otp} className="text-center font-mono text-lg tracking-[0.5em]" required />
                <Button type="submit" variant="accent" className="w-full" loading={loading}>Verify code <ArrowRight className="h-4 w-4" /></Button>
                <button type="button" onClick={() => setStep('email')} className="w-full text-center text-xs font-medium text-ink-muted hover:text-ink">‹ Try a different email</button>
              </form>
            </>
          )}

          {step === 'reset' && (
            <>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Set a new password</h1>
              <p className="mt-1.5 text-sm text-ink-muted">Choose a strong password you haven't used before.</p>
              <form onSubmit={submitNewPassword} className="mt-8 space-y-4">
                <Input label="New password" type="password" icon={Lock} placeholder="At least 8 characters, with a number" value={passwords.next} onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))} error={errors.next} required />
                <Input label="Confirm new password" type="password" icon={Lock} placeholder="Re-enter your new password" value={passwords.confirm} onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))} error={errors.confirm} required />
                {errors.form && <p className="rounded-lg bg-danger-100 px-3 py-2 text-xs text-danger">{errors.form}</p>}
                <Button type="submit" variant="accent" className="w-full" loading={loading}>Reset password</Button>
              </form>
            </>
          )}

          {step === 'done' && (
            <>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-success-100 text-success"><CheckCircle2 className="h-6 w-6" /></div>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Password reset</h1>
              <p className="mt-1.5 text-sm text-ink-muted">Your password has been changed successfully. Any other signed-in devices have been logged out for security.</p>
              <Button variant="accent" className="mt-6 w-full" onClick={() => navigate('/login')}>Back to login <ArrowRight className="h-4 w-4" /></Button>
            </>
          )}

          {step !== 'done' && (
            <p className="mt-6 text-center text-sm text-ink-muted">
              Remembered your password? <Link to="/login" className="font-medium text-ink hover:underline">Sign in</Link>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
