import React, { useEffect, useState, memo } from 'react';
import AIIcon from './AIIcon';
import './orbiting-skills.css';

// --- AI Service Icon Components ---
const AIServiceIcon = memo(({ type }) => {
  const icons = {
    chatgpt: (
      <img 
        src="https://img.icons8.com/ios-filled/50/chatgpt.png" 
        alt="ChatGPT" 
        style={{ width: '24px', height: '24px' }}
      />
    ),
    gemini: (
      <img 
        src="https://img.icons8.com/ios-filled/50/gemini-ai.png" 
        alt="Gemini" 
        style={{ width: '24px', height: '24px' }}
      />
    ),
    claude: (
      <img 
        src="https://img.icons8.com/ios-filled/50/claude-ai.png" 
        alt="Claude" 
        style={{ width: '24px', height: '24px' }}
      />
    ),
    deepseek: (
      <img 
        src="https://img.icons8.com/ios-filled/50/deepseek.png" 
        alt="DeepSeek" 
        style={{ width: '24px', height: '24px' }}
      />
    ),
  };

  return icons[type] || null;
});
AIServiceIcon.displayName = 'AIServiceIcon';

// --- Configuration for the Orbiting AI Services ---
const aiServicesConfig = [
  // Inner Orbit - 2 services
  { 
    id: 'chatgpt',
    orbitRadius: 120, 
    size: 50, 
    speed: 1, 
    iconType: 'chatgpt', 
    phaseShift: 0, 
    glowColor: 'cyan',
    label: 'ChatGPT'
  },
  { 
    id: 'gemini',
    orbitRadius: 120, 
    size: 50, 
    speed: 1, 
    iconType: 'gemini', 
    phaseShift: Math.PI, 
    glowColor: 'cyan',
    label: 'Gemini'
  },
  // Outer Orbit - 2 services
  { 
    id: 'claude',
    orbitRadius: 180, 
    size: 55, 
    speed: -0.7, 
    iconType: 'claude', 
    phaseShift: 0, 
    glowColor: 'purple',
    label: 'Claude'
  },
  { 
    id: 'deepseek',
    orbitRadius: 180, 
    size: 55, 
    speed: -0.7, 
    iconType: 'deepseek', 
    phaseShift: Math.PI, 
    glowColor: 'purple',
    label: 'DeepSeek'
  },
];

// --- Memoized Orbiting AI Service Component ---
const OrbitingAIService = memo(({ config, angle }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { orbitRadius, size, iconType, label } = config;

  const x = Math.cos(angle) * orbitRadius;
  const y = Math.sin(angle) * orbitRadius;

  return (
    <div
      className="position-absolute top-50 start-50 transition-all"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        transform: `translate(calc(${x}px - 50%), calc(${y}px - 50%))`,
        zIndex: isHovered ? 20 : 10,
        transition: 'all 0.3s ease-out'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`
          position-relative w-100 h-100 p-2 bg-dark rounded-circle 
          d-flex align-items-center justify-content-center
          transition-all cursor-pointer shadow-lg
          ${isHovered ? 'scale-125' : ''}
        `}
        style={{
          backgroundColor: 'rgba(33, 37, 41, 0.9)',
          backdropFilter: 'blur(10px)',
          boxShadow: isHovered
            ? '0 0 30px rgba(16, 163, 127, 0.4), 0 0 60px rgba(16, 163, 127, 0.2)'
            : '0 4px 15px rgba(0, 0, 0, 0.3)',
          transform: isHovered ? 'scale(1.25)' : 'scale(1)',
          transition: 'all 0.3s ease-out'
        }}
      >
        <AIServiceIcon type={iconType} />
        {isHovered && (
          <div 
            className="position-absolute start-50 translate-middle-x px-2 py-1 bg-dark rounded text-white small text-nowrap"
            style={{
              bottom: '-35px',
              backgroundColor: 'rgba(33, 37, 41, 0.95)',
              backdropFilter: 'blur(10px)',
              pointerEvents: 'none',
              fontSize: '12px'
            }}
          >
            {label}
          </div>
        )}
      </div>
    </div>
  );
});
OrbitingAIService.displayName = 'OrbitingAIService';

