import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Plus, Eye, Edit, Trash2, ArrowLeft, Code, Layout, Image as ImageIcon, Type, Columns, MoveUp, MoveDown, X, Upload } from 'lucide-react';
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
  const [editorMode, setEditorMode] = useState('code'); // 'code' ou 'visual'
  const [blocks, setBlocks] = useState([]);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentBlockId, setCurrentBlockId] = useState(null);
  const [myVisuals, setMyVisuals] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    html_content: ''
  });

  // Blocs prédéfinis
  const BLOCK_TEMPLATES = {
    text: {
      name: 'Texte simple',
      icon: Type,
      html: `<div style="padding: 20px; background: #f9fafb; border-radius: 8px; margin: 10px 0;">
  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">Votre texte ici...</p>
</div>`
    },
    image: {
      name: 'Image simple',
      icon: ImageIcon,
      html: `<div style="padding: 20px; text-align: center; margin: 10px 0;">
  <img src="https://via.placeholder.com/600x400" alt="Image" style="max-width: 100%; border-radius: 8px; height: auto;" />
</div>`
    },
    imageText: {
      name: 'Titre + Image + Texte',
      icon: Layout,
      html: `<div style="padding: 20px; background: #f9fafb; border-radius: 8px; margin: 10px 0;">
  <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 15px 0;">Titre de la section</h2>
  <img src="https://via.placeholder.com/600x300" alt="Image" style="max-width: 100%; border-radius: 8px; margin-bottom: 15px; height: auto;" />
  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">Description ou contenu textuel ici...</p>
</div>`
    },
    twoImagesText: {
      name: '2 Images + Texte',
      icon: Columns,
      html: `<div style="padding: 20px; background: #f9fafb; border-radius: 8px; margin: 10px 0;">
  <div style="display: flex; gap: 20px; margin-bottom: 15px; flex-wrap: wrap;">
    <img src="https://via.placeholder.com/280x200" alt="Image 1" style="flex: 1; min-width: 250px; border-radius: 8px; height: auto;" />
    <img src="https://via.placeholder.com/280x200" alt="Image 2" style="flex: 1; min-width: 250px; border-radius: 8px; height: auto;" />
  </div>
  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0; text-align: center;">Texte descriptif entre les deux images</p>
</div>`
    },
    columns: {
      name: '2 Colonnes',
      icon: Columns,
      html: `<div style="padding: 20px; margin: 10px 0;">
  <div style="display: flex; gap: 20px; flex-wrap: wrap;">
    <div style="flex: 1; min-width: 250px; padding: 15px; background: #f9fafb; border-radius: 8px;">
      <h3 style="color: #1f2937; font-size: 20px; margin: 0 0 10px 0;">Colonne 1</h3>
      <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0;">Contenu de la première colonne...</p>
    </div>
    <div style="flex: 1; min-width: 250px; padding: 15px; background: #f9fafb; border-radius: 8px;">
      <h3 style="color: #1f2937; font-size: 20px; margin: 0 0 10px 0;">Colonne 2</h3>
      <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0;">Contenu de la seconde colonne...</p>
    </div>
  </div>
</div>`
    }
  };

  useEffect(() => {
    loadTemplates();
    loadMyVisuals();
  }, []);

  const loadMyVisuals = async () => {
    try {
      const visuals = await base44.entities.Visual.list('-created_date', 50);
      setMyVisuals(visuals);
    } catch (e) {
      console.error(e);
    }
  };

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
      // Sauvegarder le template avec les blocs en JSON
      const dataToSave = {
        ...formData,
        blocks_json: blocks.length > 0 ? JSON.stringify(blocks) : null
      };

      if (editingTemplate) {
        await base44.entities.NewsletterTemplate.update(editingTemplate.id, dataToSave);
        toast.success('Template mis à jour');
      } else {
        await base44.entities.NewsletterTemplate.create(dataToSave);
        toast.success('Template créé');
      }
      setShowModal(false);
      setEditingTemplate(null);
      setFormData({ name: '', description: '', html_content: '' });
      setBlocks([]);
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
    setEditorMode('code');
    // Charger les blocs si ils existent
    if (template.blocks_json) {
      try {
        setBlocks(JSON.parse(template.blocks_json));
      } catch (e) {
        setBlocks([]);
      }
    } else {
      setBlocks([]);
    }
    setShowModal(true);
  };

  const addBlock = (type) => {
    const newBlock = {
      id: Date.now(),
      type,
      html: BLOCK_TEMPLATES[type].html,
      image_url: null
    };
    setBlocks([...blocks, newBlock]);
  };

  const openImageSelector = (blockId) => {
    setCurrentBlockId(blockId);
    setShowImageModal(true);
  };

  const selectImageForBlock = (imageUrl) => {
    if (!currentBlockId) return;
    
    const block = blocks.find(b => b.id === currentBlockId);
    if (!block) return;

    // Remplacer l'URL de l'image dans le HTML du bloc
    let updatedHtml = block.html;
    updatedHtml = updatedHtml.replace(/src="[^"]*"/g, `src="${imageUrl}"`);
    
    setBlocks(blocks.map(b => 
      b.id === currentBlockId 
        ? { ...b, html: updatedHtml, image_url: imageUrl } 
        : b
    ));
    
    setShowImageModal(false);
    setCurrentBlockId(null);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      selectImageForBlock(file_url);
      toast.success('Image uploadée');
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de l\'upload');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const updateBlockHtml = (id, newHtml) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, html: newHtml } : b));
  };

  const removeBlock = (id) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const moveBlock = (id, direction) => {
    const index = blocks.findIndex(b => b.id === id);
    if ((direction === 'up' && index > 0) || (direction === 'down' && index < blocks.length - 1)) {
      const newBlocks = [...blocks];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
      setBlocks(newBlocks);
    }
  };

  const switchToCodeMode = () => {
    setEditorMode('code');
  };

  const switchToVisualMode = () => {
    setEditorMode('visual');
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
    
    // Remplacer {{BLOCKS}} par le HTML des blocs
    if (template.blocks_json) {
      try {
        const loadedBlocks = JSON.parse(template.blocks_json);
        const blocksHtml = loadedBlocks.map(b => b.html).join('\n\n');
        html = html.replace('{{BLOCKS}}', blocksHtml);
      } catch (e) {
        html = html.replace('{{BLOCKS}}', '');
      }
    } else {
      html = html.replace('{{BLOCKS}}', '');
    }
    
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
        <DialogContent className="bg-gray-900/95 backdrop-blur-xl border border-white/10 text-white max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{editingTemplate ? 'Modifier' : 'Nouveau'} template</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={editorMode === 'code' ? 'default' : 'outline'}
                  onClick={() => editorMode === 'visual' ? switchToCodeMode() : setEditorMode('code')}
                  className={editorMode === 'code' ? 'bg-violet-600' : 'bg-white/5 border-white/20'}
                >
                  <Code className="h-4 w-4 mr-2" />
                  Code
                </Button>
                <Button
                  size="sm"
                  variant={editorMode === 'visual' ? 'default' : 'outline'}
                  onClick={switchToVisualMode}
                  className={editorMode === 'visual' ? 'bg-violet-600' : 'bg-white/5 border-white/20'}
                >
                  <Layout className="h-4 w-4 mr-2" />
                  Visuel
                </Button>
              </div>
            </DialogTitle>
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

            {/* MODE CODE */}
            {editorMode === 'code' && (
              <div>
                <label className="text-sm text-white/60 mb-2 block">HTML</label>
                <Textarea
                  value={formData.html_content}
                  onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
                  placeholder="<html>...</html>"
                  className="bg-white/5 border-white/20 text-white font-mono text-xs min-h-[400px]"
                />
                <p className="text-xs text-white/40 mt-2">
                  Variables disponibles : {'{'}{'{'} DATE {'}'}{'}'}, {'{'}{'{'} VISUALS_CONTENT {'}'}{'}'}, {'{'}{'{'} BLOCKS {'}'}{'}'}
                </p>
              </div>
            )}

            {/* MODE VISUEL */}
            {editorMode === 'visual' && (
              <div>
                <label className="text-sm text-white/60 mb-2 block">Blocs</label>
                
                {/* Palette de blocs */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4 p-4 bg-white/5 border border-white/10 rounded-lg">
                  {Object.entries(BLOCK_TEMPLATES).map(([key, block]) => {
                    const Icon = block.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => addBlock(key)}
                        className="flex flex-col items-center gap-2 p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-500/50 rounded-lg transition-all"
                      >
                        <Icon className="h-5 w-5 text-violet-400" />
                        <span className="text-xs text-white/80">{block.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Liste des blocs ajoutés */}
                <div className="space-y-3 min-h-[300px] p-4 bg-black/20 border border-white/10 rounded-lg">
                  {blocks.length === 0 ? (
                    <div className="text-center text-white/40 py-12">
                      <Layout className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p>Aucun bloc ajouté</p>
                      <p className="text-xs mt-1">Cliquez sur un bloc ci-dessus pour l'ajouter</p>
                      <p className="text-xs mt-2 text-violet-400">💡 Ajoutez {'{'}{'{'} BLOCKS {'}'}{'}'} dans votre HTML pour afficher les blocs</p>
                    </div>
                  ) : (
                    blocks.map((block, index) => (
                      <div key={block.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-white/80">
                            {BLOCK_TEMPLATES[block.type].name}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => moveBlock(block.id, 'up')}
                              disabled={index === 0}
                              className="h-7 w-7 p-0 text-white/60 hover:text-white disabled:opacity-30"
                            >
                              <MoveUp className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => moveBlock(block.id, 'down')}
                              disabled={index === blocks.length - 1}
                              className="h-7 w-7 p-0 text-white/60 hover:text-white disabled:opacity-30"
                            >
                              <MoveDown className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeBlock(block.id)}
                              className="h-7 w-7 p-0 text-red-400 hover:text-red-300"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Sélection d'image si le bloc contient une image */}
                        {(block.type === 'image' || block.type === 'imageText' || block.type === 'twoImagesText') && (
                          <div className="mb-3">
                            <label className="text-xs text-white/60 mb-1 block">Image du bloc</label>
                            <Button
                              onClick={() => openImageSelector(block.id)}
                              variant="outline"
                              size="sm"
                              className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10"
                            >
                              <ImageIcon className="h-4 w-4 mr-2" />
                              {block.image_url ? 'Changer l\'image' : 'Sélectionner une image'}
                            </Button>
                          </div>
                        )}

                        {/* Édition du HTML du bloc */}
                        <div className="mb-3">
                          <label className="text-xs text-white/60 mb-1 block">Style HTML (modifiable)</label>
                          <Textarea
                            value={block.html}
                            onChange={(e) => updateBlockHtml(block.id, e.target.value)}
                            className="bg-black/30 border-white/20 text-white font-mono text-xs min-h-[100px]"
                          />
                        </div>
                        
                        {/* Aperçu du bloc */}
                        <div className="bg-white rounded p-3 text-xs overflow-auto max-h-40">
                          <div dangerouslySetInnerHTML={{ __html: block.html }} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

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

      {/* Image Selector Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="bg-gray-900/95 backdrop-blur-xl border border-white/10 text-white max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Sélectionner une image</DialogTitle>
          </DialogHeader>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          <div className="space-y-4 overflow-y-auto max-h-[70vh]">
            {/* Upload Section */}
            <div>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="w-full bg-violet-600 hover:bg-violet-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploadingImage ? 'Upload en cours...' : 'Uploader une nouvelle image'}
              </Button>
            </div>

            <div className="border-t border-white/10 pt-4">
              <h3 className="text-white text-sm font-medium mb-3">Mes visuels</h3>
              {myVisuals.length === 0 ? (
                <div className="text-center text-white/40 py-8">
                  <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Aucun visuel disponible</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {myVisuals.map(visual => (
                    <button
                      key={visual.id}
                      onClick={() => selectImageForBlock(visual.image_url)}
                      className="aspect-square rounded-lg overflow-hidden border-2 border-white/10 hover:border-violet-500 transition-all bg-black/20"
                    >
                      <img
                        src={visual.image_url}
                        alt={visual.title || 'Visual'}
                        crossOrigin="anonymous"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-white/40"><svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}