"use client";

import { useState, useEffect } from "react";
import {
  Users,
  FileText,
  Radio,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  ArrowUpRight,
  Loader2,
  Settings
} from "lucide-react";
import { motion, Variants } from "framer-motion";
import Link from "next/link";

interface DashboardStats {
  totalUsers: number;
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  activeNews: number;
  totalNews: number;
  recentActivity: ActivityItem[];
}

interface ActivityItem {
  id: string;
  type: 'APPLICATION_SUBMITTED' | 'APPLICATION_APPROVED' | 'APPLICATION_REJECTED' | 'NEWS_CREATED' | 'USER_REGISTERED';
  description: string;
  timestamp: string;
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  trend: string;
  color: "primary" | "yellow" | "green" | "blue";
}

interface ActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  urgent?: boolean;
}

const containerVar: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVar: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 pt-8">
      {/* Header */}
      <div>
        <h1 className="font-main text-6xl md:text-7xl uppercase leading-[0.85] mb-2">
          Admin <span className="text-primary">Console</span>
        </h1>
        <p className="text-white/40 font-light text-lg">System overview and control.</p>
      </div>

      <motion.div
        variants={containerVar}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
      >
        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 flex flex-col gap-12">

          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Users"
              value={stats?.totalUsers?.toString() || "0"}
              icon={Users}
              trend="Platform members"
              color="primary"
            />
            <StatCard
              title="Applications"
              value={stats?.totalApplications?.toString() || "0"}
              icon={FileText}
              trend={`${stats?.pendingApplications || 0} pending`}
              color="yellow"
            />
            <StatCard
              title="Active News"
              value={stats?.activeNews?.toString() || "0"}
              icon={Radio}
              trend={`${stats?.totalNews || 0} total`}
              color="green"
            />
            <StatCard
              title="Approval Rate"
              value={stats?.totalApplications ?
                Math.round((stats.approvedApplications / stats.totalApplications) * 100) + "%" : "0%"}
              icon={TrendingUp}
              trend="All time metric"
              color="blue"
            />
          </div>

          {/* Quick Actions Base */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-main text-2xl uppercase tracking-wider text-white">Platform Modules</h2>
              <Settings className="w-4 h-4 text-white/30" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ActionCard
                title="Review Requests"
                description="Process pending producer applications"
                href="/admin/applications"
                icon={FileText}
                badge={stats?.pendingApplications?.toString()}
                urgent={(stats?.pendingApplications ?? 0) > 0}
              />
              <ActionCard
                title="Manage Users"
                description="View and moderate platform members"
                href="/admin/users"
                icon={Users}
              />
              <ActionCard
                title="News Center"
                description="Publish announcements and updates"
                href="/admin/news"
                icon={Radio}
              />
              <ActionCard
                title="Verified Network"
                description="Manage approved producers"
                href="/admin/producers"
                icon={Shield}
              />
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 flex flex-col h-full">
          <motion.div variants={itemVar} className="bg-zinc-900/40 border border-white/5 rounded-[2rem] p-8 flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-8">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="font-main text-xl uppercase tracking-wider">Event Stream</h3>
            </div>

            <div className="space-y-6 flex-1">
              {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                stats.recentActivity.slice(0, 5).map((activity) => (
                  <ActivityItemComponent key={activity.id} activity={activity} />
                ))
              ) : (
                <div className="text-center py-16 flex flex-col items-center">
                  <Clock className="w-8 h-8 text-white/10 mb-4" />
                  <p className="text-white/40 text-sm font-mono uppercase tracking-widest">Awaiting Events</p>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-white/5">
              <div className="flex justify-between items-center text-xs font-mono uppercase tracking-widest">
                <span className="text-white/40">API Status</span>
                <span className="text-green-400 font-bold bg-green-400/10 px-2 py-1 rounded-md">Online</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

// --- Sub-components ---

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, color }) => {
  const colorMap = {
    primary: "text-primary bg-primary/10",
    yellow: "text-yellow-400 bg-yellow-400/10",
    green: "text-green-400 bg-green-400/10",
    blue: "text-blue-400 bg-blue-400/10"
  };

  const textColorMap = {
    primary: "text-primary",
    yellow: "text-yellow-400",
    green: "text-green-400",
    blue: "text-blue-400"
  };

  return (
    <motion.div
      variants={itemVar}
      className="bg-zinc-900/40 border border-white/5 p-6 rounded-[2rem] hover:border-white/20 hover:bg-white/[0.04] transition-all flex flex-col gap-4"
    >
      <div className={`p-3 rounded-2xl w-fit ${colorMap[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-3xl font-main mb-1 text-white">{value}</div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-white/50 mb-4">{title}</div>
        <div className={`text-[10px] font-bold uppercase tracking-widest ${textColorMap[color]}`}>{trend}</div>
      </div>
    </motion.div>
  );
};

const ActionCard: React.FC<ActionCardProps> = ({ title, description, href, icon: Icon, badge, urgent }) => (
  <Link href={href} className="block group w-full">
    <motion.div variants={itemVar} className="bg-zinc-900/40 border border-white/5 rounded-[2rem] p-6 hover:border-white/20 hover:bg-white/[0.04] transition-all relative overflow-hidden h-full">
      <div className="flex items-start gap-4 relaitve z-10">
        <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-primary/20 group-hover:text-primary transition-colors text-white/50">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold uppercase tracking-wide text-white group-hover:text-primary transition-colors text-sm">
              {title}
            </h3>
            {badge && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${urgent ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-white/10 text-white/60'}`}>
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-white/40 leading-relaxed max-w-[90%]">{description}</p>
        </div>
        <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-primary transition-colors shrink-0" />
      </div>
    </motion.div>
  </Link>
);

const ActivityItemComponent: React.FC<{ activity: ActivityItem }> = ({ activity }) => {
  const getActivityIconAndColor = (type: string) => {
    switch (type) {
      case 'APPLICATION_SUBMITTED': return { icon: FileText, color: "text-yellow-400" };
      case 'APPLICATION_APPROVED': return { icon: CheckCircle, color: "text-green-400" };
      case 'APPLICATION_REJECTED': return { icon: XCircle, color: "text-red-400" };
      case 'NEWS_CREATED': return { icon: Radio, color: "text-blue-400" };
      case 'USER_REGISTERED': return { icon: Users, color: "text-primary" };
      default: return { icon: Activity, color: "text-white/40" };
    }
  };

  const { icon: Icon, color } = getActivityIconAndColor(activity.type);

  return (
    <div className="flex items-start gap-4">
      <div className={`mt-0.5 p-2 rounded-xl bg-white/5 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-light text-white/80 leading-relaxed">
          {activity.description}
        </p>
        <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mt-1">
          {new Date(activity.timestamp).toLocaleString()}
        </p>
      </div>
    </div>
  );
};
