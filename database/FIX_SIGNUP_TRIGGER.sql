-- Fix for signup trigger issue
-- Run this in Supabase SQL Editor if you're getting 500 errors on signup

-- First, drop and recreate the function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_user_type TEXT;
  v_full_name TEXT;
BEGIN
  -- Extract user_type from metadata, default to 'buyer' if not provided
  v_user_type := COALESCE(NEW.raw_user_meta_data->>'user_type', 'buyer');
  
  -- Validate user_type
  IF v_user_type NOT IN ('buyer', 'seller', 'agent', 'admin') THEN
    v_user_type := 'buyer';
  END IF;
  
  -- Extract full_name from metadata
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'name', '');
  
  -- Ensure email is not empty (required field)
  IF NEW.email IS NULL OR NEW.email = '' THEN
    RAISE EXCEPTION 'Email is required';
  END IF;
  
  -- Insert profile, handle conflict gracefully
  INSERT INTO public.profiles (id, email, full_name, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    v_user_type
  )
  ON CONFLICT (id) DO UPDATE
    SET 
      email = COALESCE(EXCLUDED.email, profiles.email),
      full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name),
      user_type = COALESCE(NULLIF(EXCLUDED.user_type, ''), profiles.user_type);
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, try to update it
    UPDATE public.profiles
    SET 
      email = COALESCE(NEW.email, profiles.email),
      full_name = COALESCE(NULLIF(v_full_name, ''), profiles.full_name),
      user_type = COALESCE(NULLIF(v_user_type, 'buyer'), profiles.user_type)
    WHERE id = NEW.id;
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions (if needed)
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- Ensure the function owner has proper permissions
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

