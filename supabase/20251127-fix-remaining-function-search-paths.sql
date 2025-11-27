-- Fix remaining SECURITY DEFINER functions to have search_path set
-- This prevents search_path manipulation attacks

-- Function: handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$function$;

-- Function: delete_user_completely
CREATE OR REPLACE FUNCTION public.delete_user_completely(user_email text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  user_uuid UUID;
  result JSONB;
BEGIN
  -- Find user by email
  SELECT id INTO user_uuid
  FROM profiles
  WHERE email = user_email;

  IF user_uuid IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'User not found'
    );
  END IF;

  -- Delete user data (cascade will handle related records)
  DELETE FROM learned_words WHERE user_id = user_uuid;
  DELETE FROM quiz_results WHERE user_id = user_uuid;
  DELETE FROM progress WHERE user_id = user_uuid;
  DELETE FROM profiles WHERE id = user_uuid;

  -- Note: Deleting from auth.users requires service role key
  -- This will be handled in the API layer with admin client

  RETURN jsonb_build_object(
    'success', true,
    'message', 'User data deleted',
    'user_id', user_uuid
  );
END;
$function$;

-- Function: clear_user_progress
CREATE OR REPLACE FUNCTION public.clear_user_progress(user_email text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  user_uuid UUID;
  deleted_progress INTEGER;
  deleted_learned INTEGER;
  deleted_quizzes INTEGER;
BEGIN
  -- Find user by email
  SELECT id INTO user_uuid
  FROM profiles
  WHERE email = user_email;

  IF user_uuid IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'User not found'
    );
  END IF;

  -- Clear progress data
  DELETE FROM learned_words WHERE user_id = user_uuid;
  GET DIAGNOSTICS deleted_learned = ROW_COUNT;

  DELETE FROM quiz_results WHERE user_id = user_uuid;
  GET DIAGNOSTICS deleted_quizzes = ROW_COUNT;

  DELETE FROM progress WHERE user_id = user_uuid;
  GET DIAGNOSTICS deleted_progress = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Progress cleared',
    'deleted_lessons', deleted_progress,
    'deleted_words', deleted_learned,
    'deleted_quizzes', deleted_quizzes
  );
END;
$function$;
