import React, { useState } from 'react';
import { Eye, X } from 'lucide-react';

export const PortfolioSection = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState(null);

  const categories = ['All', 'Bridal', 'Glam', 'Editorial', 'Evening'];

  const portfolioItems = [
    {
      id: 1,
      title: 'Radiant Ivory Bridal Glow',
      category: 'Bridal',
      imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
      description: 'Luminous dewy complexion with champagne tones and soft flutter lashes.',
    },
    {
      id: 2,
      title: 'Midnight Bronze Glam',
      category: 'Glam',
      imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=80',
      description: 'Sculpted cheekbones, warm terracotta eyeshadow, and satin nude lip.',
    },
    {
      id: 3,
      title: 'High-Fashion Studio Campaign',
      category: 'Editorial',
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
      description: 'Flawless velvet skin with crisp graphic liner designed for studio flashes.',
    },
    {
      id: 4,
      title: 'Opulent Golden Galas',
      category: 'Evening',
      imageUrl: 'https://images.unsplash.com/photo-1503236823255-94609f598e71?auto=format&fit=crop&w=1200&q=80',
      description: 'Dramatic smokey eye accented with 24k gold leaf and velvet matte lip.',
    },
    {
      id: 5,
      title: 'Classic Vintage Romanticism',
      category: 'Bridal',
      imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80',
      description: 'Airbrushed finish with rose gold lids and delicate feathered brows.',
    },
    {
      id: 6,
      title: 'Sun-Drenched Bronze Siren',
      category: 'Glam',
      imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
      description: 'Warm honey bronze contour and glossy berry lip for birthday milestones.',
    },
  ];

  const filteredItems =
    activeCategory === 'All'
      ? portfolioItems
      : portfolioItems.filter((item) => item.category === activeCategory);

  return (
    <section id="portfolio" className="py-24 bg-cream-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="text-xs uppercase tracking-widest text-gold-600 font-semibold">
            <span>Visual Gallery</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl text-espresso-950 font-normal tracking-tight">
            The Art of Transformation
          </h2>
          <p className="text-sm sm:text-base text-taupe-600 leading-relaxed font-light">
            Explore our curated portfolio of bridal ceremonies, editorial features, and unforgettable milestones.
          </p>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`py-2 px-5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                  activeCategory === category
                    ? 'bg-espresso-900 text-cream-50 shadow-md'
                    : 'bg-cream-50 text-taupe-700 hover:bg-champagne-200/50 border border-champagne-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedImage(item)}
              className="group relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer shadow-sm hover:shadow-luxury-lg bg-champagne-200 transition-all duration-500"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />

              {/* Gradient Backdrop on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-espresso-950/80 via-espresso-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <span className="text-[10px] uppercase tracking-widest text-gold-300 font-medium">
                  {item.category}
                </span>
                <h3 className="font-serif text-2xl text-cream-50 font-medium mt-1">
                  {item.title}
                </h3>
                <p className="text-xs text-taupe-300 mt-1 line-clamp-2">
                  {item.description}
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-gold-400">
                  <Eye className="w-4 h-4" />
                  <span>View Close-Up</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-950/90 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-cream-50 rounded-2xl overflow-hidden shadow-2xl border border-champagne-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-espresso-900/60 text-white hover:bg-espresso-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-[4/3] sm:aspect-[16/10] overflow-hidden bg-black">
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-6 space-y-2">
              <span className="text-xs uppercase tracking-widest text-gold-600 font-semibold">
                {selectedImage.category} Artistry
              </span>
              <h3 className="font-serif text-2xl font-medium text-espresso-950">
                {selectedImage.title}
              </h3>
              <p className="text-sm text-taupe-600 leading-relaxed">
                {selectedImage.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
