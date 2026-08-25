import React, { useState, useEffect, useMemo } from 'react';
import { 
  Ticket, Search, RefreshCw, AlertCircle, CheckCircle2, 
  XCircle, Trash2, Eye, Calendar, Clock, Film, 
  DollarSign, Users, X
} from 'lucide-react';
import { bookingApi } from '@/services/bookingApi';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { io } from 'socket.io-client';

export function BookingManagePage() {
  const { token } = useAuth();
  const { addNotification } = useNotification();

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'cancelled'>('all');
  const [formatFilter, setFormatFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Confirmation Modals
  const [cancelModalBooking, setCancelModalBooking] = useState<any | null>(null);
  const [deleteModalBooking, setDeleteModalBooking] = useState<any | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const activeToken = token || localStorage.getItem('savi_auth_token') || '';
      const response = await bookingApi.getAllBookings(activeToken);
      const list = response.data?.bookings || [];
      setBookings(list);
    } catch (err: any) {
      console.error('Failed to fetch bookings:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();

    // Socket.io real-time listener
    const activeToken = token || localStorage.getItem('savi_auth_token') || '';
    if (!activeToken) return;

    const baseUrl = (import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || import.meta.env.BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');
    const socket = io(baseUrl, { auth: { token: activeToken } });

    const handleRefresh = () => fetchBookings();
    socket.on('booking-created', handleRefresh);
    socket.on('booking-cancelled', handleRefresh);
    socket.on('booking-deleted', handleRefresh);

    return () => {
      socket.disconnect();
    };
  }, [token]);

  // Handle Cancel Booking
  const handleCancelBooking = async (booking: any) => {
    try {
      setActionLoading(booking.bookingId || booking._id);
      const activeToken = token || localStorage.getItem('savi_auth_token') || '';
      const id = booking.bookingId || booking._id;
      await bookingApi.cancelBooking(activeToken, id);

      setBookings((prev) =>
        prev.map((b) =>
          (b.bookingId === id || b._id === id) ? { ...b, status: 'cancelled' } : b
        )
      );

      addNotification({
        type: 'success',
        message: `Booking #${id.slice(0, 8)} cancelled successfully`,
      });
      setCancelModalBooking(null);
      if (selectedBooking && (selectedBooking.bookingId === id || selectedBooking._id === id)) {
        setSelectedBooking((prev: any) => ({ ...prev, status: 'cancelled' }));
      }
    } catch (err: any) {
      addNotification({
        type: 'delete',
        message: err.response?.data?.message || 'Failed to cancel booking',
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Handle Delete Booking Record
  const handleDeleteBooking = async (booking: any) => {
    try {
      setActionLoading(booking.bookingId || booking._id);
      const activeToken = token || localStorage.getItem('savi_auth_token') || '';
      const id = booking.bookingId || booking._id;
      await bookingApi.deleteBooking(activeToken, id);

      setBookings((prev) => prev.filter((b) => b.bookingId !== id && b._id !== id));

      addNotification({
        type: 'delete',
        message: `Booking #${id.slice(0, 8)} deleted permanently`,
      });
      setDeleteModalBooking(null);
      if (selectedBooking && (selectedBooking.bookingId === id || selectedBooking._id === id)) {
        setSelectedBooking(null);
      }
    } catch (err: any) {
      addNotification({
        type: 'delete',
        message: err.response?.data?.message || 'Failed to delete booking',
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Status Filter
      if (statusFilter !== 'all' && (b.status || 'confirmed') !== statusFilter) {
        return false;
      }

      // Format Filter
      if (formatFilter !== 'all' && b.format !== formatFilter) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const bookingId = (b.bookingId || b._id || '').toLowerCase();
        const movieTitle = (b.movieTitle || '').toLowerCase();
        const cinemaName = (b.cinemaName || '').toLowerCase();
        const date = (b.date || '').toLowerCase();
        const seats = Array.isArray(b.seats) ? b.seats.map((s: any) => s.id || s.seatNumber || s).join(' ').toLowerCase() : '';

        return (
          bookingId.includes(query) ||
          movieTitle.includes(query) ||
          cinemaName.includes(query) ||
          date.includes(query) ||
          seats.includes(query)
        );
      }

      return true;
    });
  }, [bookings, statusFilter, formatFilter, searchQuery]);

  // Key Metrics
  const stats = useMemo(() => {
    const total = bookings.length;
    const confirmed = bookings.filter((b) => (b.status || 'confirmed') === 'confirmed');
    const cancelled = bookings.filter((b) => b.status === 'cancelled');

    const totalRevenue = confirmed.reduce((acc, b) => acc + (Number(b.totalAmount) || 0), 0);
    const totalTickets = confirmed.reduce((acc, b) => acc + (Array.isArray(b.seats) ? b.seats.length : 1), 0);

    return {
      total,
      confirmedCount: confirmed.length,
      cancelledCount: cancelled.length,
      totalRevenue,
      totalTickets,
    };
  }, [bookings]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* ── 1. Top Refresh Action ── */}
      <div className="flex items-center justify-end">
        <button
          onClick={fetchBookings}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-xl text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-red-500' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* ── 2. Stat Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Bookings */}
        <div className="bg-[#0d0d12] border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Bookings</span>
            <div className="p-2 rounded-xl bg-white/5 text-zinc-300">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-white font-display">{stats.total}</div>
          <div className="mt-1 text-[11px] text-zinc-500">All registered customer reservations</div>
        </div>

        {/* Total Revenue */}
        <div className="bg-[#0d0d12] border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-emerald-400 font-display">
            Rs. {stats.totalRevenue.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-zinc-500">From active confirmed bookings</div>
        </div>

        {/* Tickets Sold */}
        <div className="bg-[#0d0d12] border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tickets Issued</span>
            <div className="p-2 rounded-xl bg-red-600/10 text-red-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-red-500 font-display">{stats.totalTickets}</div>
          <div className="mt-1 text-[11px] text-zinc-500">Confirmed seats booked across halls</div>
        </div>

        {/* Cancelled Bookings */}
        <div className="bg-[#0d0d12] border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Cancelled</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-amber-400 font-display">{stats.cancelledCount}</div>
          <div className="mt-1 text-[11px] text-zinc-500">Refunded / released seats</div>
        </div>
      </div>

      {/* ── 3. Filters and Search Bar ── */}
      <div className="bg-[#0d0d12] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Booking ID, Movie Title, Cinema, Date, or Seat (e.g. A1)..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'all' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              All ({bookings.length})
            </button>
            <button
              onClick={() => setStatusFilter('confirmed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'confirmed' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Confirmed ({stats.confirmedCount})
            </button>
            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'cancelled' ? 'bg-amber-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Cancelled ({stats.cancelledCount})
            </button>
          </div>

          {/* Screen Format Dropdown */}
          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value)}
            className="bg-zinc-950 border border-white/10 text-zinc-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-red-500 cursor-pointer"
          >
            <option value="all">All Formats</option>
            <option value="IMAX 3D">IMAX 3D</option>
            <option value="4DX">4DX</option>
            <option value="Dolby Cinema">Dolby Cinema</option>
            <option value="Standard 2D">Standard 2D</option>
            <option value="ScreenX">ScreenX</option>
          </select>
        </div>
      </div>

      {/* ── 4. Main Bookings Table ── */}
      <div className="bg-[#0d0d12] border border-white/10 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-red-500 animate-spin mx-auto" />
            <p className="text-xs text-zinc-400">Loading live booking transactions...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
            <p className="text-sm text-red-300">{error}</p>
            <button
              onClick={fetchBookings}
              className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl"
            >
              Retry
            </button>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <Ticket className="w-10 h-10 text-zinc-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Bookings Found</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all' || formatFilter !== 'all'
                ? 'No transactions match your search filter criteria. Try clearing search.'
                : 'No ticket bookings have been placed in the database yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-zinc-400 uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-4 px-4 sm:px-6">Booking Reference</th>
                  <th className="py-4 px-4">Movie & Hall</th>
                  <th className="py-4 px-4">Date & Time</th>
                  <th className="py-4 px-4">Seats</th>
                  <th className="py-4 px-4">Total Amount</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                {filteredBookings.map((b) => {
                  const id = b.bookingId || b._id || '';
                  const isCancelled = b.status === 'cancelled';
                  const seatsList = Array.isArray(b.seats) ? b.seats : [];

                  return (
                    <tr key={id} className="hover:bg-white/[0.03] transition-colors group">
                      {/* Booking Reference */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="space-y-1">
                          <div className="font-mono font-bold text-white text-xs tracking-wider flex items-center gap-1.5">
                            <span className="text-red-500">#</span>
                            <span>{id.slice(0, 8).toUpperCase()}</span>
                          </div>
                          <div className="text-[10px] text-zinc-500">
                            {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </td>

                      {/* Movie & Hall */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {b.posterUrl ? (
                            <img
                              src={b.posterUrl}
                              alt={b.movieTitle}
                              className="w-9 h-12 rounded-lg object-cover border border-white/10 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-12 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center shrink-0">
                              <Film className="w-4 h-4 text-zinc-500" />
                            </div>
                          )}
                          <div className="space-y-1 min-w-0">
                            <div className="font-bold text-white truncate max-w-[180px] text-xs">
                              {b.movieTitle || 'Unknown Movie'}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                              <span className="truncate max-w-[120px]">{b.cinemaName || 'Main Hall'}</span>
                              <span className="px-1.5 py-0.2 rounded bg-white/10 text-[9px] font-semibold text-zinc-300">
                                {b.format || '2D'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-zinc-200 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-red-500" />
                            <span>{b.date || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
                            <Clock className="w-3.5 h-3.5 text-zinc-500" />
                            <span>{b.showtimeTime || 'N/A'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Seats */}
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[160px]">
                          {seatsList.length > 0 ? (
                            seatsList.map((s: any, idx: number) => {
                              const seatLabel = s.id || s.seatNumber || s;
                              return (
                                <span
                                  key={idx}
                                  className="px-1.5 py-0.5 rounded bg-zinc-800 border border-white/10 text-[10px] font-mono text-zinc-200"
                                >
                                  {seatLabel}
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-zinc-500">None</span>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-1">
                          {seatsList.length} {seatsList.length === 1 ? 'seat' : 'seats'}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-white text-xs">
                          Rs. {Number(b.totalAmount || 0).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-zinc-500">Paid Online</div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {isCancelled ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-bold text-amber-400">
                            <XCircle className="w-3 h-3" />
                            <span>CANCELLED</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>CONFIRMED</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Details */}
                          <button
                            onClick={() => setSelectedBooking(b)}
                            title="View Full Booking Details"
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Cancel Booking */}
                          {!isCancelled && (
                            <button
                              onClick={() => setCancelModalBooking(b)}
                              title="Cancel Booking & Release Seats"
                              className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete Booking Record */}
                          <button
                            onClick={() => setDeleteModalBooking(b)}
                            title="Delete Booking Record"
                            className="p-2 rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 5. Booking Details Modal ── */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#0d0d12] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="p-3 rounded-2xl bg-red-600/15 border border-red-500/30 text-red-500">
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Booking Details</h3>
                <p className="text-xs font-mono text-zinc-400">
                  ID: #{selectedBooking.bookingId || selectedBooking._id}
                </p>
              </div>
            </div>

            {/* Movie Info Card */}
            <div className="flex gap-4 p-4 rounded-2xl bg-zinc-950 border border-white/10">
              {selectedBooking.posterUrl && (
                <img
                  src={selectedBooking.posterUrl}
                  alt={selectedBooking.movieTitle}
                  className="w-16 h-22 rounded-xl object-cover border border-white/10 shrink-0"
                />
              )}
              <div className="space-y-1.5 min-w-0 flex-1">
                <h4 className="font-bold text-white text-base leading-tight">
                  {selectedBooking.movieTitle}
                </h4>
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                  <span className="px-2 py-0.5 rounded bg-red-600/20 text-red-400 font-bold border border-red-500/30">
                    {selectedBooking.format || 'Standard 2D'}
                  </span>
                  <span>{selectedBooking.cinemaName}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-red-500" />
                    {selectedBooking.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    {selectedBooking.showtimeTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Seat & Price Breakdown */}
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-zinc-950 border border-white/10 space-y-2">
                <div className="text-zinc-400 font-semibold uppercase text-[10px] tracking-wider">
                  Assigned Seats ({Array.isArray(selectedBooking.seats) ? selectedBooking.seats.length : 0})
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {Array.isArray(selectedBooking.seats) && selectedBooking.seats.map((s: any, i: number) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 border border-white/15 text-xs font-mono font-bold text-white"
                    >
                      {s.id || s.seatNumber || s} {s.tier ? `(${s.tier.toUpperCase()})` : ''}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Booking Status</span>
                  <span className={`font-bold uppercase ${selectedBooking.status === 'cancelled' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {selectedBooking.status || 'CONFIRMED'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Digital Service & Fee</span>
                  <span className="text-zinc-200">Included (Rs. 100)</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex items-center justify-between text-sm font-bold text-white">
                  <span>Total Amount Paid</span>
                  <span className="text-emerald-400 font-display text-base">
                    Rs. {Number(selectedBooking.totalAmount || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions in Modal */}
            <div className="flex items-center gap-3 pt-2">
              {selectedBooking.status !== 'cancelled' && (
                <button
                  type="button"
                  onClick={() => {
                    const b = selectedBooking;
                    setSelectedBooking(null);
                    setCancelModalBooking(b);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/40 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel Booking
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="flex-1 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs border border-white/10 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. Cancel Booking Confirmation Modal ── */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#0d0d12] border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <XCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-white">Cancel Booking?</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Cancelling will release the booked seats back to the hall for other movie-goers.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={actionLoading !== null}
                onClick={() => setCancelModalBooking(null)}
                className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs py-3 rounded-xl border border-white/10 transition-colors cursor-pointer"
              >
                Keep Active
              </button>
              <button
                type="button"
                disabled={actionLoading !== null}
                onClick={() => handleCancelBooking(cancelModalBooking)}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-3 rounded-xl shadow-lg shadow-amber-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {actionLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Confirm Cancel</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. Delete Booking Confirmation Modal ── */}
      {deleteModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#0d0d12] border border-red-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 text-red-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-white">Permanently Delete Record?</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                This will delete the booking transaction permanently from the database.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={actionLoading !== null}
                onClick={() => setDeleteModalBooking(null)}
                className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs py-3 rounded-xl border border-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading !== null}
                onClick={() => handleDeleteBooking(deleteModalBooking)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-3 rounded-xl shadow-lg shadow-red-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {actionLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Record</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default BookingManagePage;
