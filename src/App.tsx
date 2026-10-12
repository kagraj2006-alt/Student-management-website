import { useState } from 'react';
import { Menu } from 'lucide-react';
import type { Page } from '@/types';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/pages/Dashboard';
import { StudentsList } from '@/pages/StudentsList';
import { StudentProfile } from '@/pages/StudentProfile';
import { CoursesPage } from '@/pages/CoursesPage';
import { SubjectsPage } from '@/pages/SubjectsPage';

function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  function navigate(p: Page) {
    setPage(p);
  }

  function viewStudent(id: string) {
    setSelectedStudentId(id);
    setPage('student-profile');
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        current={page}
        onNavigate={navigate}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold text-slate-800">EduManage</span>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {page === 'dashboard' && (
            <Dashboard onNavigate={navigate} onViewStudent={viewStudent} />
          )}
          {page === 'students' && <StudentsList onViewStudent={viewStudent} />}
          {page === 'student-profile' && selectedStudentId && (
            <StudentProfile
              studentId={selectedStudentId}
              onBack={() => {
                setSelectedStudentId(null);
                setPage('students');
              }}
            />
          )}
          {page === 'courses' && <CoursesPage />}
          {page === 'subjects' && <SubjectsPage />}
        </main>
      </div>
    </div>
  );
}

export default App;
