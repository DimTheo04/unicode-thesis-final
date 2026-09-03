import React from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  registration: UseFormRegisterReturn;
  icon?: LucideIcon;
  helperText?: React.ReactNode;
}

export const FormInput: React.FC<FormInputProps> = ({
  id,
  label,
  error,
  registration,
  icon: Icon,
  helperText,
  className,
  ...props
}) => {
  return (
    <div className="space-y-1.5 text-left">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-xs font-medium text-foreground">
          {label}
        </Label>
        {helperText}
      </div>
      <div className="relative">
        {Icon && (
          <Icon className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
        )}
        <Input
          id={id}
          {...registration}
          className={cn(
            Icon && 'pl-9.5',
            error ? 'border-destructive focus:ring-destructive' : '',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-destructive text-xs mt-1 font-medium">
          {error}
        </p>
      )}
    </div>
  );
};

