import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { grantId, userId } = await req.json();

    // Get all answers for this grant
    const { data: answers, error: answersError } = await supabaseClient
      .from('answers')
      .select(`
        *,
        question:questions(*)
      `)
      .eq('grant_id', grantId)
      .eq('user_id', userId);

    if (answersError) throw answersError;

    // Get grant details
    const { data: grant, error: grantError } = await supabaseClient
      .from('grants')
      .select('*')
      .eq('id', grantId)
      .single();

    if (grantError) throw grantError;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    // Prepare answers summary
    const answersSummary = answers?.map(a => ({
      question: a.question.question_text,
      answer: a.user_rough_answer || '[Not answered]',
      wordLimit: a.question.word_limit,
      wordCount: a.user_rough_answer?.split(/\s+/).length || 0,
      completenessScore: a.completeness_score,
      qualityScore: a.quality_score,
    })) || [];

    const prompt = `You are an expert grant application reviewer. Review this grant application and provide comprehensive improvement suggestions.

Grant: ${grant.name}
Description: ${grant.short_description}

Application Answers:
${answersSummary.map((a, i) => `
Question ${i + 1}: ${a.question}
Answer: ${a.answer}
Word Count: ${a.wordCount}${a.wordLimit ? ` / ${a.wordLimit}` : ''}
Completeness Score: ${a.completenessScore || 'N/A'}
Quality Score: ${a.qualityScore || 'N/A'}
`).join('\n---\n')}

Provide a comprehensive review with:
1. Overall application strength (score 0-100)
2. Critical issues that must be fixed
3. Strong points to maintain
4. Specific improvements for each answer
5. Readiness assessment (ready/needs revision/incomplete)

Return ONLY a valid JSON object with this structure:
{
  "overallScore": number,
  "readinessStatus": "ready" | "needs_revision" | "incomplete",
  "criticalIssues": [string],
  "strengths": [string],
  "answerFeedback": [{
    "questionNumber": number,
    "improvements": [string],
    "priority": "high" | "medium" | "low"
  }],
  "estimatedRevisionTime": number (in minutes)
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
          { role: 'system', content: 'You are an expert grant application reviewer. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices[0]?.message?.content;

    if (!content) throw new Error('No content from AI');

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');

    const review = JSON.parse(jsonMatch[0]);

    console.log('Application review completed:', review.overallScore);

    return new Response(
      JSON.stringify(review),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in review-application:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
