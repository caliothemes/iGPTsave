import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, X, Sparkles, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/components/LanguageContext';
import { base44 } from '@/api/base44Client';
import VideoExamplesModal from './VideoExamplesModal';
import NoCreditsModal from '@/components/NoCreditsModal';
import GuestCreditsModal from '@/components/GuestCreditsModal';
import { createPageUrl } from '@/utils';

export default function VideoGenerationModal({ visual, isOpen, onClose, onVideoGenerated, user, credits, guestPrompts }) {
  const { language } = useLanguage();
  const [provider, setProvider] = useState(null); // null = aucun sélectionné
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [wanAspectRatio, setWanAspectRatio] = useState('16:9');
  const [duration, setDuration] = useState(5);
  const [soraAspectRatio, setSoraAspectRatio] = useState('16:9');
  const [seedanceAspectRatio, setSeedanceAspectRatio] = useState('16:9');
  const [seedanceGenerateAudio, setSeedanceGenerateAudio] = useState(true);
  const [audioFile, setAudioFile] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [autoPrompt, setAutoPrompt] = useState(false);
  const [promptExamples, setPromptExamples] = useState([]);
  const [showExamplesModal, setShowExamplesModal] = useState(false);
  const [showNoCreditsModal, setShowNoCreditsModal] = useState(false);
  const [showGuestCreditsModal, setShowGuestCreditsModal] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const optionsRef = React.useRef(null);

  React.useEffect(() => {
    if (isOpen) {
      setProvider(null);
      setPrompt('');
      setAutoPrompt(false);
    }
  }, [isOpen]);

  React.useEffect(() => {
    const loadPromptExamples = async () => {
      try {
        const examples = await base44.entities.VideoPromptExample.filter({ is_active: true }, 'order');
        setPromptExamples(examples);
      } catch (e) {
        console.error('Failed to load prompt examples:', e);
      }
    };
    if (isOpen) {
      loadPromptExamples();
    }
  }, [isOpen]);

  React.useEffect(() => {
    // Reset duration when provider changes
    if (provider === 'sora') {
      setDuration(4);
    } else if (provider === 'seedance') {
      setDuration(8);
    } else {
      setDuration(5);
    }
    // Scroll to options when a provider is selected
    if (provider !== null) {
      setTimeout(() => {
        optionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [provider]);

  const handleGenerate = async () => {
    // Vérification des crédits AVANT la génération
    if (!user) {
      // Guest : max 3 prompts
      if (guestPrompts >= 3) {
        setShowGuestCreditsModal(true);
        return;
      }
    } else if (credits) {
      // User connecté : vérifier les crédits
      const totalCredits = (credits?.free_downloads || 0) + (credits?.paid_credits || 0);
      const isUnlimited = credits?.subscription_type === 'unlimited';
      const isAdmin = user?.role === 'admin';
      
      if (!isAdmin && !isUnlimited && totalCredits <= 0) {
        setShowNoCreditsModal(true);
        return;
      }
    }

    // Define final prompt first
    const finalPrompt = autoPrompt 
      ? 'Dynamic cinematic camera movement with slow zoom in, elegant smooth panning motion, professional color grading with rich contrast, dramatic lighting transitions, subtle depth of field effects, film-like motion blur, atmospheric glow and bokeh, sophisticated parallax effect, seamless fluid animation, premium production quality'
      : prompt.trim();
    
    if (!finalPrompt) return;

    setIsGenerating(true);
    setProgress(0);
    setElapsedTime(0);
    
    // Start timer
    const startTime = Date.now();
    const timerInterval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    try {
      if (!provider) return; // sécurité si aucun modèle sélectionné

      if (provider === 'replicate' || provider === 'wan' || provider === 'sora' || provider === 'seedance') {
        // Replicate Kling/Wan/Sora generation
        setProgress(10);
        
        console.log(`[FRONTEND DEBUG] Provider: ${provider}, Duration state: ${duration}, Type: ${typeof duration}`);
        
        // Simulate progressive loading
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 95) return prev;
            return prev + Math.random() * 5;
          });
        }, 1000);

        // Build payload step by step to ensure duration is included
        const durationValue = Number(duration);
        console.log(`[FRONTEND DEBUG] Duration value to send: ${durationValue}, Type: ${typeof durationValue}`);
        
        const payload = {
          image_url: visual.image_url,
          prompt: finalPrompt,
          model: provider === 'wan' ? 'wan' : provider === 'sora' ? 'sora' : provider === 'seedance' ? 'seedance' : 'kling'
        };
        
        // Explicitly add duration
        payload.duration = durationValue;
        
        console.log(`[FRONTEND DEBUG] Payload after adding duration:`, JSON.stringify(payload, null, 2));

        if (provider === 'replicate') {
          payload.aspect_ratio = aspectRatio;
        } else if (provider === 'sora') {
          payload.aspect_ratio = soraAspectRatio;
        } else if (provider === 'wan') {
          payload.aspect_ratio = wanAspectRatio;
        } else if (provider === 'seedance') {
          payload.aspect_ratio = seedanceAspectRatio;
          payload.generate_audio = seedanceGenerateAudio;
        }

        if (provider === 'wan' && audioFile) {
          // Upload audio first
          const { file_url } = await base44.integrations.Core.UploadFile({ file: audioFile });
          payload.audio_url = file_url;
        }

        console.log(`[FRONTEND DEBUG] Final payload being sent:`, JSON.stringify(payload, null, 2));
        const response = await base44.functions.invoke('generateReplicateVideo', payload);

        console.log('Replicate response:', response);

        if (response.data.error) {
          clearInterval(progressInterval);
          throw new Error(response.data.error);
        }

        // Start polling for completion
        const predictionId = response.data.prediction_id;
        console.log('Prediction ID:', predictionId);

        const pollForCompletion = async () => {
          // Timeout adapté selon le modèle et la durée
          let maxWaitTime = 400000; // 400s par défaut
          if (provider === 'sora') {
            if (durationValue === 4) maxWaitTime = 400000; // 6m40s
            else if (durationValue === 8) maxWaitTime = 600000; // 10min
            else if (durationValue === 12) maxWaitTime = 900000; // 15min
          }
          const startTime = Date.now();
          
          while (true) {
            const elapsed = Date.now() - startTime;
            
            if (elapsed > maxWaitTime) {
              clearInterval(progressInterval);
              throw new Error(language === 'fr' 
                ? 'Timeout après 400s. Réessayez avec un prompt plus simple.' 
                : 'Timeout after 400s. Retry with simpler prompt.');
            }

            await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
            
            try {
              const statusResponse = await base44.functions.invoke('checkReplicateVideo', { 
                prediction_id: predictionId 
              });

              const elapsedSec = Math.round(elapsed / 1000);
              console.log(`[${elapsedSec}s] Status:`, statusResponse.data.status);

              if (statusResponse.data.status === 'succeeded') {
                clearInterval(progressInterval);
                clearInterval(timerInterval);
                setProgress(100);
                
                setTimeout(() => {
                  const modelName = provider === 'wan' ? 'Wan v2.6 I2V' : provider === 'sora' ? 'Sora 2 Pro' : provider === 'seedance' ? 'Seedance 1.5 Pro' : 'Kling v2.5 Pro';
                  const promptWithMetadata = `[${modelName}] [${duration}s] ${finalPrompt}`;
                  
                  // Calculate aspect ratio for Wan based on source image dimensions
                  let videoAspectRatio;
                  if (provider === 'replicate') {
                    videoAspectRatio = aspectRatio;
                  } else if (provider === 'sora') {
                    videoAspectRatio = soraAspectRatio;
                  } else if (provider === 'seedance') {
                    videoAspectRatio = seedanceAspectRatio;
                  } else if (provider === 'wan') {
                    // Wan keeps source image ratio
                    if (visual.dimensions) {
                      const [w, h] = visual.dimensions.split('x').map(Number);
                      if (w === h) videoAspectRatio = '1:1';
                      else if (w > h) videoAspectRatio = '16:9';
                      else videoAspectRatio = '9:16';
                    } else {
                      videoAspectRatio = '1:1'; // default
                    }
                  }
                  
                  onVideoGenerated(statusResponse.data.video_url, promptWithMetadata, videoAspectRatio);
                  onClose();
                }, 500);
                break;
              } else if (statusResponse.data.status === 'failed' || statusResponse.data.status === 'canceled') {
                clearInterval(progressInterval);
                clearInterval(timerInterval);
                throw new Error(statusResponse.data.error || `Replicate: ${statusResponse.data.status}`);
              }
              
              // Update progress based on elapsed time (approximation)
              const progressPercent = Math.min(95, (elapsed / maxWaitTime) * 100);
              setProgress(progressPercent);
              
            } catch (pollError) {
              console.error('Polling error:', pollError);
              clearInterval(progressInterval);
              clearInterval(timerInterval);
              throw pollError;
            }
          }
        };

        pollForCompletion();

      } else {
        // Runway generation (existing code)
        const response = await base44.functions.invoke('generateVideo', {
          image_url: visual.image_url,
          prompt: finalPrompt,
          duration: duration,
          dimensions: visual.dimensions
        });

        console.log('Generate video response:', response);

        if (!response.data || response.data.error) {
          throw new Error(response.data?.error || 'Erreur serveur');
        }

        if (!response.data.task_id) {
          throw new Error('Pas de task_id retourné');
        }

        const { task_id } = response.data;
        console.log('Task ID:', task_id);

        // Poll for status
        const pollInterval = setInterval(async () => {
          try {
            const statusResponse = await base44.functions.invoke('checkVideoStatus', { task_id });
            console.log('Status response:', statusResponse);

            if (!statusResponse.data) {
              clearInterval(pollInterval);
              setIsGenerating(false);
              alert(language === 'fr' ? 'Erreur: pas de données reçues' : 'Error: no data received');
              return;
            }

            const { status, progress: currentProgress, video_url, failure } = statusResponse.data;

            // Progress is a decimal (0.0 to 1.0), convert to percentage
            if (currentProgress !== undefined && currentProgress !== null) {
              setProgress(currentProgress * 100);
            }

            if (status === 'SUCCEEDED' && video_url) {
              clearInterval(pollInterval);
              setIsGenerating(false);
              // Add metadata to prompt for badge display
              const promptWithMetadata = `[RunwayML Gen-3] [${duration}s] ${finalPrompt}`;
              onVideoGenerated(video_url, promptWithMetadata);
              onClose();
            } else if (status === 'FAILED') {
              clearInterval(pollInterval);
              setIsGenerating(false);
              alert(language === 'fr' 
                ? `Erreur: ${failure || 'Échec de génération'}` 
                : `Error: ${failure || 'Generation failed'}`);
            }
          } catch (pollError) {
            console.error('Poll error:', pollError);
            clearInterval(pollInterval);
            clearInterval(timerInterval);
            setIsGenerating(false);
            alert(language === 'fr' ? `Erreur de vérification: ${pollError.message}` : `Status check error: ${pollError.message}`);
          }
        }, 3000);
      }

    } catch (error) {
      console.error('Generation error:', error);
      clearInterval(timerInterval);
      setIsGenerating(false);
      const errorMsg = error.message || error.toString();
      alert(language === 'fr' 
        ? `Erreur lors de la génération: ${errorMsg}` 
        : `Generation error: ${errorMsg}`);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-400" />
              {language === 'fr' ? 'Animer ce visuel' : 'Animate this visual'}
            </h3>
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="text-white/60 hover:text-white transition-colors disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Preview Image */}
          <div className="mb-4 rounded-xl overflow-hidden bg-black/20">
            <img 
              src={visual.image_url}
              alt="Preview"
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Provider Selection avec points forts intégrés */}
          <div className="mb-4">
            <label className="text-white/80 text-sm mb-2 block">
              {language === 'fr' ? 'Choisissez un service de génération' : 'Choose a generation service'}
            </label>
            <div className="grid grid-cols-1 gap-2">
              {/* Kling */}
              <button
                onClick={() => setProvider('replicate')}
                disabled={isGenerating}
                className={`w-full px-4 py-3 rounded-xl border transition-all text-left disabled:opacity-50 ${
                  provider === 'replicate'
                    ? 'bg-violet-600/20 border-violet-500 text-white'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                 <div>
                   <span className="font-bold text-sm">Kling v2.5</span>
                   <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded ${provider === 'replicate' ? 'bg-violet-500/30 text-violet-200' : 'bg-white/10 text-white/50'}`}>Turbo Pro</span>
                 </div>
                 <div className="text-right">
                   <div className={`text-[10px] ${provider === 'replicate' ? 'text-violet-300' : 'text-white/40'}`}>5s / 10s</div>
                   <div className={`text-[10px] font-medium ${provider === 'replicate' ? 'text-violet-200' : 'text-white/30'}`}>195 – 295 {language === 'fr' ? 'crédits' : 'credits'}</div>
                 </div>
                </div>
                <div className="space-y-1">
                  {[{ label: language === 'fr' ? 'Réalisme' : 'Realism', w: '95%', color: 'from-violet-500 to-violet-400' }, { label: language === 'fr' ? 'Cohérence' : 'Coherence', w: '90%', color: 'from-cyan-500 to-cyan-400' }, { label: language === 'fr' ? 'Vidéo produit' : 'Product video', w: '80%', color: 'from-orange-500 to-amber-400' }].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                      <span className="text-[10px] text-white/50 w-20 shrink-0">{item.label}</span>
                      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${item.color}`} style={{ width: item.w }} />
                      </div>
                    </div>
                  ))}
                </div>
                </button>

                {/* Seedance */}
              <button
                onClick={() => setProvider('seedance')}
                disabled={isGenerating}
                className={`w-full px-4 py-3 rounded-xl border transition-all text-left disabled:opacity-50 ${
                  provider === 'seedance'
                    ? 'bg-cyan-600/20 border-cyan-500 text-white'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                 <div>
                   <span className="font-bold text-sm">Seedance 1.5</span>
                   <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded ${provider === 'seedance' ? 'bg-cyan-500/30 text-cyan-200' : 'bg-white/10 text-white/50'}`}>Pro 1080p</span>
                   <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">{language === 'fr' ? 'Audio IA' : 'AI Audio'}</span>
                 </div>
                 <div className="text-right">
                   <div className={`text-[10px] ${provider === 'seedance' ? 'text-cyan-300' : 'text-white/40'}`}>8s / 12s</div>
                   <div className={`text-[10px] font-medium ${provider === 'seedance' ? 'text-cyan-200' : 'text-white/30'}`}>165 – 185 {language === 'fr' ? 'crédits' : 'credits'}</div>
                 </div>
                </div>
                <div className="space-y-1">
                  {[{ label: language === 'fr' ? 'Réalisme' : 'Realism', w: '98%', color: 'from-violet-500 to-violet-400' }, { label: language === 'fr' ? 'Cohérence' : 'Coherence', w: '95%', color: 'from-cyan-500 to-cyan-400' }, { label: language === 'fr' ? 'Vidéo produit' : 'Product video', w: '88%', color: 'from-orange-500 to-amber-400' }].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                      <span className="text-[10px] text-white/50 w-20 shrink-0">{item.label}</span>
                      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${item.color}`} style={{ width: item.w }} />
                      </div>
                    </div>
                  ))}
                </div>
              </button>

              {/* Wan */}
              <button
                onClick={() => setProvider('wan')}
                disabled={isGenerating}
                className={`w-full px-4 py-3 rounded-xl border transition-all text-left disabled:opacity-50 ${
                  provider === 'wan'
                    ? 'bg-blue-600/20 border-blue-500 text-white'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                 <div>
                   <span className="font-bold text-sm">Wan v2.6</span>
                   <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded ${provider === 'wan' ? 'bg-blue-500/30 text-blue-200' : 'bg-white/10 text-white/50'}`}>I2V 720p</span>
                   <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">{language === 'fr' ? 'Audio IA' : 'AI Audio'}</span>
                 </div>
                 <div className="text-right">
                   <div className={`text-[10px] ${provider === 'wan' ? 'text-blue-300' : 'text-white/40'}`}>5s / 10s</div>
                   <div className={`text-[10px] font-medium ${provider === 'wan' ? 'text-blue-200' : 'text-white/30'}`}>195 – 295 {language === 'fr' ? 'crédits' : 'credits'}</div>
                 </div>
                </div>
                <div className="space-y-1">
                  {[{ label: language === 'fr' ? 'Réalisme' : 'Realism', w: '90%', color: 'from-violet-500 to-violet-400' }, { label: language === 'fr' ? 'Cohérence' : 'Coherence', w: '85%', color: 'from-cyan-500 to-cyan-400' }, { label: language === 'fr' ? 'Vidéo produit' : 'Product video', w: '93%', color: 'from-orange-500 to-amber-400' }].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                      <span className="text-[10px] text-white/50 w-20 shrink-0">{item.label}</span>
                      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${item.color}`} style={{ width: item.w }} />
                      </div>
                    </div>
                  ))}
                </div>
              </button>

              {/* Sora */}
              <button
                onClick={() => setProvider('sora')}
                disabled={isGenerating}
                className={`w-full px-4 py-3 rounded-xl border transition-all text-left disabled:opacity-50 ${
                  provider === 'sora'
                    ? 'bg-pink-600/20 border-pink-500 text-white'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                 <div>
                   <span className="font-bold text-sm">Sora 2 Pro</span>
                   <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded ${provider === 'sora' ? 'bg-pink-500/30 text-pink-200' : 'bg-white/10 text-white/50'}`}>OpenAI</span>
                   <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">{language === 'fr' ? 'Audio IA' : 'AI Audio'}</span>
                 </div>
                 <div className="text-right">
                   <div className={`text-[10px] ${provider === 'sora' ? 'text-pink-300' : 'text-white/40'}`}>4s / 8s / 12s</div>
                   <div className={`text-[10px] font-medium ${provider === 'sora' ? 'text-pink-200' : 'text-white/30'}`}>295 – 695 {language === 'fr' ? 'crédits' : 'credits'}</div>
                 </div>
                </div>
                <div className="space-y-1">
                  {[{ label: language === 'fr' ? 'Réalisme' : 'Realism', w: '100%' }, { label: language === 'fr' ? 'Cohérence' : 'Coherence', w: '100%' }, { label: language === 'fr' ? 'Vidéo produit' : 'Product video', w: '98%' }].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                      <span className="text-[10px] text-white/50 w-20 shrink-0">{item.label}</span>
                      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-pink-500 to-rose-400" style={{ width: item.w }} />
                      </div>
                    </div>
                  ))}
                </div>
              </button>

              {/* RunwayML */}
              <button
                onClick={() => setProvider('runway')}
                disabled={isGenerating}
                className={`w-full px-4 py-3 rounded-xl border transition-all text-left disabled:opacity-50 ${
                  provider === 'runway'
                    ? 'bg-amber-600/20 border-amber-500 text-white'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                 <div>
                   <span className="font-bold text-sm">RunwayML</span>
                   <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded ${provider === 'runway' ? 'bg-amber-500/30 text-amber-200' : 'bg-white/10 text-white/50'}`}>Gen-3 Alpha Turbo</span>
                 </div>
                 <div className="text-right">
                   <div className={`text-[10px] ${provider === 'runway' ? 'text-amber-300' : 'text-white/40'}`}>5s / 10s</div>
                   <div className={`text-[10px] font-medium ${provider === 'runway' ? 'text-amber-200' : 'text-white/30'}`}>195 – 295 {language === 'fr' ? 'crédits' : 'credits'}</div>
                 </div>
                </div>
                <div className="space-y-1">
                  {[{ label: language === 'fr' ? 'Réalisme' : 'Realism', w: '85%' }, { label: language === 'fr' ? 'Cohérence' : 'Coherence', w: '80%' }, { label: language === 'fr' ? 'Vidéo produit' : 'Product video', w: '70%' }].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                      <span className="text-[10px] text-white/50 w-20 shrink-0">{item.label}</span>
                      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400" style={{ width: item.w }} />
                      </div>
                    </div>
                  ))}
                </div>
              </button>
            </div>
          </div>

          {/* Tout ce qui suit n'est affiché que si un modèle est sélectionné */}
          {provider !== null && (<div ref={optionsRef}>
          <div className="flex items-center gap-3 mb-4 mt-1">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/60 text-xs font-medium tracking-wide uppercase">
              {language === 'fr' ? 'Réglez vos options' : 'Configure your options'}
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Service Info */}
          <div className={`mb-4 p-3 rounded-xl border ${
            provider === 'replicate' 
              ? 'bg-violet-500/10 border-violet-500/20'
              : provider === 'wan'
              ? 'bg-blue-500/10 border-blue-500/20'
              : provider === 'sora'
              ? 'bg-pink-500/10 border-pink-500/20'
              : provider === 'seedance'
              ? 'bg-cyan-500/10 border-cyan-500/20'
              : 'bg-amber-500/10 border-amber-500/20'
          }`}>
            <div className="flex items-start gap-2">
              <svg className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
                provider === 'replicate' ? 'text-violet-400' : provider === 'wan' ? 'text-blue-400' : provider === 'sora' ? 'text-pink-400' : provider === 'seedance' ? 'text-cyan-400' : 'text-amber-400'
              }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className={`font-medium text-xs mb-0.5 ${
                  provider === 'replicate' ? 'text-violet-200' : provider === 'wan' ? 'text-blue-200' : provider === 'sora' ? 'text-pink-200' : provider === 'seedance' ? 'text-cyan-200' : 'text-amber-200'
                }`}>
                  {provider === 'replicate' 
                    ? 'Kling v2.5 Turbo Pro'
                    : provider === 'wan'
                    ? 'Wan-video v2.6 I2V'
                    : provider === 'sora'
                    ? 'Sora 2 Pro by OpenAI'
                    : provider === 'seedance'
                    ? 'Seedance 1.5 Pro by ByteDance'
                    : 'RunwayML Gen-3 Alpha Turbo'}
                </p>
                <p className={`text-xs leading-relaxed ${
                 provider === 'replicate' ? 'text-violet-300/80' : provider === 'wan' ? 'text-blue-300/80' : provider === 'sora' ? 'text-pink-300/80' : provider === 'seedance' ? 'text-cyan-300/80' : 'text-amber-200/80'
                }`}>
                 {provider === 'replicate'
                    ? (language === 'fr' 
                        ? <>Vidéo cinématographique pro.<br />5s = 195 crédits, 10s = 295 crédits</> 
                        : <>Professional cinematic video.<br />5s = 195 credits, 10s = 295 credits</>)
                     : provider === 'wan'
                     ? (language === 'fr'
                         ? <>Vidéo produit en 720p avec audio optionnel.<br />5s = 195 crédits, 10s = 295 crédits</>
                         : <>Product video in 720p with optional audio.<br />5s = 195 credits, 10s = 295 credits</>)
                     : provider === 'sora'
                     ? (language === 'fr'
                         ? <>Génération ultra-réaliste par OpenAI.<br />4s = 295 crédits, 8s = 495 crédits, 12s = 695 crédits</>
                         : <>Ultra-realistic generation by OpenAI.<br />4s = 295 credits, 8s = 495 credits, 12s = 695 credits</>)
                     : provider === 'seedance'
                     ? (language === 'fr'
                         ? <>Vidéo 1080p HD avec audio IA synchronisé.<br />8s = 165 crédits, 12s = 185 crédits</>
                         : <>1080p HD video with synchronized AI audio.<br />8s = 165 credits, 12s = 185 credits</>)
                     : (language === 'fr'
                         ? <>Animation fluide HD uniquement en 16:9.<br />5s = 195 crédits, 10s = 295 crédits</>
                         : <>Smooth HD animation 16:9 only.<br />5s = 195 credits, 10s = 295 credits</>)}
                </p>
              </div>
            </div>
            </div>

            {/* Aspect Ratio - Only for Replicate */}
            {provider === 'replicate' && (
            <div className="mb-4">
              <label className="text-white/80 text-sm mb-2 block">
                {language === 'fr' ? 'Format vidéo' : 'Video format'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['1:1', '9:16', '16:9'].map(ratio => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    disabled={isGenerating}
                    className={`px-3 py-2 rounded-lg border transition-all text-sm disabled:opacity-50 ${
                      aspectRatio === ratio
                        ? 'bg-violet-600 border-violet-500 text-white'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {ratio}
                  </button>
                  ))}
                  </div>
                  </div>
                  )}

            {/* Aspect Ratio - Only for Sora */}
            {provider === 'sora' && (
            <div className="mb-4">
              <label className="text-white/80 text-sm mb-2 block">
                {language === 'fr' ? 'Format vidéo' : 'Video format'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: '3:4', label: language === 'fr' ? 'Portrait (3:4)' : 'Portrait (3:4)' },
                  { value: '16:9', label: language === 'fr' ? 'Paysage (16:9)' : 'Landscape (16:9)' }
                ].map(ratio => (
                  <button
                    key={ratio.value}
                    onClick={() => setSoraAspectRatio(ratio.value)}
                    disabled={isGenerating}
                    className={`px-3 py-2 rounded-lg border transition-all text-sm disabled:opacity-50 ${
                      soraAspectRatio === ratio.value
                        ? 'bg-pink-600 border-pink-500 text-white'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {ratio.label}
                  </button>
                  ))}
                  </div>
                  </div>
                  )}

            {/* Aspect Ratio - Only for Seedance */}
            {provider === 'seedance' && (
            <div className="mb-4">
              <label className="text-white/80 text-sm mb-2 block">
                {language === 'fr' ? 'Format vidéo' : 'Video format'}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['1:1', '3:4', '16:9', '9:16'].map(ratio => (
                  <button
                    key={ratio}
                    onClick={() => setSeedanceAspectRatio(ratio)}
                    disabled={isGenerating}
                    className={`px-3 py-2 rounded-lg border transition-all text-sm disabled:opacity-50 ${
                      seedanceAspectRatio === ratio
                        ? 'bg-cyan-600 border-cyan-500 text-white'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>
            )}

            {/* Generate Audio toggle - Only for Seedance */}
            {provider === 'seedance' && (
            <div className="mb-4">
              <button
                onClick={() => setSeedanceGenerateAudio(!seedanceGenerateAudio)}
                disabled={isGenerating}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 hover:border-cyan-500/30 transition-all disabled:opacity-50"
              >
                <div className={`flex-shrink-0 w-11 h-6 rounded-full transition-all ${seedanceGenerateAudio ? 'bg-cyan-600' : 'bg-white/20'}`}>
                  <div className={`w-5 h-5 mt-0.5 rounded-full bg-white transition-transform duration-200 ${seedanceGenerateAudio ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'}`} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white text-sm font-medium">
                    {language === 'fr' ? 'Générer de l\'audio' : 'Generate audio'}
                  </p>
                  <p className="text-white/50 text-xs">
                    {language === 'fr'
                      ? 'L\'IA synchronise automatiquement des sons avec la vidéo'
                      : 'AI automatically synchronizes sounds with the video'}
                  </p>
                </div>
              </button>
            </div>
            )}

            {/* Aspect Ratio - Only for Wan */}
            {provider === 'wan' && (
            <div className="mb-4">
              <label className="text-white/80 text-sm mb-2 block">
                {language === 'fr' ? 'Format vidéo' : 'Video format'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['1:1', '9:16', '16:9'].map(ratio => (
                  <button
                    key={ratio}
                    onClick={() => setWanAspectRatio(ratio)}
                    disabled={isGenerating}
                    className={`px-3 py-2 rounded-lg border transition-all text-sm disabled:opacity-50 ${
                      wanAspectRatio === ratio
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>
            )}

            {/* Audio Upload - Only show for Wan */}
          {provider === 'wan' && (
            <div className="mb-4">
              <label className="text-white/80 text-sm mb-2 block">
                {language === 'fr' ? 'Audio (optionnel)' : 'Audio (optional)'}
              </label>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setAudioFile(e.target.files[0])}
                disabled={isGenerating}
                className="hidden"
                id="audio-upload"
              />
              <label
                htmlFor="audio-upload"
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {audioFile 
                  ? audioFile.name 
                  : (language === 'fr' ? 'Uploadez votre audio' : 'Upload your audio')}
              </label>
              {audioFile && (
                <button
                  onClick={() => setAudioFile(null)}
                  className="mt-2 text-xs text-white/50 hover:text-white/70 transition-colors"
                >
                  {language === 'fr' ? '✕ Supprimer l\'audio' : '✕ Remove audio'}
                </button>
              )}
            </div>
            )}

            {/* Auto Prompt Toggle */}
          <div className="mb-4">
            <button
              onClick={() => setAutoPrompt(!autoPrompt)}
              disabled={isGenerating}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 hover:border-violet-500/30 transition-all disabled:opacity-50"
            >
              <div className={`flex-shrink-0 w-11 h-6 rounded-full transition-all ${autoPrompt ? 'bg-violet-600' : 'bg-white/20'}`}>
                <div className={`w-5 h-5 mt-0.5 rounded-full bg-white transition-transform duration-200 ${autoPrompt ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'}`} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-white text-sm font-medium">
                  {language === 'fr' ? 'Laissez iGPT gérer la vidéo' : 'Let iGPT handle the video'}
                </p>
                <p className="text-white/50 text-xs">
                  {language === 'fr' 
                    ? 'iGPT choisira le meilleur mouvement cinématique' 
                    : 'iGPT will choose the best cinematic motion'}
                </p>
              </div>
              <svg className="h-5 w-5 text-violet-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          </div>

          {/* Prompt Input - Only show if auto prompt is disabled */}
          {!autoPrompt && (
            <div className="mb-4">
              <label className="text-white/80 text-sm mb-1 block">
                {language === 'fr' 
                  ? 'Comment voulez-vous animer ce visuel ?' 
                  : 'How do you want to animate this visual?'}
              </label>
              <p className="text-white/40 text-xs mb-2">
                {language === 'fr'
                  ? '✨ Soyez détaillé et précis : décrivez le mouvement, la caméra, l\'ambiance, les effets pour des résultats époustouflants.'
                  : '✨ Be detailed and precise: describe movement, camera, atmosphere, effects for stunning results.'}
              </p>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isGenerating}
                placeholder={language === 'fr' 
                  ? 'Ex: Zoom lent vers le logo, rotation douce, mouvement de caméra...' 
                  : 'Ex: Slow zoom on logo, gentle rotation, camera movement...'}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-violet-500/50 transition-all resize-none disabled:opacity-50"
                rows={4}
              />

              {/* Example Prompts - Dynamic from DB */}
              {promptExamples.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <p className="text-white/40 text-[10px] mb-1">
                    {language === 'fr' ? 'Exemples de prompts :' : 'Prompt examples:'}
                  </p>
                  {promptExamples
                    .filter(ex => ex.provider === 'all' || ex.provider === provider || ex.provider === 'both')
                    .map((example, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPrompt(language === 'fr' ? example.prompt_fr : (example.prompt_en || example.prompt_fr))}
                        disabled={isGenerating}
                        className="w-full text-left px-3 py-2 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-violet-200 text-xs transition-all disabled:opacity-50"
                      >
                        {example.icon} {language === 'fr' ? example.short_desc_fr : (example.short_desc_en || example.short_desc_fr)}
                      </button>
                      ))}
                      </div>
                      )}

                      {/* Examples Button - Only show for Replicate */}
                      {provider === 'replicate' && promptExamples.length > 0 && (
                        <button
                          onClick={() => setShowExamplesModal(true)}
                          className="w-full mt-2 px-4 py-3 rounded-lg bg-gradient-to-r from-violet-500/20 to-purple-500/20 hover:from-violet-500/30 hover:to-purple-500/30 border border-violet-500/30 text-violet-300 hover:text-violet-200 transition-all text-sm font-medium"
                        >
                          <Eye className="h-4 w-4 inline mr-2" />
                          {language === 'fr' ? 'Voir des exemples concrets' : 'See real examples'}
                        </button>
                      )}
                      </div>
                      )}

                      {/* Duration Selector */}
                      <div className="mb-6">
                      <label className="text-white/80 text-sm mb-2 block">
                      {language === 'fr' ? 'Durée' : 'Duration'}
                      </label>

                      {/* Sora Duration Warning */}
                      {provider === 'sora' && duration > 4 && (
                      <div className="mb-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <div className="flex items-start gap-2">
                      <svg className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="text-amber-200 text-xs leading-relaxed">
                      {language === 'fr'
                      ? `⏱️ Cela peut aller de 3 à 10 min. Restez sur cette fenêtre.`
                      : `⏱️ This can take 3 to 10 min. Stay on this window.`}
                      </p>
                      </div>
                      </div>
                      )}
            {provider === 'seedance' ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setDuration(8)}
                  disabled={isGenerating}
                  className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                    duration === 8 ? 'bg-cyan-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
                  } disabled:opacity-50`}
                >
                  8s
                </button>
                <button
                  onClick={() => setDuration(12)}
                  disabled={isGenerating}
                  className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                    duration === 12 ? 'bg-cyan-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
                  } disabled:opacity-50`}
                >
                  12s
                </button>
              </div>
            ) : provider === 'sora' ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setDuration(4)}
                  disabled={isGenerating}
                  className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                    duration === 4 
                      ? 'bg-pink-600 text-white' 
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  } disabled:opacity-50`}
                >
                  4s
                </button>
                <button
                  onClick={() => setDuration(8)}
                  disabled={isGenerating}
                  className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                    duration === 8 
                      ? 'bg-pink-600 text-white' 
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  } disabled:opacity-50`}
                >
                  8s
                </button>
                <button
                  onClick={() => setDuration(12)}
                  disabled={isGenerating}
                  className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                    duration === 12 
                      ? 'bg-pink-600 text-white' 
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  } disabled:opacity-50`}
                >
                  12s
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setDuration(5)}
                  disabled={isGenerating}
                  className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                    duration === 5 
                      ? 'bg-violet-600 text-white' 
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  } disabled:opacity-50`}
                >
                  5s
                </button>
                <button
                  onClick={() => setDuration(10)}
                  disabled={isGenerating}
                  className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                    duration === 10 
                      ? 'bg-violet-600 text-white' 
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  } disabled:opacity-50`}
                >
                  10s
                </button>
              </div>
            )}
            <div className="flex justify-center mt-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${
                provider === 'sora' 
                  ? 'bg-pink-500/20 border-pink-500/30 text-pink-300'
                  : provider === 'seedance'
                  ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300'
                  : 'bg-violet-500/20 border-violet-500/30 text-violet-300'
              }`}>
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {provider === 'sora'
                  ? (duration === 4 
                      ? (language === 'fr' ? '295 crédits' : '295 credits')
                      : duration === 8
                      ? (language === 'fr' ? '495 crédits' : '495 credits')
                      : (language === 'fr' ? '695 crédits' : '695 credits'))
                  : provider === 'seedance'
                  ? (duration === 8
                      ? (language === 'fr' ? '165 crédits' : '165 credits')
                      : (language === 'fr' ? '185 crédits' : '185 credits'))
                  : provider === 'replicate' 
                  ? (duration === 5 
                      ? (language === 'fr' ? '195 crédits' : '195 credits') 
                      : (language === 'fr' ? '295 crédits' : '295 credits'))
                  : (duration === 5 
                      ? (language === 'fr' ? '195 crédits' : '195 credits') 
                      : (language === 'fr' ? '295 crédits' : '295 credits'))}
              </span>
            </div>
          </div>

          </div>) /* fin du bloc conditionnel provider !== null */}

          {/* Progress Bar */}
          {isGenerating && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-white/60 mb-2">
                <span>{language === 'fr' ? 'Génération en cours...' : 'Generating...'}</span>
                <div className="flex items-center gap-2">
                  <span className="text-violet-400 font-mono">
                    {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
                  </span>
                  <span>•</span>
                  <span>{Math.round(progress)}%</span>
                </div>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Warning Banner - Only during generation */}
          <AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4"
              >
                <motion.div
                  animate={{ 
                    opacity: [0.5, 1, 0.5],
                    scale: [1, 1.02, 1]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="px-4 py-3 rounded-xl bg-green-600/30 border-2 border-green-400/50 shadow-lg shadow-green-500/20"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-green-100 text-sm leading-relaxed">
                      {language === 'fr' 
                        ? 'La génération de votre vidéo est en cours, cela peut prendre de 2 à 10 min en fonction du modèle et de sa file d\'attente. Ne baissez/fermez pas cette fenêtre pendant le processus. iGPT vous remercie de votre patience...'
                        : 'Your video generation is in progress, it may take 2 to 10 min depending on the model and its queue. Do not minimize/close this window during the process. iGPT thanks you for your patience...'}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              disabled={isGenerating}
              variant="outline"
              className="flex-1 bg-white/5 hover:bg-white/10 border-white/10"
            >
              {language === 'fr' ? 'Annuler' : 'Cancel'}
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={!provider || (!autoPrompt && !prompt.trim()) || isGenerating}
              className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {language === 'fr' ? 'Génération...' : 'Generating...'}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {language === 'fr' ? 'Générer' : 'Generate'}
                </>
              )}
            </Button>
          </div>

          {/* Provider Footer */}
          {provider && <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              {provider === 'replicate' ? (
                <>
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/90 text-xs font-medium">
                      {language === 'fr' ? 'Vidéo générée par Kling AI' : 'Video generated by Kling AI'}
                    </p>
                    <p className="text-white/50 text-[10px]">
                      {language === 'fr' ? 'Qualité cinématographique • v2.5 Turbo Pro' : 'Cinematic quality • v2.5 Turbo Pro'}
                    </p>
                  </div>
                </>
              ) : provider === 'wan' ? (
                <>
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/90 text-xs font-medium">
                      {language === 'fr' ? 'Vidéo générée par Wan-video' : 'Video generated by Wan-video'}
                    </p>
                    <p className="text-white/50 text-[10px]">
                      {language === 'fr' ? 'Vidéo produit 720p • v2.6 I2V' : 'Product video 720p • v2.6 I2V'}
                    </p>
                  </div>
                </>
              ) : provider === 'sora' ? (
                <>
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-pink-600 to-rose-600 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/90 text-xs font-medium">
                      {language === 'fr' ? 'Vidéo générée par OpenAI Sora' : 'Video generated by OpenAI Sora'}
                    </p>
                    <p className="text-white/50 text-[10px]">
                      {language === 'fr' ? 'Ultra-réaliste • Sora 2 Pro' : 'Ultra-realistic • Sora 2 Pro'}
                    </p>
                  </div>
                </>
              ) : provider === 'seedance' ? (
                <>
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/90 text-xs font-medium">
                      {language === 'fr' ? 'Vidéo générée par Seedance' : 'Video generated by Seedance'}
                    </p>
                    <p className="text-white/50 text-[10px]">
                      {language === 'fr' ? '1080p HD + Audio IA • ByteDance' : '1080p HD + AI Audio • ByteDance'}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692a3549022b223ef419900f/fafb0401f_runwayLM.png"
                    alt="RunwayML"
                    className="h-8 w-8 rounded-lg"
                  />
                  <div>
                    <p className="text-white/90 text-xs font-medium">
                      {language === 'fr' ? 'Vidéo générée par RunwayML' : 'Video generated by RunwayML'}
                    </p>
                    <p className="text-white/50 text-[10px]">
                      {language === 'fr' ? 'Vidéo HD • Gen-3 Alpha Turbo' : 'HD Video • Gen-3 Alpha Turbo'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>}
        </motion.div>
      </motion.div>

      {/* Examples Modal */}
      <VideoExamplesModal
        isOpen={showExamplesModal}
        onClose={() => setShowExamplesModal(false)}
      />

      {/* No Credits Modal */}
      <NoCreditsModal
        isOpen={showNoCreditsModal}
        onClose={() => setShowNoCreditsModal(false)}
        onRecharge={() => window.location.href = createPageUrl('Pricing')}
      />

      {/* Guest Credits Modal */}
      <GuestCreditsModal
        isOpen={showGuestCreditsModal}
        onClose={() => setShowGuestCreditsModal(false)}
        onCreateAccount={() => {
          const base44Client = { auth: { redirectToLogin: () => window.location.href = createPageUrl('Home') + '?login=true' } };
          base44Client.auth.redirectToLogin(createPageUrl('Home'));
        }}
      />
      </AnimatePresence>
      );
      }