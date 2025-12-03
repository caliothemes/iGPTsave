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

    // Download the image first
    const imageResponse = await fetch(image_url);
    if (!imageResponse.ok) {
      return Response.json({ 
        success: false, 
        error: 'Impossible de télécharger l\'image' 
      }, { status: 400 });
    }
    
    const imageBlob = await imageResponse.blob();
    
    // Create FormData with the image (use "file" as field name for Render API)
    const formData = new FormData();
    formData.append('file', imageBlob, 'image.png');

    // Call ClearBG Render API (no API key needed)
    const response = await fetch('https://clearbg-qej8.onrender.com/api/remove-bg', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      return Response.json({ 
        success: false, 
        error: `Erreur ${response.status}: ${errorText || 'Erreur API ClearBG'}`
      });
    }

    // API returns the image blob directly
    const resultBlob = await response.blob();
    
    // Upload the processed image to Base44 storage
    const uploadResult = await base44.integrations.Core.UploadFile({ file: resultBlob });

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