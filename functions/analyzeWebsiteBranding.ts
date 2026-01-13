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

    console.log('🔍 Starting website analysis for:', url);

    // Use Core.InvokeLLM with web search to analyze the website
    const analysisResult = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this website URL and extract ALL visual branding elements:
${url}

You MUST browse the actual website and extract:
1. PRIMARY BRAND COLORS: Extract the exact HEX color codes used in the website (logo, buttons, headers, backgrounds, accent colors)
2. LOGO DESCRIPTION: Describe the logo design in detail (shapes, colors, style, elements)
3. TYPOGRAPHY: Identify the font styles used (modern sans-serif, elegant serif, bold display, etc.)
4. VISUAL STYLE: Describe the overall design style (modern, minimalist, classic, bold, elegant, playful, corporate, luxury, etc.)
5. BRAND MOOD: Define the brand personality (professional, friendly, luxurious, casual, dynamic, serious, warm, cold, etc.)
6. KEY VISUAL ELEMENTS: List patterns, shapes, icons, design motifs used throughout the site
7. DESIGN DESCRIPTION: Provide a comprehensive 2-3 sentence description of the complete visual identity and brand aesthetic

IMPORTANT: Return ONLY valid JSON in this exact format:
{
  "colors": ["#hex1", "#hex2", "#hex3"],
  "logo_description": "detailed description of the logo design and elements",
  "typography": "description of font styles and text hierarchy",
  "style": "overall design style",
  "mood": "brand personality and tone",
  "keywords": ["element1", "element2", "element3"],
  "design_description": "comprehensive description of the brand's complete visual identity"
}`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          colors: { 
            type: "array", 
            items: { type: "string" },
            description: "Array of HEX color codes from the website"
          },
          logo_description: { 
            type: "string",
            description: "Detailed description of the logo"
          },
          typography: { 
            type: "string",
            description: "Description of typography used"
          },
          style: { 
            type: "string",
            description: "Overall visual style"
          },
          mood: { 
            type: "string",
            description: "Brand mood and personality"
          },
          keywords: { 
            type: "array", 
            items: { type: "string" },
            description: "Key visual elements and design motifs"
          },
          design_description: { 
            type: "string",
            description: "Complete visual identity description"
          }
        },
        required: ["colors", "style", "mood"]
      }
    });

    console.log('✅ Website analysis completed:', JSON.stringify(analysisResult, null, 2));

    if (!analysisResult || typeof analysisResult !== 'object') {
      console.error('❌ Invalid analysis result:', analysisResult);
      return Response.json({ error: 'Failed to analyze website - invalid response' }, { status: 500 });
    }

    // Ensure we have at least minimal data
    if (!analysisResult.colors || analysisResult.colors.length === 0) {
      console.warn('⚠️ No colors extracted, using defaults');
      analysisResult.colors = ['#000000', '#ffffff'];
    }

    return Response.json({ branding: analysisResult });

  } catch (error) {
    console.error('❌ Error analyzing website:', error);
    return Response.json({ error: error.message || 'Failed to analyze website' }, { status: 500 });
  }
});