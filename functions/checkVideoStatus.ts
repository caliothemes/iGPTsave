import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const RUNWAY_API_KEY = Deno.env.get("RUNWAY_API_KEY");

Deno.serve(async (req) => {
  try {
    const { task_id } = await req.json();

    if (!task_id) {
      return Response.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const statusResponse = await fetch(`https://api.runwayml.com/v1/tasks/${task_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RUNWAY_API_KEY}`,
        'X-Runway-Version': '2024-11-06'
      }
    });

    if (!statusResponse.ok) {
      const error = await statusResponse.text();
      return Response.json({ error: 'Failed to check status', details: error }, { status: 500 });
    }

    const statusData = await statusResponse.json();
    
    return Response.json({ 
      success: true,
      status: statusData.status,
      progress: statusData.progress || 0,
      video_url: statusData.output?.[0] || null,
      failure: statusData.failure || null
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});