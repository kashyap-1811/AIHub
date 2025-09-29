import React from 'react';
import './button.css';

// Utility function for class names
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

// Button variants
const buttonVariants = {
  default: 'btn-primary',
  destructive: 'btn-danger',
  outline: 'btn-outline-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  link: 'btn-link'
};

const buttonSizes = {
  default: 'btn-md',
  sm: 'btn-sm',
  lg: 'btn-lg',
  icon: 'btn-icon'
};

export const Button = React.forwardRef(({ 
  className = '', 
  variant = 'default', 
  size = 'default', 
  asChild = false, 
  children, 
  ...props 
}, ref) => {
  const Comp = asChild ? 'div' : 'button';
  const buttonClasses = cn(
    'btn',
    buttonVariants[variant] || buttonVariants.default,
    buttonSizes[size] || buttonSizes.default,
    className
  );
  
  return (
    <Comp
      className={buttonClasses}
      ref={ref}
      {...props}
    >
      {children}
    </Comp>
  );
});

Button.displayName = 'Button';

export default Button;
