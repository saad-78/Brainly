import { useRef, useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import { Button } from "./Button";
import { Input } from "./Input";
import { CrossIcon } from "../../icons/CrossIcon";
import toast from "react-hot-toast";

enum ContentType {
  Youtube = "youtube",
  Twitter = "twitter",
}

interface CreateContentModalProps {
  open: boolean;
  onClose: () => void;
  shareHash?: string;
  onSuccess?: () => void;
}

export function CreateContentModal({
  open,
  onClose,
  shareHash,
  onSuccess,
}: CreateContentModalProps) {
  const titleRef = useRef<HTMLInputElement>(null);
  const linkRef = useRef<HTMLInputElement>(null);
  const [type, setType] = useState(ContentType.Youtube);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const detectContentType = (link: string): ContentType => {
    if (!link) return ContentType.Youtube;

    const lowercaseLink = link.toLowerCase().trim();

    // Twitter/X detection - check first
    if (lowercaseLink.includes("x.com") || lowercaseLink.includes("twitter.com")) {
      return ContentType.Twitter;
    }

    // YouTube detection
    if (
      lowercaseLink.includes("youtube.com") ||
      lowercaseLink.includes("youtu.be") ||
      lowercaseLink.includes("youtube")
    ) {
      return ContentType.Youtube;
    }

    return ContentType.Youtube;
  };

  const handleLinkChange = () => {
    const link = linkRef.current?.value || "";
    const detectedType = detectContentType(link);
    setType(detectedType);
  };

  async function addContent() {
    const title = titleRef.current?.value;
    const link = linkRef.current?.value;

    if (!title || !link) {
      toast.error("Please fill out all fields");
      return;
    }

    // Final detection before sending
    const finalType = detectContentType(link);

    try {
      setIsSubmitting(true);
      await axios.post(
        `${BACKEND_URL}/api/v1/content`,
        { link, title, type: finalType, shareHash },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      if (titleRef.current) titleRef.current.value = "";
      if (linkRef.current) linkRef.current.value = "";
      setType(ContentType.Youtube); // Reset to default

      toast.success("Content added successfully!");
      onSuccess?.();
      onClose();
    } catch {
      toast.error("Failed to add content");
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
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      ></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="relative w-11/12 max-w-md bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl shadow-2xl border border-zinc-800 p-8 animate-slideUp backdrop-blur-lg flex flex-col items-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
          >
            <CrossIcon />
          </button>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              Add New Content
            </h2>
            <p className="text-zinc-500 text-sm mt-1">
              Paste your YouTube or Twitter link below
            </p>
          </div>
          <div className="flex flex-col gap-4 w-full items-center mb-6">
            <Input
              reference={titleRef}
              placeholder="Enter title..."
              className="w-full bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500 px-4 py-3 rounded-xl focus:outline-none focus:border-zinc-600 transition-all"
            />
            <input
              ref={linkRef}
              type="text"
              placeholder="Paste link here..."
              onChange={handleLinkChange}
              className="w-full bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500 px-4 py-3 rounded-xl focus:outline-none focus:border-zinc-600 transition-all"
            />
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
