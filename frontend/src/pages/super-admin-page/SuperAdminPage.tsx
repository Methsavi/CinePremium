import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import MovieManagePage from "../admin-page/components/MovieManagePage";
import HallManagePage from "../admin-page/components/HallManagePage";
import ShowtimeManagePage from "../admin-page/components/ShowtimeManagePage";
import FeedbackManagePage from "../admin-page/components/FeedbackManagePage";
import { LineChartAnalytics } from "../admin-page/components/LineChartAnalytics";
import { getMovies } from "../../services/movieApi";
import { getHalls } from "../../services/hallApi";
import { getShowtimes } from "../../services/showtimeApi";
import { getRegisteredUsers, deleteUser, updateUser } from "../../services/userApi";
import { bookingApi } from "../../services/bookingApi";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import { io } from "socket.io-client";
import { User } from "../../types/auth";
import { Movie } from "../../types/movie";
import { CinemaHall } from "../../types/hall";
import { Showtime } from "../../types/showtime";
import logo from "../../assets/logo.png";
import { 
  Users, Film, Tv, Calendar, ArrowLeft, LayoutDashboard, 
  LogOut, ShieldAlert, RefreshCw, Search, Trash2, Edit2,
  ChevronRight, MessageSquare, ArrowUpRight
} from "lucide-react";

type ActiveTab = "overview" | "users" | "movies" | "halls" | "showtimes" | "feedbacks";

