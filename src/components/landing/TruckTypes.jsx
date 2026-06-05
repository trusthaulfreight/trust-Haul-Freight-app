import React from 'react';
import { motion } from 'framer-motion';

const trucks = [
  { name: 'Flatbed', image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&q=80', desc: 'Open deck for oversized loads' },
  { name: 'Dry Van', image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=600&q=80', desc: 'Enclosed trailer for general freight' },
  { name: 'Reefer', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', desc: 'Temperature-controlled shipping' },
  { name: 'Box Truck', image: 'https://images.unsplash.com/photo-1617396900799-f4ec2b43c7ae?w=600&q=80', desc: 'Local & last-mile delivery' },
  { name: 'Hotshot', image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&q=80', desc: 'Expedited small loads' },
  { name: 'Tanker', image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&q=80', desc: 'Liquid & bulk transport' },
];

export default function TruckTypes() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-secondary font-semibold text-sm uppercase tracking-wider">All Equipment Types</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-3 font-heading">Every Truck Type Covered</h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            From flatbeds to reefers, we support every type of equipment so you can find the right match for your freight.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trucks.map((truck, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-2xl aspect-[4/3] cursor-pointer"
            >
              <img
                src={truck.image}
                alt={truck.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="text-xl font-bold text-white">{truck.name}</h3>
                <p className="text-sm text-white/70 mt-1">{truck.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