// --- Optimized Orbit Path Component ---
const GlowingOrbitPath = memo(({ radius, glowColor = 'cyan', animationDelay = 0 }) => {
  const glowColors = {
    cyan: {
      primary: 'rgba(16, 163, 127, 0.4)',
      secondary: 'rgba(16, 163, 127, 0.2)',
      border: 'rgba(16, 163, 127, 0.3)'
    },
    purple: {
      primary: 'rgba(147, 51, 234, 0.4)',
      secondary: 'rgba(147, 51, 234, 0.2)',
      border: 'rgba(147, 51, 234, 0.3)'
    }
  };

  const colors = glowColors[glowColor] || glowColors.cyan;

  return (
    <div
      className="position-absolute top-50 start-50 translate-middle rounded-circle"
      style={{
        width: `${radius * 2}px`,
        height: `${radius * 2}px`,
        animationDelay: `${animationDelay}s`,
        pointerEvents: 'none'
      }}
    >
      {/* Glowing background */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100 rounded-circle"
        style={{
          background: `radial-gradient(circle, transparent 30%, ${colors.secondary} 70%, ${colors.primary} 100%)`,
          boxShadow: `0 0 60px ${colors.primary}, inset 0 0 60px ${colors.secondary}`,
          animation: 'orbitPulse 4s ease-in-out infinite',
          animationDelay: `${animationDelay}s`,
        }}
      />

      {/* Static ring for depth */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100 rounded-circle"
        style={{
          border: `1px solid ${colors.border}`,
          boxShadow: `inset 0 0 20px ${colors.secondary}`,
        }}
      />
    </div>
  );
});
GlowingOrbitPath.displayName = 'GlowingOrbitPath';

// --- Main Orbiting Skills Component ---
export default function OrbitingSkills() {
  const [time, setTime] = useState(0);
  const [screenSize, setScreenSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Calculate responsive orbit radius based on screen size
  const getOrbitRadius = (baseRadius) => {
    const minRadius = baseRadius;
    const maxRadius = baseRadius * 2.5;
    const scaleFactor = Math.min(Math.max(screenSize.width / 1200, 0.8), 2.5);
    return Math.round(minRadius + (maxRadius - minRadius) * (scaleFactor - 0.8) / 1.7);
  };

  const innerRadius = getOrbitRadius(120);
  const outerRadius = getOrbitRadius(180);

  // Update screen size on resize
  useEffect(() => {
    const handleResize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();

    const animate = (currentTime) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      setTime(prevTime => prevTime + deltaTime);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Create responsive AI services config
  const responsiveAIServicesConfig = [
    // Inner Orbit - 2 services
    { 
      id: 'chatgpt',
      orbitRadius: innerRadius, 
      size: 50, 
      speed: 1, 
      iconType: 'chatgpt', 
      phaseShift: 0, 
      glowColor: 'cyan',
      label: 'ChatGPT'
    },
    { 
      id: 'gemini',
      orbitRadius: innerRadius, 
      size: 50, 
      speed: 1, 
      iconType: 'gemini', 
      phaseShift: Math.PI, 
      glowColor: 'cyan',
      label: 'Gemini'
    },
    // Outer Orbit - 2 services
    { 
      id: 'claude',
      orbitRadius: outerRadius, 
      size: 55, 
      speed: -0.7, 
      iconType: 'claude', 
      phaseShift: 0, 
      glowColor: 'purple',
      label: 'Claude'
    },
    { 
      id: 'deepseek',
      orbitRadius: outerRadius, 
      size: 55, 
      speed: -0.7, 
      iconType: 'deepseek', 
      phaseShift: Math.PI, 
      glowColor: 'purple',
      label: 'DeepSeek'
    },
  ];

  const orbitConfigs = [
    { radius: innerRadius, glowColor: 'cyan', delay: 0 },
    { radius: outerRadius, glowColor: 'purple', delay: 1.5 }
  ];

  return (
    <div className="orbiting-skills-container w-100 d-flex align-items-center justify-content-center overflow-hidden position-relative">
      {/* Background pattern */}
      <div 
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ opacity: 0.1 }}
      >
        <div 
          className="position-absolute top-0 start-0 w-100 h-100" 
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #374151 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, #4B5563 0%, transparent 50%)`,
          }}
        />
      </div>

      <div 
        className="position-relative d-flex align-items-center justify-content-center"
        style={{
          width: `${Math.max(400, Math.min(screenSize.width * 0.4, 800))}px`,
          height: `${Math.max(400, Math.min(screenSize.width * 0.4, 800))}px`,
          maxWidth: '800px',
          maxHeight: '800px'
        }}
      >
        
        {/* Central "AI" Icon with enhanced glow */}
        <div 
          className="position-relative d-flex align-items-center justify-content-center rounded-circle shadow-lg"
          style={{
            width: '120px',
            height: '120px',
            background: 'linear-gradient(135deg, #374151, #1f2937)',
            zIndex: 10
          }}
        >
          <div 
            className="position-absolute top-0 start-0 w-100 h-100 rounded-circle"
            style={{
              background: 'rgba(16, 163, 127, 0.3)',
              filter: 'blur(20px)',
              animation: 'orbitPulse 2s ease-in-out infinite'
            }}
          />
          <div 
            className="position-absolute top-0 start-0 w-100 h-100 rounded-circle"
            style={{
              background: 'rgba(147, 51, 234, 0.2)',
              filter: 'blur(30px)',
              animation: 'orbitPulse 2s ease-in-out infinite',
              animationDelay: '1s'
            }}
          />
          <div className="position-relative" style={{ zIndex: 10 }}>
            <AIIcon size={60} />
          </div>
        </div>

        {/* Render glowing orbit paths */}
        {orbitConfigs.map((config) => (
          <GlowingOrbitPath
            key={`path-${config.radius}`}
            radius={config.radius}
            glowColor={config.glowColor}
            animationDelay={config.delay}
          />
        ))}

        {/* Render orbiting AI service icons */}
        {responsiveAIServicesConfig.map((config) => {
          const angle = time * config.speed + (config.phaseShift || 0);
          return (
            <OrbitingAIService
              key={config.id}
              config={config}
              angle={angle}
            />
          );
        })}
      </div>
    </div>
  );
}
