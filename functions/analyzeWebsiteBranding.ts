import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await req.json();
    if (!url) {
      return Response.json({ error: 'URL required' }, { status: 400 });
    }

    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');

    // 1. Capturer le screenshot avec un modèle Replicate
    const screenshotResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: '7e4b1f9f1f4c3d8a5b2e6f8a9c1d3e5f7a9b2c4d6e8f1a3b5c7d9e0f2a4b6c8', // screenshot model
        input: {
          url: url,
          viewport_width: 1280,
          viewport_height: 1024,
          full_page: false
        }
      })
    });

    const screenshotPrediction = await screenshotResponse.json();
    
    // Poll pour le résultat du screenshot
    let screenshotUrl = null;
    let attempts = 0;
    while (attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${screenshotPrediction.id}`, {
        headers: { 'Authorization': `Bearer ${REPLICATE_API_KEY}` }
      });
      
      const status = await statusResponse.json();
      
      if (status.status === 'succeeded') {
        screenshotUrl = status.output;
        break;
      } else if (status.status === 'failed') {
        throw new Error('Screenshot failed');
      }
      
      attempts++;
    }

    if (!screenshotUrl) {
      throw new Error('Screenshot timeout');
    }

    // 2. Analyser le screenshot avec GPT-4 Vision via Replicate
    const analysisResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: 'ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4',
        input: {
          image: screenshotUrl,
          prompt: `Analyze this website screenshot and extract branding elements for AI image generation.

Extract:
1. Main brand colors (HEX codes) - identify 2-4 dominant colors
2. Logo description (shape, style, elements)
3. Visual style (modern/minimal/bold/classic/etc)
4. Typography style (sans-serif/serif/modern/etc)
5. Brand mood (professional/playful/elegant/tech/etc)
6. Key visual elements

Return ONLY valid JSON:
{
  "colors": ["#hex1", "#hex2", "#hex3"],
  "logo_description": "detailed logo description",
  "style": "visual style",
  "typography": "typography style",
  "mood": "brand mood",
  "keywords": ["element1", "element2", "element3"]
}`,
          max_tokens: 500
        }
      })
    });

    const analysisPrediction = await analysisResponse.json();
    
    // Poll pour le résultat de l'analyse
    let branding = null;
    attempts = 0;
    while (attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${analysisPrediction.id}`, {
        headers: { 'Authorization': `Bearer ${REPLICATE_API_KEY}` }
      });
      
      const status = await statusResponse.json();
      
      if (status.status === 'succeeded') {
        const output = Array.isArray(status.output) ? status.output.join('') : status.output;
        try {
          branding = JSON.parse(output);
        } catch (e) {
          // Tenter d'extraire JSON du texte
          const match = output.match(/\{[\s\S]*\}/);
          if (match) {
            branding = JSON.parse(match[0]);
          }
        }
        break;
      } else if (status.status === 'failed') {
        throw new Error('Analysis failed');
      }
      
      attempts++;
    }

    if (!branding) {
      throw new Error('Analysis timeout or invalid response');
    }

    return Response.json({ 
      branding,
      screenshot_url: screenshotUrl 
    });

  } catch (error) {
    console.error('Branding analysis error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});