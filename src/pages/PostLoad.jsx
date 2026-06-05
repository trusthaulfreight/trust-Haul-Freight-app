import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Load, ShipperProfile } from '@/api/db';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SelectItem } from "@/components/ui/select";
import MobileSelect from '@/components/MobileSelect';
import { Switch } from "@/components/ui/switch";
import { Loader2, Package } from 'lucide-react';

const TRUCK_TYPES = ['any', 'flatbed', 'dry_van', 'reefer', 'box_truck', 'step_deck', 'hotshot', 'tanker', 'car_hauler'];
const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

export default function PostLoad() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    title: '', description: '', pickup_address: '', pickup_city: '', pickup_state: '', pickup_zip: '',
    delivery_address: '', delivery_city: '', delivery_state: '', delivery_zip: '',
    pickup_date: '', delivery_date: '', truck_type_required: 'any',
    weight_lbs: '', dimensions: '', commodity: '', special_instructions: '',
    budget: '', distance_miles: '', is_urgent: false,
  });

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const postLoadMutation = useMutation({
    mutationFn: async () => {
      const profiles = await ShipperProfile.filter({ user_id: user.id });
      const profile = profiles[0];
      return Load.create({
        ...form,
        shipper_id: profile?.id || null,
        shipper_user_id: user.id,
        weight_lbs: Number(form.weight_lbs) || null,
        budget: Number(form.budget) || null,
        distance_miles: Number(form.distance_miles) || null,
        status: 'posted',
      });
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['my-loads'] });
      const previous = queryClient.getQueryData(['my-loads']);
      const optimistic = {
        id: `optimistic-${Date.now()}`,
        ...form,
        shipper_user_id: user.id,
        status: 'posted',
        created_at: new Date().toISOString(),
      };
      queryClient.setQueryData(['my-loads'], (old = []) => [optimistic, ...old]);
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(['my-loads'], ctx.previous);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-loads'] });
      navigate('/my-loads');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    postLoadMutation.mutate();
  };

  const loading = postLoadMutation.isPending;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center">
          <Package className="h-5 w-5 text-secondary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-heading">Post a Load</h1>
          <p className="text-sm text-muted-foreground">Fill in the details and find a trusted driver</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Load Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Load Title</Label>
              <Input value={form.title} onChange={e => update('title', e.target.value)} placeholder="e.g. 20 pallets of electronics to Miami" required />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="Describe the freight, handling requirements, etc." rows={3} />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Truck Type Required</Label>
                <MobileSelect value={form.truck_type_required} onValueChange={v => update('truck_type_required', v)} label="Truck Type">
                  {TRUCK_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t === 'any' ? 'Any Type' : t.replace(/_/g, ' ')}</SelectItem>)}
                </MobileSelect>
              </div>
              <div className="space-y-2">
                <Label>Weight (lbs)</Label>
                <Input type="number" value={form.weight_lbs} onChange={e => update('weight_lbs', e.target.value)} placeholder="10000" />
              </div>
              <div className="space-y-2">
                <Label>Commodity</Label>
                <Input value={form.commodity} onChange={e => update('commodity', e.target.value)} placeholder="Electronics, food, etc." />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.is_urgent} onCheckedChange={v => update('is_urgent', v)} id="urgent" />
              <Label htmlFor="urgent" className="cursor-pointer">Mark as Urgent</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Pickup Location</CardTitle></CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2"><Label>Address</Label><Input value={form.pickup_address} onChange={e => update('pickup_address', e.target.value)} placeholder="Street address" /></div>
            <div className="space-y-2"><Label>City</Label><Input value={form.pickup_city} onChange={e => update('pickup_city', e.target.value)} required placeholder="City" /></div>
            <div className="space-y-2"><Label>State</Label>
              <MobileSelect value={form.pickup_state} onValueChange={v => update('pickup_state', v)} placeholder="State" label="Pickup State">
                {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </MobileSelect>
            </div>
            <div className="space-y-2"><Label>Zip Code</Label><Input value={form.pickup_zip} onChange={e => update('pickup_zip', e.target.value)} placeholder="12345" /></div>
            <div className="space-y-2"><Label>Pickup Date</Label><Input type="date" value={form.pickup_date} onChange={e => update('pickup_date', e.target.value)} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Delivery Location</CardTitle></CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2"><Label>Address</Label><Input value={form.delivery_address} onChange={e => update('delivery_address', e.target.value)} placeholder="Street address" /></div>
            <div className="space-y-2"><Label>City</Label><Input value={form.delivery_city} onChange={e => update('delivery_city', e.target.value)} required placeholder="City" /></div>
            <div className="space-y-2"><Label>State</Label>
              <MobileSelect value={form.delivery_state} onValueChange={v => update('delivery_state', v)} placeholder="State" label="Delivery State">
                {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </MobileSelect>
            </div>
            <div className="space-y-2"><Label>Zip Code</Label><Input value={form.delivery_zip} onChange={e => update('delivery_zip', e.target.value)} placeholder="12345" /></div>
            <div className="space-y-2"><Label>Delivery Date</Label><Input type="date" value={form.delivery_date} onChange={e => update('delivery_date', e.target.value)} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Pricing</CardTitle></CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Budget ($)</Label>
              <Input type="number" value={form.budget} onChange={e => update('budget', e.target.value)} placeholder="2500" />
            </div>
            <div className="space-y-2">
              <Label>Estimated Distance (miles)</Label>
              <Input type="number" value={form.distance_miles} onChange={e => update('distance_miles', e.target.value)} placeholder="350" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Additional Info</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Dimensions</Label>
              <Input value={form.dimensions} onChange={e => update('dimensions', e.target.value)} placeholder='e.g. 48" x 40" x 48"' />
            </div>
            <div className="space-y-2">
              <Label>Special Instructions</Label>
              <Textarea value={form.special_instructions} onChange={e => update('special_instructions', e.target.value)} placeholder="Any special handling, delivery windows, etc." rows={3} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pb-6">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" className="bg-secondary hover:bg-secondary/90 text-white" disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Posting...</> : 'Post Load'}
          </Button>
        </div>
      </form>
    </div>
  );
}
