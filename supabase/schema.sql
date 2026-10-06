-- Chicken Town Database Schema
-- Phase 1: Tables, constraints, create_order function, RLS policies, seed data

-- ============================================
-- 1. TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  phone text NOT NULL,
  delivery_fee numeric(10,2) NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'branch_staff', 'owner')),
  branch_id uuid REFERENCES branches(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES categories(id),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  original_price numeric(10,2),
  image_url text NOT NULL DEFAULT '',
  is_available boolean NOT NULL DEFAULT true,
  is_offer boolean NOT NULL DEFAULT false,
  offer_starts_at timestamptz,
  offer_ends_at timestamptz,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS item_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id uuid NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  label text NOT NULL,
  extra_price numeric(10,2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  user_id uuid REFERENCES auth.users(id),
  customer_name text NOT NULL,
  phone text NOT NULL,
  order_type text NOT NULL CHECK (order_type IN ('delivery', 'pickup')),
  address text NOT NULL DEFAULT '',
  branch_id uuid NOT NULL REFERENCES branches(id),
  note text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'preparing', 'ready', 'completed', 'cancelled')),
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  delivery_fee numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  payment_method text NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'mobile_money')),
  payment_status text NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'pending_verification', 'paid')),
  payment_reference text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES menu_items(id),
  item_name text NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  option_label text NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS saved_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL,
  address text NOT NULL
);

CREATE TABLE IF NOT EXISTS favourites (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  menu_item_id uuid NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, menu_item_id)
);

CREATE TABLE IF NOT EXISTS settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  call_number text NOT NULL DEFAULT '392',
  whatsapp_number text NOT NULL DEFAULT '+232 80 600 700',
  orange_money_number text NOT NULL DEFAULT '',
  afrimoney_number text NOT NULL DEFAULT ''
);

-- ============================================
-- 2. INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_offer ON menu_items(is_offer) WHERE is_offer = true;
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_branch ON orders(branch_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ============================================
-- 3. CREATE_ORDER FUNCTION (R2)
-- ============================================

CREATE OR REPLACE FUNCTION create_order(
  p_customer_name text,
  p_phone text,
  p_order_type text,
  p_address text,
  p_branch_id uuid,
  p_items jsonb DEFAULT '[]'::jsonb,
  p_note text DEFAULT '',
  p_payment_method text DEFAULT 'cash'
) RETURNS uuid AS $$
DECLARE
  v_order_id uuid;
  v_order_number text;
  v_subtotal numeric(10,2) := 0;
  v_delivery_fee numeric(10,2);
  v_total numeric(10,2);
  v_item jsonb;
  v_menu_item record;
  v_option record;
  v_item_total numeric(10,2);
BEGIN
  -- Generate order number
  v_order_number := 'CT-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(floor(random() * 10000)::text, 4, '0');

  -- Get delivery fee from branch
  SELECT delivery_fee INTO v_delivery_fee FROM branches WHERE id = p_branch_id;
  IF v_delivery_fee IS NULL THEN
    RAISE EXCEPTION 'Branch not found';
  END IF;

  -- Calculate subtotal from items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    SELECT * INTO v_menu_item FROM menu_items WHERE id = (v_item->>'menu_item_id')::uuid;
    IF v_menu_item IS NULL THEN
      RAISE EXCEPTION 'Menu item not found: %', v_item->>'menu_item_id';
    END IF;

    v_item_total := v_menu_item.price * (v_item->>'quantity')::integer;

    -- Add option extra price if present
    IF v_item->>'option_id' IS NOT NULL AND v_item->>'option_id' != '' THEN
      SELECT extra_price INTO v_option FROM item_options WHERE id = (v_item->>'option_id')::uuid;
      IF v_option IS NOT NULL THEN
        v_item_total := v_item_total + v_option.extra_price * (v_item->>'quantity')::integer;
      END IF;
    END IF;

    v_subtotal := v_subtotal + v_item_total;
  END LOOP;

  v_total := v_subtotal + v_delivery_fee;

  -- Insert order
  INSERT INTO orders (order_number, customer_name, phone, order_type, address, branch_id, note, subtotal, delivery_fee, total, payment_method)
  VALUES (v_order_number, p_customer_name, p_phone, p_order_type, p_address, p_branch_id, p_note, v_subtotal, v_delivery_fee, v_total, p_payment_method)
  RETURNING id INTO v_order_id;

  -- Insert order items with price snapshot (R1)
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    SELECT * INTO v_menu_item FROM menu_items WHERE id = (v_item->>'menu_item_id')::uuid;

    INSERT INTO order_items (order_id, menu_item_id, item_name, unit_price, quantity, option_label)
    VALUES (
      v_order_id,
      v_menu_item.id,
      v_menu_item.name,
      v_menu_item.price,
      (v_item->>'quantity')::integer,
      COALESCE((SELECT label FROM item_options WHERE id = (v_item->>'option_id')::uuid), '')
    );
  END LOOP;

  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. RLS POLICIES (R3)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE favourites ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION get_current_user_role() RETURNS text AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to get current user branch
CREATE OR REPLACE FUNCTION get_current_user_branch() RETURNS uuid AS $$
  SELECT branch_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- BRANCHES
CREATE POLICY "branches_select_public" ON branches FOR SELECT TO authenticated USING (true);
CREATE POLICY "branches_insert_owner" ON branches FOR INSERT TO authenticated WITH CHECK (get_current_user_role() = 'owner');
CREATE POLICY "branches_update_owner" ON branches FOR UPDATE TO authenticated USING (get_current_user_role() = 'owner');
CREATE POLICY "branches_delete_owner" ON branches FOR DELETE TO authenticated USING (get_current_user_role() = 'owner');

-- PROFILES
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT TO authenticated USING (id = auth.uid() OR get_current_user_role() = 'owner');
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR get_current_user_role() = 'owner');
CREATE POLICY "profiles_delete_owner" ON profiles FOR DELETE TO authenticated USING (get_current_user_role() = 'owner');

