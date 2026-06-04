import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Calendar, DollarSign, Truck, Package, Filter, Clock, ArrowRight, Zap } from 'lucide-react';
import { format } from 'date-fns';

const TRUCK_TYPES = ['any', 'flatbed', 'dry_van', 'reefer', 'box_truck', 'step_deck', 'hotshot', 'tanker', 'car_hauler'];

export default function LoadBoard() {
  const [search, setSearch] = useState('');
  const [truckFilter, setTruckFilter] = useState('any');
  const [stateFilter, setStateFilter] = useState('any');
  const [sortBy, setSortBy] = useState('newest');

  const { data: loads = [], isLoading } = useQuery({
    queryKey: ['loads-board'],
    queryFn: () => base44.entities.Load.filter({ status: 'posted' }, '-created_date', 50),
  });

  const filtered = loads
    .filter(load => {
      const matchesSearch = !search ||
        load.title?.toLowerCase().includes(search.toLowerCase()) ||
        load.pickup_city?.toLowerCase().includes(search.toLowerCase()) ||
        load.delivery_city?.toLowerCase().includes(search.toLowerCase()) ||
        load.pickup_state?.toLowerCase().includes(search.toLowerCase()) ||
        load.delivery_state?.toLowerCase().includes(search.toLowerCase());
      const matchesTruck = truckFilter === 'any' || load.truck_type_required === truckFilter || load.truck_type_required === 'any';
      const matchesState = stateFilter === 'any' || load.pickup_state === stateFilter || load.delivery_state === stateFilter;
      return matchesSearch && matchesTruck && matchesState;
    })
    .sort((a, b) => {
      if (sortBy === 'budget_high') return (b.budget || 0) - (a.budget || 0);
      if (sortBy === 'budget_low') return (a.budget || 0) - (b.budget || 0);
      if (sortBy === 'per_mile') {
        const apm = a.budget && a.distance_miles ? a.budget / a.distance_miles : 0;
        const bpm = b.budget && b.distance_miles ? b.budget / b.distance_miles : 0;
        return bpm - apm;
      }
      if (sortBy === 'urgent') return (b.is_urgent ? 1 : 0) - (a.is_urgent ? 1 : 0);
      return new Date(b.created_date) - new Date(a.created_date); // newest
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Load Board</h1>
        <p className="text-muted-foreground text-sm mt-1">Browse available loads and find your next haul</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search city, state, title..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={truckFilter} onValueChange={setTruckFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <Truck className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRUCK_TYPES.map(t => (
                  <SelectItem key={t} value={t} className="capitalize">{t === 'any' ? 'All Truck Types' : t.replace(/_/g, ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-full sm:w-36">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">All States</SelectItem>
                {['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'].map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-44">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="budget_high">Highest Pay</SelectItem>
                <SelectItem value="budget_low">Lowest Pay</SelectItem>
                <SelectItem value="per_mile">Best $/Mile</SelectItem>
                <SelectItem value="urgent">Urgent First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{filtered.length} loads available</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-muted border-t-secondary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-semibold">No loads found</h3>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map(load => (
            <Link key={load.id} to={`/load/${load.id}`}>
              <Card className="hover:shadow-md transition-all hover:border-secondary/30 cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold">{load.title}</h3>
                        {load.is_urgent && <Badge className="bg-destructive/10 text-destructive border-destructive/20">Urgent</Badge>}
                        <Badge variant="outline" className="capitalize text-xs">{load.truck_type_required?.replace(/_/g, ' ') || 'Any'}</Badge>
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
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        {load.pickup_date && (
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{format(new Date(load.pickup_date), 'MMM d, yyyy')}</span>
                        )}
                        {load.weight_lbs && (
                          <span className="flex items-center gap-1"><Package className="h-3 w-3" />{load.weight_lbs.toLocaleString()} lbs</span>
                        )}
                        {load.distance_miles && (
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{load.distance_miles} miles</span>
                        )}
                      </div>
                    </div>
                    {load.budget && (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">${load.budget.toLocaleString()}</p>
                        {load.distance_miles && (
                          <p className="text-xs text-muted-foreground">${(load.budget / load.distance_miles).toFixed(2)}/mi</p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}