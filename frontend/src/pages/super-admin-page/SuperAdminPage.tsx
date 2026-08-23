import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import MovieManagePage from "../admin-page/components/MovieManagePage";
import HallManagePage from "../admin-page/components/HallManagePage";
import ShowtimeManagePage from "../admin-page/components/ShowtimeManagePage";
import { getMovies } from "../../services/movieApi";
import { getHalls } from "../../services/hallApi";
import { getShowtimes } from "../../services/showtimeApi";
import { getRegisteredUsers, deleteUser, updateUser } from "../../services/userApi";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import { User } from "../../types/auth";
import logo from "../../assets/logo.png";
import { 
  Users, Film, Tv, Calendar, ArrowLeft, LayoutDashboard, 
  LogOut, ShieldAlert, RefreshCw, Search, Trash2, 
  UserCheck, ShieldCheck, ChevronRight
} from "lucide-react";

type ActiveTab = "overview" | "users" | "movies" | "halls" | "showtimes";

export default function SuperAdminPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, token, isLoading: authLoading, logout } = useAuth();
  const { addNotification } = useNotification();
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  
  // Stats states
  const [userCount, setUserCount] = useState<number | null>(null);
  const [managerCount, setManagerCount] = useState<number | null>(null);
  const [adminCount, setAdminCount] = useState<number | null>(null);
  const [movieCount, setMovieCount] = useState<number | null>(null);
  const [hallCount, setHallCount] = useState<number | null>(null);
  const [showtimeCount, setShowtimeCount] = useState<number | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Users management states
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "cinema_manager" | "user">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const [users, movies, halls, showtimes] = await Promise.all([
        getRegisteredUsers(token).catch(() => []),
        getMovies().catch(() => []),
        getHalls().catch(() => []),
        getShowtimes().catch(() => [])
      ]);
      
      setUserCount(users.length);
      setAdminCount(users.filter(u => u.role === "admin").length);
      setManagerCount(users.filter(u => u.role === "cinema_manager").length);
      
      setMovieCount(movies.length);
      setHallCount(halls.length);
      setShowtimeCount(showtimes.length);
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
      alert("You cannot delete your own site administrator account.");
      return;
    }
    if (!window.confirm(`Are you sure you want to delete user "${targetName}"?`)) return;

    try {
      setDeletingId(targetId);
      await deleteUser(targetId, token);
      setUsersList(prev => prev.filter(u => u.id !== targetId));
      
      // Update statistics
      setUserCount(prev => prev !== null ? prev - 1 : null);
      
      setActionSuccess(`User "${targetName}" deleted successfully.`);
      setTimeout(() => setActionSuccess(null), 4000);

      addNotification({
        type: 'delete',
        title: 'User Account Deleted 🗑️',
        message: `Account for "${targetName}" was permanently removed.`,
        actionUrl: '/super-admin',
        actionLabel: 'View Users'
      });
    } catch (err: any) {
      alert(err.message || "Failed to delete user");
      addNotification({
        type: 'error',
        title: 'User Deletion Failed',
        message: err.message || "Failed to delete user."
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleRoleChange = async (targetId: string, targetName: string, newRole: string) => {
    if (targetId === user?.id) {
      alert("You cannot demote or modify your own site administrator role.");
      return;
    }
    try {
      setUpdatingId(targetId);
      await updateUser(targetId, { role: newRole }, token);
      setUsersList(prev => prev.map(u => u.id === targetId ? { ...u, role: newRole } : u));
      
      // Update counts
      loadStats();

      setActionSuccess(`Successfully updated "${targetName}" role to ${newRole}.`);
      setTimeout(() => setActionSuccess(null), 4000);

      addNotification({
        type: 'info',
        title: 'User Role Promoted / Updated 🛡️',
        message: `User "${targetName}" has been assigned the "${newRole}" role.`,
        actionUrl: '/super-admin',
        actionLabel: 'View Users'
      });
    } catch (err: any) {
      alert(err.message || "Failed to change user role");
      addNotification({
        type: 'error',
        title: 'Role Update Failed',
        message: err.message || "Failed to change user role."
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
      <div className="min-h-screen bg-[#0c1324] text-[#dce1fb] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-[#c7c4d7]">Verifying site admin credentials...</span>
        </div>
      </div>
    );
  }

  // Guard access restriction
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#0c1324] text-[#dce1fb] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#151b2d] border border-rose-500/20 rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center text-rose-400 mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Access Restricted</h2>
            <p className="text-sm text-[#908fa0] leading-relaxed">
              This panel is restricted to authorized <strong>Site System Admins</strong> only. Your account does not have admin privileges.
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
              Sign In as Admin
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
          <div className="h-20 px-5 border-b border-[#2e3447] flex items-center gap-3 bg-[#0c1324]">
            <img 
              src={logo} 
              alt="CinePremium Logo" 
              className="w-9 h-9 object-contain drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]" 
            />
            <div className="min-w-0">
              <h1 className="text-sm font-black tracking-tight text-white font-display truncate">
                CinePremium
              </h1>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-purple-400 font-black uppercase tracking-wider">
                  Admin Panel
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                activeTab === "overview"
                  ? "bg-purple-500/10 text-purple-300 border border-purple-500/20"
                  : "text-on-surface-variant hover:text-white hover:bg-surface-variant/40 border border-transparent"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0 text-purple-400" />
              Overview Dashboard
            </button>

            <button
              onClick={() => setActiveTab("users")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                activeTab === "users"
                  ? "bg-purple-500/10 text-purple-300 border border-purple-500/20"
                  : "text-on-surface-variant hover:text-white hover:bg-surface-variant/40 border border-transparent"
              }`}
            >
              <Users className="w-4 h-4 shrink-0 text-purple-400" />
              User Accounts Registry
            </button>

            <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-[#464554] uppercase tracking-wider">
              Cinema Manager Functions
            </div>

            <button
              onClick={() => setActiveTab("movies")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                activeTab === "movies"
                  ? "bg-purple-500/10 text-purple-300 border border-purple-500/20"
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
                  ? "bg-purple-500/10 text-purple-300 border border-purple-500/20"
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
                  ? "bg-purple-500/10 text-purple-300 border border-purple-500/20"
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
              {activeTab === "overview" && "System Administration Overview"}
              {activeTab === "users" && "User Accounts & Role Permissions"}
              {activeTab === "movies" && "Movie Database Management"}
              {activeTab === "halls" && "Cinema Hall Seating Config"}
              {activeTab === "showtimes" && "Showtimes & Ticket Rates Planning"}
            </h2>
            <p className="text-[11px] text-[#908fa0]">
              Super Admin clearance granted to <span className="text-purple-400 font-semibold">{user.name}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#151b2d] border border-[#2e3447] rounded-xl px-3 py-1.5 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center text-xs border border-purple-500/30">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-white">{user.name}</span>
              <span className="text-[9px] font-bold bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded uppercase border border-purple-500/20">Super Admin</span>
            </div>
          </div>
        </header>

        {/* Content Container (Reveals active view) */}
        <div className="flex-1 p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          
          {/* Dashboard Overview */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Welcome Banner */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#19152d] via-[#1c1931] to-[#23293c] p-8 border border-purple-500/20 shadow-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="relative z-10 space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                    System Administrator Clearance Level 3
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Welcome back, {user.name}!</h3>
                  <p className="text-sm text-[#c7c4d7] max-w-2xl leading-relaxed">
                    This is the Super Admin control panel. From here, you can oversee all users, change access levels (e.g. promoting accounts to Cinema Manager), and manage movies, halls, and showtimes.
                  </p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Users Count Card */}
                <div className="bg-[#0c1324] border border-[#2e3447] hover:border-purple-500/40 rounded-2xl p-6 transition-all shadow-lg flex items-center justify-between group">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-[#908fa0] uppercase tracking-wider">Registered Accounts</span>
                    <div className="text-3xl font-black text-white">
                      {loadingStats ? "..." : userCount ?? 0}
                    </div>
                    <div className="text-[10px] text-[#908fa0] flex gap-2">
                      <span className="text-purple-300 font-semibold">{adminCount ?? 0} Admins</span>
                      <span>•</span>
                      <span className="text-indigo-300 font-semibold">{managerCount ?? 0} Managers</span>
                    </div>
                    <button 
                      onClick={() => setActiveTab("users")}
                      className="text-xs text-purple-400 font-semibold hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                    >
                      Manage platform users
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

                {/* Movie Catalog Card */}
                <div className="bg-[#0c1324] border border-[#2e3447] hover:border-purple-500/40 rounded-2xl p-6 transition-all shadow-lg flex items-center justify-between group">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-[#908fa0] uppercase tracking-wider">Catalog Films</span>
                    <div className="text-3xl font-black text-white">
                      {loadingStats ? "..." : movieCount ?? 0}
                    </div>
                    <button 
                      onClick={() => setActiveTab("movies")}
                      className="text-xs text-purple-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Edit movies data
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <Film className="w-6 h-6" />
                  </div>
                </div>

                {/* Showtimes & Halls Card */}
                <div className="bg-[#0c1324] border border-[#2e3447] hover:border-purple-500/40 rounded-2xl p-6 transition-all shadow-lg flex items-center justify-between group">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-[#908fa0] uppercase tracking-wider">System Showtimes</span>
                    <div className="text-3xl font-black text-white">
                      {loadingStats ? "..." : showtimeCount ?? 0}
                    </div>
                    <div className="text-[10px] text-[#908fa0]">
                      Across {hallCount ?? 0} cinema halls
                    </div>
                    <button 
                      onClick={() => setActiveTab("showtimes")}
                      className="text-xs text-purple-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      View schedule projection
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>

              </div>

              {/* Admin Alerts */}
              <div className="bg-[#151b2d] border border-[#2e3447] rounded-2xl p-6 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  Security & Permission Policies
                </h4>
                <ul className="text-xs text-[#908fa0] space-y-3">
                  <li className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                    <span><strong>User Management:</strong> Changing a user's role grants them immediate workspace clearance. Use caution when promoting accounts to Site Admin.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                    <span><strong>Deleting Accounts:</strong> Removing accounts deletes their profiling metadata but maintains historical booking identifiers for transaction safety.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                    <span><strong>Manager Integrations:</strong> You have override permissions to insert cinema halls, movies, and calendar bookings without requiring separate manager logins.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* User Accounts Registry */}
          {activeTab === "users" && (
            <div className="space-y-6">
              {/* Search & Actions Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#151b2d] p-4 rounded-xl border border-[#2e3447]">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#908fa0]" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#0c1324] border border-[#2e3447] text-[#dce1fb] placeholder-[#908fa0] text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-purple-400 transition-colors"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as any)}
                    className="bg-[#191f31] border border-[#2e3447] text-[#dce1fb] text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400 transition-colors cursor-pointer"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">System Admins</option>
                    <option value="cinema_manager">Cinema Managers</option>
                    <option value="user">Regular Users</option>
                  </select>

                  <button
                    onClick={fetchUsers}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-[#191f31] hover:bg-[#2e3447] text-[#dce1fb] border border-[#2e3447] rounded-lg transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingUsers ? "animate-spin" : ""}`} />
                    Refresh
                  </button>
                </div>
              </div>

              {actionSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  {actionSuccess}
                </div>
              )}

              {usersError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg text-sm flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  {usersError}
                </div>
              )}

              {/* Users Table */}
              <div className="bg-[#151b2d] rounded-xl border border-[#2e3447] overflow-hidden shadow-xl">
                {loadingUsers ? (
                  <div className="p-12 text-center text-[#908fa0] flex flex-col items-center gap-3">
                    <RefreshCw className="w-8 h-8 animate-spin text-purple-400" />
                    <span>Loading registered users...</span>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-12 text-center text-[#908fa0] flex flex-col items-center gap-2">
                    <Users className="w-10 h-10 text-[#464554]" />
                    <p className="text-base font-medium">No users found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#0c1324] border-b border-[#2e3447] text-xs font-semibold text-[#908fa0] uppercase tracking-wider">
                          <th className="px-6 py-3.5">User</th>
                          <th className="px-6 py-3.5">Email</th>
                          <th className="px-6 py-3.5">Role / Permission</th>
                          <th className="px-6 py-3.5">Created At</th>
                          <th className="px-6 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2e3447]">
                        {filteredUsers.map((u) => {
                          const isSelf = u.id === user?.id;
                          return (
                            <tr key={u.id} className="hover:bg-[#191f31]/50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <div className={`w-9 h-9 rounded-full font-bold flex items-center justify-center border text-sm ${
                                    u.role === "admin" 
                                      ? "bg-purple-500/20 text-purple-300 border-purple-500/30" 
                                      : u.role === "cinema_manager"
                                      ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                                      : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                                  }`}>
                                    {u.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="font-medium text-[#dce1fb]">{u.name} {isSelf && <span className="text-[10px] text-purple-400 ml-1.5 bg-purple-500/10 px-1 rounded">(You)</span>}</div>
                                    <div className="text-[10px] text-[#908fa0] font-mono">ID: {u.id}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-[#c7c4d7]">
                                {u.email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {isSelf ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                    System Admin
                                  </span>
                                ) : (
                                  <select
                                    disabled={updatingId === u.id}
                                    value={u.role}
                                    onChange={(e) => handleRoleChange(u.id, u.name, e.target.value)}
                                    className="bg-[#0c1324] border border-[#2e3447] text-[#dce1fb] text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-purple-400 transition-colors cursor-pointer"
                                  >
                                    <option value="user">Regular User</option>
                                    <option value="cinema_manager">Cinema Manager</option>
                                    <option value="admin">Site Admin</option>
                                  </select>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-xs text-[#908fa0]">
                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                <button
                                  onClick={() => handleDeleteUser(u.id, u.name)}
                                  disabled={deletingId === u.id || isSelf}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                  title="Delete Account"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  {deletingId === u.id ? "Deleting..." : "Delete"}
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
            </div>
          )}

          {/* Cinema Manager Integrations */}
          {activeTab === "movies" && <MovieManagePage />}
          {activeTab === "halls" && <HallManagePage />}
          {activeTab === "showtimes" && <ShowtimeManagePage />}

        </div>
      </main>
    </div>
  );
}
