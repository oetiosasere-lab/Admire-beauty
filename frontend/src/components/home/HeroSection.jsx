import React from 'react';
import { ArrowRight, Sparkles, Heart, Star } from 'lucide-react';

export const HeroSection = ({ onOpenBooking }) => {
  const scrollToPortfolio = () => {
    const el = document.getElementById('portfolio');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative min-h-[92vh] flex items-center pt-28 pb-16 overflow-hidden">
      {/* Background Decorative Gradient Elements */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-champagne-200/40 blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-80 h-80 rounded-full bg-gold-100/30 blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Text Content Column */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
            {/* Small Brand Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-champagne-300 bg-cream-50/80 backdrop-blur-sm text-xs uppercase tracking-widest text-taupe-700 font-semibold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-gold-600" />
              <span>Bespoke Haute Makeup Artistry</span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal text-espresso-950 leading-[1.08] tracking-tight">
              Elegance Defined <br />
              <span className="italic font-light text-gold-600">Through the Art</span> of Beauty.
            </h1>

            {/* Subheading / Brand Intro */}
            <p className="text-base sm:text-lg text-taupe-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
              Welcome to <strong className="font-medium text-espresso-900">Admire Beauty</strong> — where every brushstroke is an editorial masterpiece. Enhancing your natural radiance for weddings, milestone birthdays, and luxury photoshoots.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onOpenBooking}
                className="w-full sm:w-auto py-4 px-8 rounded-full bg-espresso-900 hover:bg-espresso-950 text-cream-50 text-xs font-semibold uppercase tracking-widest transition-all shadow-luxury hover:shadow-luxury-lg flex items-center justify-center gap-2.5 group"
              >
                <span>Book Your Appointment</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={scrollToPortfolio}
                className="w-full sm:w-auto py-4 px-8 rounded-full border border-taupe-400 hover:border-espresso-900 text-espresso-900 text-xs font-semibold uppercase tracking-widest transition-all hover:bg-cream-200/50"
              >
                Explore My Work
              </button>
            </div>

            {/* Luxury Stats / Trust Indicators */}
            <div className="pt-6 border-t border-champagne-200/70 grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0 text-center lg:text-left">
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-medium text-espresso-900">500+</p>
                <p className="text-[11px] uppercase tracking-wider text-taupe-500 mt-0.5">Glamours Perfected</p>
              </div>
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-medium text-espresso-900">100%</p>
                <p className="text-[11px] uppercase tracking-wider text-taupe-500 mt-0.5">Bespoke Skin Prep</p>
              </div>
              <div>
                <div className="flex items-center justify-center lg:justify-start text-gold-500 gap-0.5">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-serif text-2xl sm:text-3xl font-medium text-espresso-900 ml-1">5.0</span>
                </div>
                <p className="text-[11px] uppercase tracking-wider text-taupe-500 mt-0.5">Client Rating</p>
              </div>
            </div>
          </div>

          {/* Hero Editorial Photography Column */}
          <div className="lg:col-span-5 relative flex justify-center">
            {/* Visual Frame */}
            <div className="relative w-full max-w-md aspect-[3/4] rounded-t-[140px] rounded-b-2xl overflow-hidden shadow-2xl border-4 border-white/80">
              <img
                src="https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=1000&q=80"
                alt="Admire Beauty Makeup Model"
                className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
              />

              {/* Subtle Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-espresso-950/60 via-transparent to-transparent opacity-60" />

              {/* Floating Badge */}
              <div className="absolute bottom-5 left-5 right-5 p-4 rounded-xl bg-cream-50/90 backdrop-blur-md border border-white/60 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center text-gold-700 shrink-0">
                    <Heart className="w-5 h-5 fill-gold-600 text-gold-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-espresso-950">Luxury Bridal & Red Carpet</p>
                    <p className="text-[11px] text-taupe-500">Tailored to your facial contours & skin tone</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Offset Border */}
            <div className="hidden sm:block absolute -top-4 -right-4 w-full max-w-md aspect-[3/4] rounded-t-[140px] rounded-b-2xl border border-gold-400/50 -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};
