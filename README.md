# room-reader

Know the room before you enter it.

AI helps you write. room-reader helps you understand how the room will receive it.

room-reader is a rehearsal room for high-stakes communication. Pick a scenario, speak or paste a rehearsal, watch a cute pixel audience react, then use the structured report to rehearse a better version.

Safety framing: room-reader uses editable audience cards and topic-specific lenses for rehearsal. It does not analyze, diagnose, or clone real personalities. Personas are rehearsal assumptions, not psychological profiles.

## Demo flow

1. Open the app.
2. Pick one of six rehearsal topics: standup comedy, founder pitch, job interview, product demo, team update, hard conversation.
3. Click Load demo, type/paste text, or use the browser speech-to-text button if supported.
4. Click Run Room Check.
5. Watch emoji bubbles appear over the pixel audience.
6. Read the room report: room temperature, scores, what landed, confusion points, persona-by-persona reactions, hardest questions, and suggested rewrite.
7. Click Rehearse revised version and run again.

## Local setup

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Verification:

```bash
npm run test
npm run typecheck
npm run lint
npm run build
# or
./scripts/verify.sh
```

## Environment variables

The core demo works in deterministic mock mode with localStorage fallback when no server key is configured. For the live hackathon demo, set a server-side OpenAI key so `/api/rehearse` returns GPT-powered persona reactions.

Server-side OpenAI reactions:

```bash
OPENAI_API_KEY=
# optional; defaults to gpt-4o-mini
OPENAI_MODEL=
```

Optional public Supabase persistence:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Never commit `.env.local`, Supabase service role keys, OpenAI keys, Codex credentials, or private team secrets.

## Supabase SQL

Optional hackathon MVP persistence only. No auth is implemented. Apply `supabase/schema.sql` if you want public insert/read demo tables:

```sql
create table if not exists public.room_reader_rooms (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  topic text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.room_reader_audience_cards (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.room_reader_rooms(id) on delete cascade,
  name text not null,
  role text not null,
  lens jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.room_reader_rooms enable row level security;
alter table public.room_reader_audience_cards enable row level security;

create policy "room_reader_rooms_public_read"
on public.room_reader_rooms
for select
using (true);

create policy "room_reader_rooms_public_insert"
on public.room_reader_rooms
for insert
with check (true);

create policy "room_reader_audience_cards_public_read"
on public.room_reader_audience_cards
for select
using (true);

create policy "room_reader_audience_cards_public_insert"
on public.room_reader_audience_cards
for insert
with check (true);
```

## Vercel deployment

1. Push this folder as a public GitHub repo.
2. Import into Vercel as a Next.js project.
3. Build command: `npm run build`.
4. Install command: `npm install`.
5. Live persona reactions: set server env var `OPENAI_API_KEY` in Vercel. Optional `OPENAI_MODEL` defaults to `gpt-4o-mini`.
6. Optional env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
7. Do not add Supabase service role keys or any other admin/private client-exposed secrets.

## Hackathon / Ralph loop

Goal pattern used:

`/goal Build a deployed-ready Next.js app called room-reader verified by tests, typecheck, lint, build, and manual demo-path checks while preserving safety framing, no secrets, deterministic mock fallback, STT guarded client-side only, and localStorage fallback.`

Run the no-computer automation loop manually during the 30-minute Ralph/Codex block:

```bash
./scripts/ralph-loop.sh
```

The script runs test/typecheck/lint/build repeatedly for at least 1800 seconds and appends logs to `ralph-loop.log`. It never requires human input.

## Implementation notes

- Next.js App Router + TypeScript.
- CSS-only pixel audience for the in-room simulation.
- Hero uses a user-provided Tenor vintage audience GIF (`public/cinema-audience.gif`) from https://tenor.com/view/cinema-audience-clap-crowd-gif-12345135; verify usage rights or replace before a commercial/public launch if needed.
- Browser Web Speech API is client-only and guarded. If unsupported or permission fails, textarea remains usable.
- `/api/rehearse` uses server-side OpenAI chat completions when `OPENAI_API_KEY` is present, validates JSON shape, and falls back to deterministic mock output if the key is missing or the model response is invalid.
- Deterministic mock rehearsal engine lives in `lib/rehearsalEngine.ts` and is covered by Vitest tests.
- Supabase is optional and cannot break the core demo when env vars are missing.
- The stable mock engine remains the fallback source of truth for hackathon reliability.

## License

MIT for app code. The bundled hero GIF is user-provided from Tenor and is credited above; confirm rights or swap it before commercial/public launch.
