import { Load, LoadBid, DriverProfile, ShipperProfile } from '@/api/db';
import React from 'react';

import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, DollarSign, ArrowRight, Package, Download, FileText } from 'lucide-react';
import { format, parseISO } from 'date-fns';

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
      ? Load.filter({ assigned_driver_user_id: user.id }, '-created_at')
      : Load.filter({ shipper_user_id: user.id }, '-created_at'),
  });

  const active = loads.filter(l => ['posted', 'assigned', 'in_transit'].includes(l.status));
  const completed = loads.filter(l => l.status === 'delivered');
  const cancelled = loads.filter(l => l.status === 'cancelled');

  const downloadCSV = () => {
    const rows = loads.filter(l => l.status === 'delivered');
    if (rows.length === 0) return alert('No completed loads to export.');
    const headers = ['Title', 'Status', 'Pickup City', 'Pickup State', 'Delivery City', 'Delivery State', 'Pickup Date', 'Delivery Date', 'Budget ($)', 'Weight (lbs)', 'Distance (mi)', 'Commodity', 'Truck Type'];
    const csv = [
      headers.join(','),
      ...rows.map(l => [
        `"${l.title || ''}"`,
        l.status || '',
        `"${l.pickup_city || ''}"`,
        l.pickup_state || '',
        `"${l.delivery_city || ''}"`,
        l.delivery_state || '',
        l.pickup_date || '',
        l.delivery_date || '',
        l.budget || '',
        l.weight_lbs || '',
        l.distance_miles || '',
        `"${l.commodity || ''}"`,
        l.truck_type_required || '',
      ].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trusthaul-loads-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = async () => {
    if (loads.length === 0) return alert('No loads to export.');
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(27, 47, 90);
    doc.text('TrustHaul Freight', 20, 20);
    doc.setFontSize(14);
    doc.text('Load History & Payment Records', 20, 30);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${format(new Date(), 'MMM d, yyyy')}`, 20, 38);
    doc.text(`Shipper: ${user?.full_name || user?.email}`, 20, 45);

    // Stats
    const totalSpent = loads.reduce((s, l) => s + (l.budget || 0), 0);
    const delivered = loads.filter(l => l.status === 'delivered').length;
    const active = loads.filter(l => ['posted', 'assigned', 'in_transit'].includes(l.status)).length;

    doc.setFontSize(12);
    doc.setTextColor(27, 47, 90);
    doc.text('Summary', 20, 60);
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text(`Total Loads: ${loads.length}`, 20, 70);
    doc.text(`Active Loads: ${active}`, 20, 78);
    doc.text(`Delivered: ${delivered}`, 20, 86);
    doc.text(`Total Spent: $${totalSpent.toLocaleString()}`, 20, 94);

    // Table
    doc.setFontSize(12);
    doc.setTextColor(27, 47, 90);
    doc.text('Load Details', 20, 110);

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    const headers = ['Title', 'Route', 'Status', 'Budget', 'Pickup Date'];
    const colWidths = [50, 65, 25, 25, 25];
    let x = 20;
    headers.forEach((h, i) => { doc.text(h, x, 120); x += colWidths[i]; });

    doc.setDrawColor(200, 200, 200);
    doc.line(20, 122, 190, 122);

    doc.setTextColor(50, 50, 50);
    let y = 130;
    loads.slice(0, 40).forEach(load => {
      if (y > 270) { doc.addPage(); y = 20; }
      const route = `${load.pickup_city}, ${load.pickup_state} → ${load.delivery_city}, ${load.delivery_state}`;
      const truncTitle = load.title?.length > 28 ? load.title.slice(0, 28) + '…' : (load.title || '');
      const truncRoute = route.length > 38 ? route.slice(0, 38) + '…' : route;
      doc.text(truncTitle, 20, y);
      doc.text(truncRoute, 70, y);
      doc.text(load.status?.replace('_', ' ') || '', 135, y);
      doc.text(load.budget ? `$${load.budget.toLocaleString()}` : '—', 160, y);
      doc.text(load.pickup_date ? format(parseISO(load.pickup_date), 'MMM d, yy') : '—', 185, y);
      y += 8;
    });

    doc.text(`Page 1 of ${Math.ceil(loads.length / 40)}`, 20, 285);
    doc.save(`trusthaul-load-history-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-muted border-t-secondary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-heading">My Loads</h1>
        {!isDriver && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={downloadCSV} className="gap-2">
              <Download className="h-4 w-4" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={downloadPDF} className="gap-2">
              <FileText className="h-4 w-4" /> PDF
            </Button>
          </div>
        )}
      </div>

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