import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, Camera, User, Mail, Crown, Zap, Save } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import GlobalHeader from '@/components/GlobalHeader';
import { useLanguage } from '@/components/LanguageContext';
import { cn } from "@/lib/utils";

export default function Account() {
  const { language } = useLanguage();
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    profile_image: ''
  });

  const t = {
    fr: {
      title: "Mon compte",
      subtitle: "Gérez votre profil et vos informations",
      back: "Retour",
      profile: "Profil",
      changePhoto: "Changer la photo",
      name: "Nom complet",
      email: "Email",
      subscription: "Abonnement",
      free: "Gratuit",
      pro: "Pro",
      unlimited: "Unlimited",
      credits: "Crédits disponibles",
      freeCredits: "Crédits gratuits",
      paidCredits: "Crédits payants",
      save: "Sauvegarder",
      saved: "Sauvegardé !",
      upgradeAccount: "Améliorer mon compte",
    },
    en: {
      title: "My Account",
      subtitle: "Manage your profile and information",
      back: "Back",
      profile: "Profile",
      changePhoto: "Change photo",
      name: "Full name",
      email: "Email",
      subscription: "Subscription",
      free: "Free",
      pro: "Pro",
      unlimited: "Unlimited",
      credits: "Available credits",
      freeCredits: "Free credits",
      paidCredits: "Paid credits",
      save: "Save",
      saved: "Saved!",
      upgradeAccount: "Upgrade account",
    }
  }[language];

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        setFormData({
          full_name: currentUser.full_name || '',
          profile_image: currentUser.profile_image || ''
        });

        const userCredits = await base44.entities.UserCredits.filter({ user_email: currentUser.email });
        if (userCredits.length > 0) {
          setCredits(userCredits[0]);
        }
      } catch (e) {
        window.location.href = createPageUrl('Home');
      }
      setLoading(false);
    };
    init();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, profile_image: file_url }));
      await base44.auth.updateMe({ profile_image: file_url });
    } catch (e) {
      console.error(e);
    }
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({ 
        full_name: formData.full_name,
        profile_image: formData.profile_image 
      });
      setUser(prev => ({ ...prev, ...formData }));
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const getSubscriptionBadge = () => {
    if (credits?.subscription_type === 'unlimited') {
      return (
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600/30 to-purple-600/30 text-violet-300 border border-violet-500/30">
          <Crown className="h-5 w-5" />
          {t.unlimited}
        </span>
      );
    }
    if (credits?.subscription_type === 'limited') {
      return (
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600/30 to-cyan-600/30 text-blue-300 border border-blue-500/30">
          <Zap className="h-5 w-5" />
          {t.pro}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white/60 border border-white/10">
        {t.free}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AnimatedBackground />
        <Loader2 className="h-8 w-8 text-violet-400 animate-spin relative z-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <GlobalHeader />

      <div className="relative z-10 min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <a 
              href={createPageUrl('Home')} 
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              {t.back}
            </a>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">{t.title}</h1>
            <p className="text-white/60">{t.subtitle}</p>
          </div>

          {/* Profile Card */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-6">
            <h2 className="text-lg font-semibold text-white mb-6">{t.profile}</h2>
            
            {/* Avatar */}
            <div className="flex items-center gap-6 mb-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
                  {formData.profile_image ? (
                    <img 
                      src={formData.profile_image} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-white" />
                  )}
                </div>
                <label className="absolute -bottom-1 -right-1 p-2 rounded-full bg-violet-600 hover:bg-violet-700 cursor-pointer transition-colors">
                  {uploading ? (
                    <Loader2 className="h-4 w-4 text-white animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4 text-white" />
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
              <div>
                <p className="text-white font-medium">{user?.full_name || user?.email}</p>
                <p className="text-white/50 text-sm">{t.changePhoto}</p>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-white/60 mb-2">{t.name}</label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">{t.email}</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 border border-white/10">
                  <Mail className="h-4 w-4 text-white/40" />
                  <span className="text-white/60">{user?.email}</span>
                </div>
              </div>

              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {t.save}
              </Button>
            </div>
          </div>

          {/* Subscription Card */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <h2 className="text-lg font-semibold text-white mb-6">{t.subscription}</h2>
            
            <div className="flex items-center justify-between mb-6">
              {getSubscriptionBadge()}
              <a 
                href={createPageUrl('Pricing')}
                className="text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors"
              >
                {t.upgradeAccount} →
              </a>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-white/50 text-sm mb-1">{t.freeCredits}</p>
                <p className="text-2xl font-bold text-white">{credits?.free_downloads || 0}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-white/50 text-sm mb-1">{t.paidCredits}</p>
                <p className="text-2xl font-bold text-white">
                  {credits?.subscription_type === 'unlimited' ? '∞' : (credits?.paid_credits || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}