import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { Card } from "../components/ui/Card";
import { CreateContentModal } from "../components/ui/CreateContentModal";
import { Button } from "../components/ui/Button";
import { PlusIcon } from "../icons/PlusIcon";
import { LoadingSkeleton } from "../components/ui/LoadingSkeleton";
import toast, { Toaster } from "react-hot-toast";

export function SharePage() {
  const { shareHash } = useParams();
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchSharedBrain = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/api/v1/brain/${shareHash}`
        );
        setContents(response.data.content);
        setUsername(response.data.username);
      } catch (err) {
        console.error("Failed to load shared brain:", err);
        setError(true);
        toast.error("Failed to load shared brain");
      } finally {
        setLoading(false);
      }
    };

    if (shareHash) {
      fetchSharedBrain();
    }
  }, [shareHash]);

  const handleContentAdded = () => {
    const fetchSharedBrain = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/api/v1/brain/${shareHash}`
        );
        setContents(response.data.content);
        toast.success("Content added to brain!");
      } catch (err) {
        console.error("Failed to refresh brain:", err);
      }
    };
    fetchSharedBrain();
  };

  // Filter contents based on search
  const filteredContents = contents.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center overflow-hidden">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center overflow-hidden">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Invalid Share Link
          </h1>
          <p className="text-zinc-500">
            This brain could not be found or the link has expired.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-black via-zinc-950 to-black overflow-hidden flex flex-col">
      <Toaster position="top-center" />
      <CreateContentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        shareHash={shareHash}
        onSuccess={handleContentAdded}
      />

      {/* Header - Fixed */}
      <div className="flex-shrink-0 bg-gradient-to-br from-black via-zinc-950 to-black border-b border-zinc-800 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                {username}'s Brain
              </h1>
              <p className="text-zinc-500 text-sm mt-1">
                {filteredContents.length} {filteredContents.length === 1 ? "item" : "items"}
                {searchQuery ? " found" : " shared"}
              </p>
            </div>
            <Button
              onClick={() => setModalOpen(true)}
              variant="primary"
              text="Add to Brain"
              startIcon={<PlusIcon />}
            />
          </div>

          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search brain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 px-4 py-2 md:py-3 rounded-xl focus:outline-none focus:border-zinc-700 transition-all text-sm md:text-base"
          />
        </div>
      </div>

      {/* Scrollable Content Area - Hidden Scrollbar */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          {filteredContents.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-96">
              <div className="text-6xl mb-4">🧠</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {searchQuery ? "No results found" : "This brain is empty"}
              </h2>
              <p className="text-zinc-500 text-center mb-6">
                {searchQuery
                  ? "Try a different search"
                  : `Be the first to add content to ${username}'s shared brain`}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => setModalOpen(true)}
                  variant="primary"
                  text="Add Content Now"
                  startIcon={<PlusIcon />}
                />
              )}
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
              {filteredContents.map((content: any) => (
                <div key={content._id} className="break-inside-avoid animate-fade-in">
                  <Card
                    type={content.type}
                    link={content.link}
                    title={content.title}
                    onDelete={undefined}
                    onShare={(link) => {
                      navigator.clipboard.writeText(link);
                      toast.success("Link copied!");
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
