import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// Delay helper to avoid rate limits
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all store items
    const items = await base44.asServiceRole.entities.StoreItem.list();
    
    let migrated = 0;
    let skipped = 0;
    const errors = [];
    
    // Process in batches of 5 with delays to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      for (const item of batch) {
        try {
          // If has old category_slug and no category_slugs
          if (item.category_slug && (!item.category_slugs || item.category_slugs.length === 0)) {
            await base44.asServiceRole.entities.StoreItem.update(item.id, {
              category_slugs: [item.category_slug]
            });
            migrated++;
          } else if (!item.category_slugs || item.category_slugs.length === 0) {
            // No old category, skip
            skipped++;
          } else {
            // Already has category_slugs
            skipped++;
          }
        } catch (err) {
          errors.push({ id: item.id, error: err.message });
        }
      }
      
      // Wait 1 second between batches
      if (i + batchSize < items.length) {
        await delay(1000);
      }
    }
    
    return Response.json({ 
      success: true, 
      migrated,
      skipped,
      total: items.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});