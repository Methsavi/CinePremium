import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import MovieManagePage from "./components/MovieManagePage";
import HallManagePage from "./components/HallManagePage";
import ShowtimeManagePage from "./components/ShowtimeManagePage";
import { getMovies } from "../../services/movieApi";
import { getHalls } from "../../services/hallApi";
import { getShowtimes } from "../../services/showtimeApi";
import { useAuth } from "../../context/AuthContext";
import { 
  Film, Tv, Calendar, ArrowLeft, LayoutDashboard, 
  LogOut, ShieldAlert, Sparkles, Clock, ChevronRight
} from "lucide-react";

type ActiveTab = "overview" | "movies" | "halls" | "showtimes";

function AdminPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [movieCount, setMovieCount] = useState<number | null>(null);
  const [hallCount, setHallCount] = useState<number | null>(null);
  const [showtimeCount, setShowtimeCount] = useState<number | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "cinema_manager") return;

    const loadStats = async () => {
      setLoadingStats(true);
      try {
        const [movies, halls, showtimes] = await Promise.all([
          getMovies().catch(() => []),
          getHalls().catch(() => []),
          getShowtimes().catch(() => [])
        ]);
        setMovieCount(movies.length);
        setHallCount(halls.length);
        setShowtimeCount(showtimes.length);
      } catch (err) {
        console.error("Failed to load statistics:", err);
      } finally {
        setLoadingStats(false);
      }
    };

    loadStats();
  }, [activeTab, isAuthenticated, user]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Guard loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0c1324] text-[#dce1fb] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-on-surface-variant">Verifying cinema manager credentials...</span>
        </div>
      </div>
    );
  }

  // Guard access restriction
  if (!isAuthenticated || user?.role !== "cinema_manager") {
    return (
      <div className="min-h-screen bg-[#0c1324] text-[#dce1fb] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#151b2d] border border-rose-500/20 rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center text-rose-400 mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Access Restricted</h2>
            <p className="text-sm text-[#908fa0] leading-relaxed">
              This panel is restricted to authorized <strong>Cinema Managers</strong> only. Your account does not have access rights.
            </p>
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <Link 
              to="/" 
              className="px-5 py-2.5 bg-[#191f31] border border-[#2e3447] text-xs font-semibold rounded-xl hover:bg-[#2e3447] hover:text-white transition-all"
            >
              Go to Homepage
            </Link>
            <Link 
              to="/login" 
              className="px-5 py-2.5 bg-primary text-on-primary text-xs font-semibold rounded-xl hover:bg-inverse-primary transition-all shadow-md"
            >
              Sign In to Manager
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070d1f] text-[#dce1fb] flex overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#0c1324] border-r border-[#2e3447] flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30">
        <div>
          {/* Logo Header */}
          <div className="h-20 px-6 border-b border-[#2e3447] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-[#494bd6] flex items-center justify-center text-[#1000a9] font-black text-lg shadow-lg">
              M
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white">CinePremium</h1>
              <p className="text-[10px] text-primary font-semibold uppercase tracking-wider">Manager Desk</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                activeTab === "overview"
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-on-surface-variant hover:text-white hover:bg-surface-variant/40 border border-transparent"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              Overview Dashboard
            </button>

            <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-[#464554] uppercase tracking-wider">
              Management
            </div>

            <button
              onClick={() => setActiveTab("movies")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                activeTab === "movies"
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-on-surface-variant hover:text-white hover:bg-surface-variant/40 border border-transparent"
              }`}
            >
              <Film className="w-4 h-4 shrink-0" />
              Manage Movies
            </button>

            <button
              onClick={() => setActiveTab("halls")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                activeTab === "halls"
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-on-surface-variant hover:text-white hover:bg-surface-variant/40 border border-transparent"
              }`}
            >
              <Tv className="w-4 h-4 shrink-0" />
              Cinema Halls
            </button>

            <button
              onClick={() => setActiveTab("showtimes")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                activeTab === "showtimes"
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-on-surface-variant hover:text-white hover:bg-surface-variant/40 border border-transparent"
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              Showtimes Scheduling
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#2e3447] space-y-2">
          <Link
            to="/"
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium text-[#c7c4d7] hover:text-white hover:bg-[#151b2d] border border-[#2e3447] transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Website
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-all text-left cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Top Header Bar */}
        <header className="h-20 border-b border-[#2e3447] bg-[#0c1324]/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-tight">
              {activeTab === "overview" && "Manager Dashboard"}
              {activeTab === "movies" && "Movie Catalog Database"}
              {activeTab === "halls" && "Cinema Hall Configuration"}
              {activeTab === "showtimes" && "Showtimes Scheduling Board"}
            </h2>
            <p className="text-[11px] text-[#908fa0]">
              Logged in as <span className="text-primary font-semibold">{user.name}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#151b2d] border border-[#2e3447] rounded-xl px-3 py-1.5 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-white">{user.name}</span>
              <span className="text-[9px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase">Manager</span>
            </div>
          </div>
        </header>

        {/* Content Container (Reveals active view) */}
        <div className="flex-1 p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Welcome Card */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#151b2d] to-[#23293c] p-8 border border-[#2e3447] shadow-xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="relative z-10 space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    Manager Workspace
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Welcome back, {user.name}!</h3>
                  <p className="text-sm text-[#908fa0] max-w-2xl leading-relaxed">
                    You have full manager clearance to modify current movie showtimes, adjust ticket tiers for halls, and publish new upcoming films for ticketing availability.
                  </p>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Movies Card */}
                <div className="bg-[#0c1324] border border-[#2e3447] hover:border-primary/40 rounded-2xl p-6 transition-all shadow-lg flex items-center justify-between group">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-[#908fa0] uppercase tracking-wider">Active Movies</span>
                    <div className="text-3xl font-black text-white">
                      {loadingStats ? "..." : movieCount ?? 0}
                    </div>
                    <button 
                      onClick={() => setActiveTab("movies")}
                      className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Manage catalog
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center shrink-0">
                    <Film className="w-6 h-6" />
                  </div>
                </div>

                {/* Halls Card */}
                <div className="bg-[#0c1324] border border-[#2e3447] hover:border-primary/40 rounded-2xl p-6 transition-all shadow-lg flex items-center justify-between group">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-[#908fa0] uppercase tracking-wider">Halls Configured</span>
                    <div className="text-3xl font-black text-white">
                      {loadingStats ? "..." : hallCount ?? 0}
                    </div>
                    <button 
                      onClick={() => setActiveTab("halls")}
                      className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Manage seating configurations
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center shrink-0">
                    <Tv className="w-6 h-6" />
                  </div>
                </div>

                {/* Showtimes Card */}
                <div className="bg-[#0c1324] border border-[#2e3447] hover:border-primary/40 rounded-2xl p-6 transition-all shadow-lg flex items-center justify-between group">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-[#908fa0] uppercase tracking-wider">Scheduled Screenings</span>
                    <div className="text-3xl font-black text-white">
                      {loadingStats ? "..." : showtimeCount ?? 0}
                    </div>
                    <button 
                      onClick={() => setActiveTab("showtimes")}
                      className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      View planning calendar
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center shrink-0">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Quick Guidelines */}
              <div className="bg-[#151b2d] border border-[#2e3447] rounded-2xl p-6 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Cinema Operation Checklist
                </h4>
                <ul className="text-xs text-[#908fa0] space-y-3 pl-1">
                  <li className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span>Always configure the <strong>Cinema Halls</strong> (seating grids, luxury tiers) prior to setting up movie projections.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span>Upload beautiful high-resolution image paths for movie banners to capture attention.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span>Coordinate with system administrators if seat bookings require manual ticket revocation or overrides.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "movies" && <MovieManagePage />}
          {activeTab === "halls" && <HallManagePage />}
          {activeTab === "showtimes" && <ShowtimeManagePage />}
        </div>
      </main>
    </div>
  );
}

export default AdminPage;