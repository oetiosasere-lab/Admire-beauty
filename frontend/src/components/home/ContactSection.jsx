import React, { useState } from 'react';
import { Mail, Phone, MapPin, Instagram, Send, Sparkles, Clock, CheckCircle } from 'lucide-react';

export const ContactSection = ({ onOpenBooking }) => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: 'Bridal',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', phone: '', eventType: 'Bridal', message: '' });
      setFormSubmitted(false);
    }, 5000);
  };

  const instagramShots = [
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1503236823255-94609f598e71?auto=format&fit=crop&w=400&q=80',
  ];

  return (
    <section id="contact" className="py-24 bg-cream-100 border-t border-champagne-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-gold-600 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Connect & Inquire</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl text-espresso-950 font-normal tracking-tight">
            We Would Love to Hear From You
          </h2>
          <p className="text-sm sm:text-base text-taupe-600 leading-relaxed font-light">
            Have questions about bridal trials, group bookings, or custom travel accommodations? Reach out below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Contact Info & Instagram Column */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-cream-50 p-8 rounded-2xl border border-champagne-200 shadow-sm space-y-6">
              <h3 className="font-serif text-2xl font-medium text-espresso-950">
                Studio Details
              </h3>

              <div className="space-y-4 text-sm text-taupe-700">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-champagne-100 flex items-center justify-center text-gold-700 shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-taupe-500 font-semibold">Email</p>
                    <a href="mailto:contact@admirebeauty.com" className="text-espresso-900 font-medium hover:text-gold-600">
                      contact@admirebeauty.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-champagne-100 flex items-center justify-center text-gold-700 shrink-0 mt-0.5">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-taupe-500 font-semibold">Phone & WhatsApp</p>
                    <a href="tel:+447700900123" className="text-espresso-900 font-medium hover:text-gold-600">
                      +44 (0) 7700 900123
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-champagne-100 flex items-center justify-center text-gold-700 shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-taupe-500 font-semibold">Studio Location</p>
                    <p className="text-espresso-900 font-medium">Mayfair & Central London</p>
                    <p className="text-xs text-taupe-500 mt-0.5">Destination travel available across the UK & internationally</p>
                  </div>
                </div>
              </div>

              {/* Direct Booking Shortcut Button */}
              <div className="pt-4 border-t border-champagne-200">
                <button
                  onClick={onOpenBooking}
                  className="w-full py-3 px-4 rounded-xl bg-gold-500 hover:bg-gold-600 text-espresso-950 text-xs font-semibold uppercase tracking-wider transition-all"
                >
                  Book Instant Appointment
                </button>
              </div>
            </div>

            {/* Instagram Feed Preview */}
            <div className="bg-cream-50 p-6 rounded-2xl border border-champagne-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-gold-600" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-espresso-950">
                    Follow @admirebeauty
                  </span>
                </div>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-gold-600 font-medium hover:underline"
                >
                  View Profile
                </a>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {instagramShots.map((url, i) => (
                  <a
                    key={i}
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="aspect-square rounded-lg overflow-hidden group relative"
                  >
                    <img
                      src={url}
                      alt="Admire Beauty Instagram"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-espresso-950/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Inquiry Form Column */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-2xl border border-champagne-200 shadow-luxury">
            <h3 className="font-serif text-2xl font-medium text-espresso-950 mb-2">
              Send a Private Inquiry
            </h3>
            <p className="text-xs sm:text-sm text-taupe-600 mb-6 font-light">
              We respond to all client messages within 24 business hours.
            </p>

            {formSubmitted ? (
              <div className="p-6 bg-champagne-50 border border-gold-300 rounded-xl text-center space-y-3 animate-fade-in">
                <CheckCircle className="w-10 h-10 text-gold-600 mx-auto" />
                <h4 className="font-serif text-2xl font-medium text-espresso-950">Thank You</h4>
                <p className="text-sm text-taupe-700">
                  Your message has been received. Our team will contact you shortly to assist with your beauty inquiries.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-taupe-700 mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Charlotte Hayes"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-champagne-300 bg-cream-50 focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-taupe-700 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="charlotte@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-champagne-300 bg-cream-50 focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-taupe-700 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+44 7700 900123"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-champagne-300 bg-cream-50 focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-taupe-700 mb-1.5">
                      Inquiry Type
                    </label>
                    <select
                      value={formData.eventType}
                      onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-champagne-300 bg-cream-50 focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm"
                    >
                      <option value="Bridal">Bridal Makeup & Trials</option>
                      <option value="Birthday">Birthday Glam</option>
                      <option value="Photoshoot">Photoshoot / Commercial</option>
                      <option value="Full Glam">Red Carpet / Evening Event</option>
                      <option value="Destination">Destination Wedding Inquiry</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-taupe-700 mb-1.5">
                    Your Message & Date Details
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us about your event, location, timing, and any specific requests..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-champagne-300 bg-cream-50 focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto py-3 px-8 rounded-full bg-espresso-900 hover:bg-espresso-950 text-cream-50 text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
