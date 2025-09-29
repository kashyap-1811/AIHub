import React from 'react';
import './input.css';

// Utility function for class names
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

export const Input = React.forwardRef(({ className = '', type = 'text', ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn('form-input', className)}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export default Input;
