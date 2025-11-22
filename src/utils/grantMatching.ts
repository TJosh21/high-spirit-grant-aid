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

export function calculateGrantMatchScoreWithHistory(
  grant: any, 
  profile: any,
  userAnswers: any[]
): GrantMatchScore {
  // Start with base score
  let matchScore = calculateGrantMatchScore(grant, profile);
  let score = matchScore.score;
  const matchReasons = [...matchScore.matchReasons];

  // Learn from historical successful applications
  const successfulAnswers = userAnswers.filter(a => a.outcome === 'successful');
  
  if (successfulAnswers.length > 0) {
    // Extract patterns from successful grants
    const successfulIndustries = new Set<string>();
    const successfulAudiences = new Set<string>();
    
    successfulAnswers.forEach(answer => {
      const successfulGrant = answer.grant;
      if (successfulGrant?.industry_tags) {
        successfulGrant.industry_tags.forEach((tag: string) => successfulIndustries.add(tag.toLowerCase()));
      }
      if (successfulGrant?.target_audience_tags) {
        successfulGrant.target_audience_tags.forEach((tag: string) => successfulAudiences.add(tag.toLowerCase()));
      }
    });

    // Boost score if this grant matches successful patterns
    let historicalBoost = 0;
    
    if (grant?.industry_tags?.some((tag: string) => successfulIndustries.has(tag.toLowerCase()))) {
      historicalBoost += 15;
      matchReasons.push('Similar to your successful applications');
    }
    
    if (grant?.target_audience_tags?.some((tag: string) => successfulAudiences.has(tag.toLowerCase()))) {
      historicalBoost += 10;
      if (!matchReasons.includes('Similar to your successful applications')) {
        matchReasons.push('Matches your success profile');
      }
    }

    score += historicalBoost;
  }

  // Penalize if similar to rejected applications
  const rejectedAnswers = userAnswers.filter(a => a.outcome === 'rejected');
  if (rejectedAnswers.length > 0) {
    const rejectedIndustries = new Set<string>();
    
    rejectedAnswers.forEach(answer => {
      const rejectedGrant = answer.grant;
      if (rejectedGrant?.industry_tags) {
        rejectedGrant.industry_tags.forEach((tag: string) => rejectedIndustries.add(tag.toLowerCase()));
      }
    });

    if (grant?.industry_tags?.some((tag: string) => rejectedIndustries.has(tag.toLowerCase()))) {
      score -= 10;
    }
  }

  return {
    grant,
    score,
    matchReasons
  };
}
