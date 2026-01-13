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

    // Use Core.InvokeLLM with web context to analyze the site
    const analysisResult = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this website URL and extract ALL visual branding elements:
${url}

You MUST browse the website and extract:
1. PRIMARY COLORS: Extract the exact HEX color codes used (logo, buttons, headers, backgrounds)
2. LOGO: Find and describe the logo design (shapes, colors, style)
3. TYPOGRAPHY: Identify the font families used (serif/sans-serif/monospace/script)
4. VISUAL STYLE: modern/minimalist/classic/bold/elegant/playful/corporate
5. BRAND MOOD: professional/friendly/luxurious/casual/dynamic/serious
6. KEY VISUAL ELEMENTS: patterns, shapes, icons used
7. DESIGN DESCRIPTION: Describe the overall visual identity in 2 sentences

Return ONLY valid JSON:
{
  "colors": ["#hex1", "#hex2", "#hex3"],
  "logo_description": "detailed description of logo",
  "typography": "font style description",
  "style": "visual style",
  "mood": "brand mood",
  "keywords": ["element1", "element2", "element3"],
  "design_description": "2-sentence brand identity description"
}`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          colors: { type: "array", items: { type: "string" } },
          logo_description: { type: "string" },
          typography: { type: "string" },
          style: { type: "string" },
          mood: { type: "string" },
          keywords: { type: "array", items: { type: "string" } },
          design_description: { type: "string" }
        }
      }
    });

    console.log('✅ Branding analysis result:', analysisResult);

    if (!analysisResult || typeof analysisResult !== 'object') {
      return Response.json({ error: 'Failed to analyze website' }, { status: 500 });
    }

    return Response.json({ branding: analysisResult });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});