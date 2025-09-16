/**
 * Payment Method Selector Component
 * Allows users to choose between PayPal and Razorpay payment methods
 * Handles payment processing and order completion
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { PayPalButton } from './PayPalButton';
import { RazorpayButton } from './RazorpayButton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaymentSelectorProps {
  orderId: string;
  amount: number;
  currency?: string;
  customerEmail?: string;
  customerName?: string;
  onPaymentSuccess: () => void;
}

export const PaymentSelector: React.FC<PaymentSelectorProps> = ({
  orderId,
  amount,
  currency = 'USD',
  customerEmail,
  customerName,
  onPaymentSuccess
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'paypal' | 'razorpay'>('paypal');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handlePaymentSuccess = async (paymentId: string, gateway: 'paypal' | 'razorpay') => {
    setIsProcessing(true);
    
    try {
      // Record payment in database
      const { error: paymentError } = await supabase
        .from('payments')
        .insert([{
          order_id: orderId,
          payment_gateway: gateway,
          payment_id: paymentId,
          amount: amount,
          currency: currency,
          status: 'completed',
          completed_at: new Date().toISOString()
        }]);

      if (paymentError) throw paymentError;

      // Update order status
      const { error: orderError } = await supabase
        .from('server_orders')
        .update({ status: 'active' })
        .eq('id', orderId);

      if (orderError) throw orderError;

      toast({
        title: "Order completed successfully!",
        description: "Your server will be provisioned shortly.",
      });

      onPaymentSuccess();
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Payment recorded but order update failed",
        description: "Please contact support for assistance.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    setIsProcessing(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose Payment Method</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup 
          value={selectedMethod} 
          onValueChange={(value) => setSelectedMethod(value as 'paypal' | 'razorpay')}
          className="space-y-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="paypal" id="paypal" />
            <Label htmlFor="paypal" className="cursor-pointer">
              PayPal - Pay with your PayPal account or credit card
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="razorpay" id="razorpay" />
            <Label htmlFor="razorpay" className="cursor-pointer">
              Razorpay - Credit/Debit cards, UPI, Net Banking
            </Label>
          </div>
        </RadioGroup>

        <div className="border-t pt-6">
          <div className="text-sm text-muted-foreground mb-4">
            Amount to pay: <span className="font-bold text-foreground">{currency} {amount.toFixed(2)}</span>
          </div>
          
          {selectedMethod === 'paypal' && (
            <PayPalButton
              amount={amount}
              currency={currency}
              orderId={orderId}
              onSuccess={(paymentId) => handlePaymentSuccess(paymentId, 'paypal')}
              onError={handlePaymentError}
              disabled={isProcessing}
            />
          )}
          
          {selectedMethod === 'razorpay' && (
            <RazorpayButton
              amount={amount}
              currency="INR"
              orderId={orderId}
              customerEmail={customerEmail}
              customerName={customerName}
              onSuccess={(paymentId) => handlePaymentSuccess(paymentId, 'razorpay')}
              onError={handlePaymentError}
              disabled={isProcessing}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};