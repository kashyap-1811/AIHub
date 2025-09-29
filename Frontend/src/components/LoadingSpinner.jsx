import React from 'react';
import { LumaSpin } from './ui/luma-spin';

const LoadingSpinner = ({ size = 'md', text = 'Loading...', variant = 'bootstrap' }) => {
  const sizeClass = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'spinner-border-lg'
  }[size];

  const lumaSizeClass = {
    sm: 'luma-spin-sm',
    md: '',
    lg: 'luma-spin-lg'
  }[size];

  return (
    <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '100vh' }}>
      {variant === 'luma' ? (
        <div className={lumaSizeClass}>
          <LumaSpin />
        </div>
      ) : (
        <div className={`spinner-border text-primary ${sizeClass}`} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      )}
      {text && <div className="mt-3 text-muted">{text}</div>}
    </div>
  );
};

export default LoadingSpinner;
