import React from 'react';
import HeroSection from '../components/landing/HeroSection';
import HowItWorks from '../components/landing/HowItWorks';
import TruckTypes from '../components/landing/TruckTypes';
import TrustSection from '../components/landing/TrustSection';
import PricingSection from '../components/landing/PricingSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import FooterSection from '../components/landing/FooterSection';

export default function Landing() {
  return (
    <div>
      <HeroSection />
      <HowItWorks />
      <TruckTypes />
      <TrustSection />
      <PricingSection />
      <TestimonialsSection />
      <FooterSection />
    </div>
  );
}