import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Download, Database, AlertCircle } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useLanguage } from '@/components/LanguageContext';

export default function AdminBackup() {
  const { language } = useLanguage();
  const [isExporting, setIsExporting] = useState(false);
  const [lastExport, setLastExport] = useState(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await base44.functions.invoke('exportAllData');
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }

      // Create blob and download
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `iGPT-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      setLastExport({
        date: new Date().toISOString(),
        entities: response.data.stats.total_entities,
        records: response.data.stats.total_records
      });
    } catch (error) {
      console.error('Export failed:', error);
      alert(language === 'fr' ? 'Erreur lors de l\'export' : 'Export error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {language === 'fr' ? '💾 Sauvegarde complète' : '💾 Full Backup'}
          </h1>
          <p className="text-white/60">
            {language === 'fr' 
              ? 'Exportez toutes les données de l\'application en un seul fichier JSON'
              : 'Export all application data in a single JSON file'}
          </p>
        </div>

        {/* Warning Card */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-amber-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-amber-200 font-semibold mb-2">
                {language === 'fr' ? 'À quoi sert ce fichier ?' : 'What is this file for?'}
              </h3>
              <p className="text-amber-100/80 text-sm leading-relaxed mb-3">
                {language === 'fr'
                  ? 'Ce fichier contient TOUTES les données de votre application (utilisateurs, visuels, crédits, transactions, etc.). En cas de crash total, ce fichier + votre code GitHub permettent de tout restaurer à 100%.'
                  : 'This file contains ALL your application data (users, visuals, credits, transactions, etc.). In case of total crash, this file + your GitHub code allow a 100% restoration.'}
              </p>
              <ul className="text-amber-100/80 text-sm space-y-1 list-disc list-inside">
                <li>
                  {language === 'fr' 
                    ? 'Sauvegardez ce fichier dans un endroit sûr (Dropbox, Google Drive, etc.)'
                    : 'Save this file in a safe place (Dropbox, Google Drive, etc.)'}
                </li>
                <li>
                  {language === 'fr'
                    ? 'Faites des exports réguliers (hebdomadaire recommandé)'
                    : 'Make regular exports (weekly recommended)'}
                </li>
                <li>
                  {language === 'fr'
                    ? 'Ce fichier est sensible - il contient toutes les données utilisateurs'
                    : 'This file is sensitive - it contains all user data'}
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Export Card */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
              <Database className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {language === 'fr' ? 'Export complet des données' : 'Full data export'}
              </h2>
              <p className="text-white/60 text-sm">
                {language === 'fr' 
                  ? 'Toutes les entités, tous les records'
                  : 'All entities, all records'}
              </p>
            </div>
          </div>

          {lastExport && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
              <p className="text-green-200 text-sm">
                ✅ {language === 'fr' ? 'Dernier export :' : 'Last export:'} {new Date(lastExport.date).toLocaleString(language)}
              </p>
              <p className="text-green-200/80 text-xs mt-1">
                {lastExport.entities} {language === 'fr' ? 'entités' : 'entities'} • {lastExport.records.toLocaleString()} {language === 'fr' ? 'records' : 'records'}
              </p>
            </div>
          )}

          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white py-6 text-lg"
          >
            {isExporting ? (
              <>
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                {language === 'fr' ? 'Export en cours...' : 'Exporting...'}
              </>
            ) : (
              <>
                <Download className="h-5 w-5 mr-3" />
                {language === 'fr' ? 'Télécharger la sauvegarde complète' : 'Download full backup'}
              </>
            )}
          </Button>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
          <h3 className="text-blue-200 font-semibold mb-3">
            {language === 'fr' ? '📋 Contenu du fichier' : '📋 File contents'}
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              'User', 'UserCredits', 'Visual', 'Story', 'Sticker', 'Conversation',
              'Transaction', 'PromptExample', 'VideoExample', 'PromptTemplate',
              'StoreItem', 'StoreCategory', 'StorePurchase', 'SubscriptionPlan',
              'CreditPack', 'AppSettings', 'Newsletter', 'FAQItem'
            ].map(entity => (
              <div key={entity} className="text-blue-200/80">• {entity}</div>
            ))}
            <div className="text-blue-200/80">• {language === 'fr' ? '... et plus' : '... and more'}</div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}