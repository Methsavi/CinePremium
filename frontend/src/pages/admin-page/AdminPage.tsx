import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import MovieManagePage from "./components/MovieManagePage";
import HallManagePage from "./components/HallManagePage";
import ShowtimeManagePage from "./components/ShowtimeManagePage";
import { getMovies } from "../../services/movieApi";
import { getHalls } from "../../services/hallApi";
import { getShowtimes } from "../../services/showtimeApi";
import { Movie } from "../../types/movie";
import { CinemaHall } from "../../types/hall";
import { Showtime } from "../../types/showtime";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";
import { 
  Film, Tv, Calendar, ArrowLeft, LayoutDashboard, 
  LogOut, ShieldAlert, Sparkles, Clock, ChevronRight,
  TrendingUp, Armchair, Layers, Star, Plus, RefreshCw,
  ExternalLink, BarChart3, PieChart
} from "lucide-react";

type ActiveTab = "overview" | "movies" | "halls" | "showtimes";

const SCREEN_FORMAT_COLORS: Record<string, { bg: string; border: string; text: string; fill: string }> = {
  "IMAX 3D":      { bg: "bg-blue-500/15",   border: "border-blue-500/30",   text: "text-blue-300",   fill: "bg-blue-500" },
  "4DX":          { bg: "bg-orange-500/15", border: "border-orange-500/30", text: "text-orange-300", fill: "bg-orange-500" },
  "Dolby Cinema": { bg: "bg-purple-500/15", border: "border-purple-500/30", text: "text-purple-300", fill: "bg-purple-500" },
  "Standard 2D":  { bg: "bg-slate-500/15",  border: "border-slate-500/30",  text: "text-slate-300",  fill: "bg-slate-500" },
  "ScreenX":      { bg: "bg-teal-500/15",   border: "border-teal-500/30",   text: "text-teal-300",   fill: "bg-teal-500" },
};

