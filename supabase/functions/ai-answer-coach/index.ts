import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, roughAnswer, grantId } = await req.json();

    if (!question || !roughAnswer) {
      return new Response(
        JSON.stringify({ error: "Question and rough answer are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert grant writing coach helping small business owners craft winning grant applications.

Your role is to:
1. Take the user's rough answer and polish it into a professional, compelling response
2. Maintain the user's authentic voice while improving clarity and impact
3. Add specific details and metrics where appropriate
4. Ensure the answer directly addresses the grant question
5. Keep the response concise and within typical grant word limits

When polishing:
- Use active voice and strong verbs
- Lead with impact and outcomes
- Be specific with numbers, dates, and achievements
- Show passion and authenticity
- Avoid jargon unless industry-appropriate
- Make every word count`;

    const userPrompt = `Grant Application Question:
${question}

User's Draft Answer:
${roughAnswer}

Please:
1. Provide a polished version of the answer (keep it professional but authentic)
2. List 3-5 specific suggestions for further improvement

Respond in this exact JSON format:
{
  "polishedAnswer": "Your polished version here...",
  "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted, please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response
    let result;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: treat entire response as the polished answer
        result = {
          polishedAnswer: content,
          suggestions: []
        };
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      result = {
        polishedAnswer: content,
        suggestions: []
      };
    }

    console.log("AI coach response generated successfully");

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("AI coach error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
