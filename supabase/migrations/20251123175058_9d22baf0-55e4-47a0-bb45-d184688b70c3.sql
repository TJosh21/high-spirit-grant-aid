-- Set up cron job to run grant matching for new grants daily
SELECT cron.schedule(
  'match-new-grants-daily',
  '0 10 * * *',  -- Run at 10:00 AM UTC daily
  $$
  SELECT
    net.http_post(
      url:='https://gosszudhblnahkxlcuqq.supabase.co/functions/v1/match-grants-for-users',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
      body:=concat('{"grantId": "', grant_id::text, '"}')::jsonb
    ) AS request_id
  FROM grants
  WHERE created_at >= CURRENT_DATE - INTERVAL '1 day'
    AND status = 'open';
  $$
);