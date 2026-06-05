import { Load, LoadBid, DriverProfile, ShipperProfile } from '@/api/db';
import React, { useState } from 'react';

import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, TrendingUp, Package, DollarSign, Truck, CheckCircle, XCircle } from 'lucide-react';
import { format, subMonths, isAfter, parseISO } from 'date-fns';

const statusColors = {
  posted: 'bg-blue-500/10 text-blue-600',
  assigned: 'bg-yellow-500/10 text-yellow-700',
  in_transit: 'bg-orange-500/10 text-orange-600',
  delivered: 'bg-green-500/10 text-green-700',
  cancelled: 'bg-red-500/10 text-red-600',
};

export default function ShipmentReport() {
  const { user } = useAuth();
  const isDriver = user?.account_type === 'driver';
  const [timeRange, setTimeRange] = useState('3');
  const [downloading, setDownloading] = useState(false);

  const { data: loads = [], isLoading } = useQuery({
    queryKey: ['report-loads', user?.id],
    queryFn: () => isDriver
      ? Load.filter({ assigned_driver_user_id: user.id }, '-created_at', 200)
      : Load.filter({ shipper_user_id: user.id }, '-created_at', 200),
  });

  const cutoff = subMonths(new Date(), parseInt(timeRange));
  const filtered = loads.filter(l => l.created_at && isAfter(parseISO(l.created_at), cutoff));

  // Stats
  const totalRevenue = filtered.filter(l => l.status === 'delivered').reduce((s, l) => s + (l.budget || 0), 0);
  const delivered = filtered.filter(l => l.status === 'delivered').length;
  const cancelled = filtered.filter(l => l.status === 'cancelled').length;
  const active = filtered.filter(l => ['posted', 'assigned', 'in_transit'].includes(l.status)).length;
  const totalMiles = filtered.filter(l => l.status === 'delivered').reduce((s, l) => s + (l.distance_miles || 0), 0);
  const completionRate = filtered.length > 0 ? Math.round((delivered / filtered.length) * 100) : 0;

  const handleDownloadPDF = async () => {
    setDownloading(true);
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(27, 47, 90);
    doc.text('TrustHaul Freight', 20, 20);
    doc.setFontSize(14);
    doc.text('Shipment Report', 20, 30);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${format(new Date(), 'MMM d, yyyy')}`, 20, 38);
    doc.text(`Period: Last ${timeRange} months`, 20, 45);
    doc.text(`Account: ${user?.full_name || user?.email} (${isDriver ? 'Driver' : 'Shipper'})`, 20, 52);

    // Stats
    doc.setFontSize(12);
    doc.setTextColor(27, 47, 90);
    doc.text('Summary', 20, 65);
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text(`Total Loads: ${filtered.length}`, 20, 75);
    doc.text(`Delivered: ${delivered}`, 20, 83);
    doc.text(`Cancelled: ${cancelled}`, 20, 91);
    doc.text(`Active: ${active}`, 20, 99);
    doc.text(`Completion Rate: ${completionRate}%`, 20, 107);
    doc.text(`Total ${isDriver ? 'Earned' : 'Spent'}: $${totalRevenue.toLocaleString()}`, 20, 115);
    if (isDriver && totalMiles > 0) doc.text(`Total Miles: ${totalMiles.toLocaleString()}`, 20, 123);

    // Table
    doc.setFontSize(12);
    doc.setTextColor(27, 47, 90);
    doc.text('Load Details', 20, 140);

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    const headers = ['Title', 'Route', 'Status', 'Budget', 'Pickup Date'];
    const colWidths = [50, 65, 25, 25, 25];
    let x = 20;
    headers.forEach((h, i) => { doc.text(h, x, 150); x += colWidths[i]; });

    doc.setDrawColor(200, 200, 200);
    doc.line(20, 152, 190, 152);

    doc.setTextColor(50, 50, 50);
    let y = 160;
    filtered.slice(0, 40).forEach(load => {
      if (y > 270) { doc.addPage(); y = 20; }
      const route = `${load.pickup_city}, ${load.pickup_state} → ${load.delivery_city}, ${load.delivery_state}`;
      const truncTitle = load.title?.length > 28 ? load.title.slice(0, 28) + '…' : (load.title || '');
      const truncRoute = route.length > 38 ? route.slice(0, 38) + '…' : route;
      doc.text(truncTitle, 20, y);
      doc.text(truncRoute, 70, y);
      doc.text(load.status?.replace('_', ' ') || '', 135, y);
      doc.text(load.budget ? `$${load.budget}` : '—', 160, y);
      doc.text(load.pickup_date ? format(parseISO(load.pickup_date), 'MMM d, yy') : '—', 185, y);
      y += 8;
    });

    doc.save(`trusthaul-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    setDownloading(false);
  };

  const handleDownloadCSV = () => {
    const headers = ['Title', 'Pickup City', 'Pickup State', 'Delivery City', 'Delivery State', 'Status', 'Budget', 'Distance Miles', 'Pickup Date', 'Delivery Date', 'Truck Type', 'Commodity'];
    const rows = filtered.map(l => [
      l.title || '',
      l.pickup_city || '',
      l.pickup_state || '',
      l.delivery_city || '',
      l.delivery_state || '',
      l.status || '',
      l.budget || '',
      l.distance_miles || '',
      l.pickup_date || '',
      l.delivery_date || '',
      l.truck_type_required || '',
      l.commodity || '',
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trusthaul-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold font-heading flex items-center gap-2">
          <FileText className="h-6 w-6 text-secondary" />
          Shipment Report
        </h1>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 1 month</SelectItem>
              <SelectItem value="3">Last 3 months</SelectItem>
              <SelectItem value="6">Last 6 months</SelectItem>
              <SelectItem value="12">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleDownloadCSV} className="gap-2">
            <Download className="h-4 w-4" /> CSV
          </Button>
          <Button onClick={handleDownloadPDF} disabled={downloading} className="bg-secondary hover:bg-secondary/90 text-white gap-2">
            <Download className="h-4 w-4" />
            {downloading ? 'Generating…' : 'PDF'}
          </Button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <Package className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xl font-bold">{filtered.length}</p>
              <p className="text-xs text-muted-foreground">Total Loads</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-xl font-bold">{delivered}</p>
              <p className="text-xs text-muted-foreground">Delivered ({completionRate}%)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
              <DollarSign className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-xl font-bold">${totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{isDriver ? 'Total Earned' : 'Total Spent'}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
              <Truck className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-xl font-bold">{totalMiles > 0 ? `${totalMiles.toLocaleString()}` : active}</p>
              <p className="text-xs text-muted-foreground">{totalMiles > 0 ? 'Miles Driven' : 'Active Loads'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Load table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Load History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-muted border-t-secondary rounded-full animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">No loads found for this period</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="text-left py-2 pr-4 font-medium">Load</th>
                    <th className="text-left py-2 pr-4 font-medium">Route</th>
                    <th className="text-left py-2 pr-4 font-medium">Status</th>
                    <th className="text-right py-2 pr-4 font-medium">Budget</th>
                    <th className="text-right py-2 font-medium">Pickup Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(load => (
                    <tr key={load.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-3 pr-4 font-medium max-w-[180px] truncate">{load.title}</td>
                      <td className="py-3 pr-4 text-muted-foreground text-xs">
                        {load.pickup_city}, {load.pickup_state}<br />→ {load.delivery_city}, {load.delivery_state}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge className={`text-xs capitalize ${statusColors[load.status]}`}>
                          {load.status?.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-right font-semibold text-green-600">
                        {load.budget ? `$${load.budget.toLocaleString()}` : '—'}
                      </td>
                      <td className="py-3 text-right text-muted-foreground text-xs">
                        {load.pickup_date ? format(parseISO(load.pickup_date), 'MMM d, yyyy') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}