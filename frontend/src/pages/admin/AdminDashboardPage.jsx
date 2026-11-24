import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { AdminOverview } from './AdminOverview';
import { AdminBookings } from './AdminBookings';
import { AdminCalendar } from './AdminCalendar';
import { AdminServices } from './AdminServices';
import { AdminAvailability } from './AdminAvailability';
import { AdminCustomers } from './AdminCustomers';
import { AdminSupport } from './AdminSupport';
import { AdminAnalytics } from './AdminAnalytics';

export const AdminDashboardPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(tabParam);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  return (
    <AdminLayout activeTab={activeTab} onTabChange={handleTabChange}>
      {activeTab === 'overview' && <AdminOverview onNavigateTab={handleTabChange} />}
      {activeTab === 'bookings' && <AdminBookings />}
      {activeTab === 'calendar' && <AdminCalendar />}
      {activeTab === 'services' && <AdminServices />}
      {activeTab === 'availability' && <AdminAvailability />}
      {activeTab === 'customers' && <AdminCustomers />}
      {activeTab === 'support' && <AdminSupport />}
      {activeTab === 'analytics' && <AdminAnalytics />}
    </AdminLayout>
  );
};
