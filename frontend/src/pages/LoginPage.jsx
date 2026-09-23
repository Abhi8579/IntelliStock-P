import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, BarChart3, Boxes, ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { notify } from '../context/ToastContext';
import * as authApi from '../api/auth';
import WarehouseScene from '../components/common/WarehouseScene';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  // If nobody has completed first-run setup yet, there is no account to log
  // into - send the visitor straight to "Create Admin Account" instead.
  useEffect(() => {
    authApi.getSetupStatus()
      .then((res) => { if (!res.data.hasAdmin) navigate('/register', { replace: true }); })
      .catch(() => {})
      .finally(() => setCheckingSetup(false));
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      notify.success('Welcome back!');
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingSetup) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <Loader2 className="h-6 w-6 animate-spin text-ink-faint" />
      </div>
    );
  }

  return (
    <div className="grid min-h-screen bg-canvas lg:grid-cols-2">
      {/* Left: form */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mx-auto w-full max-w-sm">
          <div className="mb-10 flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink font-display text-sm font-bold text-canvas dark:bg-amber-500 dark:text-[#1a1206]">IS</div>
            <div>
              <p className="font-display text-sm font-semibold text-ink">IntelliStock</p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-ink-faint">Pro</p>
            </div>
          </div>

          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Welcome back</h1>
          <p className="mt-1.5 text-sm text-ink-muted">Sign in to your inventory intelligence workspace.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Input label="Email address" type="email" icon={Mail} placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <div className="relative">
              <Input
                label="Password" type={showPassword ? 'text' : 'password'} icon={Lock} placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)} required
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-[34px] text-ink-faint hover:text-ink-muted">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {error && <p className="rounded-lg bg-danger-100 px-3 py-2 text-xs text-danger">{error}</p>}

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-ink-muted">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-3.5 w-3.5 rounded border-border accent-amber-500" />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-xs font-medium text-ink-muted hover:text-ink">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="accent" className="w-full" loading={loading}>
              Sign in <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-ink-faint">
            New accounts are created by your workspace Administrator from User Management.
          </p>
        </motion.div>
      </div>

      {/* Right: 3D hero */}
      <div className="relative hidden overflow-hidden bg-[#0B0F14] lg:block">
        <div className="card-grid-bg absolute inset-0 opacity-30" />
        <div className="absolute inset-0">
          <WarehouseScene />
        </div>
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <div />
          <div className="max-w-md">
            <h2 className="font-display text-3xl font-semibold leading-tight text-white">
              Every unit accounted for, every decision backed by data.
            </h2>
            <p className="mt-3 text-sm text-white/60">
              Track stock, sales, and suppliers in one intelligent command center built for modern operations teams.
            </p>
            <div className="mt-8 flex gap-6">
              <div className="flex items-center gap-2 text-white/70">
                <Boxes className="h-4 w-4 text-amber-400" />
                <span className="text-xs">Real-time stock</span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <BarChart3 className="h-4 w-4 text-teal-400" />
                <span className="text-xs">Live analytics</span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <ShieldCheck className="h-4 w-4 text-amber-400" />
                <span className="text-xs">Role-based access</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
