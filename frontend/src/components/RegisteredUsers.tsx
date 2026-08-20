import { useState, useEffect, useMemo } from "react";
import { Users, ShieldCheck, UserCheck, RefreshCw, Search, AlertCircle, Calendar, Mail, User as UserIcon, Sparkles } from "lucide-react";
import { User } from "../types/auth";
import { useAuth } from "../context/AuthContext";
import { getRegisteredUsers } from "../services/userApi";

// Export getRegisteredUsers helper function
export { getRegisteredUsers };

function RegisteredUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchUsers = async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await getRegisteredUsers(token);
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "Failed to load registered users.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.id.toLowerCase().includes(q);

      const matchesRole = roleFilter === "all" || user.role.toLowerCase() === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role === "admin").length;
    const customers = users.filter((u) => u.role !== "admin").length;
    return { total, admins, customers };
  }, [users]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recently";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-surface-container/90 backdrop-blur-xl border border-outline-variant/60 rounded-3xl p-6 shadow-2xl space-y-6 text-on-background font-sans max-w-5xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/40 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-on-background flex items-center gap-2">
              Registered Users
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/20 text-primary border border-primary/30">
                {stats.total}
              </span>
            </h2>
            <p className="text-xs text-on-surface-variant">
              Live backend registry of all system user accounts & administrators
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchUsers(true)}
          disabled={isRefreshing || isLoading}
          className="px-4 py-2 bg-surface-container-high hover:bg-surface-variant border border-outline-variant/60 rounded-2xl text-xs font-medium text-on-surface hover:text-primary transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 self-start sm:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
          {isRefreshing ? "Refreshing..." : "Refresh Users"}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface-container-low/80 border border-outline-variant/40 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-on-surface-variant tracking-wider">Total Users</div>
            <div className="text-lg font-bold text-on-background">{stats.total}</div>
          </div>
        </div>

        <div className="bg-surface-container-low/80 border border-outline-variant/40 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-on-surface-variant tracking-wider">Admins</div>
            <div className="text-lg font-bold text-purple-300">{stats.admins}</div>
          </div>
        </div>

        <div className="bg-surface-container-low/80 border border-outline-variant/40 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-on-surface-variant tracking-wider">Customers</div>
            <div className="text-lg font-bold text-emerald-300">{stats.customers}</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or user ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-2xl text-xs text-on-background placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-surface-container-low p-1 rounded-2xl border border-outline-variant/60 self-start">
          <button
            onClick={() => setRoleFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              roleFilter === "all"
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            All ({users.length})
          </button>
          <button
            onClick={() => setRoleFilter("admin")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              roleFilter === "admin"
                ? "bg-purple-500 text-white shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Admins
          </button>
          <button
            onClick={() => setRoleFilter("user")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              roleFilter === "user"
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Users
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-2xl text-xs">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <div className="flex-1">{error}</div>
          <button
            onClick={() => fetchUsers()}
            className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/40 rounded-xl text-xs font-medium cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Users List */}
      {isLoading ? (
        <div className="space-y-3 py-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-surface-container-low rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-outline-variant/50 rounded-2xl space-y-2">
          <Users className="w-10 h-10 text-on-surface-variant/40 mx-auto" />
          <div className="text-sm font-semibold text-on-surface">No registered users found</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/40 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">User ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30 text-xs">
              {filteredUsers.map((user) => {
                const isAdmin = user.role === "admin";
                return (
                  <tr key={user.id} className="hover:bg-surface-variant/40 transition-colors group">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0 border ${
                            isAdmin
                              ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                              : "bg-primary/20 text-primary border-primary/30"
                          }`}
                        >
                          {user.name ? user.name.substring(0, 2) : <UserIcon className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-on-background truncate group-hover:text-primary transition-colors">
                            {user.name}
                          </div>
                          <div className="text-[11px] text-on-surface-variant flex items-center gap-1 truncate">
                            <Mail className="w-3 h-3 shrink-0" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          isAdmin
                            ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
                            : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                        }`}
                      >
                        {isAdmin ? <ShieldCheck className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                        {user.role || "user"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-on-surface-variant">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Calendar className="w-3.5 h-3.5 shrink-0 opacity-70" />
                        {formatDate(user.createdAt)}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono text-[11px] px-2 py-1 bg-surface-container-high rounded-md text-on-surface-variant">
                        {user.id}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default RegisteredUsers;
