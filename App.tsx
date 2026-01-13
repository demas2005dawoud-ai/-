
import React, { useState, useMemo } from 'react';
import Layout from './components/Layout';
import TeacherDashboard from './components/TeacherDashboard';
import ParentPortal from './components/ParentPortal';
import { AppState, Student } from './types';
import { INITIAL_STUDENTS, INITIAL_GRADES, INITIAL_ATTENDANCE, INITIAL_PAYMENTS } from './constants';

const App: React.FC = () => {
  const [userType, setUserType] = useState<'teacher' | 'parent' | null>(null);
  const [isTeacherAuthenticated, setIsTeacherAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [teacherPassword, setTeacherPassword] = useState("20+1146801121");
  
  const [appState, setAppState] = useState<AppState>({
    students: INITIAL_STUDENTS,
    grades: INITIAL_GRADES,
    attendance: INITIAL_ATTENDANCE,
    payments: INITIAL_PAYMENTS,
    notes: [
      { id: 'n1', studentId: '1', date: '2023-11-20', content: 'أداء ممتاز اليوم في الحصة ومشاركة فعالة.', teacherName: 'مستر داود' }
    ],
  });

  const [notifications, setNotifications] = useState<{title: string, message: string, phone?: string}[]>([]);

  const hallOfFame = useMemo(() => {
    const studentAverages = appState.students.map(s => {
      const sGrades = appState.grades.filter(g => g.studentId === s.id);
      if (sGrades.length === 0) return { ...s, avg: 0 };
      const totalScore = sGrades.reduce((acc, curr) => acc + curr.score, 0);
      const totalMax = sGrades.reduce((acc, curr) => acc + curr.total, 0);
      return { ...s, avg: (totalScore / totalMax) * 100 };
    });
    return studentAverages.sort((a, b) => b.avg - a.avg).slice(0, 3);
  }, [appState.students, appState.grades]);

  const sendWhatsApp = (phone: string, message: string) => {
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '2' + cleanPhone; 
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const addNotification = (title: string, message: string, phone?: string) => {
    setNotifications(prev => [{ title, message, phone }, ...prev].slice(0, 5));
  };

  const handleUpdateState = (newState: AppState) => setAppState(newState);

  const handleAddStudent = (student: Omit<Student, 'id' | 'enrollmentDate'>) => {
    const newStudent: Student = {
      ...student,
      id: Date.now().toString(),
      enrollmentDate: new Date().toISOString().split('T')[0]
    };
    setAppState(prev => ({ ...prev, students: [...prev.students, newStudent] }));
  };

  const handleDeleteStudent = (id: string) => {
    if(!confirm('هل أنت متأكد من حذف هذا الطالب نهائياً؟')) return;
    setAppState(prev => ({
      ...prev,
      students: prev.students.filter(s => s.id !== id),
      grades: prev.grades.filter(g => g.studentId !== id),
      attendance: prev.attendance.filter(a => a.studentId !== id),
      payments: prev.payments.filter(p => p.studentId !== id),
      notes: prev.notes.filter(n => n.studentId !== id)
    }));
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setAppState(prev => ({
      ...prev,
      students: prev.students.map(s => s.id === updatedStudent.id ? updatedStudent : s)
    }));
  };

  const handleLogout = () => {
    setUserType(null);
    setIsTeacherAuthenticated(false);
    setPasswordInput('');
  };

  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === teacherPassword) {
      setIsTeacherAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('كلمة السر غير صحيحة');
    }
  };

  if (!userType) {
    return (
      <Layout userType={null} onLogout={() => {}} onSelectRole={setUserType}>
        <div className="max-w-5xl mx-auto py-8">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-black text-indigo-900 mb-8 flex items-center justify-center gap-3 animate-pulse">
              👑 لوحة شرف المتميزين 👑
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {hallOfFame.map((student, idx) => (
                <div key={student.id} className={`p-8 rounded-[2.5rem] shadow-xl border-t-8 transition-all hover:scale-105 ${
                  idx === 0 ? 'bg-amber-50 border-amber-400 scale-110 z-10' : 
                  idx === 1 ? 'bg-gray-50 border-gray-300' : 
                  'bg-orange-50 border-orange-300'
                }`}>
                  <div className="text-5xl mb-4">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</div>
                  <h3 className="text-xl font-black text-gray-800">{student.name}</h3>
                  <p className="text-sm text-gray-500 font-bold mt-1">{student.gradeLevel}</p>
                  <div className="mt-4 inline-block bg-white px-4 py-1 rounded-full text-xs font-black text-indigo-600 shadow-sm">
                    المستوى: {student.avg.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          <h2 className="text-2xl font-black text-center text-gray-800 mb-8">اختر نوع الدخول</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <button onClick={() => setUserType('teacher')} className="bg-white p-10 rounded-[2.5rem] shadow-xl border-2 border-transparent hover:border-indigo-500 transition-all group">
              <div className="text-6xl mb-4 group-hover:rotate-12 transition-transform">👨‍🏫</div>
              <h3 className="text-xl font-black text-indigo-700">دخول المعلم</h3>
            </button>
            <button onClick={() => setUserType('parent')} className="bg-white p-10 rounded-[2.5rem] shadow-xl border-2 border-transparent hover:border-indigo-500 transition-all group">
              <div className="text-6xl mb-4 group-hover:bounce transition-transform">👪</div>
              <h3 className="text-xl font-black text-indigo-700">بوابة ولي الأمر</h3>
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (userType === 'teacher' && !isTeacherAuthenticated) {
    return (
      <Layout userType={null} onLogout={handleLogout} onSelectRole={setUserType}>
        <div className="max-w-md mx-auto py-12">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl border text-center">
            <div className="text-5xl mb-6">🔒</div>
            <h2 className="text-2xl font-bold mb-8">منطقة خاصة بالمعلم</h2>
            <form onSubmit={handleTeacherLogin} className="space-y-6 text-right">
              <label className="block text-sm font-bold mr-1">كلمة المرور</label>
              <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-indigo-500 outline-none text-center text-xl" autoFocus />
              {passwordError && <p className="text-red-500 text-sm font-bold">{passwordError}</p>}
              <button type="submit" className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-indigo-700 transition-all">دخول</button>
            </form>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout userType={userType} onLogout={handleLogout} onSelectRole={setUserType}>
      {userType === 'teacher' ? (
        <TeacherDashboard 
          state={appState} 
          onUpdate={handleUpdateState} 
          onNotify={addNotification}
          onAddStudent={handleAddStudent}
          onDeleteStudent={handleDeleteStudent}
          onUpdateStudent={handleUpdateStudent}
          teacherPassword={teacherPassword}
          onUpdatePassword={setTeacherPassword}
        />
      ) : (
        <ParentPortal state={appState} teacherPassword={teacherPassword} />
      )}

      {notifications.length > 0 && (
        <div className="fixed bottom-4 right-4 z-[200] space-y-3 no-print">
          {notifications.map((n, i) => (
            <div key={i} className="bg-white border-r-4 border-green-500 p-4 rounded-xl shadow-2xl animate-in slide-in-from-right-full">
              <p className="font-bold text-sm">{n.title}</p>
              <p className="text-xs text-gray-500 mb-2 whitespace-pre-wrap">{n.message}</p>
              {n.phone && (
                <button onClick={() => sendWhatsApp(n.phone!, n.message)} className="w-full bg-green-500 text-white text-xs font-bold py-2 rounded-lg">إرسال واتساب 📱</button>
              )}
              <button onClick={() => setNotifications(prev => prev.filter((_, idx) => idx !== i))} className="absolute -top-2 -left-2 bg-gray-200 rounded-full w-5 h-5 text-[10px] flex items-center justify-center">✕</button>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default App;
