import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schemas
const polishRequestSchema = z.object({
  type: z.literal('polish'),
  question_text: z.string().min(1, 'Question text is required').max(1000, 'Question text must be under 1000 characters'),
  user_rough_answer: z.string().min(1, 'Answer is required').max(5000, 'Answer must be under 5000 characters'),
  user_clarification: z.string().max(2000, 'Clarification must be under 2000 characters').optional(),
  word_limit: z.number().int().min(1).max(5000).optional(),
});

const suggestRequestSchema = z.object({
  type: z.literal('suggest'),
  question_text: z.string().min(1, 'Question text is required').max(1000, 'Question text must be under 1000 characters'),
  user_rough_answer: z.string().min(1, 'Answer is required').max(5000, 'Answer must be under 5000 characters'),
  word_limit: z.number().int().min(1).max(5000).optional(),
  current_word_count: z.number().int().min(0),
});

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MINUTES = 60;
const MAX_REQUESTS_PER_WINDOW = 50;

async function checkRateLimit(supabase: any, userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000);
  
  const { data, error } = await supabase
    .from('ai_usage_logs')
    .select('id')
    .eq('user_id', userId)
    .eq('function_name', 'ai-grant-assistant')
    .gte('created_at', windowStart.toISOString());

  if (error) {
    console.error('Error checking rate limit:', error);
    throw new Error('Rate limit check failed');
  }

  const requestCount = data?.length || 0;
  const remaining = Math.max(0, MAX_REQUESTS_PER_WINDOW - requestCount);
  
  return {
    allowed: requestCount < MAX_REQUESTS_PER_WINDOW,
    remaining
  };
}

async function logUsage(supabase: any, userId: string, requestSize: number, responseSize: number) {
  const { error } = await supabase
    .from('ai_usage_logs')
    .insert({
      user_id: userId,
      function_name: 'ai-grant-assistant',
      request_size: requestSize,
      response_size: responseSize
    });

  if (error) {
    console.error('Error logging usage:', error);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract and verify JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from JWT
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Request from user:', user.id);

    // Check rate limit
    const rateLimit = await checkRateLimit(supabase, user.id);
    
    if (!rateLimit.allowed) {
      // Trigger alert for rate limit hit (fire and forget)
      supabase.functions.invoke('send-admin-alert', {
        body: {
          alert_type: 'rate_limit',
          message: `User has exceeded rate limit: ${MAX_REQUESTS_PER_WINDOW} requests per ${RATE_LIMIT_WINDOW_MINUTES} minutes.`,
          user_id: user.id,
          metadata: {
            rate_limit: MAX_REQUESTS_PER_WINDOW,
            window_minutes: RATE_LIMIT_WINDOW_MINUTES,
          },
        },
      }).catch(err => console.error('Failed to send rate limit alert:', err));

      return new Response(
        JSON.stringify({ 
          error: `Rate limit exceeded. You can make ${MAX_REQUESTS_PER_WINDOW} requests per ${RATE_LIMIT_WINDOW_MINUTES} minutes. Please try again later.`,
          remaining: 0,
          resetIn: RATE_LIMIT_WINDOW_MINUTES
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': RATE_LIMIT_WINDOW_MINUTES.toString()
          } 
        }
      );
    }

    // Parse and validate request body
    const rawBody = await req.text();
    const requestSize = rawBody.length;
    let body;
    
    try {
      body = JSON.parse(rawBody);
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle different request types
    const requestType = body.type;
    
    if (requestType === 'suggest') {
      const validationResult = suggestRequestSchema.safeParse(body);
      
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        return new Response(
          JSON.stringify({ error: 'Validation failed', details: errors }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { question_text, user_rough_answer, word_limit, current_word_count } = validationResult.data;
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

      if (!LOVABLE_API_KEY) {
        throw new Error('LOVABLE_API_KEY not configured');
      }

      const systemPrompt = `You are an expert grant writing consultant. Analyze the user's answer and provide 3-5 specific, actionable suggestions to improve it.

Focus on:
1. Content gaps or areas that need more detail
2. Word count optimization (current: ${current_word_count}${word_limit ? `, limit: ${word_limit}` : ''})
3. Clarity and persuasiveness
4. Alignment with the grant question
5. Professional tone and structure

Provide each suggestion as a clear, concise sentence.`;

      const userPrompt = `Grant Question: ${question_text}

Current Answer: ${user_rough_answer}

Provide 3-5 specific suggestions to improve this answer.`;

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
          tools: [{
            type: 'function',
            function: {
              name: 'provide_suggestions',
              description: 'Provide improvement suggestions for the grant answer',
              parameters: {
                type: 'object',
                properties: {
                  suggestions: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'List of 3-5 specific, actionable suggestions',
                    minItems: 3,
                    maxItems: 5
                  }
                },
                required: ['suggestions']
              }
            }
          }],
          tool_choice: { type: 'function', function: { name: 'provide_suggestions' } }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI API error:', response.status, errorText);
        throw new Error(`AI API error: ${response.status}`);
      }

      const data = await response.json();
      const toolCall = data.choices[0]?.message?.tool_calls?.[0];
      const suggestions = toolCall?.function?.arguments ? 
        JSON.parse(toolCall.function.arguments).suggestions : [];

      const responseSize = JSON.stringify(suggestions).length;
      await logUsage(supabase, user.id, requestSize, responseSize);

      return new Response(
        JSON.stringify({ 
          suggestions,
          rate_limit: {
            remaining: rateLimit.remaining - 1,
            limit: MAX_REQUESTS_PER_WINDOW,
            windowMinutes: RATE_LIMIT_WINDOW_MINUTES
          }
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW.toString(),
            'X-RateLimit-Remaining': (rateLimit.remaining - 1).toString(),
          } 
        }
      );
    }

    // Handle polish request
    const validationResult = polishRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { question_text, user_rough_answer, user_clarification, word_limit } = validationResult.data;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are High Spirit AI, a professional grant writer helping small business owners create compelling grant applications. Your job is to transform rough answers into polished, professional, grant-ready responses.

Guidelines:
- Keep the user's original intent and information
- Use clear, confident, professional language
- Be specific and detailed
- Use active voice
- Show impact and value
- Stay within word limit if provided (soft limit, ±10% okay)
- Do not invent facts or data`;

    const userPrompt = `Grant Question: ${question_text}

User's Rough Answer: ${user_rough_answer}

${user_clarification ? `Additional Clarification: ${user_clarification}` : ''}
${word_limit ? `Word Limit: ${word_limit} words` : ''}

Please polish this into a professional grant answer.`;

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
    const responseSize = polishedAnswer.length;

    // Log usage
    await logUsage(supabase, user.id, requestSize, responseSize);

    return new Response(
      JSON.stringify({ 
        polished_answer: polishedAnswer,
        rate_limit: {
          remaining: rateLimit.remaining - 1,
          limit: MAX_REQUESTS_PER_WINDOW,
          windowMinutes: RATE_LIMIT_WINDOW_MINUTES
        }
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW.toString(),
          'X-RateLimit-Remaining': (rateLimit.remaining - 1).toString(),
        } 
      }
    );
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
