import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { image_url } = await req.json();

    if (!image_url) {
      return Response.json({ error: 'image_url is required' }, { status: 400 });
    }

    const apiKey = Deno.env.get("REMOVE_BG_API_KEY");
    if (!apiKey) {
      return Response.json({ error: 'Remove.bg API key not configured' }, { status: 500 });
    }

    // Call Remove.bg API with URL-encoded form data
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        image_url: image_url,
        size: 'auto',
        format: 'png',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Remove.bg error:', JSON.stringify(errorData));
      return Response.json({ 
        error: 'Failed to remove background', 
        details: errorData.errors?.[0]?.title || 'Unknown error'
      }, { status: 500 });
    }

    // Get the image as arrayBuffer
    const arrayBuffer = await response.arrayBuffer();
    
    // Create a Blob from the array buffer
    const blob = new Blob([arrayBuffer], { type: 'image/png' });
    
    // Upload using the SDK
    const { file_url } = await base44.integrations.Core.UploadFile({ 
      file: new File([blob], 'removed-bg.png', { type: 'image/png' })
    });

    return Response.json({ success: true, image_url: file_url });
  } catch (error) {
    console.error('RemoveBg Error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});