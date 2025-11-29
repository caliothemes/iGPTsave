import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Camera, User, Mail, Crown, Zap, Save, Receipt, Download, FileText } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import { useLanguage } from '@/components/LanguageContext';
import moment from 'moment';

export default function Account() {
  const { language } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [localData, setLocalData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [companySettings, setCompanySettings] = useState({});

  const t = {
    fr: {
      title: "Mon compte",
      subtitle: "Gérez votre profil et vos informations",
      profile: "Profil",
      changePhoto: "Changer la photo",
      name: "Nom complet",
      email: "Email",
      subscription: "Abonnement",
      free: "Gratuit",
      pro: "Pro",
      unlimited: "Unlimited",
      freeCredits: "Crédits gratuits",
      paidCredits: "Crédits payants",
      save: "Sauvegarder",
      upgradeAccount: "Améliorer mon compte",
      payments: "Historique des paiements",
      noPayments: "Aucun paiement effectué",
      invoice: "Facture",
      downloadInvoice: "Télécharger",
      printInvoice: "Imprimer",
      date: "Date",
      amount: "Montant",
      type: "Type",
      status: "Statut",
      completed: "Complété",
      pending: "En attente",
      failed: "Échoué",
      creditPack: "Pack de crédits",
      subscriptionLimited: "Abonnement Pro",
      subscriptionUnlimited: "Abonnement Unlimited",
    },
    en: {
      title: "My Account",
      subtitle: "Manage your profile and information",
      profile: "Profile",
      changePhoto: "Change photo",
      name: "Full name",
      email: "Email",
      subscription: "Subscription",
      free: "Free",
      pro: "Pro",
      unlimited: "Unlimited",
      freeCredits: "Free credits",
      paidCredits: "Paid credits",
      save: "Save",
      upgradeAccount: "Upgrade account",
      payments: "Payment History",
      noPayments: "No payments made",
      invoice: "Invoice",
      downloadInvoice: "Download",
      printInvoice: "Print",
      date: "Date",
      amount: "Amount",
      type: "Type",
      status: "Status",
      completed: "Completed",
      pending: "Pending",
      failed: "Failed",
      creditPack: "Credit Pack",
      subscriptionLimited: "Pro Subscription",
      subscriptionUnlimited: "Unlimited Subscription",
    }
  }[language];

  const loadTransactions = async (userEmail) => {
    setLoadingTransactions(true);
    const [userTransactions, appSettings] = await Promise.all([
      base44.entities.Transaction.filter({ user_email: userEmail }, '-created_date', 50),
      base44.entities.AppSettings.list()
    ]);
    setTransactions(userTransactions);
    
    const settingsMap = {};
    appSettings.forEach(s => { settingsMap[s.key] = s.value; });
    setCompanySettings(settingsMap);
    
    setLoadingTransactions(false);
  };

  const getTransactionTypeName = (type) => {
    switch(type) {
      case 'credit_pack': return t.creditPack;
      case 'subscription_limited': return t.subscriptionLimited;
      case 'subscription_unlimited': return t.subscriptionUnlimited;
      default: return type;
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed': return <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-300 text-xs">{t.completed}</span>;
      case 'pending': return <span className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs">{t.pending}</span>;
      case 'failed': return <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-300 text-xs">{t.failed}</span>;
      default: return null;
    }
  };

  const generateInvoice = (transaction, user) => {
    const invoiceNumber = `FAC-${moment(transaction.created_date).format('YYYYMM')}-${transaction.id?.slice(-6).toUpperCase() || '000000'}`;
    const invoiceDate = moment(transaction.created_date).format('DD/MM/YYYY');
    const amountHT = (transaction.amount / 1.20).toFixed(2);
    const tva = (transaction.amount - amountHT).toFixed(2);
    const amountTTC = transaction.amount?.toFixed(2) || '0.00';
    
    const companyName = companySettings.company_name || 'iGPT';
    const companyAddress = companySettings.company_address || '';
    const companyPostal = companySettings.company_postal_code || '';
    const companyCity = companySettings.company_city || '';
    const companyCountry = companySettings.company_country || 'France';
    const companySiret = companySettings.company_siret || '';
    const companyVat = companySettings.company_vat || '';
    const companyEmail = companySettings.company_email || '';
    const companyPhone = companySettings.company_phone || '';
    const companyLogo = companySettings.company_logo || '';

    const invoiceContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Facture ${invoiceNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #333; font-size: 14px; line-height: 1.5; }
          
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 50px; padding-bottom: 30px; border-bottom: 3px solid #8b5cf6; }
          .logo-section { }
          .logo-img { max-height: 60px; max-width: 200px; object-fit: contain; }
          .logo-text { font-size: 32px; font-weight: 700; color: #8b5cf6; letter-spacing: -1px; }
          .company-info { font-size: 12px; color: #666; margin-top: 10px; line-height: 1.6; }
          
          .invoice-badge { text-align: right; }
          .invoice-title { font-size: 28px; font-weight: 700; color: #1a1a1a; letter-spacing: -0.5px; }
          .invoice-number { font-size: 16px; color: #8b5cf6; font-weight: 600; margin-top: 5px; }
          .invoice-date { font-size: 13px; color: #666; margin-top: 8px; }
          
          .parties { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .party { width: 45%; }
          .party-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 10px; font-weight: 600; }
          .party-name { font-size: 16px; font-weight: 600; color: #1a1a1a; margin-bottom: 5px; }
          .party-details { font-size: 13px; color: #666; line-height: 1.7; }
          
          .table { width: 100%; border-collapse: collapse; margin: 30px 0; }
          .table th { background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: white; padding: 14px 16px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
          .table th:last-child { text-align: right; }
          .table td { padding: 16px; border-bottom: 1px solid #eee; }
          .table td:last-child { text-align: right; font-weight: 500; }
          .table tr:hover { background: #fafafa; }
          
          .totals { margin-left: auto; width: 300px; margin-top: 20px; }
          .total-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .total-row.final { border-bottom: none; border-top: 2px solid #8b5cf6; margin-top: 10px; padding-top: 15px; }
          .total-label { color: #666; }
          .total-value { font-weight: 600; color: #1a1a1a; }
          .total-row.final .total-label, .total-row.final .total-value { font-size: 18px; color: #8b5cf6; font-weight: 700; }
          
          .footer { margin-top: 60px; padding-top: 30px; border-top: 1px solid #eee; }
          .footer-legal { font-size: 11px; color: #999; text-align: center; line-height: 1.8; }
          .footer-thanks { text-align: center; margin-bottom: 20px; font-size: 15px; color: #8b5cf6; font-weight: 500; }
          
          .payment-info { background: #f8f7ff; border-radius: 8px; padding: 20px; margin-top: 30px; }
          .payment-title { font-size: 13px; font-weight: 600; color: #8b5cf6; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
          .payment-details { font-size: 12px; color: #666; }
          
          @media print {
            body { padding: 20px; }
            .header { border-bottom-color: #8b5cf6 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .table th { background: #8b5cf6 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-section">
            ${companyLogo ? `<img src="${companyLogo}" alt="${companyName}" class="logo-img" />` : `<div class="logo-text">${companyName}</div>`}
            <div class="company-info">
              ${companyAddress ? `${companyAddress}<br>` : ''}
              ${companyPostal || companyCity ? `${companyPostal} ${companyCity}<br>` : ''}
              ${companyCountry ? `${companyCountry}<br>` : ''}
              ${companyEmail ? `${companyEmail}` : ''}
              ${companyPhone ? ` • ${companyPhone}` : ''}
            </div>
          </div>
          <div class="invoice-badge">
            <div class="invoice-title">FACTURE</div>
            <div class="invoice-number">${invoiceNumber}</div>
            <div class="invoice-date">Date : ${invoiceDate}</div>
          </div>
        </div>
        
        <div class="parties">
          <div class="party">
            <div class="party-label">Émetteur</div>
            <div class="party-name">${companyName}</div>
            <div class="party-details">
              ${companyAddress ? `${companyAddress}<br>` : ''}
              ${companyPostal || companyCity ? `${companyPostal} ${companyCity}<br>` : ''}
              ${companySiret ? `SIRET : ${companySiret}<br>` : ''}
              ${companyVat ? `TVA : ${companyVat}` : ''}
            </div>
          </div>
          <div class="party">
            <div class="party-label">Client</div>
            <div class="party-name">${user?.full_name || 'Client'}</div>
            <div class="party-details">
              ${user?.email || ''}
            </div>
          </div>
        </div>
        
        <table class="table">
          <thead>
            <tr>
              <th style="width: 60%">Description</th>
              <th style="width: 15%">Quantité</th>
              <th style="width: 25%">Montant HT</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>${getTransactionTypeName(transaction.type)}</strong><br>
                <span style="color: #666; font-size: 12px;">${transaction.credits_added || 0} messages inclus</span>
              </td>
              <td>1</td>
              <td>${amountHT} €</td>
            </tr>
          </tbody>
        </table>
        
        <div class="totals">
          <div class="total-row">
            <span class="total-label">Sous-total HT</span>
            <span class="total-value">${amountHT} €</span>
          </div>
          <div class="total-row">
            <span class="total-label">TVA (20%)</span>
            <span class="total-value">${tva} €</span>
          </div>
          <div class="total-row final">
            <span class="total-label">Total TTC</span>
            <span class="total-value">${amountTTC} €</span>
          </div>
        </div>
        
        <div class="payment-info">
          <div class="payment-title">Informations de paiement</div>
          <div class="payment-details">
            Paiement effectué par carte bancaire le ${invoiceDate}.<br>
            Statut : ${transaction.status === 'completed' ? 'Payé' : 'En attente'}
          </div>
        </div>
        
        <div class="footer">
          <div class="footer-thanks">Merci pour votre confiance !</div>
          <div class="footer-legal">
            ${companyName}${companySiret ? ` • SIRET : ${companySiret}` : ''}${companyVat ? ` • TVA : ${companyVat}` : ''}<br>
            ${companyAddress ? `${companyAddress}, ` : ''}${companyPostal} ${companyCity}${companyCountry ? `, ${companyCountry}` : ''}<br>
            ${companyEmail ? `${companyEmail}` : ''}${companyPhone ? ` • ${companyPhone}` : ''}
          </div>
        </div>
      </body>
      </html>
    `;
    return invoiceContent;
  };

  const handleDownloadInvoice = (transaction, user) => {
    const invoiceContent = generateInvoice(transaction, user);
    const blob = new Blob([invoiceContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `facture-${transaction.id?.slice(-8) || 'invoice'}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrintInvoice = (transaction, user) => {
    const invoiceContent = generateInvoice(transaction, user);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(invoiceContent);
    printWindow.document.close();
    printWindow.print();
  };

  const handleImageUpload = async (e, user) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setLocalData(prev => ({ ...prev, profile_image: file_url }));
      await base44.auth.updateMe({ profile_image: file_url });
    } catch (e) {
      console.error(e);
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!localData) return;
    setSaving(true);
    try {
      await base44.auth.updateMe(localData);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const getSubscriptionBadge = (credits) => {
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

  return (
    <PageWrapper requireAuth>
      {({ user, credits }) => {
        if (!localData && user) {
          setLocalData({ full_name: user.full_name || '', profile_image: user.profile_image || '' });
          loadTransactions(user.email);
        }
        const formData = localData || { full_name: user?.full_name || '', profile_image: user?.profile_image || '' };

        return (
          <div className="space-y-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">{t.title}</h1>
              <p className="text-white/60">{t.subtitle}</p>
            </div>

            {/* Profile Card */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <h2 className="text-lg font-semibold text-white mb-6">{t.profile}</h2>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
                    {formData.profile_image ? (
                      <img src={formData.profile_image} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-10 w-10 text-white" />
                    )}
                  </div>
                  <label className="absolute -bottom-1 -right-1 p-2 rounded-full bg-violet-600 hover:bg-violet-700 cursor-pointer transition-colors">
                    {uploading ? <Loader2 className="h-4 w-4 text-white animate-spin" /> : <Camera className="h-4 w-4 text-white" />}
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, user)} className="hidden" disabled={uploading} />
                  </label>
                </div>
                <div>
                  <p className="text-white font-medium">{user?.full_name || user?.email}</p>
                  <p className="text-white/50 text-sm">{t.changePhoto}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-white/60 mb-2">{t.name}</label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setLocalData(prev => ({ ...prev, full_name: e.target.value }))}
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
                <Button onClick={handleSave} disabled={saving} className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  {t.save}
                </Button>
              </div>
            </div>

            {/* Subscription Card */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <h2 className="text-lg font-semibold text-white mb-6">{t.subscription}</h2>
              <div className="flex items-center justify-between mb-6">
                {getSubscriptionBadge(credits)}
                <a href={createPageUrl('Pricing')} className="text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors">
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
                  <p className="text-2xl font-bold text-white">{credits?.subscription_type === 'unlimited' ? '∞' : (credits?.paid_credits || 0)}</p>
                </div>
              </div>
            </div>

            {/* Payments History Card */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Receipt className="h-5 w-5 text-violet-400" />
                {t.payments}
              </h2>
              
              {loadingTransactions ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 text-violet-400 animate-spin" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-white/40">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>{t.noPayments}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div 
                      key={transaction.id} 
                      className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
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
                      <div className="flex items-center gap-4">
                        <p className="text-white font-bold text-lg">{transaction.amount?.toFixed(2) || '0.00'}€</p>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadInvoice(transaction, user)}
                            className="text-white/60 hover:text-white hover:bg-white/10"
                            title={t.downloadInvoice}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePrintInvoice(transaction, user)}
                            className="text-white/60 hover:text-white hover:bg-white/10"
                            title={t.printInvoice}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      }}
    </PageWrapper>
  );
}