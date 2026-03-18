"use client";

import { useState, useEffect } from "react";

import {
  Search,
  Shield,
  User,
  Clock,
  CheckCircle,
  Calendar,
  Mail
} from "lucide-react";
import { motion } from "framer-motion";

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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("ALL");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterType === "ALL" || user.type === filterType;

    return matchesSearch && matchesFilter;
  });

  return (
    <>
      {/* Header */}
      <div className="mb-12">
        <h1 className="font-main text-6xl md:text-8xl uppercase mb-4 leading-none">User <span className="text-primary">Management</span></h1>
        <p className="text-white/50 text-xl font-light">Manage all platform users</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/20 pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-white/5 border border-white/20 px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
        >
          <option value="ALL">All Users</option>
          <option value="USER">Regular Users</option>
          <option value="ARTIST">Artists</option>
          <option value="ARTIST_APPLICANT">Applicants</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] p-8">
          <div className="text-3xl font-bold mb-2">{users.length}</div>
          <div className="text-xs font-mono uppercase tracking-widest text-white/40">Total Users</div>
        </div>
        <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] p-8">
          <div className="text-3xl font-bold mb-2">{users.filter(u => u.type === 'ARTIST').length}</div>
          <div className="text-xs font-mono uppercase tracking-widest text-white/40">Artists</div>
        </div>
        <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] p-8">
          <div className="text-3xl font-bold mb-2">{users.filter(u => u.type === 'ARTIST_APPLICANT').length}</div>
          <div className="text-xs font-mono uppercase tracking-widest text-white/40">Applicants</div>
        </div>
        <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] p-8">
          <div className="text-3xl font-bold mb-2">{users.filter(u => u.type === 'ADMIN').length}</div>
          <div className="text-xs font-mono uppercase tracking-widest text-white/40">Admins</div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-8 py-6 border-b border-white/5 bg-black/50 text-xs font-mono uppercase tracking-widest text-white/40">
          <div className="col-span-3">User</div>
          <div className="col-span-3">Email</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Country</div>
          <div className="col-span-2">Joined</div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-white/40">
            No users found matching your criteria
          </div>
        ) : (
          filteredUsers.map((user) => (
            <UserRow key={user.id} user={user} />
          ))
        )}
      </div>

    </>
  );
}

const UserRow = ({ user }: { user: UserData }) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ADMIN': return 'text-red-400';
      case 'ARTIST': return 'text-primary';
      case 'ARTIST_APPLICANT': return 'text-yellow-400';
      default: return 'text-white/60';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ADMIN': return Shield;
      case 'ARTIST': return CheckCircle;
      case 'ARTIST_APPLICANT': return Clock;
      default: return User;
    }
  };

  const TypeIcon = getTypeIcon(user.type);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-12 gap-4 px-8 py-6 border-b border-white/5 hover:bg-white/[0.02] transition-colors group items-center"
    >
      <div className="col-span-3 flex items-center gap-3">
        <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-xs font-bold">
          {user.name.charAt(0)}
        </div>
        <div>
          <div className="font-medium text-white">{user.name} {user.surname}</div>
          <div className="text-xs text-white/40">@{user.username}</div>
        </div>
      </div>

      <div className="col-span-3 flex items-center">
        <div className="flex items-center gap-2">
          <Mail className="w-3 h-3 text-white/40" />
          <span className="text-sm text-white/70">{user.email}</span>
        </div>
      </div>

      <div className="col-span-2 flex items-center">
        <div className="flex items-center gap-2">
          <TypeIcon className={`w-4 h-4 ${getTypeColor(user.type)}`} />
          <span className={`text-sm font-bold uppercase tracking-wider ${getTypeColor(user.type)}`}>
            {user.type.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="col-span-2 flex items-center text-sm text-white/60">
        {user.country || '—'}
      </div>

      <div className="col-span-2 flex items-center">
        <div className="flex items-center gap-2">
          <Calendar className="w-3 h-3 text-white/40" />
          <span className="text-sm text-white/60">
            {new Date(user.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
};