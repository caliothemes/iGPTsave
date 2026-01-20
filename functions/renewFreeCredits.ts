import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Vérifier que c'est un admin qui appelle
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Récupérer tous les crédits utilisateur avec plan FREE
    const allCredits = await base44.asServiceRole.entities.UserCredits.list();
    
    let renewedCount = 0;
    const errors = [];
    
    for (const credits of allCredits) {
      // Ignorer si ce n'est pas un compte FREE
      if (credits.subscription_type !== 'free') {
        continue;
      }
      
      // Vérifier si le renouvellement est nécessaire
      const lastReset = credits.last_free_reset ? new Date(credits.last_free_reset) : null;
      const now = new Date();
      
      if (!lastReset) {
        // Pas de dernière date de reset, on initialise
        try {
          await base44.asServiceRole.entities.UserCredits.update(credits.id, {
            free_downloads: 150,
            last_free_reset: today
          });
          renewedCount++;
          console.log(`✅ Initialized free credits for ${credits.user_email}`);
        } catch (error) {
          errors.push({ email: credits.user_email, error: error.message });
        }
        continue;
      }
      
      // Calculer si un mois s'est écoulé
      const monthsSinceReset = (now.getFullYear() - lastReset.getFullYear()) * 12 + 
                               (now.getMonth() - lastReset.getMonth());
      
      if (monthsSinceReset >= 1) {
        // Renouveler les crédits FREE
        try {
          await base44.asServiceRole.entities.UserCredits.update(credits.id, {
            free_downloads: 150,
            last_free_reset: today
          });
          renewedCount++;
          console.log(`✅ Renewed free credits for ${credits.user_email}`);
        } catch (error) {
          errors.push({ email: credits.user_email, error: error.message });
        }
      }
    }
    
    return Response.json({
      success: true,
      renewed_count: renewedCount,
      total_free_users: allCredits.filter(c => c.subscription_type === 'free').length,
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error('Error renewing free credits:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});