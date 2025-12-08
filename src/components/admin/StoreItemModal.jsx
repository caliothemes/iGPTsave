import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';
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
    category_slug: '',
    dimensions: '1080x1080'
  });

  const formatOptions = [
    { value: '1080x1080', label: '1080x1080 - 1:1 (Carré)' },
    { value: '1080x1920', label: '1080x1920 - 9:16 (Story/Vertical)' },
    { value: '1920x1080', label: '1920x1080 - 16:9 (Paysage)' },
    { value: '1200x628', label: '1200x628 - ~2:1 (Couverture Facebook)' },
    { value: '1024x1024', label: '1024x1024 - 1:1 (Logo HD)' },
    { value: '2000x2000', label: '2000x2000 - 1:1 (Print Carré)' },
    { value: '2480x3508', label: '2480x3508 - A4 Portrait' },
    { value: '3508x2480', label: '3508x2480 - A4 Paysage' },
    { value: '1748x2480', label: '1748x2480 - A5 Portrait' },
    { value: '2480x1748', label: '2480x1748 - A5 Paysage' },
    { value: '3508x4961', label: '3508x4961 - A3 Portrait' },
    { value: '4961x3508', label: '4961x3508 - A3 Paysage' }
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
            category_slug: item.category_slug,
            dimensions: item.dimensions || visual.dimensions || '1080x1080'
          });
        } else {
          setExistingItem(null);
          setFormData({
            title: visual.title || '',
            description: visual.original_prompt || '',
            price_credits: 10,
            category_slug: visual.visual_type || '',
            dimensions: visual.dimensions || '1080x1080'
          });
        }
      }
    };
    loadExistingItem();
  }, [visual, isOpen]);

  const handleSubmit = async () => {
    if (!formData.title || !formData.price_credits || !formData.category_slug) {
      toast.error('Tous les champs sont requis');
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
          category_slug: formData.category_slug,
          image_url: visual.image_url,
          dimensions: formData.dimensions
        });
        toast.success('✨ Produit modifié !');
      } else {
        // Create new item
        await base44.entities.StoreItem.create({
          visual_id: visual.id,
          title: formData.title,
          description: formData.description,
          price_credits: formData.price_credits,
          category_slug: formData.category_slug,
          image_url: visual.image_url,
          dimensions: formData.dimensions,
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
              <img 
                src={visual.image_url} 
                alt="Aperçu" 
                className="w-full h-full object-cover"
              />
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
              <label className="text-white/60 text-sm mb-2 block">Catégorie *</label>
              <Select 
                value={formData.category_slug}
                onValueChange={(value) => setFormData({ ...formData, category_slug: value })}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/10">
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.slug} className="text-white">
                      {cat.name_fr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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