-- ============================================================================
--  PEOPLE'S CHOICE FASHION MARKETPLACE  —  PHASE 1
--  Vendor Marketplace + Fabric Store foundation
--
--  Safe to run once in the Supabase SQL Editor. It is ADDITIVE:
--  it creates new tables only and does not alter products, customers,
--  orders, payments, invoices, receipts, staff, team, etc.
--
--  Reuses your existing helper functions: public.is_staff(), public.is_owner().
--  (They were created in your first setup script.)
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- 1. VENDORS  (linked to a Supabase Auth user)
-- ----------------------------------------------------------------------------
create table if not exists public.vendors (
  id                  uuid primary key default gen_random_uuid(),
  auth_user_id        uuid unique references auth.users(id) on delete cascade,
  business_name       text not null,
  slug                text unique,
  owner_name          text,
  email               text,
  phone               text,
  whatsapp            text,
  location            text,
  business_category   text,
  vendor_type         text not null default 'other'
                       check (vendor_type in ('clothing_brand','boutique','tailor','fashion_designer',
                              'fabric_store','perfume_seller','cosmetics_seller','shoe_seller',
                              'watch_seller','accessories_seller','other')),
  description         text,
  logo_url            text,
  cover_image_url     text,
  status              text not null default 'pending'
                       check (status in ('pending','approved','rejected','suspended')),
  is_verified         boolean not null default false,
  subscription_plan   text not null default 'trial'
                       check (subscription_plan in ('trial','starter','business','premium')),
  subscription_status text not null default 'trial'
                       check (subscription_status in ('active','unpaid','expired','trial')),
  product_limit       integer not null default 5,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 2. VENDOR PRODUCTS
-- ----------------------------------------------------------------------------
create table if not exists public.vendor_products (
  id            uuid primary key default gen_random_uuid(),
  vendor_id     uuid not null references public.vendors(id) on delete cascade,
  name          text not null,
  slug          text,
  description   text,
  category      text,
  subcategory   text,
  price         numeric(14,2) not null default 0,
  currency      text not null default 'SLE',
  stock_quantity integer not null default 0,
  stock_status  text not null default 'available'
                 check (stock_status in ('available','low_stock','out_of_stock')),
  images        text[] not null default '{}',
  sizes         text[] not null default '{}',
  colors        text[] not null default '{}',
  material      text,
  location      text,
  is_featured   boolean not null default false,
  status        text not null default 'pending_review'
                 check (status in ('active','hidden','pending_review','rejected')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 3. FABRIC PRODUCTS
-- ----------------------------------------------------------------------------
create table if not exists public.fabric_products (
  id              uuid primary key default gen_random_uuid(),
  vendor_id       uuid not null references public.vendors(id) on delete cascade,
  fabric_name     text not null,
  slug            text,
  fabric_type     text,
  color           text,
  pattern         text,
  material        text,
  price_per_yard  numeric(14,2),
  price_per_meter numeric(14,2),
  available_yards numeric(14,2) not null default 0,
  available_meters numeric(14,2) not null default 0,
  minimum_order_quantity numeric(14,2) not null default 1,
  fabric_width    text,
  bulk_price      numeric(14,2),
  wholesale_price numeric(14,2),
  retail_price    numeric(14,2),
  delivery_option text,
  pickup_location text,
  images          text[] not null default '{}',
  stock_status    text not null default 'available'
                   check (stock_status in ('available','low_stock','out_of_stock')),
  status          text not null default 'pending_review'
                   check (status in ('active','hidden','pending_review','rejected')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 4. VENDOR INQUIRIES  (public can submit; vendor + admin can read)
-- ----------------------------------------------------------------------------
create table if not exists public.vendor_inquiries (
  id                 uuid primary key default gen_random_uuid(),
  vendor_id          uuid references public.vendors(id) on delete cascade,
  product_id         uuid references public.vendor_products(id) on delete set null,
  fabric_product_id  uuid references public.fabric_products(id) on delete set null,
  customer_name      text,
  customer_phone     text,
  customer_email     text,
  message            text,
  inquiry_type       text not null default 'form'
                      check (inquiry_type in ('whatsapp','phone','email','form','tailoring_request')),
  created_at         timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 5. VENDOR SUBSCRIPTIONS  (records; payment marked by admin)
-- ----------------------------------------------------------------------------
create table if not exists public.vendor_subscriptions (
  id                uuid primary key default gen_random_uuid(),
  vendor_id         uuid not null references public.vendors(id) on delete cascade,
  plan_name         text,
  amount            numeric(14,2) not null default 0,
  currency          text not null default 'SLE',
  start_date        date,
  end_date          date,
  status            text not null default 'unpaid'
                     check (status in ('active','unpaid','expired','trial','cancelled')),
  payment_reference text,
  created_at        timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 6. VENDOR PROMOTIONS  (featured / top-search requests)
-- ----------------------------------------------------------------------------
create table if not exists public.vendor_promotions (
  id                uuid primary key default gen_random_uuid(),
  vendor_id         uuid not null references public.vendors(id) on delete cascade,
  product_id        uuid references public.vendor_products(id) on delete set null,
  fabric_product_id uuid references public.fabric_products(id) on delete set null,
  promotion_type    text not null
                     check (promotion_type in ('homepage_feature','top_search','featured_vendor','featured_fabric')),
  amount            numeric(14,2) not null default 0,
  start_date        date,
  end_date          date,
  status            text not null default 'requested'
                     check (status in ('requested','active','expired','rejected')),
  created_at        timestamptz not null default now()
);

-- ============================================================================
--  INDEXES
-- ============================================================================
create index if not exists idx_vendors_status        on public.vendors(status);
create index if not exists idx_vendors_slug          on public.vendors(slug);
create index if not exists idx_vendors_auth          on public.vendors(auth_user_id);
create index if not exists idx_vendors_type          on public.vendors(vendor_type);
create index if not exists idx_vprod_vendor          on public.vendor_products(vendor_id);
create index if not exists idx_vprod_status          on public.vendor_products(status);
create index if not exists idx_vprod_category        on public.vendor_products(category);
create index if not exists idx_vprod_featured        on public.vendor_products(is_featured);
create index if not exists idx_fab_vendor            on public.fabric_products(vendor_id);
create index if not exists idx_fab_status            on public.fabric_products(status);
create index if not exists idx_fab_type              on public.fabric_products(fabric_type);
create index if not exists idx_inq_vendor            on public.vendor_inquiries(vendor_id);
create index if not exists idx_sub_vendor            on public.vendor_subscriptions(vendor_id);
create index if not exists idx_promo_vendor          on public.vendor_promotions(vendor_id);

-- ============================================================================
--  updated_at triggers (reuse public.set_updated_at from your first script)
-- ============================================================================
do $$
declare t text;
begin
  foreach t in array array['vendors','vendor_products','fabric_products']
  loop
    execute format('drop trigger if exists trg_%1$s_updated on public.%1$s;', t);
    execute format('create trigger trg_%1$s_updated before update on public.%1$s
                    for each row execute function public.set_updated_at();', t);
  end loop;
end $$;

-- ============================================================================
--  HELPER: is the current user the owner of a given vendor row?
-- ============================================================================
create or replace function public.owns_vendor(v_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.vendors v
                 where v.id = v_id and v.auth_user_id = auth.uid());
$$;

-- ============================================================================
--  ROW LEVEL SECURITY
-- ============================================================================
alter table public.vendors             enable row level security;
alter table public.vendor_products     enable row level security;
alter table public.fabric_products     enable row level security;
alter table public.vendor_inquiries    enable row level security;
alter table public.vendor_subscriptions enable row level security;
alter table public.vendor_promotions   enable row level security;

-- ---- VENDORS ----
drop policy if exists vendors_public_read on public.vendors;
drop policy if exists vendors_self_read   on public.vendors;
drop policy if exists vendors_self_insert on public.vendors;
drop policy if exists vendors_self_update on public.vendors;
drop policy if exists vendors_admin_all   on public.vendors;

-- Public sees only approved vendors
create policy vendors_public_read on public.vendors
  for select to anon, authenticated using (status = 'approved');
-- A vendor can read their own row (any status)
create policy vendors_self_read on public.vendors
  for select to authenticated using (auth_user_id = auth.uid());
-- A signed-in user can create their own vendor application
create policy vendors_self_insert on public.vendors
  for insert to authenticated with check (auth_user_id = auth.uid());
-- A vendor can update their own profile (but cannot approve/verify themselves —
-- enforce sensitive fields in the app/admin; RLS allows row ownership here)
create policy vendors_self_update on public.vendors
  for update to authenticated using (auth_user_id = auth.uid()) with check (auth_user_id = auth.uid());
-- Admin/owner full control
create policy vendors_admin_all on public.vendors
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ---- VENDOR PRODUCTS ----
drop policy if exists vprod_public_read on public.vendor_products;
drop policy if exists vprod_owner_all   on public.vendor_products;
drop policy if exists vprod_admin_all   on public.vendor_products;

-- Public sees active products that belong to an approved vendor
create policy vprod_public_read on public.vendor_products
  for select to anon, authenticated using (
    status = 'active' and exists (
      select 1 from public.vendors v where v.id = vendor_products.vendor_id and v.status = 'approved'
    )
  );
-- Vendor manages their own products
create policy vprod_owner_all on public.vendor_products
  for all to authenticated using (public.owns_vendor(vendor_id)) with check (public.owns_vendor(vendor_id));
-- Admin full control
create policy vprod_admin_all on public.vendor_products
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ---- FABRIC PRODUCTS ----
drop policy if exists fab_public_read on public.fabric_products;
drop policy if exists fab_owner_all   on public.fabric_products;
drop policy if exists fab_admin_all   on public.fabric_products;

create policy fab_public_read on public.fabric_products
  for select to anon, authenticated using (
    status = 'active' and exists (
      select 1 from public.vendors v where v.id = fabric_products.vendor_id and v.status = 'approved'
    )
  );
create policy fab_owner_all on public.fabric_products
  for all to authenticated using (public.owns_vendor(vendor_id)) with check (public.owns_vendor(vendor_id));
create policy fab_admin_all on public.fabric_products
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ---- VENDOR INQUIRIES ----
drop policy if exists inq_public_insert on public.vendor_inquiries;
drop policy if exists inq_owner_read    on public.vendor_inquiries;
drop policy if exists inq_admin_all     on public.vendor_inquiries;

-- Anyone may submit an inquiry
create policy inq_public_insert on public.vendor_inquiries
  for insert to anon, authenticated with check (true);
-- The vendor can read inquiries addressed to them
create policy inq_owner_read on public.vendor_inquiries
  for select to authenticated using (public.owns_vendor(vendor_id));
-- Admin full control
create policy inq_admin_all on public.vendor_inquiries
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ---- VENDOR SUBSCRIPTIONS ----
drop policy if exists sub_owner_read on public.vendor_subscriptions;
drop policy if exists sub_admin_all  on public.vendor_subscriptions;
create policy sub_owner_read on public.vendor_subscriptions
  for select to authenticated using (public.owns_vendor(vendor_id));
create policy sub_admin_all on public.vendor_subscriptions
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ---- VENDOR PROMOTIONS ----
drop policy if exists promo_owner_read   on public.vendor_promotions;
drop policy if exists promo_owner_insert on public.vendor_promotions;
drop policy if exists promo_admin_all    on public.vendor_promotions;
create policy promo_owner_read on public.vendor_promotions
  for select to authenticated using (public.owns_vendor(vendor_id));
create policy promo_owner_insert on public.vendor_promotions
  for insert to authenticated with check (public.owns_vendor(vendor_id));
create policy promo_admin_all on public.vendor_promotions
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ============================================================================
--  GRANTS  (RLS still controls rows)
-- ============================================================================
grant usage on schema public to anon, authenticated;
grant select on public.vendors, public.vendor_products, public.fabric_products to anon;
grant insert on public.vendor_inquiries to anon;            -- public inquiry form
grant select, insert, update, delete on
  public.vendors, public.vendor_products, public.fabric_products,
  public.vendor_inquiries, public.vendor_subscriptions, public.vendor_promotions
to authenticated;

-- ============================================================================
--  STORAGE BUCKETS
-- ============================================================================
insert into storage.buckets (id, name, public) values
  ('vendor-logos',     'vendor-logos',     true),
  ('vendor-covers',    'vendor-covers',    true),
  ('vendor-products',  'vendor-products',  true),
  ('fabric-products',  'fabric-products',  true)
on conflict (id) do nothing;

-- Public read for these display buckets
drop policy if exists "pcw market public read" on storage.objects;
create policy "pcw market public read" on storage.objects
  for select using (bucket_id in ('vendor-logos','vendor-covers','vendor-products','fabric-products'));

-- A signed-in vendor (or staff) may upload/manage marketplace images
drop policy if exists "pcw market write" on storage.objects;
create policy "pcw market write" on storage.objects
  for all to authenticated
  using      (bucket_id in ('vendor-logos','vendor-covers','vendor-products','fabric-products'))
  with check (bucket_id in ('vendor-logos','vendor-covers','vendor-products','fabric-products'));

-- Done — Phase 1 schema ready.