export function AdminPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [moviesList, setMoviesList] = useState<Movie[]>([]);
  const [hallsList, setHallsList] = useState<CinemaHall[]>([]);
  const [showtimesList, setShowtimesList] = useState<Showtime[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Load all live database records
  const loadDatabaseData = async () => {
    setLoadingData(true);
    try {
      const [movies, halls, showtimes] = await Promise.all([
        getMovies().catch(() => [] as Movie[]),
        getHalls().catch(() => [] as CinemaHall[]),
        getShowtimes().catch(() => [] as Showtime[])
      ]);
      setMoviesList(movies);
      setHallsList(halls);
      setShowtimesList(showtimes);
    } catch (err) {
      console.error("Failed to load admin data from database:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "cinema_manager") return;
    loadDatabaseData();
  }, [isAuthenticated, user]);

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

    // Screen Format Distribution
    const formatCounts: Record<string, number> = {};
    hallsList.forEach((h) => {
      const fmt = h.screenType || "Standard 2D";
      formatCounts[fmt] = (formatCounts[fmt] || 0) + 1;
    });

    // Genre Distribution
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
      formatCounts,
      genreCounts
    };
  }, [moviesList, hallsList, showtimesList]);

  // Guard loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#070d1f] text-[#dce1fb] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-on-surface-variant">Verifying manager credentials...</span>
        </div>
      </div>
    );
  }

  // Guard access restriction
  if (!isAuthenticated || user?.role !== "cinema_manager") {
    return (
      <div className="min-h-screen bg-[#070d1f] text-[#dce1fb] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-[#151b2d] border border-rose-500/20 rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center text-rose-400 mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Manager Clearance Required</h2>
            <p className="text-xs text-[#908fa0] leading-relaxed">
              This administrative dashboard is restricted to authorized <strong>Cinema Managers</strong>. Please sign in with a manager profile to access movie scheduling and hall configurations.
            </p>
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <Link 
              to="/" 
              className="px-5 py-2.5 bg-[#0c1324] border border-[#2e3447] text-xs font-semibold rounded-xl hover:bg-[#2e3447] hover:text-white transition-all"
            >
              Back to Home
            </Link>
            <Link 
              to="/login" 
              className="liquid-glow-btn text-surface-container-lowest text-xs font-bold px-6 py-2.5 rounded-xl shadow-lg"
            >
              Sign In to Manager
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070d1f] text-[#dce1fb] flex overflow-hidden font-sans antialiased selection:bg-primary selection:text-white">
      
      {/* ── SIDEBAR NAVIGATION ── */}
      <aside className="w-64 bg-[#0c1324] border-r border-[#2e3447] flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30 shadow-2xl">
        <div>
          {/* Logo & Brand Header (Matched with Top Bar) */}
          <div className="h-20 px-6 border-b border-[#2e3447] flex items-center gap-3.5 bg-[#0c1324] shrink-0">
            <img 
              src={logo} 
              alt="CinePremium Logo" 
              className="w-9 h-9 object-contain drop-shadow-[0_0_10px_rgba(229,9,20,0.4)] shrink-0" 
            />
            <div className="min-w-0">
              <h1 className="text-sm font-black tracking-tight text-white font-display truncate">
                CinePremium
              </h1>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-primary font-black uppercase tracking-wider">
                  Manager Panel
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === "overview"
                  ? "bg-primary text-white shadow-[0_0_15px_rgba(229,9,20,0.35)]"
                  : "text-on-surface-variant hover:text-white hover:bg-surface-variant/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Overview Dashboard</span>
              </div>
            </button>

            <div className="pt-5 pb-2 px-4 text-[10px] font-extrabold text-[#464554] uppercase tracking-wider">
              Cinema Management
            </div>

            <button
              onClick={() => setActiveTab("movies")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === "movies"
                  ? "bg-primary text-white shadow-[0_0_15px_rgba(229,9,20,0.35)]"
                  : "text-on-surface-variant hover:text-white hover:bg-surface-variant/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <Film className="w-4 h-4 shrink-0" />
                <span>Manage Movies</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeTab === "movies" ? "bg-white/20 text-white" : "bg-[#151b2d] text-[#908fa0]"
              }`}>
                {moviesList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("halls")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === "halls"
                  ? "bg-primary text-white shadow-[0_0_15px_rgba(229,9,20,0.35)]"
                  : "text-on-surface-variant hover:text-white hover:bg-surface-variant/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <Tv className="w-4 h-4 shrink-0" />
                <span>Cinema Halls</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeTab === "halls" ? "bg-white/20 text-white" : "bg-[#151b2d] text-[#908fa0]"
              }`}>
                {hallsList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("showtimes")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === "showtimes"
                  ? "bg-primary text-white shadow-[0_0_15px_rgba(229,9,20,0.35)]"
                  : "text-on-surface-variant hover:text-white hover:bg-surface-variant/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>Showtimes Scheduling</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeTab === "showtimes" ? "bg-white/20 text-white" : "bg-[#151b2d] text-[#908fa0]"
              }`}>
                {showtimesList.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-[#2e3447] space-y-2 bg-[#0c1324]">
          <Link
            to="/"
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#c7c4d7] hover:text-white hover:bg-[#151b2d] border border-[#2e3447] transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-primary" />
            <span>Back to Live Website</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all text-left cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden bg-[#070d1f]">
        
        {/* Top Header Bar (Fixed & Stable Padding) */}
        <header className="h-20 border-b border-[#2e3447] bg-[#0c1324] px-6 flex items-center justify-between shrink-0 z-20 shadow-md">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight font-display">
              {activeTab === "overview" && "Manager Overview Dashboard"}
              {activeTab === "movies" && "Movie Catalog Database"}
              {activeTab === "halls" && "Cinema Hall Configuration"}
              {activeTab === "showtimes" && "Showtimes Scheduling Board"}
            </h2>
            <p className="text-[11px] text-[#908fa0] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Database Synced</span>
              <span>·</span>
              <span>Logged in as <strong className="text-primary font-semibold">{user.name}</strong></span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#151b2d] hover:bg-[#1f263b] border border-[#2e3447] text-xs font-semibold text-[#dce1fb] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-primary" />
              <span>Live Site</span>
            </Link>

            <button
              onClick={loadDatabaseData}
              title="Refresh all records from database"
              className="p-2.5 rounded-xl bg-[#151b2d] hover:bg-[#1f263b] border border-[#2e3447] text-[#dce1fb] transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loadingData ? "animate-spin text-primary" : ""}`} />
            </button>

            {/* Manager Avatar Badge */}
            <div className="bg-[#151b2d] border border-[#2e3447] rounded-2xl px-3 py-1.5 flex items-center gap-2.5 shadow-sm">
              <div className="w-7 h-7 rounded-xl bg-primary text-white font-black flex items-center justify-center text-xs shadow-md">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-bold text-white block leading-none">{user.name}</span>
                <span className="text-[9px] text-[#908fa0] font-mono">{user.email || "manager@cinepremium.com"}</span>
              </div>
              <span className="text-[9px] font-black bg-primary/15 text-primary border border-primary/30 px-2 py-0.5 rounded-full uppercase">
                Manager
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Views (Scrollable Body with stable gutter) */}
        <div className="flex-1 overflow-y-auto min-h-0 [scrollbar-gutter:stable] p-6 max-w-7xl w-full mx-auto space-y-8 animate-in fade-in duration-200">
          
          {/* ════ OVERVIEW DASHBOARD ════ */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              
              {/* Welcome Card Banner */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0c1324] via-[#151b2d] to-[#0c1324] p-6 sm:p-8 border border-white/10 shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="relative z-10 space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Real-time Cinema Operations Control</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white font-display">
                    Welcome back, {user.name}!
                  </h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl leading-relaxed">
                    Overview of live movies in database, configured luxury cinema auditoriums, screen format distribution, and today's scheduled showtimes.
                  </p>
                </div>
              </div>

              {/* ── 4 KPI Metric Cards (Database-driven) ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                
                {/* 1. Movies KPI */}
                <div 
                  onClick={() => setActiveTab("movies")}
                  className="bg-[#151b2d] border border-[#2e3447] hover:border-primary/50 rounded-3xl p-6 transition-all shadow-xl cursor-pointer group flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#908fa0] uppercase tracking-wider">
                      Active Movies
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Film className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-3xl sm:text-4xl font-black text-white font-display">
                      {loadingData ? "..." : stats.totalMovies}
                    </div>
                    <p className="text-[11px] text-[#c0c1ff] font-medium">
                      {stats.nowShowingCount} Now Showing · {stats.comingSoonCount} Coming Soon
                    </p>
                  </div>
                  <div className="pt-2 border-t border-[#2e3447] flex items-center justify-between text-xs text-primary font-bold">
                    <span>Manage Catalog</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* 2. Cinema Halls KPI */}
                <div 
                  onClick={() => setActiveTab("halls")}
                  className="bg-[#151b2d] border border-[#2e3447] hover:border-primary/50 rounded-3xl p-6 transition-all shadow-xl cursor-pointer group flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#908fa0] uppercase tracking-wider">
                      Auditorium Halls
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Tv className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-3xl sm:text-4xl font-black text-white font-display">
                      {loadingData ? "..." : stats.totalHalls}
                    </div>
                    <p className="text-[11px] text-[#c0c1ff] font-medium">
                      {Object.keys(stats.formatCounts).length} Distinct Screen Types
                    </p>
                  </div>
                  <div className="pt-2 border-t border-[#2e3447] flex items-center justify-between text-xs text-primary font-bold">
                    <span>Configure Halls</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* 3. Showtimes KPI */}
                <div 
                  onClick={() => setActiveTab("showtimes")}
                  className="bg-[#151b2d] border border-[#2e3447] hover:border-primary/50 rounded-3xl p-6 transition-all shadow-xl cursor-pointer group flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#908fa0] uppercase tracking-wider">
                      Scheduled Screenings
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Calendar className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-3xl sm:text-4xl font-black text-white font-display">
                      {loadingData ? "..." : stats.totalShowtimes}
                    </div>
                    <p className="text-[11px] text-[#c0c1ff] font-medium">
                      Active database projection slots
                    </p>
                  </div>
                  <div className="pt-2 border-t border-[#2e3447] flex items-center justify-between text-xs text-primary font-bold">
                    <span>View Schedule</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* 4. Total Seating Network KPI */}
                <div className="bg-[#151b2d] border border-[#2e3447] rounded-3xl p-6 transition-all shadow-xl flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#908fa0] uppercase tracking-wider">
                      Total Network Capacity
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                      <Armchair className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-display">
                      {loadingData ? "..." : stats.totalCapacity}
                    </div>
                    <p className="text-[11px] text-[#908fa0] font-medium">
                      Simultaneous luxury & standard seats
                    </p>
                  </div>
                  <div className="pt-2 border-t border-[#2e3447] text-xs text-emerald-400/80 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Real-time Seating Matrix</span>
                  </div>
                </div>
              </div>

              {/* ── Visual Analytics & Distribution Section ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. Screen Formats Distribution Chart */}
                <div className="bg-[#151b2d] border border-[#2e3447] rounded-3xl p-6 shadow-xl space-y-5">
                  <div className="flex items-center justify-between border-b border-[#2e3447] pb-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                        Auditorium Screen Format Distribution
                      </h4>
                    </div>
                    <span className="text-[10px] text-[#908fa0] font-bold">
                      {hallsList.length} Halls Configured
                    </span>
                  </div>

                  {hallsList.length === 0 ? (
                    <p className="text-xs text-[#908fa0] italic text-center py-6">No cinema halls in database.</p>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(stats.formatCounts).map(([format, count]) => {
                        const colors = SCREEN_FORMAT_COLORS[format] ?? SCREEN_FORMAT_COLORS["Standard 2D"];
                        const percent = Math.round((count / Math.max(1, hallsList.length)) * 100);

                        return (
                          <div key={format} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-semibold">
                              <span className="text-white flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${colors.fill}`} />
                                {format}
                              </span>
                              <span className="text-[#c0c1ff]">{count} hall{count > 1 ? 's' : ''} ({percent}%)</span>
                            </div>
                            <div className="h-2 w-full bg-[#0c1324] rounded-full overflow-hidden border border-[#2e3447]">
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
                <div className="bg-[#151b2d] border border-[#2e3447] rounded-3xl p-6 shadow-xl space-y-5">
                  <div className="flex items-center justify-between border-b border-[#2e3447] pb-3">
                    <div className="flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-primary" />
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                        Movie Catalog & Genre Overview
                      </h4>
                    </div>
                    <span className="text-[10px] text-[#908fa0] font-bold">
                      {moviesList.length} Movies Total
                    </span>
                  </div>

                  {/* Status Pills */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-[#0c1324] rounded-2xl border border-[#2e3447] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#908fa0] font-bold uppercase block">Now Showing</span>
                        <span className="text-xl font-black text-emerald-400">{stats.nowShowingCount}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                        Live
                      </span>
                    </div>

                    <div className="p-3 bg-[#0c1324] rounded-2xl border border-[#2e3447] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#908fa0] font-bold uppercase block">Coming Soon</span>
                        <span className="text-xl font-black text-amber-300">{stats.comingSoonCount}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                        Upcoming
                      </span>
                    </div>
                  </div>

                  {/* Genre Badges Overview */}
                  <div className="space-y-2 pt-1">
                    <span className="text-xs font-bold text-[#908fa0] uppercase tracking-wider block">
                      Top Genres in Database
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(stats.genreCounts).map(([genre, count]) => (
                        <span
                          key={genre}
                          className="px-3 py-1 rounded-xl bg-[#0c1324] border border-[#2e3447] text-xs text-[#dce1fb] flex items-center gap-1.5"
                        >
                          <span className="font-semibold">{genre}</span>
                          <strong className="text-primary font-bold text-[10px]">({count})</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── RECENT / ACTIVE OVERVIEWS (Direct Database Records) ── */}
              
              {/* 1. Live Movies Database Overview */}
              <div className="bg-[#151b2d] border border-[#2e3447] rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#2e3447] pb-3">
                  <div className="flex items-center gap-2">
                    <Film className="w-5 h-5 text-primary" />
                    <h4 className="text-base font-bold text-white font-display">
                      Movie Catalog ({moviesList.length})
                    </h4>
                  </div>
                  <button
                    onClick={() => setActiveTab("movies")}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open Movie Manager</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {moviesList.length === 0 ? (
                  <p className="text-xs text-[#908fa0] text-center py-6 italic">No movies currently in database.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-[#2e3447] text-[#908fa0] uppercase tracking-wider text-[10px]">
                          <th className="pb-2 px-2">Movie</th>
                          <th className="pb-2 px-2">Status</th>
                          <th className="pb-2 px-2">Rating & Duration</th>
                          <th className="pb-2 px-2">Genres</th>
                          <th className="pb-2 px-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2e3447]/60">
                        {moviesList.slice(0, 4).map((movie) => (
                          <tr key={movie.id} className="hover:bg-[#192036] transition-colors">
                            <td className="py-2.5 px-2">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={movie.posterUrl || movie.backdropUrl}
                                  alt={movie.title}
                                  className="w-8 h-11 object-cover rounded-lg border border-[#2e3447]"
                                />
                                <div>
                                  <h5 className="font-bold text-white text-xs">{movie.title}</h5>
                                  <span className="text-[10px] text-[#908fa0] font-mono">ID: {movie.id.slice(-6)}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-2">
                              <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${
                                movie.status === "now_showing"
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              }`}>
                                {movie.status === "now_showing" ? "Now Showing" : "Coming Soon"}
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-[#dce1fb]">
                              {movie.rating ? `${movie.rating} ★` : '—'} · {movie.duration || 'N/A'}
                            </td>
                            <td className="py-2.5 px-2 text-[#c7c4d7]">
                              {movie.genres?.slice(0, 2).join(', ')}
                            </td>
                            <td className="py-2.5 px-2 text-right">
                              <button
                                onClick={() => setActiveTab("movies")}
                                className="text-primary hover:underline font-bold text-xs cursor-pointer"
                              >
                                Edit Movie
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* 2. Cinema Halls Overview */}
              <div className="bg-[#151b2d] border border-[#2e3447] rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#2e3447] pb-3">
                  <div className="flex items-center gap-2">
                    <Tv className="w-5 h-5 text-primary" />
                    <h4 className="text-base font-bold text-white font-display">
                      Configured Cinema Auditoriums ({hallsList.length})
                    </h4>
                  </div>
                  <button
                    onClick={() => setActiveTab("halls")}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open Hall Manager</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {hallsList.length === 0 ? (
                  <p className="text-xs text-[#908fa0] text-center py-6 italic">No cinema halls currently in database.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-[#2e3447] text-[#908fa0] uppercase tracking-wider text-[10px]">
                          <th className="pb-2 px-2">Auditorium Name</th>
                          <th className="pb-2 px-2">Format</th>
                          <th className="pb-2 px-2">Total Capacity</th>
                          <th className="pb-2 px-2">Configured Seat Tiers</th>
                          <th className="pb-2 px-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2e3447]/60">
                        {hallsList.slice(0, 4).map((hall) => {
                          const screenColors =
                            SCREEN_FORMAT_COLORS[hall.screenType] ?? SCREEN_FORMAT_COLORS["Standard 2D"];

                          return (
                            <tr key={hall.id} className="hover:bg-[#192036] transition-colors">
                              <td className="py-2.5 px-2 font-bold text-white">
                                {hall.name}
                              </td>
                              <td className="py-2.5 px-2">
                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase border ${screenColors.bg} ${screenColors.border} ${screenColors.text}`}>
                                  {hall.screenType}
                                </span>
                              </td>
                              <td className="py-2.5 px-2 font-bold text-white">
                                {hall.totalCapacity} Seats
                              </td>
                              <td className="py-2.5 px-2 text-[#c7c4d7]">
                                {hall.seatTiers && hall.seatTiers.length > 0
                                  ? hall.seatTiers.map((t) => `${t.tierName} (${t.seatCount})`).join(', ')
                                  : 'Standard'}
                              </td>
                              <td className="py-2.5 px-2 text-right">
                                <button
                                  onClick={() => setActiveTab("halls")}
                                  className="text-primary hover:underline font-bold text-xs cursor-pointer"
                                >
                                  Edit Hall
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* 3. Upcoming Scheduled Screenings Overview */}
              <div className="bg-[#151b2d] border border-[#2e3447] rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#2e3447] pb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <h4 className="text-base font-bold text-white font-display">
                      Scheduled Showtimes ({showtimesList.length})
                    </h4>
                  </div>
                  <button
                    onClick={() => setActiveTab("showtimes")}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open Showtimes Scheduler</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {showtimesList.length === 0 ? (
                  <p className="text-xs text-[#908fa0] text-center py-6 italic">No showtimes scheduled in database.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-[#2e3447] text-[#908fa0] uppercase tracking-wider text-[10px]">
                          <th className="pb-2 px-2">Date & Time</th>
                          <th className="pb-2 px-2">Movie</th>
                          <th className="pb-2 px-2">Auditorium / Format</th>
                          <th className="pb-2 px-2">Tier Pricing Preview</th>
                          <th className="pb-2 px-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2e3447]/60">
                        {showtimesList.slice(0, 5).map((st) => (
                          <tr key={st.id} className="hover:bg-[#192036] transition-colors">
                            <td className="py-2.5 px-2">
                              <span className="font-bold text-amber-300 font-mono text-xs">{st.showTime}</span>
                              <span className="text-[10px] text-[#908fa0] block">{st.showDate}</span>
                            </td>
                            <td className="py-2.5 px-2 font-bold text-white">
                              {st.movie?.title || "Movie Screening"}
                            </td>
                            <td className="py-2.5 px-2 text-[#c0c1ff]">
                              {st.hall?.name || "Auditorium"} · <span className="font-bold text-white">{st.format}</span>
                            </td>
                            <td className="py-2.5 px-2">
                              {st.tierPrices && st.tierPrices.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {st.tierPrices.map((tp, idx) => (
                                    <span key={idx} className="px-1.5 py-0.5 rounded bg-[#0c1324] text-[10px] text-[#dce1fb] border border-[#2e3447]">
                                      {tp.tierName}: <strong className="text-emerald-400">Rs. {tp.price.toFixed(2)}</strong>
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-[#908fa0] italic">Standard rates</span>
                              )}
                            </td>
                            <td className="py-2.5 px-2 text-right">
                              <button
                                onClick={() => setActiveTab("showtimes")}
                                className="text-primary hover:underline font-bold text-xs cursor-pointer"
                              >
                                Edit Slot
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ════ TAB VIEWS ════ */}
          {activeTab === "movies" && <MovieManagePage />}
          {activeTab === "halls" && <HallManagePage />}
          {activeTab === "showtimes" && <ShowtimeManagePage />}
        </div>
      </main>
    </div>
  );
}

export default AdminPage;