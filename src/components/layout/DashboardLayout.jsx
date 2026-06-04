import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import Navbar from './Navbar';
import { LayoutDashboard, Package, MessageSquare, User, Star, CreditCard, MapPin, Truck, Building2, Calendar, FileText, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const isDriver = user?.account_type === 'driver';

  const sideLinks = isDriver ? [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Load Board', path: '/loads', icon: Package },
    { label: 'My Loads', path: '/my-loads', icon: Truck },
    { label: 'Messages', path: '/messages', icon: MessageSquare },
    { label: 'Reviews', path: '/reviews', icon: Star },
    { label: 'Calendar', path: '/calendar', icon: Calendar },
    { label: 'Report', path: '/report', icon: FileText },
    { label: 'Bulk Actions', path: '/bulk-loads', icon: CheckSquare },
    { label: 'Profile', path: '/profile', icon: User },
    { label: 'Subscription', path: '/subscription', icon: CreditCard },
  ] : [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Post a Load', path: '/post-load', icon: Package },
    { label: 'My Loads', path: '/my-loads', icon: Truck },
    { label: 'Calendar', path: '/calendar', icon: Calendar },
    { label: 'Report', path: '/report', icon: FileText },
    { label: 'Bulk Actions', path: '/bulk-loads', icon: CheckSquare },
    { label: 'Messages', path: '/messages', icon: MessageSquare },
    { label: 'Reviews', path: '/reviews', icon: Star },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex pt-16">
        {/* Sidebar - desktop */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card min-h-[calc(100vh-4rem)] fixed left-0 top-16">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                {isDriver ? <Truck className="h-5 w-5 text-secondary" /> : <Building2 className="h-5 w-5 text-secondary" />}
              </div>
              <div>
                <p className="text-sm font-semibold">{user?.full_name || 'User'}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.account_type || 'Member'}</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {sideLinks.map(link => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-secondary/10 text-secondary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <div className="flex-1 lg:ml-64">
          <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
            <Outlet />
          </div>
        </div>

        {/* Mobile bottom nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
          <div className="flex justify-around py-2">
            {sideLinks.slice(0, 5).map(link => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "flex flex-col items-center gap-1 px-2 py-1 text-xs transition-colors",
                    isActive ? "text-secondary" : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{link.label.split(' ').pop()}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}