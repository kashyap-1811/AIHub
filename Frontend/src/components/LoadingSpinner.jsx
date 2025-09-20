import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClass = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'spinner-border-lg'
  }[size];

  return (
    <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '100vh' }}>
      <div className={`spinner-border text-primary ${sizeClass}`} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      {text && <div className="mt-3 text-muted">{text}</div>}
    </div>
  );
};

export default LoadingSpinner;
