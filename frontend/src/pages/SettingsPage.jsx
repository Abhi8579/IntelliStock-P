import { useEffect, useState } from 'react';
import { User, Palette, Bell, ShieldCheck, Database, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { notify } from '../context/ToastContext';
import * as settingsApi from '../api/settings';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { initials } from '../utils/format';
import { cn } from '../utils/cn';

const SECTIONS = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'appearance', label: 'Appearance', icon: Palette },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'security', label: 'Security', icon: ShieldCheck },
  { key: 'system', label: 'System', icon: Database },
];

const SettingsPage = () => {
  const { user, updateLocalUser, setSession } = useAuth();
  const { theme, setTheme } = useTheme();
  const [section, setSection] = useState('profile');
  const [name, setName] = useState(user?.name || '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [savingPassword, setSavingPassword] = useState(false);

  const [notifSettings, setNotifSettings] = useState({ lowStockAlerts: true, salesAlerts: true, purchaseAlerts: true });
  const [savingNotif, setSavingNotif] = useState(false);

  useEffect(() => {
    settingsApi.getSettings().then((res) => setNotifSettings({
      lowStockAlerts: res.data.lowStockAlerts, salesAlerts: res.data.salesAlerts, purchaseAlerts: res.data.purchaseAlerts,
    })).catch(() => {});
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await settingsApi.updateProfile({ name });
      updateLocalUser({ name });
      notify.success('Profile updated successfully.');
    } catch (err) { notify.error(err.message); } finally { setSavingProfile(false); }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (passwords.next !== passwords.confirm) { notify.error('New passwords do not match.'); return; }
    setSavingPassword(true);
    try {
      const res = await settingsApi.changePassword({ currentPassword: passwords.current, newPassword: passwords.next });
      setSession(res.data); // password change issues a new token; keep the session valid
      notify.success('Password changed successfully.');
      setPasswords({ current: '', next: '', confirm: '' });
    } catch (err) { notify.error(err.message); } finally { setSavingPassword(false); }
  };

  const saveNotifications = async () => {
    setSavingNotif(true);
    try {
      await settingsApi.updateSettings(notifSettings);
      notify.success('Notification preferences saved.');
    } catch (err) { notify.error(err.message); } finally { setSavingNotif(false); }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink">Settings</h1>
        <p className="text-sm text-ink-muted">Manage your profile, preferences, and workspace configuration.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        <div className="flex gap-1 overflow-x-auto rounded-2xl border border-border bg-surface p-1.5 shadow-soft lg:flex-col lg:overflow-visible">
          {SECTIONS.map((s) => (
            <button key={s.key} onClick={() => setSection(s.key)} className={cn('flex shrink-0 items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors', section === s.key ? 'bg-ink text-canvas dark:bg-amber-500 dark:text-[#1a1206]' : 'text-ink-muted hover:bg-surface-2 hover:text-ink')}>
              <s.icon className="h-4 w-4" /> {s.label}
            </button>
          ))}
        </div>

        <Card className="p-6">
          {section === 'profile' && (
            <form onSubmit={saveProfile} className="max-w-md space-y-4">
              <h3 className="font-display text-sm font-semibold text-ink">Profile</h3>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-500/15 text-lg font-semibold text-teal-700 dark:text-teal-300">{initials(user?.name)}</div>
                <div><p className="text-sm font-medium text-ink">{user?.name}</p><p className="text-xs text-ink-faint capitalize">{user?.role?.toLowerCase()}</p></div>
              </div>
              <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="Email address" value={user?.email} disabled hint="Email cannot be changed." />
              <Button type="submit" variant="accent" loading={savingProfile}>Save changes</Button>
            </form>
          )}

          {section === 'appearance' && (
            <div className="max-w-md space-y-4">
              <h3 className="font-display text-sm font-semibold text-ink">Appearance</h3>
              <p className="text-sm text-ink-muted">Choose how IntelliStock Pro looks on your device.</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setTheme('light')} className={cn('flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors', theme === 'light' ? 'border-amber-500' : 'border-border')}>
                  <Sun className="h-5 w-5 text-amber-500" /><span className="text-sm font-medium text-ink">Light</span>
                </button>
                <button onClick={() => setTheme('dark')} className={cn('flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors', theme === 'dark' ? 'border-amber-500' : 'border-border')}>
                  <Moon className="h-5 w-5 text-teal-500" /><span className="text-sm font-medium text-ink">Dark</span>
                </button>
              </div>
            </div>
          )}

          {section === 'notifications' && (
            <div className="max-w-md space-y-4">
              <h3 className="font-display text-sm font-semibold text-ink">Notification preferences</h3>
              {[
                { key: 'lowStockAlerts', label: 'Low stock alerts', desc: 'Get notified when products fall below minimum stock.' },
                { key: 'salesAlerts', label: 'Sales alerts', desc: 'Get notified for new and large sales.' },
                { key: 'purchaseAlerts', label: 'Purchase alerts', desc: 'Get notified when purchase orders are received.' },
              ].map((item) => (
                <label key={item.key} className="flex items-center justify-between rounded-xl border border-border p-3.5">
                  <div><p className="text-sm font-medium text-ink">{item.label}</p><p className="text-xs text-ink-faint">{item.desc}</p></div>
                  <input type="checkbox" checked={notifSettings[item.key]} onChange={(e) => setNotifSettings((s) => ({ ...s, [item.key]: e.target.checked }))} className="h-4 w-4 accent-amber-500" />
                </label>
              ))}
              <Button variant="accent" onClick={saveNotifications} loading={savingNotif}>Save preferences</Button>
            </div>
          )}

          {section === 'security' && (
            <form onSubmit={savePassword} className="max-w-md space-y-4">
              <h3 className="font-display text-sm font-semibold text-ink">Change password</h3>
              <Input label="Current password" type="password" value={passwords.current} onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))} required />
              <Input label="New password" type="password" value={passwords.next} onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))} required />
              <Input label="Confirm new password" type="password" value={passwords.confirm} onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))} required />
              <Button type="submit" variant="accent" loading={savingPassword}>Update password</Button>
            </form>
          )}

          {section === 'system' && (
            <div className="max-w-md space-y-4">
              <h3 className="font-display text-sm font-semibold text-ink">System information</h3>
              <div className="space-y-3 rounded-xl border border-border p-4 text-sm">
                <div className="flex justify-between"><span className="text-ink-muted">Application</span><span className="font-medium text-ink">IntelliStock Pro</span></div>
                <div className="flex justify-between"><span className="text-ink-muted">Version</span><span className="font-medium text-ink">v1.0.0</span></div>
                <div className="flex justify-between"><span className="text-ink-muted">Database</span><span className="font-medium text-ink">SQLite (via Prisma)</span></div>
                <div className="flex justify-between"><span className="text-ink-muted">Environment</span><span className="font-medium text-ink">Development</span></div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
