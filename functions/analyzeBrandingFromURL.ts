import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url, userPrompt } = await req.json();
    if (!url) {
      return Response.json({ error: 'URL required' }, { status: 400 });
    }

    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');

    console.log('[Branding] Analyse URL:', url);

    // Utiliser LLaMA 3.1 70B pour lire l'URL et analyser le branding
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: 'fbfb20b472b2f3bdd101412a9f70a0ed4fc0ced78a77ff00970ee7a2383c575d',
        input: {
          prompt: `You are a brand analysis expert for AI image generation.

Open and analyze this website:
${url}

Extract EXACT branding information for generating images:
- Brand name and what they do
- Primary brand colors (HEX codes if visible in CSS/styles)
- Logo description (shapes, style, elements)
- Visual style (modern/elegant/minimal/bold/playful/professional)
- Typography style (sans-serif/serif/modern/classic)
- Brand personality and tone
- Key visual elements and design patterns

User wants to create: ${userPrompt || 'a visual'}

Return ONLY valid JSON with this structure:
{
  "brand_name": "company name",
  "brand_description": "what they do",
  "colors": ["#hex1", "#hex2"],
  "logo_description": "logo details",
  "visual_style": "style",
  "typography": "font style",
  "mood": "personality",
  "keywords": ["element1", "element2"],
  "prompt_suggestions": "specific suggestions for the image prompt based on brand and user request"
}`,
          max_tokens: 1000,
          temperature: 0.3
        }
      })
    });

    const prediction = await response.json();

    // Attendre le résultat
    let attempts = 0;
    let branding = null;

    while (attempts < 60) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const statusResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        { headers: { 'Authorization': `Bearer ${REPLICATE_API_KEY}` } }
      );
      
      const status = await statusResponse.json();
      
      if (status.status === 'succeeded') {
        const output = Array.isArray(status.output) 
          ? status.output.join('') 
          : status.output;
        
        try {
          // Extraire JSON de la réponse
          const jsonMatch = output.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            branding = JSON.parse(jsonMatch[0]);
          } else {
            branding = JSON.parse(output);
          }
        } catch (e) {
          console.error('[Branding] Parse error:', e);
          // Retourner un objet minimal
          branding = {
            brand_description: output.slice(0, 500),
            visual_style: 'professional',
            mood: 'modern'
          };
        }
        break;
      } else if (status.status === 'failed') {
        throw new Error('Analysis failed: ' + (status.error || 'unknown'));
      }
      
      attempts++;
    }

    if (!branding) {
      throw new Error('Analysis timeout');
    }

    console.log('[Branding] Résultat:', branding);

    return Response.json({ branding });

  } catch (error) {
    console.error('[Branding] Error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});