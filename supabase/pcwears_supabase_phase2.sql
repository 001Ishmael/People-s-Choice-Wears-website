-- ============================================================================
--  PC WEARS  ·  Supabase setup — PHASE 2 (additional tables)
--  Adds: team, blog_posts, expenses, investors  (+ a team-photos bucket)
--  Customer accounts now use Supabase Auth + the existing customers table,
--  so no separate "accounts" table is needed.
--
--  Run this once in the Supabase SQL Editor (after the first setup script).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- TEAM  (public "Meet Our Team" profiles)
-- ----------------------------------------------------------------------------
create table if not exists public.team (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  role        text not null,
  bio         text,
  phone       text,
  email       text,
  social      text,
  image_url   text,
  active      boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- BLOG POSTS  (public)
-- ----------------------------------------------------------------------------
create table if not exists public.blog_posts (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  post_date   date not null default current_date,
  cover       text,                      -- emoji or short label
  excerpt     text,
  body        text,
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- EXPENSES  (staff only)
-- ----------------------------------------------------------------------------
create table if not exists public.expenses (
  id          uuid primary key default gen_random_uuid(),
  expense_date date not null default current_date,
  category    text,
  amount      numeric(14,2) not null default 0,
  note        text,
  created_by  uuid references public.staff(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- INVESTORS  (internal ledger; staff only). Payouts kept as JSON.
-- ----------------------------------------------------------------------------
create table if not exists public.investors (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  phone       text,
  principal   numeric(14,2) not null default 0,
  rate        numeric(6,2) not null default 0,   -- informational only
  start_date  date,
  note        text,
  payouts     jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Indexes
-- ----------------------------------------------------------------------------
create index if not exists idx_team_active     on public.team(active, sort_order);
create index if not exists idx_blog_date       on public.blog_posts(post_date);
create index if not exists idx_expenses_date   on public.expenses(expense_date);
create index if not exists idx_investors_name  on public.investors(name);

-- ----------------------------------------------------------------------------
-- Row level security
-- ----------------------------------------------------------------------------
alter table public.team        enable row level security;
alter table public.blog_posts  enable row level security;
alter table public.expenses    enable row level security;
alter table public.investors   enable row level security;

-- TEAM: public can read; staff manage
drop policy if exists team_public_read on public.team;
drop policy if exists team_staff_write on public.team;
create policy team_public_read on public.team for select to anon, authenticated using (true);
create policy team_staff_write on public.team for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- BLOG: public can read; staff manage
drop policy if exists blog_public_read on public.blog_posts;
drop policy if exists blog_staff_write on public.blog_posts;
create policy blog_public_read on public.blog_posts for select to anon, authenticated using (true);
create policy blog_staff_write on public.blog_posts for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- EXPENSES: staff only
drop policy if exists expenses_staff_all on public.expenses;
create policy expenses_staff_all on public.expenses for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- INVESTORS: staff only
drop policy if exists investors_staff_all on public.investors;
create policy investors_staff_all on public.investors for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ----------------------------------------------------------------------------
-- Grants
-- ----------------------------------------------------------------------------
grant select on public.team to anon;
grant select on public.blog_posts to anon;
grant select, insert, update, delete on
  public.team, public.blog_posts, public.expenses, public.investors
to authenticated;

-- ----------------------------------------------------------------------------
-- Storage bucket for team photos (public)
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public) values ('team-photos','team-photos', true)
on conflict (id) do nothing;

drop policy if exists "pcw team read" on storage.objects;
create policy "pcw team read" on storage.objects for select using (bucket_id = 'team-photos');
-- (the existing "pcw staff manage" policy already covers writes if you add
--  'team-photos' to its bucket list; or add a dedicated write policy:)
drop policy if exists "pcw team write" on storage.objects;
create policy "pcw team write" on storage.objects for all to authenticated
  using (bucket_id = 'team-photos' and public.is_staff())
  with check (bucket_id = 'team-photos' and public.is_staff());

-- ----------------------------------------------------------------------------
-- Seed the Team page (only if empty) so it isn't blank on launch
-- ----------------------------------------------------------------------------
insert into public.team (name, role, bio, sort_order, active)
select * from (values
  ('Mohamed Ishmael Fofanah','Founder & CEO','Visionary founder of PC Wears and the People''s Choice brand, leading innovation, fashion, technology, and business growth.',1,true),
  ('Mr Michael Kamara','Head Fashion Designer','Leads the creative fashion design process, tailoring quality, custom outfit development, and production standards.',2,true),
  ('Mr Lamin Bangura','Manager','Supports business operations, customer coordination, order management, production follow-up, and daily workflow.',3,true),
  ('Madam Haja Fatmata Fofanah','Manager','Supports customer service, sales coordination, staff supervision, and business record keeping.',4,true)
) as t(name,role,bio,sort_order,active)
where not exists (select 1 from public.team);

-- ----------------------------------------------------------------------------
-- Seed a few blog posts (only if empty)
-- ----------------------------------------------------------------------------
insert into public.blog_posts (title, post_date, cover, excerpt, body)
select * from (values
  ('5 Ways to Style an Africana Set for Any Occasion', date '2026-05-20', '🧵',
   'One great Africana set can take you from church to a wedding to the office. Here''s how to restyle it five ways.',
   'A well-tailored Africana set is the most versatile piece in your wardrobe. Start with a clean, structured cut in a neutral base like black, cream or navy so it pairs with everything.'),
  ('Choosing Colors That Flatter Your Skin Tone', date '2026-05-05', '🎨',
   'Gold, emerald, deep navy or wine? A simple guide to the shades that make rich skin tones glow.',
   'Color is the fastest way to elevate an outfit. For deep and warm skin tones, jewel shades like emerald, royal blue, wine and mustard create a striking, luxurious contrast.'),
  ('Caring for Your Human Hair Wig', date '2026-04-18', '💁🏾‍♀️',
   'Keep your wig looking salon-fresh for longer with these simple care habits.',
   'A quality human-hair wig is an investment, and a little care keeps it gorgeous for months. Wash gently, condition from mid-length to ends, and store it on a stand.')
) as b(title,post_date,cover,excerpt,body)
where not exists (select 1 from public.blog_posts);

-- Done.
