import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const RUNWAY_API_KEY = Deno.env.get("RUNWAY_API_KEY");

// Helper function to convert image URL to base64 data URI
async function imageUrlToBase64(url) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  const base64 = btoa(binary);
  
  // Detect content type from URL or default to png
  let contentType = 'image/png';
  if (url.includes('.jpg') || url.includes('.jpeg')) {
    contentType = 'image/jpeg';
  } else if (url.includes('.webp')) {
    contentType = 'image/webp';
  }
  
  return `data:${contentType};base64,${base64}`;
}

// Helper to detect if text is in French
function isFrench(text) {
  const frenchIndicators = ['le ', 'la ', 'les ', 'un ', 'une ', 'des ', 'du ', 'de ', 'à ', 'au ', 'aux ', 'et ', 'ou ', 'où ', 'ce ', 'cette ', 'ces ', 'mon ', 'ma ', 'mes ', 'son ', 'sa ', 'ses ', 'dans ', 'pour ', 'par ', 'avec ', 'sans ', 'sur ', 'sous ', 'vers ', 'chez ', 'qui ', 'que ', 'quoi ', 'dont ', 'très ', 'plus ', 'moins ', 'bien ', 'aussi ', 'tout ', 'tous ', 'toute ', 'toutes ', 'même ', 'encore ', 'jamais ', 'toujours', 'être', 'avoir', 'faire', 'dire', 'aller', 'voir', 'savoir', 'pouvoir', 'falloir', 'vouloir', 'venir', 'prendre', 'donner', 'mettre'];
  const lowerText = text.toLowerCase();
  return frenchIndicators.some(indicator => lowerText.includes(indicator));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { image_url, prompt, duration, dimensions } = await req.json();

    if (!image_url) {
      return Response.json({ error: 'Image URL is required' }, { status: 400 });
    }

    if (!RUNWAY_API_KEY) {
      console.error('RUNWAY_API_KEY not set');
      return Response.json({ error: 'API key not configured' }, { status: 500 });
    }

    console.log('Image URL:', image_url);
    console.log('API Key present:', !!RUNWAY_API_KEY);
    console.log('API Key format check:', RUNWAY_API_KEY.startsWith('rw_'));

    // Translate prompt to English if it's in French
    let finalPrompt = prompt || 'Subtle elegant motion, cinematic quality';
    if (isFrench(finalPrompt)) {
      console.log('French prompt detected, translating to English...');
      try {
        const translation = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Translate this video animation prompt from French to English. Keep it concise and focused on visual motion, camera movements, and cinematic effects. Only return the English translation, nothing else:\n\n${finalPrompt}`,
          response_json_schema: null
        });
        finalPrompt = translation;
        console.log('Translated prompt:', finalPrompt);
      } catch (e) {
        console.error('Translation failed, using original:', e);
      }
    }

    // Convert image URL to base64 data URI
    console.log('Converting image to base64...');
    const base64Image = await imageUrlToBase64(image_url);
    console.log('Base64 image length:', base64Image.length);

    // Build request body for Runway API with base64 image
    const requestBody = {
      promptImage: base64Image,
      promptText: finalPrompt,
      model: 'gen3a_turbo',
      duration: duration || 5,
      watermark: false
    };
    
    console.log('Request body prepared (image converted to base64)');

    // Start the video generation task - use dev API (public Runway API)
    const createResponse = await fetch('https://api.dev.runwayml.com/v1/image_to_video', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RUNWAY_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06'
      },
      body: JSON.stringify(requestBody)
    });

    const responseText = await createResponse.text();
    console.log('Runway API response status:', createResponse.status);
    console.log('Runway API response body:', responseText);
    
    if (!createResponse.ok) {
      console.error('Runway API error:', responseText);
      let errorDetails = responseText;
      try {
        const errorJson = JSON.parse(responseText);
        errorDetails = errorJson.error || errorJson.message || errorJson.detail || responseText;
      } catch (e) {}
      return Response.json({ error: 'Runway API error', details: errorDetails }, { status: createResponse.status });
    }

    const taskData = JSON.parse(responseText);
    
    return Response.json({ 
      success: true, 
      task_id: taskData.id,
      status: 'PENDING'
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});