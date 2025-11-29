import React from 'react';

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692a3549022b223ef419900f/f227f1937_iGPT.png";

export default function Logo({ size = 'default', showText = true, animate = false }) {
  const sizes = {
    small: { img: 32, text: 'text-xl' },
    default: { img: 48, text: 'text-2xl' },
    large: { img: 200, text: 'text-4xl' }
  };

  const { img, text } = sizes[size];

  return (
    <div className="flex flex-col items-center gap-2 relative">
      {/* Animated glow rings - only on large size with animate */}
      {animate && size === 'large' && (
        <>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="absolute w-[220px] h-[220px] rounded-full border-2 border-violet-500/60 animate-ping-slow" />
            <div className="absolute w-[260px] h-[260px] rounded-full border-2 border-blue-500/50 animate-ping-slower" />
            <div className="absolute w-[240px] h-[240px] rounded-full bg-gradient-to-r from-violet-500/10 to-blue-500/10 animate-pulse-glow" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[180px] h-[180px] rounded-full bg-gradient-conic from-violet-500/20 via-transparent to-blue-500/20 animate-spin-slow" />
          </div>
        </>
      )}
      
      <img 
        src={LOGO_URL} 
        alt="iGPT" 
        style={{ width: img, height: img }}
        className={`object-contain relative z-10 ${animate ? 'animate-float' : ''}`}
      />
      {showText && (
        <span className={`${text} font-bold text-white`}>
          iGPT
        </span>
      )}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0; }
          45% { transform: scale(1); opacity: 0; }
          48% { transform: scale(1.05); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.4; }
          52% { transform: scale(1.05); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
        .animate-ping-slow {
          animation: ping-slow 3s ease-in-out infinite;
        }
        @keyframes ping-slower {
          0% { transform: scale(1); opacity: 0; }
          45% { transform: scale(1); opacity: 0; }
          48% { transform: scale(1.1); opacity: 0.4; }
          50% { transform: scale(1.15); opacity: 0.35; }
          52% { transform: scale(1.1); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
        .animate-ping-slower {
          animation: ping-slower 3s ease-in-out infinite;
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .bg-gradient-conic {
          background: conic-gradient(from 0deg, rgba(139, 92, 246, 0.2), transparent 60deg, transparent 300deg, rgba(59, 130, 246, 0.2) 360deg);
        }
      `}</style>
    </div>
  );
}