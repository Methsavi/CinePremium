import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { MyTicketsModal, BookingRecord } from '../../components/MyTicketsModal';
import { HERO_MOVIE } from '../../data/movies';
import { Movie } from '../../types/movie';
import { useAuth } from '../../context/AuthContext';
import {
  Film,
  Sparkles,
  Award,
  Tv,
  Headphones,
  Armchair,
  Coffee,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Flame,
  Globe2,
  Heart,
} from 'lucide-react';

export function AboutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Modals state
  const [bookingMovie, setBookingMovie] = useState<Movie | null>(null);
  const [isMyTicketsOpen, setIsMyTicketsOpen] = useState<boolean>(false);
  const [userBookings, setUserBookings] = useState<BookingRecord[]>([]);

  const handleBookingSuccess = (newBooking: BookingRecord) => {
    setUserBookings((prev) => [newBooking, ...prev]);
  };

  const handleCancelBooking = (bookingId: string) => {
    setUserBookings((prev) => prev.filter((b) => b.id !== bookingId));
  };

  const handleBookClick = () => {
    navigate('/movies');
  };

  const stats = [
    { value: '12+', label: 'Flagship Cinema Locations', subtext: 'Across major metropolitan cities' },
    { value: '50+', label: 'Laser & IMAX Auditoriums', subtext: 'Equipped with Dolby Atmos' },
    { value: '2.5M+', label: 'Delighted Moviegoers', subtext: 'Welcomed annually' },
    { value: '4.9★', label: 'Customer Satisfaction Score', subtext: 'From over 150,000 verified reviews' },
  ];

  const values = [
    {
      icon: Flame,
      title: 'Passion for Storytelling',
      desc: 'We believe cinema is an empathy machine. Every detail in our theaters is tuned to honor the art of the filmmaker.',
    },
    {
      icon: Award,
      title: 'Uncompromised Quality',
      desc: 'We refuse shortcuts. From calibrated color grading on laser projectors to crystal-clear subwoofers, quality is king.',
    },
    {
      icon: Heart,
      title: 'Guest-Centric Hospitality',
      desc: 'From the moment you browse showtimes until the closing credits roll, our mission is to make you feel like a VIP.',
    },
    {
      icon: Globe2,
      title: 'Sustainable Innovation',
      desc: 'We use energy-efficient laser projection, biodegradable concessions packaging, and paperless digital ticketing.',
    },
  ];

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-sans antialiased selection:bg-primary selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onBookNowClick={() => handleBookClick(HERO_MOVIE)}
        onSearchClick={() => navigate('/')}
        onOpenMyTickets={() => setIsMyTicketsOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 pt-24 pb-20 overflow-hidden">
        {/* Ambient Glows */}
        <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-br from-primary/15 via-red-900/10 to-transparent blur-3xl pointer-events-none -z-10 rounded-full" />
        <div className="fixed bottom-10 right-10 w-[500px] h-[500px] bg-primary/5 blur-3xl pointer-events-none -z-10 rounded-full" />

        <div className="max-w-[1280px] mx-auto px-6 md:px-12 space-y-24">
          {/* Hero Section */}
          <section className="relative pt-6 sm:pt-10 text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs sm:text-sm font-bold tracking-wide shadow-[0_0_20px_rgba(229,9,20,0.15)] animate-in fade-in zoom-in-95 duration-300">
              <span>The Next Chapter in Cinematic Entertainment</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-display leading-[1.1]">
              Redefining How You <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-primary/90 to-primary">
                Experience Cinema
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
              At CinePremium, we transform everyday movie outings into immersive celebrations of visual grandeur, acoustic perfection, and luxury hospitality.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                to="/"
                className="liquid-glow-btn text-surface-container-lowest font-extrabold text-sm px-7 py-3 rounded-full flex items-center gap-2 cursor-pointer shadow-lg tracking-tight hover:scale-105 transition-all"
              >
                <Film className="w-4 h-4 fill-current" />
                <span>Explore Now Playing</span>
              </Link>

              <Link
                to="/cinemas"
                className="liquid-glass-btn text-sm font-semibold px-6 py-3 rounded-full text-white hover:text-primary transition-all flex items-center gap-2"
              >
                <MapPin className="w-4 h-4 text-primary" />
                <span>Find a Theater</span>
              </Link>
            </div>
          </section>

          {/* Stats Bar */}
          <section className="bg-surface-container/60 border border-outline-variant/60 rounded-3xl p-6 sm:p-10 backdrop-blur-md shadow-2xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-outline-variant/40">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`text-center space-y-1.5 ${index !== 0 ? 'pt-4 sm:pt-0 sm:pl-6' : ''}`}
                >
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-display tracking-tight bg-gradient-to-br from-white to-neutral-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-primary tracking-wide">
                    {stat.label}
                  </div>
                  <div className="text-[11px] text-on-surface-variant font-medium">
                    {stat.subtext}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Story & Vision Bento Section */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
                <Film className="w-3.5 h-3.5" />
                Our Story & Vision
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
                Born From a Passion for the Silver Screen
              </h2>

              <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
                Founded with a bold vision to break away from sterile, cookie-cutter movie halls, CinePremium was designed as a sanctuary for film devotees. We believe every movie deserves to be witnessed exactly as directors and sound designers envisioned.
              </p>

              <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
                By pairing custom architectural acoustics with dual 4K laser projection systems and opulent recliner seating, CinePremium delivers an unforgettable sensory escape that home streaming simply cannot duplicate.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  'Pure uncompressed digital audio master transmission',
                  'High Frame Rate (HFR) & 3D Laser Cinema readiness',
                  'Exclusive premiere screenings and film festival galas',
                  'Customized in-seat butler service and artisan confectionery',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm text-neutral-200">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden border border-outline-variant/60 shadow-[0_0_50px_rgba(0,0,0,0.8)] group">
                <img
                  src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1000&q=80"
                  alt="Cinema Auditorium"
                  className="w-full h-[400px] sm:h-[480px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                
                <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl bg-surface-container/90 border border-white/10 backdrop-blur-md space-y-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs">
                    <Award className="w-4 h-4" />
                    <span>Architectural Acoustic Design</span>
                  </div>
                  <h3 className="text-base font-bold text-white">Custom Tiered Seating & Sightlines</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Every auditorium is acoustically calibrated with floating walls and zero obstructed viewing angles.
                  </p>
                </div>
              </div>
            </div>
          </section>

         

          {/* Core Values */}
          <section className="bg-surface-container-low/80 border border-outline-variant/50 rounded-3xl p-8 sm:p-12 space-y-8 backdrop-blur-md">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
                Our Core Principles
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant">
                The values that drive every frame we project and every guest we serve.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((val, idx) => {
                const IconComp = val.icon;
                return (
                  <div key={idx} className="space-y-3 bg-surface-container/40 p-5 rounded-2xl border border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-white">{val.title}</h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">{val.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>

          

          {/* Call to Action Banner */}
          <section className="relative rounded-3xl overflow-hidden border border-primary/30 bg-gradient-to-r from-red-950/80 via-surface-container-high to-surface-container-low p-8 sm:p-14 text-center space-y-6 shadow-2xl">
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -top-20 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <span className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold tracking-wide">
                Join Over 2.5 Million Satisfied Guests
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-display tracking-tight">
                Ready for an Unforgettable Night at the Movies?
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-lg mx-auto leading-relaxed">
                Book your luxury recliner seats now and experience cinematic magic as it was meant to be seen and heard.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => handleBookClick(HERO_MOVIE)}
                  className="liquid-glow-btn text-surface-container-lowest font-extrabold text-sm px-8 py-3.5 rounded-full flex items-center gap-2 cursor-pointer shadow-xl tracking-tight hover:scale-105 transition-all"
                >
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span>Book Tickets Now</span>
                </button>

                <Link
                  to="/cinemas"
                  className="liquid-glass-btn text-sm font-semibold px-6 py-3.5 rounded-full text-white hover:text-primary transition-all flex items-center gap-2"
                >
                  <span>Explore Cinemas</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>
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

export default AboutPage;
