import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Edit2, Save, X, Video, ArrowUp, ArrowDown } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useLanguage } from '@/components/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminVideoPrompts() {
  const { language } = useLanguage();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prompts, setPrompts] = useState([]);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    prompt_fr: '',
    prompt_en: '',
    short_desc_fr: '',
    short_desc_en: '',
    icon: '🎬',
    provider: 'both',
    is_active: true,
    order: 0
  });

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        if (currentUser.role !== 'admin') {
          window.location.href = createPageUrl('Home');
          return;
        }

        await loadPrompts();
      } catch (e) {
        console.error(e);
        window.location.href = createPageUrl('Home');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const loadPrompts = async () => {
    const data = await base44.entities.VideoPromptExample.list('order');
    setPrompts(data);
  };

  const handleCreate = () => {
    setEditingPrompt(null);
    setFormData({
      prompt_fr: '',
      prompt_en: '',
      short_desc_fr: '',
      short_desc_en: '',
      icon: '🎬',
      provider: 'both',
      is_active: true,
      order: prompts.length
    });
    setShowModal(true);
  };

  const handleEdit = (prompt) => {
    setEditingPrompt(prompt);
    setFormData({
      prompt_fr: prompt.prompt_fr,
      prompt_en: prompt.prompt_en || '',
      short_desc_fr: prompt.short_desc_fr,
      short_desc_en: prompt.short_desc_en || '',
      icon: prompt.icon || '🎬',
      provider: prompt.provider || 'both',
      is_active: prompt.is_active ?? true,
      order: prompt.order || 0
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingPrompt) {
        await base44.entities.VideoPromptExample.update(editingPrompt.id, formData);
      } else {
        await base44.entities.VideoPromptExample.create(formData);
      }
      await loadPrompts();
      setShowModal(false);
    } catch (e) {
      console.error(e);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(language === 'fr' ? 'Confirmer la suppression ?' : 'Confirm deletion?')) return;
    try {
      await base44.entities.VideoPromptExample.delete(id);
      await loadPrompts();
    } catch (e) {
      console.error(e);
      alert('Erreur lors de la suppression');
    }
  };

  const handleMove = async (prompt, direction) => {
    const currentIndex = prompts.findIndex(p => p.id === prompt.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= prompts.length) return;

    const targetPrompt = prompts[targetIndex];
    
    await Promise.all([
      base44.entities.VideoPromptExample.update(prompt.id, { order: targetPrompt.order }),
      base44.entities.VideoPromptExample.update(targetPrompt.id, { order: prompt.order })
    ]);
    
    await loadPrompts();
  };

  if (loading) {
    return <AdminLayout><div className="p-8">Chargement...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Video className="h-6 w-6 text-violet-400" />
            <h1 className="text-2xl font-bold text-white">
              {language === 'fr' ? 'Gestion Vidéo - Prompts Exemples' : 'Video Management - Example Prompts'}
            </h1>
          </div>
          <Button onClick={handleCreate} className="bg-violet-600 hover:bg-violet-700">
            <Plus className="h-4 w-4 mr-2" />
            {language === 'fr' ? 'Nouveau prompt' : 'New prompt'}
          </Button>
        </div>

        <div className="bg-white/5 rounded-xl border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-white/60 font-medium">#</th>
                  <th className="text-left p-4 text-white/60 font-medium">Icône</th>
                  <th className="text-left p-4 text-white/60 font-medium">Description courte (FR)</th>
                  <th className="text-left p-4 text-white/60 font-medium">Provider</th>
                  <th className="text-left p-4 text-white/60 font-medium">Statut</th>
                  <th className="text-right p-4 text-white/60 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {prompts.map((prompt, idx) => (
                  <tr key={prompt.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4 text-white/60">{idx + 1}</td>
                    <td className="p-4 text-2xl">{prompt.icon}</td>
                    <td className="p-4 text-white">{prompt.short_desc_fr}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        prompt.provider === 'replicate' ? 'bg-violet-500/20 text-violet-300' :
                        prompt.provider === 'runway' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {prompt.provider === 'replicate' ? 'Replicate' : 
                         prompt.provider === 'runway' ? 'Runway' : 'Les deux'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        prompt.is_active ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                      }`}>
                        {prompt.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleMove(prompt, 'up')}
                          disabled={idx === 0}
                          className="h-8 w-8"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleMove(prompt, 'down')}
                          disabled={idx === prompts.length - 1}
                          className="h-8 w-8"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(prompt)}
                          className="h-8 w-8"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(prompt.id)}
                          className="h-8 w-8 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="bg-gray-900 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPrompt 
                  ? (language === 'fr' ? 'Modifier le prompt' : 'Edit prompt')
                  : (language === 'fr' ? 'Nouveau prompt' : 'New prompt')}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/80 text-sm mb-1 block">Icône (emoji)</label>
                  <Input
                    value={formData.icon}
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                    placeholder="🎬"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-white/80 text-sm mb-1 block">Provider</label>
                  <Select value={formData.provider} onValueChange={(val) => setFormData({...formData, provider: val})}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/10">
                      <SelectItem value="both">Les deux</SelectItem>
                      <SelectItem value="replicate">Replicate Kling</SelectItem>
                      <SelectItem value="runway">RunwayML</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-white/80 text-sm mb-1 block">Description courte (FR) *</label>
                <Input
                  value={formData.short_desc_fr}
                  onChange={(e) => setFormData({...formData, short_desc_fr: e.target.value})}
                  placeholder="Zoom cinématographique lent..."
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <label className="text-white/80 text-sm mb-1 block">Description courte (EN)</label>
                <Input
                  value={formData.short_desc_en}
                  onChange={(e) => setFormData({...formData, short_desc_en: e.target.value})}
                  placeholder="Slow cinematic zoom..."
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <label className="text-white/80 text-sm mb-1 block">Prompt complet (FR) *</label>
                <Textarea
                  value={formData.prompt_fr}
                  onChange={(e) => setFormData({...formData, prompt_fr: e.target.value})}
                  placeholder="Zoom cinématographique lent vers le centre, mouvement de caméra fluide..."
                  className="bg-white/5 border-white/10 text-white resize-none"
                  rows={4}
                />
              </div>

              <div>
                <label className="text-white/80 text-sm mb-1 block">Prompt complet (EN)</label>
                <Textarea
                  value={formData.prompt_en}
                  onChange={(e) => setFormData({...formData, prompt_en: e.target.value})}
                  placeholder="Slow cinematic zoom to center, smooth camera movement..."
                  className="bg-white/5 border-white/10 text-white resize-none"
                  rows={4}
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="h-4 w-4"
                />
                <label className="text-white/80 text-sm">Actif</label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
                <Button onClick={handleSave} className="flex-1 bg-violet-600 hover:bg-violet-700">
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