"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { getAuthUser } from "@/lib/auth";
import { motion, Variants } from "framer-motion";
import Layout from "@/components/Layout";
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

interface ApplicationStatusItemProps {
  label: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  color: "yellow" | "green" | "red";
}

interface HealthMetricProps {
  label: string;
  status: string;
  uptime: string;
  healthy: boolean;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6,
      ease: [0.6, 0.05, 0.01, 0.9]
    } 
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { 
      staggerChildren: 0.1 
    } 
  }
};

export default function AdminDashboardPage() {
  const router = useRouter();
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
    const user = getAuthUser();
    if (!user || user.type !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    fetchDashboardData();
  }, [router]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="text-xs font-mono tracking-widest text-white/50">LOADING DASHBOARD...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-black text-white font-sans selection:bg-primary selection:text-black relative overflow-hidden">
        
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
          <div className="absolute top-[-20%] left-[-20%] w-[50vw] h-[50vw] bg-primary/3 rounded-full blur-[200px]" />
          <div className="absolute bottom-[-20%] right-[-20%] w-[40vw] h-[40vw] bg-white/2 rounded-full blur-[150px]" />
        </div>

        <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-12">

          {/* Header */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="mb-16"
          >
            <div className="flex items-center gap-4 mb-6">
              <Shield className="w-12 h-12 text-primary" />
              <div>
                <h1 className="font-main text-6xl md:text-8xl uppercase leading-[0.9] mb-2">
                  Admin <span className="text-primary">Control</span>
                </h1>
                <p className="text-xl text-white/50 font-light">
                  Platform management and oversight
                </p>
              </div>
            </div>

            {/* Current Time */}
            <div className="flex items-center gap-2 text-xs font-mono text-white/40 uppercase tracking-widest">
              <Clock className="w-3 h-3" />
              Last Updated: {new Date().toLocaleString()}
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            <StatCard
              title="Total Users"
              value={stats?.totalUsers?.toString() || "0"}
              icon={Users}
              trend="+12% this month"
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
              trend="Based on all time"
              color="blue"
            />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Quick Actions */}
            <motion.div
              variants={fadeInUp}
              className="lg:col-span-1"
            >
              <h2 className="font-main text-3xl uppercase mb-8">Quick Actions</h2>
              <div className="space-y-4">
                <ActionCard
                  title="Review Applications"
                  description="Pending artist applications"
                  href="/admin/applications"
                  icon={FileText}
                  badge={stats?.pendingApplications?.toString()}
                  urgent={(stats?.pendingApplications ?? 0) > 0}
                />
                <ActionCard
                  title="Manage News"
                  description="Community updates & announcements"
                  href="/admin/news"
                  icon={Radio}
                />
                <ActionCard
                  title="User Management"
                  description="View and manage all users"
                  href="/admin/users"
                  icon={Users}
                />
                <ActionCard
                  title="Producer Hub"
                  description="Verified artist management"
                  href="/admin/producers"
                  icon={Shield}
                />
                <ActionCard
                  title="System Settings"
                  description="Platform configuration"
                  href="/admin/settings"
                  icon={Settings}
                />
              </div>
            </motion.div>

            {/* Application Overview */}
            <motion.div
              variants={fadeInUp}
              className="lg:col-span-1"
            >
              <h2 className="font-main text-3xl uppercase mb-8">Applications</h2>
              <div className="bg-white/[0.02] border border-white/10 p-8">
                <div className="space-y-6">
                  <ApplicationStatusItem
                    label="Pending Review"
                    count={stats?.pendingApplications || 0}
                    icon={Clock}
                    color="yellow"
                  />
                  <ApplicationStatusItem
                    label="Approved"
                    count={stats?.approvedApplications || 0}
                    icon={CheckCircle}
                    color="green"
                  />
                  <ApplicationStatusItem
                    label="Rejected"
                    count={stats?.rejectedApplications || 0}
                    icon={XCircle}
                    color="red"
                  />
                </div>

                <Link 
                  href="/admin/applications"
                  className="mt-8 flex items-center gap-2 text-primary hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
                >
                  View All Applications
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              variants={fadeInUp}
              className="lg:col-span-1"
            >
              <h2 className="font-main text-3xl uppercase mb-8">Recent Activity</h2>
              <div className="bg-white/[0.02] border border-white/10 p-8">
                <div className="space-y-6">
                  {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                    stats.recentActivity.slice(0, 5).map((activity) => (
                      <ActivityItemComponent key={activity.id} activity={activity} />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="w-8 h-8 text-white/20 mx-auto mb-2" />
                      <p className="text-white/40 text-sm">No recent activity</p>
                    </div>
                  )}
                </div>

                <Link 
                  href="/admin/activity"
                  className="mt-8 flex items-center gap-2 text-primary hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
                >
                  View All Activity
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

          </div>

          {/* System Health */}
          <motion.div
            variants={fadeInUp}
            className="mt-16 bg-white/[0.02] border border-white/10 p-8"
          >
            <div className="flex items-center gap-4 mb-8">
              <Activity className="w-6 h-6 text-primary" />
              <h2 className="font-main text-3xl uppercase">System Health</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <HealthMetric
                label="Database"
                status="Operational"
                uptime="99.9%"
                healthy
              />
              <HealthMetric
                label="API Services"
                status="Operational"
                uptime="99.8%"
                healthy
              />
              <HealthMetric
                label="File Storage"
                status="Operational"
                uptime="100%"
                healthy
              />
            </div>
          </motion.div>

        </main>
      </div>
    </Layout>
  );
}

