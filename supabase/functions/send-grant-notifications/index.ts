import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GrantMatchScore {
  grant: any;
  score: number;
  matchReasons: string[];
}

function calculateGrantMatchScore(grant: any, profile: any): GrantMatchScore {
  let score = 0;
  const matchReasons: string[] = [];

  // Industry match (30 points)
  if (profile?.business_industry && grant?.industry_tags?.length > 0) {
    const industryMatch = grant.industry_tags.some((tag: string) => 
      tag.toLowerCase().includes(profile.business_industry.toLowerCase()) ||
      profile.business_industry.toLowerCase().includes(tag.toLowerCase())
    );
    if (industryMatch) {
      score += 30;
      matchReasons.push('Industry match');
    }
  }

  // Business ownership match (25 points)
  if (grant?.target_audience_tags?.length > 0) {
    if (profile?.is_woman_owned && grant.target_audience_tags.some((tag: string) => 
      tag.toLowerCase().includes('woman') || tag.toLowerCase().includes('women')
    )) {
      score += 25;
      matchReasons.push('Women-owned business match');
    }
    
    if (profile?.is_minority_owned && grant.target_audience_tags.some((tag: string) => 
      tag.toLowerCase().includes('minority')
    )) {
      score += 25;
      matchReasons.push('Minority-owned business match');
    }
  }

  // Geography match (20 points)
  if (profile?.state_region && grant?.geography_tags?.length > 0) {
    const geoMatch = grant.geography_tags.some((tag: string) => 
      tag.toLowerCase().includes(profile.state_region.toLowerCase()) ||
      tag.toLowerCase().includes(profile.country?.toLowerCase() || '')
    );
    if (geoMatch) {
      score += 20;
      matchReasons.push('Geographic match');
    }
  }

  // Business stage match (15 points)
  if (profile?.years_in_business !== null && grant?.business_stage_tags?.length > 0) {
    const years = profile.years_in_business;
    let stageMatch = false;
    
    if (years <= 2 && grant.business_stage_tags.some((tag: string) => 
      tag.toLowerCase().includes('startup') || tag.toLowerCase().includes('early')
    )) {
      stageMatch = true;
    } else if (years > 2 && years <= 5 && grant.business_stage_tags.some((tag: string) => 
      tag.toLowerCase().includes('growth') || tag.toLowerCase().includes('emerging')
    )) {
      stageMatch = true;
    } else if (years > 5 && grant.business_stage_tags.some((tag: string) => 
      tag.toLowerCase().includes('established') || tag.toLowerCase().includes('mature')
    )) {
      stageMatch = true;
    }
    
    if (stageMatch) {
      score += 15;
      matchReasons.push('Business stage match');
    }
  }

  // Base score for open grants
  if (grant?.status === 'open') {
    score += 5;
  }

  return { grant, score, matchReasons };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get all grants created in the last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { data: newGrants, error: grantsError } = await supabaseClient
      .from('grants')
      .select('*')
      .eq('status', 'open')
      .gte('created_at', yesterday.toISOString());

    if (grantsError) throw grantsError;

    if (!newGrants || newGrants.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No new grants to notify about' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all users with complete profiles
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('*')
      .not('business_industry', 'is', null)
      .not('state_region', 'is', null);

    if (profilesError) throw profilesError;

    let notificationsSent = 0;

    for (const profile of profiles || []) {
      const matchingGrants: GrantMatchScore[] = [];

      // Calculate match scores for each new grant
      for (const grant of newGrants) {
        const matchScore = calculateGrantMatchScore(grant, profile);
        if (matchScore.score >= 70) {
          matchingGrants.push(matchScore);
        }
      }

      // Send email if there are matching grants
      if (matchingGrants.length > 0) {
        const grantsList = matchingGrants
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map(m => `
            <div style="margin: 20px 0; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px;">
              <h3 style="margin: 0 0 10px 0; color: #1f2937;">${m.grant.name}</h3>
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">${m.grant.short_description || ''}</p>
              <div style="display: flex; gap: 8px; margin: 8px 0;">
                ${m.matchReasons.map(reason => 
                  `<span style="background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${reason}</span>`
                ).join('')}
              </div>
              <p style="margin: 10px 0 0 0; font-weight: 600; color: #059669;">
                ${m.score}% Match
              </p>
              <p style="margin: 8px 0 0 0; font-size: 14px;">
                <strong>Funding:</strong> ${m.grant.currency || 'USD'} ${m.grant.amount_min?.toLocaleString()} - ${m.grant.amount_max?.toLocaleString()}
              </p>
              ${m.grant.deadline ? `
                <p style="margin: 8px 0 0 0; font-size: 14px;">
                  <strong>Deadline:</strong> ${new Date(m.grant.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              ` : ''}
            </div>
          `).join('');

        try {
          await resend.emails.send({
            from: 'Grant Alerts <onboarding@resend.dev>',
            to: [profile.email],
            subject: `${matchingGrants.length} New Grant${matchingGrants.length > 1 ? 's' : ''} Match Your Profile!`,
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">🎉 New Grant Opportunities!</h1>
                  </div>
                  
                  <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
                    <p style="font-size: 16px; margin: 0 0 20px 0;">
                      Hi ${profile.name || 'there'},
                    </p>
                    
                    <p style="font-size: 16px; margin: 0 0 20px 0;">
                      Great news! We found <strong>${matchingGrants.length} new grant${matchingGrants.length > 1 ? 's' : ''}</strong> that match your business profile.
                    </p>
                    
                    ${grantsList}
                    
                    <div style="margin: 30px 0; text-align: center;">
                      <a href="${Deno.env.get('SITE_URL') || 'https://your-app.lovable.app'}/grants" 
                         style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                        View All Matching Grants
                      </a>
                    </div>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                      <p style="font-size: 14px; color: #6b7280; margin: 0;">
                        💡 <strong>Tip:</strong> Grants with match scores above 70% have significantly higher success rates. Start your applications early for the best results!
                      </p>
                    </div>
                  </div>
                  
                  <div style="text-align: center; margin-top: 20px; padding: 20px; color: #9ca3af; font-size: 12px;">
                    <p style="margin: 0 0 8px 0;">
                      You're receiving this because you enabled grant notifications in your profile settings.
                    </p>
                    <p style="margin: 0;">
                      <a href="${Deno.env.get('SITE_URL') || 'https://your-app.lovable.app'}/profile" style="color: #667eea; text-decoration: none;">Manage notification preferences</a>
                    </p>
                  </div>
                </body>
              </html>
            `,
          });

          notificationsSent++;

          // Store notification in database
          await supabaseClient.from('notifications').insert({
            user_id: profile.id,
            type: 'grant_match',
            title: `${matchingGrants.length} New Grant${matchingGrants.length > 1 ? 's' : ''} Available`,
            message: `We found ${matchingGrants.length} grant${matchingGrants.length > 1 ? 's' : ''} matching your profile`,
            link: '/grants'
          });

        } catch (emailError) {
          console.error(`Failed to send email to ${profile.email}:`, emailError);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        newGrants: newGrants.length,
        notificationsSent 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});