# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server at localhost:3000
npm run build    # production build
npm run start    # start production server (after build)
npm run lint     # run ESLint
```

No test suite is configured.

## Environment

Requires `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Architecture

Admin dashboard (single page, Spanish UI) for managing Nintendo Online family groups sold commercially.

**Stack:** Next.js 16 + React 19, Tailwind CSS v4 (`@tailwindcss/postcss`), Supabase (client-side only via `@supabase/supabase-js`), shadcn/ui (`base-nova` style), `lucide-react` icons, Manrope font, `tesseract.js` (client-side OCR for screenshot import). Next.js 16 has breaking changes vs prior versions — per `AGENTS.md`, read `node_modules/next/dist/docs/` before adding new Next.js-specific code.

**Installed but unused:** `@anthropic-ai/sdk` and `framer-motion` are in `package.json` but not yet used in any source file.

**Path alias:** `@/` resolves to the project root.

### Navigation

`app/page.tsx` is a `"use client"` component that holds a `View` state (`"Dashboard"` | `"Grupos"` | `"Solicitudes"` | `"Formularios"`). It passes `activeView` and `onNavigate` to `<Sidebar>`. No URL routing is used.

### Business logic constants

```
PRICE_PER_ACCOUNT  = 220   // MXN charged per slot
SLOTS_PER_GROUP    = 7     // max accounts per group
SUBSCRIPTION_COST  = 1150  // MXN cost of Nintendo subscription
PROFIT_PER_GROUP   = 390   // MXN per group (220×7 − 1150)
```

### Email variant system (`lib/email-generator.ts`)

Gmail treats `a.b@gmail.com` and `ab@gmail.com` as the same inbox. `normalizeEmail` strips dots and plus-aliases. `generateEmailVariants` inserts a single dot at each position. `findAvailableVariant` returns the first variant not already in `grupos.correo`.

## Supabase schema

All access is client-side. `lib/supabase.ts` exports a single shared client instance. RLS is enabled on all tables.

### `grupos`

```sql
create table grupos (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  correo text not null,
  correo_normalizado text not null,
  password text not null,
  estado text,
  fecha_inicio timestamptz not null,
  fecha_fin timestamptz not null,
  miembros integer not null default 0,
  created_at timestamptz default now()
);

alter table grupos enable row level security;
create policy "Allow all inserts" on grupos for insert to anon with check (true);
create policy "Allow all selects" on grupos for select to anon using (true);
```

`miembros` is a denormalized count — updated manually when rows are added/removed from `miembros_grupo`.

### `miembros_grupo`

```sql
create table miembros_grupo (
  id uuid default gen_random_uuid() primary key,
  grupo_id uuid references grupos(id) on delete cascade,
  nombre text not null,
  usuario_nintendo text,
  whatsapp text,
  created_at timestamptz default now()
);

alter table miembros_grupo enable row level security;
create policy "allow anon all" on miembros_grupo for all to anon using (true) with check (true);
```

`nombre` is the required display field. `usuario_nintendo` is shown preferentially when present. The component reads both and falls back to `nombre` if `usuario_nintendo` is null.

### `solicitudes`

```sql
create table solicitudes (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  whatsapp text not null,
  usuario_nintendo text not null,
  correo text not null,
  comentarios text,
  estado text not null default 'pendiente',
  grupo_id uuid references grupos(id),
  created_at timestamptz default now()
);

alter table solicitudes enable row level security;
create policy "allow anon insert" on solicitudes for insert to anon with check (true);
create policy "allow anon select" on solicitudes for select to anon using (true);
create policy "allow auth all" on solicitudes for all to authenticated using (true);
```

`estado` values: `pendiente` → `aprobada` | `rechazada`. Approving sets `grupo_id`.

## Key components

- `app/page.tsx` — root route; owns view state; composes Sidebar + view content
- `components/layout/sidebar.tsx` — highlights active view, calls `onNavigate` on click
- `components/dashboard/stats-cards.tsx` — live group count, expiring soon, new this month; derives cuentas and ganancias
- `components/dashboard/create-group-modal.tsx` — auto-generates group name, email variant (auto or manual mode), password; validates duplicates before insert
- `components/dashboard/groups-table.tsx` — card grid with search/pagination; `EditGroupModal` (edits correo, password, fecha_inicio, miembros); `MembersModal` (shows members from `miembros_grupo`, screenshot OCR import via tesseract.js, add/remove members)
- `components/dashboard/expiring-groups.tsx` — groups with `fecha_fin` within 30 days
- `components/dashboard/recent-activity.tsx` — last 5 groups as activity feed
- `app/solicitud/page.tsx` — public form; inserts into `solicitudes` with `estado = 'pendiente'`. Reads field config from `localStorage` key `fm_form_fields` (same key as `FormulariosView`) with `DEFAULT_FIELDS` fallback. **Same-device caveat:** form customization only applies to visitors on the same browser where the admin edited the form — not server-persisted. Field ids `"1"`–`"4"` map to named DB columns via `DB_COLUMN`; any extra custom fields spill into `comentarios` as concatenated text.
- `components/solicitudes/solicitudes-table.tsx` — admin view; approve (opens modal) or reject pending solicitudes
- `components/solicitudes/approve-modal.tsx` — select group, preview WhatsApp message with credentials, opens `wa.me` link
- `components/formularios/formularios-view.tsx` — form field editor with localStorage persistence (`fm_form_fields`)
