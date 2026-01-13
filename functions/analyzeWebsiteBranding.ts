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

    console.log('📸 Taking screenshot of:', url);

    // Take screenshot using ScreenshotOne API
    let screenshotUrl = null;
    try {
      const screenshotResponse = await fetch(
        `https://api.screenshotone.com/take?` +
        `access_key=VykdDVsgzXivig&` +
        `url=${encodeURIComponent(url)}&` +
        `viewport_width=1920&` +
        `viewport_height=1080&` +
        `device_scale_factor=1&` +
        `format=jpg&` +
        `full_page=false&` +
        `block_ads=true&` +
        `block_cookie_banners=true&` +
        `block_trackers=true&` +
        `cache=false`
      );

      if (screenshotResponse.ok) {
        const screenshotBlob = await screenshotResponse.arrayBuffer();
        const screenshotFile = new File([screenshotBlob], 'screenshot.jpg', { type: 'image/jpeg' });
        const uploadResult = await base44.integrations.Core.UploadFile({ file: screenshotFile });
        screenshotUrl = uploadResult.file_url;
        console.log('✅ Screenshot captured:', screenshotUrl);
      } else {
        console.error('❌ Screenshot failed:', await screenshotResponse.text());
        throw new Error('Screenshot capture failed');
      }
    } catch (e) {
      console.error('❌ Screenshot error:', e);
      return Response.json({ error: 'Failed to capture screenshot' }, { status: 500 });
    }

    console.log('🔍 Analyzing screenshot with AI...');

    // Analyze screenshot with InvokeLLM
    const analysisResult = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this website screenshot and extract ALL visual branding elements.

IMPORTANT INSTRUCTIONS:
- Look at the ACTUAL screenshot image provided
- Extract REAL colors you see in the image (HEX codes from logo, buttons, backgrounds)
- Describe the ACTUAL logo you see in the screenshot
- Identify the typography style visible in the image
- Define the visual style and brand mood based on what you SEE

Return ONLY valid JSON:
{
  "colors": ["#hex1", "#hex2", "#hex3", "#hex4"],
  "logo_description": "detailed description of the logo visible in the screenshot",
  "typography": "font style description based on text visible",
  "style": "visual design style you observe",
  "mood": "brand personality based on visual elements",
  "keywords": ["design element 1", "element 2", "element 3"],
  "design_description": "comprehensive 2-3 sentence description of the brand's visual identity"
}`,
      file_urls: [screenshotUrl],
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
        },
        required: ["colors", "style", "mood"]
      }
    });

    console.log('✅ Analysis completed:', JSON.stringify(analysisResult, null, 2));

    if (!analysisResult || typeof analysisResult !== 'object') {
      console.error('❌ Invalid analysis result');
      return Response.json({ error: 'Failed to analyze screenshot' }, { status: 500 });
    }

    // Add screenshot URL to result
    analysisResult.screenshot_url = screenshotUrl;

    return Response.json({ branding: analysisResult });

  } catch (error) {
    console.error('❌ Error:', error);
    return Response.json({ error: error.message || 'Analysis failed' }, { status: 500 });
  }
});