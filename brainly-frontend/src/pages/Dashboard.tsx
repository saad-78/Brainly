import { useEffect, useState } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { CreateContentModal } from "../components/ui/CreateContentModal";
import { PlusIcon } from "../icons/PlusIcon";
import { ShareIcon } from "../icons/ShareIcon";
import { Sidebar } from "../components/ui/SideBar";
import { useContent } from "../hooks/useContent";
import { BACKEND_URL } from "../config";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../hooks/auth";
import toast, { Toaster } from "react-hot-toast";
import { CrossIcon } from "../icons/CrossIcon";
import { LoadingSkeleton } from "../components/ui/LoadingSkeleton";
import { ErrorBoundary } from "../components/ui/ErrorBoundary";

type FilterType = "all" | "twitter" | "youtube";

export function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const { contents, refresh } = useContent();
  const navigate = useNavigate();
  const [copiedIds, setCopiedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) navigate("/signin");
  }, [navigate]);

  useEffect(() => {
    refresh();
  }, [modalOpen]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setModalOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, []);

  const showShareToast = (link: string, id: string) => {
    toast.custom(
      (t) => {
        const isCopied = copiedIds.includes(id);

        const handleCopy = () => {
          navigator.clipboard.writeText(link);
          setCopiedIds((prev) => [...prev, id]);
          setCopied(true);
          setTimeout(() => {
            toast.dismiss(t.id);
            setCopied(false);
          }, 1500);
        };

        return (
          <div
            className={`${
              t.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"
            } transition-all duration-300 bg-zinc-900 border border-zinc-700 shadow-2xl rounded-2xl px-5 py-4 flex justify-between items-center backdrop-blur-xl
               max-w-full md:max-w-md w-[calc(100vw-2rem)] md:w-full mx-2 md:mx-0`}
          >
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-zinc-100 text-sm break-all">
                {link}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {!isCopied ? (
                <button
                  onClick={handleCopy}
                  className="bg-white text-black px-4 py-2 rounded-lg hover:bg-zinc-200 transition-all font-semibold text-sm active:scale-95"
                >
                  Copy
                </button>
              ) : (
                <div className="bg-green-500/20 text-green-400 w-8 h-8 flex justify-center items-center rounded-full transition-all duration-500 animate-pulse">
                  ✔
                </div>
              )}
              <button
                type="button"
                aria-label="Dismiss"
                className="cursor-pointer text-zinc-500 hover:text-zinc-300 transition-colors"
                onClick={() => toast.dismiss(t.id)}
              >
                <CrossIcon />
              </button>
            </div>
          </div>
        );
      },
      { duration: 4000 }
    );
  };

  const handleShareBrain = async () => {
    setShareLoading(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/brain/share`,
        { share: true },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      const shareUrl = `http://localhost:5173/share/${response.data.hash}`;
      showShareToast(shareUrl, response.data.hash);
    } catch (err) {
      console.error(err);
      toast.error("Failed to share brain");
    } finally {
      setShareLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/signin");
  };

  let filteredContents = contents.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedFilter === "twitter") {
    filteredContents = filteredContents.filter((item) => item.type === "twitter");
  } else if (selectedFilter === "youtube") {
    filteredContents = filteredContents.filter((item) => item.type === "youtube");
  }

  const getEmptyStateMessage = () => {
    if (selectedFilter === "twitter") {
      return searchQuery ? "No Twitter posts found" : "No Twitter posts saved";
    } else if (selectedFilter === "youtube") {
      return searchQuery ? "No YouTube videos found" : "No YouTube videos saved";
    } else {
      return searchQuery ? "No results found" : "Your brain is empty";
    }
  };

  return (
    <div
      className="
        flex md:h-screen h-screen md:overflow-hidden overflow-hidden
        bg-black md:flex-row flex-col
      "
      style={{
        height: isMobile ? "100dvh" : undefined,
        paddingTop: isMobile ? "env(safe-area-inset-top)" : undefined,
      }}
    >
      <Toaster
        position={isMobile ? "bottom-center" : "top-center"}
        containerStyle={{
          top: "env(safe-area-inset-top)",
          bottom: "env(safe-area-inset-bottom)",
        }}
      />

      <div className="hidden md:block">
        <Sidebar onFilterChange={setSelectedFilter} selectedFilter={selectedFilter} />
      </div>

      <div
        className="
          flex-1 ml-0 md:ml-72 flex flex-col
          h-full md:overflow-hidden overflow-hidden
        "
      >
        <CreateContentModal open={modalOpen} onClose={() => setModalOpen(false)} />

        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-gradient-to-r from-black via-zinc-950 to-black border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
              B
            </div>
            <span className="text-white font-semibold text-lg">Brainly</span>
          </div>
          <button
            onClick={handleLogout}
            aria-label="Logout"
            className="p-2 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 active:scale-95 transition-all"
            title="Logout"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-4 p-4 md:p-6 bg-gradient-to-br from-black via-zinc-950 to-black border-b border-zinc-900">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Your Brain
              </h1>
              <p className="text-zinc-500 text-sm mt-1">
                {filteredContents.length} {filteredContents.length === 1 ? "item" : "items"}
                {searchQuery ? " found" : " saved"}
                {selectedFilter !== "all" && ` • Showing ${selectedFilter}`}
              </p>
            </div>
            <div className="flex gap-2 md:gap-3 flex-col md:flex-row">
              <Button
                onClick={() => setModalOpen(true)}
                variant="primary"
                text={loading ? "Loading..." : "Add Content"}
                startIcon={<PlusIcon />}
                loading={loading}
                fullWidth
              />
              <Button
                onClick={handleShareBrain}
                variant="secondary"
                text={shareLoading ? "Sharing..." : "Share Brain"}
                startIcon={<ShareIcon />}
                loading={shareLoading}
                fullWidth
              />
            </div>
          </div>

          <div className="md:hidden">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {(["all", "twitter", "youtube"] as const).map((ft) => {
                const active = selectedFilter === ft;
                return (
                  <button
                    key={ft}
                    onClick={() => setSelectedFilter(ft)}
                    className={[
                      "px-3 py-1.5 rounded-full text-sm capitalize whitespace-nowrap transition-all",
                      active
                        ? "bg-white text-black shadow-lg"
                        : "bg-zinc-900 text-zinc-300 border border-zinc-800 hover:border-zinc-700",
                    ].join(" ")}
                  >
                    {ft}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => navigate("/ai")}
            className="md:hidden w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <circle cx="9" cy="10" r="1" />
              <circle cx="15" cy="10" r="1" />
              <path d="M9 14c1 1 3 1 4 0" />
            </svg>
            Chat with Brainly AI
          </button>

          {copied && (
            <div className="animate-fade-in bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
              ✅ Link copied! Share it with anyone
            </div>
          )}

          <input
            type="text"
            placeholder="Search your brain... (Cmd+K to add)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 px-4 py-2 md:py-3 rounded-xl focus:outline-none focus:border-zinc-700 transition-all text-sm md:text-base"
          />
        </div>

        <div
          className="
            flex-1 overflow-y-scroll overflow-x-hidden
            px-4 md:px-6 pt-4 md:pt-6
            bg-gradient-to-br from-black via-zinc-950 to-black
            scrollbar-hide
          "
          style={{
            paddingBottom: isMobile ? "calc(1rem + env(safe-area-inset-bottom))" : "1.5rem",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {error ? (
            <ErrorBoundary
              onRetry={() => {
                setError(false);
                refresh();
              }}
              children={undefined}
            />
          ) : loading ? (
            <LoadingSkeleton />
          ) : filteredContents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
              <div className="text-zinc-700 text-5xl md:text-6xl mb-4">
                {selectedFilter === "twitter" ? "𝕏" : selectedFilter === "youtube" ? "📺" : "🧠"}
              </div>
              <h3 className="text-zinc-400 text-lg md:text-xl font-semibold mb-2">
                {getEmptyStateMessage()}
              </h3>
              <p className="text-zinc-600 text-sm md:text-base mb-6 text-center px-4">
                {selectedFilter !== "all"
                  ? `Try searching or add ${selectedFilter} content`
                  : "Start adding content to build your second brain"}
              </p>
              <Button
                onClick={() => setModalOpen(true)}
                variant="primary"
                text="Add Content"
                startIcon={<PlusIcon />}
              />
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6 pb-4">
              {filteredContents.map(({ _id, type, link, title }) => (
                <div key={_id} className="break-inside-avoid animate-fade-in">
                  <Card
                    type={type}
                    link={link}
                    title={title}
                    onDelete={() => {
                      axios
                        .delete(`${BACKEND_URL}/api/v1/content`, {
                          data: { contentId: _id },
                          headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                          },
                        })
                        .then(() => {
                          toast.success("Content deleted");
                          refresh();
                        })
                        .catch(() => {
                          setError(true);
                          toast.error("Failed to delete content");
                        });
                    }}
                    onShare={(link) => showShareToast(link, _id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
