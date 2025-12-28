import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Upload, Video, ArrowRight } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { toast } from 'sonner';

export default function AdminVideoExamples() {
  const [examples, setExamples] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingExample, setEditingExample] = useState(null);
  const [formData, setFormData] = useState({
    title_fr: '',
    title_en: '',
    image_url: '',
    prompt: '',
    video_url: '',
    provider: 'replicate',
    duration: 5,
    order: 0,
    is_active: true
  });
  const [uploading, setUploading] = useState({ image: false, video: false });

  useEffect(() => {
    loadExamples();
  }, []);

  const loadExamples = async () => {
    try {
      const data = await base44.entities.VideoExample.list('order', 100);
      setExamples(data);
    } catch (error) {
      console.error('Error loading examples:', error);
      toast.error('Erreur de chargement');
    }
  };

  const handleFileUpload = async (file, type) => {
    try {
      setUploading(prev => ({ ...prev, [type]: true }));
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({
        ...prev,
        [type === 'image' ? 'image_url' : 'video_url']: file_url
      }));
      toast.success(`${type === 'image' ? 'Image' : 'Vidéo'} uploadée`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erreur upload');
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.image_url || !formData.prompt || !formData.video_url) {
        toast.error('Image, prompt et vidéo requis');
        return;
      }

      if (editingExample) {
        await base44.entities.VideoExample.update(editingExample.id, formData);
        toast.success('Exemple mis à jour');
      } else {
        await base44.entities.VideoExample.create(formData);
        toast.success('Exemple créé');
      }

      setShowModal(false);
      setEditingExample(null);
      resetForm();
      loadExamples();
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Erreur sauvegarde');
    }
  };

  const handleEdit = (example) => {
    setEditingExample(example);
    setFormData({
      title_fr: example.title_fr || '',
      title_en: example.title_en || '',
      image_url: example.image_url || '',
      prompt: example.prompt || '',
      video_url: example.video_url || '',
      provider: example.provider || 'replicate',
      duration: example.duration || 5,
      order: example.order || 0,
      is_active: example.is_active !== false
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet exemple ?')) return;
    try {
      await base44.entities.VideoExample.delete(id);
      toast.success('Exemple supprimé');
      loadExamples();
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Erreur suppression');
    }
  };

  const resetForm = () => {
    setFormData({
      title_fr: '',
      title_en: '',
      image_url: '',
      prompt: '',
      video_url: '',
      provider: 'replicate',
      duration: 5,
      order: 0,
      is_active: true
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Exemples Vidéo</h1>
          <Button
            onClick={() => {
              resetForm();
              setEditingExample(null);
              setShowModal(true);
            }}
            className="bg-violet-600 hover:bg-violet-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvel exemple
          </Button>
        </div>

        {/* Examples Grid */}
        <div className="grid grid-cols-1 gap-4">
          {examples.map((example) => (
            <div
              key={example.id}
              className="bg-white/5 border border-white/10 rounded-lg p-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-[200px_auto_200px] gap-4 items-center">
                {/* Image */}
                <div className="space-y-2">
                  <p className="text-xs text-white/60 text-center">Image de départ</p>
                  <div className="aspect-square rounded-lg overflow-hidden border border-white/10">
                    <img
                      src={example.image_url}
                      alt="Starting"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Prompt + Arrow */}
                <div className="flex items-center gap-4">
                  <ArrowRight className="hidden md:block h-6 w-6 text-violet-400 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-white">
                      {example.title_fr || 'Sans titre'}
                    </h3>
                    <p className="text-sm text-white/70 line-clamp-3">
                      {example.prompt}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-white/60">
                      <span>
                        {example.provider === 'replicate' ? 'Kling v2.5 Pro' : 'RunwayML Gen-3'}
                      </span>
                      {example.duration && <span>{example.duration}s</span>}
                      <span className={example.is_active ? 'text-green-400' : 'text-red-400'}>
                        {example.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="hidden md:block h-6 w-6 text-violet-400 flex-shrink-0" />
                </div>

                {/* Video */}
                <div className="space-y-2">
                  <p className="text-xs text-white/60 text-center">Résultat vidéo</p>
                  <div className="aspect-square rounded-lg overflow-hidden border border-white/10">
                    <video
                      src={example.video_url}
                      controls
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-white/10">
                <Button
                  onClick={() => handleEdit(example)}
                  variant="outline"
                  size="sm"
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Modifier
                </Button>
                <Button
                  onClick={() => handleDelete(example.id)}
                  variant="outline"
                  size="sm"
                  className="bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Supprimer
                </Button>
              </div>
            </div>
          ))}
        </div>

        {examples.length === 0 && (
          <div className="text-center py-12 text-white/40">
            Aucun exemple. Créez-en un pour commencer.
          </div>
        )}

        {/* Modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-2xl bg-gray-900 border-white/10 text-white max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingExample ? 'Modifier l\'exemple' : 'Nouvel exemple'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Titles */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-white/60 mb-1 block">Titre FR</label>
                  <Input
                    value={formData.title_fr}
                    onChange={(e) => setFormData({ ...formData, title_fr: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Ex: Logo animé"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-1 block">Titre EN</label>
                  <Input
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Ex: Animated logo"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="text-sm text-white/60 mb-1 block">Image de départ</label>
                <div className="flex gap-3">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'image');
                    }}
                    className="bg-white/5 border-white/10 text-white"
                    disabled={uploading.image}
                  />
                  {uploading.image && <div className="h-5 w-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />}
                </div>
                {formData.image_url && (
                  <div className="mt-2 w-32 h-32 rounded-lg overflow-hidden border border-white/10">
                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Prompt */}
              <div>
                <label className="text-sm text-white/60 mb-1 block">Prompt</label>
                <Textarea
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  className="bg-white/5 border-white/10 text-white h-24"
                  placeholder="Décrivez la transformation..."
                />
              </div>

              {/* Video Upload */}
              <div>
                <label className="text-sm text-white/60 mb-1 block">Vidéo résultat</label>
                <div className="flex gap-3">
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'video');
                    }}
                    className="bg-white/5 border-white/10 text-white"
                    disabled={uploading.video}
                  />
                  {uploading.video && <div className="h-5 w-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />}
                </div>
                {formData.video_url && (
                  <div className="mt-2 w-full max-w-xs rounded-lg overflow-hidden border border-white/10">
                    <video src={formData.video_url} controls className="w-full" />
                  </div>
                )}
              </div>

              {/* Settings */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm text-white/60 mb-1 block">Provider</label>
                  <Select value={formData.provider} onValueChange={(v) => setFormData({ ...formData, provider: v })}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="replicate">Kling v2.5 Pro</SelectItem>
                      <SelectItem value="runway">RunwayML Gen-3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-1 block">Durée (s)</label>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-1 block">Ordre</label>
                  <Input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>

              {/* Active */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded"
                />
                <label className="text-sm text-white/80">Actif</label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  {editingExample ? 'Mettre à jour' : 'Créer'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}