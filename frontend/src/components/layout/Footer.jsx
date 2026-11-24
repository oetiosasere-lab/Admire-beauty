import React from 'react';
import { Instagram, Mail, Phone, MapPin, Heart, ArrowUp } from 'lucide-react';

export const Footer = ({ onOpenBooking }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-espresso-950 text-cream-100 border-t border-taupe-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-14 border-b border-taupe-800/80">
          {/* Brand Story Column */}
          <div className="md:col-span-1 space-y-4">
            <span className="font-serif text-2xl font-bold tracking-wider text-cream-50 uppercase">
              Admire Beauty
            </span>
            <p className="text-xs text-taupe-300 leading-relaxed">
              Bespoke makeup artistry dedicated to highlighting your unique beauty with timeless grace, radiant skin, and luxurious sophistication.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-taupe-900 flex items-center justify-center text-champagne-300 hover:text-white hover:bg-gold-600 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="mailto:contact@admirebeauty.com"
                className="w-9 h-9 rounded-full bg-taupe-900 flex items-center justify-center text-champagne-300 hover:text-white hover:bg-gold-600 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Signature Services */}
          <div>
            <h4 className="font-serif text-lg font-medium text-cream-50 mb-4 tracking-wide">
              Services
            </h4>
            <ul className="space-y-2.5 text-xs text-taupe-300">
              <li>
                <a href="#services" className="hover:text-champagne-300 transition-colors">
                  Bridal Makeup & Trials
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-champagne-300 transition-colors">
                  Birthday Glam Celebrations
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-champagne-300 transition-colors">
                  Photoshoot & Editorial
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-champagne-300 transition-colors">
                  Red Carpet & Full Glam
                </a>
              </li>
            </ul>
          </div>

          {/* Studio Hours */}
          <div>
            <h4 className="font-serif text-lg font-medium text-cream-50 mb-4 tracking-wide">
              Studio Hours
            </h4>
            <div className="space-y-2 text-xs text-taupe-300">
              <div className="flex justify-between border-b border-taupe-800/40 pb-1">
                <span>Tuesday – Friday</span>
                <span className="text-champagne-200">09:00 – 19:00</span>
              </div>
              <div className="flex justify-between border-b border-taupe-800/40 pb-1">
                <span>Saturday</span>
                <span className="text-champagne-200">08:30 – 18:30</span>
              </div>
              <div className="flex justify-between text-taupe-500 pt-1">
                <span>Sunday – Monday</span>
                <span>By Special Request</span>
              </div>
            </div>
          </div>

          {/* Booking CTA Column */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-medium text-cream-50 tracking-wide">
              Private Inquiries
            </h4>
            <p className="text-xs text-taupe-300 leading-relaxed">
              Appointments fill quickly for peak wedding and holiday seasons. Advance reservations are strongly encouraged.
            </p>
            <button
              onClick={onOpenBooking}
              className="w-full py-2.5 px-4 rounded-lg bg-gold-500 hover:bg-gold-600 text-espresso-950 text-xs font-semibold uppercase tracking-wider transition-all"
            >
              Reserve Your Date
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-taupe-400 gap-4">
          <p>© {new Date().getFullYear()} Admire Beauty. All rights reserved. Crafted with care.</p>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 hover:text-champagne-200 transition-colors"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
