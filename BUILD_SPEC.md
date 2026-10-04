# BUILD SPEC: CHICKEN TOWN ORDERING APP

I am a non-technical founder. Explain every step in plain language and tell me exactly what to click or paste (Supabase, GitHub, Vercel). Build in the phases below. STOP at the end of each phase, tell me what to test, and wait for me to say "next" before continuing. Do not build anything outside this spec.

## DESIGN REFERENCE
Read /design/DESIGN.md first. It lists every screen with its image in /design/screens/. Before building each screen, open its PNG and match it. If a PNG and DESIGN.md disagree, DESIGN.md wins. /design/wireframes.html is the same design as code (exact spacing). Photos shown as grey boxes should use real food photos from the database.

## 1. OBJECTIVES AND USERS
Mobile-first web app for Chicken Town, a chicken restaurant chain in Freetown, Sierra Leone. Currency is Le (format "Le 90").
The app must be installable as a PWA on Android and iPhone home screens (web app manifest, service worker for app shell caching, Apple touch icon, install prompt). Menu and orders must always load fresh from Supabase (no API data caching).
On desktop screens, the app is centered in a phone-width column (max-width 430px) with the page background #F6F5F4 around it. The bottom nav stays inside that column.
Objectives:
- a) Customers browse the menu and place delivery or pickup orders.
- b) Staff manage orders live.
- c) The owner can add, edit and delete menu items, prices and offers at any time without touching code.

Users: customers (guest or signed in), branch staff, owner.

## 2. NON-NEGOTIABLE RULES (enforce in the database, not only in the UI)
- R1. Prices are saved at order time. order_items stores item name and unit price as they were. Editing the menu must NEVER change old orders.
- R2. Order totals are calculated in the database (a function), never trusted from the browser.
- R3. Access rules via Supabase Row Level Security:
  - owner: sees and edits everything.
  - branch_staff: sees and updates ONLY orders for their own branch. Cannot edit menu, prices or settings.
  - customer: sees only their own orders, profile, addresses and favourites.
  - public: can read available menu items and branches, and create an order.
- R4. Offers show to customers only when is_active is true and the current time is between starts_at and ends_at.
- R5. Order status moves only: new, preparing, ready, completed, or cancelled.
- R6. A guest order must still work. user_id is nullable. The guest confirmation page reads the order through a secure function using the order id returned at creation.

## 3. DATA MODEL (Postgres on Supabase)
- branches(id, name, address, phone, delivery_fee default 0, is_active)
- profiles(id = auth user id, full_name, phone, role customer|branch_staff|owner, branch_id nullable)
- categories(id, name, sort_order)
- menu_items(id, category_id, name, description, price, original_price nullable, image_url, is_available, is_offer, offer_starts_at, offer_ends_at, sort_order)
- item_options(id, menu_item_id, label, extra_price default 0) -- e.g. drink choice on a combo
- orders(id uuid, order_number, user_id nullable, customer_name, phone, order_type delivery|pickup, address, branch_id, note, status, subtotal, delivery_fee, total, payment_method cash|mobile_money, payment_status unpaid|pending_verification|paid, payment_reference, created_at)
- order_items(id, order_id, menu_item_id, item_name, unit_price, quantity, option_label)
- saved_addresses(id, user_id, label, address)
- favourites(user_id, menu_item_id)
- settings(single row: call_number "392", whatsapp_number "+232 80 600 700", orange_money_number, afrimoney_number)

Simplified for v1: one shared menu for all branches, no per-branch stock.

## 4. SCREENS
Follow /design/DESIGN.md and the PNGs in /design/screens/. Style: modern, minimal, lots of white space, rounded shapes. Brand red #CC1A16. Customer bottom bar is a floating pill with ICONS ONLY (no text): home, offers, cart, profile.

Customer: Welcome, Sign in, Sign up, Home, Item detail, Cart, Checkout, Order confirmation, Profile, My orders.
Staff admin (/admin, login required): Orders (live, realtime, sound on new order, one-tap status buttons, mark payment verified), Menu manager and Edit item (owner only), Branches and settings (owner only: branch delivery fee, phone numbers, mobile money numbers).

## 5. PAYMENTS (v1)
- Pay on delivery/pickup: payment_status stays unpaid until staff mark it paid.
- Mobile money: NO automatic payment API in v1. Show the customer the Orange Money / Afrimoney number from settings and the total; the customer pays outside the app and types the transaction reference. payment_status becomes pending_verification and staff verify it in the admin Orders screen.

## 6. DELIVERY FEE
Each branch has a delivery_fee, default 0, editable by the owner. Show "Free delivery" when 0. Checkout and orders use the fee at the time of the order (R1).

## 7. OUT OF SCOPE FOR V1 (do not build)
Automatic mobile money integration, SMS or push notifications, driver tracking or maps, ratings and reviews, loyalty points, discount codes, per-branch menus or stock, multiple languages, native mobile app.

## 8. STACK
React + Vite + TypeScript + Tailwind + React Router, Supabase (Postgres, Auth, Realtime, Storage for images), GitHub, Vercel. Keep it simple. No paid services.

## 9. BUILD ORDER (one phase at a time)
- Phase 0: Scaffold the project, design tokens from DESIGN.md, routing, env file setup. Show it running.
- Phase 1: Database only. Write the SQL (tables, constraints, create_order function, RLS policies) and seed data. Test with dummy orders in SQL, including R1 (change a price, confirm old orders do not change) and R2. No screens yet.
- Phase 2: Customer Home, Item detail and Cart (screens 04, 05, 06) using a temporary mock user, controlled by a DEV_MOCK_USER env flag that must be OFF in production.
- Phase 3: Checkout, order creation, confirmation and My orders (screens 07, 08, 10).
- Phase 4: Admin menu manager and edit item/offer with image upload (screens 11, 12).
- Phase 5: Admin live orders with realtime, status changes and payment verification (screen 13).
- Phase 6: Real authentication: Welcome, Sign in, Sign up, Profile (screens 01, 02, 03, 09), roles, branch staff, and finalize RLS. REQUIRED: remove the mock user and test every R3 rule with a customer, a branch staff user and the owner.
- Phase 7: Deploy to Vercel, add environment variables, give me the live URL.

After phase 7: write automated tests for R1 to R6, and give me a manual testing checklist (empty fields, zero or negative quantities, odd characters, a second phone).

## 10. SEED DATA (all prices in Le; I will edit later in admin)
- Branches: Old Railway Line, Charlotte St, Wilberforce St, Aberdeen Beach Road, [5th branch: name to confirm]
- Super Promo: Mami Meal 20 (rice and egg), Sissy Meal 30 (+1 crispy wing), Mama Sharp 40 (+1 crispy wing, +1 sticky wing), Slay Queen 60 (1 crispy wing, 1 sticky wing, 1 mini burger)
- Mains: CT-Wrap 90, Burger 90, Frontline Burger 100, Chicken & Chips 90, Fried Rice 50, Drumstick 45, CT-Salad 110, Whole Chicken 200 (original price 370, offer)
- Sides: Chips Masala 55
- Combos: Wrap Combo 140 (wrap, chips, Sierra juice), BBQ Wings Meal 140 (wings, chips, Coke), Classic Box 150 (2 drumsticks, 1 side, 1 soft drink), Family Deal 460 (4 wings, 2 burgers, 2 wraps, 2 sides, 2 drinks)
- Drinks: Coca-Cola 15, Sierra Juice 15, Bottle Water 10
- Desserts: CT Ice Cream 35, H-B Ice Cream 45
