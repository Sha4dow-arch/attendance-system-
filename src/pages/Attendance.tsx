import { useEffect, useState } from 'react';
import { useAuth } from '../components/auth/AuthContext';
import { courseService, attendanceService } from '../services/firestoreService';
import { Course, AttendanceRecord, AppUser } from '../types';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Calendar, CheckCircle, Clock, XCircle, Search, User, FileDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { reportService } from '../services/reportService';

export default function Attendance() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [students, setStudents] = useState<AppUser[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      setLoading(true);
      try {
        let fetchedCourses: Course[] = [];
        if (user.role === 'teacher') {
          fetchedCourses = await courseService.getCoursesByTeacher(user.uid);
        } else if (user.role === 'student') {
          fetchedCourses = await courseService.getCoursesByStudent(user.uid);
        }
        setCourses(fetchedCourses);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  useEffect(() => {
    async function loadCourseStudents() {
      if (!selectedCourse) return;
      try {
        const studentQ = query(collection(db, 'users'), where('uid', 'in', selectedCourse.studentIds.length > 0 ? selectedCourse.studentIds : ['dummy']));
        const snapshot = await getDocs(studentQ);
        setStudents(snapshot.docs.map(d => d.data() as AppUser));

        const attRecords = await attendanceService.getAttendanceByCourse(selectedCourse.id, date);
        setRecords(attRecords);
      } catch (err) {
        console.error(err);
      }
    }
    loadCourseStudents();
  }, [selectedCourse, date]);

  const handleMark = async (studentId: string, status: 'present' | 'late' | 'absent') => {
    if (!selectedCourse || !user) return;
    try {
      const record = {
        courseId: selectedCourse.id,
        studentId,
        date,
        status,
        markedBy: user.uid,
        timestamp: new Date().toISOString()
      };
      await attendanceService.markAttendance(record);
      setRecords(prev => {
        const filtered = prev.filter(r => r.studentId !== studentId);
        return [...filtered, { id: `${selectedCourse.id}_${studentId}_${date}`, ...record }];
      });
    } catch (err) {
      console.error(err);
    }
  };

  const exportReport = () => {
    if (!selectedCourse) return;
    const data = students.map(s => {
      const rec = records.find(r => r.studentId === s.uid);
      return {
        Student: s.displayName,
        Email: s.email,
        Date: date,
        Status: rec?.status || 'Not Marked'
      };
    });
    reportService.exportToCSV(data, `Attendance_${selectedCourse.name}_${date}`);
  };

  if (loading) return <div className="animate-pulse font-mono">LOADING_ATTENDANCE_DATA...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Post-Session Attendance</h1>
          <p className="text-slate-500 text-sm">Reviewing status for {date}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
            <Calendar size={16} className="text-slate-400" />
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent outline-none text-sm font-semibold text-slate-700"
            />
          </div>
          <button 
            onClick={exportReport}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm"
          >
            <FileDown size={18} />
            Export data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Course List */}
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between lg:block mb-4 overflow-hidden">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 lg:mb-4">Assigned Courses</h3>
            <div className="lg:hidden h-px bg-slate-200 flex-1 ml-4"></div>
          </div>
          
          <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 scrollbar-none snap-x h-full">
            {courses.map((course, idx) => (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                className={cn(
                  "min-w-[200px] lg:min-w-0 text-left p-4 rounded-xl border transition-all duration-200 shadow-sm snap-start",
                  selectedCourse?.id === course.id 
                    ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-blue-200" 
                    : "bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50/30"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0",
                    selectedCourse?.id === course.id ? "bg-blue-600" : "bg-slate-100"
                  )}>
                    {course.name.charAt(0)}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-bold truncate text-sm leading-tight">{course.name}</p>
                    <p className={cn("text-[10px] mt-0.5 opacity-50 uppercase tracking-widest leading-none", selectedCourse?.id === course.id ? "text-slate-400" : "")}>
                      {course.studentIds.length} ENROLLED
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Student List & Marking */}
        <div className="lg:col-span-3">
          {selectedCourse ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all">
              <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between bg-slate-50/50 gap-4">
                <h2 className="font-bold text-slate-800 tracking-tight text-sm md:text-base">
                  <span className="text-blue-600 mr-2 md:hidden">●</span>
                  {selectedCourse.name} <span className="text-slate-400 font-medium ml-2 hidden sm:inline">Roster</span>
                </h2>
                <div className="flex flex-wrap gap-3 items-center font-medium text-[9px] md:text-[10px] text-slate-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-slate-200"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Present ({records.filter(r => r.status === 'present').length})</span>
                  <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-slate-200"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> Late ({records.filter(r => r.status === 'late').length})</span>
                  <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-slate-200"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> Absent ({records.filter(r => r.status === 'absent').length})</span>
                </div>
              </div>

              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-50/80 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                      <th className="px-6 py-4">Student Details</th>
                      <th className="px-6 py-4">Metric / ID</th>
                      <th className="px-6 py-4 text-center">Status Flag</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 italic md:not-italic">
                    {students.map(student => {
                      const record = records.find(r => r.studentId === student.uid);
                      return (
                        <motion.tr 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          key={student.uid} 
                          className="hover:bg-slate-50/50 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-xs shadow-inner flex-shrink-0">
                                {student.displayName.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-slate-700 text-sm tracking-tight truncate block">{student.displayName}</span>
                                <p className="text-[10px] text-slate-400 truncate w-32 sm:w-auto">{student.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mono text-[9px] text-slate-400 uppercase bg-slate-50 px-2 py-0.5 rounded border border-slate-100">ID_{student.uid.slice(0, 8)}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {record ? (
                              <span className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider",
                                record.status === 'present' ? "bg-emerald-100 text-emerald-700" :
                                record.status === 'late' ? "bg-amber-100 text-amber-700" :
                                "bg-rose-100 text-rose-700"
                              )}>
                                {record.status}
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest italic">Pending</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {user.role === 'teacher' && (
                              <div className="flex items-center justify-center gap-1">
                                <button 
                                  onClick={() => handleMark(student.uid, 'present')}
                                  className={cn(
                                    "p-2 rounded-lg transition-all",
                                    record?.status === 'present' 
                                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-200" 
                                      : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                                  )}
                                  title="Mark Present"
                                >
                                  <CheckCircle size={16} />
                                </button>
                                <button 
                                  onClick={() => handleMark(student.uid, 'late')}
                                  className={cn(
                                    "p-2 rounded-lg transition-all",
                                    record?.status === 'late' 
                                      ? "bg-amber-500 text-white shadow-md shadow-amber-200" 
                                      : "text-slate-400 hover:text-amber-500 hover:bg-amber-50"
                                  )}
                                  title="Mark Late"
                                >
                                  <Clock size={16} />
                                </button>
                                <button 
                                  onClick={() => handleMark(student.uid, 'absent')}
                                  className={cn(
                                    "p-2 rounded-lg transition-all",
                                    record?.status === 'absent' 
                                      ? "bg-rose-500 text-white shadow-md shadow-rose-200" 
                                      : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                  )}
                                  title="Mark Absent"
                                >
                                  <XCircle size={16} />
                                </button>
                              </div>
                            )}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white border border-slate-200 border-dashed rounded-3xl p-6 md:p-12 text-center">
              <Search size={48} className="text-slate-200 mb-6" />
              <h3 className="text-lg font-bold text-slate-800 mb-2">No Course Selected</h3>
              <p className="text-slate-500 text-sm max-w-[240px] mx-auto">Please select a course from the roster to initialize the daily attendance registry.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
