-- 1) Create a security definer function to check roles without hitting RLS
create or replace function public.has_role(_user_id uuid, _role public.user_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where user_id = _user_id
      and role = _role
  );
$$;

-- 2) Remove problematic policy that referenced auth.users and caused permission errors
DROP POLICY IF EXISTS "Profiles access policy" ON public.profiles;

-- 3) Ensure users can still view their own profile (already present, keep existing)
-- Create a clear admin read policy using the new helper
CREATE POLICY IF NOT EXISTS "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 4) Add trigger to create profiles automatically on signup (only if it doesn't already exist)
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