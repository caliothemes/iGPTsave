import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { image_url, prompt, aspect_ratio = "16:9" } = await req.json();

    if (!image_url || !prompt) {
      return Response.json({ error: 'Missing image_url or prompt' }, { status: 400 });
    }

    // Check credits (10 credits required)
    const userCredits = await base44.entities.UserCredits.filter({ user_email: user.email });
    if (userCredits.length === 0) {
      return Response.json({ error: 'No credits found' }, { status: 400 });
    }

    const credits = userCredits[0];
    const totalCredits = (credits.free_downloads || 0) + (credits.paid_credits || 0);
    const isUnlimited = credits.subscription_type === 'unlimited';
    const isAdmin = user.role === 'admin';

    if (!isAdmin && !isUnlimited && totalCredits < 10) {
      return Response.json({ error: 'Insufficient credits. 10 credits required.' }, { status: 400 });
    }

    // Deduct 10 credits
    if (!isAdmin && !isUnlimited) {
      if (credits.free_downloads >= 10) {
        await base44.asServiceRole.entities.UserCredits.update(credits.id, {
          free_downloads: credits.free_downloads - 10
        });
      } else if (credits.free_downloads > 0) {
        const remaining = 10 - credits.free_downloads;
        await base44.asServiceRole.entities.UserCredits.update(credits.id, {
          free_downloads: 0,
          paid_credits: credits.paid_credits - remaining
        });
      } else {
        await base44.asServiceRole.entities.UserCredits.update(credits.id, {
          paid_credits: credits.paid_credits - 10
        });
      }
    }

    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
    if (!REPLICATE_API_KEY) {
      return Response.json({ error: 'REPLICATE_API_KEY not configured' }, { status: 500 });
    }

    // Start Replicate prediction - Kling model
    const response = await fetch('https://api.replicate.com/v1/models/kwaivgi/kling-video/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait'
      },
      body: JSON.stringify({
        input: {
          prompt: prompt,
          image_url: image_url,
          aspect_ratio: aspect_ratio,
          duration: "5"
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Replicate API error:', error);
      return Response.json({ error: 'Failed to start video generation', details: error }, { status: 500 });
    }

    const prediction = await response.json();

    // Poll status until completed
    let videoUrl = null;
    let status = prediction.status;
    let pollCount = 0;
    const maxPolls = 120; // 4 minutes max (2s interval)

    while (status !== 'succeeded' && status !== 'failed' && pollCount < maxPolls) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Token ${REPLICATE_API_KEY}`,
        }
      });

      if (!statusResponse.ok) {
        break;
      }

      const statusData = await statusResponse.json();
      status = statusData.status;

      if (status === 'succeeded') {
        videoUrl = statusData.output;
        break;
      } else if (status === 'failed') {
        return Response.json({ 
          error: 'Video generation failed', 
          details: statusData.error 
        }, { status: 500 });
      }

      pollCount++;
    }

    if (!videoUrl) {
      return Response.json({ error: 'Video generation timeout or failed' }, { status: 500 });
    }

    return Response.json({ 
      video_url: videoUrl,
      status: 'success',
      credits_used: 10
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});