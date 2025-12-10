import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, ShoppingBag, Sparkles, Lock, Check, Search, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnimatedBackground from '@/components/AnimatedBackground';
import Sidebar from '@/components/Sidebar';
import GlobalHeader from '@/components/GlobalHeader';
import { useLanguage } from '@/components/LanguageContext';
import { createPageUrl } from '@/utils';
import { cn } from "@/lib/utils";
import Masonry from 'react-masonry-css';
import { toast, Toaster } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// Format Badge Component
function FormatBadge({ dimensions, language }) {
  if (!dimensions) return null;
  
  const getFormatInfo = (dim, lang) => {
    const [w, h] = dim.split('x').map(n => parseInt(n));
    if (!w || !h) return { label: dim, shape: '' };
    
    const ratio = w / h;
    let shape = '';
    
    if (Math.abs(ratio - 1) < 0.1) {
      shape = '1:1';
    } else if (Math.abs(ratio - 16/9) < 0.1) {
      shape = '16:9';
    } else if (Math.abs(ratio - 9/16) < 0.1) {
      shape = '9:16';
    } else if (Math.abs(ratio - 4/3) < 0.1) {
      shape = '4:3';
    } else if (ratio > 1) {
      shape = `${Math.round(ratio)}:1`;
    } else {
      shape = `1:${Math.round(1/ratio)}`;
    }
    
    return { label: `${dim} • ${shape}`, shape };
  };
  
  const { label } = getFormatInfo(dimensions, language);
  
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-violet-600/20 border border-violet-500/30 text-violet-300 text-xs font-bold rounded-full">
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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [popularKeywords, setPopularKeywords] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [userVisuals, setUserVisuals] = useState([]);
  const [purchasing, setPurchasing] = useState(null);
  const [purchasedItems, setPurchasedItems] = useState(new Set());
  const [alreadyPurchased, setAlreadyPurchased] = useState(new Set());
  const [enlargedImage, setEnlargedImage] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const auth = await base44.auth.isAuthenticated();
        
        // Load public data (categories and items) for everyone
        const [cats, items] = await Promise.all([
          base44.entities.StoreCategory.filter({ is_active: true }, 'order'),
          base44.entities.StoreItem.filter({ is_active: true }, '-created_date')
        ]);
        
        setCategories(cats);
        setStoreItems(items);
        setFilteredItems(items);
        
        // Calculate popular keywords
        const keywordCount = {};
        items.forEach(item => {
          if (item.keywords && Array.isArray(item.keywords)) {
            item.keywords.forEach(keyword => {
              keywordCount[keyword] = (keywordCount[keyword] || 0) + 1;
            });
          }
        });
        const sorted = Object.entries(keywordCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 20)
          .map(([keyword]) => keyword);
        setPopularKeywords(sorted);

        // Load user-specific data only if authenticated
        if (auth) {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
          setIsAdmin(currentUser.role === 'admin');

          const [userCreds, userVis, userConvs, purchases] = await Promise.all([
            base44.entities.UserCredits.filter({ user_email: currentUser.email }),
            base44.entities.Visual.filter({ user_email: currentUser.email }, '-created_date', 50),
            base44.entities.Conversation.filter({ user_email: currentUser.email }, '-updated_date', 20),
            base44.entities.StorePurchase.filter({ user_email: currentUser.email })
          ]);

          if (userCreds.length > 0) setCredits(userCreds[0]);
          setUserVisuals(userVis);
          setConversations(userConvs);
          
          // Set already purchased items
          const purchasedItemIds = new Set(purchases.map(p => p.store_item_id));
          setAlreadyPurchased(purchasedItemIds);
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    init();
  }, []);

  // Calculate item counts per category
  const getCategoryCount = (categorySlug) => {
    if (categorySlug === 'all') return storeItems.length;
    return storeItems.filter(item => item.category_slug === categorySlug).length;
  };

  useEffect(() => {
    let items = storeItems;

    // Filter by category
    if (selectedCategory !== 'all') {
      items = items.filter(item => item.category_slug === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => {
        const titleMatch = item.title?.toLowerCase().includes(query);
        const descMatch = item.description?.toLowerCase().includes(query);
        const keywordsMatch = item.keywords?.some(k => k.toLowerCase().includes(query));
        return titleMatch || descMatch || keywordsMatch;
      });
    }

    setFilteredItems(items);
  }, [selectedCategory, storeItems, searchQuery]);

  const handlePurchase = async (item) => {
    if (!user) {
      toast.error(language === 'fr' ? 'Connectez-vous pour acheter' : 'Sign in to purchase', {
        duration: 4000,
        style: {
          background: '#1f2937',
          color: '#fff',
          border: '1px solid #ef4444'
        }
      });
      return;
    }

    // Check if already purchased
    if (alreadyPurchased.has(item.id)) {
      toast(
        language === 'fr' 
          ? '🔵 Visuel déjà acheté, retrouvez-le dans la page "Mes visuels"' 
          : '🔵 Visual already purchased, find it in "My Visuals"',
        { 
          duration: 5000,
          style: {
            background: '#1e3a8a',
            color: '#fff',
            border: '1px solid #3b82f6',
            fontSize: '14px',
            fontWeight: '500'
          }
        }
      );
      return;
    }

    const totalCredits = (credits?.free_downloads || 0) + (credits?.paid_credits || 0);
    if (totalCredits < item.price_credits) {
      toast(
        language === 'fr' 
          ? "⚠️ Vous n'avez plus de crédit, rechargez avant d'effectuer un achat..." 
          : "⚠️ You don't have enough credits, recharge before making a purchase...",
        { 
          duration: 8000,
          style: {
            background: '#92400e',
            color: '#fff',
            border: '2px solid #f59e0b',
            fontSize: '14px',
            fontWeight: '500'
          },
          action: {
            label: language === 'fr' ? 'Recharger' : 'Recharge',
            onClick: () => window.location.href = createPageUrl('Pricing')
          }
        }
      );
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

      // Show success overlay
      setPurchasedItems(prev => new Set([...prev, item.id]));
      setAlreadyPurchased(prev => new Set([...prev, item.id]));
      
      // Show success toast
      toast(
        language === 'fr' 
          ? '✅ Achat réussi ! Retrouvez ce visuel dans "Mes visuels"' 
          : '✅ Purchase successful! Find this visual in "My Visuals"',
        { 
          duration: 8000,
          style: {
            background: '#065f46',
            color: '#fff',
            border: '2px solid #10b981',
            fontSize: '14px',
            fontWeight: '600'
          },
          action: {
            label: language === 'fr' ? 'Mes visuels' : 'My Visuals',
            onClick: () => window.location.href = createPageUrl('MyVisuals')
          }
        }
      );
      
      // Remove success overlay after 4 seconds
      setTimeout(() => {
        setPurchasedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(item.id);
          return newSet;
        });
      }, 4000);
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
      <Toaster 
        position="top-center" 
        expand={true}
        richColors={false}
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: '14px'
          }
        }}
      />
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
          <p className="text-base text-white/50 mb-6">
            {language === 'fr' 
              ? 'Découvrez et achetez des visuels prêts à l\'emploi, imaginés, promptés et générés par notre équipe.'
              : 'Discover and purchase ready-to-use visuals, imagined, prompted and generated by our team.'}
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <div className={cn(
              "relative bg-white/5 backdrop-blur-xl border rounded-2xl transition-all duration-300",
              searchFocused ? "border-violet-500/50 shadow-lg shadow-violet-500/20" : "border-white/10"
            )}>
              <div className="flex items-center gap-3 px-4 py-3">
                <Search className="h-5 w-5 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  placeholder={language === 'fr' ? 'Rechercher un visuel...' : 'Search for a visual...'}
                  className="flex-1 bg-transparent text-white placeholder:text-white/30 outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="h-4 w-4 text-white/40" />
                  </button>
                )}
              </div>
            </div>

            {/* Popular Keywords Dropdown */}
            <AnimatePresence>
              {searchFocused && popularKeywords.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-2 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl z-50"
                >
                  <p className="text-white/50 text-xs mb-3">
                    {language === 'fr' ? 'Mots-clés populaires' : 'Popular keywords'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {popularKeywords.map((keyword, idx) => (
                      <button
                        key={idx}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setSearchQuery(keyword);
                        }}
                        className="px-3 py-1.5 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 text-violet-300 text-xs rounded-full transition-colors"
                      >
                        {keyword}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Categories Tabs */}
        <div className="px-6 mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2",
                  selectedCategory === 'all'
                    ? "bg-violet-600 text-white"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                )}
              >
                <span>{language === 'fr' ? 'Tout' : 'All'}</span>
                <span className={cn(
                  "px-1.5 py-0.5 rounded-full text-xs",
                  selectedCategory === 'all' ? "bg-white/20" : "bg-white/10"
                )}>
                  {getCategoryCount('all')}
                </span>
              </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2",
                  selectedCategory === cat.slug
                    ? "bg-violet-600 text-white"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                )}
              >
                <span>{language === 'fr' ? cat.name_fr : (cat.name_en || cat.name_fr)}</span>
                <span className={cn(
                  "px-1.5 py-0.5 rounded-full text-xs",
                  selectedCategory === cat.slug ? "bg-white/20" : "bg-white/10"
                )}>
                  {getCategoryCount(cat.slug)}
                </span>
              </button>
            ))}
            </div>
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
                const visualDimensions = item.dimensions || '1080x1080';
                
                // Calculate aspect ratio from dimensions
                let aspectRatio = '1 / 1'; // default square
                const [w, h] = visualDimensions.split('x').map(n => parseInt(n));
                if (w && h) {
                  aspectRatio = `${w} / ${h}`;
                }
                
                return (
                  <div key={item.id} className="break-inside-avoid">
                    <div className="rounded-lg bg-white/5 border border-white/10 hover:border-violet-500/50 transition-all duration-300 overflow-hidden">
                      {/* Image */}
                      <div 
                        className="relative cursor-pointer group/image"
                        onClick={() => setEnlargedImage(item)}
                        onContextMenu={(e) => {
                          if (!isAdmin) {
                            e.preventDefault();
                            return false;
                          }
                        }}
                        style={{ aspectRatio }}
                      >
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="select-none pointer-events-none"
                          style={{ 
                            display: 'block', 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            MozUserSelect: 'none',
                            msUserSelect: 'none',
                            WebkitTouchCallout: 'none'
                          }}
                          loading="lazy"
                          draggable="false"
                          onDragStart={(e) => !isAdmin && e.preventDefault()}
                          onContextMenu={(e) => {
                            if (!isAdmin) {
                              e.preventDefault();
                              return false;
                            }
                          }}
                        />
                        {/* Transparent overlay to prevent long-press on mobile */}
                        {!isAdmin && (
                          <div 
                            className="absolute inset-0 z-10"
                            style={{ 
                              WebkitTouchCallout: 'none',
                              WebkitUserSelect: 'none',
                              userSelect: 'none'
                            }}
                          />
                        )}
                        {/* Watermark iGPT */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                          <div className="text-white/15 text-4xl font-bold rotate-[-30deg] select-none">
                            iGPT
                          </div>
                        </div>
                        {/* Hover zoom indicator */}
                        <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-all duration-300 flex items-center justify-center z-30 pointer-events-none">
                          <div className="opacity-0 group-hover/image:opacity-100 transition-opacity bg-white/20 backdrop-blur-sm rounded-full p-3">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                          </div>
                        </div>
                        
                        {/* Success overlay - only on image */}
                        <AnimatePresence>
                          {isPurchased && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-700 flex flex-col items-center justify-center"
                            >
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
                                className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-3 shadow-2xl"
                              >
                                <Check className="h-9 w-9 text-green-600" strokeWidth={4} />
                              </motion.div>
                              <motion.h3
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-white font-bold text-base mb-1 text-center"
                              >
                                {language === 'fr' ? '✨ Achat réussi !' : '✨ Purchase complete!'}
                              </motion.h3>
                              <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-white/90 text-xs text-center"
                              >
                                {language === 'fr' ? 'Dans "Mes visuels"' : 'In "My Visuals"'}
                              </motion.p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Product Info */}
                      <div className="p-4 space-y-3">
                        {/* Title */}
                        <h3 className="text-white font-bold text-sm line-clamp-2 min-h-[2.5rem]">
                          {item.title}
                        </h3>
                        
                        {/* Description */}
                        {item.description && (
                          <p className="text-white/60 text-xs line-clamp-2 min-h-[2rem]">
                            {item.description}
                          </p>
                        )}
                        
                        {/* Format Badge */}
                        <div>
                          <FormatBadge dimensions={visualDimensions} language={language} />
                        </div>
                        
                        {/* Price and Button */}
                        <div className="space-y-2 pt-2">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-1">
                              <Sparkles className="h-4 w-4 text-amber-400" />
                              <span className="text-white font-bold text-lg">{item.price_credits}</span>
                              <span className="text-white/60 text-xs">
                                {language === 'fr' 
                                  ? (item.price_credits === 1 ? 'crédit' : 'crédits')
                                  : (item.price_credits === 1 ? 'credit' : 'credits')
                                }
                              </span>
                            </div>
                          
                          {wasAlreadyPurchased ? (
                            <Button
                              size="sm"
                              disabled
                              className="bg-blue-600 hover:bg-blue-600 text-white cursor-default"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              {language === 'fr' ? 'Acheté' : 'Purchased'}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handlePurchase(item)}
                              disabled={purchasing === item.id}
                              className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
                            >
                              {purchasing === item.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                language === 'fr' ? 'Acheter' : 'Buy'
                              )}
                            </Button>
                          )}
                          </div>

                          {/* User Credits Display */}
                          {credits && (
                          <div className="text-xs text-white/40 flex items-center gap-1">
                            <span>{language === 'fr' ? 'Vos crédits :' : 'Your credits:'}</span>
                            <span className="text-amber-400 font-medium">
                              {(credits.free_downloads || 0) + (credits.paid_credits || 0)}
                            </span>
                          </div>
                          )}
                          </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </Masonry>
          )}
        </div>

        {/* Image Enlarged Modal */}
        <AnimatePresence>
          {enlargedImage && (() => {
              // ALWAYS use StoreItem dimensions - this is what admin chose
              const dims = enlargedImage.dimensions || '1080x1080';
              const [w, h] = dims.split('x').map(n => parseInt(n));

              if (!w || !h) {
                console.error('Invalid dimensions:', dims);
                return null;
              }

              const aspectRatio = w / h;

              // Calculate max dimensions based on viewport
              const maxWidth = window.innerWidth * 0.9;
              const maxHeight = window.innerHeight * 0.9;

              let displayWidth, displayHeight;
              if (aspectRatio > maxWidth / maxHeight) {
                // Width-constrained
                displayWidth = maxWidth;
                displayHeight = maxWidth / aspectRatio;
              } else {
                // Height-constrained
                displayHeight = maxHeight;
                displayWidth = maxHeight * aspectRatio;
              }

              return (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
                  onClick={() => setEnlargedImage(null)}
                  onContextMenu={(e) => {
                    if (!isAdmin) {
                      e.preventDefault();
                      return false;
                    }
                  }}
                >
                  {/* Image container */}
                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.95 }}
                    className="relative w-full h-full flex items-center justify-center p-4 md:p-8"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div 
                      className="relative pointer-events-none select-none"
                      style={{
                        width: `${displayWidth}px`,
                        height: `${displayHeight}px`,
                        aspectRatio: `${w} / ${h}`
                      }}
                    >
                      <img
                        src={enlargedImage.image_url}
                        alt={enlargedImage.title}
                        className="rounded-lg shadow-2xl select-none pointer-events-none"
                        style={{ 
                          display: 'block',
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          userSelect: 'none',
                          WebkitUserSelect: 'none',
                          MozUserSelect: 'none',
                          msUserSelect: 'none',
                          WebkitTouchCallout: 'none',
                          pointerEvents: 'none',
                          aspectRatio: `${w} / ${h}`
                        }}
                        draggable="false"
                        onDragStart={(e) => e.preventDefault()}
                        onContextMenu={(e) => {
                          if (!isAdmin) {
                            e.preventDefault();
                            return false;
                          }
                        }}
                      />
                    {/* Watermark iGPT */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                      <div className="text-white/30 text-6xl md:text-8xl lg:text-9xl font-bold rotate-[-30deg] select-none drop-shadow-[0_0_4px_rgba(0,0,0,0.6)]">
                        iGPT
                      </div>
                    </div>
                    {/* Transparent overlay to prevent long-press/download on mobile */}
                    {!isAdmin && (
                      <div 
                        className="absolute inset-0 z-30"
                        style={{ 
                          WebkitTouchCallout: 'none',
                          WebkitUserSelect: 'none',
                          userSelect: 'none'
                        }}
                      />
                    )}
                    </div>
                  {/* Close button - outside image container */}
                  <button
                    onClick={() => setEnlargedImage(null)}
                    className="absolute top-4 left-1/2 -translate-x-1/2 p-4 bg-red-600 hover:bg-red-700 rounded-full text-white transition-all z-10 shadow-2xl pointer-events-auto"
                  >
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  
                  {/* Watermark info message */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20 pointer-events-none">
                    <p className="text-white/90 text-sm font-medium flex items-center gap-2">
                      <Info className="h-4 w-4 text-yellow-400" />
                      {language === 'fr' 
                        ? 'Le filigrane iGPT disparaît après achat dans "Mes visuels"'
                        : 'iGPT watermark disappears after purchase in "My Visuals"'}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            );
          })()}
          </AnimatePresence>

        {/* Footer */}
        <div className="fixed bottom-0 left-0 right-0 z-40">
          <div className={cn("transition-all duration-300", sidebarOpen && "md:ml-64")}>
            <div className="bg-[#0a0a0f]/90 backdrop-blur-sm border-t border-white/5 py-4">
              <div className="flex items-center justify-center">
                <p className="text-white/40 text-xs">
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
    </div>
  );
}