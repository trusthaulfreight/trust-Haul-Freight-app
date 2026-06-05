// ============================================================
// db.js — replaces all base44.entities.* calls
// Import { db } from '@/api/db' anywhere you used base44.entities
// ============================================================
import { supabase } from '@/api/supabaseClient';

// ---------- FILE UPLOADS (replaces base44.integrations.Core.UploadFile) ----------
export async function uploadFile(file, userId) {
  const ext = file.name.split('.').pop();
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('documents').upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from('documents').getPublicUrl(path);
  return { file_url: data.publicUrl };
}

// ---------- PROFILES (auth metadata mirror) ----------
export const Profiles = {
  async me(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },
  async update(userId, fields) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ---------- DRIVER PROFILES ----------
export const DriverProfile = {
  async create(fields) {
    const { data, error } = await supabase
      .from('driver_profiles')
      .insert(fields)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async filter(filters) {
    let q = supabase.from('driver_profiles').select('*');
    Object.entries(filters).forEach(([k, v]) => { q = q.eq(k, v); });
    const { data, error } = await q;
    if (error) throw error;
    return data;
  },
  async update(id, fields) {
    const { data, error } = await supabase
      .from('driver_profiles')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async delete(id) {
    const { error } = await supabase.from('driver_profiles').delete().eq('id', id);
    if (error) throw error;
  },
};

// ---------- SHIPPER PROFILES ----------
export const ShipperProfile = {
  async create(fields) {
    const { data, error } = await supabase
      .from('shipper_profiles')
      .insert(fields)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async filter(filters) {
    let q = supabase.from('shipper_profiles').select('*');
    Object.entries(filters).forEach(([k, v]) => { q = q.eq(k, v); });
    const { data, error } = await q;
    if (error) throw error;
    return data;
  },
  async update(id, fields) {
    const { data, error } = await supabase
      .from('shipper_profiles')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async delete(id) {
    const { error } = await supabase.from('shipper_profiles').delete().eq('id', id);
    if (error) throw error;
  },
};

// ---------- LOADS ----------
export const Load = {
  async create(fields) {
    const { data, error } = await supabase
      .from('loads')
      .insert(fields)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async filter(filters, orderBy = '-created_at', limit = 100) {
    const col = orderBy.startsWith('-') ? orderBy.slice(1) : orderBy;
    const asc = !orderBy.startsWith('-');
    let q = supabase.from('loads').select('*').order(col, { ascending: asc }).limit(limit);
    Object.entries(filters).forEach(([k, v]) => { q = q.eq(k, v); });
    const { data, error } = await q;
    if (error) throw error;
    return data;
  },
  async getById(id) {
    const { data, error } = await supabase
      .from('loads')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },
  async update(id, fields) {
    const { data, error } = await supabase
      .from('loads')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async delete(id) {
    const { error } = await supabase.from('loads').delete().eq('id', id);
    if (error) throw error;
  },
  // Real-time subscription (replaces base44.entities.Load.subscribe)
  subscribe(callback) {
    const channel = supabase
      .channel('loads-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'loads' }, callback)
      .subscribe();
    return () => supabase.removeChannel(channel);
  },
};

// ---------- LOAD BIDS ----------
export const LoadBid = {
  async create(fields) {
    const { data, error } = await supabase
      .from('load_bids')
      .insert(fields)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async filter(filters) {
    let q = supabase.from('load_bids').select('*').order('created_at', { ascending: false });
    Object.entries(filters).forEach(([k, v]) => { q = q.eq(k, v); });
    const { data, error } = await q;
    if (error) throw error;
    return data;
  },
  async update(id, fields) {
    const { data, error } = await supabase
      .from('load_bids')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ---------- MESSAGES ----------
export const Message = {
  async create(fields) {
    const { data, error } = await supabase
      .from('messages')
      .insert(fields)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async filter(filters, orderBy = '-created_at', limit = 100) {
    const col = orderBy.startsWith('-') ? orderBy.slice(1) : orderBy;
    const asc = !orderBy.startsWith('-');
    let q = supabase.from('messages').select('*').order(col, { ascending: asc }).limit(limit);
    Object.entries(filters).forEach(([k, v]) => { q = q.eq(k, v); });
    const { data, error } = await q;
    if (error) throw error;
    return data;
  },
};

// ---------- REVIEWS ----------
export const Review = {
  async create(fields) {
    const { data, error } = await supabase
      .from('reviews')
      .insert(fields)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async filter(filters, orderBy = '-created_at') {
    const col = orderBy.startsWith('-') ? orderBy.slice(1) : orderBy;
    const asc = !orderBy.startsWith('-');
    let q = supabase.from('reviews').select('*').order(col, { ascending: asc });
    Object.entries(filters).forEach(([k, v]) => { q = q.eq(k, v); });
    const { data, error } = await q;
    if (error) throw error;
    return data;
  },
};
