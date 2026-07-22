# Green Tier — Implementation Plan (Public Display + Admin Panel)

> How each "easy tier" feature is stored, edited in the admin panel, and rendered on the public page. Built entirely on the existing pattern — no new infrastructure.

## How the existing system works (what we reuse)

Every feature follows the same proven path already used by links, socials, and themes:

1. **Data:** a field on `SiteConfig` in `lib/config.ts` (+ a default in `DEFAULT_CONFIG`). `getConfig()` merges stored data over defaults, so new fields appear automatically for existing users.
2. **Admin:** a client editor (`components/admin/*Editor.tsx`) holds local state and POSTs a partial config to `/api/admin/config`, which shallow-merges it. A nav entry in `AdminSidebar.tsx` + a route at `app/admin/<name>/page.tsx`.
3. **Public:** `BioPage.tsx` reads the field and renders it (server passes `config` from `app/page.tsx`).

No feature below needs an external service, background job, or new database — they are all config-in → render-out.

---

## ⭐ Key design decision: unified content model

Today the page body is **hardcoded** in this order: links → single video → single CTA. To support **section headers, multiple videos, music, and embeds — interleaved and reorderable —** we should generalize `links[]` into a typed, ordered **content array**.

**Recommended:** rename/extend `links: LinkItem[]` → `content: ContentBlock[]`, where each block has a `type`:

```ts
type BlockType = 'link' | 'header' | 'video' | 'music' | 'embed'

interface ContentBlock {
  id: string
  type: BlockType
  order: number
  enabled: boolean
  // link fields
  title?: string; url?: string; icon?: string
  thumbnailUrl?: string; featured?: boolean
  startAt?: string; endAt?: string; ageGate?: boolean
  // header fields
  text?: string
  // video/music/embed fields
  embedUrl?: string
}
```

**Why:** one drag-and-drop list, one render loop, and every new content feature becomes "just another block type." It reuses the existing `@dnd-kit` editor almost verbatim. Migration is backward-compatible: existing `LinkItem`s are read as `{ ...item, type: 'link' }`.

**Alternative (less work, more debt):** keep `links[]` untouched, add per-link fields, and add a *separate* `blocks[]` list rendered after links. Cheaper now, but headers can't sit between links and we carry two systems. **I recommend the unified model** since we're scaling to 50+ features.

The plan below assumes the unified model but each feature is independently implementable.

---

## Feature-by-feature design

### Group G1 — Per-link enhancements
Extend the link block + its edit dialog (`LinksEditor.tsx` `EditDialog`).

| Feature | Data | Admin control | Public render |
|---|---|---|---|
| **Thumbnail image** | `thumbnailUrl?` | URL input in edit dialog | Replace the icon square with an `<img>` on the link card |
| **Featured link** | `featured?: boolean` | Toggle in dialog | Larger card, accent border/background, subtle glow |
| **Scheduling** | `startAt?`, `endAt?` (ISO) | Two datetime inputs | At render, hide the block if `now` is outside the window |
| **Age-gate** | `ageGate?: boolean` | Toggle in dialog | Click opens a confirm modal ("Are you 18+?") before navigating |

### Group G2 — New content blocks
New block types in the same content list. "Add" button becomes a small menu: Link / Header / Video / Music / Embed.

| Feature | Data (`type`) | Admin control | Public render |
|---|---|---|---|
| **Section header** | `header` + `text` | Text input row | Styled `<h2>` divider between blocks |
| **Multiple videos** | `video` + `embedUrl` | URL input (reuse `getYouTubeEmbedUrl`) | `<iframe>` card (same as current single video, now repeatable) |
| **Music embed** | `music` + `embedUrl` | Paste Spotify/Apple Music link | Convert to embed URL → `<iframe>` (Spotify/Apple player) |
| **Third-party embed** | `embed` + `embedUrl` | Paste Calendly/Typeform/YouTube/generic URL | Sandboxed `<iframe>` card with sensible aspect ratio |

