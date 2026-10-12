import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { SubjectWithCourse, Course } from '@/types';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { SearchInput } from '@/components/ui/SearchInput';
import { SubjectFormModal } from '@/components/courses/SubjectFormModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export function SubjectsPage() {
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<SubjectWithCourse[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editSubject, setEditSubject] = useState<SubjectWithCourse | null>(null);
  const [deleteSubject, setDeleteSubject] = useState<SubjectWithCourse | null>(null);

  async function loadData() {
    setLoading(true);
    const [s, c] = await Promise.all([
      supabase
        .from('subjects')
        .select('*, course:courses(id, course_name, course_id)')
        .order('subject_name'),
      supabase.from('courses').select('*'),
    ]);
    if (s.data) setSubjects(s.data as unknown as SubjectWithCourse[]);
    if (c.data) setCourses(c.data);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const filtered = subjects.filter((s) => {
    const q = search.toLowerCase();
    const matchesSearch =
      s.subject_name.toLowerCase().includes(q) ||
      s.subject_code.toLowerCase().includes(q) ||
      s.faculty.toLowerCase().includes(q) ||
      (s.course?.course_name || '').toLowerCase().includes(q);
    const matchesCourse = !courseFilter || s.course_id === courseFilter;
    return matchesSearch && matchesCourse;
  });

  async function handleDelete() {
    if (!deleteSubject) return;
    await supabase.from('subjects').delete().eq('id', deleteSubject.id);
    setDeleteSubject(null);
    loadData();
  }

  if (loading) return <FullPageSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Subjects</h1>
          <p className="text-slate-500 mt-1">
            {subjects.length} {subjects.length === 1 ? 'subject' : 'subjects'} across{' '}
            {courses.length} courses
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Subject
        </button>
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by subject name, code, faculty, or course..."
          />
        </div>
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 min-w-[180px]"
        >
          <option value="">All Courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.course_name}
            </option>
          ))}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                  Subject Code
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                  Subject Name
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 hidden md:table-cell">
                  Course
                </th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">
                  Semester
                </th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 hidden lg:table-cell">
                  Credits
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 hidden lg:table-cell">
                  Faculty
                </th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((subject) => (
                <tr key={subject.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-3.5">
                    <span className="text-sm font-mono font-medium text-slate-700">
                      {subject.subject_code}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="text-sm font-medium text-slate-800">
                      {subject.subject_name}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 hidden md:table-cell">
                    {subject.course ? (
                      <Badge color="blue">{subject.course.course_name}</Badge>
                    ) : (
                      <span className="text-sm text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-3.5 hidden sm:table-cell text-center">
                    <Badge color="slate">Sem {subject.semester}</Badge>
                  </td>
                  <td className="px-6 py-3.5 hidden lg:table-cell text-center">
                    <span className="text-sm text-slate-600">{subject.credits}</span>
                  </td>
                  <td className="px-6 py-3.5 hidden lg:table-cell">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-sm text-slate-600">{subject.faculty || 'TBA'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditSubject(subject)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteSubject(subject)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-slate-400 text-sm">
              {search || courseFilter
                ? 'No subjects match your filters.'
                : 'No subjects yet. Add one to get started.'}
            </p>
          </div>
        )}
      </div>

      {showAdd && (
        <SubjectFormModal
          open={showAdd}
          onClose={() => setShowAdd(false)}
          courses={courses}
          onSaved={() => {
            setShowAdd(false);
            loadData();
          }}
        />
      )}
      {editSubject && (
        <SubjectFormModal
          open={!!editSubject}
          subject={editSubject}
          courses={courses}
          onClose={() => setEditSubject(null)}
          onSaved={() => {
            setEditSubject(null);
            loadData();
          }}
        />
      )}
      <ConfirmDialog
        open={!!deleteSubject}
        onClose={() => setDeleteSubject(null)}
        onConfirm={handleDelete}
        title="Delete Subject"
        message={`Are you sure you want to delete "${deleteSubject?.subject_name}" (${deleteSubject?.subject_code})? This will also remove related attendance, marks, and assignment records. This action cannot be undone.`}
      />
    </div>
  );
}
