import React from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Crown, ShieldCheck, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['driver-profile-sub'],
    queryFn: async () => {
      const profiles = await base44.entities.DriverProfile.filter({ user_id: user.id });
      return profiles[0];
    },
  });

  const subscribeMutation = useMutation({
    mutationFn: async (planId) => {
      if (!profile) return;
      const plan = plans.find(p => p.id === planId);
      const expiresDate = new Date();
      expiresDate.setMonth(expiresDate.getMonth() + 1);
      await base44.entities.DriverProfile.update(profile.id, {
        subscription_plan: planId,
        subscription_expires: expiresDate.toISOString().split('T')[0],
        posts_remaining: planId === 'basic' ? 10 : 999,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['driver-profile-sub'] }),
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

      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Payment is processed securely through Mercury. For billing inquiries, contact{' '}
            <a href="mailto:admin@trusthaulfreight.com" className="text-secondary hover:underline">
              admin@trusthaulfreight.com
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}