import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Check, Zap, Crown, Building2, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

const plans = [
  {
    name: 'Starter',
    price: '$69.99',
    period: '/month',
    description: 'Perfect for independent drivers getting started',
    icon: Zap,
    color: 'border-border',
    features: [
      'Up to 10 load bids per month',
      'Basic load board access',
      'Direct messaging with shippers',
      'Driver profile & verification badge',
      'GPS tracking',
      'Rating & review system',
      'Email support',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Pro Hauler',
    price: '$149.99',
    period: '/month',
    description: 'For serious drivers who want unlimited opportunities',
    icon: Crown,
    color: 'border-secondary',
    features: [
      'Unlimited load bids',
      'Priority load board access',
      'Direct messaging with shippers',
      'Verified Pro badge on profile',
      'Real-time GPS tracking',
      'Rating & review system',
      'Priority email & phone support',
      'Early access to new loads',
      'Featured driver listing',
    ],
    cta: 'Go Pro',
    popular: true,
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-secondary font-semibold text-sm uppercase tracking-wider">Simple Pricing</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-3 font-heading">
            Stop Paying Dispatchers Thousands
          </h2>
          <p className="text-white/60 mt-4 max-w-2xl mx-auto">
            One simple subscription replaces expensive dispatchers. Shippers post loads for free — we only charge drivers a flat monthly fee.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className={`relative rounded-2xl border-2 ${plan.color} bg-white/5 backdrop-blur-sm p-8 ${plan.popular ? 'ring-2 ring-secondary' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-white text-xs font-bold px-4 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <plan.icon className="h-5 w-5 text-secondary" />
                </div>
                <h3 className="text-xl font-bold">{plan.name}</h3>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-white/50">{plan.period}</span>
              </div>
              <p className="text-sm text-white/60 mb-6">{plan.description}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm">
                    <Check className="h-4 w-4 text-secondary flex-shrink-0" />
                    <span className="text-white/80">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link to="/register">
                <Button
                  className={`w-full h-12 font-bold text-base rounded-xl ${
                    plan.popular
                      ? 'bg-secondary hover:bg-secondary/90 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  }`}
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Shipper callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 max-w-2xl mx-auto rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left"
        >
          <div className="h-14 w-14 rounded-2xl bg-secondary/20 flex items-center justify-center flex-shrink-0">
            <Building2 className="h-7 w-7 text-secondary" />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-1">Shippers — Always Free</h3>
            <p className="text-white/60 text-sm">Post unlimited loads, browse verified drivers, and manage shipments at no cost. TrustHaul only charges drivers — never shippers. Payment between you and your driver is handled directly, with zero commission.</p>
            <Link to="/register">
              <Button variant="link" className="text-secondary px-0 mt-2 h-auto font-semibold">
                Post your first load free →
              </Button>
            </Link>
          </div>
        </motion.div>

        <p className="text-center text-white/40 text-sm mt-6">
          No commissions. No hidden fees. No dispatch cuts. Cancel driver subscription anytime.
        </p>
      </div>
    </section>
  );
}