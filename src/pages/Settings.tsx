import { useState, useEffect } from 'react';
import { useAuth } from '../components/auth/AuthContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Shield, Lock, Bell, Globe, Save, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { createAuditLog } from '../services/auditService';

export default function Settings() {
  const { user } = useAuth();
  const [adminCode, setAdminCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadSettings() {
      const snap = await getDoc(doc(db, 'settings', 'global'));
      if (snap.exists()) {
        setAdminCode(snap.data().adminRegistrationCode || 'ADMIN2026');
      }
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    if (user?.role !== 'admin') return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'global'), { 
        adminRegistrationCode: adminCode,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
      await createAuditLog(user.uid, 'SETTINGS_UPDATED', 'Updated global admin registration code');
      setMessage('Security parameters successfully persisted.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (user?.role !== 'admin') return <div className="p-8 font-mono text-red-600">FATAL_ERROR: COMPONENT_RESTRICTED_TO_PRIVILEGED_USERS</div>;

  const SettingSection = ({ icon: Icon, title, description, children }: any) => (
    <section className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-blue-600">
          <Icon size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl space-y-8 py-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Configuration</h1>
        <p className="text-sm text-slate-500">Configure global application parameters and security protocols.</p>
      </div>

      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-widest text-center rounded-xl shadow-sm"
        >
          {message}
        </motion.div>
      )}

      <div className="space-y-6">
        <SettingSection 
          icon={Lock} 
          title="Security & Access Control" 
          description="Manage authentication parameters and registration security."
        >
          <div className="max-w-md">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Admin Registration Code</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                placeholder="TOKEN_VALUE"
              />
              <button 
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 text-white px-6 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-500/20 disabled:opacity-50"
              >
                {saving ? 'Syncing...' : 'Save Code'}
              </button>
            </div>
            <p className="mt-4 text-[10px] text-slate-500 flex items-center gap-1.5 uppercase font-medium">
              <HelpCircle size={12} className="text-blue-500" />
              This code is required for users registering with the Admin role to prevent unauthorized access.
            </p>
          </div>
        </SettingSection>

        <SettingSection 
          icon={Globe} 
          title="Language & Localization" 
          description="Configure supported system languages and default locales."
        >
          <div className="flex flex-wrap gap-6">
            {['English', 'Español', 'Français'].map(lang => (
              <label key={lang} className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" checked={lang !== 'Français'} readOnly className="w-4 h-4 accent-blue-600 rounded border-slate-300 focus:ring-blue-500 transition-all" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-widest group-hover:text-blue-600 transition-colors">{lang}</span>
              </label>
            ))}
          </div>
        </SettingSection>

        <SettingSection 
          icon={Bell} 
          title="System Notifications" 
          description="Configure global alert levels and audit logging verbosity."
        >
          <div className="space-y-4 max-w-lg">
            <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
              <div>
                <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">Verbose Audit Logging</span>
                <p className="text-[10px] text-slate-400 font-medium">Record granular details for every system interaction.</p>
              </div>
              <div className="w-11 h-6 bg-blue-600 rounded-full relative p-1 transition-all">
                <div className="w-4 h-4 bg-white rounded-full translate-x-5 shadow-sm"></div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl opacity-50 cursor-not-allowed">
              <div>
                <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">Real-time Email Alerts</span>
                <p className="text-[10px] text-slate-400 font-medium">Receive immediate notifications for critical system errors.</p>
              </div>
              <div className="w-11 h-6 bg-slate-200 rounded-full relative p-1">
                <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
              </div>
            </div>
          </div>
        </SettingSection>
      </div>

      <div className="pt-8 border-t border-slate-100 flex justify-end">
        <button 
          className="bg-slate-900 text-white px-10 py-3.5 rounded-xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-slate-800 active:scale-95 transition-all shadow-lg shadow-slate-900/10"
        >
          Commit All Changes
        </button>
      </div>
    </motion.div>
  );
}
