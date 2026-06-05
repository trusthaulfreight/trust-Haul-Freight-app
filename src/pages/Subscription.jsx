import React, { useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { DriverProfile } from '@/api/db';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Crown, ShieldCheck, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from "@/components/ui/use-toast";

const plans = [
  {
    id: 'basic',
    name: 'Starter',
    price: 69.99,
    icon: Zap,
    features: [
      'Up to 10 load bids per month',
      'Basic load board access',
      'Direct messaging',
      'Verification badge',
      'GPS tracking',
      'Rating system',
      'Email support',
    ],
  },
  {
    id: 'premium',
    name: 'Pro Hauler',
    price: 149.99,
    icon: Crown,
    popular: true,
    features: [
      'Unlimited load bids',
      'Priority load board access',
      'Direct messaging',
      'Verified Pro badge',
      'Real-time GPS tracking',
      'Rating system',
      'Priority support',
      'Early access to new loads',
      'Featured driver listing',
    ],
  },
];

export default function Subscription() {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      toast({ title: '🎉 Subscription activated!', description: 'Welcome to TrustHaul. Your plan is now active.' });
      window.history.replaceState({}, '', '/subscription');
    } else if (params.get('cancelled') === 'true') {
      toast({ title: 'Checkout cancelled', description: 'No charge was made.', variant: 'destructive' });
      window.history.replaceState({}, '', '/subscription');
    }
  }, []);

  const { data: profile } = useQuery({
    queryKey: ['driver-profile-sub', user?.id],
    queryFn: async () => {
      const profiles = await DriverProfile.filter({ user_id: user.id });
      return profiles[0];
    },
    enabled: !!user?.id,
  });

  const subscribeMutation = useMutation({
    mutationFn: async (planId) => {
      // TODO: Replace this with your Stripe payment link or backend endpoint
      // Example: window.location.href = 'https://buy.stripe.com/your-link';
      toast({
        title: 'Payment coming soon',
        description: 'Stripe integration will be connected here. Contact admin@trusthaulfreight.com to subscribe.',
      });
    },
  });

  const currentPlan = profile?.subscription_plan || 'none';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Subscription</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Choose a plan that fits your business. Cancel anytime.
        </p>
      </div>

      {currentPlan !== 'none' && profile && (
        <Card className="border-secondary/30 bg-secondary/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-secondary" />
              <div>
                <p className="text-sm font-semibold">
                  Current Plan: <span className="capitalize">{currentPlan === 'basic' ? 'Starter' : 'Pro Hauler'}</span>
                </p>
                {profile.subscription_expires && (
                  <p className="text-xs text-muted-foreground">
                    Renews {format(new Date(profile.subscription_expires), 'MMM d, yyyy')}
                  </p>
                )}
              </div>
            </div>
            {profile.posts_remaining !== undefined && (
              <Badge variant="outline">{profile.posts_remaining} bids remaining</Badge>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {plans.map(plan => {
          const isActive = currentPlan === plan.id;
          return (
            <Card key={plan.id} className={cn(
              "relative",
              plan.popular && "border-secondary ring-1 ring-secondary",
              isActive && "bg-secondary/5"
            )}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-white text-xs font-bold px-4 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <plan.icon className="h-5 w-5 text-secondary" />
                  </div>
                  <CardTitle>{plan.name}</CardTitle>
                </div>
                <div className="flex items-baseline gap-1 mt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-secondary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => subscribeMutation.mutate(plan.id)}
                  disabled={isActive || subscribeMutation.isPending}
                  className={cn("w-full h-11 font-bold rounded-xl", plan.popular ? "bg-secondary hover:bg-secondary/90 text-white" : "")}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {subscribeMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isActive ? (
                    'Current Plan'
                  ) : currentPlan !== 'none' ? (
                    'Switch Plan'
                  ) : (
                    'Subscribe Now'
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-secondary" /> What's Included
          </h3>
          <div className="grid sm:grid-cols-2 gap-3 text-sm text-muted-foreground mb-4">
            <div className="flex items-start gap-2"><Check className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" /><span>Access to verified load board — post & bid on loads</span></div>
            <div className="flex items-start gap-2"><Check className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" /><span>Direct messaging with shippers — no middleman</span></div>
            <div className="flex items-start gap-2"><Check className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" /><span>Verified driver badge displayed on your profile</span></div>
            <div className="flex items-start gap-2"><Check className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" /><span>Real-time GPS tracking & load status updates</span></div>
          </div>
          <div className="border-t border-border pt-4 mt-2">
            <p className="text-xs text-muted-foreground">
              💡 <strong>Payment between drivers & shippers is handled directly.</strong> TrustHaul only charges drivers a flat monthly subscription — no commissions, no hidden fees, no dispatch cuts.
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Billing questions? <a href="mailto:admin@trusthaulfreight.com" className="text-secondary hover:underline">admin@trusthaulfreight.com</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
