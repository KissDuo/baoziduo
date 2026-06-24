'use client';

import { useLang } from '@/lib/i18n';

interface DifficultyBadgeProps {
  level: 'short' | 'medium' | 'long';
  className?: string;
}

const STYLES: Record<string, string> = {
  short: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  long: 'bg-red-100 text-red-700',
};

export function DifficultyBadge({ level, className = '' }: DifficultyBadgeProps) {
  const { t } = useLang();
  const LABELS: Record<string, string> = {
    short: t('difficulty.short'),
    medium: t('difficulty.medium'),
    long: t('difficulty.long'),
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[level]} ${className}`}
    >
      {LABELS[level]}
    </span>
  );
}
