-- ===========================================================
-- Marine Telematics Admin — Supabase Schema
-- Execute no SQL Editor do seu projeto Supabase
-- ===========================================================

create table public.kits (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  image_path  text,
  hotspots    jsonb,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger kits_updated_at
  before update on public.kits
  for each row execute function public.handle_updated_at();

alter table public.kits enable row level security;

create policy "Authenticated users can read kits" on public.kits for select using (auth.role() = 'authenticated');
create policy "Authenticated users can insert kits" on public.kits for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update kits" on public.kits for update using (auth.role() = 'authenticated');
create policy "Authenticated users can delete kits" on public.kits for delete using (auth.role() = 'authenticated');

insert into storage.buckets (id, name, public) values ('kit-images', 'kit-images', true) on conflict do nothing;
create policy "Authenticated users can upload images" on storage.objects for insert with check (bucket_id = 'kit-images' and auth.role() = 'authenticated');
create policy "Anyone can view images" on storage.objects for select using (bucket_id = 'kit-images');
create policy "Authenticated users can delete images" on storage.objects for delete using (bucket_id = 'kit-images' and auth.role() = 'authenticated');