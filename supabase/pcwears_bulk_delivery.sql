-- ============================================================================
--  PC WEARS — BULK ORDERS  +  DELIVERY ZONES
--  Two practical features for PC Wears' own business.
--  Safe to run once in the Supabase SQL Editor. Additive — touches nothing else.
--  Reuses your existing public.is_staff() helper.
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- 1. BULK / CORPORATE ORDER REQUESTS  (public submits; staff manage)
-- ----------------------------------------------------------------------------
create table if not exists public.bulk_order_requests (
  id                  uuid primary key default gen_random_uuid(),
  organization_name   text not null,
  contact_person      text,
  phone               text not null,
  email               text,
  order_type          text,                 -- e.g. uniforms, corporate wear, event
  quantity            integer,
  deadline            date,
  budget              numeric(14,2),
  notes               text,
  reference_image_url text,
  status              text not null default 'new'
                       check (status in ('new','in_review','quoted','approved','completed','cancelled')),
  created_at          timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 2. DELIVERY ZONES  (public reads active zones + fees; staff manage)
-- ----------------------------------------------------------------------------
create table if not exists public.delivery_zones (
  id             uuid primary key default gen_random_uuid(),
  zone_name      text not null,
  delivery_fee   numeric(14,2) not null default 0,
  estimated_time text,                       -- e.g. "Same day", "1-2 days"
  note           text,
  sort_order     integer not null default 0,
  status         text not null default 'active'
                  check (status in ('active','hidden')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Indexes
-- ----------------------------------------------------------------------------
create index if not exists idx_bulk_status      on public.bulk_order_requests(status);
create index if not exists idx_bulk_created      on public.bulk_order_requests(created_at);
create index if not exists idx_zones_status      on public.delivery_zones(status, sort_order);

-- ----------------------------------------------------------------------------
-- updated_at trigger for zones (reuses public.set_updated_at)
-- ----------------------------------------------------------------------------
drop trigger if exists trg_zones_updated on public.delivery_zones;
create trigger trg_zones_updated before update on public.delivery_zones
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Row level security
-- ----------------------------------------------------------------------------
alter table public.bulk_order_requests enable row level security;
alter table public.delivery_zones      enable row level security;

-- Bulk orders: anyone can submit; only staff read/manage
drop policy if exists bulk_public_insert on public.bulk_order_requests;
drop policy if exists bulk_staff_all     on public.bulk_order_requests;
create policy bulk_public_insert on public.bulk_order_requests
  for insert to anon, authenticated with check (true);
create policy bulk_staff_all on public.bulk_order_requests
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- Delivery zones: public reads ACTIVE zones; staff manage everything
drop policy if exists zones_public_read on public.delivery_zones;
drop policy if exists zones_staff_all   on public.delivery_zones;
create policy zones_public_read on public.delivery_zones
  for select to anon, authenticated using (status = 'active');
create policy zones_staff_all on public.delivery_zones
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ----------------------------------------------------------------------------
-- Grants  (RLS still controls rows)
-- ----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant insert on public.bulk_order_requests to anon;
grant select on public.delivery_zones to anon;
grant select, insert, update, delete on
  public.bulk_order_requests, public.delivery_zones
to authenticated;

-- ----------------------------------------------------------------------------
-- Storage bucket for bulk-order reference images (public)
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public) values ('bulk-order-files','bulk-order-files', true)
on conflict (id) do nothing;

drop policy if exists "pcw bulk read"  on storage.objects;
drop policy if exists "pcw bulk write" on storage.objects;
create policy "pcw bulk read" on storage.objects
  for select using (bucket_id = 'bulk-order-files');
create policy "pcw bulk write" on storage.objects
  for insert to anon, authenticated with check (bucket_id = 'bulk-order-files');

-- ----------------------------------------------------------------------------
-- Seed a few starter delivery zones (only if the table is empty) — edit later
-- ----------------------------------------------------------------------------
insert into public.delivery_zones (zone_name, delivery_fee, estimated_time, sort_order)
select * from (values
  ('Central Freetown', 30, 'Same day', 1),
  ('Greater Freetown', 50, '1-2 days', 2),
  ('Outside Freetown', 100, '2-4 days', 3),
  ('Pickup at 25 Sanders Street', 0, 'Ready when notified', 0)
) as z(zone_name, delivery_fee, estimated_time, sort_order)
where not exists (select 1 from public.delivery_zones);

-- Done.
