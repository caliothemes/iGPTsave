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

    // Download the image first
    const imageResponse = await fetch(image_url);
    if (!imageResponse.ok) {
      return Response.json({ 
        success: false, 
        error: 'Impossible de télécharger l\'image' 
      }, { status: 400 });
    }
    
    const imageBlob = await imageResponse.blob();
    
    // Create FormData with the image
    const formData = new FormData();
    formData.append('image', imageBlob, 'image.png');

    // Call ClearBG API
    const response = await fetch('https://ta-01kbgncvdagtbn4x4bdv5dgtra-5173.wo-yp2mwny34druk964qr1qstnyv.w.modal.host/api/removeBackground', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      let errorData = {};
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        // Not JSON
      }
      const errorMessage = errorData.error || errorData.message || errorText || '';
      if (errorMessage.toLowerCase().includes('credit') || errorMessage.toLowerCase().includes('insufficient') || errorMessage.toLowerCase().includes('quota')) {
        return Response.json({ 
          success: false, 
          error: 'service_unavailable'
        });
      }
      return Response.json({ 
        success: false, 
        error: `Erreur ${response.status}: ${errorMessage || 'Erreur API ClearBG'}`
      });
    }

    const result = await response.json();

    // API returns processed_url in the response
    if (result.processed_url || result.processedUrl) {
      return Response.json({ 
        success: true,
        image_url: result.processed_url || result.processedUrl
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