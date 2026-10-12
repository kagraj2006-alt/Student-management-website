import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, BookOpen, Building2, Clock, Layers } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Course, Subject } from '@/types';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { SearchInput } from '@/components/ui/SearchInput';
import { CourseFormModal } from '@/components/courses/CourseFormModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export function CoursesPage() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<{ course_id: string | null }[]>([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [deleteCourse, setDeleteCourse] = useState<Course | null>(null);

  async function loadData() {
    setLoading(true);
    const [c, s, st] = await Promise.all([
      supabase.from('courses').select('*').order('course_name'),
      supabase.from('subjects').select('*'),
      supabase.from('students').select('course_id'),
    ]);
    if (c.data) setCourses(c.data);
    if (s.data) setSubjects(s.data);
    if (st.data) setStudents(st.data);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const filtered = courses.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.course_name.toLowerCase().includes(q) ||
      c.course_id.toLowerCase().includes(q) ||
      c.department.toLowerCase().includes(q)
    );
  });

  async function handleDelete() {
    if (!deleteCourse) return;
    await supabase.from('courses').delete().eq('id', deleteCourse.id);
    setDeleteCourse(null);
    loadData();
  }

  if (loading) return <FullPageSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Courses</h1>
          <p className="text-slate-500 mt-1">
            {courses.length} {courses.length === 1 ? 'course' : 'courses'} • {subjects.length} subjects
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Course
        </button>
      </div>

      <div className="card p-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by course name, ID, or department..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((course) => {
          const subjCount = subjects.filter((s) => s.course_id === course.id).length;
          const stuCount = students.filter((s) => s.course_id === course.id).length;
          return (
            <div
              key={course.id}
              className="card p-5 transition-all hover:shadow-md group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditCourse(course)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteCourse(course)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-slate-800">{course.course_name}</h3>
              <p className="text-xs font-mono text-slate-400 mt-0.5">{course.course_id}</p>
              <div className="flex items-center gap-1.5 mt-2 text-sm text-slate-500">
                <Building2 className="w-3.5 h-3.5" />
                <span>{course.department || '—'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-50">
                <div className="flex flex-col items-center">
                  <Clock className="w-4 h-4 text-slate-400 mb-1" />
                  <span className="text-xs text-slate-500">{course.duration || '—'}</span>
                </div>
                <div className="flex flex-col items-center">
                  <Layers className="w-4 h-4 text-slate-400 mb-1" />
                  <span className="text-xs text-slate-500">{course.num_semesters} Sem</span>
                </div>
                <div className="flex flex-col items-center">
                  <BookOpen className="w-4 h-4 text-slate-400 mb-1" />
                  <span className="text-xs text-slate-500">{subjCount} Sub</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                <Badge color="blue">{stuCount} Students</Badge>
                <Badge color="slate">{subjCount} Subjects</Badge>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card py-16 text-center">
          <p className="text-slate-400 text-sm">
            {search ? 'No courses match your search.' : 'No courses yet. Add one to get started.'}
          </p>
        </div>
      )}

      {showAdd && (
        <CourseFormModal
          open={showAdd}
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            setShowAdd(false);
            loadData();
          }}
        />
      )}
      {editCourse && (
        <CourseFormModal
          open={!!editCourse}
          course={editCourse}
          onClose={() => setEditCourse(null)}
          onSaved={() => {
            setEditCourse(null);
            loadData();
          }}
        />
      )}
      <ConfirmDialog
        open={!!deleteCourse}
        onClose={() => setDeleteCourse(null)}
        onConfirm={handleDelete}
        title="Delete Course"
        message={`Are you sure you want to delete "${deleteCourse?.course_name}"? This will also remove all subjects belonging to this course. This action cannot be undone.`}
      />
    </div>
  );
}
