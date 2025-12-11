import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash2, Edit } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from 'sonner';

export default function AdminStoreCategories() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [categoryPreviews, setCategoryPreviews] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name_fr: '',
    name_en: '',
    slug: '',
    order: 0
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const cats = await base44.entities.StoreCategory.list('order');
      setCategories(cats);

      // Load latest visual for each category
      const previews = {};
      for (const cat of cats) {
        try {
          const items = await base44.entities.StoreItem.filter(
            { category_slugs: cat.slug, is_active: true },
            '-created_date',
            1
          );
          if (items.length > 0) {
            previews[cat.slug] = items[0].image_url;
          }
        } catch (e) {
          console.error('Error loading preview for', cat.slug, e);
        }
      }
      setCategoryPreviews(previews);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name_fr: category.name_fr,
        name_en: category.name_en || '',
        slug: category.slug,
        order: category.order || 0
      });
    } else {
      setEditingCategory(null);
      setFormData({ name_fr: '', name_en: '', slug: '', order: 0 });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name_fr || !formData.slug) {
      toast.error('Nom français et slug requis');
      return;
    }

    try {
      if (editingCategory) {
        await base44.entities.StoreCategory.update(editingCategory.id, formData);
        toast.success('Catégorie modifiée');
      } else {
        await base44.entities.StoreCategory.create(formData);
        toast.success('Catégorie créée');
      }
      setShowModal(false);
      loadCategories();
    } catch (e) {
      console.error(e);
      toast.error('Erreur');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette catégorie ?')) return;
    try {
      await base44.entities.StoreCategory.delete(id);
      toast.success('Catégorie supprimée');
      loadCategories();
    } catch (e) {
      console.error(e);
      toast.error('Erreur');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Catégories Store</h1>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle catégorie
          </Button>
        </div>

        <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left text-white/60 text-sm">Aperçu</th>
                <th className="px-4 py-3 text-left text-white/60 text-sm">Nom FR</th>
                <th className="px-4 py-3 text-left text-white/60 text-sm">Nom EN</th>
                <th className="px-4 py-3 text-left text-white/60 text-sm">Slug</th>
                <th className="px-4 py-3 text-left text-white/60 text-sm">Ordre</th>
                <th className="px-4 py-3 text-left text-white/60 text-sm">Statut</th>
                <th className="px-4 py-3 text-left text-white/60 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id} className="border-t border-white/5">
                  <td className="px-4 py-3">
                    {categoryPreviews[cat.slug] ? (
                      <img 
                        src={categoryPreviews[cat.slug]} 
                        alt={cat.name_fr}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-white/5 rounded-lg flex items-center justify-center">
                        <span className="text-white/30 text-xs">Vide</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-white">{cat.name_fr}</td>
                  <td className="px-4 py-3 text-white/60">{cat.name_en || '-'}</td>
                  <td className="px-4 py-3 text-white/60 font-mono text-xs">{cat.slug}</td>
                  <td className="px-4 py-3 text-white/60">{cat.order}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${cat.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {cat.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleOpenModal(cat)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(cat.id)}>
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-gray-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-white/60 text-sm mb-2 block">Nom français *</label>
              <Input
                value={formData.name_fr}
                onChange={(e) => setFormData({ ...formData, name_fr: e.target.value })}
                placeholder="Logo Pictogramme"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-white/60 text-sm mb-2 block">Nom anglais</label>
              <Input
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                placeholder="Logo Icon"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-white/60 text-sm mb-2 block">Slug (identifiant unique) *</label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                placeholder="logo_picto"
                className="bg-white/5 border-white/10 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-white/60 text-sm mb-2 block">Ordre d'affichage</label>
              <Input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Annuler
              </Button>
              <Button onClick={handleSave}>
                Enregistrer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}