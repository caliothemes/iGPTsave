import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from "@/lib/utils";
import { X } from 'lucide-react';


function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-1 px-1">
      <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1.2s' }} />
      <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '200ms', animationDuration: '1.2s' }} />
      <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '400ms', animationDuration: '1.2s' }} />
    </div>
  );
}

export default function MessageBubble({ message, isStreaming, thinkingText = "Réflexion...", user }) {
  const isUser = message.role === 'user';
  const isWarning = message.content?.includes('Nouveau sujet détecté') || message.content?.includes('New subject detected') || message.content?.includes('Ajout de texte détecté') || message.content?.includes('Text addition detected');
  const [showImageModal, setShowImageModal] = useState(false);

  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {/* Avatar - for assistant with animated gradient border */}
      {!isUser && (
        <div className={cn(
          "flex-shrink-0 w-12 h-12 rounded-full p-[2px] shadow-lg relative",
          isStreaming ? "bg-gradient-streaming shadow-violet-500/40" : "bg-gradient-success shadow-emerald-500/40"
        )}>
          <div className="w-full h-full rounded-full overflow-hidden bg-[#0a0a0f] p-1">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692a3549022b223ef419900f/1df0e0151_iGPT-icon.png" 
              alt="iGPT" 
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <style>{`
            .bg-gradient-streaming {
              background: linear-gradient(90deg, #8b5cf6, #3b82f6, #ec4899, #8b5cf6, #3b82f6);
              background-size: 400% 100%;
              animation: gradient-streaming 2s linear infinite;
            }
            .bg-gradient-success {
              background: linear-gradient(135deg, #10b981, #059669, #047857);
            }
            @keyframes gradient-streaming {
              0% { background-position: 0% 50%; }
              100% { background-position: 400% 50%; }
            }
          `}</style>
        </div>
      )}
      {/* Avatar - for user (no border) */}
      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden order-last">
          {user?.profile_image ? (
            <img src={user.profile_image} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.full_name?.[0] || user?.email?.[0] || 'U'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Message Content */}
      <div className={cn("max-w-[85%]", isUser && "text-right")}>
        <div className={cn(
          "inline-block rounded-2xl px-4 py-3",
          isUser 
            ? "bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/10 text-white shadow-lg" 
            : isWarning
              ? "bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-violet-500/10 backdrop-blur-md border border-amber-500/30 text-white/90 shadow-lg shadow-amber-500/10"
              : "bg-gradient-to-br from-violet-500/10 to-purple-500/5 backdrop-blur-md border border-violet-500/10 text-white/90 shadow-lg shadow-violet-500/5"
        )}>
          {isStreaming ? (
            <TypingIndicator />
          ) : (
            <ReactMarkdown 
              className="prose prose-invert prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
              components={{
                img: ({ src, alt, ...props }) => (
                  <div 
                    className="relative group cursor-pointer my-2 rounded-lg overflow-hidden inline-block max-w-full"
                    onClick={() => setShowImageModal(src)}
                  >
                    <img 
                      src={src} 
                      alt={alt}
                      className="rounded-lg max-w-full transition-all group-hover:brightness-75"
                      {...props}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ),
                p: ({ children }) => <p className="my-1 leading-relaxed text-sm">{children}</p>,
                ul: ({ children }) => <ul className="my-2 ml-4 list-disc space-y-1 text-sm">{children}</ul>,
                ol: ({ children }) => <ol className="my-2 ml-4 list-decimal space-y-1 text-sm">{children}</ol>,
                li: ({ children }) => <li className="my-0.5">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold text-violet-300">{children}</strong>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 z-[110] p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 transition-all"
          >
            <X className="h-5 w-5 text-red-400" />
          </button>
          <div 
            className="relative max-w-[90vw] max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={showImageModal}
              alt="Preview"
              className="w-full h-full object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}