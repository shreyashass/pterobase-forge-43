/**
 * PayPal Payment Button Component
 * Integrates with PayPal SDK for secure payment processing
 * Handles order creation and payment completion
 */
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PayPalButtonProps {
  amount: number;
  currency?: string;
  orderId: string;
  onSuccess: (paymentId: string) => void;
  onError: (error: any) => void;
  disabled?: boolean;
}

declare global {
  interface Window {
    paypal?: any;
  }
}

export const PayPalButton: React.FC<PayPalButtonProps> = ({
  amount,
  currency = 'USD',
  orderId,
  onSuccess,
  onError,
  disabled = false
}) => {
  const paypalRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (disabled || !paypalRef.current) return;

    // Load PayPal SDK if not already loaded
    if (!window.paypal) {
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID&currency=${currency}`;
      script.async = true;
      script.onload = () => renderPayPalButton();
      document.head.appendChild(script);
    } else {
      renderPayPalButton();
    }

    function renderPayPalButton() {
      if (!window.paypal || !paypalRef.current) return;

      // Clear existing buttons
      paypalRef.current.innerHTML = '';

      window.paypal.Buttons({
        createOrder: function(data: any, actions: any) {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: amount.toFixed(2),
                currency_code: currency
              },
              custom_id: orderId
            }]
          });
        },
        onApprove: function(data: any, actions: any) {
          return actions.order.capture().then(function(details: any) {
            toast({
              title: "Payment successful!",
              description: `Transaction completed by ${details.payer.name.given_name}`,
            });
            onSuccess(details.id);
          });
        },
        onError: function(err: any) {
          console.error('PayPal payment error:', err);
          toast({
            title: "Payment failed",
            description: "Please try again or use a different payment method.",
            variant: "destructive",
          });
          onError(err);
        },
        onCancel: function(data: any) {
          toast({
            title: "Payment cancelled",
            description: "Your payment was cancelled.",
            variant: "destructive",
          });
        }
      }).render(paypalRef.current);
    }
  }, [amount, currency, orderId, onSuccess, onError, disabled, toast]);

  if (disabled) {
    return (
      <Button disabled className="w-full">
        <CreditCard className="mr-2 h-4 w-4" />
        PayPal - Unavailable
      </Button>
    );
  }

  return (
    <div className="w-full">
      <div ref={paypalRef} className="min-h-[45px]" />
      <p className="text-xs text-muted-foreground mt-2 text-center">
        Secure payment powered by PayPal
      </p>
    </div>
  );
};