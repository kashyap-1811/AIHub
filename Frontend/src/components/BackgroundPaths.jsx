import React from "react";
import { motion } from "framer-motion";
import "./background.css";

function FloatingPaths({ position }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className="background-paths-wrapper">
      <svg viewBox="0 0 696 316" fill="none" className="w-100 h-100">
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="#ffffff"
            strokeWidth={path.width}
            strokeOpacity={0.3 + path.id * 0.02}
            fill="none"
            initial={{ pathLength: 0.3, opacity: 0.4 }}
            animate={{
              pathLength: 1,
              opacity: [0.2, 0.5, 0.2],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
}

export function BackgroundPaths({ children, showTitle = false, title = "AIHub" }) {
  const words = title.split(" ");

  return (
    <div className="background-container d-flex align-items-center justify-content-center text-center">
      <div className="background-layer">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      {showTitle && (
        <div className="z-1 position-relative container">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
          >
            <h1 className="display-3 fw-bold mb-4">
              {words.map((word, wordIndex) => (
                <span key={wordIndex} className="me-2">
                  {word.split("").map((letter, letterIndex) => (
                    <motion.span
                      key={`${wordIndex}-${letterIndex}`}
                      initial={{ y: 100, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{
                        delay: wordIndex * 0.1 + letterIndex * 0.03,
                        type: "spring",
                        stiffness: 150,
                        damping: 25,
                      }}
                      className="gradient-text"
                    >
                      {letter}
                    </motion.span>
                  ))}
                </span>
              ))}
            </h1>
          </motion.div>
        </div>
      )}

      {children && (
        <div className="z-1 position-relative w-100 h-100">
          {children}
        </div>
      )}
    </div>
  );
}
