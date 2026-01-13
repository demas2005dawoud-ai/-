
import React, { useState, useMemo } from 'react';
import { AppState, Student, AttendanceStatus, Grade, Payment, EducationStage, PaymentStatus, Note } from '../types';
import GeminiAssistant from './GeminiAssistant';

interface Props {
  state: AppState;
  onUpdate: (newState: AppState) => void;
  onNotify: (title: string, message: string, phone?: string) => void;
  onAddStudent: (student: Omit<Student, 'id' | 'enrollmentDate'>) => void;
  onDeleteStudent: (id: string) => void;
  onUpdateStudent: (student: Student) => void;
  teacherPassword?: string;
  onUpdatePassword?: (pass: string) => void;
}

const GRADE_LEVELS = {
  primary: ['الصف الرابع الابتدائي', 'الصف الخامس الابتدائي', 'الصف السادس الابتدائي'],
  prep: ['الصف الأول الإعدادي', 'الصف الثاني الإعدادي', 'الصف الثالث الإعدادي']
};

const TeacherDashboard: React.FC<Props> = ({ 
  state, onUpdate, onNotify, onAddStudent, onDeleteStudent, onUpdateStudent, teacherPassword, onUpdatePassword 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'grades' | 'attendance' | 'payments' | 'broadcast' | 'reports' | 'ai' | 'security'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<'all' | EducationStage>('all');
  const [gradeLevelFilter, setGradeLevelFilter] = useState<string>('all');
  
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingProfile, setViewingProfile] = useState<Student | null>(null);
  
  const [newGrade, setNewGrade] = useState({ studentId: '', subject: 'تسميع دوري', score: '', total: '20', note: '' });
  const [newPayment, setNewPayment] = useState({ studentId: '', amount: '200', month: new Date().toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' }), status: 'paid' as PaymentStatus });
  const [newStudent, setNewStudent] = useState<Omit<Student, 'id' | 'enrollmentDate'>>({ name: '', parentPhone: '', stage: 'primary', gradeLevel: GRADE_LEVELS.primary[0] });
  
  const [broadcastTarget, setBroadcastTarget] = useState<'all' | EducationStage | string>('all');
  const [reportMonth, setReportMonth] = useState(new Date().toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' }));

  const alerts = useMemo(() => {
    const currentMonth = new Date().toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
    const studentsWithUnpaid = state.students.filter(s => {
      const payment = state.payments.find(p => p.studentId === s.id && p.month === currentMonth);
      return !payment || payment.status !== 'paid';
    });

    const studentsWithFrequentAbsence = state.students.filter(s => {
      const absences = state.attendance.filter(a => a.studentId === s.id && a.status === 'absent').length;
      return absences > 2;
    });

    return { unpaid: studentsWithUnpaid, absent: studentsWithFrequentAbsence };
  }, [state]);

  const stats = useMemo(() => {
    const totalStudents = state.students.length;
    const primaryCount = state.students.filter(s => s.stage === 'primary').length;
    const prepCount = state.students.filter(s => s.stage === 'prep').length;
    const totalPayments = state.payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);
    
    return { totalStudents, primaryCount, prepCount, totalPayments };
  }, [state]);

  const filteredStudents = useMemo(() => {
    return state.students.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.parentPhone.includes(searchTerm);
      const matchesStage = stageFilter === 'all' || s.stage === stageFilter;
      const matchesGrade = gradeLevelFilter === 'all' || s.gradeLevel === gradeLevelFilter;
      return matchesSearch && matchesStage && matchesGrade;
    });
  }, [state.students, searchTerm, stageFilter, gradeLevelFilter]);

  const handleAddGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGrade.studentId || !newGrade.score) return;
    const grade: Grade = { id: Date.now().toString(), studentId: newGrade.studentId, subject: newGrade.subject, score: Number(newGrade.score), total: Number(newGrade.total), date: new Date().toISOString().split('T')[0], type: 'quiz', note: newGrade.note };
    onUpdate({ ...state, grades: [grade, ...state.grades] });
    const student = state.students.find(s => s.id === newGrade.studentId);
    onNotify('تحديث درجات', `تحية طيبة من مستر داود 🌹\nتم رصد درجة التسميع للطالب ${student?.name}: ${newGrade.score}/${newGrade.total}.`, student?.parentPhone);
    setNewGrade({ ...newGrade, score: '', note: '' });
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayment.studentId) return;
    const payment: Payment = { id: Date.now().toString(), studentId: newPayment.studentId, amount: Number(newPayment.amount), month: newPayment.month, status: 'paid', dueDate: '', paidAt: new Date().toISOString().split('T')[0] };
    onUpdate({ ...state, payments: [payment, ...state.payments] });
    const student = state.students.find(s => s.id === newPayment.studentId);
    onNotify('تأكيد دفع', `تحية طيبة من مستر داود 🌹\nتم استلام اشتراك شهر ${newPayment.month} للطالب ${student?.name}. شكراً لكم.`, student?.parentPhone);
  };

  const markAttendance = (studentId: string, status: AttendanceStatus) => {
    const today = new Date().toISOString().split('T')[0];
    const student = state.students.find(s => s.id === studentId);
    let newAttendance = [...state.attendance];
    const idx = newAttendance.findIndex(a => a.studentId === studentId && a.date === today);
    if (idx >= 0) newAttendance[idx].status = status;
    else newAttendance.push({ id: Date.now().toString(), studentId, date: today, status });
    onUpdate({ ...state, attendance: newAttendance });
    onNotify('الحضور والغياب', `تحية طيبة من مستر داود 🌹\nالطالب ${student?.name} ${status === 'present' ? 'حاضر اليوم ✅' : 'غائب اليوم ❌'}.`, student?.parentPhone);
  };

  const handleUpdateStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      onUpdateStudent(editingStudent);
      setEditingStudent(null);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* منطقة الطباعة - تظهر فقط عند الطباعة */}
      {viewingProfile && (
        <div className="print-container">
          <div className="print-header">
            <h1>تقرير متابعة الطالب: {viewingProfile.name}</h1>
            <p>{viewingProfile.gradeLevel} | تاريخ التقرير: {new Date().toLocaleDateString('ar-EG')}</p>
          </div>
          <h3>سجل درجات التسميع</h3>
          <table>
            <thead><tr><th>التاريخ</th><th>الموضوع</th><th>الدرجة</th></tr></thead>
            <tbody>{state.grades.filter(g=>g.studentId===viewingProfile.id).map(g=><tr key={g.id}><td>{g.date}</td><td>{g.subject}</td><td>{g.score}/{g.total}</td></tr>)}</tbody>
          </table>
          <h3>سجل الحضور</h3>
          <table>
            <thead><tr><th>التاريخ</th><th>الحالة</th></tr></thead>
            <tbody>{state.attendance.filter(a=>a.studentId===viewingProfile.id).map(a=><tr key={a.id}><td>{a.date}</td><td>{a.status==='present'?'حاضر':'غائب'}</td></tr>)}</tbody>
          </table>
          <h3>سجل الاشتراكات</h3>
          <table>
            <thead><tr><th>الشهر</th><th>المبلغ</th><th>الحالة</th></tr></thead>
            <tbody>{state.payments.filter(p=>p.studentId===viewingProfile.id).map(p=><tr key={p.id}><td>{p.month}</td><td>{p.amount} ج.م</td><td>مدفوع</td></tr>)}</tbody>
          </table>
        </div>
      )}

      <aside className="w-full md:w-64 space-y-2 no-print">
        {[
          { id: 'overview', label: 'الرئيسية', icon: '📊' },
          { id: 'students', label: 'الطلاب', icon: '👥' },
          { id: 'grades', label: 'التسميع', icon: '📝' },
          { id: 'attendance', label: 'الحضور', icon: '📅' },
          { id: 'payments', label: 'الاشتراكات', icon: '💰' },
          { id: 'reports', label: 'التقارير', icon: '📄' },
          { id: 'ai', label: 'المساعد الذكي', icon: '🤖' },
          { id: 'security', label: 'الأمان', icon: '🔐' },
        ].map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full text-right flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-indigo-50'}`}>
            <span>{item.icon}</span> {item.label}
          </button>
        ))}
      </aside>

      <div className="flex-grow space-y-6 no-print">
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in">
            {(alerts.unpaid.length > 0 || alerts.absent.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {alerts.unpaid.length > 0 && (
                  <div className="bg-red-50 border-r-8 border-red-500 p-6 rounded-3xl shadow-sm">
                    <h5 className="text-red-700 font-black mb-2">⚠️ تنبيه اشتراكات ({alerts.unpaid.length})</h5>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {alerts.unpaid.map(s => <p key={s.id} className="text-xs text-red-600 font-bold">• {s.name}</p>)}
                    </div>
                  </div>
                )}
                {alerts.absent.length > 0 && (
                  <div className="bg-amber-50 border-r-8 border-amber-500 p-6 rounded-3xl shadow-sm">
                    <h5 className="text-amber-700 font-black mb-2">⚠️ غياب متكرر ({alerts.absent.length})</h5>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {alerts.absent.map(s => <p key={s.id} className="text-xs text-amber-600 font-bold">• {s.name}</p>)}
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              <div className="bg-white p-6 rounded-3xl shadow-sm border-r-8 border-indigo-600">
                <p className="text-xs font-bold text-gray-400">إجمالي الطلاب</p>
                <h4 className="text-3xl font-black">{stats.totalStudents}</h4>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border-r-8 border-blue-500">
                <p className="text-xs font-bold text-gray-400">ابتدائي</p>
                <h4 className="text-3xl font-black">{stats.primaryCount}</h4>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border-r-8 border-purple-500">
                <p className="text-xs font-bold text-gray-400">إعدادي</p>
                <h4 className="text-3xl font-black">{stats.prepCount}</h4>
              </div>
              <div className="bg-green-50 p-6 rounded-3xl shadow-sm border-r-8 border-green-600">
                <p className="text-xs font-bold text-green-700">الإيرادات</p>
                <h4 className="text-3xl font-black text-green-700">{stats.totalPayments}</h4>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black">قائمة الطلاب</h3>
                <button onClick={() => setIsAddingStudent(!isAddingStudent)} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-black">طالب جديد +</button>
             </div>
             
             <div className="flex items-center gap-4 mb-6 bg-gray-50 p-3 rounded-2xl border">
               <span className="text-gray-400">🔍</span>
               <input type="text" placeholder="بحث باسم الطالب..." className="flex-grow outline-none bg-transparent font-bold" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
             </div>

             {isAddingStudent && (
               <form onSubmit={(e) => { e.preventDefault(); onAddStudent(newStudent); setIsAddingStudent(false); }} className="mb-8 p-6 bg-indigo-50 rounded-2xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in zoom-in">
                 <input type="text" placeholder="الاسم" className="p-3 rounded-xl border bg-white outline-none" value={newStudent.name} onChange={e=>setNewStudent({...newStudent, name:e.target.value})} required />
                 <input type="tel" placeholder="رقم الهاتف" className="p-3 rounded-xl border bg-white outline-none" value={newStudent.parentPhone} onChange={e=>setNewStudent({...newStudent, parentPhone:e.target.value})} required />
                 <select className="p-3 rounded-xl border bg-white font-bold" value={newStudent.stage} onChange={e=>{const s=e.target.value as EducationStage; setNewStudent({...newStudent, stage:s, gradeLevel:GRADE_LEVELS[s][0]})}}>
                   <option value="primary">ابتدائي</option><option value="prep">إعدادي</option>
                 </select>
                 <select className="p-3 rounded-xl border bg-white font-bold" value={newStudent.gradeLevel} onChange={e=>setNewStudent({...newStudent, gradeLevel:e.target.value})}>
                   {GRADE_LEVELS[newStudent.stage as EducationStage].map(g=><option key={g} value={g}>{g}</option>)}
                 </select>
                 <button type="submit" className="lg:col-span-4 bg-indigo-600 text-white font-black py-3 rounded-xl">إضافة الطالب</button>
               </form>
             )}

             <div className="overflow-x-auto">
               <table className="w-full text-right">
                 <thead><tr className="border-b text-gray-400 text-xs font-black"><th className="pb-4">الاسم</th><th className="pb-4">الصف</th><th className="pb-4 text-center">الإجراءات</th></tr></thead>
                 <tbody className="divide-y">
                   {filteredStudents.map(s => (
                     <tr key={s.id} className="hover:bg-gray-50">
                       <td className="py-4 font-black text-indigo-700 cursor-pointer" onClick={()=>setViewingProfile(s)}>{s.name}</td>
                       <td className="py-4 text-xs font-bold">{s.gradeLevel}</td>
                       <td className="py-4 flex justify-center gap-2">
                         <button onClick={()=>setEditingStudent(s)} className="p-2 bg-indigo-50 rounded-lg" title="تعديل">✏️</button>
                         <button onClick={()=>onDeleteStudent(s.id)} className="p-2 bg-red-50 text-red-500 rounded-lg" title="حذف">🗑️</button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        {editingStudent && (
          <div className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <form onSubmit={handleUpdateStudentSubmit} className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 space-y-6 shadow-2xl animate-in zoom-in">
              <h3 className="text-2xl font-black text-indigo-900">تعديل بيانات الطالب</h3>
              <div className="space-y-4">
                <input type="text" className="w-full p-4 rounded-2xl border bg-gray-50 font-bold" value={editingStudent.name} onChange={e=>setEditingStudent({...editingStudent, name:e.target.value})} />
                <input type="tel" className="w-full p-4 rounded-2xl border bg-gray-50 font-mono" value={editingStudent.parentPhone} onChange={e=>setEditingStudent({...editingStudent, parentPhone:e.target.value})} />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex-grow bg-indigo-600 text-white font-black py-4 rounded-2xl">حفظ التغييرات</button>
                <button type="button" onClick={()=>setEditingStudent(null)} className="px-8 bg-gray-100 rounded-2xl font-bold">إلغاء</button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'ai' && <GeminiAssistant state={state} />}
        
        {activeTab === 'grades' && (
           <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border animate-in slide-in-from-bottom-4">
              <h3 className="text-xl font-black mb-6">رصد درجة تسميع 📝</h3>
              <form onSubmit={handleAddGrade} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <select className="p-4 rounded-xl border bg-gray-50 outline-none font-bold" value={newGrade.studentId} onChange={e=>setNewGrade({...newGrade, studentId:e.target.value})} required>
                    <option value="">اختر الطالب</option>
                    {state.students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <input type="text" placeholder="الموضوع" className="p-4 rounded-xl border bg-gray-50" value={newGrade.subject} onChange={e=>setNewGrade({...newGrade, subject:e.target.value})} />
                  <div className="flex gap-2">
                    <input type="number" placeholder="الدرجة" className="w-full p-4 rounded-xl border bg-gray-50 font-bold text-center" value={newGrade.score} onChange={e=>setNewGrade({...newGrade, score:e.target.value})} required />
                    <input type="number" placeholder="من" className="w-24 p-4 rounded-xl border bg-gray-50 font-bold text-center" value={newGrade.total} onChange={e=>setNewGrade({...newGrade, total:e.target.value})} />
                  </div>
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white font-black py-4 rounded-xl shadow-lg">حفظ النتيجة ✅</button>
              </form>
           </div>
        )}

        {activeTab === 'attendance' && (
           <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border animate-in slide-in-from-bottom-4">
              <h3 className="text-xl font-black mb-8 text-center">كشف الحضور والغياب اليومي 📅</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStudents.map(s => {
                  const today = new Date().toISOString().split('T')[0];
                  const status = state.attendance.find(a => a.studentId === s.id && a.date === today)?.status;
                  return (
                    <div key={s.id} className="p-4 bg-gray-50 rounded-2xl flex flex-col gap-4 border border-transparent shadow-sm">
                      <p className="font-bold text-gray-800 text-center">{s.name}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => markAttendance(s.id, 'present')} className={`py-2 rounded-xl text-sm font-black transition-all ${status === 'present' ? 'bg-green-600 text-white' : 'bg-white border text-green-600'}`}>حاضر</button>
                        <button onClick={() => markAttendance(s.id, 'absent')} className={`py-2 rounded-xl text-sm font-black transition-all ${status === 'absent' ? 'bg-red-600 text-white' : 'bg-white border text-red-600'}`}>غائب</button>
                      </div>
                    </div>
                  );
                })}
              </div>
           </div>
        )}

        {activeTab === 'payments' && (
           <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border animate-in slide-in-from-bottom-4">
              <h3 className="text-xl font-black mb-6">تسجيل الاشتراكات الشهرية 💰</h3>
              <form onSubmit={handleAddPayment} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <select className="p-4 rounded-xl border bg-gray-50 lg:col-span-2 outline-none font-bold" value={newPayment.studentId} onChange={e=>setNewPayment({...newPayment, studentId:e.target.value})} required>
                  <option value="">اختر الطالب</option>
                  {state.students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <input type="number" placeholder="المبلغ" className="p-4 rounded-xl border bg-gray-50 text-center font-bold" value={newPayment.amount} onChange={e=>setNewPayment({...newPayment, amount:e.target.value})} required />
                <button type="submit" className="bg-green-600 text-white font-black py-4 rounded-xl shadow-lg">تأكيد السداد</button>
              </form>
           </div>
        )}

        {/* Student Detail Modal */}
        {viewingProfile && (
          <div className="fixed inset-0 z-[400] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 no-print">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in">
              <div className="bg-indigo-700 p-8 text-white flex justify-between items-center">
                <h3 className="text-2xl font-black">{viewingProfile.name}</h3>
                <div className="flex gap-2">
                  <button onClick={() => window.print()} className="bg-white text-indigo-700 p-3 rounded-full hover:bg-indigo-50 shadow-md">🖨️ طباعة</button>
                  <button onClick={() => setViewingProfile(null)} className="bg-white/20 p-3 rounded-full hover:bg-white/40 text-xl transition-colors">✕</button>
                </div>
              </div>
              <div className="flex-grow overflow-y-auto p-8 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                   <div className="bg-indigo-50 p-4 rounded-2xl text-center">
                      <p className="text-xs text-indigo-400 font-bold">إجمالي الدرجات</p>
                      <p className="text-2xl font-black text-indigo-700">{state.grades.filter(g=>g.studentId===viewingProfile.id).reduce((a,b)=>a+b.score,0)}</p>
                   </div>
                   <div className="bg-green-50 p-4 rounded-2xl text-center">
                      <p className="text-xs text-green-400 font-bold">أيام الحضور</p>
                      <p className="text-2xl font-black text-green-700">{state.attendance.filter(a=>a.studentId===viewingProfile.id && a.status==='present').length}</p>
                   </div>
                   <div className="bg-amber-50 p-4 rounded-2xl text-center">
                      <p className="text-xs text-amber-400 font-bold">الاشتراكات</p>
                      <p className="text-2xl font-black text-amber-700">{state.payments.filter(p=>p.studentId===viewingProfile.id).length}</p>
                   </div>
                </div>
                {/* Tables inside modal */}
                <div className="space-y-4">
                  <h4 className="font-black text-gray-700 border-b pb-2">سجل التسميع</h4>
                  {state.grades.filter(g=>g.studentId===viewingProfile.id).map(g=>(
                    <div key={g.id} className="flex justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="font-bold">{g.subject}</span>
                      <span className="text-gray-400">{g.date}</span>
                      <span className="font-black text-indigo-600">{g.score}/{g.total}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
