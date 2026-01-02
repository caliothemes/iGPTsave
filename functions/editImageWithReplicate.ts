import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { image_url, prompt, aspect_ratio } = await req.json();

    if (!image_url || !prompt) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
    if (!REPLICATE_API_KEY) {
      return Response.json({ error: 'REPLICATE_API_KEY not configured' }, { status: 500 });
    }

    console.log('Starting PrunaAI image edit...');
    console.log('Original Image URL:', image_url);
    console.log('Prompt:', prompt);
    console.log('Aspect Ratio:', aspect_ratio);

    // Download image and re-upload to ensure public accessibility
    let publicImageUrl = image_url;
    try {
      console.log('Downloading image to ensure public access...');
      const imageResponse = await fetch(image_url);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.status}`);
      }
      const imageBlob = await imageResponse.blob();
      const imageFile = new File([imageBlob], 'temp.png', { type: 'image/png' });
      
      // Re-upload to Base44 public storage
      const uploadResult = await base44.integrations.Core.UploadFile({ file: imageFile });
      publicImageUrl = uploadResult.file_url;
      console.log('Re-uploaded image URL (public):', publicImageUrl);
    } catch (uploadError) {
      console.error('Image re-upload failed:', uploadError);
      // Continue with original URL if re-upload fails
    }

    // Call Replicate API - prunaai/p-image-edit using model name directly
    const replicateResponse = await fetch('https://api.replicate.com/v1/models/prunaai/p-image-edit/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait'
      },
      body: JSON.stringify({
        input: {
          image: publicImageUrl,
          prompt: prompt,
          aspect_ratio: aspect_ratio || '1:1',
          turbo: true,
          num_inference_steps: 4
        }
      })
    });

    if (!replicateResponse.ok) {
      const errorText = await replicateResponse.text();
      console.error('Replicate API error:', errorText);
      return Response.json({ 
        error: `Replicate API error: ${replicateResponse.status} - ${errorText}` 
      }, { status: 500 });
    }

    const result = await replicateResponse.json();
    console.log('Replicate response:', result);

    if (result.error) {
      return Response.json({ error: result.error }, { status: 500 });
    }

    // The output is a URL to the edited image
    const outputUrl = Array.isArray(result.output) ? result.output[0] : result.output;

    if (!outputUrl) {
      return Response.json({ error: 'No output URL returned from Replicate' }, { status: 500 });
    }

    return Response.json({ 
      output_url: outputUrl,
      status: result.status
    });

  } catch (error) {
    console.error('Server error:', error);
    return Response.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
});