import { useState, type FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import type { Course } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';

interface CourseFormModalProps {
  open: boolean;
  onClose: () => void;
  course?: Course | null;
  onSaved: () => void;
}

export function CourseFormModal({ open, onClose, course, onSaved }: CourseFormModalProps) {
  const [saving, setSaving] = useState(false);
  const isEdit = !!course;

  const [form, setForm] = useState({
    course_id: course?.course_id || '',
    course_name: course?.course_name || '',
    department: course?.department || '',
    duration: course?.duration || '',
    num_semesters: course?.num_semesters?.toString() || '8',
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...form,
      num_semesters: parseInt(form.num_semesters) || 8,
    };

    if (isEdit && course) {
      await supabase.from('courses').update(payload).eq('id', course.id);
    } else {
      await supabase.from('courses').insert(payload);
    }

    setSaving(false);
    onSaved();
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Course' : 'Add Course'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Course ID *</label>
          <input
            required
            className="input-field"
            value={form.course_id}
            onChange={(e) => update('course_id', e.target.value)}
            placeholder="BTECH-CSE"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Course Name *</label>
          <input
            required
            className="input-field"
            value={form.course_name}
            onChange={(e) => update('course_name', e.target.value)}
            placeholder="B.Tech Computer Science"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Department</label>
          <input
            className="input-field"
            value={form.department}
            onChange={(e) => update('department', e.target.value)}
            placeholder="Computer Science & Engineering"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Duration</label>
            <input
              className="input-field"
              value={form.duration}
              onChange={(e) => update('duration', e.target.value)}
              placeholder="4 Years"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Semesters</label>
            <select
              className="input-field"
              value={form.num_semesters}
              onChange={(e) => update('num_semesters', e.target.value)}
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving && <Spinner className="w-4 h-4" />}
            {isEdit ? 'Save Changes' : 'Add Course'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
