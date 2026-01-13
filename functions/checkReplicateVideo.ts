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
    console.log('Status check:', statusData.status);

    if (statusData.status === 'succeeded') {
      const videoUrl = statusData.output;
      
      // Download and store video permanently
      console.log('Downloading video from Replicate...');
      try {
        const videoResponse = await fetch(videoUrl);
        if (!videoResponse.ok) {
          throw new Error('Failed to download video');
        }
        
        const videoBlob = await videoResponse.blob();
        const videoFile = new File([videoBlob], `video_${Date.now()}.mp4`, { type: 'video/mp4' });
        
        console.log('Uploading video to permanent storage...');
        const { file_url: permanentUrl } = await base44.asServiceRole.integrations.Core.UploadFile({ 
          file: videoFile 
        });
        
        console.log('Video stored permanently:', permanentUrl);
        
        return Response.json({ 
          status: 'succeeded',
          video_url: permanentUrl
        });
      } catch (uploadError) {
        console.error('Failed to store video permanently:', uploadError);
        // Fallback to temporary URL
        return Response.json({ 
          status: 'succeeded',
          video_url: videoUrl,
          warning: 'Video stored with temporary URL'
        });
      }
    } else if (statusData.status === 'failed') {
      return Response.json({ 
        status: 'failed',
        error: statusData.error || 'Video generation failed'
      });
    } else {
      // Still processing
      return Response.json({ 
        status: statusData.status || 'processing',
        progress: statusData.progress || 0
      });
    }

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});