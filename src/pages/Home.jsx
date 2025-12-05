import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function Home() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentVisual, setCurrentVisual] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const init = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
        }
      } catch (e) {
        console.error(e);
      }
      setIsLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (!isLoading && messages.length === 0) {
      const welcomeMsg = user 
        ? `Bonjour ${user.full_name?.split(' ')[0] || ''} ! 👋\n\nJe suis iGPT. Décrivez-moi le visuel que vous souhaitez créer.`
        : `Bienvenue sur iGPT ! 👋\n\nDécrivez-moi ce que vous souhaitez créer.`;
      setMessages([{ role: 'assistant', content: welcomeMsg }]);
    }
  }, [isLoading, user, messages.length]);

  const handleSend = async () => {
    if (!inputValue.trim() || isGenerating) return;
    
    const userMessage = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsGenerating(true);
    
    setMessages(prev => [...prev, { role: 'assistant', content: '🎨 Génération en cours...' }]);
    
    try {
      const result = await base44.integrations.Core.GenerateImage({
        prompt: userMessage + ', high quality, professional design'
      });

      if (result.url) {
        setCurrentVisual({ image_url: result.url, title: userMessage.slice(0, 50) });
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1] = { role: 'assistant', content: '✨ Votre visuel est prêt !' };
          return newMsgs;
        });
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = { role: 'assistant', content: '❌ Erreur. Réessayez.' };
        return newMsgs;
      });
    }
    
    setIsGenerating(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-violet-950 to-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-violet-950 to-gray-900 flex flex-col">
      <header className="p-4 flex items-center justify-between border-b border-white/10">
        <h1 className="text-2xl font-bold text-white">iGPT</h1>
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-white/60 text-sm">{user.email}</span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => base44.auth.logout(createPageUrl('Home'))}
              className="text-white/60 hover:text-white"
            >
              Déconnexion
            </Button>
          </div>
        ) : (
          <Button 
            onClick={() => base44.auth.redirectToLogin(createPageUrl('Home'))}
            className="bg-violet-600 hover:bg-violet-700"
          >
            Connexion
          </Button>
        )}
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={cn(
                "p-4 rounded-2xl max-w-md",
                msg.role === 'user' 
                  ? "ml-auto bg-violet-600 text-white" 
                  : "bg-white/10 text-white"
              )}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          ))}

          {currentVisual && (
            <div className="flex justify-center">
              <div className="w-full max-w-md rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                <img 
                  src={currentVisual.image_url} 
                  alt={currentVisual.title} 
                  className="w-full aspect-square object-cover"
                />
                <div className="p-4">
                  <p className="text-white text-sm mb-3">{currentVisual.title}</p>
                  <Button
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = currentVisual.image_url;
                      a.download = 'igpt-visual.png';
                      a.click();
                    }}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600"
                  >
                    Télécharger
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-900 to-transparent">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Décrivez votre visuel..."
              className="flex-1 bg-transparent text-white placeholder:text-white/40 px-4 py-2 outline-none"
              disabled={isGenerating}
            />
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isGenerating}
              className="bg-violet-600 hover:bg-violet-700 rounded-xl px-4"
            >
              {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}