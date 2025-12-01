import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Save, Loader2, Plus, Trash2, Monitor, Printer, 
  Sparkles, Wand2, FileText, Eye 
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/components/LanguageContext';
import PresentationModal from '@/components/PresentationModal';

const SECTIONS = [
  { id: 'header', label: 'En-tête', icon: FileText },
  { id: 'digital', label: 'Digital', icon: Monitor },
  { id: 'print', label: 'Print', icon: Printer },
  { id: 'ai_images', label: 'Images IA', icon: Sparkles },
  { id: 'editor', label: 'Éditeur', icon: Wand2 },
  { id: 'footer', label: 'Pied de page', icon: FileText },
];

const ICONS = ['Monitor', 'Printer', 'Sparkles', 'Wand2', 'Image', 'Layout', 'FileText', 'CreditCard', 'Layers', 'Type', 'Square', 'Palette'];

export default function AdminPresentation() {
  const { language } = useLanguage();
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('header');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await base44.entities.AppPresentation.list();
      const sectionsMap = {};
      data.forEach(item => {
        sectionsMap[item.section] = item;
      });
      setSections(sectionsMap);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const updateSection = (section, field, value) => {
    setSections(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        section,
        [field]: value
      }
    }));
  };

  const updateItem = (section, index, value) => {
    const items = [...(sections[section]?.items_fr || [])];
    items[index] = value;
    updateSection(section, 'items_fr', items);
  };

  const updateItemEn = (section, index, value) => {
    const items = [...(sections[section]?.items_en || [])];
    items[index] = value;
    updateSection(section, 'items_en', items);
  };

  const addItem = (section) => {
    const itemsFr = [...(sections[section]?.items_fr || []), ''];
    const itemsEn = [...(sections[section]?.items_en || []), ''];
    setSections(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        section,
        items_fr: itemsFr,
        items_en: itemsEn
      }
    }));
  };

  const removeItem = (section, index) => {
    const itemsFr = (sections[section]?.items_fr || []).filter((_, i) => i !== index);
    const itemsEn = (sections[section]?.items_en || []).filter((_, i) => i !== index);
    setSections(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        items_fr: itemsFr,
        items_en: itemsEn
      }
    }));
  };

  const saveSection = async (sectionId) => {
    setSaving(true);
    try {
      const data = sections[sectionId];
      if (data?.id) {
        await base44.entities.AppPresentation.update(data.id, data);
      } else {
        const created = await base44.entities.AppPresentation.create({
          ...data,
          section: sectionId,
          is_active: true
        });
        setSections(prev => ({
          ...prev,
          [sectionId]: created
        }));
      }
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const renderSectionForm = (sectionId) => {
    const section = sections[sectionId] || {};
    const sectionConfig = SECTIONS.find(s => s.id === sectionId);
    const hasItems = ['digital', 'print', 'ai_images', 'editor'].includes(sectionId);
    const hasIcon = ['digital', 'print', 'ai_images'].includes(sectionId);
    const hasImage = sectionId === 'editor';

    return (
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <sectionConfig.icon className="h-5 w-5 text-violet-400" />
            {sectionConfig.label}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Switch
              checked={section.is_active !== false}
              onCheckedChange={(checked) => updateSection(sectionId, 'is_active', checked)}
            />
            <span className="text-white/60 text-sm">Actif</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-white/60 text-sm mb-1 block">Titre (FR)</label>
              <Input
                value={section.title_fr || ''}
                onChange={(e) => updateSection(sectionId, 'title_fr', e.target.value)}
                className="bg-white/5 border-white/10 text-white"
                placeholder="Titre en français"
              />
            </div>
            <div>
              <label className="text-white/60 text-sm mb-1 block">Titre (EN)</label>
              <Input
                value={section.title_en || ''}
                onChange={(e) => updateSection(sectionId, 'title_en', e.target.value)}
                className="bg-white/5 border-white/10 text-white"
                placeholder="Title in English"
              />
            </div>
          </div>

          {/* Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-white/60 text-sm mb-1 block">Description (FR)</label>
              <Textarea
                value={section.description_fr || ''}
                onChange={(e) => updateSection(sectionId, 'description_fr', e.target.value)}
                className="bg-white/5 border-white/10 text-white min-h-[100px]"
                placeholder="Description en français"
              />
            </div>
            <div>
              <label className="text-white/60 text-sm mb-1 block">Description (EN)</label>
              <Textarea
                value={section.description_en || ''}
                onChange={(e) => updateSection(sectionId, 'description_en', e.target.value)}
                className="bg-white/5 border-white/10 text-white min-h-[100px]"
                placeholder="Description in English"
              />
            </div>
          </div>

          {/* Icon */}
          {hasIcon && (
            <div>
              <label className="text-white/60 text-sm mb-1 block">Icône</label>
              <Select
                value={section.icon || 'Monitor'}
                onValueChange={(value) => updateSection(sectionId, 'icon', value)}
              >
                <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICONS.map(icon => (
                    <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Image URL */}
          {hasImage && (
            <div>
              <label className="text-white/60 text-sm mb-1 block">URL de l'image de fond</label>
              <Input
                value={section.image_url || ''}
                onChange={(e) => updateSection(sectionId, 'image_url', e.target.value)}
                className="bg-white/5 border-white/10 text-white"
                placeholder="https://..."
              />
            </div>
          )}

          {/* Items */}
          {hasItems && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-white/60 text-sm">Éléments de la liste</label>
                <Button size="sm" variant="ghost" onClick={() => addItem(sectionId)} className="text-violet-400 hover:text-violet-300">
                  <Plus className="h-4 w-4 mr-1" /> Ajouter
                </Button>
              </div>
              <div className="space-y-2">
                {(section.items_fr || []).map((item, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => updateItem(sectionId, idx, e.target.value)}
                      className="bg-white/5 border-white/10 text-white flex-1"
                      placeholder="Élément FR"
                    />
                    <Input
                      value={(section.items_en || [])[idx] || ''}
                      onChange={(e) => updateItemEn(sectionId, idx, e.target.value)}
                      className="bg-white/5 border-white/10 text-white flex-1"
                      placeholder="Element EN"
                    />
                    <Button size="icon" variant="ghost" onClick={() => removeItem(sectionId, idx)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-white/10">
            <Button onClick={() => saveSection(sectionId)} disabled={saving} className="bg-gradient-to-r from-violet-600 to-purple-600">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Sauvegarder
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Présentation de l'app</h1>
            <p className="text-white/60">Personnalisez la modal de présentation qui s'affiche au clic sur le logo</p>
          </div>
          <Button onClick={() => setShowPreview(true)} variant="outline" className="border-violet-500/50 text-violet-300 hover:bg-violet-500/20">
            <Eye className="h-4 w-4 mr-2" /> Prévisualiser
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/5 border border-white/10">
            {SECTIONS.map(section => (
              <TabsTrigger key={section.id} value={section.id} className="data-[state=active]:bg-violet-500/30">
                <section.icon className="h-4 w-4 mr-2" />
                {section.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {SECTIONS.map(section => (
            <TabsContent key={section.id} value={section.id}>
              {renderSectionForm(section.id)}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <PresentationModal isOpen={showPreview} onClose={() => setShowPreview(false)} />
    </AdminLayout>
  );
}