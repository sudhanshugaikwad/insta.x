import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MessageCircle, Search, Send } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";
import * as api from "../lib/api";

function userId(value) {
  return typeof value === "string" ? value : value?._id;
}

export default function MessagesPage() {
  const navigate = useNavigate();
  const { userId: routeUserId } = useParams();
  const { user: currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  const loadMessages = async (targetUserId) => {
    if (!targetUserId) {
      setMessages([]);
      return;
    }

    try {
      const data = await api.getMessages(targetUserId);
      setMessages(data.messages || []);
      if (data.user) {
        setSelectedUser(data.user);
      }
    } catch (requestError) {
      setError(requestError.message || "Unable to load messages");
    }
  };

  useEffect(() => {
    let active = true;

    async function loadDirectory() {
      try {
        const [usersData, conversationsData] = await Promise.all([
          api.getAllUsers(),
          api.getConversations(),
        ]);

        if (!active) return;

        const directory = (usersData.users || []).filter((item) => item._id !== currentUser?._id);
        const summary = conversationsData.conversations || [];
        const lastMessageByUser = Object.fromEntries(
          summary.map((entry) => [entry.user._id, entry.lastMessage])
        );

        setAllUsers(
          directory.map((user) => ({
            ...user,
            lastMessage: lastMessageByUser[user._id] || null,
          }))
        );
        setConversations(summary);

        if (routeUserId) {
          const existing = summary.find(({ user }) => user._id === routeUserId);
          const matchedUser = existing?.user || directory.find((user) => user._id === routeUserId);

          if (matchedUser) {
            setSelectedUser(matchedUser);
          } else {
            const profile = await api.getUserProfile(routeUserId);
            if (active) setSelectedUser(profile.user);
          }

          await loadMessages(routeUserId);
        } else {
          setSelectedUser(null);
          setMessages([]);
        }
      } catch (requestError) {
        if (active) setError(requestError.message || "Unable to load messages");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDirectory();
    return () => { active = false; };
  }, [currentUser?._id, routeUserId]);

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setSearchResults([]);
      return undefined;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await api.searchUsers(trimmedQuery);
        const filtered = (data.users || []).filter((user) => user._id !== currentUser?._id);
        setSearchResults(filtered);
      } catch (requestError) {
        setError(requestError.message || "Unable to search users");
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [currentUser?._id, query]);

  useEffect(() => {
    if (!routeUserId) return undefined;
    const timer = setInterval(() => loadMessages(routeUserId), 5000);
    return () => clearInterval(timer);
  }, [routeUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectUser = async (targetUser) => {
    if (!targetUser?._id) return;
    setSelectedUser(targetUser);
    setQuery("");
    setError("");
    navigate(`/messages/${targetUser._id}`);
    await loadMessages(targetUser._id);
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!selectedUser || !messageText.trim()) return;
    setSending(true);
    try {
      const result = await api.sendMessage(selectedUser._id, messageText.trim());
      setMessages((current) => [...current, result.message]);
      setConversations((current) => [{ user: selectedUser, lastMessage: result.message }, ...current.filter(({ user }) => user._id !== selectedUser._id)]);
      setMessageText("");
    } catch (requestError) {
      setError(requestError.message || "Unable to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center pt-16">Loading messages...</div>;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col bg-white dark:bg-slate-950 md:flex-row">
      <aside className={`${selectedUser ? "hidden md:flex" : "flex"} w-full flex-col border-r border-slate-200 dark:border-slate-800 md:w-80`}>
        <div className="border-b border-slate-200 p-4 dark:border-slate-800"><h1 className="text-xl font-bold">Messages</h1><div className="relative mt-4"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a person" className="pl-9" /></div></div>
        {error && <p className="m-3 rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p>}
        <div className="flex-1 overflow-y-auto">
          {searching && <p className="p-4 text-sm text-slate-500">Searching...</p>}
          {query && !searching && searchResults.length === 0 && <p className="p-4 text-sm text-slate-500">No users found.</p>}

          {(query ? searchResults : allUsers).map((user) => {
            const lastMessage = user.lastMessage || conversations.find((entry) => entry.user._id === user._id)?.lastMessage;

            return (
              <button
                key={user._id}
                type="button"
                onClick={() => selectUser(user)}
                className={`flex w-full items-center gap-3 border-b border-slate-100 p-4 text-left hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 ${selectedUser?._id === user._id ? "bg-pink-50 dark:bg-slate-800" : ""}`}
              >
                <img src={user.Photo || "/avatar.png"} alt={user.name} className="h-11 w-11 shrink-0 rounded-full object-cover" />
                <span className="min-w-0 flex-1">
                  <strong className="block truncate">{user.name}</strong>
                  <small className="block truncate text-slate-500">@{user.userName}</small>
                  {lastMessage && <small className="block truncate text-slate-500">{lastMessage.message}</small>}
                </span>
              </button>
            );
          })}

          {!query && allUsers.length === 0 && <div className="p-6 text-center text-sm text-slate-500">Search for a user to start a conversation.</div>}
        </div>
      </aside>

      <section className={`${selectedUser ? "flex" : "hidden md:flex"} min-w-0 flex-1 flex-col`}>
        {selectedUser ? <>
          <header className="flex items-center gap-3 border-b border-slate-200 p-4 dark:border-slate-800"><Button variant="ghost" size="icon" className="md:hidden" onClick={() => { setSelectedUser(null); navigate("/messages"); }} aria-label="Back to users"><ArrowLeft className="h-5 w-5" /></Button><img src={selectedUser.Photo || "/avatar.png"} alt={selectedUser.name} className="h-10 w-10 rounded-full object-cover" /><div><strong>{selectedUser.name}</strong><p className="text-sm text-slate-500">@{selectedUser.userName}</p></div></header>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">{messages.length === 0 ? <div className="flex h-full items-center justify-center text-slate-500"><MessageCircle className="mr-2 h-5 w-5" /> Start the conversation</div> : messages.map((message) => { const mine = userId(message.senderId) === currentUser?._id; return <div key={message._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}><div className={`max-w-[80%] rounded-2xl px-4 py-2 ${mine ? "bg-pink-500 text-white" : "bg-slate-100 dark:bg-slate-800"}`}><p className="break-words text-sm">{message.message}</p><time className="mt-1 block text-xs opacity-70">{new Date(message.createdAt).toLocaleTimeString()}</time></div></div>; })}<div ref={messagesEndRef} /></div>
          <form onSubmit={sendMessage} className="flex gap-2 border-t border-slate-200 p-4 dark:border-slate-800"><Input value={messageText} onChange={(event) => setMessageText(event.target.value)} placeholder="Write a message..." disabled={sending} /><Button type="submit" disabled={sending || !messageText.trim()} aria-label="Send message"><Send className="h-5 w-5" /></Button></form>
        </> : <div className="flex h-full flex-col items-center justify-center p-6 text-center text-slate-500"><MessageCircle className="mb-3 h-10 w-10" /><p>Select a user to open the chat box.</p></div>}
      </section>
    </main>
  );
}
