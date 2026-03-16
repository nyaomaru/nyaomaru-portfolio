import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/shared/lib/css';

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
};

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, style, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div';
    return (
      <Comp
        ref={ref}
        className={cn('frame text-card-foreground shadow-sm', className)}
        style={{
          ...style,
        }}
        {...props}
      />
    );
  },
);
Card.displayName = 'Card';

export { Card };
