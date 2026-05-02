import { useEffect, useState } from 'react';
import { useAuth } from '../components/auth/AuthContext';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AuditLog } from '../types';
import { ShieldAlert, Clock, Terminal, Search, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AuditLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      if (user?.role !== 'admin') return;
      try {
        const q = query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'), limit(100));
        const snapshot = await getDocs(q);
        setLogs(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AuditLog)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, [user]);

  if (user?.role !== 'admin') return <div className="text-red-700 font-bold font-mono">ERR_UNAUTHORIZED: ADMIN_ONLY_ENDPOINT</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Audit Logs</h1>
          <p className="text-sm text-slate-500">Security event trail and system activity history.</p>
        </div>
        <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm">
          <Activity size={18} className="text-emerald-600" />
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Monitoring Active</span>
        </div>
      </div>

      <div className="bg-slate-900 text-slate-100 rounded-2xl p-8 shadow-xl font-mono text-sm overflow-hidden border border-slate-800">
        <div className="border-b border-slate-800 pb-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal size={18} className="text-blue-400" />
            <span className="uppercase tracking-widest font-bold text-slate-400">System Explorer v1.0</span>
          </div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Filter: All Events</p>
        </div>
        
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
          {logs.map((log) => (
            <motion.div 
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              key={log.id} 
              className="flex gap-6 group hover:bg-slate-800/50 p-3 rounded-xl transition-colors cursor-default"
            >
              <span className="text-blue-400 opacity-60 flex-shrink-0 font-bold">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
              <span className="text-emerald-400 font-bold uppercase flex-shrink-0 min-w-[120px]">{log.action}</span>
              <div className="flex-1">
                <p className="text-slate-300 leading-relaxed text-xs">{log.details}</p>
                <p className="text-[10px] text-slate-600 uppercase mt-2 font-bold">Origin: {log.userId}</p>
              </div>
            </motion.div>
          ))}
          {logs.length === 0 && (
            <div className="py-20 text-center opacity-30">
              <ShieldAlert size={48} className="mx-auto mb-4" />
              <p className="uppercase tracking-[0.3em] text-xs">No audit records detected</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
