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

    // Call Remove.bg API
    const formData = new FormData();
    formData.append('image_url', image_url);
    formData.append('size', 'auto');

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Remove.bg error:', errorText);
      return Response.json({ error: 'Failed to remove background' }, { status: 500 });
    }

    // Get the image as blob
    const imageBlob = await response.blob();
    
    // Convert to base64 for upload
    const arrayBuffer = await imageBlob.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const dataUrl = `data:image/png;base64,${base64}`;

    // Convert to file and upload
    const file = new File([imageBlob], 'removed-bg.png', { type: 'image/png' });
    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    return Response.json({ success: true, image_url: file_url });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});