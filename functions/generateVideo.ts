import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const RUNWAY_API_KEY = Deno.env.get("RUNWAY_API_KEY");

// Helper function to convert image URL to base64 data URI
async function imageUrlToBase64(url) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  const base64 = btoa(binary);
  
  // Detect content type from URL or default to png
  let contentType = 'image/png';
  if (url.includes('.jpg') || url.includes('.jpeg')) {
    contentType = 'image/jpeg';
  } else if (url.includes('.webp')) {
    contentType = 'image/webp';
  }
  
  return `data:${contentType};base64,${base64}`;
}

Deno.serve(async (req) => {
  try {
    const { image_url, prompt, duration } = await req.json();

    if (!image_url) {
      return Response.json({ error: 'Image URL is required' }, { status: 400 });
    }

    console.log('Image URL:', image_url);
    console.log('API Key present:', !!RUNWAY_API_KEY);

    // Convert image URL to base64 data URI
    console.log('Converting image to base64...');
    const base64Image = await imageUrlToBase64(image_url);
    console.log('Base64 image length:', base64Image.length);

    // Build request body for Runway API with base64 image
    const requestBody = {
      promptImage: base64Image,
      promptText: prompt || 'Subtle elegant motion, cinematic quality',
      model: 'gen3a_turbo',
      duration: duration || 5
    };
    
    console.log('Request body prepared (image converted to base64)');

    // Start the video generation task - use dev API as per Runway docs
    const createResponse = await fetch('https://api.dev.runwayml.com/v1/image_to_video', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RUNWAY_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06',
        'Accept': 'application/json'
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
        errorDetails = errorJson.error || errorJson.message || errorJson.detail || responseText;
      } catch (e) {}
      return Response.json({ error: 'Runway API error', details: errorDetails }, { status: createResponse.status });
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