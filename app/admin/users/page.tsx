"use client";

import { useState, useEffect, useCallback } from "react";
import { authenticatedFetch } from "@/lib/auth";
import {
  Search,
  Shield,
  User,
  Clock,
  CheckCircle,
  Calendar,
  Mail,
  Trash2,
  AlertTriangle,
  X,
  Loader2,
  Globe,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UserData {
  id: string;
  username: string;
  email: string;
  name: string;
  surname: string;
  type: string;
  country: string;
  createdAt: string;
  approvedAt: string | null;
}

const itemVar = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<UserData | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await authenticatedFetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const response = await authenticatedFetch("/api/admin/users", {
        method: "DELETE",
        body: JSON.stringify({ userId: deleteTarget.id }),
      });

      const data = await response.json();

      if (response.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
        setToast({ message: data.message || "User removed successfully.", type: "success" });
      } else {
        setToast({ message: data.error || "Failed to delete user.", type: "error" });
      }
    } catch {
      setToast({ message: "Network error. Please try again.", type: "error" });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterType === "ALL" || user.type === filterType;

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: users.length,
    regular: users.filter((u) => u.type === "USER").length,
    artists: users.filter((u) => u.type === "ARTIST").length,
    admins: users.filter((u) => u.type === "ADMIN").length,
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-12 pt-8">
        <h1 className="font-main text-6xl md:text-8xl uppercase mb-3 leading-none">
          User <span className="text-primary">Management</span>
        </h1>
        <p className="text-white/50 text-lg font-light">
          View all registered accounts. Remove users who violate platform guidelines.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <StatBlock label="Total Accounts" value={stats.total} color="text-white" />
        <StatBlock label="Regular Users" value={stats.regular} color="text-white/60" />
        <StatBlock label="Producers" value={stats.artists} color="text-primary" />
        <StatBlock label="Administrators" value={stats.admins} color="text-red-400" />
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1 group">
          <Search className="absolute left-0 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search by name, email, or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-b border-white/10 pl-8 pr-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-primary transition-colors font-mono text-sm"
          />
        </div>
        <div className="flex gap-2">
          {["ALL", "USER", "ARTIST", "ADMIN"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                filterType === type
                  ? "bg-white text-black"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {type === "ALL" ? "All" : type === "ARTIST" ? "Producer" : type === "ADMIN" ? "Admin" : "User"}
            </button>
          ))}
        </div>
      </div>

      {/* Table Header */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-8 pb-4 text-[10px] font-mono text-white/30 uppercase tracking-widest">
        <div className="col-span-3">User</div>
        <div className="col-span-3">Email</div>
        <div className="col-span-2">Role</div>
        <div className="col-span-1">Country</div>
        <div className="col-span-2">Joined</div>
        <div className="col-span-1 text-right">Action</div>
      </div>

      {/* Users List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={filterType + searchQuery}
          initial="hidden"
          animate="show"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.03 } } }}
          className="space-y-2"
        >
          {filteredUsers.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
              <p className="font-mono text-white/30 uppercase tracking-widest text-sm">No users found</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <UserRow key={user.id} user={user} onDelete={setDeleteTarget} />
            ))
          )}
        </motion.div>
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => !deleting && setDeleteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-900 border border-white/10 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-red-500/10 rounded-2xl">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="font-main text-2xl uppercase text-white">Remove User</h3>
                  <p className="text-white/40 text-sm">This action cannot be undone.</p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-sm font-bold">
                    {deleteTarget.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white font-medium">{deleteTarget.name} {deleteTarget.surname}</div>
                    <div className="text-white/40 text-xs font-mono">@{deleteTarget.username}</div>
                  </div>
                </div>
                <div className="text-white/50 text-xs mt-2">{deleteTarget.email}</div>
              </div>

              <p className="text-white/60 text-sm mb-8 leading-relaxed">
                This will permanently delete <strong className="text-white">{deleteTarget.name}</strong>&apos;s account,
                including all messages, sessions, and application data. They will receive a notification email.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="flex-1 py-3 bg-white/5 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={deleting}
                  className="flex-1 py-3 bg-red-500 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Removing...</>
                  ) : (
                    <><Trash2 className="w-4 h-4" /> Remove User</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-8 right-8 z-[300] px-6 py-4 rounded-2xl border flex items-center gap-3 shadow-2xl ${
              toast.type === "success"
                ? "bg-green-500/10 border-green-500/20 text-green-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 opacity-50 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// --- Sub-components ---

const StatBlock = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] p-8">
    <div className={`text-3xl font-bold mb-2 ${color}`}>{value}</div>
    <div className="text-xs font-mono uppercase tracking-widest text-white/40">{label}</div>
  </div>
);

const UserRow = ({ user, onDelete }: { user: UserData; onDelete: (user: UserData) => void }) => {
  const getTypeStyle = (type: string) => {
    switch (type) {
      case "ADMIN": return { color: "text-red-400 bg-red-500/10 border-red-500/20", icon: Shield, label: "Admin" };
      case "ARTIST": return { color: "text-primary bg-primary/10 border-primary/20", icon: CheckCircle, label: "Producer" };
      default: return { color: "text-white/60 bg-white/5 border-white/10", icon: User, label: "User" };
    }
  };

  const style = getTypeStyle(user.type);
  const TypeIcon = style.icon;

  return (
    <motion.div
      variants={itemVar}
      className="group grid grid-cols-1 md:grid-cols-12 gap-4 px-8 py-5 bg-zinc-900/40 border border-white/5 hover:border-white/15 hover:bg-white/[0.03] transition-all items-center rounded-[2rem]"
    >
      {/* User */}
      <div className="col-span-12 md:col-span-3 flex items-center gap-3">
        <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
          {user.name.charAt(0)}
        </div>
        <div className="overflow-hidden">
          <div className="font-medium text-white text-sm truncate">{user.name} {user.surname}</div>
          <div className="text-[10px] text-white/40 font-mono truncate">@{user.username}</div>
        </div>
      </div>

      {/* Email */}
      <div className="col-span-6 md:col-span-3 flex items-center gap-2 overflow-hidden">
        <Mail className="w-3 h-3 text-white/30 shrink-0" />
        <span className="text-sm text-white/60 truncate">{user.email}</span>
      </div>

      {/* Role */}
      <div className="col-span-6 md:col-span-2">
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${style.color}`}>
          <TypeIcon className="w-3 h-3" />
          <span className="text-[10px] font-bold uppercase tracking-wider">{style.label}</span>
        </div>
      </div>

      {/* Country */}
      <div className="col-span-4 md:col-span-1 flex items-center gap-1 text-sm text-white/50">
        <Globe className="w-3 h-3 opacity-50" />
        <span className="truncate">{user.country || "—"}</span>
      </div>

      {/* Joined */}
      <div className="col-span-4 md:col-span-2 flex items-center gap-2">
        <Calendar className="w-3 h-3 text-white/30" />
        <span className="text-sm text-white/50">{new Date(user.createdAt).toLocaleDateString()}</span>
      </div>

      {/* Action */}
      <div className="col-span-4 md:col-span-1 flex justify-end">
        {user.type !== "ADMIN" && (
          <button
            onClick={() => onDelete(user)}
            className="p-2 rounded-xl text-white/10 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
            title="Remove user"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
};