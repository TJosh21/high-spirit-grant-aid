-- Create function to send notification for new user registration
CREATE OR REPLACE FUNCTION notify_new_user_registration()
RETURNS TRIGGER AS $$
BEGIN
  -- This will be called by the application layer
  -- The trigger just ensures we have a hook point
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user registration
CREATE TRIGGER on_user_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_user_registration();

-- Create function to send notification for new grant creation
CREATE OR REPLACE FUNCTION notify_new_grant_created()
RETURNS TRIGGER AS $$
BEGIN
  -- This will be called by the application layer
  -- The trigger just ensures we have a hook point
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new grant creation
CREATE TRIGGER on_grant_created
  AFTER INSERT ON grants
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_grant_created();
