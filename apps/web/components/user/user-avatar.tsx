'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_MAP = {
  sm: { class: 'w-7 h-7 text-xs', px: 28 },
  md: { class: 'w-8 h-8 text-xs', px: 32 },
  lg: { class: 'w-10 h-10 text-sm', px: 40 },
  xl: { class: 'w-14 h-14 text-xl', px: 56 },
};

export function UserAvatar({ name, email, image, size = 'md', className }: UserAvatarProps) {
  const initials = name
    ? name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('')
    : email?.[0]?.toUpperCase() ?? '?';

  const { class: sizeClass, px } = SIZE_MAP[size];

  if (image) {
    return (
      <Image
        src={image}
        alt={name ?? email ?? 'Avatar'}
        width={px}
        height={px}
        referrerPolicy="no-referrer"
        className={cn('rounded-full object-cover ring-2 ring-primary/15', sizeClass, className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-semibold ring-2 ring-primary/15 select-none shrink-0',
        sizeClass,
        className
      )}
      aria-label={name ?? email ?? 'Avatar'}
    >
      {initials}
    </div>
  );
}