> The current fixed `showVideo`/`videoUrl` and `showCTA` become a `video` block and (later) a `cta` block, keeping backward compatibility by migrating them into the content array on first load.

### Group G3 — Global design (top-level config, new "Appearance" controls)
Added to `AppearanceEditor.tsx`.

| Feature | Data | Admin control | Public render |
|---|---|---|---|
| **Custom CSS** | `customCss: string` | Monospace `<textarea>` | Inject a `<style>` tag in `BioPage` (owner's own CSS; single-admin, so trusted) |
| **Animated / image background** | `backgroundType: 'theme'\|'gradient'\|'image'\|'video'`, `backgroundUrl` | Select + URL input | Fixed full-screen layer behind content (`<img>`/`<video autoplay muted loop>`) overriding `--page-bg` |
| **Layout** | `linkLayout: 'list'\|'grid'` | Segmented toggle | `list` = current stack; `grid` = 2-col grid of compact cards |
| **Button style** | `buttonShape: 'rounded'\|'pill'\|'square'`, `buttonFill: 'solid'\|'outline'` | Two selects | Map to CSS classes on `.bio-link-card` |
| **More themes** | new `ThemeName`s | Existing theme picker (auto-lists) | Add `.theme-*` blocks in `globals.css` + entries in `themes.ts` |

### Group G4 — Integrations, sharing & social
| Feature | Data | Admin control | Public render |
|---|---|---|---|
| **Google Analytics** | `gaMeasurementId: string` | Input in a new "Integrations" page | `next/script` gtag in `app/page.tsx`, rendered only when set (public only, not admin) |
| **Meta / TikTok Pixel** | `metaPixelId`, `tiktokPixelId` | Inputs in "Integrations" | `next/script` pixel snippets, gated on value |
| **QR code** | — (derived from site URL) | New "Share" panel: shows QR + PNG download | Admin-only utility (uses `qrcode` lib client-side); not on public page |
| **More social networks** | extend `SocialLinks`/`SocialVisibility` (tiktok, threads, discord, twitch, whatsapp, facebook…) | New rows in `SocialEditor` (`SOCIAL_FIELDS`) | New entries in `socialIconMap` |
| **vCard / contact button** | `showVcard: boolean` (uses profile + email) | Toggle in Profile | Button generating a `.vcf` data-URI download — pure client-side |

> **Brand-icon note:** `lucide-react` lacks TikTok, Threads, Discord, Twitch, and WhatsApp glyphs. Add `react-icons` (simple-icons set `react-icons/si`) or inline SVGs for the new networks — a one-time dependency decision in G4.

---

## Admin navigation changes (`AdminSidebar.tsx`)

- **Links** page → becomes the unified **Content** editor (links + blocks in one list).
- **Sections** page (currently CTA/video) → folds into Content; repurpose or retire.
- New **Integrations** page (`/admin/integrations`) → GA, pixels.
- New **Share** panel → QR code (could live under Settings or its own entry).
- **Appearance** gains the G3 controls; **Profile** gains the vCard toggle; **Social** gains the new networks.

---

## Head / script injection approach

Pixels and GA must load on the **public page only**. Use `next/script` inside `app/page.tsx` (server component), each block rendered conditionally on its config id being present. Custom CSS is injected as an inline `<style>` inside `BioPage`. The admin panel never loads these, so tracking stays scoped to visitors.

---

## Suggested build order (one PR per group)

1. **G1** — unified content model migration + per-link fields (foundation; unblocks everything else).
2. **G2** — header / video / music / embed block types.
3. **G3** — custom CSS, backgrounds, layout, button styles, extra themes.
4. **G4** — GA + pixels, QR code, extra socials, vCard.

Each group is shippable on its own and maps to the `docs/competitive-feature-backlog.md` items.

---

## One thing to confirm before building

**Unified content model (recommended) vs. additive blocks list?** The unified model is the better foundation but touches `LinksEditor` and `BioPage` core rendering. The additive approach is lower-risk but leaves headers unable to interleave with links. My recommendation is the unified model.
