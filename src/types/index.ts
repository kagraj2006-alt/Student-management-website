export interface Course {
  id: string;
  course_id: string;
  course_name: string;
  department: string;
  duration: string;
  num_semesters: number;
  created_at?: string;
}

export interface Subject {
  id: string;
  subject_code: string;
  subject_name: string;
  course_id: string | null;
  semester: number;
  credits: number;
  faculty: string;
  created_at?: string;
}

export interface Student {
  id: string;
  student_id: string;
  enrollment_number: string;
  name: string;
  email: string;
  phone: string;
  date_of_birth: string | null;
  gender: string;
  address: string;
  course_id: string | null;
  semester: number;
  section: string;
  photo_url: string;
  created_at?: string;
}

export interface Attendance {
  id: string;
  student_id: string;
  subject_id: string;
  total_classes: number;
  attended_classes: number;
  created_at?: string;
}

export interface Marks {
  id: string;
  student_id: string;
  subject_id: string;
  internal_marks: number;
  assignment_marks: number;
  exam_marks: number;
  created_at?: string;
}

export interface Assignment {
  id: string;
  student_id: string;
  subject_id: string;
  title: string;
  marks: number;
  max_marks: number;
  status: string;
  submitted_date: string | null;
  created_at?: string;
}

export type StudentWithCourse = Student & {
  course?: Pick<Course, 'id' | 'course_name' | 'course_id'> | null;
};

export type SubjectWithCourse = Subject & {
  course?: Pick<Course, 'id' | 'course_name' | 'course_id'> | null;
};

export type AttendanceWithSubject = Attendance & {
  subject?: Pick<Subject, 'id' | 'subject_code' | 'subject_name'> | null;
};

export type MarksWithSubject = Marks & {
  subject?: Pick<Subject, 'id' | 'subject_code' | 'subject_name' | 'credits'> | null;
};

export type AssignmentWithSubject = Assignment & {
  subject?: Pick<Subject, 'id' | 'subject_code' | 'subject_name'> | null;
};

export type Page = 'dashboard' | 'students' | 'student-profile' | 'courses' | 'subjects';

export interface GradeInfo {
  grade: string;
  percentage: number;
  gpa: number;
  color: string;
}
