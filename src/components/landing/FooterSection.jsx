import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Mail } from 'lucide-react';

export default function FooterSection() {
  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            {/* Clean TrustHaul logo — no Base44 image */}
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                <Truck className="h-7 w-7 text-secondary" />
              </div>
              <div>
                <p className="text-xl font-bold font-heading">TrustHaul</p>
                <p className="text-xs text-white/50">Freight Made Simple</p>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-md">
              TrustHaul Freight LLC connects verified drivers with shippers through a simple subscription-based platform. 
              No dispatchers, no hidden fees — just reliable freight connections.
            </p>
            <div className="flex flex-col gap-2 mt-6 text-sm text-white/60">
              <a href="mailto:admin@trusthaulfreight.com" className="flex items-center gap-2 hover:text-secondary transition-colors">
                <Mail className="h-4 w-4" /> admin@trusthaulfreight.com
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link to="/#how-it-works" className="hover:text-secondary transition-colors">How It Works</Link></li>
              <li><Link to="/#pricing" className="hover:text-secondary transition-colors">Pricing</Link></li>
              <li><Link to="/loads" className="hover:text-secondary transition-colors">Load Board</Link></li>
              <li><Link to="/register" className="hover:text-secondary transition-colors">Get Started</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link to="/about" className="hover:text-secondary transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-secondary transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><span className="cursor-pointer hover:text-secondary transition-colors">Terms of Service</span></li>
              <li><span className="cursor-pointer hover:text-secondary transition-colors">Privacy Policy</span></li>
              <li><span className="cursor-pointer hover:text-secondary transition-colors">Disclaimer</span></li>
            </ul>
            <p className="text-xs text-white/30 mt-6 leading-relaxed">
              TrustHaul Freight LLC is a platform that connects drivers and shippers. 
              We are not liable for any damages, delays, or issues arising from transactions between users.
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/40">© {new Date().getFullYear()} TrustHaul Freight LLC. All rights reserved.</p>
          <p className="text-xs text-white/40">trusthaulfreight.com</p>
        </div>
      </div>
    </footer>
  );
}
