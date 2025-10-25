import { useRef, useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import { Button } from "./Button";
import { Input } from "./Input";
import { CrossIcon } from "../../icons/CrossIcon";

enum ContentType {
  Youtube = "youtube",
  Twitter = "twitter",
}

interface CreateContentModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateContentModal({ open, onClose }: CreateContentModalProps) {
  const titleRef = useRef<HTMLInputElement>(null);
  const linkRef = useRef<HTMLInputElement>(null);
  const [type, setType] = useState(ContentType.Youtube);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function addContent() {
    const title = titleRef.current?.value;
    const link = linkRef.current?.value;

    if (!title || !link) {
      alert("Please fill out all fields");
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.post(
        `${BACKEND_URL}/api/v1/content`,
        { link, title, type },
        { headers: { Authorization: localStorage.getItem("token") } }
      );
      onClose();
    } catch {
      alert("Something went wrong while adding content.");
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-purple-900/70 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      ></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="relative w-11/12 max-w-md bg-white/95 rounded-2xl shadow-lg border border-purple-100 p-8 animate-slideUp backdrop-blur-lg flex flex-col items-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-purple-600 transition-colors"
            title="Close"
          >
            <CrossIcon  />
          </button>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              Add New Content
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Paste your YouTube or Twitter link below
            </p>
          </div>
          <div className="flex flex-col gap-4 w-full items-center mb-6">
            <Input reference={titleRef} placeholder="Enter title..." />
            <Input reference={linkRef} placeholder="Paste link here..." />
          </div>
          <div className="mb-6 w-full text-center">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Select Content Type</h3>
            <div className="flex justify-center gap-3">
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  type === ContentType.Youtube
                    ? "bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-md scale-105"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                }`}
                onClick={() => setType(ContentType.Youtube)}
              >
                YouTube
              </button>
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  type === ContentType.Twitter
                    ? "bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-md scale-105"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                }`}
                onClick={() => setType(ContentType.Twitter)}
              >
                Twitter (X)
              </button>
            </div>
          </div>
          <div className="w-full max-w-xs">
            <Button
              onClick={addContent}
              variant="primary"
              text={isSubmitting ? "Submitting..." : "Add Content"}
              fullWidth
            />
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.35s ease forwards; }
        .animate-slideUp { animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </>
  );
}
