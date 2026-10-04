-- Public read policies for customer-facing tables
-- Allows any authenticated user to read branches, categories, menu_items, and item_options

CREATE POLICY "branches_select_public" ON branches FOR SELECT TO authenticated USING (true);
CREATE POLICY "categories_select_public" ON categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "menu_items_select_public" ON menu_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "item_options_select_public" ON item_options FOR SELECT TO authenticated USING (true);
