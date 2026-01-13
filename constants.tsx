
import { Student, Grade, Attendance, Payment } from './types';

export const INITIAL_STUDENTS: Student[] = [
  { id: '1', name: 'أحمد محمد علي', parentPhone: '01012345678', stage: 'primary', gradeLevel: 'الصف الرابع الابتدائي', enrollmentDate: '2023-09-01' },
  { id: '2', name: 'سارة محمود حسن', parentPhone: '01122334455', stage: 'primary', gradeLevel: 'الصف الخامس الابتدائي', enrollmentDate: '2023-09-02' },
  { id: '3', name: 'ياسين كمال', parentPhone: '01299887766', stage: 'prep', gradeLevel: 'الصف الأول الإعدادي', enrollmentDate: '2023-09-05' },
  { id: '4', name: 'ليلى إبراهيم', parentPhone: '01055667788', stage: 'prep', gradeLevel: 'الصف الثاني الإعدادي', enrollmentDate: '2023-09-10' },
  { id: '5', name: 'يوسف هاني', parentPhone: '01200001111', stage: 'primary', gradeLevel: 'الصف السادس الابتدائي', enrollmentDate: '2023-09-12' },
];

export const INITIAL_GRADES: Grade[] = [
  { id: 'g1', studentId: '1', subject: 'رياضيات', score: 18, total: 20, date: '2023-10-15', type: 'quiz' },
  { id: 'g2', studentId: '2', subject: 'رياضيات', score: 15, total: 20, date: '2023-10-15', type: 'quiz' },
  { id: 'g3', studentId: '3', subject: 'رياضيات', score: 19, total: 20, date: '2023-11-05', type: 'quiz' },
];

export const INITIAL_ATTENDANCE: Attendance[] = [
  { id: 'a1', studentId: '1', date: '2023-10-20', status: 'present' },
  { id: 'a2', studentId: '2', date: '2023-10-20', status: 'absent' },
  { id: 'a3', studentId: '3', date: '2023-10-20', status: 'present' },
];

export const INITIAL_PAYMENTS: Payment[] = [
  { id: 'p1', studentId: '1', month: 'أكتوبر 2023', status: 'paid', amount: 200, paidAt: '2023-10-01', dueDate: '2023-10-05', paymentMethod: 'نقدي' },
  { id: 'p2', studentId: '2', month: 'أكتوبر 2023', status: 'unpaid', amount: 200, dueDate: '2023-10-05' },
  { id: 'p3', studentId: '3', month: 'أكتوبر 2023', status: 'paid', amount: 250, paidAt: '2023-10-02', dueDate: '2023-10-05', paymentMethod: 'فودافون كاش' },
];
