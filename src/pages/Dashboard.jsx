import React, { useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Load, DriverProfile, ShipperProfile } from '@/api/db';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, Navigate } from 'react-router-dom';
import PullToRefresh from '@/components/PullToRefresh';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Truck, Star, ArrowRight, MapPin, Clock, DollarSign, ShieldCheck, AlertCircle, TrendingUp, Zap, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

const statusColors = {
  posted: 'bg-blue-500/10 text-blue-600 border-blue-200',
  assigned: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
  in_transit: 'bg-orange-500/10 text-orange-600 border-orange-200',
  delivered: 'bg-green-500/10 text-green-700 border-green-200',
  cancelled: 'bg-red-500/10 text-red-600 border-red-200',
};

export default function Dashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isDriver = user?.account_type === 'driver';

  const { data: myLoads = [] } = useQuery({
    queryKey: ['my-loads', user?.id],
    queryFn: () => isDriver
      ? Load.filter({ assigned_driver_user_id: user.id })
      : Load.filter({ shipper_user_id: user.id }),
    enabled: !!user?.id,
  });

  const { data: recentLoads = [] } = useQuery({
    queryKey: ['recent-loads'],
    queryFn: () => Load.filter({ status: 'posted' }, '-created_at', 8),
  });

  const { data: profile } = useQuery({
    queryKey: ['my-profile', user?.id],
    queryFn: async () => {
      const profiles = isDriver
        ? await DriverProfile.filter({ user_id: user.id })
        : await ShipperProfile.filter({ user_id: user.id });
      return profiles[0];
    },
    enabled: !!user?.id,
  });

  // Real-time load updates
  useEffect(() => {
    const unsubscribe = Load.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ['my-loads'] });
      queryClient.invalidateQueries({ queryKey: ['recent-loads'] });
    });
    return unsubscribe;
  }, [queryClient]);

  if (!user?.onboarding_complete) {
    return <Navigate to="/onboarding" replace />;
  }

  const activeLoads = myLoads.filter(l => ['assigned', 'in_transit'].includes(l.status));
  const completedLoads = myLoads.filter(l => l.status === 'delivered');
  const totalEarnings = completedLoads.reduce((s, l) => s + (l.budget || 0), 0);
  const inTransitLoads = myLoads.filter(l => l.status === 'in_transit');

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['my-loads'] });
    await queryClient.invalidateQueries({ queryKey: ['recent-loads'] });
    await queryClient.invalidateQueries({ queryKey: ['my-profile'] });
  };

  if (isDriver) {
    return (
      <PullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading">Driver Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">Welcome back, {user?.full_name?.split(' ')[0] || 'Driver'}!</p>
          </div>
          <Link to="/loads">
            <Button className="bg-secondary hover:bg-secondary/90 text-white">
              Find Loads <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {profile?.subscription_plan === 'none' && (
          <Card className="border-secondary/40 bg-secondary/5">
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-secondary flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold">Subscribe to start bidding on loads</p>
                  <p className="text-xs text-muted-foreground">Plans start at just $69.99/month</p>
                </div>
              </div>
              <Link to="/subscription">
                <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-white whitespace-nowrap">Subscribe Now</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'In Transit', value: inTransitLoads.length, icon: Truck, color: 'text-orange-500', bg: 'bg-orange-500/10' },
            { label: 'Completed', value: completedLoads.length, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
            { label: 'Total Earned', value: `$${totalEarnings.toLocaleString()}`, icon: DollarSign, color: 'text-secondary', bg: 'bg-secondary/10' },
            { label: `Rating (${profile?.total_reviews || 0})`, value: profile?.average_rating?.toFixed(1) || '—', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
          ].map(stat => (
            <Card key={stat.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`h-11 w-11 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {profile?.verification_status !== 'verified' && (
          <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-500/5 dark:border-yellow-500/20">
            <CardContent className="p-4 flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-yellow-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-400">Profile Verification Pending</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-500">Complete your profile to get verified and build shipper trust</p>
              </div>
              <Link to="/profile">
                <Button size="sm" variant="outline" className="border-yellow-300 text-yellow-700 hover:bg-yellow-100 whitespace-nowrap">Complete Profile</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Truck className="h-4 w-4 text-secondary" /> My Active Loads
                </CardTitle>
                <Link to="/my-loads" className="text-xs text-secondary hover:underline">View All</Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {activeLoads.length === 0 ? (
                <div className="py-8 text-center">
                  <Truck className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No active loads right now</p>
                  <Link to="/loads" className="text-xs text-secondary hover:underline mt-1 inline-block">Browse the load board →</Link>
                </div>
              ) : activeLoads.slice(0, 5).map(load => (
                <Link key={load.id} to={`/load/${load.id}`} className="block p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold leading-tight">{load.title}</h4>
                    <Badge className={`text-xs capitalize shrink-0 ${statusColors[load.status]}`}>{load.status?.replace('_', ' ')}</Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span>{load.pickup_city}, {load.pickup_state}</span>
                    <ArrowRight className="h-3 w-3 shrink-0" />
                    <span>{load.delivery_city}, {load.delivery_state}</span>
                  </div>
                  {load.budget && <p className="text-xs font-semibold text-green-600 mt-1">${load.budget.toLocaleString()}</p>}
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-4 w-4 text-secondary" /> New Available Loads
                </CardTitle>
                <Link to="/loads" className="text-xs text-secondary hover:underline">View All</Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentLoads.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No loads posted yet</p>
              ) : recentLoads.map(load => (
                <Link key={load.id} to={`/load/${load.id}`} className="block p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold truncate">{load.title}</h4>
                        {load.is_urgent && <Badge className="bg-destructive/10 text-destructive text-xs shrink-0">Urgent</Badge>}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span>{load.pickup_city}, {load.pickup_state}</span>
                        <ArrowRight className="h-3 w-3 shrink-0" />
                        <span>{load.delivery_city}, {load.delivery_state}</span>
                      </div>
                      {load.pickup_date && (
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Clock className="h-3 w-3" />{format(new Date(load.pickup_date), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                    {load.budget && (
                      <div className="text-right shrink-0">
                        <p className="text-base font-bold text-green-600">${load.budget.toLocaleString()}</p>
                        {load.distance_miles && <p className="text-xs text-muted-foreground">${(load.budget / load.distance_miles).toFixed(2)}/mi</p>}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Load Board', path: '/loads', icon: Package },
            { label: 'My Loads', path: '/my-loads', icon: Truck },
            { label: 'Calendar', path: '/calendar', icon: Clock },
            { label: 'Report', path: '/report', icon: TrendingUp },
          ].map(link => (
            <Link key={link.path} to={link.path}>
              <Card className="hover:border-secondary/40 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <link.icon className="h-5 w-5 text-secondary" />
                  <span className="text-sm font-medium">{link.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
      </PullToRefresh>
    );
  }

  // SHIPPER DASHBOARD
  const postedLoads = myLoads.filter(l => l.status === 'posted');
  const totalSpent = completedLoads.reduce((s, l) => s + (l.budget || 0), 0);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Shipper Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Welcome back, {user?.full_name?.split(' ')[0] || 'there'}!</p>
        </div>
        <Link to="/post-load">
          <Button className="bg-secondary hover:bg-secondary/90 text-white">
            Post a Load <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Open Loads', value: postedLoads.length, icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'In Transit', value: activeLoads.length, icon: Truck, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: 'Delivered', value: completedLoads.length, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Total Spent', value: `$${totalSpent.toLocaleString()}`, icon: DollarSign, color: 'text-secondary', bg: 'bg-secondary/10' },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-11 w-11 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Truck className="h-4 w-4 text-secondary" /> Active Shipments
              </CardTitle>
              <Link to="/my-loads" className="text-xs text-secondary hover:underline">View All</Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeLoads.length === 0 ? (
              <div className="py-8 text-center">
                <Truck className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No active shipments</p>
                <Link to="/post-load" className="text-xs text-secondary hover:underline mt-1 inline-block">Post a load →</Link>
              </div>
            ) : activeLoads.slice(0, 5).map(load => (
              <Link key={load.id} to={`/load/${load.id}`} className="block p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-semibold">{load.title}</h4>
                  <Badge className={`text-xs capitalize shrink-0 ${statusColors[load.status]}`}>{load.status?.replace('_', ' ')}</Badge>
                </div>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span>{load.pickup_city}, {load.pickup_state}</span>
                  <ArrowRight className="h-3 w-3 shrink-0" />
                  <span>{load.delivery_city}, {load.delivery_state}</span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4 text-secondary" /> Recent Loads
              </CardTitle>
              <Link to="/my-loads" className="text-xs text-secondary hover:underline">View All</Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {myLoads.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No loads posted yet</p>
            ) : myLoads.slice(0, 5).map(load => (
              <Link key={load.id} to={`/load/${load.id}`} className="block p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-semibold">{load.title}</h4>
                  <span className="text-sm font-bold text-green-600 shrink-0">{load.budget ? `$${load.budget.toLocaleString()}` : ''}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span>{load.pickup_city}, {load.pickup_state}</span>
                  <ArrowRight className="h-3 w-3" />
                  <span>{load.delivery_city}, {load.delivery_state}</span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
    </PullToRefresh>
  );
}
