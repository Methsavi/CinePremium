import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import MovieManagePage from "./components/MovieManagePage";
import HallManagePage from "./components/HallManagePage";
import ShowtimeManagePage from "./components/ShowtimeManagePage";
import FeedbackManagePage from "./components/FeedbackManagePage";
import { LineChartAnalytics } from "./components/LineChartAnalytics";
import { getMovies } from "../../services/movieApi";
import { getHalls } from "../../services/hallApi";
import { getShowtimes } from "../../services/showtimeApi";
import { bookingApi } from "../../services/bookingApi";
import { Movie } from "../../types/movie";
import { CinemaHall } from "../../types/hall";
import { Showtime } from "../../types/showtime";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";
import { io } from "socket.io-client";
import { 
  Film, Tv, Calendar, ArrowLeft, LayoutDashboard, 
  LogOut, ShieldAlert, ChevronRight,
  BarChart3, PieChart, MessageSquare, ArrowUpRight
} from "lucide-react";

type ActiveTab = "overview" | "movies" | "halls" | "showtimes" | "feedbacks";

const SCREEN_FORMAT_COLORS: Record<string, { fill: string }> = {
  "IMAX 3D":      { fill: "bg-red-600" },
  "4DX":          { fill: "bg-amber-600" },
  "Dolby Cinema": { fill: "bg-red-500" },
  "Standard 2D":  { fill: "bg-zinc-600" },
  "ScreenX":      { fill: "bg-rose-600" },
};

