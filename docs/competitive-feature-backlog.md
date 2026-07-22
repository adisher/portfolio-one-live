# Competitive Feature Backlog — Link-in-Bio Platform

> Product backlog derived from deep research (2026) across Linklay, Linktree, Beacons, Stan Store, Carrd, and Hopp by Wix. Organized so features can be implemented one by one.
>
> **Our two differentiators:** (a) every feature included in a **single one-time payment** (vs. competitors' recurring subscriptions + per-sale commissions), and (b) an **auto-deploy / self-host** option so users own their site.

---

## 1. Strategic Summary

The research surfaced one dominant pattern: the features competitors most aggressively **paywall** are exactly the ones we can bundle for free to win.

- **Linktree** charges **12% commission** on Free, **9%** on Starter ($8/mo) & Pro ($15/mo), and only **0%** at Premium ($35/mo). Analytics history is tier-gated (28 days free → lifetime at Premium).
- **Beacons** charges **9%** on Free & $10 tiers, reaching **0%** only at $30/mo. Advanced analytics, SEO, and email automation are gated to $10+.
- **Stan Store** charges **0%** platform fees but has **no free plan** (14-day trial) and costs **$29–99/mo**. Email marketing gated to the $99 tier.
- **Carrd** is cheap ($9–49/**year**) but subscription-based; custom domains, forms, embeds, and analytics all require Pro Standard ($19/yr).
- **Hopp by Wix** advertises the deepest stack — **20+ monetization tools at 0% fees** — but custom domain, short links, full analytics, and instant pages are Pro-gated.

**The takeaway for our backlog:** prioritize by two axes —

1. **Self-host feasibility** — client-side/static features are trivial in an auto-deploy model; features needing an always-on backend (real-time analytics, email sending, payment webhooks) need an architecture decision.
2. **Paywall leverage** — the more commonly a feature is paywalled elsewhere, the more marketing value in giving it away in our one-time bundle.

**Sweet spot (P0):** features that are *client-side* **and** *commonly paywalled* — maximum differentiation, minimum infrastructure.

---

## 2. Verified Competitor Pricing & Fee Matrix

| Platform | Free tier | Paid tiers | Per-sale fee | Billing |
|---|---|---|---|---|
| **Linktree** | Yes (basic) | Starter $8 · Pro $15 · Premium $35 /mo | 12% free → 9% → 9% → **0%** premium | Subscription |
| **Beacons** | Yes | ~$10 · $30 · $90 /mo | 9% until **0%** at $30 tier | Subscription |
| **Stan Store** | ❌ (14-day trial) | Creator $29 · Creator Pro $99 /mo | **0%** all tiers | Subscription |
| **Carrd** | Yes (limited) | $9 · $19 · $49 /**year** | n/a (embed-based) | Subscription (annual) |
| **Linklay** | Yes (generous) | Pro $9.99/mo or $99/yr | — | Subscription |
| **Hopp by Wix** | Yes | Hopp Pro | **0%** transaction fees | Subscription |
| **⭐ Us (target)** | — | **One-time payment** | **0%** | **One-time + self-host** |

> All fees are on top of the ~2.9% + $0.30 payment-processor (Stripe/PayPal) fee, which is unavoidable for everyone. *Figures 2026-current; Linktree restructured pricing Nov 2025 — re-verify before publishing marketing.*

---

## 3. Feature Backlog by Category

**Legend:**
- **Status:** ✅ have · 🟡 partial · ❌ missing
- **Self-host:** 🟢 client-side (easy) · 🟡 light backend · 🔴 needs always-on backend
- **Paywall:** how commonly gated behind premium elsewhere (⭐ = strong bundling opportunity)
- **Priority:** P0 (quick differentiating win) · P1 (core parity) · P2 (needs architecture decision)

### 3.1 Core Link Management

| Feature | Status | Self-host | Paywall elsewhere | Priority |
|---|---|---|---|---|
| Unlimited links, reorder, icons, enable/disable | ✅ | 🟢 | — | — |
| Link **scheduling** (show/hide by date-time) | ❌ | 🟢 | Common ⭐ | **P0** |
| **Thumbnails / images** on link buttons | ❌ | 🟢 | Common ⭐ | **P0** |
| Link **animations / highlight** (pulse, shake) | ❌ | 🟢 | Pro-gated ⭐ | **P0** |
| **Smart / AI link reordering** by performance | ❌ | 🔴 (needs click data) | Linklay, Beacons | P2 |
| Link **grouping / sections / headers** | 🟡 (CTA+video only) | 🟢 | Common | **P0** |
| **Featured / priority** link (hero button) | ❌ | 🟢 | Common | P1 |
| Sensitive-content / **age-gate** on a link | ❌ | 🟢 | Linktree Pro | P1 |
| **Link shortener** w/ branded short URLs | ❌ | 🔴 (redirect service) | Hopp Pro ⭐ | P2 |

### 3.2 Monetization *(the biggest gap — and biggest opportunity)*

| Feature | Status | Self-host | Paywall elsewhere | Priority |
|---|---|---|---|---|
| **Tip jar / donations** | ❌ | 🟡 (Stripe hosted / "Buy Me a Coffee" embed) | Widespread | **P0** |
| **Digital product** sales (ebook, template, files) | ❌ | 🟡 (Gumroad/Stripe hosted checkout) | Widespread ⭐ | **P0** |
| **Pay-what-you-want** pricing | ❌ | 🟡 | Common | P1 |
| **Paid memberships / subscriptions** | ❌ | 🔴 (recurring billing + webhooks) | $30+ tiers ⭐ | P2 |
| **Bookings / appointments** (1:1, coaching) | ❌ | 🔴 (calendar + payment) or embed Calendly | Stan, Hopp ⭐ | P2 |
| **Events & tickets** (RSVP, recurring) | ❌ | 🔴 | Hopp | P2 |
| **Online courses** hosting | ❌ | 🔴 | Stan, Beacons | P2 |
| **Affiliate links + coupon codes** | ❌ | 🟢 | Hopp | P1 |
| **Storefront / product gallery** | ❌ | 🟡 (embed) / 🔴 (native) | Widespread ⭐ | P1 |
| **One-tap checkout** (Apple/Google Pay) | ❌ | 🔴 | Stan differentiator | P2 |
| **Lead magnets** (free file for email) | ❌ | 🟡 (needs email store) | Common | P1 |

> **Self-host strategy for monetization:** lean on **hosted checkout links** (Stripe Payment Links, Gumroad, Lemon Squeezy) that need no server on our side — the creator pastes their Stripe/Gumroad link and we render a beautiful buy button. This delivers ~70% of the monetization surface with **zero backend**, keeping it viable for auto-deploy. Native checkout / memberships / webhooks are the P2 tier that requires the optional managed backend.

### 3.3 Content & Media

| Feature | Status | Self-host | Paywall elsewhere | Priority |
|---|---|---|---|---|
| Single video embed (YouTube) | ✅ | 🟢 | — | — |
| **Multiple** video embeds anywhere | 🟡 | 🟢 | Common | **P0** |
| **Spotify / Apple Music** player embed | ❌ | 🟢 | Common ⭐ | **P0** |
| **Image gallery / carousel** | ❌ | 🟢 | Common | P1 |
| **RSS / social auto-import** (latest YouTube, TikTok, IG posts) | ❌ | 🔴 (polling backend) | Premium ⭐ | P2 |
| **Blog / posts** | ❌ | 🟢 (static) | Rare | P2 |
| **Podcast** embed | ❌ | 🟢 | Some | P1 |

### 3.4 Design & Customization *(our strongest self-host category — all client-side)*

| Feature | Status | Self-host | Paywall elsewhere | Priority |
|---|---|---|---|---|
| Preset themes (we have 5) | ✅ | 🟢 | — | — |
| Accent color + font picker | ✅ | 🟢 | Starter+ elsewhere ⭐ | — |
| **Custom CSS** | ❌ | 🟢 | Pro-gated ⭐ | **P0** |
| **Video / animated backgrounds** | ❌ | 🟢 | Linklay free / LT Premium ⭐ | **P0** |
| **Custom domain** connection | ❌ | 🟢 (native to self-host!) | Near-universally paywalled ⭐⭐ | **P0** |
| **Branding removal** ("no Linktree logo") | ✅ (n/a — no branding) | 🟢 | Universally paywalled ⭐⭐ | — |
| **More themes / templates** library | 🟡 (5) | 🟢 | Pro packs | P1 |
| **Layout options** (grid vs list, columns) | ❌ | 🟢 | Common | P1 |
| Live **mobile preview** in editor | 🟡 (verify) | 🟢 | Standard | P1 |
| **Button shape / style** controls | 🟡 | 🟢 | Common | P1 |

> **Custom domain** is the standout: it is paywalled by *everyone* yet is **native and free** in a self-hosted deploy (the user owns the domain at their host). This is our single most compelling "all-included" headline feature.

### 3.5 Analytics & Tracking

| Feature | Status | Self-host | Paywall elsewhere | Priority |
|---|---|---|---|---|
| Views, top countries, referrers, link clicks | ✅ | 🔴 (Redis-backed) | Retention gated ⭐ | — |
| **Unlimited history retention** | ✅ (we don't cap) | 🔴 | Tier-gated (28d→lifetime) ⭐⭐ | — |
| **Google Analytics** integration | ❌ | 🟢 (paste GA tag) | Common | **P0** |
| **Meta / TikTok Pixel** (retargeting) | ❌ | 🟢 (paste pixel) | Pro-gated ⭐ | **P0** |
| **UTM** parameter builder | ❌ | 🟢 | Common | P1 |
| **Device / browser** breakdown | ❌ | 🔴 | Common | P1 |
| **Conversion / sales** tracking | ❌ | 🔴 | Premium | P2 |
| Real-time **live visitor** view | ❌ | 🔴 | Linklay ⭐ | P2 |

> **Note:** third-party pixels (GA, Meta, TikTok) are the smart self-host play — the *creator's own* analytics account does the heavy lifting; we just inject the tag client-side. Zero backend, and it's a feature Linktree/Beacons gate behind Pro.

### 3.6 Marketing & Growth

| Feature | Status | Self-host | Paywall elsewhere | Priority |
|---|---|---|---|---|
| **Email capture** form | ❌ | 🟡 (store) or 🟢 (Mailchimp embed) | Common ⭐ | **P0** |
| **Mailchimp / ConvertKit** integration | ❌ | 🟢 (embed/API key) | Common | P1 |
| **Newsletter sending** | ❌ | 🔴 (email infra) | $30+ tiers ⭐ | P2 |
| **Autoresponders / sequences** | ❌ | 🔴 | Premium ⭐ | P2 |
| **SMS capture** | ❌ | 🔴 | Rare | P2 |
| **SEO controls** (title, meta, indexing) | ✅ | 🟢 | Pro-gated ⭐ | — |
| **Social proof** (subscriber counts, "X sold") | ❌ | 🟡 | Some | P1 |
| **QR code** generator | ❌ | 🟢 | Common ⭐ | **P0** |

### 3.7 Social & Integrations

| Feature | Status | Self-host | Paywall elsewhere | Priority |
|---|---|---|---|---|
| Social icons (6 networks) | ✅ | 🟢 | — | — |
| **More networks** (TikTok, Threads, Discord, Twitch, WhatsApp, etc.) | 🟡 (6 fixed) | 🟢 | Standard | **P0** |
| **Third-party embeds** (Calendly, Typeform, Substack…) | ❌ | 🟢 | Common ⭐ | P1 |
| **Zapier** integration | ❌ | 🔴 (API + auth) | Standard | P2 |
| **Public API** access | ❌ | 🔴 | Premium | P2 |
| Contact / **vCard** button | ❌ | 🟢 | Some | P1 |

### 3.8 Advanced / Differentiators

| Feature | Status | Self-host | Paywall elsewhere | Priority |
|---|---|---|---|---|
| **QR code** with logo | ❌ | 🟢 | Common | **P0** |
| **Multiple pages / profiles** | ❌ | 🟢 (static multi-page) | Premium ⭐ | P1 |
| **AI content** (bio, captions, link titles) | ❌ | 🟡 (needs LLM key) | Beacons core ⭐ | P1 |
| **AI media-kit** builder (for creators) | ❌ | 🔴 | Beacons | P2 |
| **A/B testing** links/themes | ❌ | 🔴 | Premium | P2 |
| **Gated / password-protected** content | ❌ | 🟡 | Premium | P1 |
| **Team / collaboration** | ❌ | 🔴 | Enterprise | P2 |
| **Deep linking** (open native apps) | ❌ | 🟢 | Some | P1 |
| **Scheduling / automation** (auto-swap links) | ❌ | 🔴 | Premium | P2 |

---

## 4. Recommended Roadmap

### Phase 1 — "All-Included" Quick Wins (P0, client-side, high paywall leverage)
The fastest path to a compelling "everything Linktree charges for, free & one-time" story. **All client-side, all self-host-safe:**

1. **Custom domain** support (headline feature — free here, paywalled everywhere) ⭐⭐
2. **Custom CSS** + **video/animated backgrounds**
3. **Link thumbnails, animations, scheduling**
4. **Section headers / grouping** (generalize the current CTA/video blocks)
5. **Google Analytics + Meta/TikTok Pixel** injection
6. **QR code** generator
7. **Spotify/Apple Music** + multi-video embeds
8. **More social networks** (TikTok, Threads, Discord, Twitch, WhatsApp…)
9. **Email capture** via Mailchimp/ConvertKit embed
10. **Tip jar + digital product** buttons via hosted checkout links (Stripe/Gumroad)

### Phase 2 — Core Parity (P1)
Affiliate/coupon links, image galleries, more themes, layout options, multiple pages, third-party embeds, AI-assisted content (bio/link titles), gated content, deep linking, vCard.

### Phase 3 — Backend-Dependent (P2, requires architecture decision)
Native memberships/subscriptions, bookings, events/tickets, courses, newsletter sending, autoresponders, RSS auto-import, link shortener, real-time analytics, A/B testing, Zapier/API, team collaboration.

---

## 5. The Self-Host / Auto-Deploy Architecture Question

The research flags a real tension: several premium features **inherently need an always-on backend** and cannot live in a purely static self-hosted build. Recommend a **two-tier model**:

- **Static tier (auto-deploy, zero ongoing cost):** everything in Phase 1 + most of Phase 2. Custom domains, all design, pixel-based analytics, hosted-checkout monetization, embeds. This is the self-host promise — the user owns it, no dependency on us.
- **Optional managed backend (opt-in):** the P2 features that need persistence — native payments/webhooks, memberships, email sending, first-party real-time analytics, RSS polling. Offered as an optional connected service for users who want them, without breaking the self-host guarantee for those who don't.

**Hosted-checkout-first** is the key insight: by rendering creators' own Stripe Payment Links / Gumroad / Lemon Squeezy / Calendly links, we deliver the *majority* of monetization and booking value with **no backend at all** — preserving the auto-deploy model while still checking the "monetization" box against Stan and Hopp.

---

## 6. Research Caveats

- **Coverage:** verified claims concentrated on Hopp, Linktree, Beacons, Stan Store, Carrd, and Linklay. Bio.link, Milkshake, Koji, Snipfeed, Later, Taplink, Campsite, Shorby, and Feedlink/Linkin.bio yielded **no surviving verified claims** — a follow-up research pass is warranted if their feature sets matter.
- **Source quality:** pricing/fee facts are strongly multi-sourced (vendor help centers + independent reviews). **Linklay's own free-plan feature claims are self-reported marketing** and not independently audited.
- **Time-sensitivity:** link-in-bio pricing changes fast (Linktree restructured Nov 2025). Re-verify all figures before using in public marketing.
- **Refuted claims excluded:** e.g., that Stan lacks native Mailchimp, older Linktree pricing ($5/$24), and certain Beacons free-tier quotas — do **not** rely on these.
- Self-host difficulty flags are **analytical annotations**, not sourced claims.

---

*Generated from a 108-agent deep-research workflow (6 search angles → 25 sources → 88 claims → 19 verified). Full source list and per-claim evidence available in the research transcript.*
