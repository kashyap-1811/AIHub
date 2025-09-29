import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const TextShimmer = ({
  children,
  as: Component = 'p',
  className = '',
  duration = 2,
  spread = 2,
}) => {
  const MotionComponent = motion[Component] || motion.p;

  const dynamicSpread = useMemo(() => {
    return children.length * spread;
  }, [children, spread]);

  const shimmerStyles = {
    '--spread': `${dynamicSpread}px`,
    backgroundImage: `linear-gradient(90deg, transparent calc(50% - var(--spread)), #ffffff, transparent calc(50% + var(--spread))), linear-gradient(#a1a1aa, #a1a1aa)`,
    backgroundSize: '250% 100%, auto',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    backgroundRepeat: 'no-repeat, padding-box',
  };

  return (
    <MotionComponent
      className={`position-relative d-inline-block ${className}`}
      style={shimmerStyles}
      initial={{ backgroundPosition: '100% center' }}
      animate={{ backgroundPosition: '0% center' }}
      transition={{
        repeat: Infinity,
        duration,
        ease: 'linear',
      }}
    >
      {children}
    </MotionComponent>
  );
};

export default TextShimmer;
