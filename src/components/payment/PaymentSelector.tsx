import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PayPalButton } from './PayPalButton';
import { RazorpayButton } from './RazorpayButton';
import { UPIPayment } from './UPIPayment';
import { DiscordPayment } from './DiscordPayment';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Smartphone, MessageCircle, IndianRupee } from 'lucide-react';

interface PaymentSelectorProps {
  orderId: string;
  amount: number;
  currency?: string;
  description?: string;
  onPaymentSuccess: () => void;
}

export const PaymentSelector: React.FC<PaymentSelectorProps> = ({
  orderId,
  amount,
  currency = 'USD',
  description = 'Server hosting payment',
  onPaymentSuccess
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'discord' | 'paypal' | 'razorpay'>('upi');
  const { user } = useAuth();
  const { toast } = useToast();

  const handlePaymentSuccess = async (paymentId: string, gateway: 'upi' | 'discord' | 'paypal' | 'razorpay') => {
    try {
      // Record payment in database with pending status for manual approval
      const { error: paymentError } = await supabase
        .from('payments')
        .insert([{
          order_id: orderId,
          payment_gateway: gateway,
          payment_id: paymentId,
          amount: amount,
          currency: currency,
          status: 'pending' // Changed to pending for manual approval
        }]);

      if (paymentError) throw paymentError;

      toast({
        title: "Payment Submitted Successfully!",
        description: "Your payment is being verified. Server will be activated after approval.",
      });

      onPaymentSuccess();
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Payment submission failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    toast({
      title: "Payment failed",
      description: "Please try again or use a different payment method.",
      variant: "destructive",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose Payment Method</CardTitle>
        <CardDescription>
          Select your preferred payment method. All payments require manual verification before server activation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedMethod} onValueChange={(value) => setSelectedMethod(value as 'upi' | 'discord' | 'paypal' | 'razorpay')}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upi" className="flex items-center space-x-2">
              <IndianRupee className="h-4 w-4" />
              <span>UPI</span>
            </TabsTrigger>
            <TabsTrigger value="discord" className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4" />
              <span>Discord</span>
            </TabsTrigger>
            <TabsTrigger value="paypal" className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span>PayPal</span>
            </TabsTrigger>
            <TabsTrigger value="razorpay" className="flex items-center space-x-2">
              <Smartphone className="h-4 w-4" />
              <span>Razorpay</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upi">
            <UPIPayment
              orderId={orderId}
              amount={amount}
              onSuccess={(paymentId) => handlePaymentSuccess(paymentId, 'upi')}
              onError={handlePaymentError}
            />
          </TabsContent>

          <TabsContent value="discord">
            <DiscordPayment
              orderId={orderId}
              amount={amount}
              userEmail={user?.email || ''}
              onSuccess={(paymentId) => handlePaymentSuccess(paymentId, 'discord')}
              onError={handlePaymentError}
            />
          </TabsContent>

          <TabsContent value="paypal">
            <Card>
              <CardHeader>
                <CardTitle>PayPal Payment</CardTitle>
                <CardDescription>
                  Pay securely with your PayPal account or credit/debit card
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PayPalButton
                  orderId={orderId}
                  amount={amount}
                  currency={currency}
                  onSuccess={(paymentId) => handlePaymentSuccess(paymentId, 'paypal')}
                  onError={handlePaymentError}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="razorpay">
            <Card>
              <CardHeader>
                <CardTitle>Razorpay Payment</CardTitle>
                <CardDescription>
                  Pay with UPI, cards, wallets, and more payment methods
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RazorpayButton
                  orderId={orderId}
                  amount={amount}
                  currency={currency}
                  onSuccess={(paymentId) => handlePaymentSuccess(paymentId, 'razorpay')}
                  onError={handlePaymentError}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            ⚡ Manual Payment Verification
          </h4>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            After payment submission, our team will verify your transaction and activate your server within 15-30 minutes during business hours.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};