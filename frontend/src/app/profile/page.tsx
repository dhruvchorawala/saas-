'use client';
import { useState, FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Shield, Mail, User, Loader2, Save, KeyRound } from 'lucide-react';
import api, { apiError } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import RequireAuth from '../../components/RequireAuth';

const inputClass = 'block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-white/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium text-slate-900 outline-none';

function Profile() {
  const { user, checkUserLoggedIn } = useAuth();
  const [name, setName] = useState(user!.name);
  const [email, setEmail] = useState(user!.email);
  const [savingDetails, setSavingDetails] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const updateDetails = async (e: FormEvent) => {
    e.preventDefault();
    setSavingDetails(true);
    try {
      await api.put('/auth/updatedetails', { name, email });
      toast.success('Profile updated');
      await checkUserLoggedIn();
    } catch (err) {
      toast.error(apiError(err, 'Failed to update profile'));
    } finally {
      setSavingDetails(false);
    }
  };

  const updatePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setSavingPassword(true);
    try {
      await api.put('/auth/updatepassword', { currentPassword, newPassword });
      toast.success('Password changed');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error(apiError(err, 'Failed to change password'));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen mesh-bg pt-28 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl uppercase">
              {user!.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Your profile</h1>
              <p className="text-sm text-slate-500 font-medium mt-1">Manage your account details.</p>
            </div>
          </div>
          <div className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-sm">
            <Shield className="w-4 h-4 mr-2" /> {user!.role === 'ADMIN' ? 'Admin' : 'Member'}
          </div>
        </div>

        <form onSubmit={updateDetails} className="glass rounded-3xl p-8 border border-white/60 space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Personal information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Full name</span>
              <span className="relative block">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input value={name} onChange={e => setName(e.target.value)} required className={inputClass} />
              </span>
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Email address</span>
              <span className="relative block">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={inputClass} />
              </span>
            </label>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingDetails || (name === user!.name && email === user!.email)}
              className="inline-flex items-center px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-indigo-600 transition-colors disabled:opacity-50"
            >
              {savingDetails ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />} Save changes
            </button>
          </div>
        </form>

        <form onSubmit={updatePassword} className="glass rounded-3xl p-8 border border-white/60 space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Change password</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Current password</span>
              <span className="relative block">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className={inputClass} />
              </span>
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">New password</span>
              <span className="relative block">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} className={inputClass} />
              </span>
            </label>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={savingPassword} className="inline-flex items-center px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-indigo-600 transition-colors disabled:opacity-50">
              {savingPassword && <Loader2 className="w-5 h-5 mr-2 animate-spin" />} Update password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <Profile />
    </RequireAuth>
  );
}
