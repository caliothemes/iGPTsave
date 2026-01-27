import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const RUNWAY_API_KEY = Deno.env.get("RUNWAY_API_KEY");

Deno.serve(async (req) => {
  try {
    const { task_id } = await req.json();

    if (!task_id) {
      return Response.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const statusResponse = await fetch(`https://api.dev.runwayml.com/v1/tasks/${task_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RUNWAY_API_KEY}`,
        'X-Runway-Version': '2024-11-06'
      }
    });

    if (!statusResponse.ok) {
      const error = await statusResponse.text();
      return Response.json({ error: 'Failed to check status', details: error }, { status: 500 });
    }

    const statusData = await statusResponse.json();
    
    const status = statusData.status;
    const videoUrl = statusData.output?.[0];
    
    // If video is ready, download and store it permanently
    if (status === 'SUCCEEDED' && videoUrl) {
      console.log('Video URL:', videoUrl);
      
      try {
        const base44 = createClientFromRequest(req);
        console.log('Downloading video from Runway...');
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
        
        // Save video to database
        try {
          const visualData = await base44.asServiceRole.entities.Visual.create({
            user_email: (await base44.auth.me()).email,
            image_url: permanentUrl,
            visual_type: 'autre',
            title: 'Vidéo générée',
            format: 'digital'
          });
          console.log('Video saved to database:', visualData.id);
        } catch (dbError) {
          console.error('Failed to save video to database:', dbError);
        }
        
        return Response.json({ 
          success: true,
          status: status,
          progress: statusData.progress || 1.0,
          video_url: permanentUrl,
          failure: statusData.failure || null
        });
      } catch (uploadError) {
        console.error('Failed to store video permanently:', uploadError);
        // Fallback to temporary URL if upload fails
        return Response.json({ 
          success: true,
          status: status,
          progress: statusData.progress || 1.0,
          video_url: videoUrl,
          failure: statusData.failure || null,
          warning: 'Video stored with temporary URL'
        });
      }
    }
    
    return Response.json({ 
      success: true,
      status: status,
      progress: statusData.progress || 0,
      video_url: videoUrl,
      failure: statusData.failure || null
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});