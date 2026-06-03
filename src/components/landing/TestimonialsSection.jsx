import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    name: 'Marcus Johnson',
    role: 'Owner-Operator, Flatbed',
    text: "I was paying $800/week to a dispatcher who barely got me loads. TrustHaul changed everything — I find my own loads, negotiate my own rates, and keep more money. Best $69.99 I spend every month.",
    rating: 5,
    avatar: 'MJ',
    type: 'driver',
  },
  {
    name: 'Sarah Chen',
    role: 'Logistics Manager, FreshMart Inc.',
    text: "As a shipper, I love that the commitment deposit system means drivers actually show up. The verification badges give us confidence we're working with professionals. It's like Uber for freight, but better.",
    rating: 5,
    avatar: 'SC',
    type: 'shipper',
  },
  {
    name: 'James Rodriguez',
    role: 'CDL Driver, Reefer Specialist',
    text: "The GPS tracking and direct messaging make communication seamless. My shippers always know where their loads are. I've completed over 200 loads through TrustHaul and my rating speaks for itself.",
    rating: 5,
    avatar: 'JR',
    type: 'driver',
  },
  {
    name: 'Amanda Foster',
    role: 'Supply Chain Director, BuildRight Co.',
    text: "We ship construction materials daily. TrustHaul's verified driver pool means we get reliable service every time. The rating system keeps everyone accountable. Free for shippers is the cherry on top.",
    rating: 5,
    avatar: 'AF',
    type: 'shipper',
  },
  {
    name: 'DeShawn Williams',
    role: 'Fleet Owner, 3 Trucks',
    text: "The Pro plan at $149.99 pays for itself in the first week. Unlimited bids, priority access to loads, and my drivers are always busy. We've grown from 1 truck to 3 since joining TrustHaul.",
    rating: 5,
    avatar: 'DW',
    type: 'driver',
  },
  {
    name: 'Lisa Park',
    role: 'Operations Manager, QuickShip Wholesale',
    text: "The background checks and certifications verification give us peace of mind. We've never had a no-show since switching to TrustHaul. The rating system really works.",
    rating: 5,
    avatar: 'LP',
    type: 'shipper',
  },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-secondary font-semibold text-sm uppercase tracking-wider">Testimonials</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-3 font-heading">Trusted by Drivers & Shippers</h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Real stories from real people who've transformed their freight operations with TrustHaul.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-card rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow"
            >
              <Quote className="h-8 w-8 text-secondary/30 mb-4" />
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className={`font-bold text-sm ${t.type === 'driver' ? 'bg-primary text-white' : 'bg-secondary text-white'}`}>
                    {t.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 fill-secondary text-secondary" />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}