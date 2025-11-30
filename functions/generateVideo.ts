import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const RUNWAY_API_KEY = Deno.env.get("RUNWAY_API_KEY");

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

    // Build request body for Runway API
    // gen3a_turbo valid ratios: 1280:768, 768:1280
    const requestBody = {
      model: 'gen3a_turbo',
      promptImage: image_url,
      promptText: prompt || 'Subtle elegant motion, cinematic quality',
      duration: duration || 5,
      ratio: '1280:768'
    };
    
    console.log('Sending to Runway:', JSON.stringify(requestBody));
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
      // Return the actual error message from Runway
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