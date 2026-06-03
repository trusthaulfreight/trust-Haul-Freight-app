import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link, Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Truck, MessageSquare, Star, ArrowRight, MapPin, Clock, DollarSign, ShieldCheck, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();
  const isDriver = user?.account_type === 'driver';

  const { data: myLoads = [] } = useQuery({
    queryKey: ['my-loads'],
    queryFn: () => isDriver
      ? base44.entities.Load.filter({ assigned_driver_user_id: user.id })
      : base44.entities.Load.filter({ shipper_user_id: user.id }),
  });

  const { data: recentLoads = [] } = useQuery({
    queryKey: ['recent-loads'],
    queryFn: () => base44.entities.Load.filter({ status: 'posted' }, '-created_date', 5),
  });

  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => {
      if (!user.profile_id) return null;
      if (isDriver) {
        const profiles = await base44.entities.DriverProfile.filter({ user_id: user.id });
        return profiles[0];
      } else {
        const profiles = await base44.entities.ShipperProfile.filter({ user_id: user.id });
        return profiles[0];
      }
    },
  });

  if (!user?.onboarding_complete) {
    return <Navigate to="/onboarding" replace />;
  }

  const activeLoads = myLoads.filter(l => ['assigned', 'in_transit'].includes(l.status));
  const completedLoads = myLoads.filter(l => l.status === 'delivered');

  const stats = isDriver ? [
    { label: 'Active Loads', value: activeLoads.length, icon: Truck, color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Completed', value: completedLoads.length, icon: Package, color: 'text-green-500 bg-green-500/10' },
    { label: 'Rating', value: profile?.average_rating?.toFixed(1) || '0.0', icon: Star, color: 'text-secondary bg-secondary/10' },
    { label: 'Verified', value: profile?.verification_status === 'verified' ? 'Yes' : 'Pending', icon: ShieldCheck, color: 'text-purple-500 bg-purple-500/10' },
  ] : [
    { label: 'Active Loads', value: activeLoads.length, icon: Truck, color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Total Posted', value: myLoads.length, icon: Package, color: 'text-green-500 bg-green-500/10' },
    { label: 'Rating', value: profile?.average_rating?.toFixed(1) || '0.0', icon: Star, color: 'text-secondary bg-secondary/10' },
    { label: 'Delivered', value: completedLoads.length, icon: ShieldCheck, color: 'text-purple-500 bg-purple-500/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Welcome back, {user?.full_name?.split(' ')[0] || 'there'}!</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isDriver ? 'Find loads and grow your business' : 'Manage your shipments efficiently'}
          </p>
        </div>
        <Link to={isDriver ? '/loads' : '/post-load'}>
          <Button className="bg-secondary hover:bg-secondary/90 text-white">
            {isDriver ? 'Browse Loads' : 'Post a Load'} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subscription alert for drivers */}
      {isDriver && profile?.subscription_plan === 'none' && (
        <Card className="border-secondary/30 bg-secondary/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-secondary" />
              <div>
                <p className="text-sm font-semibold">Subscribe to start bidding on loads</p>
                <p className="text-xs text-muted-foreground">Plans start at just $69.99/month</p>
              </div>
            </div>
            <Link to="/subscription">
              <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-white">Subscribe Now</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Loads */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Truck className="h-5 w-5 text-secondary" />
              Active Loads
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeLoads.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No active loads right now</p>
            ) : (
              activeLoads.slice(0, 4).map(load => (
                <Link key={load.id} to={`/load/${load.id}`} className="block p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">{load.title}</h4>
                    <Badge variant="outline" className="capitalize text-xs">{load.status?.replace('_', ' ')}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{load.pickup_city}, {load.pickup_state}</span>
                    <span>→</span>
                    <span>{load.delivery_city}, {load.delivery_state}</span>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent loads or browse */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-secondary" />
                {isDriver ? 'Available Loads' : 'Your Recent Loads'}
              </CardTitle>
              <Link to={isDriver ? '/loads' : '/my-loads'} className="text-xs text-secondary hover:underline">View All</Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {(isDriver ? recentLoads : myLoads).slice(0, 4).map(load => (
              <Link key={load.id} to={`/load/${load.id}`} className="block p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">{load.title}</h4>
                  {load.budget && <span className="text-sm font-bold text-green-600">${load.budget}</span>}
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{load.pickup_city}, {load.pickup_state}</span>
                  <span>→</span>
                  <span>{load.delivery_city}, {load.delivery_state}</span>
                  {load.pickup_date && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{format(new Date(load.pickup_date), 'MMM d')}</span>}
                </div>
              </Link>
            ))}
            {(isDriver ? recentLoads : myLoads).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No loads yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}