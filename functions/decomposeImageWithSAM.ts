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

    console.log('🔍 Starting image decomposition with SAM2...');

    // Use SAM2 for automatic segmentation
    const samResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: 'b2cf4d7469e069763d6f5f3a15b1c3cbcdcd3e4bd4d7dd7f90acb41d79a2c1d6', // SAM2 Automatic Mask Generator
        input: {
          image: image_url
        }
      })
    });

    if (!samResponse.ok) {
      const errorText = await samResponse.text();
      console.error('❌ SAM2 API error:', errorText);
      return Response.json({ error: 'SAM2 API error', details: errorText }, { status: 500 });
    }

    const samPrediction = await samResponse.json();
    const predictionId = samPrediction.id;

    console.log('⏳ Polling SAM2 prediction:', predictionId);

    // Poll for completion (max 90s)
    const maxWait = 90000;
    const startTime = Date.now();

    while (true) {
      if (Date.now() - startTime > maxWait) {
        return Response.json({ error: 'SAM2 timeout after 90s' }, { status: 408 });
      }

      await new Promise(resolve => setTimeout(resolve, 3000)); // Poll every 3s

      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: { 'Authorization': `Bearer ${REPLICATE_API_KEY}` }
      });

      const statusData = await statusResponse.json();
      console.log(`SAM2 status (${Math.round((Date.now() - startTime)/1000)}s):`, statusData.status);

      if (statusData.status === 'succeeded') {
        console.log('✅ SAM2 completed, output:', statusData.output);

        // SAM2 returns PNG masks with transparency
        const maskUrl = statusData.output;
        if (!maskUrl) {
          console.error('❌ No mask URL in output');
          return Response.json({ error: 'No mask generated' }, { status: 500 });
        }

        // Parse dimensions
        const [width, height] = dimensions ? dimensions.split('x').map(Number) : [1080, 1080];

        // Create a single layer with the segmented image (PNG with transparency)
        const layer = {
          id: `layer-sam-${Date.now()}`,
          type: 'image',
          imageUrl: maskUrl,
          x: 0,
          y: 0,
          width: width,
          height: height,
          opacity: 100,
          visible: true
        };

        console.log(`✅ SAM2 layer created`);

        return Response.json({
          success: true,
          layers: [layer],
          mask_count: 1
        });

      } else if (statusData.status === 'failed' || statusData.status === 'canceled') {
        console.error('❌ SAM2 failed:', statusData.error);
        return Response.json({ error: statusData.error || 'SAM2 failed' }, { status: 500 });
      }
    }

  } catch (error) {
    console.error('❌ SAM2 Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});