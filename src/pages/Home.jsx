import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Sparkles, CreditCard, Image, Menu, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import AnimatedBackground from '@/components/AnimatedBackground';
import Logo from '@/components/Logo';
import MessageBubble from '@/components/chat/MessageBubble';
import VisualCard from '@/components/chat/VisualCard';
import FormatSelector from '@/components/chat/FormatSelector';
import { cn } from "@/lib/utils";

export default function Home() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(null);
  const [messages, setMessages] = useState([]);
  const [visuals, setVisuals] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [showFormatSelector, setShowFormatSelector] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const auth = await base44.auth.isAuthenticated();
        setIsAuthenticated(auth);
        
        if (auth) {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
          
          // Get or create user credits
          const userCredits = await base44.entities.UserCredits.filter({ user_email: currentUser.email });
          if (userCredits.length === 0) {
            const newCredits = await base44.entities.UserCredits.create({
              user_email: currentUser.email,
              free_downloads: 5,
              paid_credits: 0,
              subscription_type: 'free'
            });
            setCredits(newCredits);
          } else {
            setCredits(userCredits[0]);
          }

          // Load user's visuals
          const userVisuals = await base44.entities.Visual.filter({ user_email: currentUser.email }, '-created_date', 20);
          setVisuals(userVisuals);

          // Welcome message for logged in users
          setMessages([{
            role: 'assistant',
            content: `Bonjour ${currentUser.full_name || ''} ! 👋\n\nJe suis **VisualGPT**, votre assistant pour créer des visuels professionnels.\n\nJe peux créer pour vous :\n- 🎨 **Logos** personnalisés\n- 💳 **Cartes de visite**\n- 📄 **Flyers et affiches**\n- 📱 **Posts pour réseaux sociaux** (Instagram, Facebook, LinkedIn...)\n\nDites-moi ce dont vous avez besoin, ou sélectionnez un format en cliquant sur l'icône 🖼️ ci-dessous !`
          }]);
        } else {
          // Welcome message for guests
          setMessages([{
            role: 'assistant',
            content: `Bienvenue sur **VisualGPT** ! 👋\n\nJe suis votre assistant IA pour créer des visuels professionnels :\n- 🎨 **Logos** personnalisés\n- 💳 **Cartes de visite**\n- 📄 **Flyers et affiches**\n- 📱 **Posts pour réseaux sociaux**\n\nDécrivez-moi ce que vous souhaitez créer et je m'en occupe !\n\n*Connectez-vous pour bénéficier de 5 téléchargements gratuits.*`
          }]);
        }
      } catch (e) {
        setIsAuthenticated(false);
        setMessages([{
          role: 'assistant',
          content: `Bienvenue sur **VisualGPT** ! 👋\n\nJe suis votre assistant IA pour créer des visuels professionnels.\n\nDécrivez-moi ce que vous souhaitez créer !`
        }]);
      }
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, visuals]);

  const getTotalCredits = () => {
    if (!credits) return 0;
    if (credits.subscription_type === 'unlimited') return Infinity;
    return (credits.free_downloads || 0) + (credits.paid_credits || 0);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    let fullPrompt = userMessage;
    
    if (selectedFormat) {
      fullPrompt += `\n\nFormat demandé: ${selectedFormat.name} (${selectedFormat.dimensions})`;
    }

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setShowFormatSelector(false);

    try {
      // Analyze request with LLM
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Tu es VisualGPT, un assistant expert en création de visuels.
        
L'utilisateur demande: "${fullPrompt}"

Analyse cette demande et réponds en JSON avec:
- needs_image: boolean (true si l'utilisateur veut qu'on génère une image)
- response: string (ta réponse à l'utilisateur, en français, amicale et professionnelle)
- image_prompt: string (si needs_image=true, le prompt détaillé en anglais pour générer l'image, très descriptif avec style, couleurs, composition)
- visual_type: string (logo, carte_visite, flyer, post_instagram, story_instagram, post_facebook, post_linkedin, affiche, banner, autre)
- dimensions: string (dimensions suggérées)
- title: string (titre court pour le visuel)

Si l'utilisateur pose une question ou demande des précisions, réponds sans générer d'image.
Si l'utilisateur veut un visuel, propose-lui le format si non spécifié, ou génère directement.`,
        response_json_schema: {
          type: 'object',
          properties: {
            needs_image: { type: 'boolean' },
            response: { type: 'string' },
            image_prompt: { type: 'string' },
            visual_type: { type: 'string' },
            dimensions: { type: 'string' },
            title: { type: 'string' }
          }
        }
      });

      setMessages(prev => [...prev, { role: 'assistant', content: analysis.response }]);

      if (analysis.needs_image && analysis.image_prompt) {
        setIsGenerating(true);
        setMessages(prev => [...prev, { role: 'assistant', content: '🎨 Je génère votre visuel...' }]);

        const imageResult = await base44.integrations.Core.GenerateImage({
          prompt: analysis.image_prompt
        });

        // Save visual to database if logged in
        let newVisual = {
          title: analysis.title || 'Visuel',
          image_url: imageResult.url,
          visual_type: analysis.visual_type || 'autre',
          dimensions: analysis.dimensions || selectedFormat?.dimensions || '1080x1080',
          format: selectedFormat?.id?.includes('post') || selectedFormat?.id?.includes('story') || selectedFormat?.id?.includes('banner') ? 'digital' : 'print'
        };

        if (user) {
          newVisual = await base44.entities.Visual.create({
            user_email: user.email,
            ...newVisual
          });
        }

        setVisuals(prev => [newVisual, ...prev]);
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            role: 'assistant',
            content: `✨ Votre visuel "${analysis.title}" est prêt !\n\n${!isAuthenticated ? '**Connectez-vous pour télécharger gratuitement !**' : 'Vous pouvez le télécharger ou me demander de le régénérer avec des modifications.'}`
          };
          return newMessages;
        });
        setIsGenerating(false);
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '❌ Une erreur est survenue. Veuillez réessayer.' 
      }]);
    }

    setIsLoading(false);
    setSelectedFormat(null);
  };

  const handleRegenerate = async (visual) => {
    setIsGenerating(true);
    try {
      const result = await base44.integrations.Core.GenerateImage({
        prompt: `Regenerate a ${visual.visual_type} with similar style but with variations. High quality, professional design.`
      });

      let newVisual = {
        title: visual.title + ' (v2)',
        image_url: result.url,
        visual_type: visual.visual_type,
        dimensions: visual.dimensions,
        format: visual.format
      };

      if (user) {
        newVisual = await base44.entities.Visual.create({
          user_email: user.email,
          ...newVisual
        });
      }

      setVisuals(prev => [newVisual, ...prev]);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `✨ Nouvelle version générée !` 
      }]);
    } catch (e) {
      console.error(e);
    }
    setIsGenerating(false);
  };

  const handleDownload = async (visual) => {
    if (!isAuthenticated) {
      base44.auth.redirectToLogin(createPageUrl('Home'));
      return;
    }

    const totalCredits = getTotalCredits();
    if (totalCredits <= 0) {
      window.location.href = createPageUrl('Pricing');
      return;
    }

    // Deduct credit
    if (credits.subscription_type !== 'unlimited') {
      if (credits.free_downloads > 0) {
        await base44.entities.UserCredits.update(credits.id, {
          free_downloads: credits.free_downloads - 1
        });
        setCredits(prev => ({ ...prev, free_downloads: prev.free_downloads - 1 }));
      } else if (credits.paid_credits > 0) {
        await base44.entities.UserCredits.update(credits.id, {
          paid_credits: credits.paid_credits - 1
        });
        setCredits(prev => ({ ...prev, paid_credits: prev.paid_credits - 1 }));
      }
    }

    // Mark as downloaded
    if (visual.id) {
      await base44.entities.Visual.update(visual.id, { downloaded: true });
    }

    // Trigger download
    const link = document.createElement('a');
    link.href = visual.image_url;
    link.download = `${visual.title || 'visual'}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AnimatedBackground />
        <Loader2 className="h-8 w-8 text-violet-400 animate-spin relative z-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      
      <div className="relative z-10 flex h-screen">
        {/* Sidebar - Visuals Gallery */}
        {visuals.length > 0 && (
          <aside className={cn(
            "fixed md:relative inset-y-0 left-0 z-50 w-80 bg-black/40 backdrop-blur-xl border-r border-white/10 transition-transform duration-300",
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}>
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-white font-semibold">Mes Visuels</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {visuals.map((visual, idx) => (
                  <VisualCard
                    key={visual.id || idx}
                    visual={visual}
                    onRegenerate={() => handleRegenerate(visual)}
                    onDownload={() => handleDownload(visual)}
                    isRegenerating={isGenerating}
                    canDownload={isAuthenticated && getTotalCredits() > 0}
                    hasWatermark={!isAuthenticated || credits?.subscription_type === 'free'}
                  />
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col h-screen">
          {/* Header */}
          <header className="p-4 border-b border-white/10 bg-black/20 backdrop-blur-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              {visuals.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-white"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              <Logo size="small" />
            </div>
            
            <div className="flex items-center gap-3">
              {isAuthenticated && (
                <a 
                  href={createPageUrl('Pricing')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/80 hover:bg-white/20 transition-colors text-sm"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>{getTotalCredits() === Infinity ? '∞' : getTotalCredits()} crédits</span>
                </a>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => isAuthenticated ? base44.auth.logout() : base44.auth.redirectToLogin()}
                className="border-white/20 text-white hover:bg-white/10"
              >
                {isAuthenticated ? 'Déconnexion' : 'Connexion'}
              </Button>
            </div>
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-3xl mx-auto space-y-4">
              {/* Logo centered if no messages yet */}
              {messages.length <= 1 && (
                <div className="flex flex-col items-center justify-center py-8 md:py-16">
                  <Logo size="large" />
                  <p className="text-white/50 mt-6 text-center max-w-md">
                    Créez des logos, cartes de visite, flyers, posts pour réseaux sociaux et bien plus encore.
                  </p>
                </div>
              )}
              
              {messages.map((message, idx) => (
                <MessageBubble 
                  key={idx} 
                  message={message}
                  isStreaming={isLoading && idx === messages.length - 1}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Format Selector */}
          {showFormatSelector && (
            <div className="px-4 pb-2 max-w-3xl mx-auto w-full">
              <FormatSelector 
                onSelect={(format) => {
                  setSelectedFormat(format);
                  setShowFormatSelector(false);
                }}
                selectedFormat={selectedFormat}
              />
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-sm">
            <div className="max-w-3xl mx-auto">
              {selectedFormat && (
                <div className="mb-2 flex items-center gap-2 text-sm text-violet-300">
                  <span>Format: {selectedFormat.name} ({selectedFormat.dimensions})</span>
                  <button 
                    onClick={() => setSelectedFormat(null)}
                    className="text-white/50 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowFormatSelector(!showFormatSelector)}
                  className={cn(
                    "text-white/60 hover:text-white hover:bg-white/10",
                    showFormatSelector && "bg-violet-500/20 text-violet-300"
                  )}
                >
                  <Image className="h-5 w-5" />
                </Button>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Décrivez le visuel que vous souhaitez créer..."
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-violet-500"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
              
              {/* Footer links */}
              <div className="mt-3 text-center">
                <p className="text-white/30 text-xs">
                  5 téléchargements gratuits •{' '}
                  <a href={createPageUrl('Pricing')} className="hover:text-violet-400 transition-colors">Tarifs</a>
                  {' '}•{' '}
                  <a href={createPageUrl('Legal')} className="hover:text-violet-400 transition-colors">Mentions légales</a>
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}