import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Save, X, ArrowUp, ArrowDown, Upload, ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from 'sonner';

export default function AdminImageEditExamples() {
  const { language } = useLanguage();
  const [examples, setExamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingExample, setEditingExample] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    title_fr: '',
    title_en: '',
    before_image_url: '',
    after_image_url: '',
    prompt: '',
    order: 0,
    is_active: true
  });

  useEffect(() => {
    loadExamples();
  }, []);

  const loadExamples = async () => {
    try {
      setLoading(true);
      const data = await base44.entities.ImageEditExample.list('order');
      setExamples(data);
    } catch (error) {
      console.error('Failed to load examples:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImage = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, [field]: file_url }));
      toast.success('Image uploadée');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Erreur upload');
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.before_image_url || !formData.after_image_url || !formData.prompt) {
        toast.error('Remplissez tous les champs obligatoires');
        return;
      }

      if (editingExample) {
        await base44.entities.ImageEditExample.update(editingExample.id, formData);
        toast.success('Exemple mis à jour');
      } else {
        await base44.entities.ImageEditExample.create(formData);
        toast.success('Exemple créé');
      }

      setShowModal(false);
      setEditingExample(null);
      setFormData({
        title_fr: '',
        title_en: '',
        before_image_url: '',
        after_image_url: '',
        prompt: '',
        order: 0,
        is_active: true
      });
      loadExamples();
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (example) => {
    setEditingExample(example);
    setFormData({
      title_fr: example.title_fr || '',
      title_en: example.title_en || '',
      before_image_url: example.before_image_url || '',
      after_image_url: example.after_image_url || '',
      prompt: example.prompt || '',
      order: example.order || 0,
      is_active: example.is_active !== false
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet exemple ?')) return;
    try {
      await base44.entities.ImageEditExample.delete(id);
      toast.success('Exemple supprimé');
      loadExamples();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleMoveUp = async (example, index) => {
    if (index === 0) return;
    const prevExample = examples[index - 1];
    await base44.entities.ImageEditExample.update(example.id, { order: prevExample.order });
    await base44.entities.ImageEditExample.update(prevExample.id, { order: example.order });
    loadExamples();
  };

  const handleMoveDown = async (example, index) => {
    if (index === examples.length - 1) return;
    const nextExample = examples[index + 1];
    await base44.entities.ImageEditExample.update(example.id, { order: nextExample.order });
    await base44.entities.ImageEditExample.update(nextExample.id, { order: example.order });
    loadExamples();
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Exemples de modification d'images</h1>
            <p className="text-white/60 text-sm mt-1">Gérez les exemples affichés dans le modal d'édition d'images</p>
          </div>
          <Button
            onClick={() => {
              setEditingExample(null);
              setFormData({
                title_fr: '',
                title_en: '',
                before_image_url: '',
                after_image_url: '',
                prompt: '',
                order: examples.length,
                is_active: true
              });
              setShowModal(true);
            }}
            className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvel exemple
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          </div>
        ) : examples.length === 0 ? (
          <div className="text-center py-20">
            <Sparkles className="h-12 w-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/60 text-sm">Aucun exemple. Créez-en un pour commencer.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {examples.map((example, idx) => (
              <div
                key={example.id}
                className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-orange-500/30 transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* Preview Images */}
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-black/20">
                      <img src={example.before_image_url} alt="Before" className="w-full h-full object-cover" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-orange-500 flex-shrink-0" />
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-black/20">
                      <img src={example.after_image_url} alt="After" className="w-full h-full object-cover" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-white font-semibold">
                          {example.title_fr}
                          {example.title_en && (
                            <span className="text-white/50 text-sm ml-2">/ {example.title_en}</span>
                          )}
                        </h3>
                        <p className="text-white/60 text-xs mt-1 line-clamp-2">{example.prompt}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          example.is_active 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {example.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMoveUp(example, idx)}
                      disabled={idx === 0}
                      className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(example, idx)}
                      disabled={idx === examples.length - 1}
                      className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(example)}
                      className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(example.id)}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit/Create Modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="bg-gray-900 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingExample ? 'Modifier l\'exemple' : 'Nouvel exemple'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {/* Titles */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/80 mb-2 block">Titre (FR)</label>
                  <Input
                    value={formData.title_fr}
                    onChange={(e) => setFormData(prev => ({ ...prev, title_fr: e.target.value }))}
                    placeholder="Ex: Changement de couleur"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/80 mb-2 block">Titre (EN)</label>
                  <Input
                    value={formData.title_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, title_en: e.target.value }))}
                    placeholder="Ex: Color change"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>

              {/* Images */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/80 mb-2 block">Image AVANT *</label>
                  {formData.before_image_url ? (
                    <div className="relative">
                      <img 
                        src={formData.before_image_url} 
                        alt="Before" 
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, before_image_url: '' }))}
                        className="absolute top-2 right-2 p-1 bg-red-600 rounded-full hover:bg-red-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-orange-500/50 transition-colors">
                      <Upload className="h-8 w-8 text-white/40 mb-2" />
                      <span className="text-white/60 text-xs">Cliquer pour uploader</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleUploadImage(e, 'before_image_url')}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div>
                  <label className="text-sm text-white/80 mb-2 block">Image APRÈS *</label>
                  {formData.after_image_url ? (
                    <div className="relative">
                      <img 
                        src={formData.after_image_url} 
                        alt="After" 
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, after_image_url: '' }))}
                        className="absolute top-2 right-2 p-1 bg-red-600 rounded-full hover:bg-red-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-orange-500/50 transition-colors">
                      <Upload className="h-8 w-8 text-white/40 mb-2" />
                      <span className="text-white/60 text-xs">Cliquer pour uploader</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleUploadImage(e, 'after_image_url')}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Prompt */}
              <div>
                <label className="text-sm text-white/80 mb-2 block">Prompt de modification *</label>
                <Textarea
                  value={formData.prompt}
                  onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
                  placeholder="Ex: Change the car color from red to electric blue..."
                  className="bg-white/5 border-white/10 text-white min-h-[100px]"
                />
              </div>

              {/* Order & Active */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/80 mb-2 block">Ordre d'affichage</label>
                  <Input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  <label className="text-sm text-white/80">Actif</label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}