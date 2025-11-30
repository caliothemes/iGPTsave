import React from 'react';
import { X, Sparkles, Image, FileText, Palette, PenTool, Layout, Share2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const FloatingIcon = ({ Icon, className }) => (
  <div className={`absolute text-white/[0.07] ${className}`}>
    <Icon className="w-full h-full" />
  </div>
);

export default function LogoModal({ isOpen, onClose, content }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-300 rounded-2xl overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900" />
        
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/20 via-transparent to-blue-600/20 animate-pulse" style={{ animationDuration: '4s' }} />
        
        {/* Floating visual icons in background */}
        <div className="absolute inset-0 overflow-hidden">
          <FloatingIcon Icon={Image} className="w-16 h-16 top-4 left-4 rotate-[-15deg]" />
          <FloatingIcon Icon={Palette} className="w-12 h-12 top-8 right-8 rotate-[20deg]" />
          <FloatingIcon Icon={PenTool} className="w-10 h-10 bottom-20 left-8 rotate-[10deg]" />
          <FloatingIcon Icon={Layout} className="w-14 h-14 bottom-8 right-12 rotate-[-10deg]" />
          <FloatingIcon Icon={FileText} className="w-8 h-8 top-1/2 left-2 rotate-[5deg]" />
          <FloatingIcon Icon={Share2} className="w-10 h-10 top-1/3 right-4 rotate-[-20deg]" />
          <FloatingIcon Icon={Sparkles} className="w-6 h-6 bottom-1/3 left-1/4 rotate-[15deg]" />
          <FloatingIcon Icon={Image} className="w-8 h-8 bottom-12 left-1/3 rotate-[-5deg]" />
          
          {/* Decorative circles */}
          <div className="absolute w-32 h-32 rounded-full bg-violet-500/10 -top-10 -right-10 blur-xl" />
          <div className="absolute w-40 h-40 rounded-full bg-blue-500/10 -bottom-16 -left-16 blur-xl" />
          <div className="absolute w-24 h-24 rounded-full bg-purple-500/10 top-1/2 right-0 blur-lg" />
        </div>
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }}
        />
        
        {/* Border glow */}
        <div className="absolute inset-0 rounded-2xl border border-white/20" />
        <div className="absolute inset-[1px] rounded-2xl border border-violet-500/20" />
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg transition-colors z-20"
        >
          <X className="h-4 w-4" />
        </button>
        
        {/* Content */}
        <div className="relative z-10 p-6">
          <div className="prose prose-invert prose-xs max-w-none">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="text-white/75 leading-relaxed mb-2 text-xs">{children}</p>,
                strong: ({ children }) => <strong className="text-violet-300 font-semibold">{children}</strong>,
                h1: ({ children }) => <h1 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4 text-violet-400" />{children}</h1>,
                h2: ({ children }) => <h2 className="text-base font-semibold text-white mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-medium text-white mb-1.5">{children}</h3>,
                ul: ({ children }) => <ul className="list-disc list-inside text-white/75 space-y-0.5 mb-2 text-xs">{children}</ul>,
                li: ({ children }) => <li className="text-xs">{children}</li>,
                a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline">{children}</a>,
              }}
            >
              {content || ''}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}