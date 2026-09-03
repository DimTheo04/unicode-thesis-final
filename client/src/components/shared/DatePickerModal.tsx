import React, { useState } from 'react';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { CalendarDays, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';

interface DatePickerModalProps {
  value?: string;
  onChange: (dateString: string) => void;
  error?: string;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  value,
  onChange,
  error,
}) => {
  const [open, setOpen] = useState(false);
  const currentDate = value ? new Date(value) : new Date(2002, 0, 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(value ? currentDate.getDate() : null);

  const years = Array.from({ length: 70 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const handleSelectDate = (day: number) => {
    setSelectedDay(day);
    const dateObj = new Date(selectedYear, selectedMonth, day);
    const dateStr = format(dateObj, 'yyyy-MM-dd');
    onChange(dateStr);
    setOpen(false);
  };

  const formattedDisplay = value
    ? format(new Date(value), 'dd MMMM yyyy', { locale: enUS })
    : 'Select date...';

  return (
    <div className="space-y-1.5 w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              'w-full h-9 rounded-md border bg-card px-3 text-xs text-left transition-all flex items-center justify-between cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
              error ? 'border-rose-300 dark:border-rose-800' : 'border-border hover:border-slate-400 dark:hover:border-slate-600',
              value ? 'text-foreground font-medium' : 'text-muted-foreground'
            )}
          >
            <div className="flex items-center gap-2 truncate">
              <CalendarDays className="w-4 h-4 text-foreground shrink-0" />
              <span className="truncate">{formattedDisplay}</span>
            </div>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              DATE
            </span>
          </button>
        </PopoverTrigger>

        <PopoverContent align="start" className="w-76 border-border p-4 space-y-3 rounded-lg bg-card text-card-foreground shadow-lg">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <CalendarDays className="w-4 h-4 text-foreground" />
              <span>Select Date</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="hover:bg-secondary text-muted-foreground hover:text-foreground p-1 rounded-md transition cursor-pointer"
            >
              <X className="w-4 h-4 text-foreground" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full bg-card border border-border text-xs rounded-md p-1.5 focus:outline-none focus:ring-1 focus:ring-ring font-medium text-foreground"
              >
                {months.map((m, idx) => (
                  <option key={idx} value={idx}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full bg-card border border-border text-xs rounded-md p-1.5 focus:outline-none focus:ring-1 focus:ring-ring font-medium text-foreground"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-muted-foreground py-1 border-y border-border">
              <span>SU</span>
              <span>MO</span>
              <span>TU</span>
              <span>WE</span>
              <span>TH</span>
              <span>FR</span>
              <span>SA</span>
            </div>

            <div className="grid grid-cols-7 gap-1 pt-1">
              {Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1).map((day) => {
                const isSelected =
                  value &&
                  currentDate.getFullYear() === selectedYear &&
                  currentDate.getMonth() === selectedMonth &&
                  selectedDay === day;

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleSelectDate(day)}
                    className={cn(
                      'h-7.5 w-7.5 text-xs transition-colors rounded-md cursor-pointer flex items-center justify-center mx-auto text-foreground',
                      isSelected
                        ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                        : 'hover:bg-secondary hover:text-foreground'
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {error && <p className="text-rose-600 dark:text-rose-400 text-xs mt-1 font-medium">{error}</p>}
    </div>
  );
};
