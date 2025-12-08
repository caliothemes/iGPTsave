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
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price_credits: 10,
    category_slug: ''
  });

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
    if (visual) {
      setFormData({
        title: visual.title || '',
        description: visual.original_prompt || '',
        price_credits: 10,
        category_slug: visual.visual_type || ''
      });
    }
  }, [visual]);

  const handleSubmit = async () => {
    if (!formData.title || !formData.price_credits || !formData.category_slug) {
      toast.error('Tous les champs sont requis');
      return;
    }

    setLoading(true);
    try {
      await base44.entities.StoreItem.create({
        visual_id: visual.id,
        title: formData.title,
        description: formData.description,
        price_credits: formData.price_credits,
        category_slug: formData.category_slug,
        image_url: visual.image_url,
        is_active: true
      });

      toast.success('✨ Visuel ajouté au Store !');
      onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
      toast.error('Erreur lors de l\'ajout au Store');
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-white/10 max-w-md">
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
              <label className="text-white/60 text-sm mb-2 block">Prix en crédits *</label>
              <Input
                type="number"
                value={formData.price_credits}
                onChange={(e) => setFormData({ ...formData, price_credits: parseInt(e.target.value) || 0 })}
                placeholder="10"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Annuler
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Ajout...
                  </>
                ) : (
                  'Valider'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}