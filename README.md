# PC Wears — People's Choice Wears

Premium fashion & lifestyle e-commerce website for **PC Wears**, Freetown, Sierra Leone.
*"Crafted with Choice. Worn with Pride."*

Dark luxury theme (black · navy · gold · cream · white), built with **React + Vite + Tailwind CSS**.
Customers browse, filter, save favourites, add to cart, and order directly through WhatsApp.
An admin dashboard manages products and orders.

## Features

- Home with hero, categories, best sellers, new arrivals, why-choose, testimonials, social follow & newsletter
- Shop with search, category, price, collection filters and price sorting
- Product detail pages, quick-view modal, related products
- Wishlist (favourites)
- Slide-in cart drawer + full cart page with WhatsApp checkout (name + delivery/pickup + note)
- Custom order page with reference-photo upload
- About & Contact (hours, email, map placeholder, socials)
- Floating WhatsApp, Facebook & TikTok buttons on every page
- Admin: add/edit/delete products, image upload, stock = Available / Sold Out / Coming Soon, feature toggles
- Order management with daily/weekly/monthly counts, search, status & payment tracking
- **PC Cosmetics** page (lipsticks, foundation, palettes, skincare and more)
- **Blog** with admin authoring (write, edit, delete posts)
- **AI Style Advisor** chatbot for outfit design & color advice
- **Meet Our Team** page + admin team management (add/edit/hide/reorder, photos)
- **Customer records** with men's/women's measurements and reference images
- **Full order management**: auto order & invoice numbers, fabric/style details, assigned tailor, status
- **Payments**: deposits/part/full, methods, auto balance & payment status
- **Invoices, receipts & measurement sheets** — print, save as PDF, share on WhatsApp
- **Dashboard summaries**, search & filters, CSV export, fabric inventory
- **Staff roles & logins**: Owner, Manager, Sales, Tailor, Viewer
- **WhatsApp reminders** for unpaid balance, order ready, and due-soon
- **Customer accounts**: sign in to see cart, orders, wishlist and new-stock alerts
- **New-stock notifications**: "What's new" feed for account holders; auto alerts when products are added or restocked
- **Inventory in/out** movements + **fabric auto-deduction** when materials are used on a custom order
- **Expenses** tracking and **Reports** (today / week / month / year) with sales, expenses and profit
- **Investor ledger** (internal) + an enquiry-only public Partner page
- **Customer accounts**: sign up / log in, see cart, wishlist, orders & new-stock alerts
- **Investment Club**: public plans + return estimator; admin tracks investors, capital, returns & payouts
- **Expenses** tracking and **stock in/out** with movement history
- **Auto material deduction**: materials used on a custom order are removed from inventory and logged
- **Reports**: daily / weekly / monthly / yearly revenue, expenses, net, sales by category, CSV export
- Loading animation, smooth scroll, mobile-first, SEO meta tags

## Business details

- **WhatsApp / Phone:** +232 79 468 780
- **Location:** 25 Sanders Street, Freetown, Sierra Leone
- **Social:** Facebook, TikTok, WhatsApp (only platforms with real links are shown)

## Run locally

```bash
npm install
npm run dev
```

