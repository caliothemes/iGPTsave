import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from './LanguageContext';

export default function ArtDirectorModal({ isOpen, onClose, onSave, editingDA = null }) {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    description: '',
    activity: '',
    website: '',
    color_palette: ['#000000', '#000000', '#000000'],
    style_keywords: ''
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);

  React.useEffect(() => {
    if (editingDA) {
      setFormData({
        name: editingDA.name || '',
        logo_url: editingDA.logo_url || '',
        description: editingDA.description || '',
        activity: editingDA.activity || '',
        website: editingDA.website || '',
        color_palette: editingDA.color_palette || ['#000000', '#000000', '#000000'],
        style_keywords: editingDA.style_keywords || ''
      });
    } else {
      setFormData({
        name: '',
        logo_url: '',
        description: '',
        activity: '',
        website: '',
        color_palette: ['#000000', '#000000', '#000000'],
        style_keywords: ''
      });
    }
  }, [editingDA, isOpen]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, logo_url: file_url }));
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900/95 backdrop-blur-xl border border-violet-500/30 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
            {editingDA ? (language === 'fr' ? 'Modifier le DA' : 'Edit AD') : (language === 'fr' ? 'Créer un Directeur Artistique' : 'Create Art Director')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Logo */}
          <div>
            <label className="text-white/80 text-sm mb-2 block">
              {language === 'fr' ? 'Logo' : 'Logo'}
            </label>
            <div className="flex items-center gap-4">
              {formData.logo_url && (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/20">
                  <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, logo_url: '' }))}
                    className="absolute top-1 right-1 p-1 bg-red-500 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              <label className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg cursor-pointer transition-colors">
                {uploadingLogo ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                <span className="text-sm">
                  {language === 'fr' ? 'Uploader un logo' : 'Upload logo'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Nom */}
          <div>
            <label className="text-white/80 text-sm mb-2 block">
              {language === 'fr' ? 'Nom du DA' : 'AD Name'} *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder={language === 'fr' ? 'Ex: Snack Paradise' : 'Ex: Snack Paradise'}
              className="bg-white/10 border-white/20 text-white"
              required
            />
          </div>

          {/* Activité */}
          <div>
            <label className="text-white/80 text-sm mb-2 block">
              {language === 'fr' ? "Secteur d'activité" : 'Business sector'} *
            </label>
            <Input
              value={formData.activity}
              onChange={(e) => setFormData(prev => ({ ...prev, activity: e.target.value }))}
              placeholder={language === 'fr' ? 'Ex: Restaurant, Fast-food, Snacking' : 'Ex: Restaurant, Fast-food, Snacking'}
              className="bg-white/10 border-white/20 text-white"
              required
            />
          </div>

          {/* Site web */}
          <div>
            <label className="text-white/80 text-sm mb-2 block">
              {language === 'fr' ? 'Site web' : 'Website'}
            </label>
            <Input
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              placeholder="https://example.com"
              type="url"
              className="bg-white/10 border-white/20 text-white"
            />
            <p className="text-white/40 text-xs mt-1">
              {language === 'fr' ? "iGPT analysera automatiquement le site pour enrichir la direction artistique" : "iGPT will automatically analyze the site to enrich the art direction"}
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="text-white/80 text-sm mb-2 block">
              {language === 'fr' ? 'Description de la direction artistique' : 'Art direction description'}
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={language === 'fr' ? 'Style moderne et dynamique, ambiance jeune et colorée...' : 'Modern and dynamic style, young and colorful atmosphere...'}
              className="bg-white/10 border-white/20 text-white min-h-[100px]"
            />
          </div>

          {/* Mots-clés de style */}
          <div>
            <label className="text-white/80 text-sm mb-2 block">
              {language === 'fr' ? 'Mots-clés de style' : 'Style keywords'}
            </label>
            <Input
              value={formData.style_keywords}
              onChange={(e) => setFormData(prev => ({ ...prev, style_keywords: e.target.value }))}
              placeholder={language === 'fr' ? 'moderne, minimaliste, vintage...' : 'modern, minimalist, vintage...'}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>

          {/* Palette de couleurs */}
          <div>
            <label className="text-white/80 text-sm mb-2 block">
              {language === 'fr' ? 'Palette de couleurs (3 couleurs)' : 'Color palette (3 colors)'} *
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[0, 1, 2].map((index) => (
                <div key={index} className="space-y-2">
                  <div 
                    className="w-full h-20 rounded-lg border-2 border-white/20 cursor-pointer"
                    style={{ backgroundColor: formData.color_palette[index] }}
                    onClick={() => document.getElementById(`color-${index}`).click()}
                  />
                  <input
                    id={`color-${index}`}
                    type="color"
                    value={formData.color_palette[index]}
                    onChange={(e) => {
                      const newPalette = [...formData.color_palette];
                      newPalette[index] = e.target.value;
                      setFormData(prev => ({ ...prev, color_palette: newPalette }));
                    }}
                    className="w-full h-8 cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              {language === 'fr' ? 'Annuler' : 'Cancel'}
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name || !formData.activity}
              className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                editingDA ? (language === 'fr' ? 'Modifier' : 'Update') : (language === 'fr' ? 'Créer' : 'Create')
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}