-- CATEGORIES
CREATE POLICY "categories_select_public" ON categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "categories_insert_owner" ON categories FOR INSERT TO authenticated WITH CHECK (get_current_user_role() = 'owner');
CREATE POLICY "categories_update_owner" ON categories FOR UPDATE TO authenticated USING (get_current_user_role() = 'owner');
CREATE POLICY "categories_delete_owner" ON categories FOR DELETE TO authenticated USING (get_current_user_role() = 'owner');

-- MENU_ITEMS
CREATE POLICY "menu_items_select_public" ON menu_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "menu_items_insert_owner" ON menu_items FOR INSERT TO authenticated WITH CHECK (get_current_user_role() = 'owner');
CREATE POLICY "menu_items_update_owner" ON menu_items FOR UPDATE TO authenticated USING (get_current_user_role() = 'owner');
CREATE POLICY "menu_items_delete_owner" ON menu_items FOR DELETE TO authenticated USING (get_current_user_role() = 'owner');

-- ITEM_OPTIONS
CREATE POLICY "item_options_select_public" ON item_options FOR SELECT TO authenticated USING (true);
CREATE POLICY "item_options_insert_owner" ON item_options FOR INSERT TO authenticated WITH CHECK (get_current_user_role() = 'owner');
CREATE POLICY "item_options_update_owner" ON item_options FOR UPDATE TO authenticated USING (get_current_user_role() = 'owner');
CREATE POLICY "item_options_delete_owner" ON item_options FOR DELETE TO authenticated USING (get_current_user_role() = 'owner');

-- ORDERS
CREATE POLICY "orders_select_own" ON orders FOR SELECT TO authenticated USING (
  user_id = auth.uid()
  OR get_current_user_role() = 'owner'
  OR (get_current_user_role() = 'branch_staff' AND branch_id = get_current_user_branch())
);
CREATE POLICY "orders_insert_public" ON orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "orders_update_staff" ON orders FOR UPDATE TO authenticated USING (
  get_current_user_role() = 'owner'
  OR (get_current_user_role() = 'branch_staff' AND branch_id = get_current_user_branch())
);
CREATE POLICY "orders_delete_owner" ON orders FOR DELETE TO authenticated USING (get_current_user_role() = 'owner');

-- ORDER_ITEMS
CREATE POLICY "order_items_select_own" ON order_items FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM orders o WHERE o.id = order_items.order_id AND (
      o.user_id = auth.uid()
      OR get_current_user_role() = 'owner'
      OR (get_current_user_role() = 'branch_staff' AND o.branch_id = get_current_user_branch())
    )
  )
);
CREATE POLICY "order_items_insert_public" ON order_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "order_items_update_owner" ON order_items FOR UPDATE TO authenticated USING (get_current_user_role() = 'owner');
CREATE POLICY "order_items_delete_owner" ON order_items FOR DELETE TO authenticated USING (get_current_user_role() = 'owner');

