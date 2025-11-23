import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Checking grant deadlines...");

    // Get all users with active applications
    const { data: answers } = await supabaseClient
      .from("answers")
      .select(`
        id,
        user_id,
        grant_id,
        grants!inner(
          id,
          name,
          slug,
          deadline
        ),
        profiles!inner(
          email,
          name
        )
      `)
      .not("grants.deadline", "is", null);

    if (!answers || answers.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active applications to check" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    const oneDayFromNow = new Date(today);
    oneDayFromNow.setDate(today.getDate() + 1);

    const notificationsSent = [];
    const processedUsers = new Set<string>();

    for (const answer of answers) {
      const grant = (answer as any).grants;
      const profile = (answer as any).profiles;
      
      if (!grant?.deadline) continue;

      const deadline = new Date(grant.deadline);
      deadline.setHours(0, 0, 0, 0);

      const userId = answer.user_id;
      const userKey = `${userId}_${grant.id}`;

      // Skip if we've already processed this user-grant combination
      if (processedUsers.has(userKey)) continue;
      processedUsers.add(userKey);

      let notificationType = null;
      let daysUntil = 0;

      // Check if deadline matches our notification windows
      if (deadline.getTime() === thirtyDaysFromNow.getTime()) {
        notificationType = "30_days";
        daysUntil = 30;
      } else if (deadline.getTime() === sevenDaysFromNow.getTime()) {
        notificationType = "7_days";
        daysUntil = 7;
      } else if (deadline.getTime() === oneDayFromNow.getTime()) {
        notificationType = "1_day";
        daysUntil = 1;
      }

      if (notificationType) {
        console.log(`Sending ${notificationType} reminder for grant ${grant.name} to user ${userId}`);

        // Create in-app notification
        await supabaseClient.from("notifications").insert({
          user_id: userId,
          type: "deadline_reminder",
          title: `⏰ Grant Deadline ${daysUntil === 1 ? "Tomorrow" : `in ${daysUntil} Days`}`,
          message: `${grant.name} is due ${daysUntil === 1 ? "tomorrow" : `in ${daysUntil} days`}. Make sure to complete your application!`,
          link: `/grants/${grant.slug}/answer`,
        });

        // Send email notification if RESEND_API_KEY is configured
        if (Deno.env.get("RESEND_API_KEY") && profile?.email) {
          try {
            await supabaseClient.functions.invoke("send-notification", {
              body: {
                type: "deadline_reminder",
                userId: userId,
                data: {
                  grantName: grant.name,
                  deadline: new Date(grant.deadline).toLocaleDateString(),
                  daysUntil: daysUntil,
                  grantSlug: grant.slug,
                  userName: profile.name,
                },
                channels: {
                  email: true,
                  sms: false,
                  push: false,
                },
              },
            });
          } catch (emailError) {
            console.error("Error sending email notification:", emailError);
          }
        }

        notificationsSent.push({
          userId,
          grantName: grant.name,
          daysUntil,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        notificationsSent: notificationsSent.length,
        details: notificationsSent,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error checking deadlines:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});