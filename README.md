# Martify

A responsive multi-vendor marketplace for Kenya, built with Next.js, React, Tailwind CSS and a PostgreSQL-compatible database. Customers browse verified sellers, pay in KES, and track orders; sellers and platform operators get the foundations for commissions, subscriptions and a visible payout ledger.

> **This is a demonstration project, not a production marketplace.**
> Payments are simulated. No real money moves, no card details are collected, and no customer funds are held. Seller and admin areas are currently read-only overview pages — the full management consoles are the next milestone. See [Payments and safety](#payments-and-safety).

**Live demo:** [martify-omega.vercel.app](https://martify-omega.vercel.app) — hosted on Vercel with Neon PostgreSQL. Demo data is seeded; use the accounts in [Demo accounts](#demo-accounts). Payments remain simulated.

## Highlights

- **Kenyan market by design** — KES pricing, county-based delivery, M-Pesa/card/cash-on-delivery checkout options, English and Swahili interface copy.
- **Complete customer journey** — browse, search, add to cart, check out as a guest or member, track an order, request a return, and manage addresses, wishlist and notifications.
- **Marketplace economics modelled in the data layer** — per-category commission rates, seller plan discounts, sponsored placements, affiliates, delivery fees and a double-entry-style seller ledger.
- **Mobile-first and accessible** — tested at 390 px and 1440 px across every customer route, with keyboard-friendly navigation, visible focus states and reduced-motion support.

## Status

| Area | State |
| --- | --- |
| Customer storefront, cart, checkout, order tracking | Built |
| Accounts: orders, wishlist, addresses, returns, notifications, affiliate | Built |
| Seller and admin workspaces | Read-only preview pages with live seeded stats |
| Payment providers, image uploads, email/SMS | Not connected — checkout and notifications are simulated |
| Automated tests, sitemap/robots routes | Not included yet |

## What's inside

### Storefront

- Sticky header with category mega-menu, account menu, live cart count and a slide-out mini-cart.
- Autocomplete search with product, category and trending suggestions, plus full search results with filters, sorting, grid/list views and pagination.
- Editorial homepage: hero carousel, category strip, flash sale with countdown, top deals, new arrivals, best sellers, sponsored placements, featured stores and recently viewed products.
- Category, deals, new-in, best-sellers and store pages, all server-rendered from the database.
- Product pages with image gallery and zoom, variant selection, stock awareness, delivery estimates, seller details, review photos, related products and structured data.
- Cart with quantity controls, remove, save-for-later and coupon validation.

### Checkout and orders

- Guest or signed-in checkout, saved addresses, door/pickup/express delivery, coupon codes and a server-priced quote.
- M-Pesa, card and cash-on-delivery options are **simulated**; no payment provider is called and no card form exists.
- Order confirmation with a private tracking link, status timeline, tracking lookup page and a demo “mark as paid” action.
- Returns flow with eligibility checks and demo refund status.

### Accounts

- Overview stats, recent orders, full order history, wishlist, address book (up to 20 addresses with defaults), notifications with mark-as-read, returns and a 2% affiliate referral dashboard.

### Seller and admin previews

- `/seller` shows a signed-in seller's live product count, orders, ledger balance and plan.
- `/admin` shows live marketplace counts, demo GMV and commission totals.
- Both pages are explicit previews; product/catalogue management, approvals, payouts and merchandising screens are listed in the [roadmap](#roadmap).

### Platform foundations

- Role-based auth (customer, seller, admin) with JWT sessions in httpOnly cookies and bcrypt password hashes.
- Email/password registration and login; optional Google OAuth wiring (routes included, credentials required).
- Zod request validation, origin checks, in-memory rate limiting and security headers.
- Database schema for users, sellers, products, variants, orders, payments, returns, coupons, flash sales, banners, subscriptions, affiliates, notifications, addresses, wishlist entries, payouts and ledger entries.
- Commission resolution: category override → seller override → plan discount, floored at 5%.
- Ledger entries for sales, delivery fees, discounts, commissions, affiliate commission, seller payable and payouts.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 App Router (JavaScript) |
| UI | React 19, Tailwind CSS 4, lucide-react |
| Data | PostgreSQL in production; embedded PGlite for local development |
| Auth | `jose` (HS256 JWT), `bcryptjs` |
| Validation | `zod` |
| Fonts | Plus Jakarta Sans and JetBrains Mono (self-hosted via Fontsource) |

## Getting started

**Requirements:** Node.js 20.9+ and npm.

```bash
git clone https://github.com/johnlenya/martify.git
cd martify
npm install

cp .env.example .env.local
# Generate a session secret and put it in AUTH_SECRET:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

npm run db:reset   # create the schema and seed sample data
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

No database server is required for local development. If `DATABASE_URL` is unset, Martify runs an embedded PostgreSQL-compatible database in `.data/martify-pg`, created and seeded automatically on first request. `npm run db:reset` wipes and reseeds it.

### Demo accounts

The seed creates three accounts. These credentials are for the local demo database only.

| Role | Email | Password |
| --- | --- | --- |
| Customer | `demo@martify.co.ke` | `Demo1234!` |
| Seller | `amina@sokoyard.co.ke` | `Seller123!` |
| Admin | `admin@martify.co.ke` | `Admin123!` |

The login screen also has one-click demo buttons. Never reuse these credentials in a deployed environment.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `APP_URL` | Yes in production | Canonical origin used for metadata, OAuth redirect URLs and absolute links. |
| `AUTH_SECRET` | Yes in production | Random string of at least 32 characters used to sign session tokens. Local development falls back to a throwaway secret if unset. |
| `AUTO_SEED` | No | Set to `true` to seed an empty database on first connection. Leave unset or `false` in production. |
| `DATABASE_URL` | Production | PostgreSQL connection string. When absent, the embedded PGlite database is used. |
| `DATABASE_SSL` | No | Set to `true` when the managed database requires TLS. |
| `PGLITE_DIR` | No | Override the embedded database directory (default `.data/martify-pg`). |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | No | Enable Google sign-in. `GOOGLE_REDIRECT_URI` defaults to `APP_URL/api/auth/google/callback`. |

Payment-provider, upload and messaging variables in `.env.example` are reserved placeholders. They are not read by this build; adding keys alone will not enable live payments, uploads or messaging.

## Payments and safety

Martify is deliberately a **simulated-payment demo**:

- M-Pesa, card and cash-on-delivery checkouts create orders with a pending payment status. A demo endpoint can mark them paid; no Daraja STK Push, Paystack/Flutterwave charge, card field or webhook is implemented.
- No real money is collected, held, split or paid out. Seller balances, commissions, refunds and affiliate earnings are simulated ledger values.
- No raw card data is requested or stored.
- Running a real marketplace in Kenya requires licensed payment partners, merchant onboarding, KYC, webhook signature verification, reconciliation, tax handling and regulated customer-funds controls. This codebase is not that system.

Do not enter real personal or payment information into a public deployment of this demo.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run build` | Create a production build. |
| `npm start` | Serve the production build. |
| `npm run db:seed` | Seed an empty database; exits if data already exists. |
| `npm run db:reset` | Wipe and reseed the database. |

For a remote database, pass the connection string explicitly:

```bash
DATABASE_URL="postgres://..." DATABASE_SSL=true npm run db:seed
```

## Project structure

```
app/
  (auth)/            Login and registration
  (shop)/            Storefront, account, checkout, seller/admin previews
  api/               Route handlers for auth, checkout, orders, search, account
components/          Client islands and UI primitives
lib/                 Data access, auth, pricing, validation, i18n, seed logic
  db/schema.sql      PostgreSQL schema
scripts/seed.mjs     Database reset/seed entry point
```

Money is stored as integer cents throughout. Display helpers live in `lib/money.js` and render KES values.

## Deployment

Use a managed PostgreSQL database and a Node host or serverless platform that supports Next.js 16.

1. Create a PostgreSQL database (Neon, Supabase, RDS, etc.).
2. Import the repository into your host and set `DATABASE_URL`, `DATABASE_SSL=true`, `APP_URL`, a strong `AUTH_SECRET`, and `AUTO_SEED=false`.
3. Run `npm run build` and deploy.
4. Create the schema by making the first request (the app applies `lib/db/schema.sql` on connection). For a demo deployment, seed explicitly with `npm run db:seed`; never ship the demo accounts to a real marketplace.

PGlite is intended for local development only. Its data directory is local disk storage and will not persist on serverless platforms.

Optional Google sign-in also needs the OAuth redirect URI `https://your-domain/api/auth/google/callback` registered in Google Cloud Console.

## Roadmap

- Seller console: onboarding/verification, product and variant CRUD, image uploads, order fulfilment, analytics, payouts and sponsored placement purchases.
- Admin console: seller/product approvals, category and commission management, banners, flash sales, coupons, users, orders, disputes, refunds and platform reporting.
- Live payment adapters with server-side webhook verification (M-Pesa Daraja, Paystack/Flutterwave) and a licensed payout process.
- Cloudinary/S3 uploads, email/SMS notifications, generated sitemap and robots routes.
- Automated unit/integration tests, Playwright journeys and distributed rate limiting.

## License

MIT © 2026 John Lenya. Product photography comes from Unsplash and Pexels; sellers, products, prices and reviews are fictional.
