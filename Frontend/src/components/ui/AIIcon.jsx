import React from 'react';

const AIIcon = ({ size = 60, className = "" }) => {
  return (
    <img 
      src="https://img.icons8.com/ios-filled/100/ffffff/sparkling.png" 
      alt="Sparkling" 
      width={size}
      height={size}
      className={className}
      style={{ 
        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '8px'
      }}
    />
  );
};

export default AIIcon;
