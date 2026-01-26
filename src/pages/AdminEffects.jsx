import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2, Upload, Loader2, Sparkles, FolderPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminEffects() {
  const [effects, setEffects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingEffect, setEditingEffect] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name_fr: '',
    name_en: '',
    categories: [],
    prompt: '',
    thumbnail_url: '',
    thumbnail_url_2: '',
    thumbnail_url_3: '',
    thumbnail_url_4: '',
    thumbnail_url_5: '',
    is_active: true,
    order: 0
  });

  const [categoryFormData, setCategoryFormData] = useState({
    id_slug: '',
    name_fr: '',
    name_en: '',
    is_active: true,
    order: 0
  });

  useEffect(() => {
    loadEffects();
    loadCategories();
  }, []);

  const loadEffects = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.EffectPreset.list('-created_date');
      setEffects(data);
    } catch (e) {
      console.error('Failed to load effects:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await base44.entities.EffectCategory.filter({ is_active: true }, 'order');
      setCategories(data);
    } catch (e) {
      console.error('Failed to load categories:', e);
    }
  };

  const handleUploadThumbnail = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, thumbnail_url: file_url }));
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleUploadThumbnail2 = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, thumbnail_url_2: file_url }));
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleUploadThumbnail3 = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, thumbnail_url_3: file_url }));
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleUploadThumbnail4 = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, thumbnail_url_4: file_url }));
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleUploadThumbnail5 = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, thumbnail_url_5: file_url }));
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingEffect) {
        await base44.entities.EffectPreset.update(editingEffect.id, formData);
      } else {
        await base44.entities.EffectPreset.create(formData);
      }
      loadEffects();
      handleCloseModal();
    } catch (e) {
      console.error('Save failed:', e);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleSaveCategory = async () => {
    try {
      if (editingCategory) {
        await base44.entities.EffectCategory.update(editingCategory.id, categoryFormData);
      } else {
        await base44.entities.EffectCategory.create(categoryFormData);
      }
      loadCategories();
      handleCloseCategoryModal();
    } catch (e) {
      console.error('Save category failed:', e);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Supprimer cette catégorie ?')) return;
    try {
      await base44.entities.EffectCategory.delete(id);
      loadCategories();
    } catch (e) {
      console.error('Delete category failed:', e);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet effet ?')) return;
    try {
      await base44.entities.EffectPreset.delete(id);
      loadEffects();
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  const handleOpenModal = (effect = null) => {
    if (effect) {
      setEditingEffect(effect);
      setFormData({
        name_fr: effect.name_fr || '',
        name_en: effect.name_en || '',
        categories: effect.categories || [],
        prompt: effect.prompt || '',
        thumbnail_url: effect.thumbnail_url || '',
        thumbnail_url_2: effect.thumbnail_url_2 || '',
        thumbnail_url_3: effect.thumbnail_url_3 || '',
        thumbnail_url_4: effect.thumbnail_url_4 || '',
        thumbnail_url_5: effect.thumbnail_url_5 || '',
        is_active: effect.is_active !== false,
        order: effect.order || 0
      });
    } else {
      setEditingEffect(null);
      setFormData({
        name_fr: '',
        name_en: '',
        categories: [],
        prompt: '',
        thumbnail_url: '',
        thumbnail_url_2: '',
        thumbnail_url_3: '',
        thumbnail_url_4: '',
        thumbnail_url_5: '',
        is_active: true,
        order: 0
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEffect(null);
  };

  const handleOpenCategoryModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryFormData({
        id_slug: category.id_slug || '',
        name_fr: category.name_fr || '',
        name_en: category.name_en || '',
        is_active: category.is_active !== false,
        order: category.order || 0
      });
    } else {
      setEditingCategory(null);
      setCategoryFormData({
        id_slug: '',
        name_fr: '',
        name_en: '',
        is_active: true,
        order: 0
      });
    }
    setShowCategoryModal(true);
  };

  const handleCloseCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Effets prédéfinis</h1>
            <p className="text-white/60 text-sm">Gérez les effets et catégories disponibles pour les utilisateurs</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleOpenCategoryModal()} variant="outline" className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/20">
              <FolderPlus className="h-4 w-4 mr-2" />
              Gérer catégories
            </Button>
            <Button onClick={() => handleOpenModal()} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Nouvel effet
            </Button>
          </div>
        </div>

        {/* Categories List */}
        {categories.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-white font-medium mb-3">Catégories ({categories.length})</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center gap-2 px-3 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
                  <span className="text-emerald-300 text-sm">{cat.name_fr}</span>
                  <button
                    onClick={() => handleOpenCategoryModal(cat)}
                    className="text-white/60 hover:text-white"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {effects.map((effect) => (
              <div key={effect.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                {effect.thumbnail_url ? (
                  <img src={effect.thumbnail_url} alt={effect.name_fr} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-emerald-600 to-green-600 flex items-center justify-center">
                    <Sparkles className="h-12 w-12 text-white/50" />
                  </div>
                )}
                
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{effect.name_fr}</h3>
                      {effect.name_en && <p className="text-white/60 text-sm">{effect.name_en}</p>}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleOpenModal(effect)}
                        className="p-1.5 hover:bg-white/10 rounded transition-colors"
                      >
                        <Pencil className="h-4 w-4 text-white/60" />
                      </button>
                      <button
                        onClick={() => handleDelete(effect.id)}
                        className="p-1.5 hover:bg-white/10 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    {(effect.categories || []).map((catSlug, idx) => (
                      <span key={idx} className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs">
                        {categories.find(c => c.id_slug === catSlug)?.name_fr || catSlug}
                      </span>
                    ))}
                    {!effect.is_active && (
                      <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-300 text-xs">
                        Inactif
                      </span>
                    )}
                  </div>
                  
                  <p className="text-white/60 text-xs line-clamp-2">{effect.prompt}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="bg-gray-900 border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingEffect ? 'Modifier l\'effet' : 'Nouvel effet'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="text-white/80 text-sm mb-2 block">Nom (FR) *</label>
                <Input
                  value={formData.name_fr}
                  onChange={(e) => setFormData({ ...formData, name_fr: e.target.value })}
                  placeholder="Vintage"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <label className="text-white/80 text-sm mb-2 block">Nom (EN)</label>
                <Input
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  placeholder="Vintage"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <label className="text-white/80 text-sm mb-2 block">Catégories * (au moins une)</label>
                <div className="space-y-2 p-3 bg-white/5 border border-white/10 rounded-lg max-h-48 overflow-y-auto">
                  {categories.map(cat => (
                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={formData.categories.includes(cat.id_slug)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, categories: [...formData.categories, cat.id_slug] });
                          } else {
                            setFormData({ ...formData, categories: formData.categories.filter(c => c !== cat.id_slug) });
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-white text-sm">{cat.name_fr}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-white/80 text-sm mb-2 block">Prompt *</label>
                <Textarea
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  placeholder="vintage photography style, warm tones, film grain, nostalgic mood"
                  className="bg-white/5 border-white/10 text-white min-h-[100px]"
                />
              </div>

              <div>
                <label className="text-white/80 text-sm mb-2 block">Miniature 1 - Avant</label>
                <div className="flex items-center gap-3">
                  {formData.thumbnail_url && (
                    <img src={formData.thumbnail_url} alt="" className="w-24 h-24 object-cover rounded-lg border border-white/10" />
                  )}
                  <label className="cursor-pointer">
                    <div className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-2">
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      <span className="text-sm">Choisir une image</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadThumbnail}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="text-white/80 text-sm mb-2 block">Miniature 2</label>
                <div className="flex items-center gap-3">
                  {formData.thumbnail_url_2 && (
                    <img src={formData.thumbnail_url_2} alt="" className="w-24 h-24 object-cover rounded-lg border border-white/10" />
                  )}
                  <label className="cursor-pointer">
                    <div className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-2">
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      <span className="text-sm">Choisir une image</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadThumbnail2}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="text-white/80 text-sm mb-2 block">Miniature 3</label>
                <div className="flex items-center gap-3">
                  {formData.thumbnail_url_3 && (
                    <img src={formData.thumbnail_url_3} alt="" className="w-24 h-24 object-cover rounded-lg border border-white/10" />
                  )}
                  <label className="cursor-pointer">
                    <div className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-2">
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      <span className="text-sm">Choisir une image</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadThumbnail3}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="text-white/80 text-sm mb-2 block">Miniature 4</label>
                <div className="flex items-center gap-3">
                  {formData.thumbnail_url_4 && (
                    <img src={formData.thumbnail_url_4} alt="" className="w-24 h-24 object-cover rounded-lg border border-white/10" />
                  )}
                  <label className="cursor-pointer">
                    <div className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-2">
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      <span className="text-sm">Choisir une image</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadThumbnail4}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="text-white/80 text-sm mb-2 block">Miniature 5</label>
                <div className="flex items-center gap-3">
                  {formData.thumbnail_url_5 && (
                    <img src={formData.thumbnail_url_5} alt="" className="w-24 h-24 object-cover rounded-lg border border-white/10" />
                  )}
                  <label className="cursor-pointer">
                    <div className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-2">
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      <span className="text-sm">Choisir une image</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadThumbnail5}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded"
                />
                <label className="text-white/80 text-sm">Actif</label>
              </div>

              <div>
                <label className="text-white/80 text-sm mb-2 block">Ordre</label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={handleCloseModal}>
                Annuler
              </Button>
              <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
                {editingEffect ? 'Modifier' : 'Créer'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Category Modal */}
        <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
          <DialogContent className="bg-gray-900 border-white/10 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-white/80 text-sm mb-2 block">ID Slug *</label>
                <Input
                  value={categoryFormData.id_slug}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, id_slug: e.target.value })}
                  placeholder="style"
                  className="bg-white/5 border-white/10 text-white"
                  disabled={!!editingCategory}
                />
                <p className="text-white/40 text-xs mt-1">Identifiant unique (ex: style, color)</p>
              </div>

              <div>
                <label className="text-white/80 text-sm mb-2 block">Nom (FR) *</label>
                <Input
                  value={categoryFormData.name_fr}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name_fr: e.target.value })}
                  placeholder="Style"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <label className="text-white/80 text-sm mb-2 block">Nom (EN)</label>
                <Input
                  value={categoryFormData.name_en}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name_en: e.target.value })}
                  placeholder="Style"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={categoryFormData.is_active}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, is_active: e.target.checked })}
                  className="rounded"
                />
                <label className="text-white/80 text-sm">Active</label>
              </div>

              <div>
                <label className="text-white/80 text-sm mb-2 block">Ordre</label>
                <Input
                  type="number"
                  value={categoryFormData.order}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, order: parseInt(e.target.value) || 0 })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={handleCloseCategoryModal}>
                Annuler
              </Button>
              <Button onClick={handleSaveCategory} className="bg-emerald-600 hover:bg-emerald-700">
                {editingCategory ? 'Modifier' : 'Créer'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}