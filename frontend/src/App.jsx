import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AuthModal } from './components/auth/AuthModal';
import { BookingModal } from './components/booking/BookingModal';
import { HomePage } from './pages/HomePage';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

// Inner App to use useLocation for conditionally rendering public navbar/footer
const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [preselectedService, setPreselectedService] = useState(null);

  const handleOpenBooking = () => {
    setPreselectedService(null);
    setBookingModalOpen(true);
  };

  const handleSelectService = (service) => {
    setPreselectedService(service);
    setBookingModalOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-cream-100 selection:bg-champagne-300 selection:text-espresso-950 font-sans">
      {/* Show Public Navbar on non-admin pages */}
      {!isAdminRoute && <Navbar onOpenBooking={handleOpenBooking} />}

      <div className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                onOpenBooking={handleOpenBooking}
                onSelectService={handleSelectService}
              />
            }
          />
          <Route
            path="/account"
            element={<CustomerDashboard onOpenBooking={handleOpenBooking} />}
          />
          <Route path="/admin/*" element={<AdminDashboardPage />} />
        </Routes>
      </div>

      {/* Show Public Footer on non-admin pages */}
      {!isAdminRoute && <Footer onOpenBooking={handleOpenBooking} />}

      {/* Global Modals */}
      <AuthModal />
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        preselectedService={preselectedService}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
