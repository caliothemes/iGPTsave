import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, ShoppingBag, Sparkles, Lock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnimatedBackground from '@/components/AnimatedBackground';
import Sidebar from '@/components/Sidebar';
import GlobalHeader from '@/components/GlobalHeader';
import { useLanguage } from '@/components/LanguageContext';
import { createPageUrl } from '@/utils';
import { cn } from "@/lib/utils";
import Masonry from 'react-masonry-css';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// Format Badge Component
function FormatBadge({ dimensions, language }) {
  if (!dimensions) return null;
  
  const getFormatInfo = (dim, lang) => {
    const [w, h] = dim.split('x').map(n => parseInt(n));
    if (!w || !h) return { label: dim, shape: '' };
    
    const ratio = w / h;
    let shape = '';
    let label = dim;
    
    if (Math.abs(ratio - 1) < 0.1) {
      shape = '1:1';
      label = lang === 'fr' ? 'Carré' : 'Square';
    } else if (Math.abs(ratio - 16/9) < 0.1) {
      shape = '16:9';
      label = lang === 'fr' ? 'Paysage' : 'Landscape';
    } else if (Math.abs(ratio - 9/16) < 0.1) {
      shape = '9:16';
      label = 'Story';
    } else if (Math.abs(ratio - 4/3) < 0.1) {
      shape = '4:3';
    } else if (ratio > 1) {
      shape = `${Math.round(ratio)}:1`;
      label = lang === 'fr' ? 'Paysage' : 'Landscape';
    } else {
      shape = `1:${Math.round(1/ratio)}`;
      label = 'Portrait';
    }
    
    return { label: `${dim} • ${shape}`, shape };
  };
  
  const { label } = getFormatInfo(dimensions, language);
  
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-full border border-white/20">
      {label}
    </span>
  );
}

