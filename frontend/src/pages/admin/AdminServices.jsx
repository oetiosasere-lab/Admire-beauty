import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Plus, Edit2, Trash2, Check, Clock, Sparkles, AlertCircle } from 'lucide-react';

export const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '90',
    image_url: '',
    is_active: true,
  });
  const [feedback, setFeedback] = useState('');

  const loadServices = async () => {
    setLoading(true);
    try {
      const res = await api.admin.getServices();
      if (res.success && res.data) {
        setServices(res.data);
      }
    } catch (err) {
      console.error('Error fetching admin services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const openAddModal = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: '90',
      image_url: '',
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      duration: service.duration.toString(),
      image_url: service.image_url || '',
      is_active: service.is_active,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        const res = await api.admin.updateService(editingService.id, formData);
        if (res.success) {
          setFeedback('Service updated successfully.');
        }
      } else {
        const res = await api.admin.createService(formData);
        if (res.success) {
          setFeedback('New service added successfully.');
        }
      }
      setModalOpen(false);
      setTimeout(() => setFeedback(''), 3000);
      loadServices();
    } catch (err) {
      alert(err.message || 'Error saving service details.');
    }
  };

  const handleToggleActive = async (service) => {
    try {
      const res = await api.admin.updateService(service.id, {
        is_active: !service.is_active,
      });
      if (res.success) {
        loadServices();
      }
    } catch (err) {
      alert('Error updating status.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-gold-700 font-semibold block">
            Offerings & Rates
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-espresso-950">
            Makeup Services Catalog
          </h1>
        </div>

        <button
          onClick={openAddModal}
          className="py-2.5 px-5 rounded-full bg-espresso-900 hover:bg-espresso-950 text-cream-50 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium">
          ✓ {feedback}
        </div>
      )}

      {/* Services Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 py-12 text-center text-xs text-taupe-500">
            Loading service offerings...
          </div>
        ) : (
          services.map((service) => (
            <div
              key={service.id}
              className={`bg-white rounded-2xl border p-6 shadow-sm flex flex-col justify-between transition-all ${
                service.is_active ? 'border-champagne-300' : 'border-dashed border-taupe-300 opacity-60'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-champagne-100 shrink-0">
                      <img
                        src={service.image_url || 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=300&q=80'}
                        alt={service.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-bold text-espresso-950">
                        {service.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-taupe-500 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-gold-600" />
                        <span>{service.duration} mins</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      service.is_active
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {service.is_active ? 'Active' : 'Archived'}
                  </span>
                </div>

                <p className="text-xs text-taupe-600 leading-relaxed font-light">
                  {service.description}
                </p>
              </div>

              <div className="pt-4 border-t border-champagne-100 flex items-center justify-between mt-4">
                <div>
                  <span className="text-[10px] uppercase text-taupe-500 block">Rate</span>
                  <span className="font-serif text-2xl font-bold text-espresso-950">
                    £{parseFloat(service.price).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(service)}
                    className="py-1 px-3 rounded-lg border border-champagne-300 hover:bg-champagne-100 text-xs font-medium text-taupe-700"
                  >
                    {service.is_active ? 'Deactivate' : 'Activate'}
                  </button>

                  <button
                    onClick={() => openEditModal(service)}
                    className="p-2 rounded-lg bg-espresso-900 hover:bg-espresso-950 text-cream-50 text-xs"
                    title="Edit Service"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Service Edit / Create Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-950/70 backdrop-blur-sm"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="max-w-md w-full bg-cream-50 rounded-2xl border border-champagne-300 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-serif text-2xl font-medium text-espresso-950 mb-1">
              {editingService ? 'Edit Makeup Service' : 'Add New Makeup Service'}
            </h3>
            <p className="text-xs text-taupe-600 mb-4">
              Configure service name, description, duration, and pricing displayed to clients.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-taupe-700 mb-1">
                  Service Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Red Carpet Glamour"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-champagne-300 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-taupe-700 mb-1">
                    Price (£ GBP) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="150.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-champagne-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-taupe-700 mb-1">
                    Duration (Minutes) *
                  </label>
                  <input
                    type="number"
                    step="15"
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-champagne-300 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-taupe-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-champagne-300 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-taupe-700 mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Engaging summary of techniques, skin prep, and aesthetic..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-champagne-300 bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="service-is-active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded text-gold-600 focus:ring-gold-500"
                />
                <label htmlFor="service-is-active" className="text-xs text-espresso-900 font-medium">
                  Active (Visible on booking form & website)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-champagne-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="py-2 px-4 rounded-lg text-taupe-600 hover:text-espresso-950 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-lg bg-espresso-900 text-cream-50 font-semibold uppercase tracking-wider"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
