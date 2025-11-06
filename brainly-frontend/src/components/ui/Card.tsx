import { useEffect, useState } from "react";
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
  const [isShort, setIsShort] = useState(false);
  const [embedUrl, setEmbedUrl] = useState("");


  useEffect(() => {
    if (type === "youtube") {
      try {
        const url = new URL(link);
        let videoId = "";
        let isYouTubeShort = false;


        if (link.includes("/shorts/")) {
          isYouTubeShort = true;
          videoId = link.split("/shorts/")[1]?.split("?")[0] || "";
        } else if (url.hostname.includes("youtube.com")) {
          videoId = url.searchParams.get("v") || "";
          isYouTubeShort = false;
        } else if (url.hostname.includes("youtu.be")) {
          videoId = url.pathname.substring(1);
          isYouTubeShort = false;
        }


        if (videoId) {
          setEmbedUrl(`https://www.youtube.com/embed/${videoId}`);
          setIsShort(isYouTubeShort);
        }
      } catch (error) {
        console.error("Invalid YouTube URL:", link);
      }
    }
  }, [link, type]);


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


  const typeStyles = {
    youtube: "from-red-500/10 to-red-500/5 border-red-500/20",
    twitter: "from-blue-500/10 to-blue-500/5 border-blue-500/20",
  };


  return (
    <div
      className={`group relative bg-gradient-to-br ${typeStyles[type]} backdrop-blur-xl border rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] flex flex-col h-fit`}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-3 md:p-4 border-b border-zinc-800/50 bg-black/20 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-2 text-white font-semibold">
          <div className="text-zinc-400">
            <NoteBook />
          </div>
          <span className="truncate max-w-[8rem] md:max-w-[10rem] text-xs md:text-sm" title={title}>
            {title}
          </span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            className="text-zinc-400 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-all text-sm"
            onClick={() => onShare?.(link)}
          >
            <ShareIcon />
          </button>

          {onDelete && (
            <button
              className="text-zinc-400 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg transition-all text-sm"
              onClick={onDelete}
            >
              <Delete />
            </button>
          )}
        </div>
      </div>


      {/* Content */}
      <div className="p-3 md:p-4 flex-1 bg-black/10 flex items-center justify-center w-full">
        {type === "youtube" && embedUrl && (
          <div
            className={`relative w-full overflow-hidden rounded-lg bg-black ${
              isShort ? "max-w-xs mx-auto" : "w-full"
            }`}
            style={{
              paddingTop: isShort ? "177.78%" : "56.25%",
            }}
          >
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
          <div className="w-full max-h-96 overflow-y-auto rounded-lg p-2 md:p-3 bg-black/20 backdrop-blur-sm scrollbar-hide">
            <blockquote className="twitter-tweet">
              <a href={link.replace("x.com", "twitter.com")}></a>
            </blockquote>
          </div>
        )}
      </div>


      {/* Hover Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
}
