import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Clock, ArrowRight, Sparkles } from 'lucide-react';

export const ServicesSection = ({ onSelectService }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.services.getAll();
        if (res.success && res.data) {
          setServices(res.data);
        }
      } catch (err) {
        console.warn('Using default services list:', err);
        // Fallback default services per spec
        setServices([
          {
            id: 'srv-bridal',
            name: 'Bridal Makeup',
            description: 'Timeless, luminous bridal artistry crafted to perfection. Includes skin prep, custom lash styling, luxury long-wear complexion, and bridal touch-up kit.',
            price: 220.00,
            duration: 120,
            image_url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80',
          },
          {
            id: 'srv-birthday',
            name: 'Birthday Glam',
            description: 'Celebrate in radiant luxury. Dramatic or soft sultry glam tailored to your birthday outfit and aesthetic. Includes sculpted contouring and high-impact lash artistry.',
            price: 120.00,
            duration: 90,
            image_url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=80',
          },
          {
            id: 'srv-photoshoot',
            name: 'Photoshoot Makeup',
            description: 'High-definition editorial makeup optimized for studio flash and natural sunlight. HD anti-flashback complexions, precise sculpting, and flawless camera finish.',
            price: 150.00,
            duration: 100,
            image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
          },
          {
            id: 'srv-fullglam',
            name: 'Full Glam',
            description: 'Unapologetic drama and elegance. Smokey eyes, cut-crease artistry, velvet lips, and radiant highlight designed for red carpet events and milestone evenings.',
            price: 135.00,
            duration: 90,
            image_url: 'https://images.unsplash.com/photo-1503236823255-94609f598e71?auto=format&fit=crop&w=1200&q=80',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <section id="services" className="py-24 bg-cream-50 border-t border-champagne-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-gold-600 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Offerings</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl text-espresso-950 font-normal tracking-tight">
            Artistry Tailored to Your Moment
          </h2>
          <p className="text-sm sm:text-base text-taupe-600 leading-relaxed font-light">
            Each bespoke service is designed to elevate your unique beauty with professional skincare preparation, premium pigments, and camera-ready durability.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="group bg-white rounded-2xl overflow-hidden border border-champagne-200 shadow-sm hover:shadow-luxury-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-champagne-100">
                  <img
                    src={service.image_url || 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80'}
                    alt={service.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-espresso-950/80 backdrop-blur-sm text-cream-50 text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gold-400" />
                    <span>{service.duration} mins</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-serif text-xl sm:text-2xl font-medium text-espresso-950">
                      {service.name}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-taupe-600 leading-relaxed line-clamp-3">
                    {service.description}
                  </p>
                </div>
              </div>

              {/* Price and Action Footer */}
              <div className="p-6 pt-0 border-t border-champagne-100 mt-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-taupe-500 block">Starting from</span>
                  <span className="font-serif text-2xl font-semibold text-espresso-900">
                    £{parseFloat(service.price).toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() => onSelectService(service)}
                  className="py-2.5 px-4 rounded-full bg-espresso-900 group-hover:bg-gold-500 text-cream-50 group-hover:text-espresso-950 text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5"
                >
                  <span>Book</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
