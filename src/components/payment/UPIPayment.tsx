import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UPIPaymentProps {
  orderId: string;
  amount: number;
  onSuccess: (paymentId: string) => void;
  onError: (error: any) => void;
}

export const UPIPayment: React.FC<UPIPaymentProps> = ({
  orderId,
  amount,
  onSuccess,
  onError
}) => {
  const [transactionId, setTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Mock UPI ID - In production, this would be your actual UPI ID
  const UPI_ID = "your-business@paytm";
  const upiLink = `upi://pay?pa=${UPI_ID}&pn=PteroBilling&am=${amount}&tr=${orderId}&tn=Server Payment`;

  const copyUPIId = () => {
    navigator.clipboard.writeText(UPI_ID);
    toast({
      title: "UPI ID Copied!",
      description: "UPI ID has been copied to clipboard"
    });
  };

  const handleSubmitTransaction = async () => {
    if (!transactionId.trim()) {
      toast({
        title: "Transaction ID Required",
        description: "Please enter your UPI transaction ID",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In production, you would verify the transaction here
      onSuccess(transactionId);
      
      toast({
        title: "Payment Submitted!",
        description: "Your payment is being verified by our team",
      });
    } catch (error) {
      onError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Pay via UPI</span>
          <Badge variant="secondary">Manual Verification</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Payment Instructions */}
        <div className="bg-muted p-4 rounded-lg space-y-3">
          <h4 className="font-medium">Payment Instructions:</h4>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>Send ₹{amount} to the UPI ID below</li>
            <li>Use Order ID as payment note: <code className="bg-background px-1 rounded">{orderId}</code></li>
            <li>Enter your transaction ID below</li>
            <li>Our team will verify and activate your server</li>
          </ol>
        </div>

        {/* UPI Details */}
        <div className="space-y-3">
          <div>
            <Label>UPI ID</Label>
            <div className="flex items-center space-x-2 mt-1">
              <Input value={UPI_ID} readOnly className="font-mono" />
              <Button size="sm" variant="outline" onClick={copyUPIId}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label>Amount</Label>
            <Input value={`₹${amount}`} readOnly />
          </div>

          <div>
            <Label>Order Reference</Label>
            <Input value={orderId} readOnly className="font-mono text-xs" />
          </div>
        </div>

        {/* Quick Pay Button */}
        <div className="flex space-x-2">
          <Button 
            onClick={() => window.open(upiLink, '_blank')} 
            variant="outline" 
            className="flex-1"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Open UPI App
          </Button>
        </div>

        {/* Transaction ID Input */}
        <div className="space-y-3 pt-4 border-t">
          <Label htmlFor="txn-id">Enter Transaction ID</Label>
          <Input
            id="txn-id"
            placeholder="e.g., 123456789012"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            className="font-mono"
          />
          <Button 
            onClick={handleSubmitTransaction}
            disabled={isSubmitting || !transactionId.trim()}
            className="w-full"
          >
            {isSubmitting ? (
              "Submitting..."
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Submit Payment Proof
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          💡 Your server will be activated within 15-30 minutes after payment verification
        </p>
      </CardContent>
    </Card>
  );
};