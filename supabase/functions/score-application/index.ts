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

    const { answerId } = await req.json();

    // Get answer with related data
    const { data: answer, error: answerError } = await supabaseClient
      .from('answers')
      .select(`
        *,
        grant:grants(*),
        question:questions(*)
      `)
      .eq('id', answerId)
      .single();

    if (answerError || !answer) {
      throw new Error('Answer not found');
    }

    // Get user's historical data
    const { data: userAnswers } = await supabaseClient
      .from('answers')
      .select('*')
      .eq('user_id', user.id);

    const successfulAnswers = userAnswers?.filter(a => a.outcome === 'successful').length || 0;
    const totalAnswers = userAnswers?.length || 0;
    const historicalSuccessRate = totalAnswers > 0 ? (successfulAnswers / totalAnswers) * 100 : 50;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const prompt = `Analyze this grant application answer and provide detailed scoring. Return ONLY valid JSON.

Question: ${answer.question.question_text}
Word Limit: ${answer.question.word_limit || 'None'}
User's Answer: ${answer.user_rough_answer || 'Not started'}
Polished Answer: ${answer.ai_polished_answer || 'Not polished yet'}

Historical Context:
- User has completed ${totalAnswers} applications
- Success rate: ${historicalSuccessRate.toFixed(1)}%

Evaluate:
1. Completeness (0-100): How complete is the answer?
2. Quality (0-100): How well-written and compelling is it?
3. Success Score (0-100): Overall likelihood of success
4. Predicted Success Percentage (0-100): Probability of winning the grant

Consider:
- Word count vs limit
- Clarity and coherence
- Relevance to question
- Professional tone
- Completeness of information
- Historical success patterns

Return format:
{
  "completeness_score": <0-100>,
  "quality_score": <0-100>,
  "success_score": <0-100>,
  "predicted_success_percentage": <0-100>,
  "feedback": "<brief constructive feedback>",
  "strengths": ["<strength1>", "<strength2>"],
  "improvements": ["<improvement1>", "<improvement2>"]
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
            content: 'You are an expert grant application evaluator. Always respond with valid JSON only.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to score application');
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    // Update answer with scores
    await supabaseClient
      .from('answers')
      .update({
        completeness_score: result.completeness_score,
        quality_score: result.quality_score,
        success_score: result.success_score,
        predicted_success_percentage: result.predicted_success_percentage,
      })
      .eq('id', answerId);

    console.log('Application scored:', result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in score-application:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});