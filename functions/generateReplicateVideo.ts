import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { image_url, additional_images = [], prompt, aspect_ratio = "16:9", duration = 5, model = 'kling', audio_url, generate_audio = true } = body;

    console.log('[BACKEND DEBUG] Raw request body:', JSON.stringify(body, null, 2));
    console.log('[BACKEND DEBUG] Extracted duration:', duration, 'Type:', typeof duration);

    if (!prompt) {
      return Response.json({ error: 'Missing prompt' }, { status: 400 });
    }

    // Calculate credits based on model and duration
    const durationNum = Number(duration);
    let creditsRequired;
    if (model === 'sora') {
      creditsRequired = durationNum == 4 ? 300 : durationNum == 8 ? 500 : 700;
      console.log(`Sora credits calculation: duration=${durationNum} → credits=${creditsRequired}`);
    } else if (model === 'seedance') {
      creditsRequired = durationNum >= 12 ? 185 : 165;
      console.log(`Seedance credits calculation: duration=${durationNum} → credits=${creditsRequired}`);
    } else if (model === 'wan') {
      creditsRequired = duration === 10 ? 300 : 200;
    } else {
      creditsRequired = duration === 10 ? 300 : 200;
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
    
    if (model === 'seedance') {
      // Seedance 1.5 Pro by ByteDance
      modelEndpoint = 'https://api.replicate.com/v1/models/bytedance/seedance-1.5-pro/predictions';
      input = {
        prompt: prompt,
        duration: Number(duration),
        resolution: '1080p',
        aspect_ratio: aspect_ratio || '16:9',
        fps: 24,
        generate_audio: generate_audio !== false,
        camera_fixed: false
      };
      if (image_url) {
        input.image = image_url;
      }
      console.log('Seedance 1.5 Pro final input:', JSON.stringify(input, null, 2));
    } else if (model === 'sora') {
      // Sora 2 Pro - uses "seconds" parameter directly, NOT "length"
      modelEndpoint = 'https://api.replicate.com/v1/models/openai/sora-2-pro/predictions';
      
      const durationNum = Number(duration);
      console.log(`Sora 2 Pro - duration: ${durationNum} seconds`);
      
      input = {
        prompt: prompt,
        seconds: durationNum,
        aspect_ratio: aspect_ratio === '3:4' ? 'portrait' : 'landscape',
        resolution: 'high'
      };
      if (image_url) {
        input.input_reference = image_url;
      }
      
      console.log('Sora 2 Pro final input:', JSON.stringify(input, null, 2));
    } else if (model === 'wan') {
      // Wan v2.6 I2V
      modelEndpoint = 'https://api.replicate.com/v1/models/wan-video/wan-2.6-i2v/predictions';
      // Map aspect_ratio to Wan's accepted values
      const wanAspectMap = { '16:9': '16:9', '9:16': '9:16', '1:1': '1:1' };
      const wanAspectRatio = wanAspectMap[aspect_ratio] || '16:9';
      console.log(`Wan aspect_ratio: ${wanAspectRatio}`);
      input = {
        image: image_url,
        prompt: prompt,
        duration: Number(duration), // API expects integer
        resolution: "720p",
        aspect_ratio: wanAspectRatio,
        enable_prompt_expansion: true,
        multi_shots: false
      };
      if (audio_url) {
        input.audio = audio_url;
      }
    } else {
      // Kling v2.5 Turbo Pro
      modelEndpoint = 'https://api.replicate.com/v1/models/kwaivgi/kling-v2.5-turbo-pro/predictions';
      // Kling API accepts: "16:9", "9:16", "1:1"
      const klingAspectRatio = aspect_ratio || '16:9';
      console.log(`Kling aspect_ratio: ${klingAspectRatio}`);
      input = {
        prompt: prompt || 'Cinematic motion, smooth camera movement',
        duration: duration === 10 ? 10 : 5,
        aspect_ratio: klingAspectRatio
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

    // Return prediction ID immediately for frontend polling
    return Response.json({ 
      prediction_id: prediction.id,
      status: 'processing',
      credits_used: creditsRequired
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});