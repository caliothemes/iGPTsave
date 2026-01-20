import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@14.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

// Mapping des produits Stripe vers les crédits
// ⚠️ IMPORTANT: Mettre à jour les product IDs Stripe ici quand vous créez les produits sur Stripe
const PRODUCT_CREDITS = {
  // Packs one-time (crédits à usage unique)
  'pack_50': { credits: 500, type: 'pack' },        // Pack 50 → 500 crédits
  'pack_100': { credits: 1000, type: 'pack' },      // Pack 100 → 1000 crédits
  'pack_250': { credits: 2500, type: 'pack' },      // Pack 250 → 2500 crédits
  'pack_500': { credits: 5000, type: 'pack' },      // Pack 500 → 5000 crédits
  
  // Abonnements mensuels
  'STARTER_monthly': { credits: 500, type: 'subscription', plan: 'STARTER' },           // STARTER 500 crédits/mois
  'PRO_monthly': { credits: 1500, type: 'subscription', plan: 'PRO' },                  // PRO 1500 crédits/mois
  'ELITE_monthly': { credits: 5000, type: 'subscription', plan: 'ELITE' },              // ELITE 5000 crédits/mois
  'ELITE_PLUS_monthly': { credits: 10000, type: 'subscription', plan: 'ELITE_PLUS' },   // ELITE PLUS 10000 crédits/mois
  
  // Abonnements annuels
  'STARTER_yearly': { credits: 6000, type: 'subscription', plan: 'STARTER', yearly: true },         // STARTER 6000 crédits/an
  'PRO_yearly': { credits: 18000, type: 'subscription', plan: 'PRO', yearly: true },                // PRO 18000 crédits/an
  'ELITE_yearly': { credits: 60000, type: 'subscription', plan: 'ELITE', yearly: true },            // ELITE 60000 crédits/an
  'ELITE_PLUS_yearly': { credits: 120000, type: 'subscription', plan: 'ELITE_PLUS', yearly: true }, // ELITE PLUS 120000 crédits/an
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Gérer les événements
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userEmail = session.metadata?.user_email || session.customer_email;
        
        if (!userEmail) {
          console.error('No user email found in session');
          break;
        }

        // Récupérer les line items
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        const priceId = lineItems.data[0]?.price?.id;
        const price = await stripe.prices.retrieve(priceId);
        const productId = price.product;
        const productConfig = PRODUCT_CREDITS[productId];

        if (!productConfig) {
          console.error('Unknown product:', productId);
          break;
        }

        // Mettre à jour les crédits utilisateur
        const userCredits = await base44.asServiceRole.entities.UserCredits.filter({ user_email: userEmail });
        
        if (userCredits.length > 0) {
          const credits = userCredits[0];
          const updateData = {
            paid_credits: (credits.paid_credits || 0) + productConfig.credits
          };

          if (productConfig.type === 'subscription') {
            const endDate = new Date();
            if (productConfig.yearly) {
              endDate.setFullYear(endDate.getFullYear() + 1);
            } else {
              endDate.setMonth(endDate.getMonth() + 1);
            }
            updateData.subscription_type = productConfig.plan;
            updateData.subscription_end_date = endDate.toISOString().split('T')[0];
          }

          await base44.asServiceRole.entities.UserCredits.update(credits.id, updateData);
        }

        // Enregistrer la transaction
        await base44.asServiceRole.entities.Transaction.create({
          user_email: userEmail,
          type: productConfig.type === 'pack' ? 'credit_pack' : `subscription_${productConfig.plan}`,
          amount: session.amount_total / 100,
          credits_added: productConfig.credits,
          status: 'completed'
        });

        console.log(`Credits added for ${userEmail}: ${productConfig.credits}`);
        break;
      }

      case 'invoice.payment_succeeded': {
        // Renouvellement d'abonnement
        const invoice = event.data.object;
        if (invoice.billing_reason === 'subscription_cycle') {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
          const customer = await stripe.customers.retrieve(subscription.customer);
          const userEmail = customer.email;

          const productId = subscription.items.data[0]?.price?.product;
          const productConfig = PRODUCT_CREDITS[productId];

          if (productConfig && userEmail) {
            const userCredits = await base44.asServiceRole.entities.UserCredits.filter({ user_email: userEmail });
            
            if (userCredits.length > 0) {
              const credits = userCredits[0];
              const endDate = new Date();
              if (productConfig.yearly) {
                endDate.setFullYear(endDate.getFullYear() + 1);
              } else {
                endDate.setMonth(endDate.getMonth() + 1);
              }

              await base44.asServiceRole.entities.UserCredits.update(credits.id, {
                paid_credits: (credits.paid_credits || 0) + productConfig.credits,
                subscription_end_date: endDate.toISOString().split('T')[0]
              });

              await base44.asServiceRole.entities.Transaction.create({
                user_email: userEmail,
                type: `subscription_${productConfig.plan}_renewal`,
                amount: invoice.amount_paid / 100,
                credits_added: productConfig.credits,
                status: 'completed'
              });

              console.log(`Subscription renewed for ${userEmail}: ${productConfig.credits} credits`);
            }
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        // Annulation d'abonnement
        const subscription = event.data.object;
        const customer = await stripe.customers.retrieve(subscription.customer);
        const userEmail = customer.email;

        if (userEmail) {
          const userCredits = await base44.asServiceRole.entities.UserCredits.filter({ user_email: userEmail });
          if (userCredits.length > 0) {
            await base44.asServiceRole.entities.UserCredits.update(userCredits[0].id, {
              subscription_type: 'free'
            });
            console.log(`Subscription cancelled for ${userEmail}`);
          }
        }
        break;
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});