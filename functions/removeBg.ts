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

    console.log('Attempting to remove background from:', image_url);

    // First, fetch the image to get its binary data
    let imageResponse;
    try {
      imageResponse = await fetch(image_url);
    } catch (fetchError) {
      console.error('Fetch error:', fetchError.message);
      return Response.json({ error: 'Cannot fetch image', details: fetchError.message }, { status: 400 });
    }
    
    if (!imageResponse.ok) {
      console.error('Failed to fetch image:', imageResponse.status, imageResponse.statusText);
      return Response.json({ error: 'Failed to fetch source image', details: `Status: ${imageResponse.status}` }, { status: 400 });
    }
    
    const imageArrayBuffer = await imageResponse.arrayBuffer();
    const imageUint8Array = new Uint8Array(imageArrayBuffer);
    console.log('Image fetched, size:', imageUint8Array.length);

    // Call Remove.bg API with base64
    const base64Image = btoa(String.fromCharCode(...imageUint8Array));
    
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        image_file_b64: base64Image,
        size: 'auto',
        format: 'png',
      }),
    });

    console.log('Remove.bg response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Remove.bg error response:', errorText);
      let errorData = {};
      try { errorData = JSON.parse(errorText); } catch(e) {}
      const errorDetail = errorData.errors?.[0]?.title || errorData.errors?.[0]?.detail || errorText || 'Unknown error';
      return Response.json({ 
        error: 'Failed to remove background', 
        details: errorDetail
      }, { status: 500 });
    }

    // Get the image as arrayBuffer
    const resultArrayBuffer = await response.arrayBuffer();
    console.log('Result image size:', resultArrayBuffer.byteLength);
    
    // Create a Blob from the array buffer
    const blob = new Blob([resultArrayBuffer], { type: 'image/png' });
    
    // Upload using the SDK
    const { file_url } = await base44.integrations.Core.UploadFile({ 
      file: new File([blob], 'removed-bg.png', { type: 'image/png' })
    });

    console.log('Uploaded to:', file_url);
    return Response.json({ success: true, image_url: file_url });
  } catch (error) {
    console.error('RemoveBg Error:', error.message, error.stack);
    return Response.json({ error: 'Server error', details: error.message }, { status: 500 });
  }
});