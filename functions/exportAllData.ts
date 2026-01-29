import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Only admins can export all data
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // List of all entities to export
    const entityNames = [
      'User',
      'UserCredits',
      'Visual',
      'Story',
      'Sticker',
      'Conversation',
      'Transaction',
      'PromptExample',
      'ImageEditExample',
      'VideoExample',
      'VideoPromptExample',
      'PromptTemplate',
      'Newsletter',
      'NewsletterTemplate',
      'FAQItem',
      'StoreCategory',
      'StoreItem',
      'StorePurchase',
      'SubscriptionPlan',
      'CreditPack',
      'StoryAnimation',
      'AppSettings',
      'LegalSection',
      'EditorAsset',
      'GeneratedText',
      'AppPresentation',
      'Visit',
      'FeatureCard',
      'ArtDirector',
      'EffectPreset',
      'EffectCategory',
      'ConversationalQA'
    ];

    const exportData = {
      export_date: new Date().toISOString(),
      app_name: 'iGPT',
      entities: {},
      stats: {
        total_entities: 0,
        total_records: 0
      }
    };

    // Fetch all data for each entity
    for (const entityName of entityNames) {
      try {
        const records = await base44.asServiceRole.entities[entityName].filter({}, '-created_date', 100000);
        exportData.entities[entityName] = records;
        exportData.stats.total_entities++;
        exportData.stats.total_records += records.length;
      } catch (e) {
        console.error(`Failed to export ${entityName}:`, e);
        exportData.entities[entityName] = [];
      }
    }

    return Response.json(exportData, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="iGPT-backup-${new Date().toISOString().split('T')[0]}.json"`
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});