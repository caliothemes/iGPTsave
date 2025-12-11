import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

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
    
    for (const item of items) {
      // If has old category_slug and no category_slugs
      if (item.category_slug && (!item.category_slugs || item.category_slugs.length === 0)) {
        await base44.asServiceRole.entities.StoreItem.update(item.id, {
          category_slugs: [item.category_slug]
        });
        migrated++;
      } else {
        skipped++;
      }
    }
    
    return Response.json({ 
      success: true, 
      migrated,
      skipped,
      total: items.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});