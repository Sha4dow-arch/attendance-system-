import { useEffect, useState, FormEvent } from 'react';
import { useAuth } from '../components/auth/AuthContext';
import { courseService } from '../services/firestoreService';
import { createAuditLog } from '../services/auditService';
import { Course, AppUser } from '../types';
import { Plus, Book, User, Search, Trash2, UserPlus, Info, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cn } from '../lib/utils';

export default function Courses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [availableStudents, setAvailableStudents] = useState<AppUser[]>([]);
  const [teachers, setTeachers] = useState<AppUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [newCourse, setNewCourse] = useState({ name: '', description: '', teacherId: '' });

  useEffect(() => {
    loadCourses();
    if (user?.role === 'admin' || user?.role === 'teacher') {
      loadExtraData();
    }
  }, [user]);

  async function loadCourses() {
    setLoading(true);
    try {
      let data: Course[] = [];
      if (user?.role === 'admin') {
        data = await courseService.getCourses();
      } else if (user?.role === 'teacher') {
        data = await courseService.getCoursesByTeacher(user.uid);
      } else {
        data = await courseService.getCoursesByStudent(user.uid);
      }
      setCourses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadExtraData() {
    try {
      const studentQ = query(collection(db, 'users'), where('role', '==', 'student'));
      const sSnap = await getDocs(studentQ);
      setAvailableStudents(sSnap.docs.map(d => d.data() as AppUser));

      const teacherQ = query(collection(db, 'users'), where('role', '==', 'teacher'));
      const tSnap = await getDocs(teacherQ);
      setTeachers(tSnap.docs.map(d => d.data() as AppUser));
    } catch (err) {
      console.error(err);
    }
  }

  const handleCreateCourse = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const teacherId = user.role === 'admin' ? newCourse.teacherId : user.uid;
      await courseService.createCourse({
        name: newCourse.name,
        description: newCourse.description,
        teacherId,
        studentIds: [],
        createdAt: new Date().toISOString()
      });
      await createAuditLog(user.uid, 'COURSE_CREATED', `Created course: ${newCourse.name}`);
      setIsModalOpen(false);
      setNewCourse({ name: '', description: '', teacherId: '' });
      loadCourses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnroll = async (studentId: string) => {
    if (!selectedCourse || !user) return;
    try {
      await courseService.enrollStudent(selectedCourse.id, studentId);
      await createAuditLog(user.uid, 'STUDENT_ENROLLED', `Enrolled student ${studentId} in ${selectedCourse.name}`);
      loadCourses();
      // Update local selected course for UI feedback
      setSelectedCourse(prev => prev ? { ...prev, studentIds: [...prev.studentIds, studentId] } : null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Course Registry</h1>
          <p className="text-sm text-slate-500">Manage and view all academic courses in the system.</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'teacher') && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={18} />
            Initialize New Course
          </button>
        )}
      </div>

      {courses.length === 0 && !loading ? (
        <div className="bg-white border border-slate-200 border-dashed rounded-3xl p-12 text-center max-w-2xl mx-auto shadow-sm">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-500">
            <Book size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No Active Courses Detected</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">Initialize your first course registry to start tracking attendance and managing student enrollments within your authorized domain.</p>
          {(user?.role === 'admin' || user?.role === 'teacher') && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
            >
              Initialize Course Registry
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {courses.map((course, idx) => {
            const isLeadTeacher = user?.role === 'teacher' && user.uid === course.teacherId;
            const isAdmin = user?.role === 'admin';
            
            return (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={course.id}
                className="bg-white border border-slate-200 p-0 rounded-2xl shadow-sm relative overflow-hidden group hover:shadow-xl hover:border-blue-100 transition-all duration-300"
              >
                <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-blue-600 text-xl font-bold shadow-inner">
                      {course.name.charAt(0)}
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-widest bg-slate-50 text-slate-400 px-2 py-1 rounded border border-slate-200">
                        REG_{course.id.slice(0, 8).toUpperCase()}
                      </span>
                      {isLeadTeacher && (
                        <span className="text-[8px] font-bold text-white bg-blue-600 px-2 py-0.5 rounded-full uppercase tracking-tighter flex items-center gap-1 shadow-sm">
                          <CheckCircle2 size={10} /> Lead
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">{course.name}</h2>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 h-8 leading-relaxed">{course.description || "Administrative registry unit with automated attendance tracking."}</p>
                  
                  <div className="mt-6 border-t border-slate-50 pt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <div className="flex -space-x-2">
                         {[...Array(2)].map((_, i) => (
                           <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400">
                             {String.fromCharCode(65 + i)}
                           </div>
                         ))}
                         <div className="w-6 h-6 rounded-full border-2 border-white bg-blue-500 flex items-center justify-center text-[8px] font-bold text-white">
                           +{course.studentIds.length}
                         </div>
                       </div>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registry</span>
                    </div>
                    
                    <div className="flex gap-2">
                      {(isAdmin || isLeadTeacher) && (
                        <button 
                          onClick={() => { setSelectedCourse(course); setIsEnrollModalOpen(true); }}
                          className="bg-blue-600 text-white rounded-xl px-4 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-[0.98] flex-1 justify-center whitespace-nowrap"
                        >
                          <UserPlus size={16} />
                          Enroll Students
                        </button>
                      )}
                      {isAdmin && (
                        <button 
                          onClick={() => {/* Handle delete */}}
                          className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    )}

      {/* Initialize Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white border border-slate-200 p-8 max-w-md w-full rounded-2xl shadow-xl"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-6">Initialize New Course</h2>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Course Name</label>
                <input 
                  required
                  value={newCourse.name}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg bg-slate-50 p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                  placeholder="e.g. Advanced Science 101"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea 
                  value={newCourse.description}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg bg-slate-50 p-3 text-sm outline-none h-24 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                  placeholder="Enter course objective and overview..."
                />
              </div>
              {user?.role === 'admin' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Assign Teacher</label>
                  <select 
                    required
                    value={newCourse.teacherId}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, teacherId: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg bg-slate-50 p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                  >
                    <option value="">Select a teacher</option>
                    {teachers.map(t => (
                      <option key={t.uid} value={t.uid}>{t.displayName}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex gap-3 mt-8">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Create Course
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Enrollment Modal */}
      {isEnrollModalOpen && selectedCourse && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                  <UserPlus size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Enterprise Student Enrollment</h2>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-1">Target Registry: <span className="text-blue-600">{selectedCourse.name}</span></p>
                </div>
              </div>
              <button 
                onClick={() => setIsEnrollModalOpen(false)} 
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 md:p-8 flex-1 overflow-hidden flex flex-col">
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  placeholder="Search students by name or identity token..."
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                {availableStudents.filter(s => 
                  s.displayName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  s.email.toLowerCase().includes(searchTerm.toLowerCase())
                ).length > 0 ? (
                  availableStudents.filter(s => 
                    s.displayName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    s.email.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map(student => {
                    const isEnrolled = selectedCourse.studentIds.includes(student.uid);
                    return (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={student.uid} 
                        className={cn(
                          "p-4 border rounded-2xl flex items-center justify-between transition-all group",
                          isEnrolled ? "bg-slate-50 border-slate-100 opacity-60" : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-md"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center font-bold text-slate-400 shadow-sm relative">
                            {student.displayName.charAt(0)}
                            {isEnrolled && <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-0.5 border-2 border-white"><CheckCircle2 size={10} /></div>}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-none">{student.displayName}</p>
                            <p className="text-[10px] text-slate-500 mt-1 font-mono uppercase tracking-tighter">{student.email}</p>
                          </div>
                        </div>
                        
                        <button
                          disabled={isEnrolled}
                          onClick={() => handleEnroll(student.uid)}
                          className={cn(
                            "px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                            isEnrolled 
                              ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" 
                              : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center gap-2"
                          )}
                        >
                          {isEnrolled ? (
                            <>Registered</>
                          ) : (
                            <>
                              <UserPlus size={14} />
                              Enroll Student
                            </>
                          )}
                        </button>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-slate-400 italic">
                    No results found for students.
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">End of Active Directory Registry</p>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
