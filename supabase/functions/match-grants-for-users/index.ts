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

    const { grantId } = await req.json();

    // Get the grant details
    const { data: grant, error: grantError } = await supabaseClient
      .from('grants')
      .select('*')
      .eq('id', grantId)
      .single();

    if (grantError || !grant) {
      throw new Error('Grant not found');
    }

    // Get all users with profiles
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('*');

    if (profilesError) {
      throw new Error('Error fetching profiles');
    }

    console.log(`Matching grant ${grant.name} against ${profiles?.length || 0} users`);

    // Calculate match scores for each user
    const matchPromises = (profiles || []).map(async (profile) => {
      let score = 50; // Base score
      const reasons: string[] = [];

      // Industry match (15 points)
      if (grant.industry_tags?.includes(profile.business_industry)) {
        score += 15;
        reasons.push(`Industry match: ${profile.business_industry}`);
      }

      // Geography match (15 points)
      if (grant.geography_tags?.includes(profile.country)) {
        score += 15;
        reasons.push(`Geography match: ${profile.country}`);
      }

      // Business stage match (10 points)
      const yearsInBusiness = profile.years_in_business || 0;
      if (yearsInBusiness < 2 && grant.business_stage_tags?.includes('startup')) {
        score += 10;
        reasons.push('Business stage: Startup');
      } else if (yearsInBusiness >= 2 && grant.business_stage_tags?.includes('established')) {
        score += 10;
        reasons.push('Business stage: Established');
      }

      // Target audience match (10 points)
      if (profile.is_woman_owned && grant.target_audience_tags?.includes('women_owned')) {
        score += 10;
        reasons.push('Target audience: Women-owned business');
      }
      if (profile.is_minority_owned && grant.target_audience_tags?.includes('minority_owned')) {
        score += 10;
        reasons.push('Target audience: Minority-owned business');
      }

      score = Math.min(score, 100);

      // Only save high-scoring matches (70+)
      if (score >= 70) {
        // Save match score
        await supabaseClient
          .from('grant_match_scores')
          .upsert({
            user_id: profile.id,
            grant_id: grantId,
            match_score: score,
            match_reasons: reasons,
            notified: false,
          }, {
            onConflict: 'user_id,grant_id'
          });

        // Send notification
        await supabaseClient.from('notifications').insert({
          user_id: profile.id,
          type: 'grant_recommendation',
          title: 'New Grant Match!',
          message: `${grant.name} is ${score}% match for your business`,
          link: `/grants/${grant.slug}`,
        });

        console.log(`Match found for user ${profile.id}: ${score}%`);
      }

      return { userId: profile.id, score };
    });

    const matches = await Promise.all(matchPromises);
    const highMatches = matches.filter(m => m.score >= 70);

    console.log(`Found ${highMatches.length} high-scoring matches`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        matchesFound: highMatches.length,
        matches: highMatches 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in match-grants-for-users:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
