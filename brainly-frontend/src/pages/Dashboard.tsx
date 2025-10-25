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

export function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const { contents, refresh } = useContent();
  const navigate = useNavigate();
  const [copiedIds, setCopiedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!isAuthenticated()) navigate("/signin");
  }, [navigate]);

  useEffect(() => {
    refresh();
  }, [modalOpen]);

  const showShareToast = (link: string, id: string) => {
    toast.custom(
      (t) => {
        const isCopied = copiedIds.includes(id);

        const handleCopy = () => {
          navigator.clipboard.writeText(link);
          setCopiedIds((prev) => [...prev, id]);
          setTimeout(() => {
            toast.dismiss(t.id);
          }, 1500);
        };

        return (
          <div
            className={`${t.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"
              } transition-all duration-300 max-w-md w-full bg-white shadow-xl border border-purple-300 rounded-xl px-5 py-3 flex justify-between items-center`}
          >
            <div className="flex flex-col">
              <span className="font-medium text-gray-800 break-all">{link}</span>
            </div>
            <div className="flex items-center gap-2">
              {!isCopied ? (
                <button
                  onClick={handleCopy}
                  className="bg-purple-600 text-white px-3 py-1 rounded-md hover:bg-purple-700 transition-all"
                >
                  Copy
                </button>
              ) : (
                <div className="bg-green-100 text-green-700 w-7 h-7 flex justify-center items-center rounded-full transition-all duration-500">
                  ✔
                </div>
              )}
              <div
                className="cursor-pointer text-gray-400 hover:text-gray-700"
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
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/brain/share`,
        { share: true },
        { headers: { Authorization: localStorage.getItem("token") } }
      );
      const shareUrl = `http://localhost:5173/share/${response.data.hash}`;
      showShareToast(shareUrl, response.data.hash);
    } catch (err) {
      console.error(err);
      toast.error("Failed to share brain");
    }
  };

  return (
    <div className="flex min-h-screen bg-purple-50">
      <Toaster position="top-center" />
      <Sidebar />

      <div className="flex-1 ml-72 p-6">
        <CreateContentModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        />

        <div className="flex justify-end gap-4 mb-4">
          <Button
            onClick={() => setModalOpen(true)}
            variant="primary"
            text="Add content"
            startIcon={<PlusIcon />}
          />
          <Button
            onClick={handleShareBrain}
            variant="secondary"
            text="Share brain"
            startIcon={<ShareIcon />}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {contents.map(({ _id, type, link, title }) => (
            <Card
              key={_id}
              type={type}
              link={link}
              title={title}
              onDelete={() => {
                axios.delete(`${BACKEND_URL}/api/v1/content`, {
                  data: { contentId: _id },
                  headers: { Authorization: localStorage.getItem("token") },
                })
                  .then(() => {
                    toast.success("Content deleted");
                    refresh();
                  })
                  .catch(() => toast.error("Failed to delete content"));
              }}
              onShare={(link) => showShareToast(link, _id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
