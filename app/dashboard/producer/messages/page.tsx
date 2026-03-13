"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, Send, Clock, ChevronLeft, MessageSquare, Plus, X, UserSearch } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Conversation {
  userId: string;
  username: string;
  artistName: string;
  artistPhoto: string | null;
  latestMessage: string;
  latestMessageAt: string;
  isRead: boolean;
  unreadCount: number;
}

interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  senderId: string;
  sender: {
    id: string;
    username: string;
    artistPhoto: string | null;
    artistApplications: { artistName: string }[];
  };
}

interface PartnerInfo {
  username: string;
  artistPhoto: string | null;
  artistApplications: { artistName: string }[];
}

interface SearchResult {
  id: string;
  username: string;
  artistPhoto: string | null;
  artistApplications: { artistName: string }[];
}

const fadeVar = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.4 } }
};

export default function MessagesInbox() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activePartnerId, setActivePartnerId] = useState<string | null>(null);
  const [activeThread, setActiveThread] = useState<ChatMessage[]>([]);
  const [activePartnerInfo, setActivePartnerInfo] = useState<PartnerInfo | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isThreadLoading, setIsThreadLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Artist discovery
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [discoveryQuery, setDiscoveryQuery] = useState("");
  const [discoveryResults, setDiscoveryResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/signin");
        return;
      }
      try {
        const payloadStr = Buffer.from(token.split(".")[1], "base64").toString();
        const payload = JSON.parse(payloadStr);
        setCurrentUserId(payload.userId);
        fetchConversations(token);
      } catch (e) {
        console.error(e);
        router.push("/signin");
      }
    };
    checkAuth();
  }, [router]);

  const fetchConversations = async (token: string) => {
    try {
      const res = await fetch("/api/messages", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations);
      }
    } catch (e) {
      console.error("Failed to fetch conversations", e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadConversation = async (partnerId: string) => {
    setActivePartnerId(partnerId);
    setActiveThread([]);
    setIsThreadLoading(true);
    setShowDiscovery(false);
    setConversations((prev) =>
      prev.map((c) => (c.userId === partnerId ? { ...c, isRead: true, unreadCount: 0 } : c))
    );
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
      const res = await fetch(`/api/messages/${partnerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setActiveThread(data.messages);
        setActivePartnerInfo(data.partner);
      }
    } catch (e) {
      console.error("Failed to load thread", e);
    } finally {
      setIsThreadLoading(false);
    }
  };

  const startNewConversation = (artist: SearchResult) => {
    setActivePartnerInfo({
      username: artist.username,
      artistPhoto: artist.artistPhoto,
      artistApplications: artist.artistApplications,
    });
    setActivePartnerId(artist.id);
    setActiveThread([]);
    setShowDiscovery(false);
    setIsThreadLoading(false);
  };

  // Debounced artist search
  const searchArtists = useCallback(async (query: string) => {
    if (query.length < 2) {
      setDiscoveryResults([]);
      return;
    }
    setIsSearching(true);
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
      const res = await fetch(`/api/artists/search?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDiscoveryResults(data.artists);
      }
    } catch (e) {
      console.error("Search failed", e);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      searchArtists(discoveryQuery);
    }, 300);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [discoveryQuery, searchArtists]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activePartnerInfo) return;
    setIsSending(true);
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
      const res = await fetch(`/api/artist/${activePartnerInfo.username}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: "New Message via Inbox",
          message: newMessage.trim(),
        }),
      });
      if (res.ok) {
        const tempMsg: ChatMessage = {
          id: Math.random().toString(),
          content: newMessage.trim(),
          createdAt: new Date().toISOString(),
          isRead: false,
          senderId: currentUserId || "",
          sender: { id: currentUserId || "", username: "me", artistPhoto: null, artistApplications: [] },
        };
        setActiveThread((prev) => [...prev, tempMsg]);
        setNewMessage("");
        fetchConversations(token);
      }
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setIsSending(false);
    }
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.artistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const isToday = now.toDateString() === date.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = yesterday.toDateString() === date.toDateString();
    if (isToday) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (isYesterday) return "Yesterday";
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-12rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  // Thread view
  if (activePartnerId) {
    return (
      <motion.div variants={fadeVar} initial="hidden" animate="visible" exit="exit" className="w-full max-w-none flex flex-col" style={{ height: "calc(100vh - 3rem)", paddingTop: "4rem" }}>
        {/* Back + Partner Header */}
        <div className="flex items-center gap-4 mb-6 flex-shrink-0">
          <button
            onClick={() => setActivePartnerId(null)}
            className="text-white/40 hover:text-white transition-colors"
            type="button"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div
            className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => router.push(`/artist/${activePartnerInfo?.username}`)}
          >
            <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 relative">
              {activePartnerInfo?.artistPhoto ? (
                <Image src={activePartnerInfo.artistPhoto} alt="" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/50 font-main text-lg uppercase">
                  {activePartnerInfo?.username?.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h2 className="font-main text-3xl md:text-4xl uppercase text-white tracking-wide">
                {activePartnerInfo?.artistApplications[0]?.artistName || activePartnerInfo?.username}
              </h2>
              <p className="text-white/30 text-sm font-sans">@{activePartnerInfo?.username}</p>
            </div>
          </div>
        </div>

        {/* Chat Feed — fills remaining space */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-2 md:px-4 space-y-4">
          {isThreadLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white/40"></div>
            </div>
          ) : activeThread.length === 0 ? (
            <div className="flex items-center justify-center h-full text-white/30 text-sm font-sans">
              No messages yet. Start the conversation below.
            </div>
          ) : (
            <>
              {activeThread.map((msg, index) => {
                const isMine = msg.senderId === currentUserId;
                const prevMsg = activeThread[index - 1];
                const showTimestamp =
                  !prevMsg ||
                  new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() > 1000 * 60 * 30;

                return (
                  <div key={msg.id} className="flex flex-col">
                    {showTimestamp && (
                      <div className="text-center my-5">
                        <span className="text-[10px] uppercase font-semibold tracking-widest text-white/20 font-sans">
                          {new Date(msg.createdAt).toLocaleString([], {
                            weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                      </div>
                    )}
                    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] md:max-w-[65%] rounded-2xl px-5 py-3 whitespace-pre-wrap text-sm leading-relaxed font-sans ${isMine
                          ? "bg-white text-black"
                          : "bg-white/[0.06] text-white/80 border border-white/10"
                          }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input — pinned at bottom */}
        <div className="flex-shrink-0 pt-4 pb-2">
          <form onSubmit={sendMessage} className="flex items-end gap-3">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Write a message..."
              className="flex-1 max-h-28 min-h-[44px] bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 resize-none font-sans transition-colors"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className="bg-white text-black h-[44px] w-[44px] rounded-xl flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/90 transition-all"
            >
              {isSending ? (
                <div className="w-4 h-4 border-2 border-black border-r-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
          <p className="text-[10px] text-white/20 text-center mt-2 flex items-center justify-center gap-1.5 font-sans">
            <Clock className="w-3 h-3" />
            Replies also send an email notification
          </p>
        </div>
      </motion.div>
    );
  }

  // Conversations list + discovery
  return (
    <motion.div variants={fadeVar} initial="hidden" animate="visible" exit="exit" className="w-full max-w-none space-y-12 pt-24">
      {/* Hero */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="font-main text-5xl md:text-7xl uppercase text-white mb-3">
            Messages
          </h2>
          <p className="text-white/40 text-sm max-w-lg font-sans">
            Secure conversations between verified artists on Ethereal Techno.
          </p>
        </div>

        <button
          onClick={() => {
            setShowDiscovery(!showDiscovery);
            setDiscoveryQuery("");
            setDiscoveryResults([]);
            setTimeout(() => searchInputRef.current?.focus(), 100);
          }}
          className={`self-start md:self-auto text-[10px] font-bold uppercase tracking-widest px-6 py-3 rounded-full transition-colors flex items-center gap-2 whitespace-nowrap ${showDiscovery
            ? "bg-white/10 text-white border border-white/20"
            : "bg-white hover:bg-neutral-200 text-black"
            }`}
        >
          {showDiscovery ? (
            <><X className="w-3.5 h-3.5" /> Close</>
          ) : (
            <><Plus className="w-3.5 h-3.5" /> New Conversation</>
          )}
        </button>
      </div>

      {/* Artist Discovery Panel */}
      <AnimatePresence>
        {showDiscovery && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] p-8 md:p-10 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <UserSearch className="w-4 h-4 text-white/50" />
                  <h3 className="font-mono text-[10px] uppercase tracking-widest text-white/50">Find Artists</h3>
                </div>

                <div className="relative max-w-lg">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search by name or username..."
                    value={discoveryQuery}
                    onChange={(e) => setDiscoveryQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-sm text-white rounded-full pl-11 pr-5 py-3.5 focus:outline-none focus:border-white/20 transition-colors placeholder:text-white/30 font-sans"
                  />
                  {isSearching && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white/40"></div>
                    </div>
                  )}
                </div>

                {/* Results */}
                {discoveryQuery.length >= 2 && (
                  <div className="mt-6 space-y-2">
                    {discoveryResults.length === 0 && !isSearching ? (
                      <p className="text-white/30 text-sm font-sans py-4">No verified artists found matching &quot;{discoveryQuery}&quot;</p>
                    ) : (
                      discoveryResults.map((artist) => (
                        <motion.button
                          key={artist.id}
                          onClick={() => startNewConversation(artist)}
                          whileHover={{ x: 4, backgroundColor: "rgba(255, 255, 255, 0.04)" }}
                          className="w-full text-left flex items-center gap-4 p-4 rounded-xl transition-all duration-200 hover:bg-white/[0.03] group"
                        >
                          <div className="w-11 h-11 rounded-full overflow-hidden bg-white/10 relative flex-shrink-0">
                            {artist.artistPhoto ? (
                              <Image src={artist.artistPhoto} alt="" fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white/50 font-main text-lg uppercase">
                                {artist.username.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-sans uppercase tracking-wider text-white/80 font-medium">
                              {artist.artistApplications[0]?.artistName || artist.username}
                            </h4>
                            <p className="text-xs text-white/30 font-sans">@{artist.username}</p>
                          </div>
                          <Send className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
                        </motion.button>
                      ))
                    )}
                  </div>
                )}

                {discoveryQuery.length < 2 && (
                  <p className="text-white/20 text-xs font-sans mt-4">Type at least 2 characters to search verified artists.</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Existing conversations filter */}
      {conversations.length > 0 && !showDiscovery && (
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Filter conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/40 border border-white/10 text-sm text-white rounded-full pl-11 pr-5 py-3 focus:outline-none focus:border-white/20 transition-colors placeholder:text-white/30 font-sans"
          />
        </div>
      )}

      {/* Conversations */}
      {filteredConversations.length === 0 && !showDiscovery ? (
        <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] p-12 relative overflow-hidden text-center">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-6 h-6 text-white/20" />
            </div>
            <h3 className="text-xl font-main text-white uppercase tracking-wide mb-2">
              {searchQuery ? "No Results" : "No Conversations Yet"}
            </h3>
            <p className="text-white/30 max-w-sm mx-auto text-sm font-sans mb-6">
              {searchQuery
                ? "No conversations match your search."
                : "Start a conversation with a verified artist by clicking the button above."}
            </p>
            {!searchQuery && (
              <button
                onClick={() => {
                  setShowDiscovery(true);
                  setTimeout(() => searchInputRef.current?.focus(), 100);
                }}
                className="bg-white hover:bg-neutral-200 text-black text-[10px] font-bold uppercase tracking-widest px-6 py-3 rounded-full transition-colors inline-flex items-center gap-2"
              >
                <UserSearch className="w-3.5 h-3.5" /> Find Artists
              </button>
            )}
          </div>
        </div>
      ) : !showDiscovery && (
        <div className="space-y-3">
          {filteredConversations.map((conv) => (
            <motion.button
              key={conv.userId}
              onClick={() => loadConversation(conv.userId)}
              whileHover={{ x: 4, backgroundColor: "rgba(255, 255, 255, 0.03)" }}
              className="w-full text-left bg-zinc-900/40 border border-white/5 rounded-2xl p-5 md:p-6 transition-all duration-200 flex items-center gap-5 group hover:border-white/10"
            >
              <div className="relative w-14 h-14 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
                {conv.artistPhoto ? (
                  <Image src={conv.artistPhoto} alt={conv.artistName} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/50 font-main text-xl uppercase">
                    {conv.artistName.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3
                    className={`text-base font-sans uppercase tracking-wider ${conv.unreadCount > 0 ? "text-white font-bold" : "text-white/70 font-medium"
                      }`}
                  >
                    {conv.artistName}
                  </h3>
                  <span className="text-[10px] text-white/30 flex-shrink-0 ml-3 font-mono tabular-nums uppercase tracking-widest">
                    {formatTime(conv.latestMessageAt)}
                  </span>
                </div>
                <p className={`text-sm truncate font-sans ${conv.unreadCount > 0 ? "text-white/50" : "text-white/25"}`}>
                  {conv.latestMessage}
                </p>
              </div>
              {conv.unreadCount > 0 && (
                <span className="w-6 h-6 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                  {conv.unreadCount}
                </span>
              )}
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
