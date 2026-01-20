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
    
    // Récupérer tous les plans d'abonnement
    const plans = await base44.asServiceRole.entities.SubscriptionPlan.filter({ is_active: true });
    const planCreditsMap = {};
    plans.forEach(plan => {
      planCreditsMap[plan.plan_id] = plan.messages_per_month || 0;
    });
    
    // Récupérer tous les crédits utilisateur
    const allCredits = await base44.asServiceRole.entities.UserCredits.list();
    
    let renewedCount = 0;
    const errors = [];
    
    for (const credits of allCredits) {
      // Ignorer les comptes unlimited
      if (credits.subscription_type === 'unlimited') {
        continue;
      }
      
      const subscriptionType = credits.subscription_type || 'free';
      const creditsToRenew = planCreditsMap[subscriptionType] || 150;
      
      // Vérifier si le renouvellement est nécessaire
      const lastReset = credits.last_free_reset ? new Date(credits.last_free_reset) : null;
      const now = new Date();
      
      if (!lastReset) {
        // Pas de dernière date de reset, on initialise
        try {
          await base44.asServiceRole.entities.UserCredits.update(credits.id, {
            paid_credits: creditsToRenew,
            last_free_reset: today
          });
          renewedCount++;
          console.log(`✅ Initialized ${subscriptionType} credits (${creditsToRenew}) for ${credits.user_email}`);
        } catch (error) {
          errors.push({ email: credits.user_email, error: error.message });
        }
        continue;
      }
      
      // Calculer si un mois s'est écoulé
      const monthsSinceReset = (now.getFullYear() - lastReset.getFullYear()) * 12 + 
                               (now.getMonth() - lastReset.getMonth());
      
      if (monthsSinceReset >= 1) {
        // Renouveler les crédits selon le plan
        try {
          await base44.asServiceRole.entities.UserCredits.update(credits.id, {
            paid_credits: creditsToRenew,
            last_free_reset: today
          });
          renewedCount++;
          console.log(`✅ Renewed ${subscriptionType} credits (${creditsToRenew}) for ${credits.user_email}`);
        } catch (error) {
          errors.push({ email: credits.user_email, error: error.message });
        }
      }
    }
    
    return Response.json({
      success: true,
      renewed_count: renewedCount,
      total_users: allCredits.filter(c => c.subscription_type !== 'unlimited').length,
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error('Error renewing free credits:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});