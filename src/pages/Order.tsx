import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Check, ArrowLeft } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  memory: number;
  disk: number;
  cpu: number;
  price: number;
  description: string;
}

export const Order = () => {
  const { user, loading: authLoading } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [serverName, setServerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    fetchPlans();

    // Check if a plan was pre-selected from landing page
    if (location.state?.selectedPlan) {
      setSelectedPlan(location.state.selectedPlan);
      setServerName(`${location.state.selectedPlan.name} Server`);
    }
  }, [user, authLoading, navigate, location.state]);

  const fetchPlans = async () => {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true });

    if (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: "Error",
        description: "Failed to load plans. Please try again.",
        variant: "destructive",
      });
    } else {
      setPlans(data || []);
    }
    setLoading(false);
  };

  const handleOrderSubmit = async () => {
    if (!selectedPlan || !serverName.trim() || !user) return;

    setOrdering(true);

    try {
      // Call the order processing edge function
      const { data, error } = await supabase.functions.invoke('process-order', {
        body: {
          plan_id: selectedPlan.id,
          server_name: serverName.trim(),
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Order Submitted",
        description: "Your server order has been submitted and is being processed.",
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error processing order:', error);
      toast({
        title: "Order Failed",
        description: error.message || "Failed to process your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setOrdering(false);
    }
  };

  const features = [
    'Instant Server Deployment',
    'Full Root Access',
    'DDoS Protection',
    'Automated Backups',
    '24/7 Monitoring',
    'Expert Support'
  ];

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mr-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Order New Server</h1>
          <p className="text-muted-foreground">Choose your plan and configure your server</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Plan Selection */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">1. Select Your Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`cursor-pointer transition-all ${
                  selectedPlan?.id === plan.id
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => {
                  setSelectedPlan(plan);
                  setServerName(`${plan.name} Server`);
                }}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </div>
                    {selectedPlan?.id === plan.id && (
                      <Badge variant="default">Selected</Badge>
                    )}
                  </div>
                  <div className="text-2xl font-bold">${plan.price}/month</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>{plan.memory}MB RAM</li>
                    <li>{plan.disk}GB SSD Storage</li>
                    <li>{plan.cpu}% CPU</li>
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Server Configuration */}
          {selectedPlan && (
            <div>
              <h2 className="text-xl font-semibold mb-4">2. Configure Your Server</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Server Details</CardTitle>
                  <CardDescription>
                    Customize your server settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="server-name">Server Name</Label>
                    <Input
                      id="server-name"
                      value={serverName}
                      onChange={(e) => setServerName(e.target.value)}
                      placeholder="Enter server name"
                      required
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedPlan ? (
                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <h3 className="font-medium">{selectedPlan.name} Plan</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedPlan.description}
                    </p>
                    <div className="mt-2 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>RAM:</span>
                        <span>{selectedPlan.memory}MB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Storage:</span>
                        <span>{selectedPlan.disk}GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CPU:</span>
                        <span>{selectedPlan.cpu}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Included Features:</h4>
                    <ul className="space-y-1">
                      {features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <Check className="h-3 w-3 text-primary mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Monthly Total:</span>
                      <span>${selectedPlan.price}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleOrderSubmit}
                    disabled={!serverName.trim() || ordering}
                    className="w-full"
                  >
                    {ordering ? 'Processing...' : 'Complete Order'}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Your server will be deployed automatically after order confirmation.
                  </p>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <p>Select a plan to see order summary</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};