-- Final RLS policies for Phase 6 (authenticated users only)
-- Remove old policies first
DROP POLICY IF EXISTS "orders_select_anon" ON orders;
DROP POLICY IF EXISTS "order_items_select_anon" ON order_items;
DROP POLICY IF EXISTS "orders_update_anon" ON orders;
DROP POLICY IF EXISTS "menu_items_update_anon" ON menu_items;
DROP POLICY IF EXISTS "settings_select_anon" ON settings;
DROP POLICY IF EXISTS "settings_update_anon" ON settings;
DROP POLICY IF EXISTS "orders_select_own" ON orders;
DROP POLICY IF EXISTS "orders_insert_public" ON orders;
DROP POLICY IF EXISTS "orders_update_staff" ON orders;
DROP POLICY IF EXISTS "orders_delete_owner" ON orders;
DROP POLICY IF EXISTS "order_items_select_own" ON order_items;
DROP POLICY IF EXISTS "order_items_insert_public" ON order_items;
DROP POLICY IF EXISTS "order_items_update_owner" ON order_items;
DROP POLICY IF EXISTS "order_items_delete_owner" ON order_items;
DROP POLICY IF EXISTS "menu_items_select_public" ON menu_items;
DROP POLICY IF EXISTS "menu_items_insert_owner" ON menu_items;
DROP POLICY IF EXISTS "menu_items_update_owner" ON menu_items;
DROP POLICY IF EXISTS "menu_items_delete_owner" ON menu_items;
DROP POLICY IF EXISTS "branches_select_public" ON branches;
DROP POLICY IF EXISTS "branches_insert_owner" ON branches;
DROP POLICY IF EXISTS "branches_update_owner" ON branches;
DROP POLICY IF EXISTS "branches_delete_owner" ON branches;
DROP POLICY IF EXISTS "categories_select_public" ON categories;
DROP POLICY IF EXISTS "categories_insert_owner" ON categories;
DROP POLICY IF EXISTS "categories_update_owner" ON categories;
DROP POLICY IF EXISTS "categories_delete_owner" ON categories;
DROP POLICY IF EXISTS "item_options_select_public" ON item_options;
DROP POLICY IF EXISTS "item_options_insert_owner" ON item_options;
DROP POLICY IF EXISTS "item_options_update_owner" ON item_options;
DROP POLICY IF EXISTS "item_options_delete_owner" ON item_options;
DROP POLICY IF EXISTS "settings_select_public" ON settings;
DROP POLICY IF EXISTS "settings_insert_owner" ON settings;
DROP POLICY IF EXISTS "settings_update_owner" ON settings;
DROP POLICY IF EXISTS "settings_delete_owner" ON settings;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_owner" ON profiles;
DROP POLICY IF EXISTS "saved_addresses_select_own" ON saved_addresses;
DROP POLICY IF EXISTS "saved_addresses_insert_own" ON saved_addresses;
DROP POLICY IF EXISTS "saved_addresses_update_own" ON saved_addresses;
DROP POLICY IF EXISTS "saved_addresses_delete_own" ON saved_addresses;
DROP POLICY IF EXISTS "favourites_select_own" ON favourites;
DROP POLICY IF EXISTS "favourites_insert_own" ON favourites;
DROP POLICY IF EXISTS "favourites_delete_own" ON favourites;

-- Orders: customers see own orders, staff see their branch, owner sees all
CREATE POLICY "orders_select_customer" ON orders FOR SELECT TO authenticated USING (
  user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'branch_staff' AND branch_id = orders.branch_id)
);

CREATE POLICY "orders_insert_customer" ON orders FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "orders_update_staff" ON orders FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'branch_staff' AND branch_id = orders.branch_id)
);

-- Order items
CREATE POLICY "order_items_select_customer" ON order_items FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM orders o WHERE o.id = order_items.order_id AND (
      o.user_id = auth.uid()
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'branch_staff' AND branch_id = o.branch_id)
    )
  )
);

CREATE POLICY "order_items_insert_customer" ON order_items FOR INSERT TO authenticated WITH CHECK (true);

-- Menu items: anyone authenticated can read, only owner can write
CREATE POLICY "menu_items_select_authenticated" ON menu_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "menu_items_insert_owner" ON menu_items FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner'));
CREATE POLICY "menu_items_update_owner" ON menu_items FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner'));
CREATE POLICY "menu_items_delete_owner" ON menu_items FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner'));

-- Branches
CREATE POLICY "branches_select_authenticated" ON branches FOR SELECT TO authenticated USING (true);
CREATE POLICY "branches_insert_owner" ON branches FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner'));
CREATE POLICY "branches_update_owner" ON branches FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner'));

-- Categories
CREATE POLICY "categories_select_authenticated" ON categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "categories_insert_owner" ON categories FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner'));
CREATE POLICY "categories_update_owner" ON categories FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner'));

-- Item options
CREATE POLICY "item_options_select_authenticated" ON item_options FOR SELECT TO authenticated USING (true);
CREATE POLICY "item_options_insert_owner" ON item_options FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner'));
CREATE POLICY "item_options_update_owner" ON item_options FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner'));

-- Settings
CREATE POLICY "settings_select_authenticated" ON settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "settings_update_owner" ON settings FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner'));

-- Profiles
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT TO authenticated USING (id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner'));
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner'));

-- Saved addresses
CREATE POLICY "saved_addresses_select_own" ON saved_addresses FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "saved_addresses_insert_own" ON saved_addresses FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "saved_addresses_update_own" ON saved_addresses FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "saved_addresses_delete_own" ON saved_addresses FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Favourites
CREATE POLICY "favourites_select_own" ON favourites FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "favourites_insert_own" ON favourites FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "favourites_delete_own" ON favourites FOR DELETE TO authenticated USING (user_id = auth.uid());
