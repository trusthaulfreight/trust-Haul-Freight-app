import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import HeroSection from '../components/landing/HeroSection';
import HowItWorks from '../components/landing/HowItWorks';
import TruckTypes from '../components/landing/TruckTypes';
import TrustSection from '../components/landing/TrustSection';
import PricingSection from '../components/landing/PricingSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import FooterSection from '../components/landing/FooterSection';

export default function Landing() {
  const { user, isLoadingAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoadingAuth && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, isLoadingAuth, navigate]);

  if (isLoadingAuth) return null;

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