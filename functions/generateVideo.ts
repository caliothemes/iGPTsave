import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const RUNWAY_API_KEY = Deno.env.get("RUNWAY_API_KEY");

Deno.serve(async (req) => {
  try {
    const { image_url, prompt, duration } = await req.json();

    if (!image_url) {
      return Response.json({ error: 'Image URL is required' }, { status: 400 });
    }

    console.log('Image URL:', image_url);
    console.log('API Key present:', !!RUNWAY_API_KEY);

    // Build request body for Runway API - use direct URL
    const requestBody = {
      promptImage: image_url,
      promptText: prompt || 'Subtle elegant motion, cinematic quality',
      model: 'gen3a_turbo',
      duration: duration || 5
    };
    
    console.log('Request body:', JSON.stringify(requestBody));

    // Start the video generation task - use production API
    const createResponse = await fetch('https://api.runwayml.com/v1/image_to_video', {
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