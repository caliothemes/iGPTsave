import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const RUNWAY_API_KEY = Deno.env.get("RUNWAY_API_KEY");

async function fetchImageAsBase64(imageUrl) {
  const response = await fetch(imageUrl);
  const arrayBuffer = await response.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  const base64 = btoa(binary);
  const contentType = response.headers.get('content-type') || 'image/png';
  return `data:${contentType};base64,${base64}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { image_url, prompt, duration } = await req.json();

    if (!image_url) {
      return Response.json({ error: 'Image URL is required' }, { status: 400 });
    }

    console.log('Fetching image from:', image_url);
    
    // Convert image URL to base64 data URI
    const base64Image = await fetchImageAsBase64(image_url);
    console.log('Image converted to base64, length:', base64Image.length);

    // Build request body for Runway API
    // Valid ratios for gen3a_turbo: 1280:768, 768:1280
    const requestBody = {
      model: 'gen3a_turbo',
      promptImage: base64Image,
      promptText: prompt || 'Subtle elegant motion, cinematic quality',
      duration: duration || 5
    };
    
    console.log('API Key present:', !!RUNWAY_API_KEY);

    // Start the video generation task
    const createResponse = await fetch('https://api.dev.runwayml.com/v1/image_to_video', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RUNWAY_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06'
      },
      body: JSON.stringify(requestBody)
    });

    const responseText = await createResponse.text();
    console.log('Runway API response status:', createResponse.status);
    console.log('Runway API response body:', responseText);
    
    if (!createResponse.ok) {
      console.error('Runway API error:', responseText);
      let errorDetails = responseText;
      try {
        const errorJson = JSON.parse(responseText);
        errorDetails = errorJson.error || errorJson.message || responseText;
      } catch (e) {}
      return Response.json({ error: 'Failed to start video generation', details: errorDetails }, { status: 500 });
    }

    const taskData = JSON.parse(responseText);
    
    return Response.json({ 
      success: true, 
      task_id: taskData.id,
      status: 'PENDING'
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});