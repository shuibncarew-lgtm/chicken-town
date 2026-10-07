# Chicken Town: design reference for the build

How to use this folder:
- `screens/*.png` = the exact look of each screen (mobile, 390px wide target). Open the PNG named in each section when building that screen.
- `wireframes.html` = same screens as code. Use it for exact spacing and structure.
- Rule: if a PNG and this file disagree, this file wins. The PNGs use grey boxes for photos and the real app uses real food photos.

## Design tokens
- Brand red: #CC1A16 (dark mode #E5332D). The ONLY accent colour. Use for primary buttons, prices on item detail, offer badges, active nav icon, toggles.
- Light: page #F6F5F4, card #FFFFFF, fill #F2F0EE, line #E8E5E2, text #1B1918, muted #5F5A56
- Dark: page #141211, card #1E1B1A, fill #2A2625, line #2F2B29, text #F3EFEC, muted #B0AAA4
- Font: DM Sans (400, 500, 700). Base 13px. Headings 19px bold (screen title), 15px (item name), 15px (page header). Prices bold.
- Radius: phone card 34, cards and photos 16-18, buttons 18, fields 14, chips 14, bottom nav pill 30, round buttons 50%
- Shadow (floating nav and sheets): 0 8px 28px rgba(27,25,24,.10)
- Style: lots of white space, no borders on cards (use fill colour), no gradients, no percentage-off banners.
- Icons: lucide-react, stroke 1.7. Map: house, tag, shopping-bag, user, search, map-pin, chevron-left, chevron-right, chevron-down, heart, plus, minus, check, receipt, layout-grid, phone, message-circle, circle-help, log-out, image.
- Contrast: minimum 4.5:1 for text. Muted text #5F5A56 on light, #B0AAA4 on dark. Old price 14px.
- Image placeholder: soft #F2F0EE background with faint "CT" mark at 15% opacity. NO plus icon in placeholder.
- Add-to-cart: grid card has red round + (36px visible, 44px tap area) on image bottom-right. After tap, becomes red pill stepper. Item screen has full-width red "Add to cart · Le X" button.
- Offer badges: "Save Le X" pill (red bg, white text) for items with original_price. "Bundle" tag for items without. Never use percentages.

## Navigation
- Customer bottom bar: floating pill, ICONS ONLY, NO TEXT: house (Home), tag (Offers), shopping-bag (Cart, small red dot when cart has items), user (Profile). Active icon = white icon inside a red circle (40px). Inactive = muted grey.
- Admin bottom bar: icons only: receipt (Orders), layout-grid (Menu). Owner also gets two more icons: store/map-pin (Branches) and settings (Settings).
- Bar is shown on: Home, Offers, Cart tab, Profile, and admin screens. Hidden on: Welcome, Sign in, Sign up, Item detail, Checkout, Confirmation.

## Screens (route, image, behaviour)

### 01 Welcome. `/welcome` · screens/01-welcome.png
Full-screen food photo, white bottom sheet with logo text, headline "Hot, fresh and on its way.", tagline "Swit u mot, swit u lyf.". Buttons: Order now (red, goes to Sign up), Sign in (grey), "Continue as guest" (text, goes to Home). Shown once on first open.

### 02 Sign in. `/sign-in` · screens/02-sign-in.png
Back button, logo, title "Welcome back", tabs Sign in | Sign up. Fields: Email, Password. "Forgot password?" link. Red Sign in button, "or", Continue with Google, Continue as guest.

### 03 Sign up. `/sign-up` · screens/03-sign-up.png
Fields: Full name, Phone, Email, Password. Red Create account button pinned to bottom. Phone is saved to profile.

### 04 Home. `/` · screens/04-home.png
Top: branch picker (map-pin + name + chevron-down) and round search button. Headline "What are you eating today?". Offers banner (red card with image) from menu_items where is_offer and within dates. Category chips (first chip active = dark pill). 2-column item cards: photo, name, price (old price struck through if set), red round + button. Scrolls vertically; bottom nav stays fixed.

### 05 Item detail. `/item/:id` · screens/05-item-detail.png
Large photo with round back and heart buttons overlaid. Name left, price right in red. Short description. Option selector (segmented control from item_options, e.g. drink). Quantity stepper left, total right. Red Add to cart button.

### 06 Cart. `/cart` · screens/06-cart.png
Header with back. Rows: photo, name, unit price, stepper. Bottom: Subtotal, Delivery (branch fee, "Free delivery" if 0), Total, red Checkout button.

### 07 Checkout. `/checkout` · screens/07-checkout.png
Segmented Delivery | Pickup. Fields: Name, Phone (prefilled when signed in), Address (delivery only), Nearest branch, Note. Payment row: Pay on delivery/pickup OR Mobile money. If Mobile money: show Orange Money / Afrimoney number and total, plus a "Transaction reference" field. Red Place order button with total.

### 08 Order confirmation. `/order/:id` · screens/08-order-confirmation.png
Red check circle, "Order received", order number. Status timeline: Received, Preparing, Ready, Delivered (updates live via realtime). Order summary card. Row of two round buttons (phone = call 392, message-circle = WhatsApp +232 80 600 700) and a red Track order button.

### 09 Profile. `/profile` · screens/09-profile.png
Avatar, name, email. Rows with icon tile + label + chevron: Personal information, My orders, Saved addresses, Favourites, Help and support (opens call and WhatsApp), Log out.

### 10 My orders. `/orders` · screens/10-my-orders.png
Tabs Active | Past. Order cards: number, status badge (red = active, grey = done), items, total, Track or Reorder (red text).

### 11 Admin menu. `/admin/menu` · screens/11-admin-menu.png (owner only)
Title Menu, red round + button (add item). Category chips. Rows: small photo, name, price, availability toggle (red = available). Offers show a red "Offer" badge. Tap a row to edit.

### 12 Admin edit item. `/admin/menu/:id` · screens/12-admin-edit-item.png (owner only)
Upload photo area, Name, Price, Old price, "Run as an offer" toggle, Starts and Ends dates, Save changes (red). Also category and options.

### 13 Admin orders. `/admin/orders` · screens/13-admin-orders.png (owner and branch staff)
Title Orders with "3 new" badge. Chips New | Preparing | Ready. Order cards: number, Delivery or Pickup, items, total, red action chip that moves to the next status. Live updates, sound on new order. Show payment status and a "Mark paid / verify reference" action. Branch staff see only their branch.

## Rules for the build
- Build mobile-first. Admin screens should also work on a laptop (centre the content, max width 480 for lists, or two columns for orders).
- Support dark mode with the tokens above.
- All text, prices, offers and images come from the database. Nothing hardcoded.
