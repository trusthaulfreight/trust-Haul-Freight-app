import React from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calendar, DollarSign, ArrowRight, Package } from 'lucide-react';
import { format } from 'date-fns';

const statusColors = {
  posted: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  assigned: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  in_transit: 'bg-secondary/10 text-secondary border-secondary/20',
  delivered: 'bg-green-500/10 text-green-600 border-green-500/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};

function LoadCard({ load }) {
  return (
    <Link to={`/load/${load.id}`}>
      <Card className="hover:shadow-md transition-all hover:border-secondary/30 cursor-pointer">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold">{load.title}</h3>
            <div className="flex items-center gap-2">
              <Badge className={statusColors[load.status]} variant="outline">{load.status?.replace('_', ' ')}</Badge>
              {load.budget && <span className="font-bold text-green-600">${load.budget.toLocaleString()}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>{load.pickup_city}, {load.pickup_state}</span>
            </div>
            <ArrowRight className="h-3 w-3" />
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <span>{load.delivery_city}, {load.delivery_state}</span>
            </div>
            {load.pickup_date && (
              <span className="ml-auto flex items-center gap-1 text-xs">
                <Calendar className="h-3 w-3" />{format(new Date(load.pickup_date), 'MMM d')}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function MyLoads() {
  const { user } = useAuth();
  const isDriver = user?.account_type === 'driver';

  const { data: loads = [], isLoading } = useQuery({
    queryKey: ['my-loads-page'],
    queryFn: () => isDriver
      ? base44.entities.Load.filter({ assigned_driver_user_id: user.id }, '-created_date')
      : base44.entities.Load.filter({ shipper_user_id: user.id }, '-created_date'),
  });

  const active = loads.filter(l => ['posted', 'assigned', 'in_transit'].includes(l.status));
  const completed = loads.filter(l => l.status === 'delivered');
  const cancelled = loads.filter(l => l.status === 'cancelled');

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-muted border-t-secondary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">My Loads</h1>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelled.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="space-y-3 mt-4">
          {active.length === 0 ? (
            <Card><CardContent className="p-12 text-center"><Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" /><p className="text-muted-foreground">No active loads</p></CardContent></Card>
          ) : active.map(l => <LoadCard key={l.id} load={l} />)}
        </TabsContent>
        <TabsContent value="completed" className="space-y-3 mt-4">
          {completed.length === 0 ? (
            <Card><CardContent className="p-12 text-center"><p className="text-muted-foreground">No completed loads</p></CardContent></Card>
          ) : completed.map(l => <LoadCard key={l.id} load={l} />)}
        </TabsContent>
        <TabsContent value="cancelled" className="space-y-3 mt-4">
          {cancelled.length === 0 ? (
            <Card><CardContent className="p-12 text-center"><p className="text-muted-foreground">No cancelled loads</p></CardContent></Card>
          ) : cancelled.map(l => <LoadCard key={l.id} load={l} />)}
        </TabsContent>
      </Tabs>
    </div>
  );
}