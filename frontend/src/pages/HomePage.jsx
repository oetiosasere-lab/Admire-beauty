import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { ServicesSection } from '../components/home/ServicesSection';
import { PortfolioSection } from '../components/home/PortfolioSection';
import { AboutSection } from '../components/home/AboutSection';
import { ContactSection } from '../components/home/ContactSection';

export const HomePage = ({ onOpenBooking, onSelectService }) => {
  return (
    <div className="space-y-0">
      <HeroSection onOpenBooking={onOpenBooking} />
      <ServicesSection onSelectService={onSelectService} />
      <PortfolioSection />
      <AboutSection onOpenBooking={onOpenBooking} />
      <ContactSection onOpenBooking={onOpenBooking} />
    </div>
  );
};
