import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  CalendarCheck, 
  FileText, 
  Settings, 
  LogOut,
  ShieldAlert,
  Globe,
  Menu,
  X,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { ReactNode, useState, useEffect } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: t('dashboard'), path: '/', roles: ['student', 'teacher', 'admin'] },
    { icon: Users, label: 'User Management', path: '/users', roles: ['admin'] },
    { icon: BookOpen, label: t('courses'), path: '/courses', roles: ['student', 'teacher', 'admin'] },
    { icon: CalendarCheck, label: t('attendance'), path: '/attendance', roles: ['student', 'teacher'] },
    { icon: FileText, label: t('reports'), path: '/reports', roles: ['student', 'teacher', 'admin'] },
    { icon: ShieldAlert, label: t('audit_logs'), path: '/audit', roles: ['admin'] },
    { icon: Settings, label: t('settings'), path: '/settings', roles: ['admin'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role || ''));

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">A</div>
        <span className="text-xl font-bold text-white tracking-tight">Attendace <span className="text-blue-500 font-medium text-xs">PRO</span></span>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="pb-2 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Main Console</div>
        {filteredMenu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-sm font-medium",
              isActive 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                : "hover:bg-slate-800 text-slate-400 hover:text-white"
            )}
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-4">
        <div className="flex items-center gap-2 px-2 text-slate-400">
          <Globe size={14} />
          <select 
            value={i18n.language}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            className="bg-transparent text-xs font-semibold outline-none hover:text-white transition-colors cursor-pointer"
          >
            <option value="en" className="bg-slate-900">English</option>
            <option value="es" className="bg-slate-900">Español</option>
          </select>
        </div>
        
        <NavLink
          to="/profile"
          className="flex items-center gap-3 p-2 bg-slate-800/30 rounded-xl hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700"
        >
          <img 
            src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} 
            alt="Avatar" 
            className="w-10 h-10 rounded-full border-2 border-blue-500 bg-slate-600"
          />
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">{user?.displayName}</p>
            <p className="text-[10px] text-slate-400 truncate uppercase font-bold tracking-wider">{user?.role}</p>
          </div>
        </NavLink>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
        >
          <LogOut size={18} />
          {t('logout')}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800 overflow-x-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-slate-900 text-slate-300 flex-col border-r border-slate-800 h-screen sticky top-0 overflow-hidden">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-64 bg-slate-900 text-slate-300 flex flex-col z-50 lg:hidden shadow-2xl"
          >
            <div className="absolute top-4 right-4 lg:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen min-w-0 bg-slate-50 relative">
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg lg:hidden"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight capitalize hidden sm:block">
                {location.pathname === '/' ? 'Operational Overview' : location.pathname.split('/')[1].replace('_', ' ')}
              </h1>
              <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
              <div className="flex items-center bg-blue-50/50 rounded-full px-3 py-1 text-[10px] font-bold text-blue-600 uppercase tracking-widest border border-blue-100">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
                System Authorized
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:flex items-center gap-2 font-mono text-[10px] text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
              <Activity size={12} className="text-blue-500" />
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
            <div className="lg:hidden flex items-center gap-2">
               <NavLink to="/profile" className="w-9 h-9 rounded-full border border-slate-200 overflow-hidden shadow-sm">
                 <img 
                   src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} 
                   className="w-full h-full object-cover" 
                   alt="avatar" 
                 />
               </NavLink>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div 
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ 
              duration: 0.3,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="p-4 md:p-8 flex-1 w-full max-w-[1600px] mx-auto"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

