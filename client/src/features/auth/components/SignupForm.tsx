import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupFormSchema } from '../schemas/authSchemas';
import type { SignupFormData } from '../schemas/authSchemas';
import { DatePickerModal } from '@/components/shared/DatePickerModal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { UserPlus, User, Mail, Lock, AlertCircle, CheckCheck, Loader2, AtSign } from 'lucide-react';
import { FormInput } from '@/components/shared/FormInput';

interface SignupFormProps {
  onSubmit: (data: SignupFormData) => void;
  isLoading: boolean;
  errorMessage?: string | null;
  successMessage?: string | null;
  onSwitchToLogin: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({
  onSubmit,
  isLoading,
  errorMessage,
  successMessage,
  onSwitchToLogin,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      dateOfBirth: '',
      password: '',
      confirmPassword: '',
    },
  });

  const fullNameValue = watch('fullName');
  const dobValue = watch('dateOfBirth');

  // Auto-generate username from fullName with underscores (e.g. "John Doe" -> "john_doe")
  useEffect(() => {
    if (fullNameValue !== undefined) {
      const autoUsername = fullNameValue
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
      setValue('username', autoUsername, { shouldValidate: true });
    }
  }, [fullNameValue, setValue]);

  return (
    <Card className="max-w-lg w-full mx-auto shadow-sm border-border bg-card">
      <CardHeader className="text-center space-y-1.5 pb-4 border-b border-border/80">
        <CardTitle className="text-xl font-bold text-foreground tracking-tight">Registration Request</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Create a new academic account on the platform
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-6">
        {errorMessage && (
          <div className="p-3 bg-destructive/10 text-destructive text-xs font-medium rounded-lg border border-destructive/20 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium rounded-lg border border-emerald-500/20 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <CheckCheck className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSwitchToLogin}
              className="text-xs w-full mt-1"
            >
              Go to Sign In
            </Button>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormInput
            id="fullName"
            label="Full Name"
            placeholder="e.g. John Doe"
            registration={register('fullName')}
            error={errors.fullName?.message}
            icon={User}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormInput
              id="username"
              label="Username (Auto-generated)"
              readOnly
              placeholder="john_doe"
              registration={register('username')}
              error={errors.username?.message}
              icon={AtSign}
              className="bg-secondary/50 text-muted-foreground cursor-not-allowed text-xs"
            />

            <FormInput
              id="email"
              label="Email Address"
              type="email"
              placeholder="john.doe@univ.edu"
              registration={register('email')}
              error={errors.email?.message}
              icon={Mail}
            />
          </div>

          <div className="space-y-1.5 text-left">
            <Label className="text-xs font-medium text-foreground">Date of Birth</Label>
            <DatePickerModal
              value={dobValue}
              onChange={(dateStr) => setValue('dateOfBirth', dateStr, { shouldValidate: true })}
              error={errors.dateOfBirth?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormInput
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              registration={register('password')}
              error={errors.password?.message}
              icon={Lock}
            />

            <FormInput
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              registration={register('confirmPassword')}
              error={errors.confirmPassword?.message}
              icon={Lock}
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            variant="default"
            className="w-full text-xs font-medium h-9.5 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin text-current" />
                <span>Submitting Request...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-1.5 text-current" />
                <span>Submit Registration</span>
              </>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center border-t border-border/80 pt-4 pb-4">
        <p className="text-xs text-muted-foreground">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-foreground hover:underline font-semibold cursor-pointer ml-1"
          >
            Sign in here
          </button>
        </p>
      </CardFooter>
    </Card>
  );
};
