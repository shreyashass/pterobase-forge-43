-- 1) Create a security definer function to check roles without hitting RLS
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- 2) Remove problematic policy that referenced auth.users and caused permission errors
DROP POLICY IF EXISTS "Profiles access policy" ON public.profiles;

-- 3) Create a clear admin read policy using the new helper function
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 4) Add trigger to create profiles automatically on signup (if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- 5) Backfill profiles for any existing auth users missing a profile
INSERT INTO public.profiles (user_id, email, full_name, role)
SELECT u.id,
       u.email,
       COALESCE(u.raw_user_meta_data ->> 'full_name', u.email),
       'user'::public.user_role
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.user_id IS NULL;