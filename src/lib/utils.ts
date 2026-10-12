import type { GradeInfo } from '@/types';

export function calculatePercentage(
  internal: number,
  assignment: number,
  exam: number
): number {
  // Internal out of 25, assignment out of 20, exam out of 100 → total 145
  // Weighted: internal (25%), assignment (20%), exam (55%) → each scaled to 100
  const internalPct = (internal / 25) * 100;
  const assignmentPct = (assignment / 20) * 100;
  const examPct = (exam / 100) * 100;
  const overall = internalPct * 0.25 + assignmentPct * 0.2 + examPct * 0.55;
  return Math.round(overall * 100) / 100;
}

export function getGrade(percentage: number): GradeInfo {
  if (percentage >= 90)
    return { grade: 'A+', percentage, gpa: 10, color: 'text-emerald-600' };
  if (percentage >= 80)
    return { grade: 'A', percentage, gpa: 9, color: 'text-emerald-600' };
  if (percentage >= 70)
    return { grade: 'B+', percentage, gpa: 8, color: 'text-blue-600' };
  if (percentage >= 60)
    return { grade: 'B', percentage, gpa: 7, color: 'text-blue-600' };
  if (percentage >= 50)
    return { grade: 'C', percentage, gpa: 6, color: 'text-amber-600' };
  if (percentage >= 40)
    return { grade: 'D', percentage, gpa: 5, color: 'text-orange-600' };
  return { grade: 'F', percentage, gpa: 0, color: 'text-red-600' };
}

export function attendancePct(attended: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((attended / total) * 100);
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function avatarColor(name: string): string {
  const colors = [
    'bg-blue-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-violet-500',
    'bg-cyan-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return colors[hash % colors.length];
}
