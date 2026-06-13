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

