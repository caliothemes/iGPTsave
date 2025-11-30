import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { 
  Video, Sparkles, Loader2, Play, Download, X, 
  Zap, Flame, Wind, Waves, Star, Heart, 
  RotateCcw, Maximize, Clock
} from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { base44 } from '@/api/base44Client';
import { cn } from "@/lib/utils";

const ANIMATION_PRESETS = [
  { id: 'cinematic', icon: Video, name: { fr: 'Cinématique', en: 'Cinematic' }, prompt: 'Cinematic camera movement, dramatic lighting, professional film quality' },
  { id: 'explosion', icon: Flame, name: { fr: 'Explosion', en: 'Explosion' }, prompt: 'Dynamic explosion effect, particles flying outward, dramatic impact, debris scattering' },
  { id: 'morphing', icon: RotateCcw, name: { fr: 'Morphing', en: 'Morphing' }, prompt: 'Smooth morphing transformation, elements flowing and reshaping, liquid motion' },
  { id: 'float', icon: Wind, name: { fr: 'Flottant', en: 'Floating' }, prompt: 'Gentle floating motion, ethereal movement, dreamy atmosphere, subtle levitation' },
  { id: 'zoom', icon: Maximize, name: { fr: 'Zoom épique', en: 'Epic Zoom' }, prompt: 'Dramatic zoom in, revealing details, cinematic pull, depth of field' },
  { id: 'particles', icon: Sparkles, name: { fr: 'Particules', en: 'Particles' }, prompt: 'Magical particles swirling around, glowing sparkles, fairy dust effect, luminous atmosphere' },
  { id: 'wave', icon: Waves, name: { fr: 'Ondulation', en: 'Wave' }, prompt: 'Ripple wave effect, pulsating motion, rhythmic movement, energy waves' },
  { id: 'assemble', icon: Star, name: { fr: 'Assemblage', en: 'Assemble' }, prompt: 'Elements coming together, pieces assembling into final form, construction animation, building up' },
  { id: 'heartbeat', icon: Heart, name: { fr: 'Pulsation', en: 'Heartbeat' }, prompt: 'Pulsating heartbeat effect, rhythmic expansion and contraction, living breathing motion' },
  { id: 'energy', icon: Zap, name: { fr: 'Énergie', en: 'Energy' }, prompt: 'Electric energy crackling, lightning effects, power surge, dynamic electricity' },
];

