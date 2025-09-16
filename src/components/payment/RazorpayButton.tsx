/**
 * Razorpay Payment Button Component
 * Integrates with Razorpay SDK for secure payment processing
 * Handles order creation and payment completion
 */
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RazorpayButtonProps {
  amount: number;
  currency?: string;
  orderId: string;
  customerEmail?: string;
  customerName?: string;
  onSuccess: (paymentId: string) => void;
  onError: (error: any) => void;
  disabled?: boolean;
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export const RazorpayButton: React.FC<RazorpayButtonProps> = ({
  amount,
  currency = 'INR',
  orderId,
  customerEmail,
  customerName,
  onSuccess,
  onError,
  disabled = false
}) => {
  const { toast } = useToast();

  const handlePayment = () => {
    if (!window.Razorpay) {
      // Load Razorpay SDK
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => initiatePayment();
      script.onerror = () => {
        toast({
          title: "Payment system unavailable",
          description: "Please try again later.",
          variant: "destructive",
        });
      };
      document.head.appendChild(script);
    } else {
      initiatePayment();
    }
  };

  const initiatePayment = () => {
    const options = {
      key: 'YOUR_RAZORPAY_KEY_ID', // Replace with your Razorpay key
      amount: Math.round(amount * 100), // Amount in paise
      currency: currency,
      name: 'Pterodactyl Billing Panel',
      description: `Payment for order ${orderId}`,
      order_id: orderId, // This should be created on your backend
      handler: function(response: any) {
        toast({
          title: "Payment successful!",
          description: `Payment ID: ${response.razorpay_payment_id}`,
        });
        onSuccess(response.razorpay_payment_id);
      },
      prefill: {
        name: customerName || '',
        email: customerEmail || '',
      },
      notes: {
        order_id: orderId
      },
      theme: {
        color: 'hsl(var(--primary))'
      },
      modal: {
        ondismiss: function() {
          toast({
            title: "Payment cancelled",
            description: "Your payment was cancelled.",
            variant: "destructive",
          });
        }
      }
    };

    const rzp = new window.Razorpay(options);
    
    rzp.on('payment.failed', function(response: any) {
      console.error('Razorpay payment failed:', response.error);
      toast({
        title: "Payment failed",
        description: response.error.description || "Please try again.",
        variant: "destructive",
      });
      onError(response.error);
    });

    rzp.open();
  };

  return (
    <div className="w-full">
      <Button 
        onClick={handlePayment}
        disabled={disabled}
        className="w-full"
        variant="outline"
      >
        <CreditCard className="mr-2 h-4 w-4" />
        Pay with Razorpay
      </Button>
      <p className="text-xs text-muted-foreground mt-2 text-center">
        Secure payment powered by Razorpay
      </p>
    </div>
  );
};