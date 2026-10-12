import { useState, type FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import type { Course, Student } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';

interface StudentFormModalProps {
  open: boolean;
  onClose: () => void;
  courses: Course[];
  student?: Student | null;
  onSaved: () => void;
}

export function StudentFormModal({
  open,
  onClose,
  courses,
  student,
  onSaved,
}: StudentFormModalProps) {
  const [saving, setSaving] = useState(false);
  const isEdit = !!student;

  const [form, setForm] = useState({
    student_id: student?.student_id || '',
    enrollment_number: student?.enrollment_number || '',
    name: student?.name || '',
    email: student?.email || '',
    phone: student?.phone || '',
    date_of_birth: student?.date_of_birth || '',
    gender: student?.gender || 'Male',
    address: student?.address || '',
    course_id: student?.course_id || '',
    semester: student?.semester?.toString() || '1',
    section: student?.section || '',
    photo_url: student?.photo_url || '',
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...form,
      semester: parseInt(form.semester) || 1,
      course_id: form.course_id || null,
      date_of_birth: form.date_of_birth || null,
    };

    if (isEdit && student) {
      await supabase.from('students').update(payload).eq('id', student.id);
    } else {
      await supabase.from('students').insert(payload);
    }

    setSaving(false);
    onSaved();
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Student' : 'Add Student'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Student ID *" required>
            <input
              required
              className="input-field"
              value={form.student_id}
              onChange={(e) => update('student_id', e.target.value)}
              placeholder="STU001"
            />
          </Field>
          <Field label="Enrollment Number *" required>
            <input
              required
              className="input-field"
              value={form.enrollment_number}
              onChange={(e) => update('enrollment_number', e.target.value)}
              placeholder="ENR2021001"
            />
          </Field>
          <Field label="Full Name *" required>
            <input
              required
              className="input-field"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="John Doe"
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              className="input-field"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="john@university.edu"
            />
          </Field>
          <Field label="Phone">
            <input
              className="input-field"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              placeholder="+91 98765 43210"
            />
          </Field>
          <Field label="Date of Birth">
            <input
              type="date"
              className="input-field"
              value={form.date_of_birth}
              onChange={(e) => update('date_of_birth', e.target.value)}
            />
          </Field>
          <Field label="Gender">
            <select
              className="input-field"
              value={form.gender}
              onChange={(e) => update('gender', e.target.value)}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </Field>
          <Field label="Photo URL">
            <input
              className="input-field"
              value={form.photo_url}
              onChange={(e) => update('photo_url', e.target.value)}
              placeholder="https://..."
            />
          </Field>
          <Field label="Address" full>
            <input
              className="input-field"
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
              placeholder="123 Main Street, City, State"
            />
          </Field>
          <Field label="Course">
            <select
              className="input-field"
              value={form.course_id}
              onChange={(e) => update('course_id', e.target.value)}
            >
              <option value="">Select course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.course_name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Semester">
            <select
              className="input-field"
              value={form.semester}
              onChange={(e) => update('semester', e.target.value)}
            >
              {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  Semester {n}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Section">
            <input
              className="input-field"
              value={form.section}
              onChange={(e) => update('section', e.target.value)}
              placeholder="A"
            />
          </Field>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving && <Spinner className="w-4 h-4" />}
            {isEdit ? 'Save Changes' : 'Add Student'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
  required?: boolean;
}) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
