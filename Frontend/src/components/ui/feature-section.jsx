import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './feature-section.css';

// Utility function for class names
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

export function FeatureSteps({
  features,
  className = '',
  title = "How to get Started",
  autoPlayInterval = 3000,
  imageHeight = "h-400px"
}) {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (progress < 100) {
        setProgress((prev) => prev + 100 / (autoPlayInterval / 100));
      } else {
        setCurrentFeature((prev) => (prev + 1) % features.length);
        setProgress(0);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [progress, features.length, autoPlayInterval]);

  return (
    <div className={`feature-steps-container ${className}`}>
      <div className="feature-steps-wrapper">
        <h2 className="feature-steps-title">
          {title}
        </h2>

        <div className="feature-steps-content">
          <div className="feature-steps-list">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="feature-step-item"
                initial={{ opacity: 0.3 }}
                animate={{ opacity: index === currentFeature ? 1 : 0.3 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className={cn(
                    "feature-step-icon",
                    index === currentFeature
                      ? "feature-step-icon-active"
                      : "feature-step-icon-inactive"
                  )}
                >
                  {index <= currentFeature ? (
                    <span className="feature-step-check">✓</span>
                  ) : (
                    <span className="feature-step-number">{index + 1}</span>
                  )}
                </motion.div>

                <div className="feature-step-content">
                  <h3 className="feature-step-title">
                    {feature.title || feature.step}
                  </h3>
                  <p className="feature-step-description">
                    {feature.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className={`feature-steps-image ${imageHeight}`}>
            <AnimatePresence mode="wait">
              {features.map(
                (feature, index) =>
                  index === currentFeature && (
                    <motion.div
                      key={index}
                      className="feature-image-container"
                      initial={{ y: 100, opacity: 0, rotateX: -20 }}
                      animate={{ y: 0, opacity: 1, rotateX: 0 }}
                      exit={{ y: -100, opacity: 0, rotateX: 20 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    >
                      <img
                        src={feature.image}
                        alt={feature.step}
                        className="feature-image"
                      />
                      <div className="feature-image-gradient" />
                    </motion.div>
                  ),
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
