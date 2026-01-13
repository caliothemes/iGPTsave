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

    // Fetch website HTML for logo extraction
    let html = '';
    let logoUrl = null;
    try {
      const siteResponse = await fetch(url);
      html = await siteResponse.text();
      
      // Extract logo from common meta tags
      const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
      const faviconMatch = html.match(/<link\s+rel=["'](?:icon|shortcut icon|apple-touch-icon)["']\s+href=["']([^"']+)["']/i);
      
      if (ogImageMatch) {
        logoUrl = ogImageMatch[1];
      } else if (faviconMatch) {
        logoUrl = faviconMatch[1];
      }
      
      // Make logo URL absolute
      if (logoUrl && !logoUrl.startsWith('http')) {
        const baseUrl = new URL(url);
        logoUrl = new URL(logoUrl, baseUrl.origin).href;
      }
      
      console.log('Logo extracted:', logoUrl);
    } catch (e) {
      console.error('Failed to fetch website:', e);
    }

    // Take screenshot of website using ScreenshotOne or similar
    let screenshotUrl = null;
    try {
      // Use a screenshot API to capture the website visually
      const screenshotResponse = await fetch(`https://api.screenshotone.com/take?url=${encodeURIComponent(url)}&viewport_width=1920&viewport_height=1080&device_scale_factor=1&format=jpg&block_ads=true&block_cookie_banners=true&access_key=demo`);
      
      if (screenshotResponse.ok) {
        const screenshotBlob = await screenshotResponse.blob();
        const screenshotFile = new File([screenshotBlob], 'screenshot.jpg', { type: 'image/jpeg' });
        const uploadResult = await base44.integrations.Core.UploadFile({ file: screenshotFile });
        screenshotUrl = uploadResult.file_url;
        console.log('Screenshot captured:', screenshotUrl);
      }
    } catch (e) {
      console.error('Screenshot failed:', e);
    }

    // Call LLaMA with visual analysis
    const fileUrls = [];
    if (screenshotUrl) fileUrls.push(screenshotUrl);
    if (logoUrl) fileUrls.push(logoUrl);

    const llamaResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: 'fbfb20b472b2f3bdd101412a9f70a0ed4fc0ced78a77ff00970ee7a2383c575d',
        input: {
          prompt: `Analyze this website's visual branding and identity:

Website URL: ${url}
${screenshotUrl ? 'Screenshot and logo provided as images.' : ''}

Extract branding elements for generating visuals that match this brand:

Provide ONLY a JSON response (no other text):
{
  "colors": ["#hex1", "#hex2", "#hex3"],
  "style": "modern/minimalist/classic/bold/elegant/playful",
  "mood": "professional/dynamic/friendly/luxurious/casual",
  "typography": "sans-serif/serif/geometric/rounded",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "design_description": "2-sentence description of the visual identity and brand aesthetic"
}`,
          image: fileUrls.length > 0 ? fileUrls : undefined,
          max_new_tokens: 512,
          temperature: 0.2,
          top_p: 0.9
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

    // Add logo URL to result
    result.logo_url = logoUrl;
    result.screenshot_url = screenshotUrl;

    return Response.json({ branding: result });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});