import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Search, Handshake, Star } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Sign Up & Verify',
    description: 'Create your account as a driver or shipper. Drivers complete background checks and upload certifications. Shippers verify payment methods.',
    color: 'bg-blue-500/10 text-blue-500',
  },
  {
    icon: Search,
    title: 'Find or Post Loads',
    description: 'Shippers post loads with details and commitment deposits. Drivers browse the load board and bid on shipments that match their equipment.',
    color: 'bg-secondary/10 text-secondary',
  },
  {
    icon: Handshake,
    title: 'Connect & Haul',
    description: 'Accept bids, communicate directly through our messaging system, track shipments in real-time with GPS, and get the job done.',
    color: 'bg-green-500/10 text-green-500',
  },
  {
    icon: Star,
    title: 'Rate & Grow',
    description: 'Both parties rate each other after delivery. Build your reputation, earn trust badges, and grow your business on the platform.',
    color: 'bg-purple-500/10 text-purple-500',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-secondary font-semibold text-sm uppercase tracking-wider">Simple Process</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-3 font-heading">How TrustHaul Works</h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            No more expensive dispatchers. No more uncertainty. Just a simple, transparent process that connects drivers and shippers directly.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-card rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`h-12 w-12 rounded-xl ${step.color} flex items-center justify-center`}>
                    <step.icon className="h-6 w-6" />
                  </div>
                  <span className="text-4xl font-bold text-muted-foreground/20 font-heading">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}