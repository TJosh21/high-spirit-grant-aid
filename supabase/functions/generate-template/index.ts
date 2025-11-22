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

    const { questions, grantId } = await req.json();

    // Get user profile
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Get user's successful applications
    const { data: successfulAnswers } = await supabaseClient
      .from('answers')
      .select(`
        *,
        grant:grants(*),
        question:questions(*)
      `)
      .eq('user_id', user.id)
      .eq('outcome', 'successful')
      .limit(5);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const prompt = `Generate a comprehensive grant application template based on the user's profile and successful applications. Return ONLY valid JSON.

User Profile:
- Business: ${profile?.business_name || 'Not specified'}
- Industry: ${profile?.business_industry || 'Not specified'}
- Description: ${profile?.business_description || 'Not specified'}
- Years in business: ${profile?.years_in_business || 'Not specified'}
- Revenue range: ${profile?.annual_revenue_range || 'Not specified'}

Questions to generate answers for:
${questions.map((q: any, idx: number) => `${idx + 1}. ${q.question_text} (${q.word_limit || 'No'} words)`).join('\n')}

${successfulAnswers && successfulAnswers.length > 0 ? `
Past Successful Applications (for reference):
${successfulAnswers.map((a: any) => `
Question: ${a.question.question_text}
Answer: ${a.ai_polished_answer || a.user_rough_answer}
`).join('\n---\n')}
` : ''}

Generate professional, compelling template answers that:
1. Align with the user's business profile
2. Learn from successful application patterns
3. Are well-structured and persuasive
4. Respect word limits
5. Are ready to be personalized

Return format:
{
  "templateAnswers": [
    {
      "questionId": "<question_id>",
      "templateAnswer": "<generated answer>",
      "placeholders": ["<BUSINESS_NAME>", "<SPECIFIC_DETAIL>"],
      "tips": "<customization tips>"
    }
  ],
  "overallStrategy": "<strategy description>"
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert grant writer who creates compelling application templates. Always respond with valid JSON only.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate template');
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    console.log('Template generated successfully');

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-template:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});