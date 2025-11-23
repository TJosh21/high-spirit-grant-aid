import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.84.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { userId } = await req.json();

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    // Fetch all open grants
    const { data: grants, error: grantsError } = await supabase
      .from('grants')
      .select('*')
      .eq('status', 'open');

    if (grantsError) throw grantsError;

    // Fetch user's past application outcomes
    const { data: answers, error: answersError } = await supabase
      .from('answers')
      .select('outcome, grant_id, grants(*)')
      .eq('user_id', userId);

    if (answersError) throw answersError;

    // Build context for AI
    const successfulGrants = answers?.filter((a: any) => a.outcome === 'approved').map((a: any) => a.grants) || [];
    const rejectedGrants = answers?.filter((a: any) => a.outcome === 'rejected').map((a: any) => a.grants) || [];

    const prompt = `You are an expert grant recommendation system. Analyze the following data and provide recommendations.

USER PROFILE:
- Business: ${profile.business_name || 'Not specified'}
- Industry: ${profile.business_industry || 'Not specified'}
- Location: ${profile.country || 'Not specified'}, ${profile.state_region || 'Not specified'}
- Annual Revenue: ${profile.annual_revenue_range || 'Not specified'}
- Years in Business: ${profile.years_in_business || 'Not specified'}
- Woman-owned: ${profile.is_woman_owned ? 'Yes' : 'No'}
- Minority-owned: ${profile.is_minority_owned ? 'Yes' : 'No'}
- Description: ${profile.business_description || 'Not specified'}

PAST SUCCESSFUL GRANTS: ${successfulGrants.length > 0 ? successfulGrants.map((g: any) => g.name).join(', ') : 'None'}
PAST REJECTED GRANTS: ${rejectedGrants.length > 0 ? rejectedGrants.map((g: any) => g.name).join(', ') : 'None'}

AVAILABLE GRANTS:
${grants?.map((g, i) => `${i + 1}. ${g.name} - ${g.sponsor_name}
   Amount: ${g.amount_min || 0} - ${g.amount_max || 0} ${g.currency || 'USD'}
   Deadline: ${g.deadline || 'None'}
   Industries: ${g.industry_tags?.join(', ') || 'None'}
   Geography: ${g.geography_tags?.join(', ') || 'None'}
   Target: ${g.target_audience_tags?.join(', ') || 'None'}
   Business Stage: ${g.business_stage_tags?.join(', ') || 'None'}
   Description: ${g.short_description || 'None'}`).join('\n\n')}

For each grant, provide:
1. match_score (0-100): Overall match quality based on ALL criteria
2. success_probability (0-100): Likelihood of winning based on profile and past outcomes
3. reasoning: 2-3 sentences explaining the scores
4. key_strengths: Array of 2-3 specific advantages
5. considerations: Array of 1-2 potential challenges

Return ONLY a JSON array with this exact structure:
[
  {
    "grant_id": "uuid",
    "match_score": 85,
    "success_probability": 72,
    "reasoning": "Strong match explanation...",
    "key_strengths": ["strength 1", "strength 2"],
    "considerations": ["consideration 1"]
  }
]

Include the top 10 grants ranked by (match_score * 0.6 + success_probability * 0.4).`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a grant recommendation expert. Always return valid JSON arrays.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0]?.message?.content || '[]';
    
    // Extract JSON from markdown code blocks if present
    let jsonContent = content.trim();
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/```\n?/g, '');
    }
    
    const recommendations = JSON.parse(jsonContent);

    // Enrich recommendations with full grant data
    const enrichedRecommendations = recommendations
      .map((rec: any) => {
        const grant = grants?.find(g => g.id === rec.grant_id);
        if (!grant) return null;
        
        return {
          ...grant,
          match_score: rec.match_score,
          success_probability: rec.success_probability,
          reasoning: rec.reasoning,
          key_strengths: rec.key_strengths,
          considerations: rec.considerations,
          combined_score: Math.round(rec.match_score * 0.6 + rec.success_probability * 0.4)
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.combined_score - a.combined_score);

    return new Response(
      JSON.stringify({ 
        recommendations: enrichedRecommendations,
        total: enrichedRecommendations.length 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error in ai-grant-recommendations:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
