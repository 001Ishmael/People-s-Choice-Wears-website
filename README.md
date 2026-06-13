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
