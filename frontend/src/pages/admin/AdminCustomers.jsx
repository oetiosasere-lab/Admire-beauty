import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Search, Mail, Phone, Calendar, UserCheck } from 'lucide-react';

export const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.admin.getCustomers(search ? { search } : {});
      if (res.success && res.data) {
        setCustomers(res.data);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadCustomers();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div>
        <span className="text-[10px] uppercase tracking-widest text-gold-700 font-semibold block">
          Client Records
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-medium text-espresso-950">
          Customer Directory
        </h1>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-taupe-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search clients by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-champagne-300 bg-white focus:outline-none focus:ring-1 focus:ring-gold-500 shadow-sm"
          />
        </div>
        <button
          type="submit"
          className="py-2.5 px-6 bg-espresso-900 text-cream-50 rounded-xl text-xs font-semibold uppercase tracking-wider"
        >
          Search
        </button>
      </form>

      {/* Customer Directory Table */}
      <div className="bg-white rounded-2xl border border-champagne-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-100/70 border-b border-champagne-200 text-taupe-600 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Registered Date</th>
                <th className="p-4">Total Bookings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-champagne-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-taupe-500">
                    Loading customer profiles...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-taupe-500">
                    No registered clients found.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-cream-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-champagne-200 text-gold-900 flex items-center justify-center font-bold text-xs shrink-0">
                          {c.full_name ? c.full_name[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-espresso-950 text-sm">{c.full_name}</p>
                          <span className="text-[10px] text-taupe-500">Client Profile</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-taupe-700">
                        <Mail className="w-3.5 h-3.5 text-gold-600" />
                        <span>{c.email}</span>
                      </div>
                      {c.phone && (
                        <div className="flex items-center gap-1.5 text-taupe-500 text-[11px]">
                          <Phone className="w-3 h-3 text-gold-600" />
                          <span>{c.phone}</span>
                        </div>
                      )}
                    </td>

                    <td className="p-4 text-taupe-600">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>

                    <td className="p-4 font-bold text-espresso-950">
                      {c.totalBookings} appointment{c.totalBookings === 1 ? '' : 's'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
