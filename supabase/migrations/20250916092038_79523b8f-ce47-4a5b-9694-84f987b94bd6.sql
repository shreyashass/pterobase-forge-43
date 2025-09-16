-- Add image field to plans table
ALTER TABLE public.plans 
ADD COLUMN image_url TEXT;

-- Update payment flow to require manual approval
-- First, let's update the server_orders to have a payment_status field
ALTER TABLE public.server_orders 
ADD COLUMN payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'approved', 'rejected'));

-- Add a constraint so servers can only be 'active' if payment is 'approved'
-- We'll enforce this in the application logic instead of a DB constraint for flexibility