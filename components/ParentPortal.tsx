
import React, { useState, useMemo } from 'react';
import { AppState, Student } from '../types';

interface Props {
  state: AppState;
  teacherPassword?: string;
}

const ParentPortal: React.FC<Props> = ({ state }) => {
  const [phone, setPhone] = useState('');
  const [student, setStudent] = useState<Student | null>(null);
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState<'overview' | 'grades' | 'attendance' | 'payments' | 'notes'>('overview');
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = state.students.find(s => s.parentPhone === phone);
    if (found) { setStudent(found); setError(''); }
    else { setError('هذا الرقم غير مسجل لدينا.'); }
  };

  if (!student) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border text-center">
          <h2 className="text-2xl font-black mb-8">بوابة ولي الأمر</h2>
          <form onSubmit={handleLogin} className="space-y-4 text-center">
            <input type="tel" placeholder="رقم الهاتف المسجل" className="w-full p-4 rounded-2xl border-2 text-center text-xl" value={phone} onChange={e=>setPhone(e.target.value)} required />
            {error && <p className="text-red-500 font-bold">{error}</p>}
            <button type="submit" className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl">دخول</button>
          </form>
        </div>
      </div>
    );
  }

  const grades = state.grades.filter(g => g.studentId === student.id).sort((a,b)=>b.date.localeCompare(a.date));
  const att = state.attendance.filter(a => a.studentId === student.id).sort((a,b)=>b.date.localeCompare(a.date));
  const pay = state.payments.filter(p => p.studentId === student.id).sort((a,b)=>b.month.localeCompare(a.month));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-indigo-900 text-white p-8 rounded-[2.5rem] flex justify-between items-center shadow-xl">
        <div><h2 className="text-2xl font-black">{student.name}</h2><p className="opacity-70">{student.gradeLevel}</p></div>
        <button onClick={()=>setStudent(null)} className="text-2xl">🚪</button>
      </div>
      <div className="flex bg-white p-2 rounded-2xl shadow-sm border overflow-x-auto gap-2">
        {['overview', 'grades', 'attendance', 'payments', 'notes'].map(v => (
          <button key={v} onClick={()=>setActiveView(v as any)} className={`px-6 py-2 rounded-xl font-black text-xs whitespace-nowrap transition-all ${activeView===v ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}>
            {v === 'overview' ? 'الرئيسية' : v === 'grades' ? 'الدرجات' : v === 'attendance' ? 'الحضور' : v === 'payments' ? 'الاشتراكات' : 'ملاحظات المعلم'}
          </button>
        ))}
      </div>
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border">
        {activeView === 'grades' && (
          <div className="space-y-3">
            {grades.map(g => (
              <div key={g.id} className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center border-r-4 border-indigo-500">
                <div><p className="font-black">{g.subject}</p><p className="text-[10px] text-gray-400">{g.date}</p></div>
                <div className="text-xl font-black text-indigo-600">{g.score}/{g.total}</div>
              </div>
            ))}
          </div>
        )}
        {activeView === 'attendance' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {att.map(a => (
              <div key={a.id} className={`p-4 rounded-2xl border text-center ${a.status==='present' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                <p className="text-[10px] font-bold">{a.date}</p>
                <p className="font-black">{a.status==='present' ? 'حاضر' : 'غائب'}</p>
              </div>
            ))}
          </div>
        )}
        {activeView === 'payments' && (
          <div className="space-y-3">
            {pay.map(p => (
              <div key={p.id} className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center border-r-4 border-amber-500">
                <p className="font-black">{p.month}</p>
                <p className="font-black text-green-600">{p.amount} ج.م (تم الدفع ✅)</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentPortal;