-- SAVED_ADDRESSES
CREATE POLICY "saved_addresses_select_own" ON saved_addresses FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "saved_addresses_insert_own" ON saved_addresses FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "saved_addresses_update_own" ON saved_addresses FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "saved_addresses_delete_own" ON saved_addresses FOR DELETE TO authenticated USING (user_id = auth.uid());

-- FAVOURITES
CREATE POLICY "favourites_select_own" ON favourites FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "favourites_insert_own" ON favourites FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "favourites_delete_own" ON favourites FOR DELETE TO authenticated USING (user_id = auth.uid());

-- SETTINGS
CREATE POLICY "settings_select_public" ON settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "settings_insert_owner" ON settings FOR INSERT TO authenticated WITH CHECK (get_current_user_role() = 'owner');
CREATE POLICY "settings_update_owner" ON settings FOR UPDATE TO authenticated USING (get_current_user_role() = 'owner');
CREATE POLICY "settings_delete_owner" ON settings FOR DELETE TO authenticated USING (get_current_user_role() = 'owner');

-- ============================================
-- 5. SEED DATA
-- ============================================

-- Settings
INSERT INTO settings (id, call_number, whatsapp_number, orange_money_number, afrimoney_number)
VALUES (1, '392', '+232 80 600 700', '', '')
ON CONFLICT (id) DO NOTHING;

-- Branches
INSERT INTO branches (name, address, phone, delivery_fee) VALUES
  ('Old Railway Line', 'Old Railway Line, Freetown', '392', 0),
  ('Charlotte St', 'Charlotte St, Freetown', '392', 0),
  ('Wilberforce St', 'Wilberforce St, Freetown', '392', 0),
  ('Aberdeen Beach Road', 'Aberdeen Beach Road, Freetown', '392', 0);

-- Categories
INSERT INTO categories (name, sort_order) VALUES
  ('Super Promo', 1),
  ('Mains', 2),
  ('Sides', 3),
  ('Combos', 4),
  ('Drinks', 5),
  ('Desserts', 6);

-- Menu Items: Super Promo
INSERT INTO menu_items (category_id, name, description, price, original_price, is_offer, sort_order)
SELECT id, 'Mami Meal', 'Rice and egg', 20, NULL, true, 1 FROM categories WHERE name = 'Super Promo';

INSERT INTO menu_items (category_id, name, description, price, original_price, is_offer, sort_order)
SELECT id, 'Sissy Meal', 'Rice and egg + 1 crispy wing', 30, NULL, true, 2 FROM categories WHERE name = 'Super Promo';

INSERT INTO menu_items (category_id, name, description, price, original_price, is_offer, sort_order)
SELECT id, 'Mama Sharp', 'Rice and egg + 1 crispy wing + 1 sticky wing', 40, NULL, true, 3 FROM categories WHERE name = 'Super Promo';

INSERT INTO menu_items (category_id, name, description, price, original_price, is_offer, sort_order)
SELECT id, 'Slay Queen', '1 crispy wing, 1 sticky wing, 1 mini burger', 60, NULL, true, 4 FROM categories WHERE name = 'Super Promo';

-- Menu Items: Mains
INSERT INTO menu_items (category_id, name, description, price, original_price, is_offer, sort_order)
SELECT id, 'CT-Wrap', 'Chicken wrap', 90, NULL, false, 1 FROM categories WHERE name = 'Mains';

INSERT INTO menu_items (category_id, name, description, price, original_price, is_offer, sort_order)
SELECT id, 'Burger', 'Chicken burger', 90, NULL, false, 2 FROM categories WHERE name = 'Mains';

INSERT INTO menu_items (category_id, name, description, price, original_price, is_offer, sort_order)
SELECT id, 'Frontline Burger', 'Frontline chicken burger', 100, NULL, false, 3 FROM categories WHERE name = 'Mains';

INSERT INTO menu_items (category_id, name, description, price, original_price, is_offer, sort_order)
SELECT id, 'Chicken & Chips', 'Fried chicken with chips', 90, NULL, false, 4 FROM categories WHERE name = 'Mains';

INSERT INTO menu_items (category_id, name, description, price, original_price, is_offer, sort_order)
SELECT id, 'Fried Rice', 'Fried rice', 50, NULL, false, 5 FROM categories WHERE name = 'Mains';

INSERT INTO menu_items (category_id, name, description, price, original_price, is_offer, sort_order)
SELECT id, 'Drumstick', 'Fried drumstick', 45, NULL, false, 6 FROM categories WHERE name = 'Mains';

