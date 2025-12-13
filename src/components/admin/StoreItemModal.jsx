import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Tag, X } from 'lucide-react';
import { toast } from 'sonner';

export default function StoreItemModal({ visual, isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [existingItem, setExistingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price_credits: 10,
    category_slugs: [],
    dimensions: '1080x1080',
    keywords: []
  });
  const [keywordInput, setKeywordInput] = useState('');

  const formatOptions = [
    { value: '1080x1080', label: 'Carré 1:1' },
    { value: '1080x1920', label: 'Story vertical 9:16' },
    { value: '1080x1350', label: 'Portrait 3:4' },
    { value: '1920x1080', label: 'Paysage 16:9' }
  ];

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await base44.entities.StoreCategory.filter({ is_active: true }, 'order');
        setCategories(cats);
      } catch (e) {
        console.error(e);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const loadExistingItem = async () => {
      if (visual && isOpen) {
        // Check if this visual is already in store
        const items = await base44.entities.StoreItem.filter({ visual_id: visual.id });
        if (items.length > 0) {
          const item = items[0];
          setExistingItem(item);
          setFormData({
            title: item.title,
            description: item.description || '',
            price_credits: item.price_credits,
            category_slugs: item.category_slugs || [],
            dimensions: item.dimensions || visual.dimensions || '1080x1080',
            keywords: item.keywords || []
          });
        } else {
          setExistingItem(null);
          // Prioritize visual dimensions from the database
          const visualDimensions = visual.dimensions || '1080x1080';
          setFormData({
            title: visual.title || '',
            description: visual.original_prompt || '',
            price_credits: 10,
            category_slugs: visual.visual_type ? [visual.visual_type] : [],
            dimensions: visualDimensions,
            keywords: []
          });
          console.log('📐 Dimensions du visuel:', visualDimensions);
        }
      }
    };
    loadExistingItem();
  }, [visual, isOpen]);

  const handleSubmit = async () => {
    if (!formData.title || !formData.price_credits || formData.category_slugs.length === 0) {
      toast.error('Titre, prix et au moins une catégorie sont requis');
      return;
    }

    setLoading(true);
    try {
      if (existingItem) {
        // Update existing item
        await base44.entities.StoreItem.update(existingItem.id, {
          title: formData.title,
          description: formData.description,
          price_credits: formData.price_credits,
          category_slugs: formData.category_slugs,
          image_url: visual.image_url,
          video_url: visual.video_url || null,
          dimensions: formData.dimensions,
          keywords: formData.keywords
        });
        toast.success('✨ Produit modifié !');
      } else {
        // Create new item
        await base44.entities.StoreItem.create({
          visual_id: visual.id,
          title: formData.title,
          description: formData.description,
          price_credits: formData.price_credits,
          category_slugs: formData.category_slugs,
          image_url: visual.image_url,
          video_url: visual.video_url || null,
          dimensions: formData.dimensions,
          keywords: formData.keywords,
          is_active: true
        });
        toast.success('✨ Visuel ajouté au Store !');
      }
      onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
      toast.error('Erreur lors de l\'opération');
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!existingItem) return;
    if (!confirm('Supprimer ce produit du store ?')) return;

    setDeleting(true);
    try {
      await base44.entities.StoreItem.delete(existingItem.id);
      toast.success('✨ Produit retiré du store !');
      onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
      toast.error('Erreur lors de la suppression');
    }
    setDeleting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-white/10 max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">
            {existingItem ? 'Modifier le produit' : 'Ajouter au Store'}
          </DialogTitle>
        </DialogHeader>
        
        {visual && (
          <div className="space-y-4">
            <div className="aspect-video rounded-lg overflow-hidden bg-white/5">
              {visual.video_url || (visual.image_url && (visual.image_url.includes('.mp4') || visual.image_url.includes('/video'))) ? (
                <video 
                  src={visual.video_url || visual.image_url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img 
                  src={visual.image_url} 
                  alt="Aperçu" 
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div>
              <label className="text-white/60 text-sm mb-2 block">Titre *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Titre du produit"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div>
              <label className="text-white/60 text-sm mb-2 block">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description du produit..."
                className="bg-white/5 border-white/10 text-white h-20"
              />
            </div>

            <div>
              <label className="text-white/60 text-sm mb-2 block">Catégories * (sélection multiple)</label>
              <Select 
                value="select_category"
                onValueChange={(value) => {
                  if (!formData.category_slugs.includes(value)) {
                    setFormData({ ...formData, category_slugs: [...formData.category_slugs, value] });
                  }
                }}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Ajouter une catégorie" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/10">
                  {categories.map(cat => (
                    <SelectItem 
                      key={cat.id} 
                      value={cat.slug} 
                      className="text-white"
                      disabled={formData.category_slugs.includes(cat.slug)}
                    >
                      {cat.name_fr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.category_slugs.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.category_slugs.map((slug, idx) => {
                    const cat = categories.find(c => c.slug === slug);
                    return (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs rounded-full"
                      >
                        {cat?.name_fr || slug}
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              category_slugs: formData.category_slugs.filter((_, i) => i !== idx)
                            });
                          }}
                          className="hover:text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="text-white/60 text-sm mb-2 block">Format / Dimensions *</label>
              <Select 
                value={formData.dimensions}
                onValueChange={(value) => setFormData({ ...formData, dimensions: value })}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Sélectionner un format" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/10">
                  {formatOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value} className="text-white">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-white/60 text-sm mb-2 block">Prix en crédits *</label>
              <Input
                type="number"
                value={formData.price_credits}
                onChange={(e) => setFormData({ ...formData, price_credits: parseInt(e.target.value) || 0 })}
                placeholder="10"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-white/60 text-sm mb-2 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Mots-clés (pour la recherche)
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const newKeyword = keywordInput.trim().toLowerCase();
                      if (newKeyword && !formData.keywords.includes(newKeyword)) {
                        setFormData({ ...formData, keywords: [...formData.keywords, newKeyword] });
                        setKeywordInput('');
                      }
                    }
                  }}
                  placeholder="Tapez un mot-clé et appuyez sur Entrée"
                  className="bg-white/5 border-white/10 text-white"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const newKeyword = keywordInput.trim().toLowerCase();
                    if (newKeyword && !formData.keywords.includes(newKeyword)) {
                      setFormData({ ...formData, keywords: [...formData.keywords, newKeyword] });
                      setKeywordInput('');
                    }
                  }}
                  className="bg-violet-600 hover:bg-violet-700 border-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.keywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs rounded-full"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            keywords: formData.keywords.filter((_, i) => i !== idx)
                          });
                        }}
                        className="hover:text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-between pt-4">
              <div>
                {existingItem && (
                  <Button 
                    variant="outline" 
                    onClick={handleDelete} 
                    disabled={deleting || loading}
                    className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Suppression...
                      </>
                    ) : (
                      'Supprimer'
                    )}
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose} disabled={loading || deleting}>
                  Annuler
                </Button>
                <Button onClick={handleSubmit} disabled={loading || deleting}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {existingItem ? 'Modification...' : 'Ajout...'}
                    </>
                  ) : (
                    existingItem ? 'Modifier' : 'Ajouter'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}