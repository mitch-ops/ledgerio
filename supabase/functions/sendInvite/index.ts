// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
// import "jsr:@supabase/functions-js/edge-runtime.d.ts"

// console.log("Hello from Functions!")

// Deno.serve(async (req) => {
//   const { name } = await req.json()
//   const data = {
//     message: `Hello ${name}!`,
//   }

//   return new Response(
//     JSON.stringify(data),
//     { headers: { "Content-Type": "application/json" } },
//   )
// })

import { createClient } from 'https://deno.land/x/supabase@1.3.1/mod.ts';

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Function to send SMS via Twilio's API using Deno's fetch
async function sendSms(phone: string, body: string) {
  const twilioSid = Deno.env.get('TWILIO_SID')!;
  const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')!;
  const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')!;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
  
  const authHeader = 'Basic ' + btoa(`${twilioSid}:${twilioAuthToken}`);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      From: twilioPhoneNumber,
      To: phone,
      Body: body,
    }).toString(),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Twilio error:', data);
    throw new Error(`Failed to send SMS: ${data.message}`);
  }

  return data;
}

Deno.serve(async (req) => {
  const { groupId, phoneNumbers } = await req.json();

  try {
    // Fetch group name from the database
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('name')
      .eq('id', groupId)
      .single();

    if (groupError) {
      return new Response(JSON.stringify({ error: groupError.message }), { status: 500 });
    }

    const groupName = group.name;

    // Step 2: Send SMS invites for each phone number
    for (const phone of phoneNumbers) {
      const invitationLink = `${Deno.env.get('FRONTEND_URL')}/join-group/${groupId}/${phone}`;

      // Insert invitation into `group_invitations` table
      await supabase
        .from('group_invitations')
        .insert([{ group_id: groupId, invited_phone: phone, invitation_link: invitationLink }]);

      // Send SMS via Twilio's API using Deno fetch
      await sendSms(phone, `You've been invited to join the group "${groupName}". Join here: ${invitationLink}`);
    }

    return new Response(JSON.stringify({ message: 'Invites sent!' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error sending invites:', error);
    return new Response(JSON.stringify({ error: 'Failed to send invites.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});



/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/sendInvite' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