INSERT INTO menu_items (category_id, name, description, price, original_price, is_offer, sort_order)
SELECT id, 'CT-Salad', 'Fresh salad', 110, NULL, false, 7 FROM categories WHERE name = 'Mains';

INSERT INTO menu_items (category_id, name, description, price, original_price, is_offer, sort_order)
SELECT id, 'Whole Chicken', 'Whole fried chicken', 200, 370, true, 8 FROM categories WHERE name = 'Mains';

-- Menu Items: Sides
INSERT INTO menu_items (category_id, name, description, price, original_price, is_offer, sort_order)
SELECT id, 'Chips Masala', 'Masala chips', 55, NULL, false, 1 FROM categories WHERE name = 'Sides';

-- Menu Items: Combos
INSERT INTO menu_items (category_id, name, description, price, original_price, is_offer, sort_order)
SELECT id, 'Wrap Combo', 'Wrap, chips, Sierra juice', 140, NULL, false, 1 FROM categories WHERE name = 'Combos';

INSERT INTO menu_items (category_id, name, description, price, original_price, is_offer, sort_order)
SELECT id, 'BBQ Wings Meal', 'Wings, chips, Coke', 140, NULL, false, 2 FROM categories WHERE name = 'Combos';

INSERT INTO menu_items (category_id, name, description, price, original_price, is_offer, sort_order)
SELECT id, 'Classic Box', '2 drumsticks, 1 side, 1 soft drink', 150, NULL, false, 3 FROM categories WHERE name = 'Combos';

INSERT INTO menu_items (category_id, name, description, price, original_price, is_offer, sort_order)
SELECT id, 'Family Deal', '4 wings, 2 burgers, 2 wraps, 2 sides, 2 drinks', 460, NULL, false, 4 FROM categories WHERE name = 'Combos';

-- Menu Items: Drinks
INSERT INTO menu_items (category_id, name, description, price, original_price, is_offer, sort_order)
SELECT id, 'Coca-Cola', 'Coca-Cola', 15, NULL, false, 1 FROM categories WHERE name = 'Drinks';

INSERT INTO menu_items (category_id, name, description, price, original_price, is_offer, sort_order)
SELECT id, 'Sierra Juice', 'Sierra juice', 15, NULL, false, 2 FROM categories WHERE name = 'Drinks';

INSERT INTO menu_items (category_id, name, description, price, original_price, is_offer, sort_order)
SELECT id, 'Bottle Water', 'Bottle water', 10, NULL, false, 3 FROM categories WHERE name = 'Drinks';

-- Menu Items: Desserts
INSERT INTO menu_items (category_id, name, description, price, original_price, is_offer, sort_order)
SELECT id, 'CT Ice Cream', 'Chicken Town ice cream', 35, NULL, false, 1 FROM categories WHERE name = 'Desserts';

INSERT INTO menu_items (category_id, name, description, price, original_price, is_offer, sort_order)
SELECT id, 'H-B Ice Cream', 'H-B ice cream', 45, NULL, false, 2 FROM categories WHERE name = 'Desserts';

-- Item Options for Combos (drink choices)
INSERT INTO item_options (menu_item_id, label, extra_price)
SELECT id, 'Coca-Cola', 0 FROM menu_items WHERE name = 'Wrap Combo';

INSERT INTO item_options (menu_item_id, label, extra_price)
SELECT id, 'Sierra Juice', 0 FROM menu_items WHERE name = 'Wrap Combo';

INSERT INTO item_options (menu_item_id, label, extra_price)
SELECT id, 'Coca-Cola', 0 FROM menu_items WHERE name = 'BBQ Wings Meal';

INSERT INTO item_options (menu_item_id, label, extra_price)
SELECT id, 'Sierra Juice', 0 FROM menu_items WHERE name = 'BBQ Wings Meal';

INSERT INTO item_options (menu_item_id, label, extra_price)
SELECT id, 'Coca-Cola', 0 FROM menu_items WHERE name = 'Classic Box';

INSERT INTO item_options (menu_item_id, label, extra_price)
SELECT id, 'Sierra Juice', 0 FROM menu_items WHERE name = 'Classic Box';

INSERT INTO item_options (menu_item_id, label, extra_price)
SELECT id, 'Coca-Cola', 0 FROM menu_items WHERE name = 'Family Deal';

INSERT INTO item_options (menu_item_id, label, extra_price)
SELECT id, 'Sierra Juice', 0 FROM menu_items WHERE name = 'Family Deal';
