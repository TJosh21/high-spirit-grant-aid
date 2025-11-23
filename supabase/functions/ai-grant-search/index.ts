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
    const { query, userId } = await req.json();

    if (!query) {
      throw new Error('Search query is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all open grants
    const { data: grants, error: grantsError } = await supabase
      .from('grants')
      .select('*')
      .eq('status', 'open');

    if (grantsError) {
      console.error('Error fetching grants:', grantsError);
      throw new Error('Failed to fetch grants');
    }

    // Fetch user profile if userId is provided
    let userProfile = null;
    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      userProfile = profile;
    }

    // Build context for AI
    const grantsContext = grants.map((g, idx) => 
      `Grant ${idx + 1}:
- ID: ${g.id}
- Name: ${g.name}
- Sponsor: ${g.sponsor_name}
- Description: ${g.short_description || g.long_description || 'No description'}
- Amount Range: ${g.amount_min ? `$${g.amount_min.toLocaleString()}` : 'N/A'} - ${g.amount_max ? `$${g.amount_max.toLocaleString()}` : 'N/A'}
- Industries: ${g.industry_tags?.join(', ') || 'Any'}
- Geography: ${g.geography_tags?.join(', ') || 'Any location'}
- Business Stages: ${g.business_stage_tags?.join(', ') || 'Any stage'}
- Target Audience: ${g.target_audience_tags?.join(', ') || 'Any'}
- Deadline: ${g.deadline || 'No deadline specified'}`
    ).join('\n\n');

    const userContext = userProfile ? `
User Profile Context:
- Business: ${userProfile.business_name || 'Not specified'}
- Industry: ${userProfile.business_industry || 'Not specified'}
- Location: ${userProfile.state_region}, ${userProfile.country || 'Not specified'}
- Revenue: ${userProfile.annual_revenue_range || 'Not specified'}
- Years in Business: ${userProfile.years_in_business || 'Not specified'}
- Woman-owned: ${userProfile.is_woman_owned ? 'Yes' : 'No'}
- Minority-owned: ${userProfile.is_minority_owned ? 'Yes' : 'No'}
` : '';

    const prompt = `You are a grant matching expert. Analyze the user's search query and find the most relevant grants.

User Query: "${query}"
${userContext}

Available Grants:
${grantsContext}

Return a JSON array of grant IDs ranked by relevance (most relevant first). Include a "reasoning" field explaining why each grant matches the query. Limit to top 10 matches.

Response format:
{
  "matches": [
    {
      "grant_id": "id-here",
      "relevance_score": 95,
      "reasoning": "Brief explanation of why this grant matches"
    }
  ]
}

Consider:
1. Keywords and themes in the query
2. Industry/sector alignment
3. Geographic requirements
4. Funding amount needs
5. Business stage requirements
6. User profile match (if provided)`;

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
            content: 'You are a grant matching expert. Analyze queries and return relevant grants with reasoning. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
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
      
      throw new Error('Failed to analyze search query');
    }

    const data = await response.json();
    const analysis = JSON.parse(data.choices[0].message.content);

    // Map grant IDs to full grant objects
    const matchedGrants = analysis.matches.map((match: any) => {
      const grant = grants.find(g => g.id === match.grant_id);
      return {
        ...grant,
        ai_relevance_score: match.relevance_score,
        ai_reasoning: match.reasoning
      };
    }).filter((g: any) => g.id); // Filter out any null matches

    return new Response(
      JSON.stringify({
        query,
        results: matchedGrants,
        total_matches: matchedGrants.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error in ai-grant-search:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to search grants',
        results: []
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
