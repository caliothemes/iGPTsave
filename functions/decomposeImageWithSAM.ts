import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { image_url, dimensions } = await req.json();

    if (!image_url) {
      return Response.json({ error: 'Missing image_url' }, { status: 400 });
    }

    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
    if (!REPLICATE_API_KEY) {
      return Response.json({ error: 'REPLICATE_API_KEY not set' }, { status: 500 });
    }

    console.log('🔍 SAM: Starting image decomposition...');

    // Call Replicate SAM model to segment the image
    const samResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: 'a03ddfeb78c1dc4cbb8a89f1b76f6fc6e8e48de17039f56baa6a0b57f4d3c2f1', // SAM model
        input: {
          image: image_url,
          return_masks: true
        }
      })
    });

    if (!samResponse.ok) {
      const errorText = await samResponse.text();
      console.error('❌ SAM API error:', errorText);
      return Response.json({ error: 'SAM API error', details: errorText }, { status: 500 });
    }

    const samPrediction = await samResponse.json();
    const predictionId = samPrediction.id;

    console.log('⏳ Polling SAM prediction:', predictionId);

    // Poll for completion (max 60s)
    const maxWait = 60000;
    const startTime = Date.now();

    while (true) {
      if (Date.now() - startTime > maxWait) {
        return Response.json({ error: 'SAM timeout after 60s' }, { status: 408 });
      }

      await new Promise(resolve => setTimeout(resolve, 2000)); // Poll every 2s

      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: { 'Authorization': `Bearer ${REPLICATE_API_KEY}` }
      });

      const statusData = await statusResponse.json();
      console.log('SAM status:', statusData.status);

      if (statusData.status === 'succeeded') {
        console.log('✅ SAM completed');

        // Extract masks and create layers
        const masks = statusData.output || [];
        const layers = [];

        // Parse dimensions
        const [width, height] = dimensions ? dimensions.split('x').map(Number) : [1080, 1080];

        // Convert each mask to a layer
        for (let i = 0; i < Math.min(masks.length, 10); i++) { // Limit to 10 layers
          const maskUrl = masks[i];
          
          layers.push({
            id: `layer-sam-${Date.now()}-${i}`,
            type: 'image',
            imageUrl: maskUrl,
            x: 0,
            y: 0,
            width: width,
            height: height,
            opacity: 100,
            visible: true,
            zIndex: i
          });
        }

        console.log(`✅ Created ${layers.length} SAM layers`);

        return Response.json({
          success: true,
          layers: layers,
          mask_count: masks.length
        });

      } else if (statusData.status === 'failed' || statusData.status === 'canceled') {
        console.error('❌ SAM failed:', statusData.error);
        return Response.json({ error: statusData.error || 'SAM failed' }, { status: 500 });
      }
    }

  } catch (error) {
    console.error('❌ SAM Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});