import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Globe, FileText, Layout, MessageSquare, Building2, MousePointerClick } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { cn } from "@/lib/utils";

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allSettings, setAllSettings] = useState([]);
  const [settings, setSettings] = useState({
    home_title_fr: '',
    home_title_en: '',
    home_subtitle_fr: '',
    home_subtitle_en: '',
    sidebar_title: '',
    legal_content_fr: '',
    legal_content_en: '',
    welcome_message_fr: '',
    welcome_message_en: '',
    guest_message_fr: '',
    guest_message_en: '',
    new_conversation_fr: '',
    new_conversation_en: '',
    // Logo modal
    logo_modal_fr: '',
    logo_modal_en: '',
    // Company settings
    company_name: '',
    company_address: '',
    company_postal_code: '',
    company_city: '',
    company_country: '',
    company_siret: '',
    company_vat: '',
    company_email: '',
    company_phone: '',
    company_logo: ''
  });

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.role !== 'admin') {
          window.location.href = createPageUrl('Home');
          return;
        }

        const fetchedSettings = await base44.entities.AppSettings.list();
        setAllSettings(fetchedSettings);

        const settingsMap = {};
        fetchedSettings.forEach(s => {
          settingsMap[s.key] = s.value;
        });

        setSettings(prev => ({
          ...prev,
          ...settingsMap
        }));
      } catch (e) {
        window.location.href = createPageUrl('Home');
      }
      setLoading(false);
    };
    init();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    
    for (const [key, value] of Object.entries(settings)) {
      const existing = allSettings.find(s => s.key === key);
      if (existing) {
        await base44.entities.AppSettings.update(existing.id, { value: value || '' });
      } else if (value) {
        await base44.entities.AppSettings.create({ key, value });
      }
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <AdminLayout currentPage="settings">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="settings">
      <div className="space-y-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Paramètres</h1>
            <p className="text-white/60">Configurez votre application</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Sauvegarder
          </Button>
        </div>

        {/* Sidebar Settings */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-violet-600/20">
              <Layout className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Sidebar</h2>
              <p className="text-sm text-white/50">Personnalisez le titre de la sidebar</p>
            </div>
          </div>
          <Input
            value={settings.sidebar_title}
            onChange={(e) => setSettings(prev => ({ ...prev, sidebar_title: e.target.value }))}
            placeholder="iGPT 1.0.1 beta"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
          />
        </div>

        {/* Welcome Messages */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-green-600/20">
              <MessageSquare className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Message d'accueil</h2>
              <p className="text-sm text-white/50">Premier message affiché dans le chat</p>
            </div>
          </div>
          
          <div className="grid gap-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Utilisateur connecté (Français)</label>
                <Textarea
                  value={settings.welcome_message_fr}
                  onChange={(e) => setSettings(prev => ({ ...prev, welcome_message_fr: e.target.value }))}
                  placeholder="Bonjour {name} ! 👋&#10;&#10;Je suis **iGPT**. Décrivez-moi le visuel..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-24"
                />
                <p className="text-xs text-white/40 mt-1">Utilisez {'{name}'} pour le nom de l'utilisateur</p>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Logged in user (English)</label>
                <Textarea
                  value={settings.welcome_message_en}
                  onChange={(e) => setSettings(prev => ({ ...prev, welcome_message_en: e.target.value }))}
                  placeholder="Hello {name}! 👋&#10;&#10;I'm **iGPT**. Describe the visual..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-24"
                />
                <p className="text-xs text-white/40 mt-1">Use {'{name}'} for the user's name</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Visiteur non connecté (Français)</label>
                <Textarea
                  value={settings.guest_message_fr}
                  onChange={(e) => setSettings(prev => ({ ...prev, guest_message_fr: e.target.value }))}
                  placeholder="Bienvenue sur **iGPT** ! 👋&#10;&#10;Décrivez-moi ce que vous souhaitez créer..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-24"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Guest visitor (English)</label>
                <Textarea
                  value={settings.guest_message_en}
                  onChange={(e) => setSettings(prev => ({ ...prev, guest_message_en: e.target.value }))}
                  placeholder="Welcome to **iGPT**! 👋&#10;&#10;Describe what you want to create..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-24"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Nouvelle conversation (Français)</label>
                <Input
                  value={settings.new_conversation_fr}
                  onChange={(e) => setSettings(prev => ({ ...prev, new_conversation_fr: e.target.value }))}
                  placeholder="Nouvelle conversation ! Que souhaitez-vous créer ?"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">New conversation (English)</label>
                <Input
                  value={settings.new_conversation_en}
                  onChange={(e) => setSettings(prev => ({ ...prev, new_conversation_en: e.target.value }))}
                  placeholder="New conversation! What would you like to create?"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Logo Modal Settings */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-pink-600/20">
              <MousePointerClick className="h-5 w-5 text-pink-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Modal du logo</h2>
              <p className="text-sm text-white/50">Texte affiché quand on clique sur le logo</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">Contenu (Français)</label>
              <Textarea
                value={settings.logo_modal_fr}
                onChange={(e) => setSettings(prev => ({ ...prev, logo_modal_fr: e.target.value }))}
                placeholder="# Bienvenue sur iGPT&#10;&#10;Votre assistant IA pour créer des visuels..."
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-32"
              />
              <p className="text-xs text-white/40 mt-1">Supporte le Markdown (# titre, **gras**, etc.)</p>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Content (English)</label>
              <Textarea
                value={settings.logo_modal_en}
                onChange={(e) => setSettings(prev => ({ ...prev, logo_modal_en: e.target.value }))}
                placeholder="# Welcome to iGPT&#10;&#10;Your AI assistant to create visuals..."
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-32"
              />
              <p className="text-xs text-white/40 mt-1">Supports Markdown (# title, **bold**, etc.)</p>
            </div>
          </div>
        </div>

        {/* Home Page Settings */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-blue-600/20">
              <Globe className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Page d'accueil</h2>
              <p className="text-sm text-white/50">Personnalisez le titre et sous-titre</p>
            </div>
          </div>
          
          <div className="grid gap-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Titre (Français)</label>
                <Input
                  value={settings.home_title_fr}
                  onChange={(e) => setSettings(prev => ({ ...prev, home_title_fr: e.target.value }))}
                  placeholder="Votre assistant IA..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Titre (English)</label>
                <Input
                  value={settings.home_title_en}
                  onChange={(e) => setSettings(prev => ({ ...prev, home_title_en: e.target.value }))}
                  placeholder="Your AI assistant..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Sous-titre (Français)</label>
                <Input
                  value={settings.home_subtitle_fr}
                  onChange={(e) => setSettings(prev => ({ ...prev, home_subtitle_fr: e.target.value }))}
                  placeholder="Logos, cartes de visite..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Sous-titre (English)</label>
                <Input
                  value={settings.home_subtitle_en}
                  onChange={(e) => setSettings(prev => ({ ...prev, home_subtitle_en: e.target.value }))}
                  placeholder="Logos, business cards..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Company Settings */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-emerald-600/20">
              <Building2 className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Paramètres entreprise</h2>
              <p className="text-sm text-white/50">Informations affichées sur les factures</p>
            </div>
          </div>
          
          <div className="grid gap-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Nom de l'entreprise</label>
                <Input
                  value={settings.company_name}
                  onChange={(e) => setSettings(prev => ({ ...prev, company_name: e.target.value }))}
                  placeholder="Ma Société SAS"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Email de contact</label>
                <Input
                  value={settings.company_email}
                  onChange={(e) => setSettings(prev => ({ ...prev, company_email: e.target.value }))}
                  placeholder="contact@masociete.com"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Adresse</label>
              <Input
                value={settings.company_address}
                onChange={(e) => setSettings(prev => ({ ...prev, company_address: e.target.value }))}
                placeholder="123 Rue de l'Exemple"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Code postal</label>
                <Input
                  value={settings.company_postal_code}
                  onChange={(e) => setSettings(prev => ({ ...prev, company_postal_code: e.target.value }))}
                  placeholder="75001"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Ville</label>
                <Input
                  value={settings.company_city}
                  onChange={(e) => setSettings(prev => ({ ...prev, company_city: e.target.value }))}
                  placeholder="Paris"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Pays</label>
                <Input
                  value={settings.company_country}
                  onChange={(e) => setSettings(prev => ({ ...prev, company_country: e.target.value }))}
                  placeholder="France"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">SIRET</label>
                <Input
                  value={settings.company_siret}
                  onChange={(e) => setSettings(prev => ({ ...prev, company_siret: e.target.value }))}
                  placeholder="123 456 789 00012"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">N° TVA Intracommunautaire</label>
                <Input
                  value={settings.company_vat}
                  onChange={(e) => setSettings(prev => ({ ...prev, company_vat: e.target.value }))}
                  placeholder="FR12345678901"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Téléphone</label>
              <Input
                value={settings.company_phone}
                onChange={(e) => setSettings(prev => ({ ...prev, company_phone: e.target.value }))}
                placeholder="+33 1 23 45 67 89"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">URL du logo (pour les factures)</label>
              <Input
                value={settings.company_logo}
                onChange={(e) => setSettings(prev => ({ ...prev, company_logo: e.target.value }))}
                placeholder="https://..."
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
              {settings.company_logo && (
                <div className="mt-2 p-3 bg-white/5 rounded-lg inline-block">
                  <img src={settings.company_logo} alt="Logo" className="h-12 object-contain" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Legal Content Settings */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-amber-600/20">
              <FileText className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Mentions légales</h2>
              <p className="text-sm text-white/50">Contenu personnalisé des mentions légales</p>
            </div>
          </div>
          
          <div className="grid gap-6">
            <div>
              <label className="block text-sm text-white/60 mb-2">Contenu (Français)</label>
              <Textarea
                value={settings.legal_content_fr}
                onChange={(e) => setSettings(prev => ({ ...prev, legal_content_fr: e.target.value }))}
                placeholder="Contenu des mentions légales en français..."
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-32"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Content (English)</label>
              <Textarea
                value={settings.legal_content_en}
                onChange={(e) => setSettings(prev => ({ ...prev, legal_content_en: e.target.value }))}
                placeholder="Legal notice content in English..."
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-32"
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}