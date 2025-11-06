import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";
import toast from "react-hot-toast";

interface Message {
  id: string;
  type: "user" | "ai";
  text: string;
  sources?: {
    notesCount: number;
    contentCount: number;
  };
  loading?: boolean;
  timestamp?: number;
}

const DEFAULT_MESSAGE: Message = {
  id: "1",
  type: "ai",
  text: "Hello! I'm your personal AI assistant. Ask me anything about your saved notes, YouTube videos, and Twitter posts. I'll search your entire brain and provide comprehensive answers with the latest information!",
  timestamp: Date.now(),
};

const parseMarkdown = (text: string) => {
  let html = text;

  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/__text__(.*?)__text__/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .replace(/^\* (.*?)$/gm, "<li>$1</li>")
    .replace(/^\d+\. (.*?)$/gm, "<li>$1</li>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>");

  html = html.replace(/(<li>.*?<\/li>)/s, (match) => `<ul>${match}</ul>`);

  return `<p>${html}</p>`;
};

export function AiChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([DEFAULT_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiReady, setAiReady] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem("brainly_chat_history");
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      } catch (err) {
        console.error("Failed to load chat history");
      }
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("brainly_chat_history", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [messages]);

  useEffect(() => {
    const checkAi = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/v1/ai/health`);
        setAiReady(response.data.ready);
      } catch {
        setAiReady(false);
      }
    };

    checkAi();
    const interval = setInterval(checkAi, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollHeight, scrollTop, clientHeight } = messagesContainerRef.current;
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;
    if (!aiReady) {
      toast.error("AI is offline. Please check your connection.");
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      text: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput("");
    setLoading(true);
    setIsTyping(true);

    const loadingMessage: Message = {
      id: "loading",
      type: "ai",
      text: "Analyzing your content and searching latest news...",
      loading: true,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/ai/ask`,
        { question: userInput },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== "loading"),
        {
          id: Date.now().toString(),
          type: "ai",
          text: response.data.answer,
          sources: response.data.sources,
          timestamp: Date.now(),
        },
      ]);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || "Failed to get answer. Try again.";
      toast.error(errorMsg);
      setMessages((prev) => prev.filter((m) => m.id !== "loading"));
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const clearChatHistory = () => {
    if (window.confirm("Are you sure you want to clear chat history?")) {
      localStorage.removeItem("brainly_chat_history");
      setMessages([DEFAULT_MESSAGE]);
      toast.success("Chat history cleared");
      setMobileMenuOpen(false);
    }
  };

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="h-screen w-screen bg-black flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-neutral-950 border-b border-neutral-800 sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all duration-200"
              title="Back to Dashboard"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>

            <div className="hidden sm:flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                </svg>
              </div>
              <div>
                <h1 className="text-sm font-bold text-white">Brainly AI</h1>
                <p className="text-xs text-neutral-500">Intelligence Hub</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                aiReady
                  ? "bg-green-900/30 text-green-400 border border-green-800"
                  : "bg-red-900/30 text-red-400 border border-red-800"
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${aiReady ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
              <span>{aiReady ? "Ready" : "Offline"}</span>
            </div>

            <button
              onClick={clearChatHistory}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all duration-200"
              title="Clear history"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h12a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0015 2H9zM9 5a1 1 0 011 1v8a1 1 0 11-2 0V6a1 1 0 011-1zm4 0a1 1 0 011 1v8a1 1 0 11-2 0V6a1 1 0 011-1z" />
              </svg>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-neutral-800 bg-neutral-950 px-4 py-3 space-y-2">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${aiReady ? "bg-green-900/30 text-green-400 border border-green-800" : "bg-red-900/30 text-red-400 border border-red-800"}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${aiReady ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
              {aiReady ? "AI Ready" : "AI Offline"}
            </div>
            <button onClick={clearChatHistory} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h12a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0015 2H9zM9 5a1 1 0 011 1v8a1 1 0 11-2 0V6a1 1 0 011-1zm4 0a1 1 0 011 1v8a1 1 0 11-2 0V6a1 1 0 011-1z" />
              </svg>
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto relative bg-black" ref={messagesContainerRef} onScroll={handleScroll}>
        <div className="w-full h-full flex flex-col">
          {messages.length === 1 ? (
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
              <div className="max-w-2xl w-full space-y-12 text-center">
                <div className="flex justify-center">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 bg-blue-600 rounded-3xl blur-xl opacity-20 animate-pulse" />
                    <div className="relative w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-4xl shadow-2xl">
                      <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h1 className="text-5xl sm:text-6xl font-black text-white">Brainly AI</h1>
                  <p className="text-xl text-neutral-300">Your intelligent second brain</p>
                  <p className="text-sm text-neutral-400 leading-relaxed">Analyze your saved content, get instant answers, and discover connections</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8">
                  {[
                    { icon: "search", title: "Search Brain", desc: "Query your saved items" },
                    { icon: "newspaper", title: "Latest Info", desc: "Current news & trends" },
                    { icon: "film", title: "Video AI", desc: "YouTube analysis" },
                    { icon: "share", title: "Social AI", desc: "Tweet insights" },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInput(item.desc);
                        setMobileMenuOpen(false);
                      }}
                      className="group p-5 rounded-2xl border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800 transition-all duration-300 hover:border-neutral-700 hover:shadow-lg hover:shadow-blue-500/10"
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-2xl">
                          {item.icon === "search" && <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
                          {item.icon === "newspaper" && <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2m2 2a2 2 0 002-2m-2 2v-6a2 2 0 012-2h.344" /></svg>}
                          {item.icon === "film" && <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
                          {item.icon === "share" && <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C9.822 10.938 12.075 9 14.5 9c1.761 0 3.413.672 4.646 1.891.177.125.375.191.583.191h1.011a.75.75 0 01.75.75 10 10 0 01-15.848 6.463l-.501-.501a.75.75 0 00-1.06 0L6.53 19.47a.75.75 0 001.06 1.06l3.12-3.12a.75.75 0 00.22-.53V15.5" /></svg>}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-white group-hover:text-blue-400 transition-colors text-sm">{item.title}</div>
                          <div className="text-xs text-neutral-500 mt-1">{item.desc}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto w-full flex-1 px-4 sm:px-6 lg:px-8 py-8">
              <div className="space-y-6 pb-24">
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-4 animate-slideUp ${message.type === "ai" ? "justify-start" : "justify-end"}`}>
                    {message.type === "ai" ? (
                      <>
                        {/* AI Avatar - Left */}
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                            </svg>
                          </div>
                        </div>

                        {/* AI Message Bubble - White on Left */}
                        <div className="max-w-3xl">
                          <div className="rounded-2xl px-5 py-4 inline-block max-w-full bg-white text-black rounded-bl-3xl group">
                            <div
                              className="text-sm leading-relaxed break-words whitespace-pre-wrap"
                              dangerouslySetInnerHTML={{ __html: parseMarkdown(message.text) }}
                            />

                            {message.sources && !message.loading && (
                              <div className="mt-4 pt-3 border-t border-black/10 flex flex-wrap gap-3 text-xs">
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-neutral-200 rounded-lg text-black">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                                  </svg>
                                  <span>{message.sources.notesCount} {message.sources.notesCount === 1 ? "note" : "notes"}</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-neutral-200 rounded-lg text-black">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                  </svg>
                                  <span>{message.sources.contentCount} {message.sources.contentCount === 1 ? "item" : "items"}</span>
                                </div>
                                {message.timestamp && (
                                  <div className="flex items-center gap-1.5 px-2 py-1 bg-neutral-200 rounded-lg text-neutral-700 ml-auto">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M12 8v4l3 1.5M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                                    </svg>
                                    <span>{formatTime(message.timestamp)}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {message.loading && (
                              <div className="flex gap-2 mt-3">
                                <div className="w-2 h-2 bg-black/30 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-black/30 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                                <div className="w-2 h-2 bg-black/30 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* User Message Bubble - Dark Black on Right */}
                        <div className="max-w-3xl">
                          <div className="rounded-2xl px-5 py-4 inline-block max-w-full bg-neutral-900 text-white border border-neutral-700 rounded-br-3xl group">
                            <div
                              className="text-sm leading-relaxed break-words whitespace-pre-wrap"
                              dangerouslySetInnerHTML={{ __html: parseMarkdown(message.text) }}
                            />

                            {message.sources && !message.loading && (
                              <div className="mt-4 pt-3 border-t border-neutral-700/30 flex flex-wrap gap-3 text-xs">
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-neutral-800 rounded-lg text-neutral-300">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                                  </svg>
                                  <span>{message.sources.notesCount} {message.sources.notesCount === 1 ? "note" : "notes"}</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-neutral-800 rounded-lg text-neutral-300">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                  </svg>
                                  <span>{message.sources.contentCount} {message.sources.contentCount === 1 ? "item" : "items"}</span>
                                </div>
                                {message.timestamp && (
                                  <div className="flex items-center gap-1.5 px-2 py-1 bg-neutral-800 rounded-lg text-neutral-400 ml-auto">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M12 8v4l3 1.5M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                                    </svg>
                                    <span>{formatTime(message.timestamp)}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {message.loading && (
                              <div className="flex gap-2 mt-3">
                                <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                                <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* User Avatar - Right */}
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>

        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-32 right-8 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 animate-slideUp"
            title="Scroll to bottom"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        )}

        {isTyping && (
          <div className="fixed bottom-24 left-4 right-4 flex justify-start pointer-events-none">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-neutral-300">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-black rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              </div>
              <span className="text-xs text-black">AI is thinking</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 bg-black border-t border-neutral-800 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="space-y-3">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e as any);
                    }
                  }}
                  placeholder={aiReady ? "Message Brainly AI... (Press Enter)" : "AI is offline..."}
                  disabled={!aiReady || loading}
                  className="w-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700 focus:border-blue-600 text-white placeholder-neutral-500 text-sm px-5 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  autoFocus
                />
                {input && (
                  <button
                    type="button"
                    onClick={() => setInput("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                    </svg>
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={!aiReady || loading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3.5 rounded-xl font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-2 flex-shrink-0 shadow-lg hover:shadow-blue-500/50"
              >
                {loading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-1.429 5.951 1.429a1 1 0 001.169-1.409l-7-14z" />
                  </svg>
                )}
                <span className="hidden sm:inline">{loading ? "Sending" : "Send"}</span>
              </button>
            </div>

            <div className="flex items-center justify-between px-2 text-xs text-neutral-500">
              <div>Enter to send • Shift + Enter for new line</div>
              <div className={`transition-colors ${aiReady ? "text-green-400" : "text-red-400"}`}>{aiReady ? "Ready" : "Offline"}</div>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: #404040;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #525252;
        }

        code {
          background: rgba(255, 255, 255, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.9em;
        }

        strong {
          font-weight: 600;
          color: inherit;
        }

        em {
          font-style: italic;
        }

        ul, li {
          margin-left: 1.25rem;
          line-height: 1.5;
        }

        p {
          margin: 0;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}
