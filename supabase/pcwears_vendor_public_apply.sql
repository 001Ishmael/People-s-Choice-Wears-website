-- ============================================================================
--  PC Wears Marketplace — allow PUBLIC vendor applications (Phase 1)
--  Lets a not-logged-in visitor submit a vendor application that saves as a
--  'pending', unverified, unlinked row. They still cannot approve or verify
--  themselves — only admin (is_staff) can change those.
--  Safe to run once in the Supabase SQL Editor.
-- ============================================================================

drop policy if exists vendors_public_apply on public.vendors;
create policy vendors_public_apply on public.vendors
  for insert to anon, authenticated
  with check (
    status = 'pending'
    and auth_user_id is null
    and is_verified = false
  );

grant insert on public.vendors to anon;

-- Done.
