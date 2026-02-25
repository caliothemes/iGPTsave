import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { cn } from "@/lib/utils";
import MessageBubble from './MessageBubble';
import EffectVariantsRow from './EffectVariantsRow';
import VisualCard from './VisualCard';
import { useLanguage } from '@/components/LanguageContext';

export default function MessagesContainer({
  messages,
  user,
  currentVisual,
  favoriteVisuals,
  isGenerating,
  onPromptClick,
  onSelectVariant,
  onToggleFavorite,
  onEdit,
  onImageEditOpen,
  onVideoOpen,
  onCropOpen,
  onFolderClick,
  onEffectApply,
  onDuplicate,
  onVideoGenerated,
  onBackToImage,
  onCropComplete,
  canDownload,
  hasWatermark,
  onRegenerate,
  onDownload,
  onOpenFavorites
}) {
  const { language } = useLanguage();
  const messagesEndRef = useRef(null);
  const lastMessagesLengthRef = useRef(messages.length);

  // Auto-scroll uniquement si nouveau message ajouté
  useEffect(() => {
    if (messages.length > lastMessagesLengthRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    lastMessagesLengthRef.current = messages.length;
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 pb-96">
      <div className="max-w-3xl mx-auto space-y-4">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <React.Fragment key={idx}>
              {/* Message bubble */}
              {msg.content && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <MessageBubble 
                    message={msg} 
                    isStreaming={msg.isStreaming} 
                    user={user}
                    onPromptClick={onPromptClick}
                  />
                </motion.div>
              )}

              {/* Effect Variants Row - Miniatures cliquables */}
              {msg.effectVariants && msg.effectVariants.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center mb-4"
                >
                  <EffectVariantsRow
                    variants={msg.effectVariants}
                    selectedVariant={currentVisual}
                    onSelectVariant={(variant) => onSelectVariant(variant, idx)}
                  />
                </motion.div>
              )}

              {/* Visual card - right after the message if it has one */}
              {msg.visual && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex justify-center"
                  id={`visual-${idx}`}
                >
                  <div className="w-full max-w-md relative">
                    {/* Favorites Button - Only on last visual */}
                    {idx === messages.length - 1 && (
                      <button
                        onClick={onOpenFavorites}
                        className="absolute -right-3 top-3 z-40 flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 translate-x-full"
                      >
                        <Heart className={cn("h-3.5 w-3.5", favoriteVisuals.length > 0 && "fill-white")} />
                        <span className="text-xs font-medium whitespace-nowrap">
                          {language === 'fr' ? 'Mes favoris' : 'My favorites'}
                        </span>
                        {favoriteVisuals.length > 0 && (
                          <span className="px-1.5 py-0.5 bg-white/20 rounded-full text-[10px]">
                            {favoriteVisuals.length}
                          </span>
                        )}
                      </button>
                    )}

                    <VisualCard
                      visual={msg.visual}
                      onRegenerate={onRegenerate}
                      onDownload={onDownload}
                      onToggleFavorite={() => onToggleFavorite(msg.visual, idx)}
                      onEdit={() => onEdit(msg.visual)}
                      onImageEditOpen={onImageEditOpen}
                      onVideoOpen={onVideoOpen}
                      onCropOpen={onCropOpen}
                      onFolderClick={onFolderClick}
                      onEffectApply={onEffectApply}
                      onDuplicate={onDuplicate}
                      onPromptClick={onPromptClick}
                      onVideoGenerated={onVideoGenerated}
                      onBackToImage={onBackToImage}
                      onCropComplete={(newUrl) => onCropComplete(newUrl, idx)}
                      isRegenerating={isGenerating && msg.visual?.id === currentVisual?.id}
                      canDownload={canDownload}
                      hasWatermark={hasWatermark}
                      showValidation={true}
                      showActions={true}
                      onValidate={(action) => {
                        if (action === 'edit') {
                          onEdit(msg.visual);
                        }
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </React.Fragment>
          ))}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}