import React from 'react';
import { motion } from 'framer-motion';

const DURATION = 0.35;
const STAGGER = 0.035;

const TextRoll = ({ children, className = "" }) => {
  if (typeof children !== 'string') return children;

  return (
    <motion.span
      initial="initial"
      whileHover="hovered"
      className={`relative block overflow-hidden whitespace-nowrap leading-tight ${className}`}
      style={{ lineHeight: 1.1 }}
    >
      <div className="flex">
        {children.split("").map((l, i) => (
          <motion.span
            variants={{
              initial: { y: 0 },
              hovered: { y: "-100%" },
            }}
            transition={{
              duration: DURATION,
              ease: [0.6, 0.01, 0.05, 0.95],
              delay: STAGGER * i,
            }}
            className="inline-block"
            key={i}
          >
            {l === " " ? "\u00A0" : l}
          </motion.span>
        ))}
      </div>
      <div className="absolute inset-0 flex">
        {children.split("").map((l, i) => (
          <motion.span
            variants={{
              initial: { y: "100%" },
              hovered: { y: 0 },
            }}
            transition={{
              duration: DURATION,
              ease: [0.6, 0.01, 0.05, 0.95],
              delay: STAGGER * i,
            }}
            className="inline-block"
            key={i}
          >
            {l === " " ? "\u00A0" : l}
          </motion.span>
        ))}
      </div>
    </motion.span>
  );
};

export default TextRoll;
