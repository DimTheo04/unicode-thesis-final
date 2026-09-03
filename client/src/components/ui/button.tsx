import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0 cursor-pointer rounded-lg border',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 active:translate-y-[0.5px]',
        secondary:
          'border-border bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 active:translate-y-[0.5px]',
        outline:
          'border-border bg-card text-foreground shadow-xs hover:bg-secondary/70 hover:text-foreground active:translate-y-[0.5px]',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90 active:translate-y-[0.5px]',
        ghost:
          'border-transparent bg-transparent text-foreground hover:bg-secondary hover:text-foreground',
        link:
          'border-transparent bg-transparent text-primary underline-offset-4 hover:underline p-0 h-auto font-normal',
        purple:
          'border-transparent bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 active:translate-y-[0.5px]',
      },
      size: {
        default: 'h-9 px-4 py-2 text-xs',
        sm: 'h-7.5 px-2.5 text-[11px] rounded-md',
        lg: 'h-11 px-6 text-sm',
        icon: 'h-8.5 w-8.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };

