import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { image_url, additional_images = [], prompt, aspect_ratio = "16:9", duration = 5, model = 'kling', audio_url } = body;

    console.log('[BACKEND DEBUG] Raw request body:', JSON.stringify(body, null, 2));
    console.log('[BACKEND DEBUG] Extracted duration:', duration, 'Type:', typeof duration);

    if (!prompt) {
      return Response.json({ error: 'Missing prompt' }, { status: 400 });
    }

    // Calculate credits based on model and duration
    const durationNum = Number(duration);
    let creditsRequired;
    if (model === 'sora') {
      creditsRequired = durationNum == 4 ? 30 : durationNum == 8 ? 50 : 70;
      console.log(`Sora credits calculation: duration=${durationNum} → credits=${creditsRequired}`);
    } else if (model === 'wan') {
      creditsRequired = duration === 10 ? 30 : 20;
    } else {
      creditsRequired = duration === 10 ? 25 : 15;
    }

    // Check credits
    const userCredits = await base44.entities.UserCredits.filter({ user_email: user.email });
    if (userCredits.length === 0) {
      return Response.json({ error: 'No credits found' }, { status: 400 });
    }

    const credits = userCredits[0];
    const totalCredits = (credits.free_downloads || 0) + (credits.paid_credits || 0);
    const isUnlimited = credits.subscription_type === 'unlimited';
    const isAdmin = user.role === 'admin';

    if (!isAdmin && !isUnlimited && totalCredits < creditsRequired) {
      return Response.json({ error: `Insufficient credits. ${creditsRequired} credits required.` }, { status: 400 });
    }

    // Deduct credits
    if (!isAdmin && !isUnlimited) {
      if (credits.free_downloads >= creditsRequired) {
        await base44.asServiceRole.entities.UserCredits.update(credits.id, {
          free_downloads: credits.free_downloads - creditsRequired
        });
      } else if (credits.free_downloads > 0) {
        const remaining = creditsRequired - credits.free_downloads;
        await base44.asServiceRole.entities.UserCredits.update(credits.id, {
          free_downloads: 0,
          paid_credits: credits.paid_credits - remaining
        });
      } else {
        await base44.asServiceRole.entities.UserCredits.update(credits.id, {
          paid_credits: credits.paid_credits - creditsRequired
        });
      }
    }

    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
    if (!REPLICATE_API_KEY) {
      console.error('REPLICATE_API_KEY not set');
      return Response.json({ error: 'REPLICATE_API_KEY not configured' }, { status: 500 });
    }

    console.log(`Starting ${model} video generation...`);

    // Prepare input based on model
    let modelEndpoint;
    let input;
    
    if (model === 'sora') {
      // Sora 2 Pro
      modelEndpoint = 'https://api.replicate.com/v1/models/openai/sora-2-pro/predictions';
      
      // Map duration to Sora's length parameter
      // Sora expects: short=4s, medium=8s, long=12s
      const durationNum = Number(duration);
      let lengthValue;
      
      console.log(`Sora BEFORE mapping - duration: ${duration}, type: ${typeof duration}, durationNum: ${durationNum}`);
      console.log(`Comparisons: ${durationNum} == 4? ${durationNum == 4}, == 8? ${durationNum == 8}, == 12? ${durationNum == 12}`);
      
      if (durationNum == 4) {
        lengthValue = 'short';
      } else if (durationNum == 8) {
        lengthValue = 'medium';
      } else if (durationNum == 12) {
        lengthValue = 'long';
      } else {
        console.warn(`Unexpected duration ${durationNum}, defaulting to short`);
        lengthValue = 'short';
      }
      
      console.log(`Sora AFTER mapping - lengthValue: ${lengthValue}`);
      
      input = {
        prompt: prompt,
        aspect_ratio: aspect_ratio === '3:4' ? 'portrait' : 'landscape',
        length: lengthValue,
        resolution_quality: 'high'
      };
      if (image_url) {
        input.input_reference = image_url;
      }
      
      console.log('Sora final input object:', JSON.stringify(input, null, 2));
    } else if (model === 'wan') {
      // Wan v2.5 I2V
      modelEndpoint = 'https://api.replicate.com/v1/models/lucataco/wan-v2.5-i2v/predictions';
      input = {
        image: image_url,
        prompt: prompt,
        duration: duration
      };
      if (audio_url) {
        input.audio = audio_url;
      }
    } else {
      // Kling v2.5 Turbo Pro
      modelEndpoint = 'https://api.replicate.com/v1/models/kwaivgi/kling-v2.5-turbo-pro/predictions';
      input = {
        prompt: prompt || 'Cinematic motion, smooth camera movement',
        duration: duration === 10 ? 10 : 5,
        aspect_ratio: aspect_ratio
      };
      if (image_url) {
        input.start_image = image_url;
      }
      if (additional_images && additional_images.length > 0) {
        input.end_image = additional_images[0];
      }
    }

    console.log('Model endpoint:', modelEndpoint);
    console.log('Model input:', JSON.stringify(input, null, 2));

    // Call Replicate API
    const response = await fetch(modelEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ input })
    });

    const responseText = await response.text();
    console.log('Replicate response status:', response.status);
    console.log('Replicate response body:', responseText);

    if (!response.ok) {
      console.error('Replicate API error:', responseText);
      return Response.json({ 
        error: 'Failed to start video generation', 
        details: responseText 
      }, { status: response.status });
    }

    const prediction = JSON.parse(responseText);
    console.log('Replicate prediction:', prediction);

    // Poll status until completed
    let videoUrl = null;
    let status = prediction.status;
    let pollCount = 0;
    const maxPolls = 180; // 6 minutes max

    while (status !== 'succeeded' && status !== 'failed' && pollCount < maxPolls) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Bearer ${REPLICATE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!statusResponse.ok) {
        const errorText = await statusResponse.text();
        console.error('Poll error:', errorText);
        return Response.json({ 
          error: 'Failed to check video status', 
          details: errorText 
        }, { status: 500 });
      }

      const statusData = await statusResponse.json();
      status = statusData.status;
      console.log('Status:', status, 'Poll:', pollCount);

      if (status === 'succeeded') {
        videoUrl = statusData.output;
        break;
      } else if (status === 'failed') {
        console.error('Generation failed:', statusData.error);
        return Response.json({ 
          error: 'Video generation failed', 
          details: statusData.error || 'Unknown error'
        }, { status: 500 });
      }

      pollCount++;
    }

    if (!videoUrl) {
      return Response.json({ 
        error: 'Video generation timeout',
        details: `Timeout after ${pollCount} polls`
      }, { status: 500 });
    }

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
        video_url: permanentUrl,
        status: 'success',
        credits_used: creditsRequired
      });
    } catch (uploadError) {
      console.error('Failed to store video permanently:', uploadError);
      // Fallback to temporary URL if upload fails
      return Response.json({ 
        video_url: videoUrl,
        status: 'success',
        credits_used: creditsRequired,
        warning: 'Video stored with temporary URL'
      });
    }

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});