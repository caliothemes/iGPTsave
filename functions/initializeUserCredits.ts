import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    // Only handle user creation events
    if (event?.type !== 'create' || event?.entity_name !== 'User') {
      return Response.json({ success: true, message: 'Not a user creation event' });
    }

    const userEmail = data.email;
    
    if (!userEmail) {
      return Response.json({ error: 'No email found' }, { status: 400 });
    }

    // Check if credits already exist
    const existingCredits = await base44.asServiceRole.entities.UserCredits.filter({ 
      user_email: userEmail 
    });

    if (existingCredits && existingCredits.length > 0) {
      return Response.json({ 
        success: true, 
        message: 'Credits already exist for this user' 
      });
    }

    // Create initial credits with FREE plan
    const today = new Date().toISOString().split('T')[0];
    
    await base44.asServiceRole.entities.UserCredits.create({
      user_email: userEmail,
      free_downloads: 150,
      paid_credits: 0,
      subscription_type: 'free',
      last_free_reset: today
    });

    console.log(`✅ Credits initialized for user: ${userEmail}`);

    return Response.json({ 
      success: true, 
      message: 'Credits initialized successfully',
      user_email: userEmail 
    });

  } catch (error) {
    console.error('Error initializing user credits:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});