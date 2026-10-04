-- Enable Supabase Realtime for the orders table
-- Required for live order updates in the admin orders screen

ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
