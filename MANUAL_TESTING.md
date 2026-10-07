# Chicken Town — Manual Testing Checklist

Test these on your phone (or Chrome DevTools device emulation) and on desktop.

## 1. Empty Fields
- [ ] Checkout with empty Name → Place order should not submit
- [ ] Checkout with empty Phone → Place order should not submit
- [ ] Checkout with empty Address (delivery) → Place order should not submit
- [ ] Sign in with empty Email → should not submit
- [ ] Sign in with empty Password → should not submit
- [ ] Sign up with empty Full name → should not submit
- [ ] Sign up with empty Phone → should not submit
- [ ] Sign up with empty Email → should not submit
- [ ] Sign up with empty Password → should not submit
- [ ] Admin edit item with empty Name → should not save
- [ ] Admin edit item with empty Price → should not save
- [ ] Saved address with empty Label → should not save
- [ ] Saved address with empty Address → should not save

## 2. Zero or Negative Quantities
- [ ] Item detail: tap minus at quantity 1 → should stay at 1 (not go to 0)
- [ ] Cart: tap minus at quantity 1 → item should be removed from cart
- [ ] Cart: quantity never shows 0 or negative
- [ ] Checkout with empty cart → Place order button disabled

## 3. Odd Characters
- [ ] Name with special characters: `!@#$%^&*()` → should accept
- [ ] Name with emoji: `🍗 Test` → should accept
- [ ] Name with SQL injection: `'; DROP TABLE orders; --` → should accept (not execute)
- [ ] Phone with letters: `abc123` → should accept (no validation)
- [ ] Address with special characters: `<script>alert(1)</script>` → should accept (not execute)
- [ ] Note with special characters: `!@#$%^&*()` → should accept
- [ ] Transaction reference with special characters: `REF-123!@#` → should accept
- [ ] Search with special characters → should not crash

## 4. Second Phone
- [ ] Place order with a different phone number than the one on the account → should work
- [ ] Order confirmation should show the phone used at checkout
- [ ] My orders should show the order regardless of which phone was used

## 5. Guest Flow
- [ ] New visitor → Welcome screen → Continue as guest → Home loads
- [ ] Guest can browse menu, search, add to cart
- [ ] Guest cart persists on page refresh (localStorage)
- [ ] Guest cart clears when tab closes (sessionStorage flag)
- [ ] Guest tries to checkout → prompted to sign in
- [ ] Guest signs in at checkout → cart intact after sign-in
- [ ] Guest opens /admin/orders → redirected to Welcome
- [ ] Guest opens /profile → sees "Sign in" button
- [ ] Guest opens /orders → redirected to Welcome

## 6. Auth Flow
- [ ] Sign up → auto sign-in → Home loads
- [ ] Sign out → Welcome screen
- [ ] Sign in with wrong password → error message
- [ ] Sign in with correct credentials → Home loads
- [ ] Deep link /offers while signed out → Welcome → after sign-in → /offers
- [ ] Deep link /cart while signed out → Welcome → after sign-in → /cart
- [ ] Returning user with valid session → skips Welcome, goes to Home

## 7. RLS Rules
- [ ] Customer 1 places order → Customer 2 cannot see it in My orders
- [ ] Customer cannot access /admin/menu → redirected or empty
- [ ] Customer cannot access /admin/orders → redirected or empty
- [ ] Branch staff sees only their branch's orders in /admin/orders
- [ ] Branch staff cannot access /admin/menu → redirected or empty
- [ ] Owner sees all orders in /admin/orders
- [ ] Owner can access /admin/menu and /admin/settings

## 8. Orders
- [ ] Place order → confirmation page shows order number
- [ ] Order appears in My orders under Active
- [ ] Admin sees new order under New chip
- [ ] Admin taps "Start preparing" → status changes to Preparing
- [ ] Admin taps "Mark ready" → status changes to Ready
- [ ] Admin taps "Complete" → status changes to Completed
- [ ] Customer sees status update in real-time on confirmation page
- [ ] Mobile money order → payment_status = pending_verification
- [ ] Admin taps "Mark paid" → payment_status = paid

## 9. Payments
- [ ] Pay on delivery → payment_status = unpaid
- [ ] Mobile money → shows Orange Money and Afrimoney numbers
- [ ] Mobile money → transaction reference field required
- [ ] Mobile money with empty settings → shows "numbers not set" message
- [ ] Place order button disabled for mobile money when numbers not set

## 10. Menu
- [ ] Admin edits price → old orders keep original price (R1)
- [ ] Admin toggles item availability → item disappears from Home
- [ ] Admin adds new item → appears on Home
- [ ] Admin edits item name → updates on Home
- [ ] Offer with future start date → not shown on Offers page
- [ ] Offer with past end date → not shown on Offers page
- [ ] Offer with no dates → shown on Offers page

## 11. PWA
- [ ] Install prompt appears on Android Chrome
- [ ] Add to Home Screen on iPhone Safari
- [ ] Installed app opens standalone (no browser bar)
- [ ] Service worker caches app shell
- [ ] Menu and orders always load fresh from Supabase

## 12. Navigation
- [ ] Bottom nav visible on Home, Offers, Cart, Profile
- [ ] Bottom nav hidden on Welcome, Sign in, Sign up, Item detail, Checkout, Confirmation
- [ ] Cart icon shows red dot when cart has items
- [ ] Sticky cart bar appears above nav after adding items
- [ ] Sticky cart bar shows correct count and total

## 13. Desktop
- [ ] App centered in 430px column on wide screens
- [ ] Background #F6F5F4 around the column
- [ ] Bottom nav stays inside the column
- [ ] All screens usable on desktop

## 14. Performance
- [ ] Images lazy-loaded
- [ ] Admin uploads compressed to max 1200px WebP
- [ ] No blank screens — loading states shown
- [ ] No console errors
