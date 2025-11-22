import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { answerId, grantName, polishedAnswer } = await req.json();

    const DOCUSIGN_INTEGRATION_KEY = Deno.env.get('DOCUSIGN_INTEGRATION_KEY');
    const DOCUSIGN_USER_ID = Deno.env.get('DOCUSIGN_USER_ID');
    const DOCUSIGN_ACCOUNT_ID = Deno.env.get('DOCUSIGN_ACCOUNT_ID');

    if (!DOCUSIGN_INTEGRATION_KEY || !DOCUSIGN_USER_ID || !DOCUSIGN_ACCOUNT_ID) {
      throw new Error('DocuSign credentials not configured');
    }

    // Get DocuSign access token
    const tokenResponse = await fetch('https://account-d.docusign.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: DOCUSIGN_INTEGRATION_KEY,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get DocuSign access token');
    }

    const { access_token } = await tokenResponse.json();

    // Create envelope with the polished answer
    const envelope = {
      emailSubject: `Grant Application: ${grantName}`,
      documents: [{
        documentBase64: btoa(polishedAnswer),
        name: `${grantName} Application`,
        fileExtension: 'txt',
        documentId: '1',
      }],
      recipients: {
        signers: [{
          email: user.email,
          name: user.user_metadata?.name || user.email,
          recipientId: '1',
          routingOrder: '1',
        }],
      },
      status: 'sent',
    };

    const envelopeResponse = await fetch(
      `https://demo.docusign.net/restapi/v2.1/accounts/${DOCUSIGN_ACCOUNT_ID}/envelopes`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(envelope),
      }
    );

    if (!envelopeResponse.ok) {
      const errorText = await envelopeResponse.text();
      console.error('DocuSign error:', errorText);
      throw new Error('Failed to create DocuSign envelope');
    }

    const { envelopeId } = await envelopeResponse.json();

    // Update answer with envelope ID
    const { error: updateError } = await supabaseClient
      .from('answers')
      .update({ docusign_envelope_id: envelopeId })
      .eq('id', answerId);

    if (updateError) {
      console.error('Failed to update answer:', updateError);
    }

    console.log(`DocuSign envelope created: ${envelopeId}`);

    return new Response(
      JSON.stringify({ envelopeId, success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-to-docusign:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});