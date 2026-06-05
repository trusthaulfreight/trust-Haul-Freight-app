import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Truck, Building2, ArrowRight, Upload, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TRUCK_TYPES = ['flatbed', 'dry_van', 'reefer', 'box_truck', 'step_deck', 'hotshot', 'tanker', 'car_hauler'];
const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

export default function Onboarding() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    company_name: '', phone: '', city: '', state: '', zip_code: '', bio: '',
    mc_number: '', dot_number: '', cdl_number: '', cdl_state: '', years_experience: '',
    truck_types: [], service_radius_miles: 500,
    business_type: 'small_business', ein_number: '', address: '',
  });

  const updateForm = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const toggleTruckType = (type) => {
    setForm(prev => ({
      ...prev,
      truck_types: prev.truck_types.includes(type)
        ? prev.truck_types.filter(t => t !== type)
        : [...prev.truck_types, type]
    }));
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    updateForm(field, file_url);
  };

  const handleComplete = async () => {
    setLoading(true);
    if (accountType === 'driver') {
      // Set role first so RLS allows DriverProfile creation
      await base44.auth.updateMe({
        account_type: 'driver',
        role: 'driver',
      });
      const profile = await base44.entities.DriverProfile.create({
        user_id: user.id,
        company_name: form.company_name,
        phone: form.phone,
        city: form.city,
        state: form.state,
        zip_code: form.zip_code,
        bio: form.bio,
        mc_number: form.mc_number,
        dot_number: form.dot_number,
        cdl_number: form.cdl_number,
        cdl_state: form.cdl_state,
        years_experience: Number(form.years_experience) || 0,
        truck_types: form.truck_types,
        service_radius_miles: Number(form.service_radius_miles) || 500,
        insurance_url: form.insurance_url || '',
        cdl_url: form.cdl_url || '',
      });
      await base44.auth.updateMe({
        onboarding_complete: true,
        profile_id: profile.id,
      });
    } else {
      await base44.auth.updateMe({
        account_type: 'shipper',
        role: 'shipper',
      });
      const profile = await base44.entities.ShipperProfile.create({
        user_id: user.id,
        company_name: form.company_name,
        phone: form.phone,
        city: form.city,
        state: form.state,
        zip_code: form.zip_code,
        bio: form.bio,
        business_type: form.business_type,
        ein_number: form.ein_number,
        address: form.address,
      });
      await base44.auth.updateMe({
        onboarding_complete: true,
        profile_id: profile.id,
      });
    }
    setLoading(false);
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-muted/50 flex items-center justify-center p-4 pt-20">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-heading">Welcome to TrustHaul</CardTitle>
          <CardDescription>Let's set up your account in a few quick steps</CardDescription>
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-2 rounded-full transition-all ${s <= step ? 'w-12 bg-secondary' : 'w-8 bg-muted'}`} />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h3 className="text-lg font-bold mb-6 text-center">I am a...</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { type: 'driver', icon: Truck, label: 'Driver / Carrier', desc: 'I haul freight and want to find loads' },
                    { type: 'shipper', icon: Building2, label: 'Shipper / Organization', desc: 'I need freight picked up and delivered' },
                  ].map(opt => (
                    <button
                      key={opt.type}
                      onClick={() => { setAccountType(opt.type); setStep(2); }}
                      className={`p-6 rounded-xl border-2 transition-all text-left hover:border-secondary hover:shadow-md ${
                        accountType === opt.type ? 'border-secondary bg-secondary/5' : 'border-border'
                      }`}
                    >
                      <opt.icon className="h-8 w-8 text-secondary mb-3" />
                      <h4 className="font-bold">{opt.label}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h3 className="text-lg font-bold mb-4">Basic Information</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company / Business Name</Label>
                    <Input value={form.company_name} onChange={e => updateForm('company_name', e.target.value)} placeholder="Your company name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input value={form.phone} onChange={e => updateForm('phone', e.target.value)} placeholder="(555) 123-4567" />
                  </div>
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input value={form.city} onChange={e => updateForm('city', e.target.value)} placeholder="City" />
                  </div>
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Select value={form.state} onValueChange={v => updateForm('state', v)}>
                      <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                      <SelectContent>
                        {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Zip Code</Label>
                    <Input value={form.zip_code} onChange={e => updateForm('zip_code', e.target.value)} placeholder="12345" />
                  </div>
                  {accountType === 'shipper' && (
                    <>
                      <div className="space-y-2">
                        <Label>Business Type</Label>
                        <Select value={form.business_type} onValueChange={v => updateForm('business_type', v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="individual">Individual</SelectItem>
                            <SelectItem value="small_business">Small Business</SelectItem>
                            <SelectItem value="corporation">Corporation</SelectItem>
                            <SelectItem value="non_profit">Non-Profit</SelectItem>
                            <SelectItem value="government">Government</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label>Business Address</Label>
                        <Input value={form.address} onChange={e => updateForm('address', e.target.value)} placeholder="Full address" />
                      </div>
                    </>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>About You / Bio</Label>
                  <Textarea value={form.bio} onChange={e => updateForm('bio', e.target.value)} placeholder="Tell us about your business..." rows={3} />
                </div>
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button onClick={() => setStep(3)} className="bg-secondary hover:bg-secondary/90 text-white">
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h3 className="text-lg font-bold mb-4">
                  {accountType === 'driver' ? 'Driver Details & Certifications' : 'Final Details'}
                </h3>

                {accountType === 'driver' ? (
                  <>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>MC Number</Label>
                        <Input value={form.mc_number} onChange={e => updateForm('mc_number', e.target.value)} placeholder="MC-123456" />
                      </div>
                      <div className="space-y-2">
                        <Label>DOT Number</Label>
                        <Input value={form.dot_number} onChange={e => updateForm('dot_number', e.target.value)} placeholder="DOT-789012" />
                      </div>
                      <div className="space-y-2">
                        <Label>CDL Number</Label>
                        <Input value={form.cdl_number} onChange={e => updateForm('cdl_number', e.target.value)} placeholder="CDL number" />
                      </div>
                      <div className="space-y-2">
                        <Label>CDL State</Label>
                        <Select value={form.cdl_state} onValueChange={v => updateForm('cdl_state', v)}>
                          <SelectTrigger><SelectValue placeholder="State" /></SelectTrigger>
                          <SelectContent>
                            {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Years of Experience</Label>
                        <Input type="number" value={form.years_experience} onChange={e => updateForm('years_experience', e.target.value)} placeholder="5" />
                      </div>
                      <div className="space-y-2">
                        <Label>Service Radius (miles)</Label>
                        <Input type="number" value={form.service_radius_miles} onChange={e => updateForm('service_radius_miles', e.target.value)} placeholder="500" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label>Truck Types You Operate</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {TRUCK_TYPES.map(type => (
                          <label key={type} className="flex items-center gap-2 text-sm cursor-pointer">
                            <Checkbox
                              checked={form.truck_types.includes(type)}
                              onCheckedChange={() => toggleTruckType(type)}
                            />
                            <span className="capitalize">{type.replace(/_/g, ' ')}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Upload Insurance Document</Label>
                        <Input type="file" accept=".pdf,.jpg,.png" onChange={e => handleFileUpload(e, 'insurance_url')} />
                      </div>
                      <div className="space-y-2">
                        <Label>Upload CDL Copy</Label>
                        <Input type="file" accept=".pdf,.jpg,.png" onChange={e => handleFileUpload(e, 'cdl_url')} />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>EIN Number (optional)</Label>
                      <Input value={form.ein_number} onChange={e => updateForm('ein_number', e.target.value)} placeholder="XX-XXXXXXX" />
                    </div>
                    <p className="text-sm text-muted-foreground p-4 bg-muted rounded-lg">
                      As a shipper, you can post loads for <strong>free</strong>. We only charge drivers a subscription fee. 
                      You'll be able to browse verified drivers, view their ratings, and communicate directly.
                    </p>
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                  <Button onClick={handleComplete} disabled={loading} className="bg-secondary hover:bg-secondary/90 text-white">
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Setting up...</> : 'Complete Setup'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}