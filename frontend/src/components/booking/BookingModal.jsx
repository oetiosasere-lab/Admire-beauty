import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar as CalendarIcon,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  X,
  User,
  Mail,
  Phone,
  FileText,
} from 'lucide-react';

export const BookingModal = ({ isOpen, onClose, preselectedService }) => {
  const { user, isAuthenticated } = useAuth();

  // Wizard Steps: 1: Service, 2: Date & Slot, 3: Details, 4: Confirmation
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(preselectedService || null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Form details
  const [formData, setFormData] = useState({
    fullName: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    message: '',
  });

  // Pre-fill user data if authenticated
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.full_name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  // Load services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.services.getAll();
        if (res.success && res.data) {
          setServices(res.data);
          if (preselectedService) {
            const found = res.data.find((s) => s.id === preselectedService.id);
            if (found) setSelectedService(found);
          } else if (!selectedService && res.data.length > 0) {
            setSelectedService(res.data[0]);
          }
        }
      } catch (e) {
        console.warn('Error fetching services for booking modal:', e);
      }
    };
    if (isOpen) {
      fetchServices();
      // Set default date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const defaultDateStr = tomorrow.toISOString().split('T')[0];
      setSelectedDate(defaultDateStr);
    }
  }, [isOpen, preselectedService]);

  // When date or service changes, fetch dynamic available slots from backend
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDate || !selectedService) return;
      setSlotsLoading(true);
      setErrorMessage('');
      try {
        const res = await api.availability.getSlotsForDate(selectedDate, selectedService.id);
        if (res.success && res.data) {
          if (!res.data.isAvailable) {
            setAvailableSlots([]);
            setErrorMessage(res.data.reason || 'Studio is closed on this date.');
          } else {
            setAvailableSlots(res.data.slots || []);
            // Clear slot selection if previous is no longer valid
            setSelectedSlot(null);
          }
        }
      } catch (err) {
        setErrorMessage(err.message || 'Unable to check availability for this date.');
        setAvailableSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };

    if (isOpen && selectedDate && selectedService) {
      fetchSlots();
    }
  }, [selectedDate, selectedService, isOpen]);

  if (!isOpen) return null;

  const handleNextStep = () => {
    setErrorMessage('');
    if (step === 1) {
      if (!selectedService) {
        setErrorMessage('Please select a makeup service to proceed.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedDate) {
        setErrorMessage('Please choose an appointment date.');
        return;
      }
      if (!selectedSlot) {
        setErrorMessage('Please select an available appointment time slot.');
        return;
      }
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setErrorMessage('');
    if (step > 1) setStep(step - 1);
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setErrorMessage('Please complete all required contact fields.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        service_id: selectedService.id,
        appointment_date: selectedDate,
        start_time: selectedSlot.startTime,
        full_name: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        message: formData.message.trim(),
      };

      const res = await api.bookings.create(payload);
      if (res.success && res.data) {
        setConfirmedBooking(res.data);
        setStep(4); // Confirmation step
      }
    } catch (err) {
      setErrorMessage(
        err.message || 'An error occurred while reserving your slot. Please try another time.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetModal = () => {
    setStep(1);
    setSelectedSlot(null);
    setConfirmedBooking(null);
    setErrorMessage('');
    onClose();
  };

  // Min date is today
  const minDateStr = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-espresso-950/65 backdrop-blur-sm" onClick={resetModal} />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-cream-50 rounded-2xl border border-champagne-300 shadow-luxury-lg z-10 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-champagne-200 bg-cream-100/60">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-gold-600 font-semibold block">
              Admire Beauty Concierge
            </span>
            <h3 className="font-serif text-2xl font-medium text-espresso-950">
              {step === 4 ? 'Appointment Reservation' : 'Book Your Bespoke Experience'}
            </h3>
          </div>

          <button
            onClick={resetModal}
            className="p-1.5 rounded-full text-taupe-500 hover:text-espresso-950 hover:bg-champagne-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicators (if not on confirmation screen) */}
        {step < 4 && (
          <div className="px-6 pt-4 pb-2 bg-cream-50 border-b border-champagne-100 flex items-center justify-between text-xs font-semibold text-taupe-500">
            <span className={step >= 1 ? 'text-gold-700 font-bold' : ''}>1. Select Service</span>
            <span>→</span>
            <span className={step >= 2 ? 'text-gold-700 font-bold' : ''}>2. Date & Time</span>
            <span>→</span>
            <span className={step >= 3 ? 'text-gold-700 font-bold' : ''}>3. Client Information</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 max-h-[72vh] overflow-y-auto">
          {/* STEP 1: SERVICE SELECTION */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-xs text-taupe-600 font-light">
                Select your preferred makeup artistry package. Duration and pricing will be applied automatically.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map((srv) => {
                  const isSelected = selectedService?.id === srv.id;
                  return (
                    <div
                      key={srv.id}
                      onClick={() => setSelectedService(srv)}
                      className={`cursor-pointer rounded-xl p-4 border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-gold-500 bg-champagne-50 shadow-md ring-1 ring-gold-400'
                          : 'border-champagne-200 bg-white hover:border-gold-300'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-serif text-lg font-medium text-espresso-950">
                            {srv.name}
                          </h4>
                        </div>
                        <p className="text-xs text-taupe-600 line-clamp-2">
                          {srv.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-champagne-100 flex items-center justify-between text-[11px] text-taupe-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gold-600" />
                          <span>{srv.duration} minutes</span>
                        </div>
                        <span className={`font-semibold ${isSelected ? 'text-gold-700' : 'text-taupe-400'}`}>
                          {isSelected ? '✓ Selected' : 'Choose'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: DATE & TIME SLOT SELECTION */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Selected Service Recap */}
              <div className="p-3 bg-champagne-50 border border-champagne-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-taupe-500">Service: </span>
                  <strong className="text-espresso-900">{selectedService?.name}</strong>
                  <span className="text-taupe-500 ml-2">({selectedService?.duration} mins)</span>
                </div>
              </div>

              {/* Date Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-taupe-700 mb-1.5">
                  Select Appointment Date
                </label>
                <div className="relative">
                  <CalendarIcon className="w-4 h-4 text-taupe-400 absolute left-3.5 top-3" />
                  <input
                    type="date"
                    min={minDateStr}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-champagne-300 bg-white focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm font-medium"
                  />
                </div>
                <p className="text-[11px] text-taupe-500 mt-1">
                  Studio working hours: Tue–Fri 09:00–19:00, Sat 08:30–18:30. Closed Sun & Mon.
                </p>
              </div>

              {/* Slots Grid */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-taupe-700 mb-2">
                  Available Time Slots ({selectedDate})
                </label>

                {slotsLoading ? (
                  <div className="py-8 text-center text-xs text-taupe-500">
                    Checking calendar availability...
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="p-4 bg-champagne-50 border border-champagne-200 rounded-xl text-center text-xs text-taupe-700">
                    No available time slots for this date. Please choose another day.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {availableSlots.map((slot, index) => {
                      const isSelected = selectedSlot?.startTime === slot.startTime;
                      return (
                        <button
                          key={index}
                          type="button"
                          disabled={slot.isBooked}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                            slot.isBooked
                              ? 'bg-taupe-100 text-taupe-400 border-taupe-200 cursor-not-allowed line-through'
                              : isSelected
                              ? 'bg-espresso-900 text-cream-50 border-espresso-950 shadow-sm'
                              : 'bg-white hover:bg-champagne-50 text-espresso-900 border-champagne-200'
                          }`}
                        >
                          {slot.startTime}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: CLIENT CONTACT INFORMATION */}
          {step === 3 && (
            <form onSubmit={handleSubmitBooking} id="booking-client-form" className="space-y-4">
              <div className="p-3.5 bg-champagne-50 border border-champagne-200 rounded-xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-taupe-500">Service:</span>
                  <strong className="text-espresso-900">{selectedService?.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-taupe-500">Date & Time:</span>
                  <strong className="text-espresso-900">
                    {selectedDate} at {selectedSlot?.startTime} (until {selectedSlot?.endTime})
                  </strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-taupe-700 mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-taupe-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jessica Sterling"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-champagne-300 bg-white focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-taupe-700 mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-taupe-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="jessica@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-champagne-300 bg-white focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-taupe-700 mb-1.5">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-taupe-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      required
                      placeholder="+44 7700 900123"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-champagne-300 bg-white focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-taupe-700 mb-1.5">
                  Special Requests or Skin Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Skin sensitivities, preferred color palettes, event location details..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-champagne-300 bg-white focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm"
                />
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-900 leading-relaxed">
                <strong>Booking Policy:</strong> Submitting this request places your appointment in <em>Pending</em> status. Our studio will review and confirm your schedule within 12 hours.
              </div>
            </form>
          )}

          {/* STEP 4: LUXURY CONFIRMATION SCREEN */}
          {step === 4 && confirmedBooking && (
            <div className="space-y-6 text-center animate-fade-in py-2">
              <div className="w-16 h-16 rounded-full bg-gold-100 border border-gold-300 flex items-center justify-center text-gold-700 mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <span className="text-[11px] uppercase tracking-widest text-gold-600 font-bold">
                  Reservation Received
                </span>
                <h3 className="font-serif text-3xl font-medium text-espresso-950">
                  Thank You, {confirmedBooking.full_name}
                </h3>
                <p className="text-xs sm:text-sm text-taupe-600 max-w-md mx-auto leading-relaxed">
                  Your appointment booking request has been securely registered in our system.
                </p>
              </div>

              {/* Status Banner */}
              <div className="p-4 bg-champagne-100/70 border border-gold-300 rounded-xl text-left max-w-lg mx-auto">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-gold-200 text-gold-900">
                    Status: PENDING ARTIST CONFIRMATION
                  </span>
                </div>
                <p className="text-xs text-taupe-700 leading-relaxed">
                  <strong>What happens next:</strong> Our lead artist personally reviews every appointment to ensure ample prep time and travel logistics. You will receive an email update once your booking is officially confirmed.
                </p>
              </div>

              {/* Booking Summary Card */}
              <div className="p-5 bg-white border border-champagne-200 rounded-xl text-left max-w-lg mx-auto text-xs space-y-2.5 shadow-sm">
                <div className="flex justify-between border-b border-champagne-100 pb-2">
                  <span className="text-taupe-500">Booking Reference:</span>
                  <span className="font-mono font-bold text-espresso-950 tracking-wider">
                    {confirmedBooking.booking_reference}
                  </span>
                </div>
                <div className="flex justify-between border-b border-champagne-100 pb-2">
                  <span className="text-taupe-500">Service:</span>
                  <span className="font-semibold text-espresso-900">
                    {confirmedBooking.services?.name || selectedService?.name}
                  </span>
                </div>
                <div className="flex justify-between border-b border-champagne-100 pb-2">
                  <span className="text-taupe-500">Date & Time:</span>
                  <span className="font-semibold text-espresso-900">
                    {confirmedBooking.appointment_date} at {confirmedBooking.start_time}
                  </span>
                </div>
                <div className="flex justify-between border-b border-champagne-100 pb-2">
                  <span className="text-taupe-500">Client Email:</span>
                  <span className="text-espresso-900">{confirmedBooking.email}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={resetModal}
                  className="py-3 px-8 rounded-full bg-espresso-900 hover:bg-espresso-950 text-cream-50 text-xs font-semibold uppercase tracking-wider transition-all"
                >
                  Return to Website
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        {step < 4 && (
          <div className="px-6 py-4 bg-cream-100/60 border-t border-champagne-200 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="py-2.5 px-4 rounded-lg text-xs font-medium text-taupe-700 hover:text-espresso-950 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="py-2.5 px-6 rounded-full bg-espresso-900 hover:bg-espresso-950 text-cream-50 text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                form="booking-client-form"
                disabled={submitting}
                className="py-2.5 px-6 rounded-full bg-espresso-900 hover:bg-espresso-950 text-cream-50 text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Confirm Reservation'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