// --- Sub-components ---

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color 
}) => (
  <motion.div
    variants={fadeInUp}
    className="bg-white/[0.02] border border-white/10 p-6 hover:border-white/20 transition-colors group"
  >
    <div className="flex items-start justify-between mb-4">
      <Icon className={`w-6 h-6 ${
        color === 'primary' ? 'text-primary' :
        color === 'yellow' ? 'text-yellow-400' :
        color === 'green' ? 'text-green-400' :
        color === 'blue' ? 'text-blue-400' : 'text-white/40'
      }`} />
      <div className="text-right">
        <div className="text-3xl font-bold text-white mb-1">{value}</div>
        <div className="text-xs font-mono uppercase tracking-widest text-white/40">{title}</div>
      </div>
    </div>
    <div className="text-xs text-white/50">{trend}</div>
  </motion.div>
);

const ActionCard: React.FC<ActionCardProps> = ({ 
  title, 
  description, 
  href, 
  icon: Icon, 
  badge, 
  urgent 
}) => (
  <Link
    href={href}
    className="block bg-white/[0.02] border border-white/10 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300 p-6 group"
  >
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-4 flex-1">
        <Icon className="w-5 h-5 text-primary mt-1" />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold uppercase tracking-wide text-white group-hover:text-primary transition-colors">
              {title}
            </h3>
            {badge && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                urgent ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/60'
              }`}>
                {badge}
              </span>
            )}
          </div>
          <p className="text-sm text-white/60 leading-relaxed">{description}</p>
        </div>
      </div>
      <ArrowUpRight className="w-4 h-4 text-white/30 group-hover:text-primary transition-colors" />
    </div>
  </Link>
);

const ApplicationStatusItem: React.FC<ApplicationStatusItemProps> = ({ 
  label, 
  count, 
  icon: Icon, 
  color 
}) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <Icon className={`w-4 h-4 ${
        color === 'yellow' ? 'text-yellow-400' :
        color === 'green' ? 'text-green-400' :
        color === 'red' ? 'text-red-400' : 'text-white/40'
      }`} />
      <span className="text-sm font-medium text-white/80">{label}</span>
    </div>
    <span className="text-lg font-bold text-white">{count}</span>
  </div>
);

const ActivityItemComponent: React.FC<{ activity: ActivityItem }> = ({ activity }) => {
  const getActivityIcon = (type: string): React.ComponentType<{ className?: string }> => {
    switch (type) {
      case 'APPLICATION_SUBMITTED': return FileText;
      case 'APPLICATION_APPROVED': return CheckCircle;
      case 'APPLICATION_REJECTED': return XCircle;
      case 'NEWS_CREATED': return Radio;
      case 'USER_REGISTERED': return Users;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string): string => {
    switch (type) {
      case 'APPLICATION_APPROVED': return 'text-green-400';
      case 'APPLICATION_REJECTED': return 'text-red-400';
      case 'NEWS_CREATED': return 'text-blue-400';
      case 'USER_REGISTERED': return 'text-primary';
      default: return 'text-white/60';
    }
  };

  const Icon = getActivityIcon(activity.type);

  return (
    <div className="flex items-start gap-3">
      <Icon className={`w-4 h-4 mt-0.5 ${getActivityColor(activity.type)}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/70 leading-relaxed">
          {activity.description}
        </p>
        <p className="text-xs font-mono text-white/30 mt-1">
          {new Date(activity.timestamp).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

const HealthMetric: React.FC<HealthMetricProps> = ({ 
  label, 
  status, 
  uptime, 
  healthy 
}) => (
  <div className="text-center">
    <div className={`w-4 h-4 rounded-full mx-auto mb-3 ${healthy ? 'bg-green-400' : 'bg-red-400'}`} />
    <h3 className="font-bold text-white mb-1">{label}</h3>
    <p className="text-sm text-white/60 mb-1">{status}</p>
    <p className="text-xs font-mono text-white/40">{uptime} uptime</p>
  </div>
);