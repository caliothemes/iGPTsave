import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Plus, Eye, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';
import { createPageUrl } from '@/utils';

export default function AdminNewsletterTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewHtml, setPreviewHtml] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    html_content: ''
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await base44.entities.NewsletterTemplate.filter({}, '-created_date');
      setTemplates(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.html_content) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      if (editingTemplate) {
        await base44.entities.NewsletterTemplate.update(editingTemplate.id, formData);
        toast.success('Template mis à jour');
      } else {
        await base44.entities.NewsletterTemplate.create(formData);
        toast.success('Template créé');
      }
      setShowModal(false);
      setEditingTemplate(null);
      setFormData({ name: '', description: '', html_content: '' });
      loadTemplates();
    } catch (e) {
      console.error(e);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      html_content: template.html_content
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce template ?')) return;
    try {
      await base44.entities.NewsletterTemplate.delete(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
      toast.success('Template supprimé');
    } catch (e) {
      console.error(e);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handlePreview = (template) => {
    let html = template.html_content;
    html = html.replace('{{DATE}}', new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }));
    html = html.replace('{{VISUALS_CONTENT}}', '<p style="color: #9ca3af; text-align: center; padding: 40px;">Les visuels seront chargés lors de la génération de la newsletter</p>');
    setPreviewHtml(html);
    setShowPreviewModal(true);
  };

  if (loading) {
    return (
      <AdminLayout currentPage="newsletters">
        <div className="text-white">Chargement...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="newsletters">
      <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => window.location.href = createPageUrl('AdminNewsletters')}
                variant="outline"
                size="icon"
                className="bg-white/5 text-white border-white/20"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">📝 Templates de newsletter</h1>
                <p className="text-white/60">Créez et gérez vos templates HTML</p>
              </div>
            </div>
            <Button
              onClick={() => {
                setEditingTemplate(null);
                setFormData({ name: '', description: '', html_content: '' });
                setShowModal(true);
              }}
              className="bg-gradient-to-r from-violet-600 to-purple-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouveau template
            </Button>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map(template => (
              <div
                key={template.id}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
              >
                <h3 className="text-white text-lg font-bold mb-2">{template.name}</h3>
                {template.description && (
                  <p className="text-white/60 text-sm mb-4">{template.description}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePreview(template)}
                    className="flex-1 bg-white/5 text-white border-white/20"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Aperçu
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(template)}
                    className="bg-blue-500/10 text-blue-400 border-blue-500/20"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(template.id)}
                    className="bg-red-500/10 text-red-400 border-red-500/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

      {/* Edit/Create Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-gray-900/95 backdrop-blur-xl border border-white/10 text-white max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? 'Modifier' : 'Nouveau'} template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto max-h-[70vh]">
            <div>
              <label className="text-sm text-white/60 mb-2 block">Nom</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Template principal"
                className="bg-white/5 border-white/20 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-2 block">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Template avec header et grille de visuels"
                className="bg-white/5 border-white/20 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-2 block">HTML</label>
              <Textarea
                value={formData.html_content}
                onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
                placeholder="<html>...</html>"
                className="bg-white/5 border-white/20 text-white font-mono text-xs min-h-[400px]"
              />
              <p className="text-xs text-white/40 mt-2">
                Variables disponibles : {'{'}{'{'} DATE {'}'}{'}'}, {'{'}{'{'} VISUALS_CONTENT {'}'}{'}'}
              </p>
            </div>
            <Button onClick={handleSave} className="w-full bg-gradient-to-r from-violet-600 to-purple-600">
              {editingTemplate ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="bg-gray-900/95 backdrop-blur-xl border border-white/10 text-white max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Aperçu du template</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[70vh] bg-white rounded-lg">
            <iframe
              srcDoc={previewHtml}
              className="w-full h-[600px] border-0"
              title="Template Preview"
            />
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}