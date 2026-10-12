interface BadgeProps {
  children: React.ReactNode;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'slate' | 'purple';
}

export function Badge({ children, color = 'slate' }: BadgeProps) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    slate: 'bg-slate-100 text-slate-600 border-slate-200',
    purple: 'bg-violet-50 text-violet-700 border-violet-200',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border ${colors[color]}`}
    >
      {children}
    </span>
  );
}
