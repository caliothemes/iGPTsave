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
          return Response.json({ success: false, error: 'Crédits insuffisants' }, { status: 400 });
        }
        // Deduct credit
        if (credits.free_downloads > 0) {
          await base44.entities.UserCredits.update(credits.id, { free_downloads: credits.free_downloads - 1 });
        } else if (credits.paid_credits > 0) {
          await base44.entities.UserCredits.update(credits.id, { paid_credits: credits.paid_credits - 1 });
        }
      }
    }

    const apiKey = Deno.env.get("REMOVE_BG_API_KEY");
    
    if (!apiKey) {
      return Response.json({ 
        success: false, 
        error: "REMOVE_BG_API_KEY non configurée" 
      }, { status: 500 });
    }

    const formData = new FormData();
    formData.append('image_url', image_url);
    formData.append('size', 'auto');
    
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      return Response.json({ 
        success: false, 
        error: errorData.errors?.[0]?.title || 'Erreur API remove.bg' 
      });
    }

    const blob = await response.blob();
    
    // Upload to storage
    const file = new File([blob], `bg-removed-${Date.now()}.png`, { type: 'image/png' });
    const uploadResult = await base44.integrations.Core.UploadFile({ file });
    
    return Response.json({ 
      success: true,
      image_url: uploadResult.file_url 
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});