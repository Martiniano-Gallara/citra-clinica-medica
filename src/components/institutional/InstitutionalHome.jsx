import React from 'react';
import { HeroSection } from './HeroSection';
import { ServicesSection } from './ServicesSection';
import { InsurancesSection } from './InsurancesSection';
import { HomeDirectContact } from './HomeDirectContact';

export const InstitutionalHome = () => {
  return (
    <div style={{ background: '#ffffff' }}>
      <HeroSection />
      <ServicesSection />
      <InsurancesSection />
      <HomeDirectContact />
    </div>
  );
};
