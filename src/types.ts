export type UserRole = 'student' | 'teacher' | 'admin';

export interface AppUser {
  uid: string;
  email: string;
  role: UserRole;
  displayName: string;
  avatarUrl?: string;
  preferredLanguage?: string;
  enrolledCourseIds?: string[];
  teachingCourseIds?: string[];
  createdAt: string;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  teacherId: string;
  studentIds: string[];
  createdAt: string;
}

export type AttendanceStatus = 'present' | 'late' | 'absent';

export interface AttendanceRecord {
  id: string;
  courseId: string;
  studentId: string;
  date: string; // ISO Date YYYY-MM-DD
  status: AttendanceStatus;
  markedBy: string;
  timestamp: string;
}

export interface SystemSettings {
  adminRegistrationCode: string;
  allowedLanguages: string[];
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: any;
}
