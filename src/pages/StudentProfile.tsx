import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Hash,
  GraduationCap,
  BookOpen,
  Users as UsersIcon,
  Pencil,
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type {
  StudentWithCourse,
  Course,
  SubjectWithCourse,
  AttendanceWithSubject,
  MarksWithSubject,
  AssignmentWithSubject,
} from '@/types';
import {
  calculatePercentage,
  getGrade,
  attendancePct,
  formatDate,
} from '@/lib/utils';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { StudentFormModal } from '@/components/students/StudentFormModal';

type Tab = 'overview' | 'attendance' | 'marks' | 'subjects' | 'assignments';

interface StudentProfileProps {
  studentId: string;
  onBack: () => void;
}

const tabs: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'marks', label: 'Marks' },
  { key: 'subjects', label: 'Subjects' },
  { key: 'assignments', label: 'Assignments' },
];

export function StudentProfile({ studentId, onBack }: StudentProfileProps) {
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<StudentWithCourse | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<SubjectWithCourse[]>([]);
  const [attendance, setAttendance] = useState<AttendanceWithSubject[]>([]);
  const [marks, setMarks] = useState<MarksWithSubject[]>([]);
  const [assignments, setAssignments] = useState<AssignmentWithSubject[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showEdit, setShowEdit] = useState(false);

  async function loadData() {
    setLoading(true);

    const { data: sData } = await supabase
      .from('students')
      .select('*, course:courses(id, course_name, course_id)')
      .eq('id', studentId)
      .maybeSingle();

    if (!sData) {
      setLoading(false);
      return;
    }

    const studentData = sData as unknown as StudentWithCourse;
    setStudent(studentData);

    const courseId = studentData.course_id;

    const [c, sub, att, m, a] = await Promise.all([
      supabase.from('courses').select('*'),
      supabase
        .from('subjects')
        .select('*, course:courses(id, course_name, course_id)')
        .eq('course_id', courseId)
        .eq('semester', studentData.semester)
        .order('subject_name'),
      supabase
        .from('attendance')
        .select('*, subject:subjects(id, subject_code, subject_name)')
        .eq('student_id', studentId),
      supabase
        .from('marks')
        .select('*, subject:subjects(id, subject_code, subject_name, credits)')
        .eq('student_id', studentId),
      supabase
        .from('assignments')
        .select('*, subject:subjects(id, subject_code, subject_name)')
        .eq('student_id', studentId)
        .order('submitted_date', { ascending: false }),
    ]);

    if (c.data) setCourses(c.data);
    if (sub.data) setSubjects(sub.data as unknown as SubjectWithCourse[]);
    if (att.data) setAttendance(att.data as unknown as AttendanceWithSubject[]);
    if (m.data) setMarks(m.data as unknown as MarksWithSubject[]);
    if (a.data) setAssignments(a.data as unknown as AssignmentWithSubject[]);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  if (loading) return <FullPageSpinner />;
  if (!student)
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Student not found.</p>
        <button onClick={onBack} className="btn-secondary mt-4">
          Go Back
        </button>
      </div>
    );

  const totalMarks = marks.reduce(
    (acc, m) => ({
      internal: acc.internal + m.internal_marks,
      assignment: acc.assignment + m.assignment_marks,
      exam: acc.exam + m.exam_marks,
    }),
    { internal: 0, assignment: 0, exam: 0 }
  );

  const overallPct = marks.length > 0 ? calculatePercentage(
    totalMarks.internal / marks.length,
    totalMarks.assignment / marks.length,
    totalMarks.exam / marks.length
  ) : 0;
  const gradeInfo = getGrade(overallPct);

  const totalAttended = attendance.reduce((a, x) => a + x.attended_classes, 0);
  const totalClasses = attendance.reduce((a, x) => a + x.total_classes, 0);
  const overallAttPct = attendancePct(totalAttended, totalClasses);

  return (
    <div className="space-y-6 animate-fade-in">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Students
      </button>

      {/* Profile Header Card */}
      <div className="card overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500" />
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between flex-wrap gap-4 -mt-12">
            <div className="flex items-end gap-4">
              <div className="ring-4 ring-white rounded-full">
                <Avatar
                  name={student.name}
                  photoUrl={student.photo_url}
                  size="xl"
                />
              </div>
              <div className="pb-1">
                <h1 className="text-xl font-bold text-slate-800">{student.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-mono text-slate-500">
                    {student.student_id}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-sm font-mono text-slate-500">
                    {student.enrollment_number}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowEdit(true)}
              className="btn-secondary"
            >
              <Pencil className="w-4 h-4" /> Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-slate-100 px-2 flex items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key ? 'tab-active' : 'tab-inactive'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <OverviewTab
              student={student}
              subjects={subjects}
              attendance={attendance}
              marks={marks}
              overallPct={overallPct}
              gradeInfo={gradeInfo}
              overallAttPct={overallAttPct}
              totalClasses={totalClasses}
              totalAttended={totalAttended}
            />
          )}
          {activeTab === 'attendance' && (
            <AttendanceTab attendance={attendance} overallPct={overallAttPct} />
          )}
          {activeTab === 'marks' && (
            <MarksTab marks={marks} overallPct={overallPct} gradeInfo={gradeInfo} />
          )}
          {activeTab === 'subjects' && <SubjectsTab subjects={subjects} />}
          {activeTab === 'assignments' && <AssignmentsTab assignments={assignments} />}
        </div>
      </div>

      {showEdit && (
        <StudentFormModal
          open={showEdit}
          onClose={() => setShowEdit(false)}
          courses={courses}
          student={student}
          onSaved={() => {
            setShowEdit(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

/* ---------- Overview Tab ---------- */
function OverviewTab({
  student,
  subjects,
  attendance,
  marks,
  overallPct,
  gradeInfo,
  overallAttPct,
  totalClasses,
  totalAttended,
}: {
  student: StudentWithCourse;
  subjects: SubjectWithCourse[];
  attendance: AttendanceWithSubject[];
  marks: MarksWithSubject[];
  overallPct: number;
  gradeInfo: { grade: string; percentage: number; gpa: number; color: string };
  overallAttPct: number;
  totalClasses: number;
  totalAttended: number;
}) {
  const infoItems = [
    { icon: Mail, label: 'Email', value: student.email || '—' },
    { icon: Phone, label: 'Phone', value: student.phone || '—' },
    { icon: Calendar, label: 'Date of Birth', value: formatDate(student.date_of_birth) },
    { icon: User, label: 'Gender', value: student.gender || '—' },
    { icon: MapPin, label: 'Address', value: student.address || '—' },
    { icon: GraduationCap, label: 'Course', value: student.course?.course_name || '—' },
    { icon: Hash, label: 'Enrollment No.', value: student.enrollment_number },
    { icon: BookOpen, label: 'Semester', value: `Semester ${student.semester}` },
    { icon: UsersIcon, label: 'Section', value: student.section || '—' },
  ];

  return (
    <div className="space-y-6">
      {/* Academic Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={Award}
          label="Overall Grade"
          value={gradeInfo.grade}
          subValue={`${overallPct}%`}
          color={gradeInfo.color}
          bg="bg-slate-50"
        />
        <SummaryCard
          icon={TrendingUp}
          label="GPA"
          value={gradeInfo.gpa.toFixed(1)}
          subValue="out of 10"
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <SummaryCard
          icon={CheckCircle2}
          label="Attendance"
          value={`${overallAttPct}%`}
          subValue={`${totalAttended}/${totalClasses} classes`}
          color={
            overallAttPct >= 75
              ? 'text-emerald-600'
              : overallAttPct >= 60
                ? 'text-amber-600'
                : 'text-red-600'
          }
          bg="bg-emerald-50"
        />
        <SummaryCard
          icon={BookOpen}
          label="Subjects"
          value={subjects.length.toString()}
          subValue="enrolled"
          color="text-violet-600"
          bg="bg-violet-50"
        />
      </div>

      {/* Student Information */}
      <div>
        <h3 className="font-semibold text-slate-800 mb-3">Student Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {infoItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-100"
              >
                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                  <Icon className="w-4.5 h-4.5 text-slate-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500 font-medium">{item.label}</p>
                  <p className="text-sm text-slate-800 font-medium mt-0.5 break-words">
                    {item.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Academic Snapshot */}
      <div>
        <h3 className="font-semibold text-slate-800 mb-3">Academic Snapshot</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Marks breakdown */}
          <div className="card p-4 border border-slate-100">
            <h4 className="text-sm font-medium text-slate-600 mb-3">Marks Breakdown</h4>
            {marks.length > 0 ? (
              <div className="space-y-3">
                <ProgressBar
                  label="Internal (Avg)"
                  value={marks.reduce((a, m) => a + m.internal_marks, 0) / marks.length}
                  max={25}
                  color="bg-blue-500"
                />
                <ProgressBar
                  label="Assignment (Avg)"
                  value={marks.reduce((a, m) => a + m.assignment_marks, 0) / marks.length}
                  max={20}
                  color="bg-emerald-500"
                />
                <ProgressBar
                  label="Examination (Avg)"
                  value={marks.reduce((a, m) => a + m.exam_marks, 0) / marks.length}
                  max={100}
                  color="bg-violet-500"
                />
              </div>
            ) : (
              <p className="text-sm text-slate-400">No marks recorded</p>
            )}
          </div>

          {/* Attendance breakdown */}
          <div className="card p-4 border border-slate-100">
            <h4 className="text-sm font-medium text-slate-600 mb-3">Attendance by Subject</h4>
            {attendance.length > 0 ? (
              <div className="space-y-2.5">
                {attendance.slice(0, 4).map((a) => (
                  <div key={a.id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 truncate flex-1 mr-2">
                      {a.subject?.subject_name || '—'}
                    </span>
                    <span
                      className={`font-medium ${
                        attendancePct(a.attended_classes, a.total_classes) >= 75
                          ? 'text-emerald-600'
                          : 'text-amber-600'
                      }`}
                    >
                      {attendancePct(a.attended_classes, a.total_classes)}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No attendance recorded</p>
            )}
          </div>

          {/* Recent assignments */}
          <div className="card p-4 border border-slate-100">
            <h4 className="text-sm font-medium text-slate-600 mb-3">Recent Assignments</h4>
            <div className="space-y-2.5">
              <p className="text-sm text-slate-600">
                Total: {marks.reduce((a, m) => a + m.assignment_marks, 0)} marks earned
              </p>
              <p className="text-sm text-slate-600">
                Subjects: {subjects.length} enrolled
              </p>
              <p className="text-sm text-slate-600">
                Section: {student.section || '—'}
              </p>
              <p className="text-sm text-slate-600">
                Department: {student.course?.course_name || '—'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Attendance Tab ---------- */
function AttendanceTab({
  attendance,
  overallPct,
}: {
  attendance: AttendanceWithSubject[];
  overallPct: number;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100">
        <div className="relative w-20 h-20">
          <svg className="w-20 h-20 -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="32"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="6"
            />
            <circle
              cx="40"
              cy="40"
              r="32"
              fill="none"
              stroke={overallPct >= 75 ? '#10b981' : overallPct >= 60 ? '#f59e0b' : '#ef4444'}
              strokeWidth="6"
              strokeDasharray={`${(overallPct / 100) * 201} 201`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-slate-800">{overallPct}%</span>
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-slate-800">Overall Attendance</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {overallPct >= 75
              ? 'Good standing — above 75% threshold'
              : overallPct >= 60
                ? 'Warning — below 75% threshold'
                : 'Critical — attendance shortfall'}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                Subject Code
              </th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                Subject Name
              </th>
              <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                Attended
              </th>
              <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                Total
              </th>
              <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                Percentage
              </th>
              <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {attendance.map((a) => {
              const pct = attendancePct(a.attended_classes, a.total_classes);
              return (
                <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono text-slate-600">
                      {a.subject?.subject_code || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-800">{a.subject?.subject_name || '—'}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-slate-600">{a.attended_classes}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-slate-600">{a.total_classes}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm font-semibold text-slate-800">{pct}%</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {pct >= 75 ? (
                      <Badge color="green">Good</Badge>
                    ) : pct >= 60 ? (
                      <Badge color="amber">Warning</Badge>
                    ) : (
                      <Badge color="red">Shortage</Badge>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {attendance.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-12">
            No attendance records found for this student.
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------- Marks Tab ---------- */
function MarksTab({
  marks,
  overallPct,
  gradeInfo,
}: {
  marks: MarksWithSubject[];
  overallPct: number;
  gradeInfo: { grade: string; percentage: number; gpa: number; color: string };
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 border border-slate-100 text-center">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Overall Percentage</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">{overallPct}%</p>
        </div>
        <div className="card p-4 border border-slate-100 text-center">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Grade</p>
          <p className={`text-3xl font-bold mt-2 ${gradeInfo.color}`}>{gradeInfo.grade}</p>
        </div>
        <div className="card p-4 border border-slate-100 text-center">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">GPA</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">{gradeInfo.gpa.toFixed(1)}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                Subject
              </th>
              <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                Internal (/25)
              </th>
              <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                Assignment (/20)
              </th>
              <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                Exam (/100)
              </th>
              <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                Percentage
              </th>
              <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                Grade
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {marks.map((m) => {
              const pct = calculatePercentage(
                m.internal_marks,
                m.assignment_marks,
                m.exam_marks
              );
              const g = getGrade(pct);
              return (
                <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <span className="text-sm font-medium text-slate-800">
                        {m.subject?.subject_name || '—'}
                      </span>
                      <span className="text-xs text-slate-400 ml-2 font-mono">
                        {m.subject?.subject_code}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-slate-700">{m.internal_marks}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-slate-700">{m.assignment_marks}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-slate-700">{m.exam_marks}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm font-semibold text-slate-800">{pct}%</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-sm font-bold ${g.color}`}>{g.grade}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {marks.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-12">
            No marks records found for this student.
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------- Subjects Tab ---------- */
function SubjectsTab({ subjects }: { subjects: SubjectWithCourse[] }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((sub) => (
          <div
            key={sub.id}
            className="card p-4 border border-slate-100 transition-all hover:shadow-md"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <Badge color="blue">{sub.credits} Credits</Badge>
            </div>
            <h4 className="font-medium text-slate-800 text-sm">{sub.subject_name}</h4>
            <p className="text-xs font-mono text-slate-400 mt-1">{sub.subject_code}</p>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-50">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-600">{sub.faculty || 'TBA'}</span>
            </div>
          </div>
        ))}
      </div>
      {subjects.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-12">
          No subjects found for this student's course and semester.
        </p>
      )}
    </div>
  );
}

/* ---------- Assignments Tab ---------- */
function AssignmentsTab({
  assignments,
}: {
  assignments: AssignmentWithSubject[];
}) {
  const statusConfig: Record<string, { color: 'green' | 'amber' | 'red'; icon: typeof CheckCircle2 }> = {
    Submitted: { color: 'green', icon: CheckCircle2 },
    Pending: { color: 'amber', icon: Clock },
    Overdue: { color: 'red', icon: AlertCircle },
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {assignments.map((a) => {
          const cfg = statusConfig[a.status] || statusConfig['Pending'];
          const StatusIcon = cfg.icon;
          const pct = a.max_marks > 0 ? Math.round((a.marks / a.max_marks) * 100) : 0;
          return (
            <div
              key={a.id}
              className="card p-4 border border-slate-100 transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-slate-800 text-sm truncate">{a.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    {a.subject?.subject_name || '—'} • {a.subject?.subject_code}
                  </p>
                </div>
                <Badge color={cfg.color}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {a.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                <div>
                  <p className="text-xs text-slate-500">Marks</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {a.marks} / {a.max_marks}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Percentage</p>
                  <p
                    className={`text-sm font-semibold ${
                      pct >= 80 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-red-600'
                    }`}
                  >
                    {pct}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Submitted</p>
                  <p className="text-sm text-slate-600">{formatDate(a.submitted_date)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {assignments.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-12">
          No assignments found for this student.
        </p>
      )}
    </div>
  );
}

/* ---------- Shared components ---------- */
function SummaryCard({
  icon: Icon,
  label,
  value,
  subValue,
  color,
  bg,
}: {
  icon: typeof Award;
  label: string;
  value: string;
  subValue: string;
  color: string;
  bg: string;
}) {
  return (
    <div className={`rounded-xl border border-slate-100 p-4 ${bg}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{subValue}</p>
    </div>
  );
}

function ProgressBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = Math.round((value / max) * 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-600">{label}</span>
        <span className="text-slate-500 font-medium">
          {value.toFixed(1)}/{max}
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
