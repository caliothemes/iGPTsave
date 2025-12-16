import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin user
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { newsletterId, subject, htmlContent } = await req.json();

    // Get all users
    const users = await base44.asServiceRole.entities.User.list();
    
    let sent = 0;
    let failed = 0;

    // Send emails in batches
    for (const recipient of users) {
      if (!recipient.email) continue;
      
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          from_name: 'iGPT',
          to: recipient.email,
          subject: subject,
          body: htmlContent
        });
        sent++;
      } catch (e) {
        console.error(`Failed to send to ${recipient.email}:`, e);
        failed++;
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return Response.json({
      success: true,
      sent,
      failed,
      total: users.length
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});