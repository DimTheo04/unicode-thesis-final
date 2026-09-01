import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { SunMedium, MoonStar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className, showLabel = false }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'relative inline-flex items-center justify-center p-2 h-8 w-8 rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <SunMedium className="w-4 h-4 text-foreground/80 transition-transform duration-200" />
      ) : (
        <MoonStar className="w-4 h-4 text-foreground/80 transition-transform duration-200" />
      )}
      {showLabel && (
        <span className="text-xs font-medium ml-2">
          {isDark ? 'Light theme' : 'Dark theme'}
        </span>
      )}
    </button>
  );
};
