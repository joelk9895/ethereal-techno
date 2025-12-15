"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Eye,
  EyeOff,
  Radio,
  Calendar,
  Edit2,
  Flag,
} from "lucide-react";
import { getAuthUser } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function AdminNewsPage() {
  const router = useRouter();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    isActive: true,
    priority: 0,
  });

  useEffect(() => {
    const user = getAuthUser();
    if (!user || user.type !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    fetchNews();
  }, [router]);

  const fetchNews = async () => {
    try {
      const response = await fetch("/api/admin/news", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setNews(data.news);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingId
        ? `/api/admin/news/${editingId}`
        : "/api/admin/news";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchNews();
        resetForm();
      }
    } catch (error) {
      console.error("Error saving news:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (newsItem: NewsItem) => {
    setFormData({
      title: newsItem.title,
      content: newsItem.content,
      isActive: newsItem.isActive,
      priority: newsItem.priority,
    });
    setEditingId(newsItem.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this news item?")) return;

    try {
      const response = await fetch(`/api/admin/news/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (response.ok) {
        await fetchNews();
      }
    } catch (error) {
      console.error("Error deleting news:", error);
    }
  };

  const resetForm = () => {
    setFormData({ title: "", content: "", isActive: true, priority: 0 });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="text-xs font-mono tracking-widest text-white/50">
              LOADING NEWS...
            </span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-black text-white font-sans selection:bg-primary selection:text-black">
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
          <div className="absolute top-[-20%] right-[-20%] w-[40vw] h-[40vw] bg-primary/5 rounded-full blur-[150px]" />
        </div>

        <main className="relative z-10 w-full mx-auto px-6 md:px-12 py-12">
          {/* Header */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="mb-16"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-main text-6xl md:text-8xl uppercase leading-[0.9] mb-4">
                  Live <span className="text-primary">News</span>
                </h1>
                <p className="text-xl text-white/50 font-light">
                  Manage community updates and announcements
                </p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-primary text-black px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add News
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <StatCard label="Total News" value={news.length.toString()} />
              <StatCard
                label="Active"
                value={news.filter((n) => n.isActive).length.toString()}
              />
              <StatCard
                label="High Priority"
                value={news.filter((n) => n.priority > 0).length.toString()}
              />
              <StatCard
                label="This Week"
                value={news
                  .filter(
                    (n) =>
                      new Date(n.createdAt) >
                      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  )
                  .length.toString()}
              />
            </div>
          </motion.div>

          {/* News List */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="space-y-6"
          >
            {news.length === 0 ? (
              <div className="text-center py-20 border border-white/10 bg-white/[0.02]">
                <Radio className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/40 text-lg">No news items yet</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 text-primary hover:underline text-sm"
                >
                  Create your first news item
                </button>
              </div>
            ) : (
              news.map((item) => (
                <NewsCard
                  key={item.id}
                  item={item}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            )}
          </motion.div>
        </main>

        {/* Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
              onClick={(e) => e.target === e.currentTarget && resetForm()}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-black border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="font-main text-3xl uppercase">
                      {editingId ? "Edit News" : "Create News"}
                    </h2>
                    <button
                      onClick={resetForm}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                      <label className="block text-sm font-bold text-white/80 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="w-full bg-white/5 border border-white/20 px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                        placeholder="Enter news title..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-white/80 mb-2">
                        Content
                      </label>
                      <textarea
                        value={formData.content}
                        onChange={(e) =>
                          setFormData({ ...formData, content: e.target.value })
                        }
                        className="w-full bg-white/5 border border-white/20 px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors resize-none"
                        rows={4}
                        placeholder="Enter news content..."
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-white/80 mb-2">
                          Priority
                        </label>
                        <select
                          value={formData.priority}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              priority: parseInt(e.target.value),
                            })
                          }
                          className="w-full bg-white/5 border border-white/20 px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                        >
                          <option value={0}>Normal</option>
                          <option value={1}>High</option>
                          <option value={2}>Urgent</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-4 pt-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                isActive: e.target.checked,
                              })
                            }
                            className="hidden"
                          />
                          <div
                            className={`w-5 h-5 border border-white/20 flex items-center justify-center transition-colors ${formData.isActive
                                ? "bg-primary border-primary"
                                : ""
                              }`}
                          >
                            {formData.isActive && (
                              <Eye className="w-3 h-3 text-black" />
                            )}
                          </div>
                          <span className="text-sm text-white/80">
                            Published
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2 bg-white text-black px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-primary transition-colors disabled:opacity-50"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            {editingId ? "Update" : "Create"}
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-6 py-3 border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-colors font-bold uppercase tracking-widest text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}

// Sub-components
const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-white/[0.02] border border-white/10 p-6">
    <div className="text-2xl font-bold text-white mb-1">{value}</div>
    <div className="text-xs font-mono uppercase tracking-widest text-white/40">
      {label}
    </div>
  </div>
);

const NewsCard = ({
  item,
  onEdit,
  onDelete,
}: {
  item: NewsItem;
  onEdit: (item: NewsItem) => void;
  onDelete: (id: string) => void;
}) => {
  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 2:
        return "text-red-400";
      case 1:
        return "text-yellow-400";
      default:
        return "text-white/40";
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 2:
        return "URGENT";
      case 1:
        return "HIGH";
      default:
        return "NORMAL";
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white/[0.02] border border-white/10 p-8 hover:border-white/20 transition-colors group"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <h3 className="font-main text-xl text-white group-hover:text-primary transition-colors">
              {item.title}
            </h3>
            <div className="flex items-center gap-2">
              {item.isActive ? (
                <Eye className="w-4 h-4 text-green-400" />
              ) : (
                <EyeOff className="w-4 h-4 text-white/30" />
              )}
              <Flag className={`w-4 h-4 ${getPriorityColor(item.priority)}`} />
              <span
                className={`text-xs font-mono uppercase tracking-widest ${getPriorityColor(
                  item.priority
                )}`}
              >
                {getPriorityLabel(item.priority)}
              </span>
            </div>
          </div>
          <p className="text-white/70 leading-relaxed mb-4">{item.content}</p>
          <div className="flex items-center gap-4 text-xs font-mono text-white/40">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(item.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => onEdit(item)}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs font-bold uppercase tracking-widest transition-colors"
        >
          <Edit2 className="w-3 h-3" />
          Edit
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-400/10 border border-red-400/20 rounded text-xs font-bold uppercase tracking-widest transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          Delete
        </button>
      </div>
    </motion.div>
  );
};
