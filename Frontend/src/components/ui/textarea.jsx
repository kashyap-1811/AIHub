import React from 'react';
import './textarea.css';

// Utility function for class names
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

export const Textarea = React.forwardRef(({ className = '', ...props }, ref) => {
  return (
    <textarea
      className={cn('form-textarea', className)}
      ref={ref}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
