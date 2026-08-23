import { useState, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { bookingApi } from '../../services/bookingApi';
import { Movie } from '../../types/movie';
import { CinemaHall } from '../../types/hall';
import {
  CreditCard,
  Lock,
  ShieldCheck,
  Calendar,
  Clock,
  Tv,
  Ticket,
  CheckCircle2,
  Sparkles,
  Tag,
  Wallet,
  Building,
  AlertCircle
} from 'lucide-react';

export function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const { user, token, isAuthenticated } = useAuth();

  // Retrieve data passed from SeatSelectionPage
  const checkoutData = location.state || {};
  const movie: Movie = checkoutData.movie || {
    id: 'db-movie',
    title: 'CinePremium Feature Screening',
    posterUrl: '',
    genres: ['Action', 'Drama'],
    duration: '2h 00m',
    rating: 8.5,
    status: 'now_showing'
  };
  const hall: CinemaHall = checkoutData.hall || {
    id: 'hall-imax',
    name: 'Hall 1 — IMAX Laser Experience',
    screenType: 'IMAX 3D',
    totalCapacity: 86,
    seatTiers: [],
    isActive: true,
    createdAt: ''
  };
  const showDate: string = checkoutData.showDate || new Date().toISOString().split('T')[0];
  const showTime: string = checkoutData.showTime || '07:30 PM';
  const format: string = checkoutData.format || hall.screenType || 'IMAX 3D';
  const showtimeId: string = checkoutData.showtimeId || `st-${movie.id}-${hall.id}`;
  const selectedSeats: Array<{ id: string; row: string; number: number; tier: string; price: number }> =
    checkoutData.selectedSeats || [
      { id: 'A3', row: 'A', number: 3, tier: 'VIP', price: 22 },
      { id: 'A4', row: 'A', number: 4, tier: 'VIP', price: 22 }
    ];

  // Contact Info
  const [contactName, setContactName] = useState(user?.name || '');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState('+1 (555) 019-2834');

  // Payment Form States
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet' | 'counter'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(user?.name || '');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [saveCard, setSaveCard] = useState(true);

  // Promo Code
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');

  // Processing & Confirmation State
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pricing calculations
  const ticketsSubtotal = useMemo(() => {
    return selectedSeats.reduce((acc, s) => acc + (s.price || 15), 0);
  }, [selectedSeats]);

  const bookingFee = selectedSeats.length > 0 ? 1.50 : 0;
  const discountAmount = promoApplied ? (ticketsSubtotal * discountPercent) / 100 : 0;
  const grandTotal = Math.max(0, ticketsSubtotal + bookingFee - discountAmount);

  // Format Card Number input with spaces
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 16);
    val = val.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(val);
  };

  // Format Expiry MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setCardExpiry(val);
  };

  // Detect card brand
  const cardBrand = useMemo(() => {
    const raw = cardNumber.replace(/\s/g, '');
    if (raw.startsWith('4')) return 'VISA';
    if (raw.startsWith('5')) return 'MASTERCARD';
    if (raw.startsWith('3')) return 'AMEX';
    return 'CARD';
  }, [cardNumber]);

  // Handle Promo Code submission
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'CINE10' || code === 'PROMO10') {
      setDiscountPercent(10);
      setPromoApplied(true);
    } else if (code === 'PREMIUM20' || code === 'VIP20') {
      setDiscountPercent(20);
      setPromoApplied(true);
    } else {
      setPromoError('Invalid promo code. Try "CINE10" or "PREMIUM20"');
    }
  };

  // Handle Checkout submission
  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!contactName.trim() || !contactEmail.trim()) {
      setErrorMessage('Please enter your contact name and email for e-ticket delivery.');
      return;
    }

    if (paymentMethod === 'card') {
      if (cardNumber.replace(/\s/g, '').length < 15) {
        setErrorMessage('Please enter a valid 16-digit credit/debit card number.');
        return;
      }
      if (!cardExpiry || !cardExpiry.includes('/')) {
        setErrorMessage('Please enter a valid expiration date (MM/YY).');
        return;
      }
      if (cardCvv.length < 3) {
        setErrorMessage('Please enter a valid 3 or 4-digit CVV security code.');
        return;
      }
    }

    try {
      setIsProcessing(true);

      const generatedBookingId = `CP-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

      const bookingPayload = {
        bookingId: generatedBookingId,
        movieId: movie.id,
        movieTitle: movie.title,
        posterUrl: movie.posterUrl || movie.backdropUrl,
        cinemaId: hall.id,
        cinemaName: hall.name,
        showtimeId,
        showtimeTime: showTime,
        date: showDate,
        format,
        seats: selectedSeats.map((s) => ({
          id: s.id,
          row: s.row,
          number: s.number,
          type: (s.tier || 'standard').toLowerCase(),
          price: s.price || 15,
        })),
        totalAmount: grandTotal,
      };

      if (isAuthenticated && token) {
        await bookingApi.createBooking(token, bookingPayload);
      }

      setConfirmedBookingId(generatedBookingId);
      setPaymentSuccess(true);
    } catch (err: any) {
      console.error('Payment / Booking error:', err);
      setErrorMessage(err.response?.data?.message || err.message || 'Payment processing failed. Please try again.');
      
      addNotification({
        type: 'error',
        message: 'Payment Failed'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-[#09090b] text-white min-h-screen flex flex-col font-sans antialiased selection:bg-red-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onBookNowClick={() => navigate('/movies')}
        onSearchClick={() => navigate('/movies')}
      />

      <main className="flex-1 pt-24 pb-20 px-4 sm:px-6 md:px-12 max-w-[1300px] mx-auto w-full space-y-8">
        
        {/* ── Payment Success Screen (Modal / View) ── */}
        {paymentSuccess ? (
          <div className="bg-[#0d0d10] border border-emerald-500/40 rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-2xl space-y-6 animate-in zoom-in-95 duration-300 my-8">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Payment Successful. Your Tickets are booked
              </h2>
              <p className="text-sm text-zinc-400">
                Booking Reference ID: <strong className="text-white font-mono font-bold text-base">{confirmedBookingId}</strong>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                onClick={() => navigate('/my-bookings')}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 cursor-pointer transition-all"
              >
                <Ticket className="w-4 h-4" />
                <span>View My Tickets</span>
              </button>

              <Link
                to="/movies"
                className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white text-sm font-semibold px-6 py-3.5 rounded-xl text-center transition-all cursor-pointer"
              >
                Browse More Movies
              </Link>
            </div>
          </div>
        ) : (
          /* ── Main Checkout Form Grid ── */
          <form onSubmit={handleProcessPayment} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* ── Left Column (8 cols): Contact & Payment Information ── */}
            <div className="lg:col-span-8 space-y-6">
              
              {errorMessage && (
                <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-400 text-sm rounded-xl flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 1. Contact Details */}
              <div className="bg-[#0d0d10] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
                <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-black flex items-center justify-center">
                    1
                  </span>
                  <h3 className="text-lg font-bold text-white">Contact & Ticket Delivery</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Alex Henderson"
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-red-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Email Address (E-Ticket Delivery) *
                    </label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-red-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Mobile Phone (SMS Confirmation)
                    </label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-red-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Payment Method Selector */}
              <div className="bg-[#0d0d10] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-black flex items-center justify-center">
                      2
                    </span>
                    <h3 className="text-lg font-bold text-white">Select Payment Method</h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-zinc-400 bg-zinc-950 px-2.5 py-1 rounded-md border border-white/10">
                      VISA
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400 bg-zinc-950 px-2.5 py-1 rounded-md border border-white/10">
                      MC
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400 bg-zinc-950 px-2.5 py-1 rounded-md border border-white/10">
                      AMEX
                    </span>
                  </div>
                </div>

                {/* Tabs */}
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'bg-red-600/15 border-red-500 text-white font-bold shadow-md'
                        : 'bg-zinc-950 border-white/10 text-zinc-400 hover:border-white/20'
                    }`}
                  >
                    <CreditCard className={`w-5 h-5 ${paymentMethod === 'card' ? 'text-red-500' : 'text-zinc-500'}`} />
                    <span className="text-xs">Credit Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('wallet')}
                    className={`p-3.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'wallet'
                        ? 'bg-red-600/15 border-red-500 text-white font-bold shadow-md'
                        : 'bg-zinc-950 border-white/10 text-zinc-400 hover:border-white/20'
                    }`}
                  >
                    <Wallet className={`w-5 h-5 ${paymentMethod === 'wallet' ? 'text-red-500' : 'text-zinc-500'}`} />
                    <span className="text-xs">Digital Wallet</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('counter')}
                    className={`p-3.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'counter'
                        ? 'bg-red-600/15 border-red-500 text-white font-bold shadow-md'
                        : 'bg-zinc-950 border-white/10 text-zinc-400 hover:border-white/20'
                    }`}
                  >
                    <Building className={`w-5 h-5 ${paymentMethod === 'counter' ? 'text-red-500' : 'text-zinc-500'}`} />
                    <span className="text-xs">Pay at Cinema</span>
                  </button>
                </div>

                {/* ── Card Payment Form & Interactive Preview ── */}
                {paymentMethod === 'card' && (
                  <div className="space-y-6 pt-2">
                    {/* Interactive Virtual Card Hologram */}
                    <div className="relative w-full max-w-sm mx-auto h-48 rounded-2xl p-6 bg-gradient-to-tr from-[#09090b] via-[#141418] to-[#25090b] border border-white/15 shadow-2xl flex flex-col justify-between overflow-hidden">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-red-600/15 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="flex items-center justify-between relative z-10">
                        <div className="w-10 h-8 rounded-md bg-amber-400/80 border border-amber-300 shadow-inner flex items-center justify-center">
                          <div className="w-6 h-5 border border-black/30 rounded" />
                        </div>
                        <span className="font-mono font-black text-sm text-white tracking-widest">
                          {cardBrand}
                        </span>
                      </div>

                      <div className="relative z-10">
                        <span className="font-mono text-lg tracking-widest text-white block drop-shadow-md">
                          {cardNumber || '•••• •••• •••• ••••'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs relative z-10 text-white/80 uppercase font-mono">
                        <div>
                          <span className="text-[9px] text-zinc-400 block">Card Holder</span>
                          <span className="font-bold text-white tracking-wider truncate max-w-[150px] block">
                            {cardHolder || 'FULL NAME'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-zinc-400 block">Expires</span>
                          <span className="font-bold text-white tracking-wider">
                            {cardExpiry || 'MM/YY'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Input Fields */}
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                          Card Number *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required={paymentMethod === 'card'}
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            placeholder="0000 0000 0000 0000"
                            className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-red-500 focus:outline-none transition-colors font-mono"
                          />
                          <CreditCard className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                          Cardholder Name *
                        </label>
                        <input
                          type="text"
                          required={paymentMethod === 'card'}
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          placeholder="Name as printed on card"
                          className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-red-500 focus:outline-none transition-colors uppercase"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                            Expiry Date (MM/YY) *
                          </label>
                          <input
                            type="text"
                            required={paymentMethod === 'card'}
                            value={cardExpiry}
                            onChange={handleExpiryChange}
                            placeholder="12/28"
                            className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-red-500 focus:outline-none transition-colors font-mono text-center"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                            <span>CVV / CVC *</span>
                            <span className="text-[10px] text-zinc-500 normal-case">3 digits</span>
                          </label>
                          <input
                            type="password"
                            maxLength={4}
                            required={paymentMethod === 'card'}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                            placeholder="•••"
                            className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-red-500 focus:outline-none transition-colors font-mono text-center"
                          />
                        </div>
                      </div>

                      <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={saveCard}
                          onChange={(e) => setSaveCard(e.target.checked)}
                          className="accent-red-600 rounded w-4 h-4 cursor-pointer"
                        />
                        <span>Securely save this card for fast 1-click booking next time</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* ── Wallet Option ── */}
                {paymentMethod === 'wallet' && (
                  <div className="p-6 bg-zinc-950 rounded-xl border border-white/10 text-center space-y-4">
                    <p className="text-xs text-zinc-400">
                      Authorize payment instantly using your preferred digital wallet.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                      <div className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs flex items-center gap-1.5 shadow-md">
                        <span>Apple Pay</span>
                      </div>
                      <div className="px-5 py-2.5 rounded-xl bg-[#202124] text-white font-bold text-xs flex items-center gap-1.5 border border-white/20 shadow-md">
                        <span>Google Pay</span>
                      </div>
                      <div className="px-5 py-2.5 rounded-xl bg-zinc-800 text-white font-bold text-xs flex items-center gap-1.5 border border-white/10 shadow-md">
                        <span>PayPal</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Counter Pay Option ── */}
                {paymentMethod === 'counter' && (
                  <div className="p-6 bg-zinc-950 rounded-xl border border-white/10 space-y-2 text-xs text-zinc-400">
                    <h4 className="font-bold text-white text-sm">Pay at Cinema Box Office</h4>
                    <p>
                      Your seats will be reserved under booking reference for up to <strong>30 minutes before showtime</strong>.
                      Please present your ID or email confirmation at the ticket counter to pay and collect physical tickets.
                    </p>
                  </div>
                )}
              </div>

              {/* 3. Promo Code Section */}
              <div className="bg-[#0d0d10] border border-white/10 rounded-2xl p-6 shadow-xl space-y-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-red-500" />
                  <h4 className="text-sm font-bold text-white">Have a Promo Code or Gift Voucher?</h4>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    disabled={promoApplied}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code (e.g. CINE10 or PREMIUM20)"
                    className="flex-1 bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:border-red-500 focus:outline-none uppercase font-mono"
                  />
                  <button
                    type="button"
                    disabled={promoApplied || !promoCode.trim()}
                    onClick={handleApplyPromo}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0"
                  >
                    {promoApplied ? 'Applied' : 'Apply'}
                  </button>
                </div>

                {promoApplied && (
                  <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Promo code applied! {discountPercent}% discount deducted from tickets subtotal.</span>
                  </p>
                )}

                {promoError && (
                  <p className="text-xs text-red-400">{promoError}</p>
                )}
              </div>
            </div>

            {/* ── Right Column (4 cols): Sticky Order Summary & Pay CTA ── */}
            <div className="lg:col-span-4 bg-[#0d0d10] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6 sticky top-24">
              
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-red-500" />
                  <h3 className="text-lg font-bold text-white">Order Summary</h3>
                </div>
                <span className="text-xs font-bold text-zinc-300 bg-zinc-900 px-2.5 py-1 rounded-full border border-white/10">
                  {format}
                </span>
              </div>

              {/* Movie Snippet */}
              <div className="flex items-start gap-3 p-3.5 bg-zinc-950 rounded-xl border border-white/5">
                <img
                  src={movie.posterUrl || movie.backdropUrl}
                  alt={movie.title}
                  className="w-16 h-22 object-cover rounded-xl border border-white/10 shrink-0 shadow-md"
                />
                <div className="space-y-1 min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-white truncate">{movie.title}</h4>
                  <p className="text-xs text-zinc-400 flex items-center gap-1">
                    <Tv className="w-3 h-3 text-red-500 shrink-0" />
                    <span className="truncate">{hall.name}</span>
                  </p>
                  <p className="text-xs text-zinc-300 font-semibold flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-red-500 shrink-0" />
                    <span>{showDate}</span>
                  </p>
                  <p className="text-xs text-zinc-300 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-red-500 shrink-0" />
                    <span>{showTime}</span>
                  </p>
                </div>
              </div>

              {/* Reserved Seats List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                  Reserved Seats ({selectedSeats.length})
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {selectedSeats.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-zinc-950 border border-white/5 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-red-600/20 text-red-400 border border-red-500/40 font-bold flex items-center justify-center text-[10px]">
                          {s.id}
                        </span>
                        <span className="text-white font-medium">{s.tier || 'Standard'} Seat</span>
                      </div>
                      <span className="font-bold text-emerald-400">Rs. {Number(s.price || 15).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="p-4 bg-zinc-950 rounded-xl border border-white/5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Tickets Subtotal</span>
                  <span className="text-white font-bold">Rs. {ticketsSubtotal.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between text-zinc-400">
                  <span>Digital Service & Processing Fee</span>
                  <span className="text-white font-bold">Rs. {bookingFee.toFixed(2)}</span>
                </div>

                {promoApplied && (
                  <div className="flex items-center justify-between text-emerald-400 font-semibold">
                    <span>Discount ({discountPercent}%)</span>
                    <span>-Rs. {discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-sm">
                  <span className="font-bold text-white">Total Payable Amount</span>
                  <span className="font-black text-xl text-emerald-400">
                    Rs. {grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Pay Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-sm py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Authorizing & Generating Tickets...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay Rs. {grandTotal.toFixed(2)} & Confirm Tickets</span>
                  </>
                )}
              </button>

              <div className="text-[11px] text-center text-zinc-400 space-y-1">
                <p className="flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Instant E-Ticket & Scannable QR Code</span>
                </p>
                <p className="opacity-70">Free cancellation up to 2 hours before showtime.</p>
              </div>
            </div>
          </form>
        )}
      </main>

      {/* Shared Footer */}
      <Footer />
    </div>
  );
}

export default CheckoutPage;
