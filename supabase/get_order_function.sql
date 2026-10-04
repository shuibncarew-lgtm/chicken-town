-- Secure function to read an order by ID (for guest confirmation page)
-- R6: guest orders must work, user_id is nullable

CREATE OR REPLACE FUNCTION get_order(p_order_id uuid)
RETURNS TABLE (
  id uuid,
  order_number text,
  status text,
  total numeric,
  subtotal numeric,
  delivery_fee numeric,
  customer_name text,
  phone text,
  order_type text,
  address text,
  note text,
  payment_method text,
  payment_status text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT o.id, o.order_number, o.status, o.total, o.subtotal, o.delivery_fee,
         o.customer_name, o.phone, o.order_type, o.address, o.note,
         o.payment_method, o.payment_status, o.created_at
  FROM orders o
  WHERE o.id = p_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_order_items(p_order_id uuid)
RETURNS TABLE (
  item_name text,
  quantity integer,
  unit_price numeric,
  option_label text
) AS $$
BEGIN
  RETURN QUERY
  SELECT oi.item_name, oi.quantity, oi.unit_price, oi.option_label
  FROM order_items oi
  WHERE oi.order_id = p_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
