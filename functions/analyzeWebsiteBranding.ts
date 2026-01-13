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
      return Response.json({ error: 'URL is required' }, { status: 400 });
    }

    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
    if (!REPLICATE_API_KEY) {
      return Response.json({ error: 'REPLICATE_API_KEY not configured' }, { status: 500 });
    }

    // Fetch website content
    let websiteContent = '';
    try {
      const siteResponse = await fetch(url);
      const html = await siteResponse.text();
      
      // Extract basic text content (remove scripts, styles)
      websiteContent = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 3000); // Limit content size
    } catch (e) {
      console.error('Failed to fetch website:', e);
      websiteContent = `Website URL: ${url}`;
    }

    // Call LLaMA to analyze branding
    const llamaResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: '4281eb589e1a1c0bb3aafefbdac1c2e1cd3e5d2c9f2b4e3fa7c2cd3e5d2c9f2b',
        input: {
          prompt: `Analyze this website and extract its branding elements for visual design generation:

Website: ${url}
Content: ${websiteContent}

Provide a concise JSON response with:
{
  "colors": ["primary color", "secondary color", "accent color"],
  "style": "modern/classic/minimalist/bold/etc",
  "mood": "professional/playful/elegant/etc",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "design_description": "brief description of visual identity"
}

Only return the JSON, nothing else.`,
          max_tokens: 500,
          temperature: 0.3
        }
      })
    });

    if (!llamaResponse.ok) {
      const error = await llamaResponse.text();
      console.error('LLaMA API error:', error);
      return Response.json({ error: 'Failed to analyze website' }, { status: 500 });
    }

    const prediction = await llamaResponse.json();
    const predictionId = prediction.id;

    // Poll for result
    let result = null;
    for (let i = 0; i < 30; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Bearer ${REPLICATE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const status = await statusResponse.json();
      
      if (status.status === 'succeeded') {
        const output = status.output.join('');
        
        // Try to parse JSON from output
        try {
          const jsonMatch = output.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            result = JSON.parse(jsonMatch[0]);
          } else {
            // Fallback: extract basic info
            result = {
              colors: [],
              style: 'modern',
              mood: 'professional',
              keywords: [],
              design_description: output.substring(0, 200)
            };
          }
        } catch (e) {
          console.error('Failed to parse LLaMA output:', e);
          result = {
            colors: [],
            style: 'modern',
            mood: 'professional',
            keywords: [],
            design_description: output.substring(0, 200)
          };
        }
        break;
      } else if (status.status === 'failed') {
        throw new Error('LLaMA analysis failed');
      }
    }

    if (!result) {
      return Response.json({ error: 'Analysis timeout' }, { status: 408 });
    }

    return Response.json({ branding: result });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});