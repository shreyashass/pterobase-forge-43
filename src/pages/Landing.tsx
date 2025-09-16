import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PricingCard } from '@/components/PricingCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Server, Zap, Shield, Headphones } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  memory: number;
  disk: number;
  cpu: number;
  price: number;
  description: string;
}

export const Landing = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) {
        console.error('Error fetching plans:', error);
      } else {
        setPlans(data || []);
      }
      setLoading(false);
    };

    fetchPlans();
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  const features = [
    {
      icon: <Server className="h-8 w-8" />,
      title: 'Pterodactyl Integration',
      description: 'Seamless integration with Pterodactyl panel for automated server management.'
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'Instant Deployment',
      description: 'Get your game server up and running in minutes, not hours.'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'DDoS Protection',
      description: 'Built-in protection against attacks to keep your server online.'
    },
    {
      icon: <Headphones className="h-8 w-8" />,
      title: '24/7 Support',
      description: 'Round-the-clock support from our experienced team.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 neon-text">
            Professional Game Server Hosting
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Deploy and manage your game servers with ease using our automated billing panel 
            integrated with Pterodactyl. Get started in minutes.
          </p>
          <Button size="lg" variant="neon" onClick={handleGetStarted} className="hover-neon">
            {user ? 'Go to Dashboard' : 'Get Started'}
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose PteroBilling?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4 text-primary">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-muted-foreground text-center mb-12">
            Choose the perfect plan for your gaming needs
          </p>
          
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan, index) => (
                <PricingCard 
                  key={plan.id} 
                  plan={plan} 
                  popular={index === 1} // Make second plan popular
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of gamers who trust PteroBilling for their server hosting needs.
          </p>
          <Button size="lg" variant="neon" onClick={handleGetStarted} className="hover-neon">
            {user ? 'Order Your First Server' : 'Create Your Account'}
          </Button>
        </div>
      </section>
    </div>
  );
};