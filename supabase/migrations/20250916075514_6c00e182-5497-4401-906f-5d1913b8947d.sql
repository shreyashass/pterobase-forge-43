-- Create legal pages table for dynamic content management
CREATE TABLE public.legal_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_type VARCHAR(50) NOT NULL UNIQUE CHECK (page_type IN ('privacy_policy', 'terms_conditions', 'refund_policy', 'cookie_policy')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.legal_pages ENABLE ROW LEVEL SECURITY;

-- Create policies for legal pages
CREATE POLICY "Legal pages are viewable by everyone" 
ON public.legal_pages 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage legal pages" 
ON public.legal_pages 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Create payments table for PayPal and Razorpay transactions
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.server_orders(id),
  payment_gateway VARCHAR(20) NOT NULL CHECK (payment_gateway IN ('paypal', 'razorpay')),
  payment_id TEXT NOT NULL, -- External payment ID from gateway
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  gateway_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create policies for payments
CREATE POLICY "Users can view their own payments" 
ON public.payments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.server_orders 
    WHERE server_orders.id = payments.order_id 
    AND server_orders.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all payments" 
ON public.payments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Create contact messages table
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
  admin_response TEXT,
  responded_by UUID REFERENCES auth.users(id),
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for contact messages
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for contact messages
CREATE POLICY "Anyone can create contact messages" 
ON public.contact_messages 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Only admins can view contact messages" 
ON public.contact_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Only admins can update contact messages" 
ON public.contact_messages 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Insert default legal pages content
INSERT INTO public.legal_pages (page_type, title, content, meta_title, meta_description) VALUES
('privacy_policy', 'Privacy Policy', 'This Privacy Policy describes how we collect, use, and protect your personal information when you use our Pterodactyl billing panel services.

## Information We Collect
- Personal information such as name, email address, and billing details
- Server usage data and logs
- Payment information (processed securely through our payment partners)

## How We Use Your Information
- To provide and maintain our services
- To process payments and manage billing
- To communicate with you about your account
- To improve our services

## Data Protection
We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

## Contact Us
If you have any questions about this Privacy Policy, please contact us through our support system.', 'Privacy Policy - Pterodactyl Billing Panel', 'Learn how we protect your privacy and handle your personal information in our Pterodactyl billing panel.'),

('terms_conditions', 'Terms & Conditions', 'Welcome to our Pterodactyl billing panel. By using our services, you agree to comply with and be bound by these terms and conditions.

## Service Description
We provide Pterodactyl game server hosting and management services through our billing panel.

## User Responsibilities
- Maintain the confidentiality of your account credentials
- Use services in compliance with applicable laws
- Pay all fees when due
- Do not engage in prohibited activities

## Service Availability
We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service.

## Limitation of Liability
Our liability is limited to the amount paid for services in the preceding 12 months.

## Termination
Either party may terminate services with appropriate notice as specified in your service agreement.

## Contact Information
For questions regarding these terms, please contact our support team.', 'Terms & Conditions - Pterodactyl Billing Panel', 'Review the terms and conditions for using our Pterodactyl game server hosting services.'),

('refund_policy', 'Refund Policy', 'We want you to be satisfied with our services. This refund policy outlines the conditions under which refunds may be provided.

## Refund Eligibility
- Refunds may be requested within 7 days of initial service activation
- Services must not have been actively used beyond initial setup
- Refunds are processed to the original payment method

## Non-Refundable Items
- Setup fees
- Domain registrations
- Services used for more than 7 days
- Promotional or discounted services

## Refund Process
1. Submit a refund request through our support system
2. Provide your order details and reason for refund
3. Allow 5-10 business days for processing

## Partial Refunds
Partial refunds may be considered on a case-by-case basis for unused portions of prepaid services.

## Contact Us
For refund requests or questions, please contact our billing support team.', 'Refund Policy - Pterodactyl Billing Panel', 'Understand our refund policy for Pterodactyl game server hosting services.'),

('cookie_policy', 'Cookie Policy', 'This Cookie Policy explains how we use cookies and similar technologies on our Pterodactyl billing panel website.

## What Are Cookies
Cookies are small text files stored on your device when you visit our website. They help us provide a better user experience.

## Types of Cookies We Use
### Essential Cookies
Required for the website to function properly, including:
- Authentication cookies
- Session management
- Security tokens

### Analytics Cookies
Help us understand how visitors interact with our website:
- Page view statistics
- User behavior analysis
- Performance monitoring

### Preference Cookies
Remember your choices and settings:
- Theme preferences (dark/light mode)
- Language settings
- Dashboard customizations

## Managing Cookies
You can control cookies through your browser settings. Note that disabling essential cookies may affect website functionality.

## Third-Party Cookies
We may use third-party services that set their own cookies:
- Payment processors (PayPal, Razorpay)
- Analytics providers
- Support chat systems

## Updates to This Policy
We may update this Cookie Policy periodically. Changes will be posted on this page.

## Contact Us
For questions about our use of cookies, please contact us through our support system.', 'Cookie Policy - Pterodactyl Billing Panel', 'Learn about how we use cookies to improve your experience on our Pterodactyl billing panel.');

-- Create trigger for updating legal pages timestamp
CREATE TRIGGER update_legal_pages_updated_at
BEFORE UPDATE ON public.legal_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();