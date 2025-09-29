import React from 'react';
import './label.css';

// Utility function for class names
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

export const Label = React.forwardRef(({ className = '', children, ...props }, ref) => (
  <label
    ref={ref}
    className={cn('form-label', className)}
    {...props}
  >
    {children}
  </label>
));

Label.displayName = 'Label';

export default Label;
