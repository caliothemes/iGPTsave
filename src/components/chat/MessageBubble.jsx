import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from "@/lib/utils";
import { X, Users, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';


function TypingIndicator() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2.5 py-1 px-1">
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1.2s' }} />
        <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '200ms', animationDuration: '1.2s' }} />
        <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '400ms', animationDuration: '1.2s' }} />
      </div>
      <span className="text-xs text-violet-300/70 font-medium tabular-nums">
        {seconds}s
      </span>
    </div>
  );
}

export default function MessageBubble({ message, isStreaming, thinkingText = "Réflexion...", user, onPromptClick }) {
  const { language } = useLanguage();
  const isUser = message.role === 'user';
  const isWarning = message.content?.includes('Nouveau sujet détecté') || message.content?.includes('New subject detected') || message.content?.includes('Ajout de texte détecté') || message.content?.includes('Text addition detected');
  const [showImageModal, setShowImageModal] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);

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
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692a3549022b223ef419900f/7b5e0f746_icon.png" 
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
        <div 
          className={cn(
            "inline-block rounded-2xl px-4 py-3",
            isUser 
              ? "bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/10 text-white shadow-lg cursor-pointer hover:border-violet-500/30 transition-all" 
              : isWarning
                ? "bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-violet-500/10 backdrop-blur-md border border-amber-500/30 text-white/90 shadow-lg shadow-amber-500/10"
                : "bg-gradient-to-br from-violet-500/10 to-purple-500/5 backdrop-blur-md border border-violet-500/10 text-white/90 shadow-lg shadow-violet-500/5"
          )}
          onClick={() => {
            if (isUser && !isStreaming) {
              setShowPromptModal(true);
            }
          }}
        >
          {isStreaming ? (
            <TypingIndicator />
          ) : (
            <>
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

              {/* Attached Images - dans la bulle pour user */}
              {isUser && message.attachedImages && message.attachedImages.length > 0 && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                  {message.attachedImages.map((img, idx) => (
                    <div 
                      key={idx} 
                      className="relative group cursor-pointer"
                      onClick={() => setShowImageModal(img)}
                    >
                      <img 
                        src={img} 
                        alt="" 
                        className="w-20 h-20 object-cover rounded-lg border border-white/20 hover:border-white/40 transition-all hover:scale-105" 
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-lg">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tags sous la bulle pour user */}
              {isUser && (message.selectedFormat || message.selectedCategory || message.artDirector || message.canvaMode || message.variantCount) && (
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  {message.selectedFormat && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-green-600/20 border border-green-500/30 text-green-300">
                      <span>{message.selectedFormat}</span>
                    </div>
                  )}
                  {message.selectedCategory && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-violet-600/20 border border-violet-500/30 text-violet-300">
                      <span>{message.selectedCategory}</span>
                    </div>
                  )}
                  {message.artDirector && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-600/20 border border-blue-500/30 text-blue-300">
                      <Users className="w-3.5 h-3.5" />
                      <span>DA: {message.artDirector}</span>
                    </div>
                  )}
                  {message.canvaMode && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-pink-600/20 border border-pink-500/30 text-pink-300">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Canva {message.canvaTextsCount > 0 && `(${message.canvaTextsCount})`}</span>
                    </div>
                  )}
                  {message.variantCount && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-600/20 border border-emerald-500/30 text-emerald-300">
                      <span>x{message.variantCount}</span>
                    </div>
                  )}
                </div>
              )}
            </>
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

      {/* Prompt Modal - For User Messages */}
      {isUser && (
        <Dialog open={showPromptModal} onOpenChange={setShowPromptModal}>
          <DialogContent className="bg-gray-900 border-white/10 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <svg className="h-5 w-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                {language === 'fr' ? 'Votre prompt' : 'Your prompt'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 max-h-96 overflow-y-auto">
                <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(message.content);
                    toast.success(language === 'fr' ? 'Prompt copié' : 'Prompt copied');
                  }}
                  className="flex-1 bg-violet-600 hover:bg-violet-700"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {language === 'fr' ? 'Copier le prompt' : 'Copy prompt'}
                </Button>
                {onPromptClick && (
                  <Button
                    onClick={() => {
                      onPromptClick(message.content);
                      setShowPromptModal(false);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {language === 'fr' ? 'Réutiliser' : 'Reuse'}
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}