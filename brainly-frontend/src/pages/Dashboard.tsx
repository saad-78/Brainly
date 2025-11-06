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
            } transition-all duration-300 max-w-md w-full bg-zinc-900 border border-zinc-700 shadow-2xl rounded-2xl px-5 py-4 flex justify-between items-center backdrop-blur-xl`}
          >
            <div className="flex flex-col">
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
              <div
                className="cursor-pointer text-zinc-500 hover:text-zinc-300 transition-colors"
                onClick={() => toast.dismiss(t.id)}
              >
                <CrossIcon />
              </div>
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

  // Filter contents based on search AND type filter
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
    <div className="flex h-screen overflow-hidden bg-black md:flex-row flex-col">
      <Toaster position="top-center" />
      <Sidebar onFilterChange={setSelectedFilter} selectedFilter={selectedFilter} />

      <div className="flex-1 ml-0 md:ml-72 flex flex-col h-screen overflow-hidden">
        <CreateContentModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        />

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

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 bg-gradient-to-br from-black via-zinc-950 to-black scrollbar-hide">
          {error ? (
            <ErrorBoundary onRetry={() => { setError(false); refresh(); } } children={undefined} />
          ) : loading ? (
            <LoadingSkeleton />
          ) : filteredContents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-zinc-700 text-5xl md:text-6xl mb-4">
                {selectedFilter === "twitter" ? "𝕏" : selectedFilter === "youtube" ? "📺" : "🧠"}
              </div>
              <h3 className="text-zinc-400 text-lg md:text-xl font-semibold mb-2">
                {getEmptyStateMessage()}
              </h3>
              <p className="text-zinc-600 text-sm md:text-base mb-6">
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
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
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
