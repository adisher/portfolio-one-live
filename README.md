# LinkPlate

One link for everything you make. A white-label link-in-bio platform with a visual admin panel, built-in analytics, 9 themes plus a custom theme builder, and one-click deployment to Vercel. Built with Next.js 14, Upstash Redis, and shadcn/ui.

Every feature is included — there are no tiers and no subscription, and it runs on your own Vercel and Redis accounts.

---

## Deploy

There are two ways in. Both end with LinkPlate running on your own Vercel
account, with your own Redis database and your own domain.

### A. One click

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fadisher%2Fportfolio-one-live&integration-ids=oac_V3R1GIpkoJorr6fqyiwdhl17&project-name=linkplate&repository-name=linkplate)

Vercel copies this repository into **your** GitHub account as a new repo named
`linkplate`, provisions Redis, and deploys. You do not need to push anything
first — the button creates the repo for you.

### B. From your own copy

If you received the code as an archive, or you want the repository under a
different name:

1. Create an empty repository in your GitHub account
2. Push this code to it
3. In Vercel, choose **Add New → Project** and import that repository
4. Add the Upstash integration so `UPSTASH_REDIS_REST_URL` and
   `UPSTASH_REDIS_REST_TOKEN` are injected

If you republish your copy for others to deploy, update the `repository-url`
in the button above to point at your repository — Vercel clones whatever that
URL names, not the repo the README happens to be sitting in.

---

## What You Get

- **9 themes plus a builder** — Dark Gradient, Minimal Light, Glassmorphism, Neon Dark, Warm Gradient, Midnight, Forest, Rose Quartz and Mono Dark, or build your own
- **19 fonts** across sans, serif and display
- **7 content block types** — links, headers, video, music, embeds, products and tip jars
- **Guided setup** — a five-step walkthrough with a live preview on first run
- **Visual admin panel** at `/admin` — no code editing needed
- **Built-in analytics** — page views, top countries, top links, top referrers
- **Drag-and-drop content management** — headers and the links beneath them move as one group
- **Dynamic SEO** — auto-generates OG images if you don't provide one
- **Framer Motion animations** on the public page
- **Single-admin, password-protected** — no accounts or signups

---

## Prerequisites

- A [GitHub](https://github.com) account (free)
- A [Vercel](https://vercel.com) account (free)

That's it. Upstash Redis is free-tier and auto-provisioned.

---

## Post-Deployment Setup

1. Click the **Deploy** button above
2. When prompted, install the **Upstash** Marketplace integration — this auto-creates a free Redis database and injects the connection variables
3. Wait for the deployment to complete (~2 min)
4. Visit `https://your-project.vercel.app/admin`
5. **Create your admin password** (first-time setup)
6. Start customizing: edit your profile, add links, pick a theme, configure SEO

---

## Adding a Custom Domain

1. Open your project in the [Vercel Dashboard](https://vercel.com/dashboard)
2. Go to **Settings → Domains**
3. Add your domain and follow the DNS instructions

---

## Environment Variables

| Variable | Description | Auto-injected? |
|---|---|---|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL | Yes (via integration) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token | Yes (via integration) |

That's it — **no other environment variables are required.** The admin session signing key is derived automatically from `UPSTASH_REDIS_REST_TOKEN`, so there is nothing extra to configure.

---

## Local Development

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local and fill in your Upstash credentials
# Get them from https://console.upstash.com after creating a Redis database

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public page.
Open [http://localhost:3000/admin](http://localhost:3000/admin) for the admin panel.

---

## Themes

| Theme | Description |
|---|---|
| **Dark Gradient** | Deep blue/purple gradient, glowing semi-transparent cards |
| **Minimal Light** | Clean white background, subtle card borders, professional look |
| **Glassmorphism** | Frosted glass cards with backdrop-blur on a colorful gradient |
| **Neon Dark** | Dark background with neon-green borders and glow effects |
| **Warm Gradient** | Coral, peach and amber gradient with soft rounded cards |

Switch themes instantly from **Admin -> Appearance**.

---

## Analytics

All analytics are self-hosted in Redis — no external scripts, no GDPR concerns, no third-party services.

Tracked automatically:
- **Daily page views** (30-day chart)
- **Visitor countries** (from Vercel's `x-vercel-ip-country` header)
- **Referrers** (parsed from the `Referer` header)
- **Link clicks** (tracked per link ID)

---

## Tech Stack

- **Next.js 14** (App Router, Server Components)
- **Upstash Redis** (data storage, analytics)
- **Tailwind CSS** + **shadcn/ui** (admin UI)
- **Framer Motion** (public page animations)
- **Recharts** (analytics charts)
- **@dnd-kit** (drag-and-drop link ordering)
- **bcryptjs** + **jose** (password hashing + JWT sessions)

---

## License

MIT
