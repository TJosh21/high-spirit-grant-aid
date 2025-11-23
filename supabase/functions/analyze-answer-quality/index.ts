import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  questionText: string;
  userAnswer: string;
  wordLimit?: number;
  helperText?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { questionText, userAnswer, wordLimit, helperText }: AnalysisRequest = await req.json();

    if (!questionText || !userAnswer) {
      throw new Error('Question text and user answer are required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const wordCount = userAnswer.trim().split(/\s+/).length;
    const charCount = userAnswer.length;

    // Build the analysis prompt
    const prompt = `You are an expert grant application reviewer. Analyze this grant application answer and provide constructive feedback.

Question: "${questionText}"
${helperText ? `Helper Text: "${helperText}"` : ''}
${wordLimit ? `Word Limit: ${wordLimit} words` : ''}

Current Answer (${wordCount} words, ${charCount} characters):
"${userAnswer}"

Provide a JSON response with:
1. "completeness_score": A score from 0-100 indicating how complete the answer is
2. "quality_score": A score from 0-100 indicating the overall quality (clarity, relevance, detail)
3. "strengths": Array of 2-3 specific strengths (be encouraging but specific)
4. "improvements": Array of 2-4 specific, actionable improvements
5. "tone_feedback": Brief feedback on the tone (professional, clear, engaging)
6. "structure_feedback": Brief feedback on structure and organization
7. "key_missing_elements": Array of important elements that should be added (if any)

Be constructive, specific, and encouraging. Focus on actionable feedback.`;

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
            content: 'You are an expert grant application reviewer who provides constructive, actionable feedback. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API Error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      }
      if (response.status === 402) {
        throw new Error('AI credits depleted. Please add credits to continue.');
      }
      
      throw new Error('Failed to analyze answer quality');
    }

    const data = await response.json();
    const analysis = JSON.parse(data.choices[0].message.content);

    return new Response(
      JSON.stringify({
        ...analysis,
        wordCount,
        charCount,
        wordLimit,
        isOverLimit: wordLimit ? wordCount > wordLimit : false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error analyzing answer:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to analyze answer',
        completeness_score: 0,
        quality_score: 0,
        strengths: [],
        improvements: ['Unable to analyze at this time. Please try again.'],
        tone_feedback: '',
        structure_feedback: '',
        key_missing_elements: []
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});