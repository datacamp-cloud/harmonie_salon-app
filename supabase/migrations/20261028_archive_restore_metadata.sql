-- WebStock: metadonnees necessaires pour consulter et restaurer les archives.
-- A executer dans le SQL Editor du projet Supabase avant de tester l'ecran Archives.
alter table public.archives
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists restored_at timestamptz;

create index if not exists archives_created_at_idx
  on public.archives (created_at desc);

comment on column public.archives.restored_at is
  'Date de restauration de l enregistrement archive. NULL signifie que l archive est encore restauree possible.';
