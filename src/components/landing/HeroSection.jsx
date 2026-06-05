import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Clock, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-primary">
      {/* Background warehouse image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1920&q=80')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary/70" />

      {/* Transparent truck watermark - replaces Base44 logo */}
      <div className="absolute inset-0 flex items-center justify-end pr-8 pointer-events-none overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=60"
          alt=""
          className="w-[600px] h-auto opacity-[0.07] select-none rounded-3xl"
          style={{ filter: 'grayscale(100%)' }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-secondary/20 border border-secondary/30 rounded-full px-4 py-1.5 mb-6">
              <ShieldCheck className="h-4 w-4 text-secondary" />
              <span className="text-sm font-medium text-secondary">Verified & Trusted Platform</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight font-heading">
              Freight Made
              <span className="text-secondary block mt-2">Simple & Trusted</span>
            </h1>
            <p className="mt-6 text-lg text-white/70 max-w-xl leading-relaxed">
              Stop paying thousands to dispatchers. TrustHaul connects verified drivers with shippers directly — 
              subscription-based, no middlemen, no hidden fees. Just reliable freight, every time.
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <Link to="/register">
                <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white font-bold text-base px-8 h-12 rounded-xl">
                  Start Hauling Today <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/#how-it-works">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold text-base px-8 h-12 rounded-xl">
                  How It Works
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-8 mt-10">
              {[
                { icon: ShieldCheck, label: 'Background Verified', sub: 'All drivers screened' },
                { icon: Clock, label: 'No Dispatcher Needed', sub: 'Direct connections' },
                { icon: DollarSign, label: 'From $69.99/mo', sub: 'Simple subscriptions' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="text-xs text-white/50">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block"
          >
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80"
                alt="Freight truck on highway"
                className="rounded-2xl shadow-2xl shadow-black/30 w-full object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-card rounded-xl p-4 shadow-xl border border-border">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">2,500+ Verified</p>
                    <p className="text-xs text-muted-foreground">Trusted drivers & shippers</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
