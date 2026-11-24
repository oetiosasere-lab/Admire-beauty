import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export const AboutSection = ({ onOpenBooking }) => {
  return (
    <section id="about" className="py-24 bg-cream-50 border-t border-champagne-200/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Portrait Column */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-sm sm:max-w-md aspect-[3/4] rounded-2xl overflow-hidden shadow-luxury-lg border-2 border-white">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80"
                alt="Lead Artist of Admire Beauty"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso-950/70 via-transparent to-transparent opacity-80" />

              <div className="absolute bottom-6 left-6 right-6 text-cream-50">
                <p className="font-serif text-2xl font-medium tracking-wide">
                  Admire Beauty
                </p>
                <p className="text-xs uppercase tracking-widest text-champagne-300 font-light mt-0.5">
                  Founder & Principal Artist
                </p>
              </div>
            </div>

            {/* Backdrop Frame Offset */}
            <div className="hidden sm:block absolute -bottom-5 -left-5 w-full max-w-sm sm:max-w-md aspect-[3/4] rounded-2xl border border-gold-300 -z-10" />
          </div>

          {/* Authentic Story Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="text-xs uppercase tracking-widest text-gold-600 font-semibold">
              <span>The Journey & Passion</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl text-espresso-950 font-normal tracking-tight leading-tight">
              A Lifelong Love Affair with the Canvas of the Face
            </h2>

            {/* Foundation Story */}
            <blockquote className="border-l-2 border-gold-400 pl-5 italic text-base sm:text-lg text-taupe-700 font-serif leading-relaxed">
              "For me, makeup is more than just a beauty service or another brand. It is something that has been part of my journey since I was young. Growing up, while my friends were playing with toys, I would often find myself in my mum's room experimenting with her makeup. What started as a childhood curiosity gradually grew into a passion."
            </blockquote>

            <p className="text-sm sm:text-base text-taupe-600 leading-relaxed font-light">
              Over the years, that quiet wonder evolved into a dedicated pursuit of elegance and harmony. I learned that true beauty is not about masking who you are, but honoring the unique structure of your features and bringing your inner light to the surface.
            </p>

            <p className="text-sm sm:text-base text-taupe-600 leading-relaxed font-light">
              Every appointment is treated as an intimate, personalized consultation where your vision, personal style, and comfort guide every technique — from deep skin hydration to bespoke lash placement.
            </p>

            {/* Core Values */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
              <div className="flex items-center gap-2.5 text-xs text-taupe-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-gold-600 shrink-0" />
                <span>Bespoke, unhurried consultations</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-taupe-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-gold-600 shrink-0" />
                <span>Camera-tested, long-wear formulas</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-taupe-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-gold-600 shrink-0" />
                <span>Sanitized, luxury professional kit</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-taupe-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-gold-600 shrink-0" />
                <span>Calm, welcoming, celebratory atmosphere</span>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={onOpenBooking}
                className="py-3 px-8 rounded-full bg-espresso-900 hover:bg-espresso-950 text-cream-50 text-xs font-semibold uppercase tracking-wider transition-all shadow-md hover:shadow-lg"
              >
                Experience Admire Beauty
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
