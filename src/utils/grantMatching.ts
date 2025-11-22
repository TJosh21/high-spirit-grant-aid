// Grant recommendation engine - calculates match scores based on user profile

export interface GrantMatchScore {
  grant: any;
  score: number;
  matchReasons: string[];
}

export function calculateGrantMatchScore(grant: any, profile: any): GrantMatchScore {
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

  // Revenue range match (10 points)
  if (profile?.annual_revenue_range && grant?.target_audience_tags?.length > 0) {
    const revenueMatch = grant.target_audience_tags.some((tag: string) => 
      tag.toLowerCase().includes(profile.annual_revenue_range.toLowerCase())
    );
    if (revenueMatch) {
      score += 10;
      matchReasons.push('Revenue range match');
    }
  }

  // Base score for open grants (ensures all have minimum score)
  if (grant?.status === 'open') {
    score += 5;
  }

  return {
    grant,
    score,
    matchReasons
  };
}

export function getTopRecommendedGrants(
  grants: any[], 
  profile: any, 
  limit: number = 3
): GrantMatchScore[] {
  return grants
    .map(grant => calculateGrantMatchScore(grant, profile))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
