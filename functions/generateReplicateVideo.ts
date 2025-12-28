import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { image_url, prompt, aspect_ratio = "16:9", duration = 5 } = await req.json();
    
    console.log('Video generation request:', { image_url, prompt, aspect_ratio, duration });

    if (!image_url || !prompt) {
      return Response.json({ error: 'Missing image_url or prompt' }, { status: 400 });
    }

    // Calculate credits based on duration
    const creditsRequired = duration === 10 ? 25 : 15;

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

    console.log('Starting Replicate prediction...');
    console.log('Request body:', JSON.stringify({
      input: {
        prompt: prompt,
        image: image_url
      }
    }));

    // Use Kling v2.5 Turbo Pro model endpoint
    const response = await fetch('https://api.replicate.com/v1/models/kwaivgi/kling-v2-5-turbo-pro/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait'
      },
      body: JSON.stringify({
        input: {
          prompt: prompt,
          image: image_url
        }
      })
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

    return Response.json({ 
      video_url: videoUrl,
      status: 'success',
      credits_used: creditsRequired
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});