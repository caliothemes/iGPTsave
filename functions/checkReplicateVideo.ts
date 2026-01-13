import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { prediction_id } = body;

    if (!prediction_id) {
      return Response.json({ error: 'Missing prediction_id' }, { status: 400 });
    }

    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
    if (!REPLICATE_API_KEY) {
      return Response.json({ error: 'REPLICATE_API_KEY not configured' }, { status: 500 });
    }

    // Check prediction status
    const response = await fetch(`https://api.replicate.com/v1/predictions/${prediction_id}`, {
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to check status:', errorText);
      return Response.json({ 
        error: 'Failed to check video status', 
        details: errorText 
      }, { status: response.status });
    }

    const statusData = await response.json();
    console.log('=== REPLICATE STATUS ===');
    console.log('Status:', statusData.status);
    console.log('Output type:', typeof statusData.output);
    console.log('Output:', statusData.output);

    if (statusData.status === 'succeeded') {
      const videoUrl = statusData.output;
      
      if (!videoUrl) {
        console.error('No video URL in output!');
        return Response.json({ 
          status: 'failed',
          error: 'No video URL returned from Replicate'
        });
      }
      
      console.log('Video URL:', videoUrl);
      
      // Return URL directly without downloading (faster)
      return Response.json({ 
        status: 'succeeded',
        video_url: videoUrl
      });
    } else if (statusData.status === 'failed' || statusData.status === 'canceled') {
      return Response.json({ 
        status: 'failed',
        error: statusData.error || `Generation ${statusData.status}`
      });
    } else {
      // Still processing
      return Response.json({ 
        status: statusData.status || 'processing'
      });
    }

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});