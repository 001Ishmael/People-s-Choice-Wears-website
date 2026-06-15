-- ============================================================================
--  PC WEARS — FASHION CLASSES  (practical feature for PC Wears' own training)
--  Two tables: fashion_classes (what you offer) and
--  fashion_class_registrations (who signed up).
--  Safe to run once in the Supabase SQL Editor. Additive — touches nothing else.
--  Reuses your existing public.is_staff() helper.
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- 1. FASHION CLASSES  (public can read active ones; staff manage)
-- ----------------------------------------------------------------------------
create table if not exists public.fashion_classes (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  slug            text,
  description     text,
  level           text default 'beginner'
                   check (level in ('beginner','intermediate','advanced','all_levels')),
  duration        text,
  price           numeric(14,2) not null default 0,
  currency        text not null default 'SLE',
  start_date      date,
  end_date        date,
  location        text,
  is_online       boolean not null default false,
  instructor_name text,
  image_url       text,
  capacity        integer,
  status          text not null default 'active'
                   check (status in ('active','hidden','completed')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 2. CLASS REGISTRATIONS  (public can submit; staff manage)
-- ----------------------------------------------------------------------------
create table if not exists public.fashion_class_registrations (
  id               uuid primary key default gen_random_uuid(),
  class_id         uuid references public.fashion_classes(id) on delete set null,
  class_title      text,                         -- snapshot, so it survives class deletion
  student_name     text not null,
  phone            text not null,
  whatsapp         text,
  email            text,
  experience_level text,
  payment_status   text not null default 'unpaid'
                    check (payment_status in ('unpaid','deposit','paid')),
  amount_paid      numeric(14,2) not null default 0,
  message          text,
  created_at       timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Indexes
-- ----------------------------------------------------------------------------
create index if not exists idx_classes_status   on public.fashion_classes(status);
create index if not exists idx_classes_start     on public.fashion_classes(start_date);
create index if not exists idx_classreg_class    on public.fashion_class_registrations(class_id);
create index if not exists idx_classreg_created  on public.fashion_class_registrations(created_at);

-- ----------------------------------------------------------------------------
-- updated_at trigger (reuses public.set_updated_at from your first setup)
-- ----------------------------------------------------------------------------
drop trigger if exists trg_classes_updated on public.fashion_classes;
create trigger trg_classes_updated before update on public.fashion_classes
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Row level security
-- ----------------------------------------------------------------------------
alter table public.fashion_classes              enable row level security;
alter table public.fashion_class_registrations  enable row level security;

-- Classes: public reads ACTIVE classes; staff manage everything
drop policy if exists classes_public_read on public.fashion_classes;
drop policy if exists classes_staff_all   on public.fashion_classes;
create policy classes_public_read on public.fashion_classes
  for select to anon, authenticated using (status = 'active');
create policy classes_staff_all on public.fashion_classes
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- Registrations: anyone can submit; only staff can read/manage
drop policy if exists classreg_public_insert on public.fashion_class_registrations;
drop policy if exists classreg_staff_all     on public.fashion_class_registrations;
create policy classreg_public_insert on public.fashion_class_registrations
  for insert to anon, authenticated with check (true);
create policy classreg_staff_all on public.fashion_class_registrations
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ----------------------------------------------------------------------------
-- Grants  (RLS still controls rows)
-- ----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.fashion_classes to anon;
grant insert on public.fashion_class_registrations to anon;
grant select, insert, update, delete on
  public.fashion_classes, public.fashion_class_registrations
to authenticated;

-- ----------------------------------------------------------------------------
-- Storage bucket for class flyers/images (public)
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public) values ('class-images','class-images', true)
on conflict (id) do nothing;

drop policy if exists "pcw class read"  on storage.objects;
drop policy if exists "pcw class write" on storage.objects;
create policy "pcw class read" on storage.objects
  for select using (bucket_id = 'class-images');
create policy "pcw class write" on storage.objects
  for all to authenticated using (bucket_id = 'class-images' and public.is_staff())
  with check (bucket_id = 'class-images' and public.is_staff());

-- Done.