export default function VideoGenerator({ isOpen, onClose, visual }) {
  const { language } = useLanguage();
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [duration, setDuration] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);
  const pollInterval = useRef(null);

  useEffect(() => {
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, []);

  const checkStatus = async (id) => {
    try {
      const response = await base44.functions.invoke('checkVideoStatus', { task_id: id });
      const data = response.data;

      if (data.status === 'SUCCEEDED' && data.video_url) {
        setVideoUrl(data.video_url);
        setGenerating(false);
        if (pollInterval.current) clearInterval(pollInterval.current);
      } else if (data.status === 'FAILED') {
        setError(data.failure || (language === 'fr' ? 'Échec de la génération' : 'Generation failed'));
        setGenerating(false);
        if (pollInterval.current) clearInterval(pollInterval.current);
      } else {
        setProgress(data.progress || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerate = async () => {
    if (!visual?.image_url) return;

    setGenerating(true);
    setError(null);
    setVideoUrl(null);
    setProgress(0);

    const finalPrompt = selectedPreset 
      ? `${selectedPreset.prompt}. ${customPrompt}`.trim()
      : customPrompt || 'Subtle elegant motion, cinematic quality';

    try {
      const response = await base44.functions.invoke('generateVideo', {
        image_url: visual.image_url,
        prompt: finalPrompt,
        duration: duration
      });

      const data = response.data;

      if (data.success && data.task_id) {
        setTaskId(data.task_id);
        // Poll for status every 3 seconds
        pollInterval.current = setInterval(() => checkStatus(data.task_id), 3000);
      } else {
        setError(data.error || (language === 'fr' ? 'Erreur lors du lancement' : 'Error starting generation'));
        setGenerating(false);
      }
    } catch (e) {
      setError(e.message);
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!videoUrl) return;
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `${visual?.title || 'video'}-animated.mp4`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleClose = () => {
    if (pollInterval.current) clearInterval(pollInterval.current);
    setTaskId(null);
    setProgress(0);
    setVideoUrl(null);
    setError(null);
    setGenerating(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#0a0a0f] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Video className="h-5 w-5 text-violet-400" />
            {language === 'fr' ? 'Générateur de Vidéo Magique' : 'Magic Video Generator'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Preview */}
          <div className="relative rounded-xl overflow-hidden bg-black/50 flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
            {videoUrl ? (
              <video 
                src={videoUrl} 
                controls 
                autoPlay 
                loop 
                className="w-full h-full object-contain"
              />
            ) : (
              <img 
                src={visual?.image_url} 
                alt={visual?.title} 
                className="w-full h-full object-contain"
              />
            )}
            {generating && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-4">
                <div className="relative">
                  <Loader2 className="h-12 w-12 text-violet-400 animate-spin" />
                  <Sparkles className="h-5 w-5 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
                </div>
                <p className="text-white font-medium">
                  {language === 'fr' ? 'Génération en cours...' : 'Generating...'}
                </p>
                <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-500"
                    style={{ width: `${Math.max(progress * 100, 5)}%` }}
                  />
                </div>
                <p className="text-white/50 text-sm">
                  {language === 'fr' ? '~30-60 secondes' : '~30-60 seconds'}
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="px-4 py-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          {videoUrl ? (
            <div className="flex gap-3">
              <Button onClick={handleDownload} className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600">
                <Download className="h-4 w-4 mr-2" />
                {language === 'fr' ? 'Télécharger' : 'Download'}
              </Button>
              <Button onClick={() => { setVideoUrl(null); setTaskId(null); }} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                {language === 'fr' ? 'Nouvelle animation' : 'New animation'}
              </Button>
            </div>
          ) : (
            <>
              {/* Animation Presets */}
              <div>
                <p className="text-white/60 text-sm mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  {language === 'fr' ? 'Style d\'animation' : 'Animation style'}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {ANIMATION_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setSelectedPreset(selectedPreset?.id === preset.id ? null : preset)}
                      className={cn(
                        "p-3 rounded-xl border transition-all flex flex-col items-center gap-2",
                        selectedPreset?.id === preset.id
                          ? "bg-violet-500/30 border-violet-500/50 text-violet-300"
                          : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <preset.icon className="h-5 w-5" />
                      <span className="text-xs text-center">{preset.name[language]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Prompt */}
              <div>
                <p className="text-white/60 text-sm mb-2">
                  {language === 'fr' ? 'Instructions personnalisées (optionnel)' : 'Custom instructions (optional)'}
                </p>
                <Textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder={language === 'fr' ? 'Ex: Le logo tourne lentement avec des reflets dorés...' : 'Ex: The logo rotates slowly with golden reflections...'}
                  className="bg-white/5 border-white/10 text-white min-h-[80px]"
                />
              </div>

              {/* Duration */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/60 text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {language === 'fr' ? 'Durée' : 'Duration'}
                  </p>
                  <span className="text-white font-medium">{duration}s</span>
                </div>
                <Slider
                  value={[duration]}
                  onValueChange={([v]) => setDuration(v)}
                  min={5}
                  max={10}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full h-12 bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 hover:from-violet-700 hover:via-purple-700 hover:to-blue-700 text-lg font-semibold"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    {language === 'fr' ? 'Génération...' : 'Generating...'}
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    {language === 'fr' ? 'Générer la vidéo' : 'Generate video'}
                  </>
                )}
              </Button>

              <p className="text-white/40 text-xs text-center">
                {language === 'fr' 
                  ? '⚡ Powered by Runway ML • ~30-60 secondes de génération • 1 crédit par vidéo'
                  : '⚡ Powered by Runway ML • ~30-60 seconds generation • 1 credit per video'}
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}