import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { image_url, prompt, aspect_ratio, additional_images } = await req.json();

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

    // Process additional images if provided
    const publicAdditionalImages = [];
    if (additional_images && Array.isArray(additional_images)) {
      for (const addImgUrl of additional_images) {
        try {
          const imgResponse = await fetch(addImgUrl);
          if (imgResponse.ok) {
            const imgBlob = await imgResponse.blob();
            const imgFile = new File([imgBlob], 'additional.png', { type: 'image/png' });
            const uploadResult = await base44.integrations.Core.UploadFile({ file: imgFile });
            publicAdditionalImages.push(uploadResult.file_url);
          }
        } catch (err) {
          console.error('Additional image upload failed:', err);
        }
      }
    }

    // Build all images array
    const allImages = [publicImageUrl, ...publicAdditionalImages];
    console.log('All images for Replicate:', allImages);

    // Call Replicate API - using the correct model version endpoint
    // Use predictions endpoint with version instead of model name
    const requestBody = {
      version: "adirik/flux-cinestill:216a43b9975de96742a56e5e7c69504d13ab9f7f97ce6e5547920e4025e87818",
      input: {
        image: publicImageUrl,
        prompt: prompt,
        guidance_scale: 3.5,
        num_inference_steps: 28,
        strength: 0.85
      }
    };

    // Try with black-forest-labs/flux-kontext-pro for image editing
    const replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait=60'
      },
      body: JSON.stringify({
        version: "kontext-dev/kontext-image-editing:latest",
        input: {
          input_image: publicImageUrl,
          prompt: prompt,
          aspect_ratio: aspect_ratio || '1:1'
        }
      })
    });

    console.log('Replicate response status:', replicateResponse.status);

    if (!replicateResponse.ok) {
      const errorText = await replicateResponse.text();
      console.error('Replicate API error response:', errorText);
      
      // Try alternative model if first one fails
      console.log('Trying alternative model: black-forest-labs/flux-fill-pro');
      
      const altResponse = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-fill-pro/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${REPLICATE_API_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'wait=120'
        },
        body: JSON.stringify({
          input: {
            image: publicImageUrl,
            prompt: prompt,
            output_format: "png"
          }
        })
      });

      if (!altResponse.ok) {
        const altErrorText = await altResponse.text();
        console.error('Alternative model also failed:', altErrorText);
        return Response.json({ 
          error: `Image edit failed. Please try again later. Details: ${replicateResponse.status}` 
        }, { status: 500 });
      }

      const altResult = await altResponse.json();
      console.log('Alternative model response:', altResult);

      // Handle polling if needed
      if (altResult.status === 'starting' || altResult.status === 'processing') {
        // Poll for result
        let pollResult = altResult;
        const maxAttempts = 60;
        let attempts = 0;
        
        while ((pollResult.status === 'starting' || pollResult.status === 'processing') && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          const pollResponse = await fetch(pollResult.urls.get, {
            headers: {
              'Authorization': `Bearer ${REPLICATE_API_KEY}`
            }
          });
          pollResult = await pollResponse.json();
          attempts++;
          console.log(`Poll attempt ${attempts}, status: ${pollResult.status}`);
        }

        if (pollResult.status === 'succeeded') {
          const outputUrl = Array.isArray(pollResult.output) ? pollResult.output[0] : pollResult.output;
          return Response.json({ 
            output_url: outputUrl,
            status: 'succeeded'
          });
        } else {
          return Response.json({ 
            error: `Generation failed: ${pollResult.error || 'Unknown error'}` 
          }, { status: 500 });
        }
      }

      const altOutputUrl = Array.isArray(altResult.output) ? altResult.output[0] : altResult.output;
      if (altOutputUrl) {
        return Response.json({ 
          output_url: altOutputUrl,
          status: altResult.status
        });
      }
    }

    const result = await replicateResponse.json();
    console.log('Replicate response:', JSON.stringify(result, null, 2));

    if (result.error) {
      return Response.json({ error: result.error }, { status: 500 });
    }

    // Handle polling if needed
    if (result.status === 'starting' || result.status === 'processing') {
      let pollResult = result;
      const maxAttempts = 60;
      let attempts = 0;
      
      while ((pollResult.status === 'starting' || pollResult.status === 'processing') && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const pollResponse = await fetch(pollResult.urls.get, {
          headers: {
            'Authorization': `Bearer ${REPLICATE_API_KEY}`
          }
        });
        pollResult = await pollResponse.json();
        attempts++;
        console.log(`Poll attempt ${attempts}, status: ${pollResult.status}`);
      }

      if (pollResult.status === 'succeeded') {
        const outputUrl = Array.isArray(pollResult.output) ? pollResult.output[0] : pollResult.output;
        return Response.json({ 
          output_url: outputUrl,
          status: 'succeeded'
        });
      } else {
        return Response.json({ 
          error: `Generation failed: ${pollResult.error || 'Unknown error'}` 
        }, { status: 500 });
      }
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