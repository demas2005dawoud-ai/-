
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  userType: 'teacher' | 'parent' | null;
  onLogout: () => void;
  onSelectRole: (role: 'teacher' | 'parent') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, userType, onLogout, onSelectRole }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-indigo-700 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2 space-x-reverse cursor-pointer" onClick={() => onSelectRole(null as any)}>
            <div className="bg-white p-2 rounded-lg text-indigo-700 font-bold text-xl">داود</div>
            <h1 className="text-xl font-bold">منصة مستر داود</h1>
          </div>
          
          {userType && (
            <div className="flex items-center gap-4">
              <span className="text-sm bg-indigo-600 px-3 py-1 rounded-full border border-indigo-400">
                {userType === 'teacher' ? 'لوحة المعلم' : 'بوابة ولي الأمر'}
              </span>
              <button 
                onClick={onLogout}
                className="text-sm hover:underline font-medium"
              >
                تسجيل الخروج
              </button>
            </div>
          )}
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      
      <footer className="bg-white border-t py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; 2024 منصة مستر داود الذكية - جميع الحقوق محفوظة
        </div>
      </footer>
    </div>
  );
};

export default Layout;
