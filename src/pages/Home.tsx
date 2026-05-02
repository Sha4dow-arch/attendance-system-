import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../components/auth/AuthContext';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'framer-motion';
import { Users, BookOpen, CalendarCheck, TrendingUp, AlertCircle, Clock, ArrowUpRight, UserPlus } from 'lucide-react';
import { cn } from '../lib/utils';
import { userService, courseService } from '../services/firestoreService';
import { AppUser, Course } from '../types';
import { Link } from 'react-router-dom';

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ users: 0, courses: 0, attendance: 0 });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [teacherCourses, setTeacherCourses] = useState<Course[]>([]);
  const [allStudents, setAllStudents] = useState<AppUser[]>([]);

  useEffect(() => {
    async function fetchDashboardContent() {
      try {
        if (!user) return;

        // Fetch Stats
        if (user.role === 'admin') {
          const uSnap = await getDocs(collection(db, 'users'));
          const cSnap = await getDocs(collection(db, 'courses'));
          const aSnap = await getDocs(collection(db, 'attendance'));
          setStats({
            users: uSnap.size,
            courses: cSnap.size,
            attendance: aSnap.size
          });

          const logQ = query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'), limit(5));
          const logSnap = await getDocs(logQ);
          setRecentLogs(logSnap.docs.map(d => d.data()));
        } else if (user.role === 'teacher') {
          const courses = await courseService.getCoursesByTeacher(user.uid);
          setTeacherCourses(courses);
          
          const students = await userService.getAllStudents();
          setAllStudents(students);

          setStats({
            users: courses.reduce((acc, c) => acc + (c.studentIds?.length || 0), 0),
            courses: courses.length,
            attendance: 1 // Default or calculated
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardContent();
  }, [user]);

  const teacherRoster = useMemo(() => {
    if (user?.role !== 'teacher') return [];
    
    // Find students enrolled in at least one of this teacher's courses
    const myStudents = allStudents.filter(student => 
      student.enrolledCourseIds?.some(id => teacherCourses.some(tc => tc.id === id))
    );

    return myStudents.map(student => ({
      ...student,
      matchingCourses: teacherCourses.filter(tc => student.enrolledCourseIds?.includes(tc.id!))
    }));
  }, [user, allStudents, teacherCourses]);

  const QuickEnrollWidget = () => (
    <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden border border-slate-800">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="relative z-10">
        <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
          <UserPlus size={20} className="text-blue-400" />
          Quick Registration
        </h3>
        <p className="text-slate-400 text-xs mb-6 leading-relaxed">Instantly add students to your registries from the central directory.</p>
        <Link 
          to="/courses" 
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20"
        >
          Open Course Registries
          <ArrowUpRight size={14} />
        </Link>
      </div>
    </div>
  );

  const StatCard = ({ icon: Icon, label, value, subtext, color, delay }: any) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white", color)}>
          <Icon size={20} />
        </div>
      </div>
      <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h3>
      <p className="text-xs text-slate-500 font-medium mt-2">{subtext}</p>
    </motion.div>
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white px-4 md:px-8 py-6 rounded-2xl border border-slate-200 shadow-sm gap-4 transition-all"
      >
        <div className="flex-1">
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Main Console Overview</h1>
          <p className="text-slate-500 text-sm">Welcome back, {user?.displayName}. System initialized and ready.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           <button className="flex-1 md:flex-none bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm">
            Generate Report
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Users} label="Total Students" value={stats.users} subtext="+12 this week" color="bg-blue-600" delay={0.1} />
        <StatCard icon={BookOpen} label="Course Roster" value={stats.courses} subtext="Across 12 Depts" color="bg-indigo-600" delay={0.2} />
        <StatCard icon={CalendarCheck} label="Attendance Avg" value="94.2%" subtext="Historical average" color="bg-emerald-600" delay={0.3} />
        <StatCard icon={AlertCircle} label="System Alerts" value={user?.role === 'admin' ? "2" : "0"} subtext="Needs attention" color="bg-rose-600" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Real-time Analytics Section / Class Roster for Teachers */}
        <div className="lg:col-span-2 space-y-8">
          {user?.role === 'teacher' ? (
             <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
               <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                 <h2 className="font-bold text-slate-800 flex items-center gap-2">
                   <Users size={18} className="text-blue-500" />
                   Assigned Class Roster
                 </h2>
                 <Link to="/courses" className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 hover:bg-blue-100 transition-all flex items-center gap-1.5 uppercase tracking-wider">
                   <UserPlus size={12} />
                   Enroll Students
                 </Link>
               </div>
               <div className="overflow-x-auto custom-scrollbar">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="bg-slate-50/30 text-[9px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                       <th className="px-6 py-4">Student Identity</th>
                       <th className="px-6 py-4">Registry Mapping (Your Classes)</th>
                       <th className="px-6 py-4 text-right">Status</th>
                     </tr>
                   </thead>
                   <motion.tbody 
                     variants={container}
                     initial="hidden"
                     animate="show"
                     className="divide-y divide-slate-100"
                   >
                     {teacherRoster.length > 0 ? teacherRoster.map((student) => (
                       <motion.tr variants={item} key={student.uid} className="hover:bg-slate-50/50 transition-colors group">
                         <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center font-bold text-slate-400 text-[10px] shadow-sm">
                               {student.displayName.charAt(0)}
                             </div>
                             <div>
                               <p className="text-xs font-bold text-slate-800">{student.displayName}</p>
                               <p className="text-[10px] text-slate-400 font-mono italic">{student.email}</p>
                             </div>
                           </div>
                         </td>
                         <td className="px-6 py-4">
                           <div className="flex flex-wrap gap-1">
                             {student.matchingCourses.map(course => (
                               <span key={course.id} className="text-[8px] font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-100 uppercase tracking-tight">
                                 {course.name}
                               </span>
                             ))}
                           </div>
                         </td>
                         <td className="px-6 py-4 text-right">
                           <div className="inline-flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                             <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                             <span className="text-[9px] font-bold text-emerald-600 uppercase">Synchronized</span>
                           </div>
                         </td>
                       </motion.tr>
                     )) : (
                       <tr>
                         <td colSpan={3} className="px-6 py-12 text-center text-slate-400 text-xs italic">
                           No students detected in your course registries.
                         </td>
                       </tr>
                     )}
                   </motion.tbody>
                 </table>
               </div>
             </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                  <TrendingUp size={18} className="text-blue-500" />
                  Attendance Velocity
                </h2>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-xs font-semibold bg-white border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50">7D</button>
                  <button className="px-3 py-1 text-xs font-semibold bg-slate-900 text-white rounded-md">30D</button>
                </div>
              </div>
              <div className="p-6">
                <div className="h-64 flex items-end gap-3 border-b border-slate-100 pb-2">
                  {[45, 65, 55, 85, 75, 95, 80, 70, 90, 85, 95, 100].map((h, i) => (
                    <div key={i} className="flex-1 bg-blue-500/10 hover:bg-blue-600 rounded-t-lg transition-all" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-widest">
                  <span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span><span>JUL</span><span>AUG</span><span>SEP</span><span>OCT</span><span>NOV</span><span>DEC</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity / Audit Logs */}
        <div className="space-y-6 flex flex-col">
          {user?.role === 'teacher' && <QuickEnrollWidget />}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
            <Clock size={18} className="text-slate-400" />
            <h2 className="font-bold text-slate-800">Operational Log</h2>
          </div>
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="flex-1 p-6 space-y-6"
          >
            {recentLogs.length > 0 ? recentLogs.map((log, i) => (
              <motion.div variants={item} key={i} className="flex gap-4 group">
                <div className="w-px bg-slate-100 relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-blue-500 ring-4 ring-blue-50 group-first:ring-blue-100"></div>
                </div>
                <div className="flex-1 -mt-1 pb-6">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-bold text-slate-700">{log.action}</p>
                    <span className="text-[10px] font-mono text-slate-400">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed truncate max-w-[200px]">{log.details}</p>
                </div>
              </motion.div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 opacity-40">
                <AlertCircle size={40} className="mb-2" />
                <p className="font-bold uppercase tracking-widest text-[10px]">No recent operations</p>
              </div>
            )}
          </motion.div>
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
            <button className="text-xs font-bold text-blue-600 hover:underline uppercase tracking-wider">View All Audit Logs</button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
