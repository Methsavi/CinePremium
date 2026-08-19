import { useState, useEffect } from "react";
import { getRegisteredUsers, deleteUser } from "../../../services/userApi";
import { User } from "../../../types/auth";
import { Users, Trash2, Search, UserCheck, ShieldAlert, RefreshCw } from "lucide-react";

function RegisteredUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getRegisteredUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${name}"?`)) return;

    try {
      setDeletingId(id);
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setActionSuccess(`User "${name}" deleted successfully.`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#151b2d] p-4 rounded-xl border border-[#2e3447]">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#908fa0]" />
          <input
            type="text"
            placeholder="Search users by name, email, role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0c1324] border border-[#2e3447] text-[#dce1fb] placeholder-[#908fa0] text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-[#c0c1ff] transition-colors"
          />
        </div>
        
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-[#191f31] hover:bg-[#2e3447] text-[#dce1fb] border border-[#2e3447] rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh List
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm flex items-center gap-2">
          <UserCheck className="w-4 h-4" />
          {actionSuccess}
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg text-sm flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-[#151b2d] rounded-xl border border-[#2e3447] overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-[#908fa0] flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-[#c0c1ff]" />
            <span>Loading registered users...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-[#908fa0] flex flex-col items-center gap-2">
            <Users className="w-10 h-10 text-[#464554]" />
            <p className="text-base font-medium">No users found</p>
            <p className="text-xs text-[#908fa0]">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0c1324] border-b border-[#2e3447] text-xs font-semibold text-[#908fa0] uppercase tracking-wider">
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Created At</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2e3447]">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#191f31]/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#2e3447] text-[#c0c1ff] font-bold flex items-center justify-center border border-[#464554] text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-[#dce1fb]">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#c7c4d7]">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          user.role === "admin"
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-[#908fa0]">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleDelete(user.id, user.name)}
                        disabled={deletingId === user.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {deletingId === user.id ? "Deleting..." : "Delete"}
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
  );
}

export default RegisteredUsers;