export default function SuperAdminPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, token, isLoading: authLoading, logout } = useAuth();
  const { addNotification } = useNotification();
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  
  // Stats states
  const [userCount, setUserCount] = useState<number | null>(null);
  const [movieCount, setMovieCount] = useState<number | null>(null);
  const [hallCount, setHallCount] = useState<number | null>(null);
  const [showtimeCount, setShowtimeCount] = useState<number | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Catalog lists for overview
  const [moviesList, setMoviesList] = useState<Movie[]>([]);
  const [hallsList, setHallsList] = useState<CinemaHall[]>([]);
  const [showtimesList, setShowtimesList] = useState<Showtime[]>([]);
  const [bookingsList, setBookingsList] = useState<any[]>([]);

  // Users management states
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "cinema_manager" | "user">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const activeToken = token || localStorage.getItem('savi_auth_token');
      const [users, movies, halls, showtimes, bookingsRes] = await Promise.all([
        getRegisteredUsers(activeToken).catch(() => []),
        getMovies().catch(() => []),
        getHalls().catch(() => []),
        getShowtimes().catch(() => []),
        activeToken
          ? bookingApi.getAllBookings(activeToken).catch(() => ({ data: { bookings: [] } }))
          : Promise.resolve({ data: { bookings: [] } })
      ]);
      
      setUserCount(users.length);
      setUsersList(users);
      
      setMovieCount(movies.length);
      setHallCount(halls.length);
      setShowtimeCount(showtimes.length);

      setMoviesList(movies);
      setHallsList(halls);
      setShowtimesList(showtimes);
      setBookingsList(bookingsRes?.data?.bookings || []);
    } catch (err) {
      console.error("Failed to load statistics:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setUsersError(null);
    try {
      const data = await getRegisteredUsers(token);
      setUsersList(data);
    } catch (err: any) {
      setUsersError(err.message || "Failed to fetch users");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") return;
    loadStats();
  }, [activeTab, isAuthenticated, user]);

  useEffect(() => {
    if (!token || user?.role !== "admin") return;

    const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.BACKEND_URL?.replace(/\/$/, '') || 'http://localhost:5000';
    const socket = io(baseUrl, { auth: { token } });
    const refresh = () => loadStats();

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

  useEffect(() => {
    if (activeTab === "users" && isAuthenticated && user?.role === "admin") {
      fetchUsers();
    }
  }, [activeTab, isAuthenticated, user]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleDeleteUser = async (targetId: string, targetName: string) => {
    if (targetId === user?.id) {
      addNotification({ message: 'Cannot delete own admin account', type: 'error' });
      return;
    }
    if (!window.confirm(`Are you sure you want to delete user "${targetName}"?`)) return;

    try {
      setDeletingId(targetId);
      await deleteUser(targetId, token);
      setUsersList(prev => prev.filter(u => u.id !== targetId));
      
      setUserCount(prev => prev !== null ? prev - 1 : null);

      addNotification({
        type: 'delete',
        message: 'Deleted Successfully'
      });
    } catch (err: any) {
      addNotification({
        type: 'error',
        message: 'Action Failed'
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleRoleChange = async (targetId: string, _targetName: string, newRole: string) => {
    if (targetId === user?.id) {
      addNotification({ message: 'Cannot modify own admin role', type: 'error' });
      return;
    }
    try {
      setUpdatingId(targetId);
      await updateUser(targetId, { role: newRole }, token);
      setUsersList(prev => prev.map(u => u.id === targetId ? { ...u, role: newRole } : u));
      
      loadStats();

      addNotification({
        type: 'success',
        message: 'Updated Successfully'
      });
    } catch (err: any) {
      addNotification({
        type: 'error',
        message: 'Action Failed'
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = usersList.filter(u => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !q || 
      u.name.toLowerCase().includes(q) || 
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q);
      
    const matchesFilter = roleFilter === "all" || u.role === roleFilter;
    
    return matchesSearch && matchesFilter;
  });

  // Guard loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#08080a] text-zinc-300 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-zinc-400">Verifying site admin credentials...</span>
        </div>
      </div>
    );
  }

  // Guard access restriction
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#08080a] text-zinc-300 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#0d0d10] border border-red-500/20 rounded-xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center text-red-500 mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Access Restricted</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              This panel is restricted to authorized <strong>Site System Admins</strong> only.
            </p>
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <Link 
              to="/" 
              className="px-5 py-2.5 bg-zinc-900 border border-white/10 text-xs font-semibold rounded-lg hover:bg-zinc-800 hover:text-white transition-all"
            >
              Go to Homepage
            </Link>
            <Link 
              to="/login" 
              className="px-5 py-2.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-all shadow-md"
            >
              Sign In as Admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-300 flex overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#0d0d10] border-r border-white/10 flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30 shadow-2xl">
        <div>
          {/* Logo Header */}
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
                  Admin Panel
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                activeTab === "overview"
                  ? "bg-red-600 text-white shadow-md"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab("users")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                activeTab === "users"
                  ? "bg-red-600 text-white shadow-md"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>Users</span>
            </button>

            <div className="pt-3 pb-1 px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              Cinema Operations
            </div>

            <button
              onClick={() => setActiveTab("movies")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                activeTab === "movies"
                  ? "bg-red-600 text-white shadow-md"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Film className="w-4 h-4 shrink-0" />
              <span>Movies</span>
            </button>

            <button
              onClick={() => setActiveTab("halls")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                activeTab === "halls"
                  ? "bg-red-600 text-white shadow-md"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Tv className="w-4 h-4 shrink-0" />
              <span>Cinema Halls</span>
            </button>

            <button
              onClick={() => setActiveTab("showtimes")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                activeTab === "showtimes"
                  ? "bg-red-600 text-white shadow-md"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Showtimes</span>
            </button>

            <button
              onClick={() => setActiveTab("feedbacks")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                activeTab === "feedbacks"
                  ? "bg-red-600 text-white shadow-md"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>Feedbacks</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-white/10 space-y-1">
          <Link
            to="/"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Site</span>
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden bg-[#08080a]">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-white/10 bg-[#0d0d10] px-6 flex items-center shrink-0 z-20">
          <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight">
            {activeTab === "overview" && "Overview Dashboard"}
            {activeTab === "users" && "User Accounts & Role Permissions"}
            {activeTab === "movies" && "Movie Database Management"}
            {activeTab === "halls" && "Cinema Hall Seating Config"}
            {activeTab === "showtimes" && "Showtimes & Ticket Rates Planning"}
            {activeTab === "feedbacks" && "Audience Feedback Management"}
          </h2>
        </header>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto min-h-0 [scrollbar-gutter:stable] p-6 max-w-7xl w-full mx-auto space-y-6 animate-in fade-in duration-200">
          
          {/* Dashboard Overview */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Grid (Clean & Compact without icons) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. Users Count Card */}
                <div 
                  onClick={() => setActiveTab("users")}
                  className="bg-[#0d0d10] border border-white/10 hover:border-red-500/40 rounded-xl p-4 transition-all shadow-sm flex flex-col justify-between space-y-2.5 group cursor-pointer"
                >
                  <div>
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                      Total Users
                    </span>
                    <div className="text-2xl font-black text-white mt-0.5">
                      {loadingStats ? "..." : userCount ?? 0}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>+12% vs last month</span>
                  </div>
                </div>

                {/* 2. Movie Catalog Card */}
                <div 
                  onClick={() => setActiveTab("movies")}
                  className="bg-[#0d0d10] border border-white/10 hover:border-red-500/40 rounded-xl p-4 transition-all shadow-sm flex flex-col justify-between space-y-2.5 group cursor-pointer"
                >
                  <div>
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                      Catalog Movies
                    </span>
                    <div className="text-2xl font-black text-white mt-0.5">
                      {loadingStats ? "..." : movieCount ?? 0}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>+8% vs last month</span>
                  </div>
                </div>

                {/* 3. Showtimes & Halls Card */}
                <div 
                  onClick={() => setActiveTab("showtimes")}
                  className="bg-[#0d0d10] border border-white/10 hover:border-red-500/40 rounded-xl p-4 transition-all shadow-sm flex flex-col justify-between space-y-2.5 group cursor-pointer"
                >
                  <div>
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                      Scheduled Screenings
                    </span>
                    <div className="text-2xl font-black text-white mt-0.5">
                      {loadingStats ? "..." : showtimeCount ?? 0}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Across {hallCount ?? 0} cinema halls</span>
                  </div>
                </div>

              </div>

              {/* ── Line Chart & Recent Activity Grid (Matching Screenshot) ── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Line Chart (2 Cols) */}
                <div className="lg:col-span-2">
                  <LineChartAnalytics showtimes={showtimesList} bookings={bookingsList} movies={moviesList} />
                </div>

                {/* Recently Registered Users Activity (1 Col, Matching Screenshot) */}
                <div className="bg-[#0d0d10] border border-white/10 rounded-2xl p-5 shadow-md flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Recent Users
                    </h4>
                    <button
                      onClick={() => setActiveTab("users")}
                      className="text-xs text-red-500 hover:text-red-400 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>View All</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {usersList.length === 0 ? (
                    <p className="text-xs text-zinc-500 italic py-6 text-center">No recent user activity.</p>
                  ) : (
                    <div className="divide-y divide-white/5 space-y-0.5">
                      {usersList.slice(0, 4).map((u, idx) => {
                        const avatarLetter = u.name ? u.name.charAt(0).toUpperCase() : 'U';
                        const avatarColors = [
                          'bg-zinc-800 text-zinc-200', 'bg-zinc-800 text-red-400', 'bg-zinc-800 text-emerald-400', 'bg-zinc-800 text-red-300'
                        ];
                        const avatarStyle = avatarColors[idx % avatarColors.length];

                        return (
                          <div key={u.id} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full ${avatarStyle} font-bold flex items-center justify-center text-xs border border-white/10 shrink-0 shadow-inner`}>
                              {avatarLetter}
                            </div>
                            <div className="space-y-0.5 min-w-0 flex-1">
                              <div className="text-xs sm:text-sm font-semibold text-white truncate">
                                {u.name} <span className="text-zinc-400 font-normal text-xs">registered</span>
                              </div>
                              <div className="text-[11px] text-zinc-400 truncate font-mono">
                                {u.email}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

              {/* ── Recently Added Movies & Cinema Halls Overview ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. Recently Added Movies */}
                <div className="bg-[#0d0d10] border border-white/10 rounded-xl p-5 shadow-md space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <Film className="w-4 h-4 text-red-500" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Recently Added Movies
                      </h4>
                    </div>
                    <button
                      onClick={() => setActiveTab("movies")}
                      className="text-xs text-red-500 hover:text-red-400 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>View All</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {moviesList.length === 0 ? (
                    <p className="text-xs text-zinc-500 italic py-6 text-center">No movies added yet.</p>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {moviesList.slice(0, 4).map((movie) => (
                        <div key={movie.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {movie.posterUrl ? (
                              <img 
                                src={movie.posterUrl} 
                                alt={movie.title} 
                                className="w-9 h-12 object-cover rounded-md border border-white/10 shrink-0 shadow-sm"
                              />
                            ) : (
                              <div className="w-9 h-12 bg-zinc-900 rounded-md border border-white/10 flex items-center justify-center text-zinc-500 shrink-0">
                                <Film className="w-4 h-4" />
                              </div>
                            )}
                            <div className="space-y-0.5 min-w-0">
                              <h5 className="font-semibold text-white text-xs sm:text-sm truncate uppercase tracking-tight">
                                {movie.title}
                              </h5>
                              <p className="text-[11px] text-zinc-400 truncate">
                                {movie.genres && movie.genres.length > 0 ? movie.genres.join("\\") : "Feature"}
                                {movie.duration && ` · ${movie.duration}`}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            <span className={`text-xs font-semibold ${
                              movie.status === "now_showing" ? "text-emerald-400" : "text-yellow-400"
                            }`}>
                              {movie.status === "now_showing" ? "Now Showing" : "Upcoming"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Recently Added Cinema Halls */}
                <div className="bg-[#0d0d10] border border-white/10 rounded-xl p-5 shadow-md space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <Tv className="w-4 h-4 text-red-500" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Recently Added Cinema Halls
                      </h4>
                    </div>
                    <button
                      onClick={() => setActiveTab("halls")}
                      className="text-xs text-red-500 hover:text-red-400 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>View All</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {hallsList.length === 0 ? (
                    <p className="text-xs text-zinc-500 italic py-6 text-center">No cinema halls configured yet.</p>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {hallsList.slice(0, 4).map((hall) => (
                        <div key={hall.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-zinc-900 text-red-500 font-bold flex items-center justify-center border border-white/10 text-xs shadow-md shrink-0">
                              <Tv className="w-4 h-4" />
                            </div>
                            <div className="space-y-0.5 min-w-0">
                              <h5 className="font-semibold text-white text-xs sm:text-sm truncate">
                                {hall.name}
                              </h5>
                              <p className="text-[11px] text-zinc-400">
                                {hall.screenType} · {hall.totalCapacity || 0} Seats
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            <span className="text-xs font-semibold text-emerald-400">
                              Active
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* User Accounts Registry Tab matching reference image */}
          {activeTab === "users" && (
            <div className="space-y-6">
              {/* Top Header Action */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Registered Users</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Manage customer and administrator access permissions</p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as any)}
                    className="bg-zinc-900 border border-white/10 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-red-500 transition-colors cursor-pointer"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">System Admins</option>
                    <option value="cinema_manager">Cinema Managers</option>
                    <option value="user">Regular Users</option>
                  </select>

                  <button
                    onClick={fetchUsers}
                    className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-red-500/50 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? "animate-spin text-red-500" : ""}`} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {usersError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  <span>{usersError}</span>
                </div>
              )}

              {/* Users Table Card */}
              <div className="bg-[#0d0d10] border border-white/10 rounded-xl overflow-hidden shadow-md">
                {/* Search Bar in header */}
                <div className="p-5 pb-4">
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent border border-white/15 text-white placeholder:text-zinc-500 text-xs sm:text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-red-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Table */}
                {loadingUsers ? (
                  <div className="p-12 text-center text-zinc-400 flex flex-col items-center gap-3">
                    <RefreshCw className="w-8 h-8 animate-spin text-red-500" />
                    <span className="text-xs">Loading registered users...</span>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-12 text-center text-zinc-500 flex flex-col items-center gap-2">
                    <Users className="w-10 h-10 text-zinc-700" />
                    <p className="text-sm font-semibold text-zinc-300">No users found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-t border-b border-white/10 text-xs font-semibold text-zinc-400">
                          <th className="px-6 py-3.5">User</th>
                          <th className="px-6 py-3.5">Role</th>
                          <th className="px-6 py-3.5">Status</th>
                          <th className="px-6 py-3.5">Joined</th>
                          <th className="px-6 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredUsers.map((u, idx) => {
                          const isSelf = u.id === user?.id;
                          const avatarLetter = u.name ? u.name.charAt(0).toUpperCase() : 'U';
                          const avatarColors = [
                            'bg-red-600', 'bg-zinc-700', 'bg-red-700', 'bg-zinc-800', 'bg-red-800'
                          ];
                          const avatarBg = avatarColors[idx % avatarColors.length];

                          return (
                            <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                              {/* User Info */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <div className={`w-9 h-9 rounded-full ${avatarBg} text-white font-bold flex items-center justify-center text-sm shadow-md`}>
                                    {avatarLetter}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-white text-sm">
                                      {u.name} {isSelf && <span className="text-[10px] text-red-400 ml-1.5">(You)</span>}
                                    </div>
                                    <div className="text-xs text-zinc-400">{u.email}</div>
                                  </div>
                                </div>
                              </td>

                              {/* Role */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                {isSelf ? (
                                  <span className="text-xs font-semibold text-red-500">
                                    Admin
                                  </span>
                                ) : (
                                  <select
                                    disabled={updatingId === u.id}
                                    value={u.role}
                                    onChange={(e) => handleRoleChange(u.id, u.name, e.target.value)}
                                    className="bg-transparent text-zinc-300 border border-white/10 text-xs rounded-md px-2 py-0.5 focus:outline-none focus:border-red-500 transition-colors cursor-pointer"
                                  >
                                    <option value="user" className="bg-zinc-900">User</option>
                                    <option value="cinema_manager" className="bg-zinc-900">Cinema Manager</option>
                                    <option value="admin" className="bg-zinc-900">Admin</option>
                                  </select>
                                )}
                              </td>

                              {/* Status */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-xs font-semibold text-emerald-400">
                                  Active
                                </span>
                              </td>

                              {/* Joined */}
                              <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-400">
                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US') : "5/23/2026"}
                              </td>

                              {/* Actions */}
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => addNotification({ message: 'User role edit option', type: 'info' })}
                                    className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                                    title="Edit User"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(u.id, u.name)}
                                    disabled={deletingId === u.id || isSelf}
                                    className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Delete User"
                                  >
                                    <Trash2 className="w-4 h-4" />
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
            </div>
          )}

          {/* Cinema Manager Integrations */}
          {activeTab === "movies" && <MovieManagePage />}
          {activeTab === "halls" && <HallManagePage />}
          {activeTab === "showtimes" && <ShowtimeManagePage />}
          {activeTab === "feedbacks" && <FeedbackManagePage />}

        </div>
      </main>
    </div>
  );
}
