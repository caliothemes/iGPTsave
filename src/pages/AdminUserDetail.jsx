import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, User, Mail, Crown, Zap, Image, Receipt, Download, FileText, Video, Send, Plus } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useLanguage } from '@/components/LanguageContext';
import moment from 'moment';
import { toast } from 'sonner';

export default function AdminUserDetail() {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(null);
  const [visuals, setVisuals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showAddCreditsModal, setShowAddCreditsModal] = useState(false);
  const [creditsToAdd, setCreditsToAdd] = useState(0);
  const [creditType, setCreditType] = useState('paid');

  useEffect(() => {
    const init = async () => {
      // Get user ID from URL
      const urlParams = new URLSearchParams(window.location.search);
      const userId = urlParams.get('userId');
      
      if (!userId) {
        window.location.href = createPageUrl('AdminUsers');
        return;
      }

      try {
        // Fetch user data
        const users = await base44.entities.User.filter({ id: userId });
        if (users.length === 0) {
          window.location.href = createPageUrl('AdminUsers');
          return;
        }
        const userData = users[0];
        setUser(userData);

        // Fetch user credits
        const userCredits = await base44.entities.UserCredits.filter({ user_email: userData.email });
        if (userCredits.length > 0) {
          setCredits(userCredits[0]);
        }

        // Fetch user visuals
        const userVisuals = await base44.entities.Visual.filter({ user_email: userData.email }, '-created_date', 50);
        setVisuals(userVisuals);

        // Fetch user transactions
        const userTransactions = await base44.entities.Transaction.filter({ user_email: userData.email }, '-created_date', 50);
        setTransactions(userTransactions);

      } catch (error) {
        console.error('Error loading user:', error);
      }

      setLoading(false);
    };

    init();
  }, []);

  const handleUpdateCredits = async () => {
    if (!credits) return;
    setSaving(true);
    try {
      await base44.entities.UserCredits.update(credits.id, {
        free_downloads: credits.free_downloads,
        paid_credits: credits.paid_credits
      });
    } catch (error) {
      console.error('Error updating credits:', error);
    }
    setSaving(false);
  };

  const handleAddCredits = async () => {
    if (!credits || creditsToAdd <= 0) {
      toast.error('Montant invalide');
      return;
    }

    setSaving(true);
    try {
      const updateData = creditType === 'paid' 
        ? { paid_credits: (credits.paid_credits || 0) + creditsToAdd }
        : { free_downloads: (credits.free_downloads || 0) + creditsToAdd };

      await base44.entities.UserCredits.update(credits.id, updateData);
      
      setCredits({ 
        ...credits, 
        ...(creditType === 'paid' 
          ? { paid_credits: (credits.paid_credits || 0) + creditsToAdd }
          : { free_downloads: (credits.free_downloads || 0) + creditsToAdd })
      });

      toast.success(`${creditsToAdd} crédits ajoutés avec succès`);
      setShowAddCreditsModal(false);
      setCreditsToAdd(0);
    } catch (error) {
      console.error('Error adding credits:', error);
      toast.error('Erreur lors de l\'ajout des crédits');
    }
    setSaving(false);
  };

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      alert('Veuillez remplir le sujet et le message');
      return;
    }

    setSendingEmail(true);
    try {
      // Generate HTML email with template
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; padding: 40px 20px; }
            .email-container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); padding: 40px 30px; text-align: center; }
            .logo-img { width: 80px; height: 80px; margin: 0 auto 15px; border-radius: 50%; }
            .header-title { color: #ffffff; font-size: 18px; font-weight: 600; }
            .content { padding: 40px 30px; }
            .subject { font-size: 24px; font-weight: 700; color: #1a1a1a; margin-bottom: 20px; }
            .message { font-size: 16px; line-height: 1.6; color: #333; white-space: pre-wrap; }
            .footer { background: #f8f7ff; padding: 30px; text-align: center; border-top: 1px solid #e5e5e5; }
            .footer-text { font-size: 13px; color: #666; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692a3549022b223ef419900f/31669c91a_2.png" alt="iGPT" class="logo-img" />
              <div class="header-title">Message Administrateur</div>
            </div>
            <div class="content">
              <div class="subject">${emailSubject}</div>
              <div class="message">${emailBody.replace(/\n/g, '<br>')}</div>
            </div>
            <div class="footer">
              <div class="footer-text">
                Ce message vous a été envoyé par l'équipe iGPT<br>
                Pour toute question, répondez directement à cet email
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      await base44.integrations.Core.SendEmail({
        from_name: 'iGPT - Admin',
        to: user.email,
        subject: emailSubject,
        body: emailHtml
      });

      alert('Email envoyé avec succès !');
      setShowEmailModal(false);
      setEmailSubject('');
      setEmailBody('');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Erreur lors de l\'envoi de l\'email');
    }
    setSendingEmail(false);
  };

  const getSubscriptionBadge = (credits) => {
    if (credits?.subscription_type === 'unlimited') {
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600/30 to-purple-600/30 text-violet-300 border border-violet-500/30">
          <Crown className="h-4 w-4" />
          Unlimited
        </span>
      );
    }
    if (credits?.subscription_type === 'limited') {
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600/30 to-cyan-600/30 text-blue-300 border border-blue-500/30">
          <Zap className="h-4 w-4" />
          Pro
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 text-white/60 border border-white/10">
        Gratuit
      </span>
    );
  };

  const getTransactionTypeName = (type) => {
    switch(type) {
      case 'credit_pack': return 'Pack de crédits';
      case 'subscription_limited': return 'Abonnement Pro';
      case 'subscription_unlimited': return 'Abonnement Unlimited';
      default: return type;
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed': return <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-300 text-xs">Complété</span>;
      case 'pending': return <span className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs">En attente</span>;
      case 'failed': return <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-300 text-xs">Échoué</span>;
      default: return null;
    }
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

  if (!user) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-white/60">Utilisateur introuvable</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.location.href = createPageUrl('AdminUsers')}
            className="text-white/60 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{user.full_name || user.email}</h1>
            <p className="text-white/60 text-sm">Détails de l'utilisateur</p>
          </div>
          <Button
            onClick={() => setShowEmailModal(true)}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            <Send className="h-4 w-4 mr-2" />
            Envoyer un email
          </Button>
        </div>

        {/* User Info & Credits Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Info Card */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-violet-400" />
              Informations
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-1">Nom complet</label>
                <div className="text-white font-medium">{user.full_name || '-'}</div>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">Email</label>
                <div className="flex items-center gap-2 text-white">
                  <Mail className="h-4 w-4 text-white/40" />
                  {user.email}
                </div>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">Rôle</label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${
                  user.role === 'admin' 
                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' 
                    : 'bg-white/10 text-white/60'
                }`}>
                  {user.role === 'admin' ? '👑 Admin' : 'Utilisateur'}
                </span>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">Inscrit le</label>
                <div className="text-white/80">{moment(user.created_date).format('DD/MM/YYYY HH:mm')}</div>
              </div>
            </div>
          </div>

          {/* Credits Card */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Crédits & Abonnement</h2>
            
            {credits ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Abonnement</span>
                  {getSubscriptionBadge(credits)}
                </div>
                
                <div>
                  <label className="block text-sm text-white/60 mb-2">Crédits gratuits</label>
                  <Input
                    type="number"
                    value={credits.free_downloads || 0}
                    onChange={(e) => setCredits({ ...credits, free_downloads: parseInt(e.target.value) || 0 })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-white/60 mb-2">Crédits payants</label>
                  <Input
                    type="number"
                    value={credits.paid_credits || 0}
                    onChange={(e) => setCredits({ ...credits, paid_credits: parseInt(e.target.value) || 0 })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowAddCreditsModal(true)}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                  <Button
                    onClick={handleUpdateCredits}
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Modifier
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-white/40 text-center py-4">Aucun crédit trouvé</p>
            )}
          </div>
        </div>

        {/* Visuals Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Image className="h-5 w-5 text-violet-400" />
            Visuels créés ({visuals.length})
          </h2>
          
          {visuals.length === 0 ? (
            <div className="text-center py-8 text-white/40">
              Aucun visuel créé
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {visuals.map((visual) => (
                <div
                  key={visual.id}
                  className="aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-violet-500/50 transition-all group relative"
                >
                  {visual.video_url || (visual.image_url && (visual.image_url.includes('.mp4') || visual.image_url.includes('/video'))) ? (
                    <>
                      <video 
                        src={visual.video_url || visual.image_url}
                        muted
                        loop
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 p-1 bg-black/60 rounded-full">
                        <Video className="h-3 w-3 text-white" />
                      </div>
                    </>
                  ) : (
                    <img 
                      src={visual.image_url} 
                      alt={visual.title || 'Visual'} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <p className="text-white text-xs line-clamp-2">{visual.title || visual.original_prompt}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transactions Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Receipt className="h-5 w-5 text-violet-400" />
            Historique des paiements ({transactions.length})
          </h2>
          
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-white/40">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucun paiement effectué</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-white font-medium">{getTransactionTypeName(transaction.type)}</p>
                      {getStatusBadge(transaction.status)}
                    </div>
                    <p className="text-white/50 text-sm">
                      {moment(transaction.created_date).format('DD/MM/YYYY HH:mm')} • {transaction.credits_added || 0} messages
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-lg">{transaction.amount?.toFixed(2) || '0.00'}€</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Credits Modal */}
      {showAddCreditsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowAddCreditsModal(false)}>
          <div className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-white">Ajouter des crédits</h2>
              
              <div>
                <label className="block text-white/80 text-sm mb-2 font-medium">Type de crédits</label>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setCreditType('paid')}
                    variant={creditType === 'paid' ? 'default' : 'outline'}
                    className={creditType === 'paid' ? 'flex-1 bg-violet-600 hover:bg-violet-700' : 'flex-1'}
                  >
                    Payants
                  </Button>
                  <Button
                    onClick={() => setCreditType('free')}
                    variant={creditType === 'free' ? 'default' : 'outline'}
                    className={creditType === 'free' ? 'flex-1 bg-blue-600 hover:bg-blue-700' : 'flex-1'}
                  >
                    Gratuits
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2 font-medium">Nombre de crédits à ajouter</label>
                <Input
                  type="number"
                  value={creditsToAdd}
                  onChange={(e) => setCreditsToAdd(parseInt(e.target.value) || 0)}
                  placeholder="Ex: 100"
                  className="bg-white/5 border-white/10 text-white text-lg"
                  min="0"
                />
              </div>

              {creditsToAdd > 0 && (
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-white/60 text-sm">
                    Nouveau total ({creditType === 'paid' ? 'payants' : 'gratuits'}) : 
                    <span className="text-white font-bold ml-2">
                      {(creditType === 'paid' ? (credits?.paid_credits || 0) : (credits?.free_downloads || 0)) + creditsToAdd}
                    </span>
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-white/10">
                <Button
                  onClick={() => {
                    setShowAddCreditsModal(false);
                    setCreditsToAdd(0);
                  }}
                  variant="ghost"
                  className="flex-1 text-white/60 hover:text-white hover:bg-white/10"
                  disabled={saving}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleAddCredits}
                  disabled={saving || creditsToAdd <= 0}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Ajout...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter {creditsToAdd} crédits
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowEmailModal(false)}>
          <div className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Preview Header */}
            <div className="bg-gradient-to-r from-violet-600 to-blue-600 p-8 text-center border-b border-white/10">
              <div className="text-3xl font-bold text-white mb-2">iGPT</div>
              <div className="text-white/90 text-sm font-medium">Message Administrateur</div>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-white/80 text-sm mb-2 font-medium">Destinataire</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 border border-white/10">
                  <Mail className="h-4 w-4 text-white/40" />
                  <span className="text-white/60">{user.email}</span>
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2 font-medium">Sujet *</label>
                <Input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Entrez le sujet de l'email..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2 font-medium">Message *</label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Rédigez votre message..."
                  rows={12}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-violet-500/50 transition-all resize-none"
                />
                <p className="text-white/40 text-xs mt-2">
                  Le message sera envoyé avec un template professionnel incluant le logo iGPT et un footer
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10">
                <Button
                  onClick={() => setShowEmailModal(false)}
                  variant="ghost"
                  className="flex-1 text-white/60 hover:text-white hover:bg-white/10"
                  disabled={sendingEmail}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSendEmail}
                  disabled={sendingEmail || !emailSubject.trim() || !emailBody.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  {sendingEmail ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer l'email
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}