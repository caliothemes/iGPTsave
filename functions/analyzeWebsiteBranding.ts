import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import puppeteer from 'npm:puppeteer@23.11.1';

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

    console.log('[Branding] Analyse de:', url);

    // 1. Capturer screenshot avec Puppeteer
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1024 });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
    
    const screenshotBuffer = await page.screenshot({ type: 'png', fullPage: false });
    await browser.close();

    console.log('[Branding] Screenshot capturé');

    // 2. Upload screenshot
    const screenshotFile = new File([screenshotBuffer], 'screenshot.png', { type: 'image/png' });
    const { file_url: screenshotUrl } = await base44.integrations.Core.UploadFile({ 
      file: screenshotFile 
    });

    console.log('[Branding] Screenshot uploadé:', screenshotUrl);

    // 3. Analyser avec InvokeLLM
    const branding = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this website screenshot and extract branding for image generation.

Extract:
1. Main brand colors (2-4 dominant HEX codes)
2. Logo description (shape, style, elements)
3. Visual style (modern/minimal/bold/classic/elegant/tech)
4. Typography style
5. Brand mood
6. Key visual elements

Return ONLY valid JSON with these exact keys:
{
  "colors": ["#hex1", "#hex2"],
  "logo_description": "logo details",
  "style": "visual style",
  "typography": "font style",
  "mood": "brand personality",
  "keywords": ["element1", "element2"]
}`,
      file_urls: [screenshotUrl],
      response_json_schema: {
        type: "object",
        properties: {
          colors: { type: "array", items: { type: "string" } },
          logo_description: { type: "string" },
          style: { type: "string" },
          typography: { type: "string" },
          mood: { type: "string" },
          keywords: { type: "array", items: { type: "string" } }
        }
      }
    });

    console.log('[Branding] Analyse terminée:', branding);

    return Response.json({ 
      branding,
      screenshot_url: screenshotUrl 
    });

  } catch (error) {
    console.error('[Branding] Erreur:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});