export function AdminPage() {
  const navigate = useNavigate();
  const { user, token, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [moviesList, setMoviesList] = useState<Movie[]>([]);
  const [hallsList, setHallsList] = useState<CinemaHall[]>([]);
  const [showtimesList, setShowtimesList] = useState<Showtime[]>([]);
  const [bookingsList, setBookingsList] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Load all live database records
  const loadDatabaseData = async () => {
    setLoadingData(true);
    try {
      const activeToken = token || localStorage.getItem('savi_auth_token');
      const [movies, halls, showtimes, bookingsRes] = await Promise.all([
        getMovies().catch(() => [] as Movie[]),
        getHalls().catch(() => [] as CinemaHall[]),
        getShowtimes().catch(() => [] as Showtime[]),
        activeToken
          ? bookingApi.getAllBookings(activeToken).catch(() => ({ data: { bookings: [] } }))
          : Promise.resolve({ data: { bookings: [] } })
      ]);
      setMoviesList(movies);
      setHallsList(halls);
      setShowtimesList(showtimes);
      setBookingsList(bookingsRes?.data?.bookings || []);
    } catch (err) {
      console.error("Failed to load admin data from database:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "cinema_manager") return;
    loadDatabaseData();
  }, [isAuthenticated, user, token]);

  useEffect(() => {
    if (!token || user?.role !== "cinema_manager") return;

    const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.BACKEND_URL?.replace(/\/$/, '') || 'http://localhost:5000';
    const socket = io(baseUrl, { auth: { token } });
    const refresh = () => loadDatabaseData();

    socket.on('booking-created', refresh);
    socket.on('booking-cancelled', refresh);
    socket.on('movie-created', refresh);
    socket.on('movie-updated', refresh);
    socket.on('movie-deleted', refresh);
    socket.on('hall-created', refresh);
    socket.on('hall-updated', refresh);
    socket.on('hall-deleted', refresh);
    socket.on('showtime-created', refresh);
    socket.on('showtime-updated', refresh);
    socket.on('showtime-deleted', refresh);

    return () => {
      socket.disconnect();
    };
  }, [token, user?.role]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Analytics Computations directly from Database
  const stats = useMemo(() => {
    const totalMovies = moviesList.length;
    const nowShowingCount = moviesList.filter((m) => m.status === "now_showing").length;
    const comingSoonCount = moviesList.filter((m) => m.status === "coming_soon").length;
    
    const totalHalls = hallsList.length;
    const totalCapacity = hallsList.reduce((acc, h) => acc + (h.totalCapacity || 0), 0);

    const totalShowtimes = showtimesList.length;

    // Real active showtimes scheduled for today
    const todayStr = new Date().toISOString().split('T')[0];
    const activeTodayShowtimes = showtimesList.filter(st => {
      const d = st.showDate || (st as any).date;
      return d && d.startsWith(todayStr);
    }).length;

    // Real bookings counts
    const confirmedBookingsCount = bookingsList.filter(b => b.status === "confirmed").length;
    const totalTicketsSold = bookingsList
      .filter(b => b.status === "confirmed")
      .reduce((acc, b) => acc + (Array.isArray(b.seats) ? b.seats.length : 1), 0);

    // Screen Format Distribution from real DB halls
    const formatCounts: Record<string, number> = {};
    hallsList.forEach((h) => {
      const fmt = h.screenType || "Standard 2D";
      formatCounts[fmt] = (formatCounts[fmt] || 0) + 1;
    });

    // Genre Distribution from real DB movies
    const genreCounts: Record<string, number> = {};
    moviesList.forEach((m) => {
      (m.genres || []).forEach((g) => {
        genreCounts[g] = (genreCounts[g] || 0) + 1;
      });
    });

    return {
      totalMovies,
      nowShowingCount,
      comingSoonCount,
      totalHalls,
      totalCapacity,
      totalShowtimes,
      activeTodayShowtimes,
      confirmedBookingsCount,
      totalTicketsSold,
      formatCounts,
      genreCounts
    };
  }, [moviesList, hallsList, showtimesList, bookingsList]);

  // Guard loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#08080a] text-zinc-300 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-zinc-400">Verifying manager credentials...</span>
        </div>
      </div>
    );
  }

  // Guard access restriction
  if (!isAuthenticated || user?.role !== "cinema_manager") {
    return (
      <div className="min-h-screen bg-[#08080a] text-zinc-300 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-[#0d0d10] border border-red-500/20 rounded-xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center text-red-500 mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Manager Clearance Required</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              This administrative dashboard is restricted to authorized <strong>Cinema Managers</strong>.
            </p>
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <Link 
              to="/" 
              className="px-5 py-2.5 bg-zinc-900 border border-white/10 text-xs font-semibold rounded-lg hover:bg-zinc-800 hover:text-white transition-all"
            >
              Back to Home
            </Link>
            <Link 
              to="/login" 
              className="px-5 py-2.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-all shadow-md"
            >
              Sign In to Manager
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-300 flex overflow-hidden font-sans antialiased">
      
      {/* ── SIDEBAR NAVIGATION ── */}
      <aside className="w-64 bg-[#0d0d10] border-r border-white/10 flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30 shadow-2xl">
        <div>
          {/* Logo & Brand Header */}
          <div className="h-16 px-6 border-b border-white/10 flex items-center gap-3 bg-[#0d0d10] shrink-0">
            <img 
              src={logo} 
              alt="CinePremium" 
              className="w-8 h-8 object-contain" 
            />
            <div className="min-w-0">
              <h1 className="text-sm font-bold tracking-tight text-white truncate">
                Cine<span className="text-red-500">Premium</span>
              </h1>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                  Manager Panel
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                activeTab === "overview"
                  ? "bg-red-600 text-white shadow-md"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Overview</span>
              </div>
            </button>

            <div className="pt-3 pb-1 px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              Cinema Management
            </div>

            <button
              onClick={() => setActiveTab("movies")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                activeTab === "movies"
                  ? "bg-red-600 text-white shadow-md"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Film className="w-4 h-4 shrink-0" />
                <span>Movies</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === "movies" ? "bg-white/20 text-white" : "bg-zinc-800 text-zinc-400"
              }`}>
                {moviesList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("halls")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                activeTab === "halls"
                  ? "bg-red-600 text-white shadow-md"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Tv className="w-4 h-4 shrink-0" />
                <span>Cinema Halls</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === "halls" ? "bg-white/20 text-white" : "bg-zinc-800 text-zinc-400"
              }`}>
                {hallsList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("showtimes")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                activeTab === "showtimes"
                  ? "bg-red-600 text-white shadow-md"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>Showtimes</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === "showtimes" ? "bg-white/20 text-white" : "bg-zinc-800 text-zinc-400"
              }`}>
                {showtimesList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("feedbacks")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                activeTab === "feedbacks"
                  ? "bg-red-600 text-white shadow-md"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span>Feedbacks</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === "feedbacks" ? "bg-white/20 text-white" : "bg-zinc-800 text-red-400"
              }`}>
                Live
              </span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-white/10 space-y-1">
          <Link
            to="/"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-red-500" />
            <span>Back to Live Website</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition-all text-left cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden bg-[#08080a]">
        
        {/* Top Header Bar */}
        <header className="h-16 border-b border-white/10 bg-[#0d0d10] px-6 flex items-center shrink-0 z-20">
          <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight">
            {activeTab === "overview" && "Overview Dashboard"}
            {activeTab === "movies" && "Movie Catalog Database"}
            {activeTab === "halls" && "Cinema Hall Configuration"}
            {activeTab === "showtimes" && "Showtimes Scheduling Board"}
            {activeTab === "feedbacks" && "Audience Feedback Management"}
          </h2>
        </header>

        {/* Dynamic Views */}
        <div className="flex-1 overflow-y-auto min-h-0 [scrollbar-gutter:stable] p-6 max-w-7xl w-full mx-auto space-y-6 animate-in fade-in duration-200">
          
          {/* ════ OVERVIEW DASHBOARD ════ */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              
              {/* ── 4 KPI Metric Cards (Clean without icons, minimized radius) ── */}
              {/* ── Top KPI Metric Cards (Clean & Compact without icons) ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. Movies KPI */}
                <div 
                  onClick={() => setActiveTab("movies")}
                  className="bg-[#0d0d10] border border-white/10 hover:border-red-500/40 rounded-xl p-4 transition-all shadow-sm cursor-pointer group flex flex-col justify-between space-y-2.5"
                >
                  <div>
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                      Active Movies
                    </span>
                    <div className="text-2xl font-black text-white mt-0.5">
                      {loadingData ? "..." : stats.totalMovies}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>{stats.nowShowingCount} Now Showing · {stats.comingSoonCount} Upcoming</span>
                  </div>
                </div>

                {/* 2. Cinema Halls KPI */}
                <div 
                  onClick={() => setActiveTab("halls")}
                  className="bg-[#0d0d10] border border-white/10 hover:border-red-500/40 rounded-xl p-4 transition-all shadow-sm cursor-pointer group flex flex-col justify-between space-y-2.5"
                >
                  <div>
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                      Auditorium Halls
                    </span>
                    <div className="text-2xl font-black text-white mt-0.5">
                      {loadingData ? "..." : stats.totalHalls}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>{Object.keys(stats.formatCounts).length} Screen Types</span>
                  </div>
                </div>

                {/* 3. Showtimes KPI */}
                <div 
                  onClick={() => setActiveTab("showtimes")}
                  className="bg-[#0d0d10] border border-white/10 hover:border-red-500/40 rounded-xl p-4 transition-all shadow-sm cursor-pointer group flex flex-col justify-between space-y-2.5"
                >
                  <div>
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                      Scheduled Screenings
                    </span>
                    <div className="text-2xl font-black text-white mt-0.5">
                      {loadingData ? "..." : stats.totalShowtimes}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>{stats.activeTodayShowtimes} Active Screening{stats.activeTodayShowtimes === 1 ? '' : 's'} Today</span>
                  </div>
                </div>

                {/* 4. Total Seating Network KPI */}
                <div className="bg-[#0d0d10] border border-white/10 rounded-xl p-4 transition-all shadow-sm flex flex-col justify-between space-y-2.5">
                  <div>
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                      Total Capacity
                    </span>
                    <div className="text-2xl font-black text-emerald-400 mt-0.5">
                      {loadingData ? "..." : stats.totalCapacity}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{stats.totalTicketsSold} Confirmed Ticket{stats.totalTicketsSold === 1 ? '' : 's'} Booked</span>
                  </div>
                </div>
              </div>

              {/* ── Line Chart & Recent Activity Grid (Matching Screenshot) ── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Line Chart (2 Cols) */}
                <div className="lg:col-span-2">
                  <LineChartAnalytics showtimes={showtimesList} bookings={bookingsList} movies={moviesList} />
                </div>

                {/* Recent Activity / Movie Activity (1 Col) */}
                <div className="bg-[#0d0d10] border border-white/10 rounded-2xl p-5 shadow-md flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Recent Activity
                    </h4>
                    <button
                      onClick={() => setActiveTab("movies")}
                      className="text-xs text-red-500 hover:text-red-400 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>View All</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {moviesList.length === 0 ? (
                    <p className="text-xs text-zinc-500 italic py-6 text-center">No recent activity.</p>
                  ) : (
                    <div className="divide-y divide-white/5 space-y-0.5">
                      {moviesList.slice(0, 4).map((m) => (
                        <div key={m.id} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3">
                          {m.posterUrl ? (
                            <img 
                              src={m.posterUrl} 
                              alt={m.title} 
                              className="w-9 h-11 object-cover rounded-md border border-white/10 shrink-0 shadow-sm"
                            />
                          ) : (
                            <div className="w-9 h-11 rounded-md bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-500 shrink-0">
                              <Film className="w-4 h-4" />
                            </div>
                          )}
                          <div className="space-y-0.5 min-w-0 flex-1">
                            <div className="text-xs font-semibold text-white truncate uppercase tracking-tight">
                              {m.title} <span className="text-zinc-400 font-normal lowercase">added</span>
                            </div>
                            <div className="text-[11px] text-zinc-400 truncate">
                              {m.genres && m.genres.length > 0 ? m.genres.join("\\") : "Feature"}
                            </div>
                          </div>
                          <span className={`text-[11px] font-semibold shrink-0 ${
                            m.status === "now_showing" ? "text-emerald-400" : "text-yellow-400"
                          }`}>
                            {m.status === "now_showing" ? "Now Showing" : "Upcoming"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* ── Visual Analytics & Distribution Section ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. Screen Formats Distribution Chart */}
                <div className="bg-[#0d0d10] border border-white/10 rounded-xl p-5 shadow-md space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-red-500" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Screen Format Distribution
                      </h4>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-bold">
                      {hallsList.length} Halls Configured
                    </span>
                  </div>

                  {hallsList.length === 0 ? (
                    <p className="text-xs text-zinc-500 italic text-center py-6">No cinema halls in database.</p>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(stats.formatCounts).map(([format, count]) => {
                        const colors = SCREEN_FORMAT_COLORS[format] ?? SCREEN_FORMAT_COLORS["Standard 2D"];
                        const percent = Math.round((count / Math.max(1, hallsList.length)) * 100);

                        return (
                          <div key={format} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-white font-medium flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${colors.fill}`} />
                                {format}
                              </span>
                              <span className="text-zinc-400">{count} hall{count > 1 ? 's' : ''} ({percent}%)</span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-white/5">
                              <div 
                                className={`h-full ${colors.fill} transition-all duration-500 rounded-full`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. Movie Catalog Status & Genre Distribution */}
                <div className="bg-[#0d0d10] border border-white/10 rounded-xl p-5 shadow-md space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-red-500" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Movie Catalog & Genres
                      </h4>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-bold">
                      {moviesList.length} Movies Total
                    </span>
                  </div>

                  {/* Status Indicators */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-zinc-950 rounded-lg border border-white/5 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-zinc-400 font-bold uppercase block">Now Showing</span>
                        <span className="text-lg font-black text-white">{stats.nowShowingCount}</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-400">
                        Now Showing
                      </span>
                    </div>

                    <div className="p-3 bg-zinc-950 rounded-lg border border-white/5 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-zinc-400 font-bold uppercase block">Coming Soon</span>
                        <span className="text-lg font-black text-white">{stats.comingSoonCount}</span>
                      </div>
                      <span className="text-xs font-bold text-yellow-400">
                        Upcoming
                      </span>
                    </div>
                  </div>

                  {/* Genre Overview */}
                  <div className="space-y-2 pt-1">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                      Top Genres
                    </span>
                    <div className="flex flex-wrap gap-2 text-xs text-zinc-300">
                      {Object.entries(stats.genreCounts).map(([genre, count]) => (
                        <span key={genre} className="text-zinc-300">
                          {genre} <strong className="text-red-500 font-bold">({count})</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ════ TAB VIEWS ════ */}
          {activeTab === "movies" && <MovieManagePage />}
          {activeTab === "halls" && <HallManagePage />}
          {activeTab === "showtimes" && <ShowtimeManagePage />}
          {activeTab === "feedbacks" && <FeedbackManagePage />}
        </div>
      </main>
    </div>
  );
}

export default AdminPage;