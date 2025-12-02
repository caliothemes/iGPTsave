import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { image_url } = await req.json();
    
    if (!image_url) {
      return Response.json({ success: false, error: 'image_url required' }, { status: 400 });
    }

    // Deduct 1 credit from user
    const userCredits = await base44.entities.UserCredits.filter({ user_email: user.email });
    if (userCredits.length > 0) {
      const credits = userCredits[0];
      // Check if user has credits (admin has unlimited)
      if (user.role !== 'admin' && credits.subscription_type !== 'unlimited') {
        const totalCredits = (credits.free_downloads || 0) + (credits.paid_credits || 0);
        if (totalCredits <= 0) {
          return Response.json({ success: false, error: 'no_credits' }, { status: 400 });
        }
        // Deduct credit
        if (credits.free_downloads > 0) {
          await base44.entities.UserCredits.update(credits.id, { free_downloads: credits.free_downloads - 1 });
        } else if (credits.paid_credits > 0) {
          await base44.entities.UserCredits.update(credits.id, { paid_credits: credits.paid_credits - 1 });
        }
      }
    }

    const apiKey = Deno.env.get("NOBG_API_KEY");

    if (!apiKey) {
      return Response.json({ 
        success: false, 
        error: "NOBG_API_KEY non configurée" 
      }, { status: 500 });
    }

    // Call noBG.me API
    const response = await fetch('https://nobgme.base44.app/api/removeBackground', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl: image_url
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || errorData.message || '';
      // If it's a credit issue, return special error
      if (errorMessage.toLowerCase().includes('credit') || errorMessage.toLowerCase().includes('insufficient') || errorMessage.toLowerCase().includes('quota')) {
        return Response.json({ 
          success: false, 
          error: 'service_unavailable'
        });
      }
      return Response.json({ 
        success: false, 
        error: errorMessage || 'Erreur API noBG.me' 
      });
    }

    const result = await response.json();

    // noBG.me returns processedUrl or processed_url in the response
    if (result.processedUrl || result.processed_url) {
      return Response.json({ 
        success: true,
        image_url: result.processedUrl || result.processed_url
      });
    }

    return Response.json({ 
      success: false, 
      error: 'Format de réponse inattendu' 
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});