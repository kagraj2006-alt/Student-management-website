import { useEffect, useState } from 'react';
import { Users, BookOpen, Library, TrendingUp, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Student, Course, Subject, Page } from '@/types';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { Avatar } from '@/components/ui/Avatar';

interface DashboardProps {
  onNavigate: (page: Page) => void;
  onViewStudent: (id: string) => void;
}

export function Dashboard({ onNavigate, onViewStudent }: DashboardProps) {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    (async () => {
      const [s, c, sub] = await Promise.all([
        supabase.from('students').select('*').order('name'),
        supabase.from('courses').select('*'),
        supabase.from('subjects').select('*'),
      ]);
      if (s.data) setStudents(s.data);
      if (c.data) setCourses(c.data);
      if (sub.data) setSubjects(sub.data);
      setLoading(false);
    })();
  }, []);

  if (loading) return <FullPageSpinner />;

  const stats = [
    {
      label: 'Total Students',
      value: students.length,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      shadowColor: 'shadow-blue-500/20',
    },
    {
      label: 'Active Courses',
      value: courses.length,
      icon: BookOpen,
      color: 'from-emerald-500 to-emerald-600',
      shadowColor: 'shadow-emerald-500/20',
    },
    {
      label: 'Total Subjects',
      value: subjects.length,
      icon: Library,
      color: 'from-amber-500 to-amber-600',
      shadowColor: 'shadow-amber-500/20',
    },
    {
      label: 'Avg. Semester',
      value: students.length
        ? (students.reduce((a, s) => a + s.semester, 0) / students.length).toFixed(1)
        : '0',
      icon: TrendingUp,
      color: 'from-violet-500 to-violet-600',
      shadowColor: 'shadow-violet-500/20',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of your institution at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="card p-5 transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
                </div>
                <div
                  className={`w-11 h-11 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg ${stat.shadowColor}`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Recent Students</h2>
            <button
              onClick={() => onNavigate('students')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            {students.slice(0, 5).map((student) => {
              const course = courses.find((c) => c.id === student.course_id);
              return (
                <button
                  key={student.id}
                  onClick={() => onViewStudent(student.id)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors text-left"
                >
                  <Avatar name={student.name} photoUrl={student.photo_url} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 text-sm truncate">{student.name}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {course?.course_name || 'No course'} • Sem {student.semester}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{student.student_id}</span>
                </button>
              );
            })}
            {students.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">No students yet</p>
            )}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Courses Overview</h2>
            <button
              onClick={() => onNavigate('courses')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
            >
              Manage <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {courses.map((course) => {
              const count = students.filter((s) => s.course_id === course.id).length;
              const subjCount = subjects.filter((s) => s.course_id === course.id).length;
              return (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{course.course_name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {course.department} • {course.duration}
                    </p>
                  </div>
                  <div className="flex gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-slate-700">{count}</p>
                      <p className="text-xs text-slate-400">Students</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-700">{subjCount}</p>
                      <p className="text-xs text-slate-400">Subjects</p>
                    </div>
                  </div>
                </div>
              );
            })}
            {courses.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">No courses yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
