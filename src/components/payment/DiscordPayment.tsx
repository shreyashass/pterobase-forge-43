import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExternalLink, MessageCircle, Copy, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DiscordPaymentProps {
  orderId: string;
  amount: number;
  userEmail: string;
  onSuccess: (paymentId: string) => void;
  onError: (error: any) => void;
}

export const DiscordPayment: React.FC<DiscordPaymentProps> = ({
  orderId,
  amount,
  userEmail,
  onSuccess,
  onError
}) => {
  const [discordTag, setDiscordTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Mock Discord server invite - replace with your actual Discord server
  const DISCORD_INVITE = "https://discord.gg/yourinvite";
  const PAYMENT_CHANNEL = "#billing-support";

  const copyOrderInfo = () => {
    const orderInfo = `Order ID: ${orderId}
Email: ${userEmail}
Amount: ₹${amount}
Discord: ${discordTag || 'Not provided'}`;
    
    navigator.clipboard.writeText(orderInfo);
    toast({
      title: "Order Info Copied!",
      description: "Paste this in Discord for faster processing"
    });
  };

  const handleSubmitDiscord = async () => {
    if (!discordTag.trim()) {
      toast({
        title: "Discord Tag Required",
        description: "Please enter your Discord tag for verification",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate a mock payment reference
      const paymentRef = `DISCORD_${Date.now()}`;
      onSuccess(paymentRef);
      
      toast({
        title: "Discord Payment Initiated!",
        description: "Please complete payment in Discord server",
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
          <MessageCircle className="h-5 w-5" />
          <span>Pay via Discord</span>
          <Badge variant="secondary">Community Support</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Instructions */}
        <div className="bg-muted p-4 rounded-lg space-y-3">
          <h4 className="font-medium">Discord Payment Process:</h4>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>Join our Discord server using the invite below</li>
            <li>Go to <code className="bg-background px-1 rounded">{PAYMENT_CHANNEL}</code> channel</li>
            <li>Share your order details with our billing team</li>
            <li>Complete payment via UPI/Bank transfer as guided</li>
            <li>Get instant server activation after confirmation!</li>
          </ol>
        </div>

        {/* Order Details */}
        <div className="space-y-3">
          <div>
            <Label>Order ID</Label>
            <Input value={orderId} readOnly className="font-mono text-xs" />
          </div>

          <div>
            <Label>Amount</Label>
            <Input value={`₹${amount}`} readOnly />
          </div>

          <div>
            <Label>Your Email</Label>
            <Input value={userEmail} readOnly />
          </div>

          <div>
            <Label htmlFor="discord-tag">Discord Tag (Optional)</Label>
            <Input
              id="discord-tag"
              placeholder="e.g., username#1234"
              value={discordTag}
              onChange={(e) => setDiscordTag(e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={() => window.open(DISCORD_INVITE, '_blank')}
            variant="outline" 
            className="w-full"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Join Discord Server
          </Button>

          <Button 
            onClick={copyOrderInfo}
            variant="outline" 
            className="w-full"
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy Order Details
          </Button>

          <Button 
            onClick={handleSubmitDiscord}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              "Processing..."
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Continue with Discord Payment
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>🎮 Get support from our gaming community</p>
          <p>⚡ Fastest payment verification (usually under 10 minutes)</p>
          <p>💬 Direct chat with billing team</p>
        </div>
      </CardContent>
    </Card>
  );
};