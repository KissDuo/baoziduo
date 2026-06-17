'use client';

interface DifficultyBadgeProps {
  level: 'beginner' | 'intermediate' | 'advanced';
  className?: string;
}

const LABELS: Record<string, string> = {
  beginner: '初级',
  intermediate: '中级',
  advanced: '高级',
};

const STYLES: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-red-100 text-red-700',
};

export function DifficultyBadge({ level, className = '' }: DifficultyBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[level]} ${className}`}
    >
      {LABELS[level]}
    </span>
  );
}
