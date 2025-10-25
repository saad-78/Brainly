import { useEffect } from "react";
import { ShareIcon } from "../../icons/ShareIcon";
import { NoteBook } from "../../icons/NoteBook";
import { Delete } from "../../icons/Delete";

interface CardProps {
  title: string;
  link: string;
  type: "twitter" | "youtube";
  onDelete?: () => void;
  onShare?: (link: string) => void;
}

export function Card({ title, link, type, onDelete, onShare }: CardProps) {
  let embedUrl = "";

  if (type === "youtube") {
    try {
      const url = new URL(link);
      let videoId = "";

      if (url.hostname.includes("youtube.com")) {
        videoId = url.searchParams.get("v") || "";
      } else if (url.hostname.includes("youtu.be")) {
        videoId = url.pathname.substring(1);
      }

      if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } catch (error) {
      console.error("Invalid YouTube URL:", link);
    }
  }

  useEffect(() => {
    if (type === "twitter") {
      const scriptExists = document.querySelector(
        "script[src='https://platform.twitter.com/widgets.js']"
      );

      if (!scriptExists) {
        const script = document.createElement("script");
        script.src = "https://platform.twitter.com/widgets.js";
        script.async = true;
        document.body.appendChild(script);
        script.onload = () => {
          if ((window as any).twttr?.widgets) {
            (window as any).twttr.widgets.load();
          }
        };
      } else {
        if ((window as any).twttr?.widgets) {
          (window as any).twttr.widgets.load();
        }
      }
    }
  }, [type, link]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-200 min-w-[18rem] max-w-xs flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
        <div className="flex items-center gap-2 text-gray-700 font-medium">
          <NoteBook  />
          <span className="truncate max-w-[10rem]">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="text-gray-500 hover:text-blue-500 cursor-pointer p-1 rounded transition-colors"
            onClick={() => onShare?.(link)}
            title="Share"
          >
            <ShareIcon />
          </div>
          <div
            className="text-gray-500 hover:text-red-500 cursor-pointer p-1 rounded transition-colors"
            onClick={onDelete}
            title="Delete"
          >
            <Delete />
          </div>
        </div>
      </div>

      <div className="p-4 flex-1">
        {type === "youtube" && embedUrl && (
          <div className="relative w-full overflow-hidden rounded-md" style={{ paddingTop: "56.25%" }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={embedUrl}
              title={title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
        )}

        {type === "twitter" && (
          <div className="max-h-80 overflow-y-auto p-1">
            <blockquote className="twitter-tweet">
              <a href={link.replace("x.com", "twitter.com")}></a>
            </blockquote>
          </div>
        )}
      </div>
    </div>
  );
}
