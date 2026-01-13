
export type AttendanceStatus = 'present' | 'absent' | 'late';
export type PaymentStatus = 'paid' | 'unpaid' | 'overdue';
export type EducationStage = 'primary' | 'prep';

export interface Grade {
  id: string;
  studentId: string;
  subject: string;
  score: number;
  total: number;
  date: string;
  type: 'quiz' | 'exam';
  note?: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  date: string;
  status: AttendanceStatus;
}

export interface Payment {
  id: string;
  studentId: string;
  month: string;
  status: PaymentStatus;
  amount: number;
  paidAt?: string;
  dueDate: string;
  paymentMethod?: string;
}

export interface Note {
  id: string;
  studentId: string;
  date: string;
  content: string;
  teacherName?: string;
}

export interface Student {
  id: string;
  name: string;
  parentPhone: string;
  stage: EducationStage;
  gradeLevel: string;
  enrollmentDate: string;
}

export interface AppState {
  students: Student[];
  grades: Grade[];
  attendance: Attendance[];
  payments: Payment[];
  notes: Note[];
}
