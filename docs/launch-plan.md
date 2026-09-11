# LinkPlate — Launch Plan

Sequenced work to take LinkPlate from "a working product I use" to "a product
other people pay for and run themselves."

Ordering principle: fix defects that harm a buyer first, then remove the
reasons not to buy, then widen the value gap, then price it.

The value-lever scoring referenced below comes from the Value Gap framework —
buyers pay in four currencies (money, time, effort, risk) and price is the one
they resist least. Current scores: **Time 3, Effort 2, Risk 1, Price 2.**

---

## Decisions already made

| Decision | Choice |
|---|---|
| Name | LinkPlate |
| Domain | `linkplate.bio` (interim: `adilsher.pro/products/linkplate`) |
| Brand colour | Signal Amber `#F5A524`; indigo stays as the customer page default |
| Distribution | **Option A — private repo, per-buyer GitHub access** |
| Licensing | No runtime licence check (see below) |

### Why no runtime licence key

A licence check cannot be enforced in code the buyer reads, edits and runs on
their own infrastructure — deleting it is a one-line change. Worse, a check
that phones home makes every customer's admin panel depend on our uptime,
which contradicts the product's central claim that no platform can take their
page down.

Enforcement therefore lives in **distribution**: the source repo goes private,
and each buyer is granted read access on their own GitHub account after
purchase. Vercel's deploy button clones using the buyer's own GitHub OAuth, so
the one-click flow still works for them and for nobody else. Access is
revocable. The unpirateable assets are updates, support, and the done-for-you
tier.

---

## Phase 0 — Defects that hurt buyers

### 0.1 Fabricated analytics ship to every install — **blocker**

`app/admin/page.tsx` unconditionally merges ~4,800 invented page views, plus
fake countries and referrers, into the dashboard. This was added as demo data
for one install and is now in the product. **Every buyer opens a brand-new
site and sees fabricated traffic presented as their own.**

Gate it behind an explicit demo flag so real installs show real numbers, and
the demo site (Phase 1) still looks alive.

### 0.2 Password recovery lockout

`RESEND_API_KEY` is never injected by the one-click deploy, and it is the only
recovery path — `app/api/admin/forgot-password/route.ts:22` dead-ends with
"Email sending is not configured." A buyer who forgets their password is
permanently locked out of their own site.

Add a break-glass reset that needs no third party: the owner sets
`ADMIN_PASSWORD_RESET` in Vercel and redeploys; a new route applies it once,
recording a consumed-marker in Redis so the same value cannot be replayed.
Print those instructions on the forgot-password page instead of the dead end,
and add "set up password recovery" to the dashboard checklist.

### 0.3 No rate limiting on login

`app/api/admin/login/route.ts` accepts unlimited attempts against a single
password. Add per-IP throttling with a Redis counter and backoff.

### 0.4 `.gitignore` does not cover plain `.env`

Only `.env*.local` is ignored. One careless file publishes the Upstash token.
Widen the pattern. (`.env.example` currently holds placeholders only.)

---

## Phase 1 — Let people see it before they pay

Risk scores 1/5 largely because a buyer is asked to purchase something they
have never seen.

- **1.1 Demo content fixture** — one persona config exercising every block
  type. Feeds the demo, the marketing screenshots and the theme gallery.
- **1.2 Public demo + theme gallery** — `/demo`, with a switcher cycling all
  nine themes. Doubles as a QA surface for readability changes.
- **1.3 Sandbox admin** — the real panel against in-memory state, no auth, no
  persistence. The strongest single Risk move: turns "trust me" into "try it."

---

## Phase 2 — Collapse setup time and effort

- **2.1 Bulk link import** — paste `Title — URL` lines. Robust, source-agnostic,
  cheapest real win available.
- **2.2 Linktree import** — paste a Linktree URL, extract the links. Highest
  leverage and most fragile; depends on markup that is not a contract. Build
  2.1 first as the guaranteed path and fall back to it.
- **2.3 Starter plates** — musician, coach, maker, developer. Moves the product
  from "here are the materials" to "here is a tailored starting point." A
  decision removed is effort removed.

---

## Phase 3 — Price the gap

- **3.1 Marketing site at `linkplate.bio`** — separate project; `/` in this repo
  is the customer's page. Carries the ladder, the anchor (Linktree Pro at
  $9/mo is **$540 over five years**), the demo link and the OG card.
- **3.2 Tier packaging** — service-based, not feature-gated. "Every feature
  included" is the positioning; tiers differ by how much is done for the buyer.

| Rung | Included |
|---|---|
| Entry | Repo access, self-deploy |
| Core | + import, starter plates, domain guide, priority support |
| Top | Done for you — deployed, domain connected, content migrated, 30 days support |

---

## Also outstanding

Not yet scheduled, but real.

### Commercial and legal

- **No LICENSE file or EULA.** Selling requires stated terms: sites per
  purchase, resale prohibited, what support is included, refund policy.
- **Refund policy** — also the strongest available Risk move. "If it doesn't
  deploy, I'll deploy it for you" removes the consequence rather than
  compensating for it.
- **Terms and privacy policy** for the marketing site.

### Technical

- **Images are base64 data URIs inside the config blob.** `ImageUpload`
  produces a WebP data URL that is stored in `SiteConfig`, and the entire
  config is a single Redis document. An avatar plus several link thumbnails
  can approach Upstash's per-request size limit and hard-fail saves. Needs a
  real ceiling check and probably external image storage.
- **No update path for buyers.** Under Option A each buyer holds their own
  clone. Document `git remote add upstream` + merge, or push updates to their
  repos. Without this, nobody ever receives a fix.
- **No test suite.** Self-hosted software cannot be hotfixed centrally; a
  regression ships to people who paid for it.
- **Mobile admin has no live preview** — the wizard preview is `hidden lg:block`.
- **Custom domain setup is undocumented in-product.** Buyers do Vercel DNS
  unaided.
