import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { MyTicketsModal, BookingRecord } from '../../components/MyTicketsModal';
import {
  Film,
  Home,
  ArrowLeft,
  Sparkles,
  Compass,
  Tv,
  Ticket,
  Search,
  HelpCircle
} from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Modals state
  const [isMyTicketsOpen, setIsMyTicketsOpen] = useState<boolean>(false);
  const [userBookings, setUserBookings] = useState<BookingRecord[]>([]);

  const handleCancelBooking = (bookingId: string) => {
    setUserBookings((prev) => prev.filter((b) => b.id !== bookingId));
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-sans antialiased selection:bg-primary selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onBookNowClick={() => navigate('/movies')}
        onSearchClick={() => navigate('/movies')}
        onOpenMyTickets={() => setIsMyTicketsOpen(true)}
      />

      {/* 404 Main Container */}
      <main className="flex-1 flex items-center justify-center pt-32 pb-24 px-6 relative overflow-hidden">
        {/* Ambient Cinema Projector Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[380px] bg-gradient-to-b from-primary/20 via-red-900/10 to-transparent blur-3xl pointer-events-none -z-10 rounded-full" />
        <div className="absolute bottom-10 left-1/4 w-[400px] h-[400px] bg-primary/5 blur-3xl pointer-events-none -z-10 rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-indigo-500/10 blur-3xl pointer-events-none -z-10 rounded-full" />

        <div className="max-w-2xl w-full mx-auto text-center space-y-8 animate-in fade-in zoom-in-95 duration-300">
          {/* Cinema 404 Status Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs sm:text-sm font-bold tracking-wider shadow-[0_0_20px_rgba(229,9,20,0.15)]">
            <Compass className="w-4 h-4 text-primary animate-spin" style={{ animationDuration: '10s' }} />
            <span>ERROR 404 • SCENE NOT FOUND</span>
          </div>

          {/* Glowing 404 Display */}
          <div className="relative select-none">
            <h1 className="text-8xl sm:text-9xl md:text-[11rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-neutral-200 to-neutral-700 font-display leading-none drop-shadow-[0_10px_35px_rgba(229,9,20,0.3)]">
              4<span className="text-primary">0</span>4
            </h1>
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              <Film className="w-48 h-48 text-primary" />
            </div>
          </div>

          {/* Heading and Description */}
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white font-display tracking-tight">
              Oops! This Scene Doesn't Exist
            </h2>
            <p className="text-sm sm:text-base text-on-surface-variant max-w-lg mx-auto leading-relaxed">
              The page or resource you requested at{' '}
              <code className="text-primary font-mono bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20 text-xs sm:text-sm">
                {location.pathname || '/unknown'}
              </code>{' '}
              was either moved to another screening auditorium, removed from the schedule, or is still under production.
            </p>
          </div>

          {/* Quick Nav Suggestions */}
          <div className="bg-surface-container/70 border border-outline-variant/60 rounded-3xl p-6 sm:p-7 backdrop-blur-xl shadow-2xl max-w-lg mx-auto space-y-4">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
              Where would you like to explore instead?
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                to="/"
                className="liquid-glow-btn text-surface-container-lowest font-extrabold text-xs sm:text-sm py-3 px-4 rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-102 transition-all"
              >
                <Home className="w-4 h-4" />
                <span>Go to Homepage</span>
              </Link>

              <Link
                to="/movies"
                className="liquid-glass-btn text-white hover:text-primary font-semibold text-xs sm:text-sm py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
              >
                <Film className="w-4 h-4 text-primary" />
                <span>Browse Movies</span>
              </Link>

              <Link
                to="/cinemas"
                className="liquid-glass-btn text-white hover:text-primary font-semibold text-xs sm:text-sm py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
              >
                <Tv className="w-4 h-4 text-primary" />
                <span>Find Cinemas</span>
              </Link>

              <Link
                to="/my-bookings"
                className="liquid-glass-btn text-white hover:text-primary font-semibold text-xs sm:text-sm py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
              >
                <Ticket className="w-4 h-4 text-primary" />
                <span>My Bookings</span>
              </Link>
            </div>
          </div>

          {/* Return Back Button */}
          <div className="pt-2">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#908fa0] hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back to Previous Page</span>
            </button>
          </div>
        </div>
      </main>

      {/* Shared Footer */}
      <Footer />

      {/* My Tickets History Modal */}
      {isMyTicketsOpen && (
        <MyTicketsModal
          bookings={userBookings}
          onClose={() => setIsMyTicketsOpen(false)}
          onCancelBooking={handleCancelBooking}
        />
      )}
    </div>
  );
}

export default NotFoundPage;
