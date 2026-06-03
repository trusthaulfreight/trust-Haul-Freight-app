import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Fingerprint, CreditCard, Scale, MapPin, MessageSquare } from 'lucide-react';

const features = [
  { icon: Fingerprint, title: 'Background Checks', desc: 'Every driver goes through comprehensive background screening before accessing the platform.' },
  { icon: ShieldCheck, title: 'Verified Certifications', desc: 'CDL, insurance, MC/DOT numbers — all verified before a driver can bid on loads.' },
  { icon: CreditCard, title: 'Commitment Deposits', desc: 'Shippers put down a deposit to ensure drivers never waste time on false pickups.' },
  { icon: Scale, title: 'Fair Rating System', desc: 'Both parties rate each other. Build trust through transparency and accountability.' },
  { icon: MapPin, title: 'Real-Time GPS', desc: 'Track every shipment in real-time. Know exactly where your freight is, always.' },
  { icon: MessageSquare, title: 'Direct Messaging', desc: 'Communicate directly with your driver or shipper. No middlemen, no delays.' },
];

export default function TrustSection() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-secondary font-semibold text-sm uppercase tracking-wider">Built on Trust</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 font-heading">
              Trust Is Our Foundation
            </h2>
            <p className="text-muted-foreground mt-4 mb-8">
              We're not liable for damages or issues — we're a platform that connects verified, trusted parties. 
              Every safety measure is designed to protect both drivers and shippers.
            </p>

            <div className="grid sm:grid-cols-2 gap-5">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex gap-3"
                >
                  <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <f.icon className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">{f.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <img
              src="https://images.unsplash.com/photo-1605732562742-3023a888e56e?w=800&q=80"
              alt="Trusted freight"
              className="rounded-2xl shadow-xl"
            />
            <div className="absolute -top-4 -right-4 bg-card rounded-xl p-4 shadow-lg border border-border">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm font-bold">100% Verified</p>
                  <p className="text-xs text-muted-foreground">Every user screened</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}