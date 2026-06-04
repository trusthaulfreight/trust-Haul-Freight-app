import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ShieldCheck, Star, Truck, Building2, Save, Loader2, Upload, Trash2 } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Profile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isDriver = user?.account_type === 'driver';
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      if (isDriver) {
        const profiles = await base44.entities.DriverProfile.filter({ user_id: user.id });
        if (profiles[0]) await base44.entities.DriverProfile.delete(profiles[0].id);
      } else {
        const profiles = await base44.entities.ShipperProfile.filter({ user_id: user.id });
        if (profiles[0]) await base44.entities.ShipperProfile.delete(profiles[0].id);
      }
      base44.auth.logout('/');
    } catch (e) {
      setDeleting(false);
    }
  };

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const profiles = isDriver
        ? await base44.entities.DriverProfile.filter({ user_id: user.id })
        : await base44.entities.ShipperProfile.filter({ user_id: user.id });
      const p = profiles[0];
      if (p) setForm(p);
      return p;
    },
  });

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (isDriver) {
        return base44.entities.DriverProfile.update(profile.id, form);
      } else {
        return base44.entities.ShipperProfile.update(profile.id, form);
      }
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['profile'] });
      const previous = queryClient.getQueryData(['profile']);
      queryClient.setQueryData(['profile'], (old) => old ? { ...old, ...form } : old);
      setEditing(false);
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(['profile'], ctx.previous);
      setEditing(true);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    update('profile_photo_url', file_url);
  };

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-muted border-t-secondary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-heading">My Profile</h1>
        <Button
          onClick={() => editing ? saveMutation.mutate() : setEditing(true)}
          className={editing ? "bg-secondary hover:bg-secondary/90 text-white" : ""}
          variant={editing ? "default" : "outline"}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : editing ? <Save className="mr-2 h-4 w-4" /> : null}
          {editing ? 'Save Changes' : 'Edit Profile'}
        </Button>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-20 w-20">
                {form.profile_photo_url ? (
                  <img src={form.profile_photo_url} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <AvatarFallback className="bg-secondary text-white text-2xl font-bold">
                    {user?.full_name?.[0] || 'U'}
                  </AvatarFallback>
                )}
              </Avatar>
              {editing && (
                <label className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-secondary text-white flex items-center justify-center cursor-pointer hover:bg-secondary/90">
                  <Upload className="h-3 w-3" />
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold">{form.company_name || user?.full_name || 'Your Name'}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-3 mt-2">
                <Badge className={`${profile?.verification_status === 'verified' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'}`}>
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  {profile?.verification_status === 'verified' ? 'Verified' : 'Pending Verification'}
                </Badge>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-secondary text-secondary" />
                  <span className="font-semibold">{profile?.average_rating?.toFixed(1) || '0.0'}</span>
                  <span className="text-muted-foreground">({profile?.total_reviews || 0})</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input value={form.company_name || ''} onChange={e => update('company_name', e.target.value)} disabled={!editing} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone || ''} onChange={e => update('phone', e.target.value)} disabled={!editing} />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input value={form.city || ''} onChange={e => update('city', e.target.value)} disabled={!editing} />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Input value={form.state || ''} onChange={e => update('state', e.target.value)} disabled={!editing} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea value={form.bio || ''} onChange={e => update('bio', e.target.value)} disabled={!editing} rows={3} />
          </div>
          {isDriver && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>MC Number</Label>
                <Input value={form.mc_number || ''} onChange={e => update('mc_number', e.target.value)} disabled={!editing} />
              </div>
              <div className="space-y-2">
                <Label>DOT Number</Label>
                <Input value={form.dot_number || ''} onChange={e => update('dot_number', e.target.value)} disabled={!editing} />
              </div>
              <div className="space-y-2">
                <Label>CDL Number</Label>
                <Input value={form.cdl_number || ''} onChange={e => update('cdl_number', e.target.value)} disabled={!editing} />
              </div>
              <div className="space-y-2">
                <Label>Years Experience</Label>
                <Input type="number" value={form.years_experience || ''} onChange={e => update('years_experience', Number(e.target.value))} disabled={!editing} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Delete Account */}
      <Card className="border-destructive/30">
        <CardHeader><CardTitle className="text-lg text-destructive">Danger Zone</CardTitle></CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Delete Account</p>
            <p className="text-xs text-muted-foreground">Permanently delete your account and all data. This cannot be undone.</p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="shrink-0">
                <Trash2 className="h-4 w-4 mr-2" /> Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your profile and log you out. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Yes, Delete My Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}