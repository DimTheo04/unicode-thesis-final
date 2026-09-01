import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginFormSchema } from '../schemas/authSchemas';
import type { LoginFormData } from '../schemas/authSchemas';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Lock, AtSign, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { FormInput } from '@/components/shared/FormInput';

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void;
  isLoading: boolean;
  errorMessage?: string | null;
  onSwitchToSignup: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isLoading,
  errorMessage,
  onSwitchToSignup,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
  });

  return (
    <Card className="max-w-md w-full mx-auto shadow-sm border-border bg-card">
      <CardHeader className="text-center space-y-1.5 pb-4 border-b border-border/80">
        <CardTitle className="text-xl font-bold text-foreground tracking-tight">Sign In to Platform</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Enter your academic credentials to access your account
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-6">
        {errorMessage && (
          <div className="p-3 bg-destructive/10 text-destructive text-xs font-medium rounded-lg border border-destructive/20 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormInput
            id="identifier"
            label="Username or Email"
            placeholder="e.g. admin or user@platform.ac.gr"
            registration={register('identifier')}
            error={errors.identifier?.message}
            icon={AtSign}
          />

          <FormInput
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            registration={register('password')}
            error={errors.password?.message}
            icon={Lock}
          />

          <Button
            type="submit"
            disabled={isLoading}
            variant="default"
            className="w-full text-xs font-medium h-9.5 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin text-current" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 ml-1.5 text-current" />
              </>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center border-t border-border/80 pt-4 pb-4">
        <p className="text-xs text-muted-foreground">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-foreground hover:underline font-semibold cursor-pointer ml-1"
          >
            Register here
          </button>
        </p>
      </CardFooter>
    </Card>
  );
};