Open the URL shown (usually http://localhost:5173).

## Build & deploy on Vercel

```bash
npm run build      # output goes to /dist
npm run preview    # preview the production build
```

On **Vercel**: connect this GitHub repo. Framework preset **Vite**, build command `npm run build`,
output directory `dist`. (A `vercel.json` is included.) Works the same on Netlify.

## Admin access

Footer → **Admin login** (or the mobile menu → Admin).
Default password: `pcwears2026` — **change it** in the dashboard Settings tab after first login.

## Connect a database (sync products across all devices)

By default, products and orders are saved in each visitor's browser (`localStorage`), so
changes you make on one device won't show on another. To make one shared catalogue for
everyone, connect **Supabase** — it's free and takes a few minutes. Everything is isolated
in **`src/lib/store.js`**; full step-by-step instructions (table SQL, env vars, and the exact
code to paste) are in the comments at the bottom of that file. You only edit that one file.

For product images at scale, store them in Supabase Storage or Cloudinary and save just the URL.

## Customising

- Prices show as "Le" — set real prices in the admin dashboard.
- Replace the placeholder email (`hello@pcwears.sl`) in `src/App.jsx` (`EMAIL` constant) and Contact page.
- Add your Google Map embed where the map placeholder is on the Contact page.
- Sample products ship so the shop never looks empty — delete them as you add real items,
  or restore them from Settings.

## Make the Style Advisor fully live (AI)

The **Style Advisor** page gives outfit and color advice. Out of the box on a deployed
site it uses a built-in stylist (smart keyword-based suggestions) so it always works with
no setup. To power it with live AI, route its request through a small serverless function
that holds your Anthropic API key (never put the key in frontend code):

1. Get an API key from https://console.anthropic.com
2. On Vercel, add a serverless function at `api/style.js` that forwards the chat messages
   to `https://api.anthropic.com/v1/messages` with your key in the `x-api-key` header and
   `anthropic-version: 2023-06-01`. Store the key as a Vercel Environment Variable.
3. In `src/App.jsx`, change the Style Advisor `fetch("https://api.anthropic.com/v1/messages", ...)`
   call to `fetch("/api/style", ...)` so it calls your function instead.

If the AI call ever fails, the page automatically falls back to the built-in advisor, so
customers always get useful guidance.

## Staff logins & roles

The dashboard supports roles with different access:

- **Owner / Admin** — full access (logs in with the admin password)
- **Manager** — customers, orders, payments, products, inventory, team, blog
- **Sales Staff** — customers, orders, payments, receipts
- **Tailor / Production** — view and update assigned orders
- **Viewer** — read-only

The Owner creates staff logins (name + role + passcode) under the **Staff** tab. Each staff
member then logs in with their passcode and only sees what their role allows.

## Invoices, receipts & PDFs

Open any order and use **Invoice**, **Receipt**, or **Measure** to generate a branded
document with your logo, slogan, address, WhatsApp, totals, balance, a signature line and a
thank-you note. **Print** uses your browser's print dialog; to save a PDF, choose
"Save as PDF" as the printer destination (that's what the **Download PDF** button opens).
**Share on WhatsApp** sends the customer a formatted summary.

## Why connect a database (important)

By default everything is stored in the browser (`localStorage`) for testing only — records
won't follow you to another device and could be cleared. **Before real business use,
connect Supabase** so customers, measurements, orders, payments, staff, team and images are
saved permanently online and shared across every device and staff phone. It's free and only
touches one file — full instructions (table SQL, env vars, exact code) are in
**`src/lib/store.js`**. For images at scale, use Supabase Storage or Cloudinary and save the URL.

## Customer accounts & the Investment Club

Customers can create a simple account (person icon in the header) to see their cart, saved
items, orders, and a "What's new" feed that updates when you add products or restock. The
**Investment Club** page lets visitors estimate monthly returns and enquire on WhatsApp; the
admin **Investments** tab records each investor's capital, monthly rate, accrued and paid
returns, and lets you send WhatsApp notifications.

> Two honest cautions:
> 1. **Accounts are not secure logins yet.** Without the database connected, they're
>    convenience-only and stored per browser. Connect Supabase (with its built-in Auth) for
>    real, secure, cross-device accounts.
> 2. **Investments are regulated.** Taking public money for returns usually requires approval
>    from financial authorities (in Sierra Leone, the Bank of Sierra Leone) and written terms.
>    This module is a record-keeper, not a licence or a payment processor. Get professional
>    legal/financial advice before accepting funds. An editable disclaimer is shown on the page.

## Inventory, materials & reports

Record fabric stock and Stock In / Stock Out movements under **Inventory**. When you build a
custom order, use the **Materials used** box on the order — the quantity is deducted from
fabric stock immediately and logged (you can return it to stock too). The **Expenses** tab
records business costs, and **Reports** rolls everything into daily/weekly/monthly/yearly
figures (revenue actually received, sales booked, expenses, investment payouts, net, new
customers, and sales by category), all exportable to CSV.

## Customer accounts (important note on security)

Shoppers can create an account (name, phone, passcode) to save their cart, track orders, see
their wishlist and receive new-stock alerts. **This is a lightweight, front-end-only login**
for convenience — it is not secure authentication. Do not rely on it to protect sensitive data.
When you connect Supabase (see `src/lib/store.js`), use Supabase Auth for real, secure
customer logins.

## Investments — please read

The public **Partner** page is an *expression-of-interest* form only. It does not collect money,
does not advertise guaranteed returns, and creates no agreement — it simply sends an enquiry to
your WhatsApp so you can discuss real, written terms directly.

Offering investments to the public with promised returns is a **regulated activity** in most
countries, including Sierra Leone (Bank of Sierra Leone). Taking deposits or promising monthly
returns without the proper licence can be unlawful and can seriously harm both your customers and
your business. Before promoting any investment or returns:

- Get advice from a qualified lawyer and confirm the licensing position with the Bank of Sierra Leone.
- Provide every investor with full written terms and a clear risk warning.
- Consider lower-risk, compliant alternatives such as a savings/layaway plan or a loyalty programme.

The admin **Investments** tab is an internal ledger for recording genuine, properly-agreed
investors and payouts. It is bookkeeping only — it does not make any offering lawful by itself.

## Connected to Supabase (live database)

This project is wired to Supabase for the back-office data. The data layer lives in
`src/lib/supabase.js` (client) and `src/lib/db.js` (table mapping), and `src/lib/store.js`
routes each collection to the right place.

**Saved to Supabase:** products, customers (+ measurements), orders (+ payments + materials),
staff records, inventory (+ stock movements), invoices, receipts, and uploaded images
(Supabase Storage buckets: `product-images`, `staff-photos`, `customer-files`, `order-files`).

**Still local (per-device) by design:** cart, wishlist, customer accounts, blog, team,
expenses, investor ledger, notifications. These have no table in the SQL you ran; tell me if
you want them moved to Supabase too and I'll extend the schema and the data layer.

### Environment variables (already set in Vercel)

```
VITE_SUPABASE_URL=...        # your project URL
VITE_SUPABASE_ANON_KEY=...   # your anon/public key
```

For local development, create a `.env` file in the project root with the same two lines.
If the variables are missing, the app automatically falls back to local storage so it still runs.

### Staff login is now Supabase Auth (required by row-level security)

Your tables use row-level security, so only a signed-in **staff** user can read or write the
private records. The dashboard login now uses Supabase email/password. To give someone access:

1. Supabase -> Authentication -> Users -> Add user (email + password). Copy the user UUID.
2. Add them to the `staff` table with their role, e.g. in the SQL editor:
   `insert into public.staff (auth_user_id, name, role) values ('UUID', 'Name', 'owner');`
   (Roles: owner, manager, sales, tailor, viewer.) The owner you created during SQL setup can
   also add staff later.
3. That person can now log in at the dashboard with their email and password.

### Things to know / test

- New records get real UUID ids, and order numbers (`PCW-0001`) are generated by the database.
  After creating an order you may need to refresh to see its final number and totals.
- Product/staff images go to public buckets; customer/order reference images go to private
  buckets and are shown via short-lived signed URLs.
- Please test each area (add a product, customer, order, payment, upload an image) against your
  live project and check the Supabase Table Editor to confirm rows appear.

