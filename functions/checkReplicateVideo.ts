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
    console.log('Error:', statusData.error);
    console.log('Output:', statusData.output);

    // Check for Replicate service errors
    if (statusData.error && statusData.error.includes('temporarily unavailable')) {
      console.error('Replicate service unavailable');
      return Response.json({ 
        status: 'failed',
        error: 'Service temporarily unavailable. Sora is overloaded, please retry in a few minutes.'
      });
    }

    if (statusData.status === 'succeeded') {
      const videoUrl = statusData.output;
      
      if (!videoUrl) {
        console.error('No video URL in output!');
        return Response.json({ 
          status: 'failed',
          error: 'No video URL returned from Replicate'
        });
      }
      
      console.log('Temporary video URL from Replicate:', videoUrl);
      
      // Download and store video permanently
      try {
        console.log('Downloading video from Replicate...');
        const videoResponse = await fetch(videoUrl);
        if (!videoResponse.ok) {
          throw new Error('Failed to download video from Replicate');
        }
        
        const videoBlob = await videoResponse.blob();
        const videoFile = new File([videoBlob], `video_${Date.now()}.mp4`, { type: 'video/mp4' });
        
        console.log('Uploading video to permanent storage...');
        const { file_url: permanentUrl } = await base44.asServiceRole.integrations.Core.UploadFile({ 
          file: videoFile 
        });
        
        console.log('Video stored permanently:', permanentUrl);
        
        // Save video to database with permanent URL
        const visualData = await base44.asServiceRole.entities.Visual.create({
          user_email: user.email,
          image_url: permanentUrl,
          visual_type: 'autre',
          title: 'Vidéo générée',
          format: 'digital'
        });
        console.log('Video saved to database:', visualData.id);
        
        return Response.json({ 
          status: 'succeeded',
          video_url: permanentUrl
        });
      } catch (storageError) {
        console.error('Failed to store video permanently:', storageError);
        // Fallback to temporary URL if storage fails
        return Response.json({ 
          status: 'succeeded',
          video_url: videoUrl,
          warning: 'Video stored with temporary URL'
        });
      }
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