import { useState, FormEvent } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle, Shield, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };
  const handleForgotPassword = async () => {
  setError('');
  if (!email) {
    setError('Please enter your email first.');
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    alert('Password reset email sent! Check your inbox.');
  } catch (err: any) {
    setError(err.message || 'Failed to send reset email');
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex w-full max-w-5xl h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 mx-4"
      >
        {/* Left Side - Visual/Branding */}
        <div className="hidden lg:flex flex-1 bg-slate-900 relative p-12 flex-col justify-between overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full translate-y-1/3 -translate-x-1/4 blur-3xl"></div>
          
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">A</div>
            <span className="text-2xl font-bold text-white tracking-tight">Attendace <span className="text-blue-500 font-medium text-sm">PRO</span></span>
          </div>

          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">The Modern Standard for Academic Management.</h2>
            <p className="text-slate-400 text-lg max-w-md">Streamline your institution's operations with high-precision tracking and automated reporting.</p>
          </div>

          <div className="relative z-10 flex items-center gap-6 text-slate-500 text-sm font-medium">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-blue-500" />
              Enterprise Security
            </div>
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-blue-500" />
              Real-time Analytics
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 p-8 md:p-16 flex flex-col justify-center">
          <div className="mb-10 lg:hidden">
             <div className="flex items-center gap-2 mb-2">
               <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">A</div>
               <span className="text-xl font-bold text-slate-900">Attendace <span className="text-blue-500 font-medium text-xs">PRO</span></span>
             </div>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Sign in to Console</h1>
            <p className="text-slate-500">Enter your credentials to manage your workspace.</p>
          </div>

          

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm flex items-center gap-3"
            >
              <AlertCircle size={18} className="flex-shrink-0" />
              <p className="font-medium">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Corporate Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium text-slate-900"
                  placeholder="name@institution.edu"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium text-slate-900"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-slate-800 active:scale-[0.98] transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 mt-4 disabled:opacity-50" >
              {loading ? 'Authenticating...' : 'Access Workspace'}
            </button>
            <p className="mt-4 text-center text-sm text-slate-500">
             <Link to="/forgot-password" className="text-blue-600 hover:text-blue-700 underline underline-offset-4 decoration-2 font-bold">Forgot Password?</Link>
            </p>
          </form>

          <p className="mt-10 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4 decoration-2">
              Request Access
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
