import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export interface MetricSubStat {
  label: string;
  value: string | number;
  alert?: boolean;
  highlight?: boolean;
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  alert?: boolean;
  subStats?: [MetricSubStat, MetricSubStat] | MetricSubStat[];
  onClick?: () => void;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  alert,
  subStats,
  onClick,
  className,
}) => {
  return (
    <Card
      onClick={onClick}
      className={cn(
        'border-border bg-card hover:border-slate-300 dark:hover:border-slate-700 transition-all relative overflow-hidden group flex flex-col justify-between h-full min-h-[145px]',
        onClick && 'cursor-pointer hover:shadow-xs',
        className
      )}
    >
      {alert && (
        <div
          className="absolute top-0 right-0 w-2 h-2 rounded-full bg-destructive mt-3 mr-3"
          title="Attention required"
        />
      )}

      <div className="p-4 pb-3 flex-1 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </span>
          <div className="w-7 h-7 rounded-md border border-border bg-secondary/80 flex items-center justify-center text-foreground shadow-2xs group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
            <Icon className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="mt-2">
          <div className="text-2xl font-bold text-foreground tracking-tight leading-none">
            {value}
          </div>
          {subtitle && (
            <p className="text-[11px] text-muted-foreground mt-1 leading-normal truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {subStats && subStats.length > 0 && (
        <div className="px-4 py-2.5 border-t border-border/60 bg-secondary/15">
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {subStats.slice(0, 2).map((stat, idx) => (
              <div key={idx} className="flex flex-col min-w-0">
                <span className="text-[10px] text-muted-foreground truncate leading-tight">
                  {stat.label}
                </span>
                <span
                  className={cn(
                    'font-medium truncate text-foreground text-xs mt-0.5',
                    stat.alert && 'text-destructive font-semibold',
                    stat.highlight && 'text-foreground font-semibold'
                  )}
                >
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
