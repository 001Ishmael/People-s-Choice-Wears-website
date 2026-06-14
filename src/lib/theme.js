/* ============================================================
   PC Wears — shared theme tokens for the marketplace pages.
   (Mirrors the brand constants used in App.jsx so the new
    marketplace files stay visually consistent without importing
    from the big App component.)
   ============================================================ */
export const GOLD = "#C9A24B";
export const GOLD_LIGHT = "#E3C77E";
export const BLACK = "#0B0A08";
export const INK = "#161310";
export const NAVY = "#0E1828";
export const NAVY_SOFT = "#16243A";
export const CREAM = "#F5EFE3";
export const CREAM_DARK = "#E7DECB";
export const MUTED = "#8C8576";
export const WHITE = "#FFFFFF";

export const WA_NUMBER = "23279468780";
export const waLink = (msg) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg || "")}`;
export const fmtLe = (n) => "Le " + Number(n || 0).toLocaleString("en-US");

export const slugify = (s) =>
  (s || "")
    .toString()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);

/* small shared label list for vendor types */
export const VENDOR_TYPES = [
  ["clothing_brand", "Clothing Brand"],
  ["boutique", "Boutique"],
  ["tailor", "Tailor"],
  ["fashion_designer", "Fashion Designer"],
  ["fabric_store", "Fabric Store"],
  ["perfume_seller", "Perfume Seller"],
  ["cosmetics_seller", "Cosmetics Seller"],
  ["shoe_seller", "Shoe Seller"],
  ["watch_seller", "Watch Seller"],
  ["accessories_seller", "Accessories Seller"],
  ["other", "Other"],
];
