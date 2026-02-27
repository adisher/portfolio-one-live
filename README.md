# Bio Link Pro

A polished, white-label bio-link platform with a visual admin panel, built-in analytics, 5 themes, and one-click deployment to Vercel. Built with Next.js 14, Upstash Redis, and shadcn/ui.

---

## One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYOUR_USERNAME%2FYOUR_REPO&integration-ids=oac_V3R1GIpkoJorr6fqyiwdhl17&project-name=bio-link-pro&repository-name=bio-link-pro)

> **Replace** `YOUR_USERNAME/YOUR_REPO` in the URL above with your GitHub username and repo name after pushing this code.

---

## What You Get

- **5 beautiful themes** — Dark Gradient, Minimal Light, Glassmorphism, Neon Dark, Warm Gradient
- **Visual admin panel** at `/admin` — no code editing needed
- **Built-in analytics** — page views, top countries, top links, top referrers
- **Drag-and-drop link management** with icon picker
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
