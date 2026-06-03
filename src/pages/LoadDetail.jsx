import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Calendar, Package, DollarSign, Truck, Clock, User, Star, ShieldCheck, MessageSquare, ArrowLeft, Send, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function LoadDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isDriver = user?.account_type === 'driver';
  const [bidAmount, setBidAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [bidOpen, setBidOpen] = useState(false);

  const { data: load, isLoading } = useQuery({
    queryKey: ['load', id],
    queryFn: async () => {
      const loads = await base44.entities.Load.filter({ id });
      return loads[0];
    },
  });

  const { data: bids = [] } = useQuery({
    queryKey: ['load-bids', id],
    queryFn: () => base44.entities.LoadBid.filter({ load_id: id }),
    enabled: !!id,
  });

  const { data: shipper } = useQuery({
    queryKey: ['shipper', load?.shipper_user_id],
    queryFn: async () => {
      if (!load?.shipper_user_id) return null;
      const profiles = await base44.entities.ShipperProfile.filter({ user_id: load.shipper_user_id });
      return profiles[0];
    },
    enabled: !!load?.shipper_user_id,
  });

  const submitBid = useMutation({
    mutationFn: async () => {
      const profiles = await base44.entities.DriverProfile.filter({ user_id: user.id });
      const profile = profiles[0];
      await base44.entities.LoadBid.create({
        load_id: id,
        driver_id: profile?.id || '',
        driver_user_id: user.id,
        bid_amount: Number(bidAmount),
        message: bidMessage,
        status: 'pending',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['load-bids', id] });
      setBidOpen(false);
      setBidAmount('');
      setBidMessage('');
    },
  });

  const acceptBid = useMutation({
    mutationFn: async (bid) => {
      await base44.entities.LoadBid.update(bid.id, { status: 'accepted' });
      await base44.entities.Load.update(id, {
        status: 'assigned',
        assigned_driver_id: bid.driver_id,
        assigned_driver_user_id: bid.driver_user_id,
      });
      // Reject other bids
      const otherBids = bids.filter(b => b.id !== bid.id && b.status === 'pending');
      for (const ob of otherBids) {
        await base44.entities.LoadBid.update(ob.id, { status: 'rejected' });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['load', id] });
      queryClient.invalidateQueries({ queryKey: ['load-bids', id] });
    },
  });

  const updateStatus = useMutation({
    mutationFn: async (newStatus) => {
      await base44.entities.Load.update(id, { status: newStatus });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['load', id] }),
  });

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-muted border-t-secondary rounded-full animate-spin" />
    </div>
  );

  if (!load) return <div className="text-center py-20"><p>Load not found</p></div>;

  const isOwner = load.shipper_user_id === user?.id;
  const isAssignedDriver = load.assigned_driver_user_id === user?.id;
  const myBid = bids.find(b => b.driver_user_id === user?.id);

  const statusColors = {
    posted: 'bg-blue-500/10 text-blue-500',
    assigned: 'bg-yellow-500/10 text-yellow-600',
    in_transit: 'bg-secondary/10 text-secondary',
    delivered: 'bg-green-500/10 text-green-600',
    cancelled: 'bg-destructive/10 text-destructive',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-heading">{load.title}</h1>
            <Badge className={statusColors[load.status] || 'bg-muted'}>{load.status?.replace('_', ' ')}</Badge>
            {load.is_urgent && <Badge className="bg-destructive/10 text-destructive">Urgent</Badge>}
          </div>
          <p className="text-sm text-muted-foreground mt-1">Posted {format(new Date(load.created_date), 'MMM d, yyyy')}</p>
        </div>
        {load.budget && <p className="text-3xl font-bold text-green-600">${load.budget.toLocaleString()}</p>}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Route Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-green-500 border-2 border-green-200" />
                  <div className="w-0.5 h-16 bg-border" />
                  <div className="h-3 w-3 rounded-full bg-red-500 border-2 border-red-200" />
                </div>
                <div className="flex-1 space-y-6">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Pickup</p>
                    <p className="font-semibold">{load.pickup_city}, {load.pickup_state} {load.pickup_zip}</p>
                    {load.pickup_address && <p className="text-sm text-muted-foreground">{load.pickup_address}</p>}
                    {load.pickup_date && <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><Calendar className="h-3 w-3" />{format(new Date(load.pickup_date), 'MMM d, yyyy')}</p>}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Delivery</p>
                    <p className="font-semibold">{load.delivery_city}, {load.delivery_state} {load.delivery_zip}</p>
                    {load.delivery_address && <p className="text-sm text-muted-foreground">{load.delivery_address}</p>}
                    {load.delivery_date && <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><Calendar className="h-3 w-3" />{format(new Date(load.delivery_date), 'MMM d, yyyy')}</p>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Load Details</CardTitle></CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                {load.truck_type_required && <div><span className="text-muted-foreground">Truck Type:</span> <span className="capitalize font-medium ml-1">{load.truck_type_required.replace(/_/g, ' ')}</span></div>}
                {load.weight_lbs && <div><span className="text-muted-foreground">Weight:</span> <span className="font-medium ml-1">{load.weight_lbs.toLocaleString()} lbs</span></div>}
                {load.distance_miles && <div><span className="text-muted-foreground">Distance:</span> <span className="font-medium ml-1">{load.distance_miles} miles</span></div>}
                {load.commodity && <div><span className="text-muted-foreground">Commodity:</span> <span className="font-medium ml-1">{load.commodity}</span></div>}
                {load.dimensions && <div><span className="text-muted-foreground">Dimensions:</span> <span className="font-medium ml-1">{load.dimensions}</span></div>}
                {load.commitment_deposit && <div><span className="text-muted-foreground">Commitment Deposit:</span> <span className="font-medium ml-1">${load.commitment_deposit}</span></div>}
              </div>
              {load.description && <p className="mt-4 text-sm text-muted-foreground">{load.description}</p>}
              {load.special_instructions && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Special Instructions</p>
                  <p className="text-sm">{load.special_instructions}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bids */}
          {(isOwner || isDriver) && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Bids ({bids.length})</CardTitle>
                  {isDriver && load.status === 'posted' && !myBid && (
                    <Dialog open={bidOpen} onOpenChange={setBidOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-secondary hover:bg-secondary/90 text-white">Place Bid</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Place Your Bid</DialogTitle></DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <Label>Bid Amount ($)</Label>
                            <Input type="number" value={bidAmount} onChange={e => setBidAmount(e.target.value)} placeholder="Enter your price" />
                          </div>
                          <div className="space-y-2">
                            <Label>Message to Shipper</Label>
                            <Textarea value={bidMessage} onChange={e => setBidMessage(e.target.value)} placeholder="Why should they choose you?" rows={3} />
                          </div>
                          <Button
                            onClick={() => submitBid.mutate()}
                            disabled={!bidAmount || submitBid.isPending}
                            className="w-full bg-secondary hover:bg-secondary/90 text-white"
                          >
                            {submitBid.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            Submit Bid
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {bids.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No bids yet</p>
                ) : bids.map(bid => (
                  <div key={bid.id} className="p-4 rounded-lg border border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">D</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold">Driver Bid</p>
                          <Badge variant="outline" className="capitalize text-xs">{bid.status}</Badge>
                        </div>
                      </div>
                      <p className="text-lg font-bold text-green-600">${bid.bid_amount?.toLocaleString()}</p>
                    </div>
                    {bid.message && <p className="text-sm text-muted-foreground mt-2">{bid.message}</p>}
                    {isOwner && bid.status === 'pending' && (
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" onClick={() => acceptBid.mutate(bid)} className="bg-green-600 hover:bg-green-700 text-white">
                          Accept
                        </Button>
                        <Link to={`/messages?user=${bid.driver_user_id}`}>
                          <Button size="sm" variant="outline"><MessageSquare className="mr-1 h-3 w-3" /> Message</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Shipper info */}
          {shipper && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm text-muted-foreground">Posted by</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-secondary text-white font-bold">{shipper.company_name?.[0] || 'S'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{shipper.company_name || 'Shipper'}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 fill-secondary text-secondary" />
                      {shipper.average_rating?.toFixed(1) || '0.0'} ({shipper.total_reviews || 0} reviews)
                    </div>
                  </div>
                </div>
                {shipper.verification_status === 'verified' && (
                  <Badge className="mt-3 bg-green-500/10 text-green-600 border-green-500/20">
                    <ShieldCheck className="h-3 w-3 mr-1" /> Verified
                  </Badge>
                )}
              </CardContent>
            </Card>
          )}

          {/* Status actions */}
          {isAssignedDriver && load.status === 'assigned' && (
            <Card>
              <CardContent className="p-4">
                <Button onClick={() => updateStatus.mutate('in_transit')} className="w-full bg-secondary hover:bg-secondary/90 text-white">
                  Mark as In Transit
                </Button>
              </CardContent>
            </Card>
          )}
          {isAssignedDriver && load.status === 'in_transit' && (
            <Card>
              <CardContent className="p-4">
                <Button onClick={() => updateStatus.mutate('delivered')} className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Mark as Delivered
                </Button>
              </CardContent>
            </Card>
          )}
          {isOwner && load.status === 'posted' && (
            <Card>
              <CardContent className="p-4">
                <Button variant="outline" onClick={() => updateStatus.mutate('cancelled')} className="w-full text-destructive">
                  Cancel Load
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Message button */}
          {isDriver && load.shipper_user_id && load.shipper_user_id !== user?.id && (
            <Link to={`/messages?user=${load.shipper_user_id}`}>
              <Button variant="outline" className="w-full">
                <MessageSquare className="mr-2 h-4 w-4" /> Message Shipper
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}