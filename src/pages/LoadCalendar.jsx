import { Load, LoadBid, DriverProfile, ShipperProfile } from '@/api/db';
import React, { useState } from 'react';

import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, MapPin, DollarSign } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameDay, isSameMonth, parseISO } from 'date-fns';

const statusColors = {
  posted: 'bg-blue-500',
  assigned: 'bg-yellow-500',
  in_transit: 'bg-orange-500',
  delivered: 'bg-green-500',
  cancelled: 'bg-red-400',
};

const statusBadge = {
  posted: 'bg-blue-500/10 text-blue-600',
  assigned: 'bg-yellow-500/10 text-yellow-700',
  in_transit: 'bg-orange-500/10 text-orange-600',
  delivered: 'bg-green-500/10 text-green-700',
  cancelled: 'bg-red-500/10 text-red-600',
};

export default function LoadCalendar() {
  const { user } = useAuth();
  const isDriver = user?.account_type === 'driver';
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const { data: loads = [], isLoading } = useQuery({
    queryKey: ['calendar-loads', user?.id],
    queryFn: () => isDriver
      ? Load.filter({ assigned_driver_user_id: user.id })
      : Load.filter({ shipper_user_id: user.id }),
  });

  // Build calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const getLoadsForDay = (d) => loads.filter(l => {
    const pickup = l.pickup_date ? isSameDay(parseISO(l.pickup_date), d) : false;
    const delivery = l.delivery_date ? isSameDay(parseISO(l.delivery_date), d) : false;
    return pickup || delivery;
  });

  const selectedLoads = selectedDay ? getLoadsForDay(selectedDay) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-heading flex items-center gap-2">
          <Calendar className="h-6 w-6 text-secondary" />
          Load Calendar
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold w-36 text-center">{format(currentMonth, 'MMMM yyyy')}</span>
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {Object.entries(statusColors).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
            <span className="text-muted-foreground capitalize">{status.replace('_', ' ')}</span>
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">{d}</div>
            ))}
          </div>

          {/* Calendar cells */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((d, i) => {
              const dayLoads = getLoadsForDay(d);
              const isToday = isSameDay(d, new Date());
              const isCurrentMonth = isSameMonth(d, currentMonth);
              const isSelected = selectedDay && isSameDay(d, selectedDay);

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(isSelected ? null : d)}
                  className={`relative min-h-[64px] p-1.5 rounded-lg text-left transition-all border ${
                    isSelected
                      ? 'border-secondary bg-secondary/5'
                      : 'border-transparent hover:bg-muted/50'
                  } ${!isCurrentMonth ? 'opacity-30' : ''}`}
                >
                  <span className={`text-xs font-medium block mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday ? 'bg-secondary text-white' : ''
                  }`}>
                    {format(d, 'd')}
                  </span>
                  <div className="space-y-0.5">
                    {dayLoads.slice(0, 2).map(l => (
                      <div key={l.id} className={`h-1.5 w-full rounded-full ${statusColors[l.status] || 'bg-muted'}`} />
                    ))}
                    {dayLoads.length > 2 && (
                      <span className="text-xs text-muted-foreground">+{dayLoads.length - 2}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Day Detail */}
      {selectedDay && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{format(selectedDay, 'EEEE, MMMM d, yyyy')}</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedLoads.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No loads scheduled for this day</p>
            ) : (
              <div className="space-y-3">
                {selectedLoads.map(load => {
                  const isPickup = load.pickup_date && isSameDay(parseISO(load.pickup_date), selectedDay);
                  return (
                    <Link key={load.id} to={`/load/${load.id}`}>
                      <div className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className={`text-xs font-bold px-2 py-0.5 rounded ${isPickup ? 'bg-green-500/10 text-green-700' : 'bg-red-500/10 text-red-700'}`}>
                              {isPickup ? '📦 PICKUP' : '🏁 DELIVERY'}
                            </div>
                            <Badge className={`text-xs ${statusBadge[load.status]}`}>{load.status?.replace('_', ' ')}</Badge>
                          </div>
                          {load.budget && <span className="text-sm font-bold text-green-600">${load.budget.toLocaleString()}</span>}
                        </div>
                        <p className="font-semibold text-sm">{load.title}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          {load.pickup_city}, {load.pickup_state} → {load.delivery_city}, {load.delivery_state}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upcoming loads list */}
      {!selectedDay && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">This Month's Loads</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-6"><div className="w-6 h-6 border-2 border-muted border-t-secondary rounded-full animate-spin" /></div>
            ) : loads.filter(l => {
              const pickup = l.pickup_date ? isSameMonth(parseISO(l.pickup_date), currentMonth) : false;
              const delivery = l.delivery_date ? isSameMonth(parseISO(l.delivery_date), currentMonth) : false;
              return pickup || delivery;
            }).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No loads this month</p>
            ) : (
              <div className="space-y-2">
                {loads
                  .filter(l => {
                    const pickup = l.pickup_date ? isSameMonth(parseISO(l.pickup_date), currentMonth) : false;
                    const delivery = l.delivery_date ? isSameMonth(parseISO(l.delivery_date), currentMonth) : false;
                    return pickup || delivery;
                  })
                  .sort((a, b) => new Date(a.pickup_date) - new Date(b.pickup_date))
                  .map(load => (
                    <Link key={load.id} to={`/load/${load.id}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${statusColors[load.status]}`} />
                          <div>
                            <p className="text-sm font-semibold">{load.title}</p>
                            <p className="text-xs text-muted-foreground">{load.pickup_city} → {load.delivery_city}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {load.pickup_date && <p className="text-xs text-muted-foreground">{format(parseISO(load.pickup_date), 'MMM d')}</p>}
                          {load.budget && <p className="text-sm font-bold text-green-600">${load.budget.toLocaleString()}</p>}
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}