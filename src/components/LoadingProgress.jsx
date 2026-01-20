import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';

export default function LoadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const duration = 2000; // 2 seconds
    const interval = 20; // Update every 20ms
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          return 100;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const circumference = 2 * Math.PI * 90; // radius = 90
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      {/* Circular progress bar */}
      <svg className="absolute" width="220" height="220" style={{ transform: 'rotate(-90deg)' }}>
        {/* Background circle */}
        <circle
          cx="110"
          cy="110"
          r="90"
          fill="none"
          stroke="rgba(139, 92, 246, 0.1)"
          strokeWidth="8"
        />
        {/* Progress circle */}
        <motion.circle
          cx="110"
          cy="110"
          r="90"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.2s ease' }}
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>

      {/* Logo in center */}
      <div className="relative z-10">
        <Logo size="large" animate showText={false} />
      </div>

      {/* Percentage text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute bottom-[-40px] text-white/60 text-sm font-medium"
      >
        {Math.round(progress)}%
      </motion.div>
    </div>
  );
}