import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, question_text, user_rough_answer, user_clarification, word_limit } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    if (type === 'polish') {
      systemPrompt = `You are High Spirit AI, a professional grant writer helping small business owners create compelling grant applications. Your job is to transform rough answers into polished, professional, grant-ready responses.

Guidelines:
- Keep the user's original intent and information
- Use clear, confident, professional language
- Be specific and detailed
- Use active voice
- Show impact and value
- Stay within word limit if provided (soft limit, ±10% okay)
- Do not invent facts or data`;

      userPrompt = `Grant Question: ${question_text}

User's Rough Answer: ${user_rough_answer}

${user_clarification ? `Additional Clarification: ${user_clarification}` : ''}
${word_limit ? `Word Limit: ${word_limit} words` : ''}

Please polish this into a professional grant answer.`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const polishedAnswer = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ polished_answer: polishedAnswer }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
