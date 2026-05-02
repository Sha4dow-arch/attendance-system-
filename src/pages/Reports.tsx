import { useState, useEffect } from 'react';
import { useAuth } from '../components/auth/AuthContext';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { reportService } from '../services/reportService';
import { FileText, Download, Filter, Database, BarChart3, PieChart, FileDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { AttendanceRecord, Course, AppUser } from '../types';

export default function Reports() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('attendance');
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('all');

  useEffect(() => {
    async function loadMeta() {
      const q = query(collection(db, 'courses'));
      const snap = await getDocs(q);
      setCourses(snap.docs.map(d => d.data() as Course));
    }
    loadMeta();
  }, []);

  const generateReport = async (format: 'csv' | 'excel' | 'pdf') => {
    setLoading(true);
    try {
      let data: any[] = [];
      let filename = `Report_${reportType}_${new Date().toISOString().split('T')[0]}`;
      let title = "System Generation Report";

      if (reportType === 'attendance') {
        let q = collection(db, 'attendance');
        if (selectedCourseId !== 'all') {
          q = query(q, where('courseId', '==', selectedCourseId)) as any;
        }
        const snap = await getDocs(q);
        const attRecords = snap.docs.map(d => d.data() as AttendanceRecord);
        
        // Enhance data with student/course names if needed, usually just export raw for speed in demo
        data = attRecords.map(r => ({
          Date: r.date,
          CourseID: r.courseId,
          StudentID: r.studentId,
          Status: r.status,
          MarkedBy: r.markedBy
        }));
        filename = `Attendance_Report_${selectedCourseId}`;
        title = "Attendance Summary Report";
      } else if (reportType === 'enrollment') {
        const q = collection(db, 'courses');
        const snap = await getDocs(q);
        const courses = snap.docs.map(d => d.data() as Course);
        data = courses.map(c => ({
          CourseName: c.name,
          TeacherID: c.teacherId,
          StudentCount: c.studentIds.length,
          CreatedDate: c.createdAt
        }));
        filename = "Enrollment_Statistics";
        title = "Course Enrollment Data";
      }

      if (format === 'csv') reportService.exportToCSV(data, filename);
      if (format === 'excel') reportService.exportToExcel(data, filename);
      if (format === 'pdf') reportService.exportToPDF(data, filename, title);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between bg-white px-8 py-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Intelligence & Reporting</h1>
          <p className="text-slate-500 text-sm italic">Standard Extraction Node // Version 2.4.1</p>
        </div>
        <div className="flex items-center gap-3 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
          <Database size={16} className="text-blue-600" />
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">Active Data Feed</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Generator Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Filter size={16} />
              Extraction Parameters
            </h3>

            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Entity Domain</label>
                <div className="grid grid-cols-1 gap-2">
                  <button 
                    onClick={() => setReportType('attendance')}
                    className={cn(
                      "text-left px-4 py-3 rounded-xl border text-sm font-semibold transition-all flex items-center justify-between",
                      reportType === 'attendance' ? "bg-slate-900 border-slate-900 text-white" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    <span>Attendance Records</span>
                    <BarChart3 size={16} />
                  </button>
                  <button 
                    onClick={() => setReportType('enrollment')}
                    className={cn(
                      "text-left px-4 py-3 rounded-xl border text-sm font-semibold transition-all flex items-center justify-between",
                      reportType === 'enrollment' ? "bg-slate-900 border-slate-900 text-white" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    <span>Course Enrollment</span>
                    <Database size={16} />
                  </button>
                </div>
              </div>

              {reportType === 'attendance' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Context Query</label>
                  <select 
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  >
                    <option value="all">Global (All Courses)</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </motion.div>
              )}

              <div className="pt-6 border-t border-slate-100 space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-2">Export Formats</p>
                <button 
                  disabled={loading}
                  onClick={() => generateReport('csv')}
                  className="w-full bg-white border border-slate-200 py-3 rounded-xl text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all border-b-2 active:border-b-0 active:translate-y-[1px] disabled:opacity-50"
                >
                  <Download size={14} className="text-slate-400" />
                  Extract CSV
                </button>
                <button 
                  disabled={loading}
                  onClick={() => generateReport('excel')}
                  className="w-full bg-white border border-slate-200 py-3 rounded-xl text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all border-b-2 active:border-b-0 active:translate-y-[1px] disabled:opacity-50"
                >
                  <FileText size={14} className="text-slate-400" />
                  Extract Excel
                </button>
                <button 
                  disabled={loading}
                  onClick={() => generateReport('pdf')}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 mt-4"
                >
                  <FileText size={14} />
                  Generate PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Report Preview / Status */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900 text-slate-400 p-12 flex flex-col items-center justify-center text-center rounded-3xl border border-slate-800 shadow-xl h-full min-h-[400px] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent"></div>
            <PieChart size={80} className="text-blue-500/20 mb-8 animate-pulse relative z-10" />
            <h2 className="text-2xl font-bold text-white mb-3 tracking-tight relative z-10">Data Processor Node <span className="text-blue-500">PRO</span></h2>
            <p className="max-w-xs text-xs font-mono opacity-50 uppercase tracking-[0.2em] relative z-10">
              Ready to process {reportType} telemetry. Select a destination format to initialize secure data extraction.
            </p>
            <div className="mt-8 flex gap-8 relative z-10 opacity-30 grayscale contrast-125">
              <BarChart3 size={32} />
              <Database size={32} />
              <FileDown size={32} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
