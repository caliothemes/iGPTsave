import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Mail, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedBackground from '@/components/AnimatedBackground';
import GlobalHeader from '@/components/GlobalHeader';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/components/LanguageContext';
import { cn } from "@/lib/utils";

export default function Support() {
  const { language } = useLanguage();
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [faqItems, setFaqItems] = useState([]);
  const [openItems, setOpenItems] = useState({});
  const [loading, setLoading] = useState(true);

  const t = {
    fr: {
      title: 'Support et FAQ',
      subtitle: 'Nous sommes là pour vous aider',
      contactTitle: 'Besoin d\'aide personnalisée ?',
      contactDesc: 'Notre équipe est disponible pour répondre à toutes vos questions',
      contactEmail: 'Contactez-nous par email',
      faqTitle: 'Foire aux questions',
      faqSubtitle: 'Trouvez rapidement des réponses à vos questions'
    },
    en: {
      title: 'Support & FAQ',
      subtitle: 'We\'re here to help',
      contactTitle: 'Need personalized help?',
      contactDesc: 'Our team is available to answer all your questions',
      contactEmail: 'Contact us by email',
      faqTitle: 'Frequently Asked Questions',
      faqSubtitle: 'Find quick answers to your questions'
    }
  }[language];

  useEffect(() => {
    const init = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
          
          const userCredits = await base44.entities.UserCredits.filter({ user_email: currentUser.email });
          if (userCredits.length > 0) {
            setCredits(userCredits[0]);
          }
        }

        const items = await base44.entities.FAQItem.filter({ is_active: true }, 'order');
        setFaqItems(items);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    init();
  }, []);

  const toggleItem = (id) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <AnimatedBackground />
      <GlobalHeader page="Support" />
      
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        user={user}
        credits={credits}
        conversations={[]}
        visuals={[]}
        onNewChat={() => {}}
        onSelectConversation={() => {}}
        onDeleteConversation={() => {}}
        onSelectVisual={() => {}}
        onLogin={() => base44.auth.redirectToLogin()}
        onLogout={() => base44.auth.logout()}
      />

      <main className={cn(
        "flex-1 transition-all duration-300 relative z-10",
        sidebarOpen ? "ml-64" : "ml-0"
      )}>
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-3">{t.title}</h1>
            <p className="text-white/60 text-lg">{t.subtitle}</p>
          </div>

          {/* Contact Block */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="bg-gradient-to-br from-violet-600/20 via-purple-600/20 to-blue-600/20 backdrop-blur-sm border border-violet-500/30 rounded-2xl p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 mb-4">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{t.contactTitle}</h2>
              <p className="text-white/70 mb-6">{t.contactDesc}</p>
              <a
                href="mailto:igpt.france@gmail.com"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
              >
                <Mail className="h-5 w-5" />
                {t.contactEmail}
              </a>
              <div className="mt-4 text-white/50 text-sm">
                igpt.france@gmail.com
              </div>
            </div>
          </motion.div>

          {/* FAQ Section */}
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">{t.faqTitle}</h2>
              <p className="text-white/60">{t.faqSubtitle}</p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-violet-400 border-r-transparent" />
              </div>
            ) : (
              <div className="space-y-3">
                {faqItems.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => toggleItem(item.id)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                    >
                      <span className="text-white font-medium pr-4">
                        {language === 'fr' ? item.question_fr : (item.question_en || item.question_fr)}
                      </span>
                      <ChevronDown className={cn(
                        "h-5 w-5 text-white/60 transition-transform flex-shrink-0",
                        openItems[item.id] && "rotate-180"
                      )} />
                    </button>
                    <AnimatePresence>
                      {openItems[item.id] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-4 text-white/70 leading-relaxed whitespace-pre-wrap">
                            {language === 'fr' ? item.answer_fr : (item.answer_en || item.answer_fr)}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
}