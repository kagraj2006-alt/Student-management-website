import { useEffect, useState } from 'react';
import { Eye, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { StudentWithCourse, Course } from '@/types';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { SearchInput } from '@/components/ui/SearchInput';
import { StudentFormModal } from '@/components/students/StudentFormModal';

interface StudentsListProps {
  onViewStudent: (id: string) => void;
}

export function StudentsList({ onViewStudent }: StudentsListProps) {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentWithCourse[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  async function loadData() {
    setLoading(true);
    const [s, c] = await Promise.all([
      supabase
        .from('students')
        .select('*, course:courses(id, course_name, course_id)')
        .order('name'),
      supabase.from('courses').select('*'),
    ]);
    if (s.data) setStudents(s.data as unknown as StudentWithCourse[]);
    if (c.data) setCourses(c.data);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.student_id.toLowerCase().includes(q) ||
      s.enrollment_number.toLowerCase().includes(q) ||
      (s.course?.course_name || '').toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    );
  });

  if (loading) return <FullPageSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Students</h1>
          <p className="text-slate-500 mt-1">
            {students.length} {students.length === 1 ? 'student' : 'students'} enrolled
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Student
        </button>
      </div>

      <div className="card p-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, ID, enrollment number, email, or course..."
        />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                  Student
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                  Student ID
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 hidden md:table-cell">
                  Enrollment No.
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 hidden lg:table-cell">
                  Course
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">
                  Semester
                </th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={student.name} photoUrl={student.photo_url} size="sm" />
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 text-sm truncate">
                          {student.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="text-sm font-mono text-slate-600">{student.student_id}</span>
                  </td>
                  <td className="px-6 py-3.5 hidden md:table-cell">
                    <span className="text-sm font-mono text-slate-600">
                      {student.enrollment_number}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 hidden lg:table-cell">
                    {student.course ? (
                      <Badge color="blue">{student.course.course_name}</Badge>
                    ) : (
                      <span className="text-sm text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-3.5 hidden sm:table-cell">
                    <Badge color="slate">Sem {student.semester}</Badge>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <button
                      onClick={() => onViewStudent(student.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-slate-400 text-sm">
              {search ? 'No students match your search.' : 'No students yet. Add one to get started.'}
            </p>
          </div>
        )}
      </div>

      {showAdd && (
        <StudentFormModal
          open={showAdd}
          onClose={() => setShowAdd(false)}
          courses={courses}
          onSaved={() => {
            setShowAdd(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}
