-- ============================================================================
--  PC WEARS  ·  People's Choice Wears
--  Complete Supabase setup script
--  Tables · relationships · indexes · RLS policies · storage buckets
--
--  HOW TO USE
--  1. Supabase dashboard -> SQL Editor -> New query.
--  2. Paste this entire file and click "Run". It is safe to run once.
--  3. Create your owner login (see the BOOTSTRAP section at the very bottom).
--
--  Notes
--  - "Staff" are Supabase Auth users listed in the staff table. Their role
--    (owner/manager/sales/tailor/viewer) controls access.
--  - "Customers" may optionally be Auth users too (for the account area); a
--    customer can read only their own records.
--  - Products are publicly readable (for the shop). Everything else is private.
-- ============================================================================

create extension if not exists pgcrypto;        -- gen_random_uuid()

-- ----------------------------------------------------------------------------
-- 0.  Number sequences (PCW-0001 / INV-0001 / RCP-0001)
-- ----------------------------------------------------------------------------
create sequence if not exists public.order_no_seq   start 1;
create sequence if not exists public.invoice_no_seq start 1;
create sequence if not exists public.receipt_no_seq start 1;

-- ----------------------------------------------------------------------------
-- 1.  STAFF  (linked to Supabase Auth users)
-- ----------------------------------------------------------------------------
create table if not exists public.staff (
  id            uuid primary key default gen_random_uuid(),
  auth_user_id  uuid unique references auth.users(id) on delete cascade,
  name          text not null,
  role          text not null default 'viewer'
                 check (role in ('owner','manager','sales','tailor','viewer')),
  phone         text,
  email         text,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 2.  PRODUCTS  (public shop catalogue)
-- ----------------------------------------------------------------------------
create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  category      text,
  price         numeric(14,2) not null default 0,
  description   text,
  sizes         text[]  not null default '{}',
  colors        text[]  not null default '{}',
  stock_status  text not null default 'available'
                 check (stock_status in ('available','sold_out','coming_soon')),
  stock_qty     integer not null default 0,
  featured      boolean not null default false,
  new_arrival   boolean not null default false,
  best_seller   boolean not null default false,
  image_url     text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 3.  CUSTOMERS
-- ----------------------------------------------------------------------------
create table if not exists public.customers (
  id            uuid primary key default gen_random_uuid(),
  auth_user_id  uuid references auth.users(id) on delete set null,  -- optional self-service
  name          text not null,
  phone         text not null,
  email         text,
  address       text,
  gender        text check (gender in ('Male','Female','Other')),
  note          text,
  created_by    uuid references public.staff(id) on delete set null,
  created_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 4.  MEASUREMENTS  (one customer may have several over time)
-- ----------------------------------------------------------------------------
create table if not exists public.measurements (
  id              uuid primary key default gen_random_uuid(),
  customer_id     uuid not null references public.customers(id) on delete cascade,
  gender          text check (gender in ('Male','Female','Other')),
  unit            text not null default 'inches',
  shoulder        numeric(8,2),
  chest           numeric(8,2),
  bust            numeric(8,2),
  waist           numeric(8,2),
  hip             numeric(8,2),
  sleeve_length   numeric(8,2),
  top_length      numeric(8,2),
  dress_length    numeric(8,2),
  blouse_length   numeric(8,2),
  skirt_length    numeric(8,2),
  trouser_waist   numeric(8,2),
  trouser_length  numeric(8,2),
  thigh           numeric(8,2),
  neck            numeric(8,2),
  cap_size        text,
  extra_note      text,
  reference_image_url text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 5.  ORDERS
-- ----------------------------------------------------------------------------
create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  order_no        text unique not null
                   default ('PCW-' || lpad(nextval('public.order_no_seq')::text, 4, '0')),
  customer_id     uuid references public.customers(id) on delete set null,
  customer_name   text not null,
  customer_phone  text,
  product_id      uuid references public.products(id) on delete set null,
  category        text,
  product         text not null,             -- outfit / product / style description
  style_name      text,
  fabric_type     text,
  fabric_color    text,
  quantity        integer not null default 1,
  unit_price      numeric(14,2) not null default 0,
  discount        numeric(14,2) not null default 0,
  total           numeric(14,2)
                   generated always as
                   (greatest(0, (coalesce(unit_price,0) * coalesce(quantity,1)) - coalesce(discount,0)))
                   stored,
  status          text not null default 'pending'
                   check (status in ('pending','in_progress','ready','delivered','cancelled')),
  fulfilment      text not null default 'delivery'
                   check (fulfilment in ('delivery','pickup')),
  delivery_date   date,
  assigned_tailor text,
  tailor_id       uuid references public.staff(id) on delete set null,
  instructions    text,
  reference_image_url text,
  source          text,                       -- e.g. 'dashboard', 'custom-form'
  created_by      uuid references public.staff(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 6.  INVENTORY  (fabric / materials stock)
-- ----------------------------------------------------------------------------
create table if not exists public.inventory (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  color         text,
  unit          text not null default 'yards',
  quantity      numeric(14,2) not null default 0,
  reorder_level numeric(14,2) not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- 6b. Stock movements (in / out) — out movements are created when materials
--     are used on a custom order.
create table if not exists public.inventory_movements (
  id            uuid primary key default gen_random_uuid(),
  inventory_id  uuid references public.inventory(id) on delete set null,
  item_name     text,
  movement_type text not null check (movement_type in ('in','out')),
  quantity      numeric(14,2) not null default 0,
  reason        text,
  order_id      uuid references public.orders(id) on delete set null,
  staff_id      uuid references public.staff(id) on delete set null,
  created_at    timestamptz not null default now()
);

-- 6c. Materials used per order (links an order to fabric consumption)
create table if not exists public.order_materials (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  inventory_id  uuid references public.inventory(id) on delete set null,
  name          text,
  quantity      numeric(14,2) not null default 0,
  deducted      boolean not null default false,
  created_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 7.  PAYMENTS
-- ----------------------------------------------------------------------------
create table if not exists public.payments (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  amount        numeric(14,2) not null default 0,
  payment_type  text check (payment_type in
                 ('Full Payment','Half Payment','Deposit','Balance Payment')),
  method        text check (method in
                 ('Cash','Orange Money','Afrimoney','Bank Transfer','Other')),
  received_by   uuid references public.staff(id) on delete set null,
  received_by_name text,
  note          text,
  paid_at       date not null default current_date,
  created_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 8.  INVOICES
-- ----------------------------------------------------------------------------
create table if not exists public.invoices (
  id            uuid primary key default gen_random_uuid(),
  invoice_no    text unique not null
                 default ('INV-' || lpad(nextval('public.invoice_no_seq')::text, 4, '0')),
  order_id      uuid not null references public.orders(id) on delete cascade,
  total         numeric(14,2) not null default 0,
  notes         text,
  issued_by     uuid references public.staff(id) on delete set null,
  issued_at     timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 9.  RECEIPTS
-- ----------------------------------------------------------------------------
create table if not exists public.receipts (
  id            uuid primary key default gen_random_uuid(),
  receipt_no    text unique not null
                 default ('RCP-' || lpad(nextval('public.receipt_no_seq')::text, 4, '0')),
  order_id      uuid not null references public.orders(id) on delete cascade,
  payment_id    uuid references public.payments(id) on delete set null,
  amount        numeric(14,2) not null default 0,
  notes         text,
  issued_by     uuid references public.staff(id) on delete set null,
  issued_at     timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 10. DELIVERY RECORDS
-- ----------------------------------------------------------------------------
create table if not exists public.delivery_records (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references public.orders(id) on delete cascade,
  method          text not null default 'delivery'
                   check (method in ('delivery','pickup')),
  address         text,
  status          text not null default 'scheduled'
                   check (status in ('scheduled','out_for_delivery','delivered','picked_up','failed','cancelled')),
  scheduled_date  date,
  delivered_at    timestamptz,
  handled_by      uuid references public.staff(id) on delete set null,
  courier         text,
  fee             numeric(14,2) not null default 0,
  note            text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================================
--  INDEXES
-- ============================================================================
create index if not exists idx_staff_auth         on public.staff(auth_user_id);
create index if not exists idx_customers_phone     on public.customers(phone);
create index if not exists idx_customers_auth      on public.customers(auth_user_id);
create index if not exists idx_customers_name      on public.customers(lower(name));
create index if not exists idx_measure_customer    on public.measurements(customer_id);
create index if not exists idx_products_category   on public.products(category);
create index if not exists idx_products_flags      on public.products(featured, new_arrival, best_seller);
create index if not exists idx_orders_customer     on public.orders(customer_id);
create index if not exists idx_orders_status       on public.orders(status);
create index if not exists idx_orders_created      on public.orders(created_at);
create index if not exists idx_orders_delivery     on public.orders(delivery_date);
create index if not exists idx_orders_no           on public.orders(order_no);
create index if not exists idx_payments_order      on public.payments(order_id);
create index if not exists idx_payments_paid_at    on public.payments(paid_at);
create index if not exists idx_invoices_order      on public.invoices(order_id);
create index if not exists idx_receipts_order      on public.receipts(order_id);
create index if not exists idx_invmov_inventory    on public.inventory_movements(inventory_id);
create index if not exists idx_invmov_order        on public.inventory_movements(order_id);
create index if not exists idx_ordermat_order      on public.order_materials(order_id);
create index if not exists idx_delivery_order      on public.delivery_records(order_id);
create index if not exists idx_delivery_status     on public.delivery_records(status);

-- ============================================================================
--  updated_at trigger
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['products','measurements','orders','inventory','delivery_records']
  loop
    execute format('drop trigger if exists trg_%1$s_updated on public.%1$s;', t);
    execute format('create trigger trg_%1$s_updated before update on public.%1$s
                    for each row execute function public.set_updated_at();', t);
  end loop;
end $$;

-- ============================================================================
--  HELPER FUNCTIONS  (SECURITY DEFINER so they bypass RLS safely)
-- ============================================================================
create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.staff s
    where s.auth_user_id = auth.uid() and s.active
  );
$$;

create or replace function public.current_staff_role()
returns text language sql stable security definer set search_path = public as $$
  select s.role from public.staff s
  where s.auth_user_id = auth.uid() and s.active
  limit 1;
$$;

create or replace function public.is_owner()
returns boolean language sql stable security definer set search_path = public as $$
  select public.current_staff_role() = 'owner';
$$;

create or replace function public.is_manager_plus()
returns boolean language sql stable security definer set search_path = public as $$
  select public.current_staff_role() in ('owner','manager');
$$;

-- Used by the bootstrap policy: how many staff rows exist (bypasses RLS)
create or replace function public.staff_count()
returns integer language sql stable security definer set search_path = public as $$
  select count(*)::int from public.staff;
$$;

-- ============================================================================
--  ENABLE ROW LEVEL SECURITY
-- ============================================================================
alter table public.staff               enable row level security;
alter table public.products            enable row level security;
alter table public.customers           enable row level security;
alter table public.measurements        enable row level security;
alter table public.orders              enable row level security;
alter table public.inventory           enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.order_materials     enable row level security;
alter table public.payments            enable row level security;
alter table public.invoices            enable row level security;
alter table public.receipts            enable row level security;
alter table public.delivery_records    enable row level security;

-- ============================================================================
--  RLS POLICIES
-- ============================================================================

-- ---- STAFF ----------------------------------------------------------------
drop policy if exists staff_self_select   on public.staff;
drop policy if exists staff_owner_select  on public.staff;
drop policy if exists staff_owner_write   on public.staff;
drop policy if exists staff_bootstrap_ins on public.staff;

-- Each staff member can read their own row (to learn their role)
create policy staff_self_select on public.staff
  for select to authenticated using (auth_user_id = auth.uid());

-- Owners can read every staff row
create policy staff_owner_select on public.staff
  for select to authenticated using (public.is_owner());

-- Owners can create / edit / delete staff
create policy staff_owner_write on public.staff
  for all to authenticated using (public.is_owner()) with check (public.is_owner());

-- Bootstrap: when there are NO staff yet, an authenticated user may insert
-- themselves (this lets you create the very first owner). See BOOTSTRAP below.
create policy staff_bootstrap_ins on public.staff
  for insert to authenticated
  with check (auth_user_id = auth.uid() and public.staff_count() = 0);

-- ---- PRODUCTS (public read, staff write) ----------------------------------
drop policy if exists products_public_read on public.products;
drop policy if exists products_staff_write on public.products;

create policy products_public_read on public.products
  for select to anon, authenticated using (true);

create policy products_staff_write on public.products
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ---- CUSTOMERS ------------------------------------------------------------
drop policy if exists customers_staff_all   on public.customers;
drop policy if exists customers_self_select on public.customers;
drop policy if exists customers_self_upsert on public.customers;

create policy customers_staff_all on public.customers
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- A signed-in customer can read and maintain their own record
create policy customers_self_select on public.customers
  for select to authenticated using (auth_user_id = auth.uid());
create policy customers_self_upsert on public.customers
  for insert to authenticated with check (auth_user_id = auth.uid());

-- ---- MEASUREMENTS ---------------------------------------------------------
drop policy if exists measure_staff_all   on public.measurements;
drop policy if exists measure_self_select on public.measurements;

create policy measure_staff_all on public.measurements
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy measure_self_select on public.measurements
  for select to authenticated using (
    exists (select 1 from public.customers c
            where c.id = measurements.customer_id and c.auth_user_id = auth.uid())
  );

-- ---- ORDERS ---------------------------------------------------------------
drop policy if exists orders_staff_all   on public.orders;
drop policy if exists orders_self_select on public.orders;

create policy orders_staff_all on public.orders
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy orders_self_select on public.orders
  for select to authenticated using (
    exists (select 1 from public.customers c
            where c.id = orders.customer_id and c.auth_user_id = auth.uid())
  );

-- ---- INVENTORY + MOVEMENTS + ORDER MATERIALS (staff only) -----------------
drop policy if exists inventory_staff_all on public.inventory;
create policy inventory_staff_all on public.inventory
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists invmov_staff_all on public.inventory_movements;
create policy invmov_staff_all on public.inventory_movements
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists ordermat_staff_all on public.order_materials;
create policy ordermat_staff_all on public.order_materials
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ---- PAYMENTS -------------------------------------------------------------
drop policy if exists payments_staff_all   on public.payments;
drop policy if exists payments_self_select on public.payments;

create policy payments_staff_all on public.payments
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy payments_self_select on public.payments
  for select to authenticated using (
    exists (select 1 from public.orders o join public.customers c on c.id = o.customer_id
            where o.id = payments.order_id and c.auth_user_id = auth.uid())
  );

-- ---- INVOICES -------------------------------------------------------------
drop policy if exists invoices_staff_all   on public.invoices;
drop policy if exists invoices_self_select on public.invoices;

create policy invoices_staff_all on public.invoices
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy invoices_self_select on public.invoices
  for select to authenticated using (
    exists (select 1 from public.orders o join public.customers c on c.id = o.customer_id
            where o.id = invoices.order_id and c.auth_user_id = auth.uid())
  );

-- ---- RECEIPTS -------------------------------------------------------------
drop policy if exists receipts_staff_all   on public.receipts;
drop policy if exists receipts_self_select on public.receipts;

create policy receipts_staff_all on public.receipts
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy receipts_self_select on public.receipts
  for select to authenticated using (
    exists (select 1 from public.orders o join public.customers c on c.id = o.customer_id
            where o.id = receipts.order_id and c.auth_user_id = auth.uid())
  );

-- ---- DELIVERY RECORDS -----------------------------------------------------
drop policy if exists delivery_staff_all   on public.delivery_records;
drop policy if exists delivery_self_select on public.delivery_records;

create policy delivery_staff_all on public.delivery_records
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy delivery_self_select on public.delivery_records
  for select to authenticated using (
    exists (select 1 from public.orders o join public.customers c on c.id = o.customer_id
            where o.id = delivery_records.order_id and c.auth_user_id = auth.uid())
  );

-- ============================================================================
--  GRANTS  (table-level; RLS still controls which rows are visible)
-- ============================================================================
grant usage on schema public to anon, authenticated;

grant select on public.products to anon;

grant select, insert, update, delete on
  public.staff, public.products, public.customers, public.measurements,
  public.orders, public.inventory, public.inventory_movements,
  public.order_materials, public.payments, public.invoices,
  public.receipts, public.delivery_records
to authenticated;

grant usage, select on all sequences in schema public to authenticated;

-- ============================================================================
--  CONVENIENCE VIEW: order balances & payment status
--  (security_invoker keeps each caller's RLS in force)
-- ============================================================================
create or replace view public.order_summaries
with (security_invoker = true) as
select
  o.id,
  o.order_no,
  o.customer_name,
  o.status,
  o.total,
  coalesce(p.paid, 0)                          as amount_paid,
  greatest(0, o.total - coalesce(p.paid, 0))   as balance,
  case
    when o.total > 0 and coalesce(p.paid,0) >= o.total then 'Paid'
    when coalesce(p.paid,0) > 0 and coalesce(p.paid,0) >= o.total/2.0 then 'Part Payment'
    when coalesce(p.paid,0) > 0 then 'Deposit'
    else 'Unpaid'
  end as payment_status
from public.orders o
left join (
  select order_id, sum(amount) as paid
  from public.payments group by order_id
) p on p.order_id = o.id;

grant select on public.order_summaries to authenticated;

-- ============================================================================
--  STORAGE BUCKETS
--   product-images / staff-photos  -> public read
--   customer-files / order-files   -> private (staff only)
-- ============================================================================
insert into storage.buckets (id, name, public) values
  ('product-images','product-images', true),
  ('staff-photos',  'staff-photos',   true),
  ('customer-files','customer-files', false),
  ('order-files',   'order-files',    false)
on conflict (id) do nothing;

-- Storage policies
drop policy if exists "pcw public read"  on storage.objects;
drop policy if exists "pcw staff manage" on storage.objects;

-- Anyone may read the public buckets (so product & team images show on the site)
create policy "pcw public read" on storage.objects
  for select using (bucket_id in ('product-images','staff-photos'));

-- Staff may upload / read / change / delete files in all PC Wears buckets
create policy "pcw staff manage" on storage.objects
  for all to authenticated
  using      (bucket_id in ('product-images','staff-photos','customer-files','order-files') and public.is_staff())
  with check (bucket_id in ('product-images','staff-photos','customer-files','order-files') and public.is_staff());

-- ============================================================================
--  BOOTSTRAP — create your first OWNER (run once, after you have an Auth user)
--  ----------------------------------------------------------------------------
--  Step 1: In Supabase, go to Authentication -> Users -> Add user, and create
--          the owner's account (email + password). Copy that user's UUID.
--  Step 2: Either (a) sign in as that user in your app and let it insert the
--          staff row via the bootstrap policy, OR (b) uncomment and run the
--          line below with the real UUID (the SQL Editor bypasses RLS):
--
--  insert into public.staff (auth_user_id, name, role)
--  values ('PASTE-OWNER-AUTH-UUID-HERE', 'Mohamed Ishmael Fofanah', 'owner');
--
--  After the first owner exists, add other staff from the dashboard Staff tab
--  (or insert more rows here, setting role to manager / sales / tailor / viewer).
-- ============================================================================

-- Done.
