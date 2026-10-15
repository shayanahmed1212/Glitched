# Glitched

Phase 1 MVP: editorial magazine feed + open signup with admin approval + custom
reactions + comments + report/auto-hide + student directory. Built to run
**$0/month** on Vercel + Cloudflare R2 (see blueprint doc for the capacity
math).

> **Frontend phase:** the database is unplugged. Every page reads and writes
> through `lib/data.ts`, an in-memory stand-in seeded with sample content, so
> the whole app is browsable with no services and no env vars. Supabase comes
> back later by rewriting that one module — no component changes required.

## Setup

1. **Install & run**
   ```bash
   npm install
   npm run dev
   ```

2. **Cloudflare R2** (optional right now)
   - Create a bucket, enable public access (or set up a custom domain for it)
   - Create an API token with R2 read/write access
   - Fill in `R2_*` vars in `.env.local`
   - Without these, uploads fall back to an in-browser preview URL — the UI
     still works end to end.

3. **Deploy**
   - Push to GitHub, import into Vercel, add the same env vars there.

## What's built (Phase 1)

- School signup → pending → admin approves (`/admin`)
- Feed with editorial grid, category tags (`/`)
- Submit photo/article with live preview + client-side compression (`/post/new`)
- Post detail with 🔥😱👏💀 reactions + comments + report-to-flag (`/post/[id]`)
- Student directory (`/discover`)
- Editable profile, locked real name (`/profile`)
- Moderation queue: approve / edit / reject posts + approve accounts (`/admin`)

## Not yet built (Phase 2, per the blueprint)

- Real auth + database (Supabase) — `supabase/schema.sql` is still the plan of
  record; `lib/data.ts` is the only file that has to change to bring it back
- Study/project matcher board
- Events & RSVP cards
- Web push notifications (manifest is stubbed in; service worker + push
  subscription flow still needs to be wired up — this needs real VAPID keys
  and a push service, worth its own pass)
- Swipe-left multi-page article spread (currently a single scrolling page)
- Weekly Campus Spotlight automation

## Notes for whoever picks this up next

- `lib/data.ts` is the seam. Reads and writes are already async and shaped like
  the queries they replaced, so swapping in `@supabase/supabase-js` there leaves
  every page and component untouched.
- Server pages and browser components each get their own copy of that module,
  so an action taken in the browser (submitting a post, approving an account)
  lives for that browser session only. That's a phase-1 limitation, not a bug.
- The compression rule in `lib/upload.ts` is load-bearing for staying on the
  free tier — don't remove it to "simplify" the upload flow later.
This is Readme.md
Glitched is the name decided for the app now
Are you on Glitch?
Get liv on glitch spam it with ur thoughts
Trying out a new font on a GLitched text
let see what works out now , cuz i dont get anything , it super dumbo and super shitty tooo and the thing is i cant figure anything out cux i m pissd as shii
and then 

this is readme.md u mighti mwaitingtime but i m not liegtly 
we both blame and we both tame and then we both eat the same until we both kill the same
