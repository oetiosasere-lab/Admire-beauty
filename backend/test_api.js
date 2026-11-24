const http = require('http');
const app = require('./src/server');

const runTests = async () => {
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

  console.log(`\n🧪 Testing Admire Beauty API on port ${port}...\n`);

  const request = async (path, options = {}) => {
    const res = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    const json = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, data: json };
  };

  try {
    // 1. Health check
    console.log('1. Health Check:');
    const health = await request('/health');
    console.log(`   Status: ${health.status}, Service: ${health.data.service}`);
    if (health.status !== 200) throw new Error('Health check failed');

    // 2. Services list
    console.log('\n2. Services Catalog:');
    const services = await request('/services');
    console.log(`   Found ${services.data.data.length} services:`);
    services.data.data.forEach((s) => console.log(`   - ${s.name}: £${s.price} (${s.duration} mins)`));
    if (services.data.data.length < 4) throw new Error('Expected at least 4 default services');

    // 3. Availability check
    console.log('\n3. Availability & Slots Check (2026-11-28 - Saturday):');
    const avail = await request(`/availability?date=2026-11-28&serviceId=${services.data.data[0].id}`);
    console.log(`   Available: ${avail.data.data.isAvailable}, Slots count: ${avail.data.data.slots.length}`);
    const availableSlot = avail.data.data.slots.find((s) => !s.isBooked);
    console.log(`   Selected slot to test: ${availableSlot?.startTime || 'None'}`);

    // 4. Booking submission
    console.log('\n4. Booking Submission:');
    const testDate = '2026-12-10'; // Thursday
    const bookingPayload = {
      service_id: services.data.data[1].id,
      appointment_date: testDate,
      start_time: '11:00',
      full_name: 'Genevieve Dupond',
      email: 'genevieve@example.com',
      phone: '+44 7700 900555',
      message: 'Birthday celebration makeup.',
    };

    const firstBooking = await request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingPayload),
    });
    console.log(`   Booking 1: Status ${firstBooking.status}, Reference: ${firstBooking.data.data?.booking_reference}`);
    if (firstBooking.status !== 201) throw new Error('First booking submission failed');

    // 5. Double-booking prevention check
    console.log('\n5. Double-Booking Prevention Check:');
    const duplicateBooking = await request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingPayload),
    });
    console.log(`   Duplicate Booking: Status ${duplicateBooking.status} (Expected 409 Conflict)`);
    console.log(`   Message: ${duplicateBooking.data.message}`);
    if (duplicateBooking.status !== 409) throw new Error('Double booking prevention failed: expected 409');

    // 6. Security & Admin Authorization Checks
    console.log('\n6. Security & Authorization Checks:');
    const unauthAdmin = await request('/admin/dashboard');
    console.log(`   Unauthenticated access: ${unauthAdmin.status} (Expected 401)`);
    if (unauthAdmin.status !== 401) throw new Error('Security check failed: unauthenticated should be 401');

    const customerAdmin = await request('/admin/dashboard', {
      headers: { Authorization: 'Bearer mock-customer-token' },
    });
    console.log(`   Customer role accessing admin: ${customerAdmin.status} (Expected 403 Forbidden)`);
    if (customerAdmin.status !== 403) throw new Error('Security check failed: customer role should be 403');

    const validAdmin = await request('/admin/dashboard', {
      headers: { Authorization: 'Bearer mock-admin-token' },
    });
    console.log(`   Admin access: ${validAdmin.status} (Expected 200)`);
    console.log(`   Total Bookings in DB: ${validAdmin.data.data.statistics.totalBookings}`);
    console.log(`   Pending Approvals: ${validAdmin.data.data.statistics.pending}`);
    console.log(`   Registered Clients: ${validAdmin.data.data.statistics.totalCustomers}`);
    if (validAdmin.status !== 200) throw new Error('Admin dashboard retrieval failed');

    // 7. Admin Booking Status Update
    console.log('\n7. Admin Confirming Booking:');
    const updateRes = await request(`/admin/bookings/${firstBooking.data.data.id}`, {
      method: 'PATCH',
      headers: { Authorization: 'Bearer mock-admin-token' },
      body: JSON.stringify({ status: 'confirmed', admin_notes: 'Deposit received via studio transfer.' }),
    });
    console.log(`   Status updated to: ${updateRes.data.data.status}, Note: "${updateRes.data.data.admin_notes}"`);

    // 8. Support Ticket & Reply flow
    console.log('\n8. Support Ticket & Conversation Thread:');
    const ticketRes = await request('/support/tickets', {
      method: 'POST',
      headers: { Authorization: 'Bearer mock-customer-token' },
      body: JSON.stringify({
        subject: 'Can I bring my own lipstick to the trial?',
        message: 'Hello, I have a specific nude shade from Charlotte Tilbury I adore.',
      }),
    });
    console.log(`   Ticket created: #${ticketRes.data.data.id}`);

    const replyRes = await request(`/support/tickets/${ticketRes.data.data.id}/replies`, {
      method: 'POST',
      headers: { Authorization: 'Bearer mock-admin-token' },
      body: JSON.stringify({
        message: 'Of course! Bringing your favorite lip product is very welcome so we can match the liner and tones.',
      }),
    });
    console.log(`   Admin reply posted by: ${replyRes.data.data.sender_name}`);

    console.log('\n🎉 ALL 8 FULL-STACK SYSTEM TESTS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  } finally {
    server.close();
    process.exit(0);
  }
};

runTests();
