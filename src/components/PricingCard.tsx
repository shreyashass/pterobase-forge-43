import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface Plan {
  id: string;
  name: string;
  memory: number;
  disk: number;
  cpu: number;
  price: number;
  description: string;
}

interface PricingCardProps {
  plan: Plan;
  popular?: boolean;
}

export const PricingCard: React.FC<PricingCardProps> = ({ plan, popular }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSelectPlan = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    navigate('/order', { state: { selectedPlan: plan } });
  };

  const features = [
    `${plan.memory}MB RAM`,
    `${plan.disk}GB SSD Storage`,
    `${plan.cpu}% CPU`,
    'Unlimited Bandwidth',
    'DDoS Protection',
    '24/7 Support'
  ];

  return (
    <Card className={`relative hover-neon ${popular ? 'neon-border neon-glow' : 'border hover:border-primary/50'}`}>
      {popular && (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground neon-glow">
          Most Popular
        </Badge>
      )}
      
      <CardHeader className="text-center">
        <CardTitle className="text-xl neon-text">{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
        <div className="mt-4">
          <span className="text-3xl font-bold neon-text">${plan.price}</span>
          <span className="text-muted-foreground">/month</span>
        </div>
      </CardHeader>
      
      <CardContent>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="h-4 w-4 text-primary mr-2" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full hover-neon" 
          variant={popular ? "neon" : "outline"}
          onClick={handleSelectPlan}
        >
          {user ? 'Order Now' : 'Sign Up to Order'}
        </Button>
      </CardFooter>
    </Card>
  );
};