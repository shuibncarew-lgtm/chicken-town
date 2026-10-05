-- Drop old function to avoid ambiguity
DROP FUNCTION IF EXISTS create_order(text, text, text, text, uuid, jsonb, text, text);

-- Create new function with p_user_id
CREATE OR REPLACE FUNCTION create_order(
  p_customer_name text,
  p_phone text,
  p_order_type text,
  p_address text,
  p_branch_id uuid,
  p_items jsonb DEFAULT '[]'::jsonb,
  p_note text DEFAULT '',
  p_payment_method text DEFAULT 'cash',
  p_user_id uuid DEFAULT NULL
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
  v_order_number := 'CT-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(floor(random() * 10000)::text, 4, '0');

  SELECT delivery_fee INTO v_delivery_fee FROM branches WHERE id = p_branch_id;
  IF v_delivery_fee IS NULL THEN
    RAISE EXCEPTION 'Branch not found';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    SELECT * INTO v_menu_item FROM menu_items WHERE id = (v_item->>'menu_item_id')::uuid;
    IF v_menu_item IS NULL THEN
      RAISE EXCEPTION 'Menu item not found: %', v_item->>'menu_item_id';
    END IF;

    v_item_total := v_menu_item.price * (v_item->>'quantity')::integer;

    IF v_item->>'option_id' IS NOT NULL AND v_item->>'option_id' != '' THEN
      SELECT extra_price INTO v_option FROM item_options WHERE id = (v_item->>'option_id')::uuid;
      IF v_option IS NOT NULL THEN
        v_item_total := v_item_total + v_option.extra_price * (v_item->>'quantity')::integer;
      END IF;
    END IF;

    v_subtotal := v_subtotal + v_item_total;
  END LOOP;

  v_total := v_subtotal + v_delivery_fee;

  INSERT INTO orders (order_number, user_id, customer_name, phone, order_type, address, branch_id, note, subtotal, delivery_fee, total, payment_method)
  VALUES (v_order_number, p_user_id, p_customer_name, p_phone, p_order_type, p_address, p_branch_id, p_note, v_subtotal, v_delivery_fee, v_total, p_payment_method)
  RETURNING id INTO v_order_id;

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
