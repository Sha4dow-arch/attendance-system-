import { useEffect, useState } from 'react';
import { useAuth } from '../components/auth/AuthContext';
import { collection, query, getDocs, updateDoc, doc, deleteDoc, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AppUser, UserRole } from '../types';
import { Shield, User, Trash2, Search, Filter, Mail, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { createAuditLog } from '../services/auditService';

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

  useEffect(() => {
    async function loadUsers() {
      if (currentUser?.role !== 'admin') return;
      try {
        const snapshot = await getDocs(collection(db, 'users'));
        setUsers(snapshot.docs.map(d => d.data() as AppUser));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, [currentUser]);

  const handleUpdateRole = async (uid: string, newRole: UserRole) => {
    if (currentUser?.role !== 'admin') return;
    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole });
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u));
      await createAuditLog(currentUser.uid, 'USER_ROLE_UPDATED', `Updated role of user ${uid} to ${newRole}`);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (currentUser?.role !== 'admin') return <div className="text-red-600 font-bold p-8">ACCESS_DENIED: UNAUTHORIZED_REQUEST</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Identity Repository</h1>
          <p className="text-sm text-slate-500">Manage user accounts, roles, and system permissions.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 bg-white rounded-lg text-sm w-full sm:w-64 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all"
            />
          </div>
          <select 
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="border border-slate-200 bg-white rounded-lg text-sm px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all text-slate-600 font-medium cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="teacher">Teachers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-xs uppercase font-bold tracking-widest text-slate-500">Identity</th>
              <th className="p-4 text-xs uppercase font-bold tracking-widest text-slate-500">Metadata</th>
              <th className="p-4 text-xs uppercase font-bold tracking-widest text-slate-500">Current Role</th>
              <th className="p-4 text-xs uppercase font-bold tracking-widest text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredUsers.map((u, i) => (
                <motion.tr 
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  key={u.uid} 
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border border-slate-200 overflow-hidden bg-slate-100 shadow-sm">
                        <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 tracking-tight">{u.displayName}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">ID: {u.uid.slice(0, 12)}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Since: {new Date(u.createdAt).toLocaleDateString()}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      "px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md",
                      u.role === 'admin' ? "bg-purple-50 text-purple-700 border border-purple-100" :
                      u.role === 'teacher' ? "bg-blue-50 text-blue-700 border border-blue-100" :
                      "bg-slate-100 text-slate-600 border border-slate-200"
                    )}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 text-slate-900">
                      <select 
                        value={u.role}
                        onChange={(e) => handleUpdateRole(u.uid, e.target.value as UserRole)}
                        className="text-[10px] font-bold uppercase border border-slate-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white cursor-pointer"
                        disabled={u.uid === currentUser.uid}
                      >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button className="p-2 border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 rounded-lg transition-all" disabled={u.uid === currentUser.uid}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
