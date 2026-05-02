import { useState, FormEvent } from 'react';
import { useAuth } from '../components/auth/AuthContext';
import { motion } from 'framer-motion';
import { User, Camera, Mail, Shield, Save, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { createAuditLog } from '../services/auditService';

export default function Profile() {
  const { user, updateUserProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [avatarSeed, setAvatarSeed] = useState(user?.displayName || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpdateAvatar = () => {
    const newSeed = Math.random().toString(36).substring(7);
    setAvatarSeed(newSeed);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;
      await updateUserProfile({ displayName, avatarUrl });
      await createAuditLog(user.uid, 'PROFILE_UPDATED', 'Updated user profile information and avatar');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Personal Profile</h1>
        <p className="text-sm text-slate-500">Update your account information and visual identity.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm"
      >
        <form onSubmit={handleSave} className="space-y-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-slate-50 shadow-md">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <button 
                type="button"
                onClick={handleUpdateAvatar}
                className="absolute bottom-1 right-1 p-2.5 bg-blue-600 text-white rounded-full border-2 border-white hover:scale-110 active:scale-95 transition-all shadow-lg"
                title="Randomize Avatar"
              >
                <Camera size={18} />
              </button>
            </div>
            <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Identity Avatar</p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Display Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full border border-slate-200 rounded-lg bg-slate-50 pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  value={user?.email || ''} 
                  disabled
                  className="w-full border border-slate-200 rounded-lg bg-slate-50 pl-10 pr-4 py-3 text-sm text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Account Role</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={user?.role?.toUpperCase() || ''} 
                  disabled
                  className="w-full border border-slate-200 rounded-lg bg-slate-50 pl-10 pr-4 py-3 text-xs font-bold tracking-widest text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
            <div className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">
              Member Since: {new Date(user?.createdAt || '').toLocaleDateString()}
            </div>
            <button 
              type="submit"
              disabled={saving}
              className={cn(
                "px-8 py-2.5 rounded-lg font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-all shadow-sm",
                success 
                  ? "bg-emerald-600 text-white" 
                  : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95 disabled:opacity-50 shadow-blue-500/20"
              )}
            >
              {saving ? 'Saving...' : success ? <><Check size={16} /> Saved</> : <><Save size={16} /> Save Changes</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
