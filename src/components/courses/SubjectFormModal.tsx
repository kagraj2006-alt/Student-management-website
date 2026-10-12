import { useState, type FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import type { Subject, Course } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';

interface SubjectFormModalProps {
  open: boolean;
  onClose: () => void;
  courses: Course[];
  subject?: Subject | null;
  onSaved: () => void;
}

export function SubjectFormModal({
  open,
  onClose,
  courses,
  subject,
  onSaved,
}: SubjectFormModalProps) {
  const [saving, setSaving] = useState(false);
  const isEdit = !!subject;

  const [form, setForm] = useState({
    subject_code: subject?.subject_code || '',
    subject_name: subject?.subject_name || '',
    course_id: subject?.course_id || '',
    semester: subject?.semester?.toString() || '1',
    credits: subject?.credits?.toString() || '3',
    faculty: subject?.faculty || '',
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const selectedCourse = courses.find((c) => c.id === form.course_id);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...form,
      semester: parseInt(form.semester) || 1,
      credits: parseInt(form.credits) || 3,
      course_id: form.course_id || null,
    };

    if (isEdit && subject) {
      await supabase.from('subjects').update(payload).eq('id', subject.id);
    } else {
      await supabase.from('subjects').insert(payload);
    }

    setSaving(false);
    onSaved();
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Subject' : 'Add Subject'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Subject Code *
            </label>
            <input
              required
              className="input-field"
              value={form.subject_code}
              onChange={(e) => update('subject_code', e.target.value)}
              placeholder="CS301"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Subject Name *
            </label>
            <input
              required
              className="input-field"
              value={form.subject_name}
              onChange={(e) => update('subject_name', e.target.value)}
              placeholder="Data Structures"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Course</label>
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
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Semester</label>
            <select
              className="input-field"
              value={form.semester}
              onChange={(e) => update('semester', e.target.value)}
            >
              {Array.from(
                { length: selectedCourse?.num_semesters || 8 },
                (_, i) => i + 1
              ).map((n) => (
                <option key={n} value={n}>
                  Semester {n}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Credits</label>
            <select
              className="input-field"
              value={form.credits}
              onChange={(e) => update('credits', e.target.value)}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} Credit{n > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Faculty</label>
            <input
              className="input-field"
              value={form.faculty}
              onChange={(e) => update('faculty', e.target.value)}
              placeholder="Dr. Rajesh Kumar"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving && <Spinner className="w-4 h-4" />}
            {isEdit ? 'Save Changes' : 'Add Subject'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
