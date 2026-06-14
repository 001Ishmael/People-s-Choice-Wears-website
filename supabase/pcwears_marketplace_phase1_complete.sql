-- ============================================================================
--  PC Wears Marketplace — PHASE 1 completion helpers
--  Run once in the Supabase SQL Editor. Additive and safe.
--
--  1) claim_vendor(): links a signed-in Auth user to their pending vendor
--     application (matched by email). Lets vendors create a login after they
--     applied, without needing email confirmation.
--  2) lets a vendor create their own (unpaid) subscription upgrade request.
-- ============================================================================

-- 1) Link the current Auth user to their vendor row by email -----------------
create or replace function public.claim_vendor(p_email text)
returns public.vendors
language plpgsql
security definer
set search_path = public
as $$
declare v public.vendors;
begin
  -- only link a row that has no owner yet, matched on email
  update public.vendors
     set auth_user_id = auth.uid()
   where lower(email) = lower(p_email)
     and auth_user_id is null
  returning * into v;

  -- if already linked to this user, just return it
  if v.id is null then
    select * into v from public.vendors where auth_user_id = auth.uid() limit 1;
  end if;

  return v;
end;
$$;

grant execute on function public.claim_vendor(text) to authenticated;

-- 2) Vendor may submit their own subscription upgrade request -----------------
drop policy if exists sub_owner_insert on public.vendor_subscriptions;
create policy sub_owner_insert on public.vendor_subscriptions
  for insert to authenticated
  with check (public.owns_vendor(vendor_id) and status = 'unpaid');

-- Done.
