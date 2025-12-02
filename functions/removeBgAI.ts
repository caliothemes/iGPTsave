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

    // Use AI to generate a version without background
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this image and describe it in detail for recreation WITHOUT any background.
      
      Create a detailed prompt (100+ words) to regenerate this EXACT same subject/object but on a completely transparent/white background.
      
      CRITICAL RULES:
      - Keep the EXACT same subject, pose, colors, style
      - Remove ALL background elements
      - The subject should be isolated on a clean white/transparent background
      - Describe: the subject's colors, textures, lighting, position, details
      - Add: "isolated on pure white background, no background, product photography style, clean cutout"
      
      Respond in JSON:
      - subject_description: what the main subject is
      - recreation_prompt: detailed prompt to recreate the subject without background`,
      file_urls: [image_url],
      response_json_schema: {
        type: 'object',
        properties: {
          subject_description: { type: 'string' },
          recreation_prompt: { type: 'string' }
        }
      }
    });

    // Generate the image without background
    const imageResult = await base44.integrations.Core.GenerateImage({
      prompt: result.recreation_prompt + '. Isolated subject on pure white background, no background elements, clean product photography cutout style, transparent background PNG style, centered subject.'
    });

    return Response.json({ 
      success: true,
      image_url: imageResult.url,
      method: 'ai'
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});