import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          dashboard: 'Dashboard',
          attendance: 'Attendance',
          courses: 'Courses',
          reports: 'Reports',
          profile: 'Profile',
          settings: 'Settings',
          logout: 'Logout',
          login: 'Login',
          register: 'Register',
          present: 'Present',
          late: 'Late',
          absent: 'Absent',
          mark_attendance: 'Mark Attendance',
          student_list: 'Student List',
          enroll_student: 'Enroll Student',
          audit_logs: 'Audit Logs',
          admin_panel: 'Admin Panel',
          language: 'Language',
          en: 'English',
          es: 'Español',
          fr: 'Français',
        },
      },
      es: {
        translation: {
          dashboard: 'Tablero',
          attendance: 'Asistencia',
          courses: 'Cursos',
          reports: 'Reportes',
          profile: 'Perfil',
          settings: 'Configuración',
          logout: 'Cerrar Sesión',
          login: 'Iniciar Sesión',
          register: 'Registrarse',
          present: 'Presente',
          late: 'Tarde',
          absent: 'Ausente',
          mark_attendance: 'Marcar Asistencia',
          student_list: 'Lista de Estudiantes',
          enroll_student: 'Inscribir Estudiante',
          audit_logs: 'Registros de Auditoría',
          admin_panel: 'Panel de Administración',
          language: 'Idioma',
          en: 'Inglés',
          es: 'Español',
          fr: 'Francés',
        },
      },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