export default function Store() {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [storeItems, setStoreItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [userVisuals, setUserVisuals] = useState([]);
  const [purchasing, setPurchasing] = useState(null);
  const [purchasedItems, setPurchasedItems] = useState(new Set());
  const [alreadyPurchased, setAlreadyPurchased] = useState(new Set());

  useEffect(() => {
    const init = async () => {
      try {
        const auth = await base44.auth.isAuthenticated();
        if (!auth) {
          base44.auth.redirectToLogin(createPageUrl('Store'));
          return;
        }

        const currentUser = await base44.auth.me();
        setUser(currentUser);
        setIsAdmin(currentUser.role === 'admin');

        const [cats, items, userCreds, userVis, userConvs, purchases] = await Promise.all([
          base44.entities.StoreCategory.filter({ is_active: true }, 'order'),
          base44.entities.StoreItem.filter({ is_active: true }, '-created_date'),
          base44.entities.UserCredits.filter({ user_email: currentUser.email }),
          base44.entities.Visual.filter({ user_email: currentUser.email }, '-created_date', 50),
          base44.entities.Conversation.filter({ user_email: currentUser.email }, '-updated_date', 20),
          base44.entities.StorePurchase.filter({ user_email: currentUser.email })
        ]);

        setCategories(cats);
        setStoreItems(items);
        setFilteredItems(items);
        if (userCreds.length > 0) setCredits(userCreds[0]);
        setUserVisuals(userVis);
        setConversations(userConvs);
        
        // Set already purchased items
        const purchasedItemIds = new Set(purchases.map(p => p.store_item_id));
        setAlreadyPurchased(purchasedItemIds);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredItems(storeItems);
    } else {
      setFilteredItems(storeItems.filter(item => item.category_slug === selectedCategory));
    }
  }, [selectedCategory, storeItems]);

  const handlePurchase = async (item) => {
    if (!user) {
      toast.error(language === 'fr' ? 'Connectez-vous pour acheter' : 'Sign in to purchase');
      return;
    }

    // Check if already purchased
    if (alreadyPurchased.has(item.id)) {
      toast.info(
        language === 'fr' 
          ? 'Visuel déjà acheté, retrouvez-le dans la page "Mes visuels"' 
          : 'Visual already purchased, find it in "My Visuals"',
        { duration: 4000 }
      );
      return;
    }

    const totalCredits = (credits?.free_downloads || 0) + (credits?.paid_credits || 0);
    if (totalCredits < item.price_credits) {
      toast.error(language === 'fr' ? 'Crédits insuffisants' : 'Insufficient credits');
      return;
    }

    setPurchasing(item.id);
    try {
      // Deduct credits
      if (credits.free_downloads >= item.price_credits) {
        await base44.entities.UserCredits.update(credits.id, {
          free_downloads: credits.free_downloads - item.price_credits
        });
        setCredits(prev => ({ ...prev, free_downloads: prev.free_downloads - item.price_credits }));
      } else {
        const remainingPrice = item.price_credits - credits.free_downloads;
        await base44.entities.UserCredits.update(credits.id, {
          free_downloads: 0,
          paid_credits: credits.paid_credits - remainingPrice
        });
        setCredits(prev => ({ ...prev, free_downloads: 0, paid_credits: prev.paid_credits - remainingPrice }));
      }

      // Get the original visual to copy its properties
      const originalVisual = await base44.entities.Visual.filter({ id: item.visual_id });
      const visualData = originalVisual[0] || {};

      // Create a copy of the visual for the buyer
      const newVisual = await base44.entities.Visual.create({
        user_email: user.email,
        image_url: item.image_url,
        original_image_url: item.image_url,
        title: item.title,
        visual_type: visualData.visual_type || 'image',
        dimensions: visualData.dimensions || item.dimensions || '1080x1080',
        original_prompt: visualData.original_prompt || '',
        image_prompt: visualData.image_prompt || '',
        style: visualData.style || '',
        color_palette: visualData.color_palette || []
      });

      // Create purchase record
      await base44.entities.StorePurchase.create({
        user_email: user.email,
        store_item_id: item.id,
        visual_id: newVisual.id,
        price_paid: item.price_credits,
        item_title: item.title,
        image_url: item.image_url
      });

      // Update sales count
      await base44.entities.StoreItem.update(item.id, {
        sales_count: (item.sales_count || 0) + 1
      });

      toast.success(language === 'fr' ? '✨ Achat réussi !' : '✨ Purchase successful!');
      setPurchasedItems(prev => new Set([...prev, item.id]));
      setAlreadyPurchased(prev => new Set([...prev, item.id]));
      
      // Remove success overlay after 3 seconds
      setTimeout(() => {
        setPurchasedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(item.id);
          return newSet;
        });
      }, 3000);
    } catch (e) {
      console.error(e);
      toast.error(language === 'fr' ? 'Erreur lors de l\'achat' : 'Purchase error');
    }
    setPurchasing(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <AnimatedBackground />
        <div className="relative z-10 flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <GlobalHeader page="Store" />

      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        user={user}
        credits={credits}
        conversations={conversations}
        visuals={userVisuals}
        onNewChat={() => window.location.href = createPageUrl('Home')}
        onSelectConversation={() => window.location.href = createPageUrl('Home')}
        onDeleteConversation={() => {}}
        onSelectVisual={() => window.location.href = createPageUrl('Home')}
        onLogin={() => base44.auth.redirectToLogin(createPageUrl('Store'))}
        onLogout={() => base44.auth.logout()}
      />

      <div className={cn(
        "relative z-10 min-h-screen flex flex-col transition-all duration-300",
        sidebarOpen && "md:ml-64"
      )}>
        {/* Hero */}
        <div className="px-6 py-12 text-center pt-20">
          <div className="flex items-center justify-center gap-3 mb-3">
            <ShoppingBag className="h-6 w-6 text-violet-400" />
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
              iGPT Store
            </h1>
            <Sparkles className="h-6 w-6 text-amber-400" />
          </div>
          <p className="text-base text-white/50">
            {language === 'fr' 
              ? 'Découvrez et achetez des visuels prêts à l\'emploi, créés par notre équipe.'
              : 'Discover and purchase ready-to-use visuals, created by our team.'}
          </p>
          {!isAdmin && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full">
              <Lock className="h-4 w-4 text-amber-400" />
              <span className="text-amber-300 text-sm">
                {language === 'fr' ? 'Accès limité - Bientôt disponible' : 'Limited access - Coming soon'}
              </span>
            </div>
          )}
        </div>

        {/* Categories Tabs */}
        <div className="px-6 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                selectedCategory === 'all'
                  ? "bg-violet-600 text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              )}
            >
              {language === 'fr' ? 'Tout' : 'All'}
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                  selectedCategory === cat.slug
                    ? "bg-violet-600 text-white"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                )}
              >
                {language === 'fr' ? cat.name_fr : (cat.name_en || cat.name_fr)}
              </button>
            ))}
          </div>
        </div>

        {/* Masonry Grid */}
        <div className="px-2 pb-32 flex-1 w-full">
          <style>{`
            .masonry-grid {
              display: flex;
              margin-left: -8px;
              width: auto;
            }
            .masonry-column {
              padding-left: 8px;
              background-clip: padding-box;
            }
            .masonry-column > div {
              margin-bottom: 8px;
            }
          `}</style>
          {filteredItems.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white/40 text-lg">
                {language === 'fr' ? 'Aucun produit dans cette catégorie' : 'No products in this category'}
              </p>
            </div>
          ) : (
            <Masonry
              breakpointCols={{
                default: 6,
                1400: 5,
                1024: 4,
                768: 3,
                480: 2
              }}
              className="masonry-grid"
              columnClassName="masonry-column"
            >
              {filteredItems.map((item) => {
                const isPurchased = purchasedItems.has(item.id);
                const wasAlreadyPurchased = alreadyPurchased.has(item.id);
                return (
                  <div key={item.id}>
                    <div className="relative overflow-hidden rounded-lg bg-white/5 border border-white/10 hover:border-violet-500/50 transition-all duration-300">
                      {/* Image */}
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-auto block"
                        loading="lazy"
                      />
                      
                      {/* Format badge - top right corner */}
                      <div className="absolute top-2 right-2 z-[5]">
                        <FormatBadge dimensions={item.dimensions} language={language} />
                      </div>

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-black/70 opacity-0 hover:opacity-100 transition-opacity duration-300 z-[10] p-4 flex flex-col">
                        {/* Title */}
                        <h3 className="text-white font-bold text-sm mb-2 line-clamp-2">{item.title}</h3>
                        
                        {/* Description */}
                        {item.description && (
                          <p className="text-white/70 text-xs mb-2 line-clamp-3">{item.description}</p>
                        )}
                        
                        {/* Format badge in hover */}
                        <div className="mb-auto pb-2">
                          <FormatBadge dimensions={item.dimensions} language={language} />
                        </div>
                        
                        {/* Bottom section */}
                        <div className="mt-auto pt-3 border-t border-white/10">
                          <div className="flex items-center justify-between gap-2">
                            {/* Price */}
                            <div className="flex items-center gap-1">
                              <Sparkles className="h-4 w-4 text-amber-400" />
                              <span className="text-white font-bold">{item.price_credits}</span>
                              <span className="text-white/60 text-xs">
                                {language === 'fr' ? 'crédits' : 'credits'}
                              </span>
                            </div>
                            
                            {/* Button */}
                            {wasAlreadyPurchased ? (
                              <Button
                                size="sm"
                                disabled
                                className="bg-blue-600 hover:bg-blue-600 text-white cursor-default opacity-100"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                {language === 'fr' ? 'Déjà acheté' : 'Already purchased'}
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handlePurchase(item)}
                                disabled={purchasing === item.id}
                                className="bg-violet-600 hover:bg-violet-700 text-white"
                              >
                                {purchasing === item.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  language === 'fr' ? 'Acheter' : 'Buy'
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Success overlay after purchase */}
                      {isPurchased && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-700 z-[20] flex flex-col items-center justify-center p-6"
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                            className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-4 shadow-xl"
                          >
                            <Check className="h-10 w-10 text-green-600" strokeWidth={3} />
                          </motion.div>
                          <motion.h3
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-white font-bold text-lg mb-2 text-center"
                          >
                            {language === 'fr' ? 'Achat effectué !' : 'Purchase complete!'}
                          </motion.h3>
                          <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="text-white/90 text-sm text-center"
                          >
                            {language === 'fr' ? 'Retrouvez ce visuel dans "Mes visuels"' : 'Find this visual in "My Visuals"'}
                          </motion.p>
                        </motion.div>
                      )}
                    </div>
                  </div>
                );
              })}
            </Masonry>
          )}
        </div>

        {/* Footer */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-[#0a0a0f] to-transparent py-4">
          <div className={cn("transition-all duration-300", sidebarOpen && "md:ml-64")}>
            <div className="flex items-center justify-center">
              <p className="text-white/25 text-xs">
                <a href={createPageUrl('Store')} className="hover:text-violet-400 transition-colors text-violet-400">iGPT Store</a>
                {' • '}
                <a href={createPageUrl('Pricing')} className="hover:text-violet-400 transition-colors">
                  {language === 'fr' ? 'Tarifs' : 'Pricing'}
                </a>
                {' • '}
                <a href={createPageUrl('Portfolio')} className="hover:text-violet-400 transition-colors">Portfolio</a>
                {' • '}
                <a href={createPageUrl('Legal')} className="hover:text-violet-400 transition-colors">
                  {language === 'fr' ? 'Mentions légales' : 'Legal'}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}