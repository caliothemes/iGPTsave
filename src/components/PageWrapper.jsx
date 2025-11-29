import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Loader2 } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import Sidebar from '@/components/Sidebar';
import GlobalHeader from '@/components/GlobalHeader';
import { useLanguage } from '@/components/LanguageContext';
import { cn } from "@/lib/utils";

export default function PageWrapper({ children, requireAuth = false }) {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credits, setCredits] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [visuals, setVisuals] = useState([]);
  const [settings, setSettings] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const [appSettings, auth] = await Promise.all([
          base44.entities.AppSettings.list(),
          base44.auth.isAuthenticated()
        ]);
        
        const settingsMap = {};
        appSettings.forEach(s => { settingsMap[s.key] = s.value; });
        setSettings(settingsMap);
        setIsAuthenticated(auth);

        if (auth) {
          const currentUser = await base44.auth.me();
          setUser(currentUser);

          const [userCredits, userVisuals, userConversations] = await Promise.all([
            base44.entities.UserCredits.filter({ user_email: currentUser.email }),
            base44.entities.Visual.filter({ user_email: currentUser.email }, '-created_date', 50),
            base44.entities.Conversation.filter({ user_email: currentUser.email }, '-updated_date', 20)
          ]);

          if (userCredits.length > 0) {
            setCredits(userCredits[0]);
          }
          setVisuals(userVisuals);
          setConversations(userConversations);
        } else if (requireAuth) {
          base44.auth.redirectToLogin(window.location.href);
          return;
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    init();
  }, [requireAuth]);

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
      <GlobalHeader />

      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        user={user}
        credits={credits}
        conversations={conversations}
        visuals={visuals}
        onNewChat={() => window.location.href = createPageUrl('Home')}
        onSelectConversation={() => window.location.href = createPageUrl('Home')}
        onDeleteConversation={() => {}}
        onSelectVisual={() => {}}
        onLogin={() => base44.auth.redirectToLogin(window.location.href)}
        onLogout={() => base44.auth.logout()}
        sidebarTitle={settings.sidebar_title}
      />

      <div className={cn(
        "relative z-10 min-h-screen flex flex-col transition-all duration-300",
        sidebarOpen && "md:ml-64"
      )}>
        <main className="flex-1 flex flex-col pt-16 pb-8">
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6">
            <div className="max-w-4xl mx-auto">
              {typeof children === 'function' ? children({ user, credits, isAuthenticated }) : children}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto px-4">
            <div className="max-w-4xl mx-auto flex items-center justify-center">
              <p className="text-white/25 text-xs">
                <a href={createPageUrl('Pricing')} className="hover:text-violet-400 transition-colors">{t('pricing')}</a>
                {' • '}
                <a href={createPageUrl('Legal')} className="hover:text-violet-400 transition-colors">{t('legal')}</a>
                {user?.role === 'admin' && (
                  <>
                    {' • '}
                    <a href={createPageUrl('Admin')} className="hover:text-violet-400 transition-colors">Admin</a>
                  </>
                )}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}