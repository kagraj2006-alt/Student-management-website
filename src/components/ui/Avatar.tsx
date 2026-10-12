import { avatarColor, getInitials } from '@/lib/utils';

interface AvatarProps {
  name: string;
  photoUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Avatar({ name, photoUrl, size = 'md' }: AvatarProps) {
  const sizeClass = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl',
  }[size];

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={`${sizeClass} rounded-full object-cover border-2 border-white shadow-sm`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} ${avatarColor(
        name
      )} rounded-full flex items-center justify-center text-white font-semibold border-2 border-white shadow-sm`}
    >
      {getInitials(name)}
    </div>
  );
}
