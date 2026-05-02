import { collection, query, where, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Course, AttendanceRecord, AppUser } from '../types';

export const courseService = {
  async getCourses() {
    const q = query(collection(db, 'courses'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
  },

  async getCoursesByTeacher(teacherId: string) {
    const q = query(collection(db, 'courses'), where('teacherId', '==', teacherId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
  },

  async getCoursesByStudent(studentId: string) {
    const q = query(collection(db, 'courses'), where('studentIds', 'array-contains', studentId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
  },

  async createCourse(data: Omit<Course, 'id'>) {
    const ref = doc(collection(db, 'courses'));
    await setDoc(ref, { id: ref.id, ...data });
    // Update teacher profile
    await updateDoc(doc(db, 'users', data.teacherId), {
      teachingCourseIds: arrayUnion(ref.id)
    });
    return ref.id;
  },

  async enrollStudent(courseId: string, studentId: string) {
    await updateDoc(doc(db, 'courses', courseId), {
      studentIds: arrayUnion(studentId)
    });
    await updateDoc(doc(db, 'users', studentId), {
      enrolledCourseIds: arrayUnion(courseId)
    });
  },

  async dropStudent(courseId: string, studentId: string) {
    await updateDoc(doc(db, 'courses', courseId), {
      studentIds: arrayRemove(studentId)
    });
    await updateDoc(doc(db, 'users', studentId), {
      enrolledCourseIds: arrayRemove(courseId)
    });
  }
};

export const attendanceService = {
  async markAttendance(record: Omit<AttendanceRecord, 'id'>) {
    const id = `${record.courseId}_${record.studentId}_${record.date}`;
    const ref = doc(db, 'attendance', id);
    await setDoc(ref, { id, ...record });
  },

  async getAttendanceByCourse(courseId: string, date?: string) {
    let q = query(collection(db, 'attendance'), where('courseId', '==', courseId));
    if (date) {
      q = query(q, where('date', '==', date));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as AttendanceRecord);
  },

  async getAttendanceByStudent(studentId: string, startDate?: string, endDate?: string) {
    let q = query(collection(db, 'attendance'), where('studentId', '==', studentId));
    const snapshot = await getDocs(q);
    let records = snapshot.docs.map(doc => doc.data() as AttendanceRecord);
    
    if (startDate) {
      records = records.filter(r => r.date >= startDate);
    }
    if (endDate) {
      records = records.filter(r => r.date <= endDate);
    }
    return records;
  }
};

export const userService = {
  async getAllStudents() {
    const q = query(collection(db, 'users'), where('role', '==', 'student'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as AppUser);
  }
};
