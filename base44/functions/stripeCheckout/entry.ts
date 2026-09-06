import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@14.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

// Mapping des produits Stripe vers les crédits
const PRODUCT_CREDITS = {
  // Packs one-time
  'prod_TWLcf4UtzqMQe4': { credits: 250, type: 'pack' },
  'prod_TWLc6dyHxZtKJS': { credits: 500, type: 'pack' },
  // Abonnements mensuels
  'prod_TWLeCLUbXfQ4KF': { credits: 100, type: 'subscription', plan: 'starter' },
  'prod_TWLhV1pSXRSz3Q': { credits: 250, type: 'subscription', plan: 'pro' },
  'prod_TWLjEEHP8GyXTV': { credits: 500, type: 'subscription', plan: 'elite' },
  'prod_TWLlhvQGwnrOHX': { credits: 1000, type: 'subscription', plan: 'elite_plus' },
  // Abonnements annuels
  'prod_TWLfJW2UaDTeo5': { credits: 1200, type: 'subscription', plan: 'starter', yearly: true },
  'prod_TWLirA98VTt6kD': { credits: 3000, type: 'subscription', plan: 'pro', yearly: true },
  'prod_TWLkczcFEQ2ebe': { credits: 6000, type: 'subscription', plan: 'elite', yearly: true },
  'prod_TWLm7SIvUgDBGh': { credits: 12000, type: 'subscription', plan: 'elite_plus', yearly: true },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId, successUrl, cancelUrl } = await req.json();

    if (!priceId) {
      return Response.json({ error: 'priceId is required' }, { status: 400 });
    }

    // Récupérer le prix pour déterminer le mode
    const price = await stripe.prices.retrieve(priceId);
    const mode = price.recurring ? 'subscription' : 'payment';

    // Créer ou récupérer le customer Stripe
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: user.email,
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name,
        metadata: {
          user_id: user.id,
          user_email: user.email
        }
      });
    }

    // Créer la session de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: successUrl || 'https://app.base44.com/apps/692a3549022b223ef419900f/preview/PaymentSuccess?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: cancelUrl || 'https://app.base44.com/apps/692a3549022b223ef419900f/preview/Pricing',
      metadata: {
        user_id: user.id,
        user_email: user.email,
        product_id: price.product
      },
      allow_promotion_codes: true,
    });

    return Response.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});