import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Truck, CheckSquare, Trash2, RefreshCw, MapPin, DollarSign, AlertCircle, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useToast } from "@/components/ui/use-toast";

const statusColors = {
  posted: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  assigned: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
  in_transit: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  delivered: 'bg-green-500/10 text-green-700 border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-600 border-red-500/20',
};

const VALID_TRANSITIONS = {
  posted: ['cancelled'],
  assigned: ['in_transit', 'cancelled'],
  in_transit: ['delivered'],
  delivered: [],
  cancelled: [],
};

export default function BulkLoads() {
  const { user } = useAuth();
  const isDriver = user?.account_type === 'driver';
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [selected, setSelected] = useState(new Set());
  const [statusFilter, setStatusFilter] = useState('all');
  const [bulkAction, setBulkAction] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const { data: loads = [], isLoading } = useQuery({
    queryKey: ['bulk-loads', user?.id],
    queryFn: () => isDriver
      ? base44.entities.Load.filter({ assigned_driver_user_id: user.id }, '-created_date', 100)
      : base44.entities.Load.filter({ shipper_user_id: user.id }, '-created_date', 100),
  });

  const filtered = statusFilter === 'all' ? loads : loads.filter(l => l.status === statusFilter);

  const allSelected = filtered.length > 0 && filtered.every(l => selected.has(l.id));
  const someSelected = selected.size > 0;

  const toggleOne = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(l => l.id)));
    }
  };

  // What bulk actions are valid for the current selection?
  const selectedLoads = loads.filter(l => selected.has(l.id));
  const availableActions = () => {
    if (selectedLoads.length === 0) return [];
    const allStatuses = [...new Set(selectedLoads.map(l => l.status))];
    // Only show actions valid for ALL selected loads
    const possible = allStatuses.reduce((acc, s) => {
      const transitions = VALID_TRANSITIONS[s] || [];
      return acc === null ? transitions : acc.filter(t => transitions.includes(t));
    }, null);
    return possible || [];
  };

  const applyBulkAction = async () => {
    if (!bulkAction || selectedLoads.length === 0) return;
    setIsApplying(true);
    try {
      if (bulkAction === 'delete') {
        for (const load of selectedLoads) {
          await base44.entities.Load.delete(load.id);
        }
        toast({ title: `${selectedLoads.length} load(s) deleted` });
      } else {
        for (const load of selectedLoads) {
          await base44.entities.Load.update(load.id, { status: bulkAction });
        }
        toast({ title: `${selectedLoads.length} load(s) updated to "${bulkAction.replace('_', ' ')}"` });
      }
      queryClient.invalidateQueries({ queryKey: ['bulk-loads', user?.id] });
      setSelected(new Set());
      setBulkAction('');
    } catch (e) {
      toast({ title: 'Error applying action', variant: 'destructive' });
    }
    setIsApplying(false);
  };

  const statusCounts = loads.reduce((acc, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-heading flex items-center gap-2">
          <CheckSquare className="h-6 w-6 text-secondary" />
          Bulk Load Actions
        </h1>
      </div>

      {/* Filters + bulk toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3 flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses ({loads.length})</SelectItem>
                  {Object.entries(statusCounts).map(([s, c]) => (
                    <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')} ({c})</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  id="select-all"
                />
                <label htmlFor="select-all" className="cursor-pointer">Select all ({filtered.length})</label>
              </div>
            </div>

            {someSelected && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-secondary">{selected.size} selected</span>
                <Select value={bulkAction} onValueChange={setBulkAction}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Choose action…" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableActions().map(a => (
                      <SelectItem key={a} value={a} className="capitalize">{a.replace('_', ' ')}</SelectItem>
                    ))}
                    {isDriver ? null : <SelectItem value="delete" className="text-destructive">Delete loads</SelectItem>}
                  </SelectContent>
                </Select>
                <Button
                  onClick={applyBulkAction}
                  disabled={!bulkAction || isApplying}
                  className="bg-secondary hover:bg-secondary/90 text-white"
                >
                  {isApplying ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  Apply
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>Clear</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Load list */}
      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-muted border-t-secondary rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No loads found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(load => (
            <Card
              key={load.id}
              className={`transition-all ${selected.has(load.id) ? 'border-secondary bg-secondary/5' : 'hover:border-border/80'}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selected.has(load.id)}
                    onCheckedChange={() => toggleOne(load.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link to={`/load/${load.id}`} className="font-semibold hover:text-secondary transition-colors">
                          {load.title}
                        </Link>
                        <Badge className={`text-xs capitalize ${statusColors[load.status]}`} variant="outline">
                          {load.status?.replace('_', ' ')}
                        </Badge>
                        {load.is_urgent && <Badge className="text-xs bg-destructive/10 text-destructive">Urgent</Badge>}
                      </div>
                      <div className="flex items-center gap-3">
                        {load.budget && (
                          <span className="font-bold text-green-600 flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />{load.budget.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {load.pickup_city}, {load.pickup_state} → {load.delivery_city}, {load.delivery_state}
                      </span>
                      {load.pickup_date && (
                        <span className="flex items-center gap-1">
                          Pickup: {format(parseISO(load.pickup_date), 'MMM d, yyyy')}
                        </span>
                      )}
                      {load.truck_type_required && (
                        <span className="flex items-center gap-1">
                          <Truck className="h-3 w-3" />{load.truck_type_required.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}