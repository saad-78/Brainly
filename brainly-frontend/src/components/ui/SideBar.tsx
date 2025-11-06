import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Logo } from "../../icons/Logo";
import { TwitterIcon } from "../../icons/TwitterIcon";
import { YoutubeIcon } from "../../icons/YoutubeIcon";
import { SidebarItem } from "./SideBarItem";
import axios from "axios";
import { BACKEND_URL } from "../../config";

interface SidebarProps {
  onFilterChange?: (filter: "all" | "twitter" | "youtube") => void;
  selectedFilter?: "all" | "twitter" | "youtube";
}

export function Sidebar({
  onFilterChange,
  selectedFilter = "all",
}: SidebarProps) {
  const [username, setUsername] = useState<string>("User");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await axios.get(`${BACKEND_URL}/api/v1/user`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUsername(response.data.username);
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/signin");
  };

  const handleFilterChange = (filter: "all" | "twitter" | "youtube") => {
    onFilterChange?.(filter);
  };

  return (
    <div className="h-screen bg-zinc-950 border-r border-zinc-800 w-72 fixed left-0 top-0 px-6 py-8 flex flex-col overflow-y-auto">
      {/* Logo Section */}
      <div className="flex items-center gap-3 mb-12">
        <div className="text-white text-3xl">
          <Logo />
        </div>
        <span className="text-2xl font-bold text-white tracking-tight">
          Brainly
        </span>
      </div>

      {/* Navigation Items */}
      <div className="flex flex-col gap-2 flex-1">
        {/* Twitter Filter */}
        <div
          className={`flex items-center justify-between rounded-lg px-4 py-3 cursor-pointer transition-all duration-200 ${selectedFilter === "twitter"
              ? "bg-zinc-800 text-white"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
            }`}
          onClick={() => handleFilterChange("twitter")}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="text-lg flex-shrink-0">
              <TwitterIcon />
            </div>
            <div className="font-medium text-sm truncate">Twitter / X</div>
          </div>
          {selectedFilter === "twitter" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleFilterChange("all");
              }}
              className="text-zinc-400 hover:text-white ml-2 flex-shrink-0 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* YouTube Filter */}
        <div
          className={`flex items-center justify-between rounded-lg px-4 py-3 cursor-pointer transition-all duration-200 ${selectedFilter === "youtube"
              ? "bg-zinc-800 text-white"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
            }`}
          onClick={() => handleFilterChange("youtube")}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="text-lg flex-shrink-0">
              <YoutubeIcon />
            </div>
            <div className="font-medium text-sm truncate">YouTube</div>
          </div>
          {selectedFilter === "youtube" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleFilterChange("all");
              }}
              className="text-zinc-400 hover:text-white ml-2 flex-shrink-0 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        <Link
          to="/notes"
          className="flex items-center justify-between rounded-lg px-4 py-3 cursor-pointer transition-all duration-200 text-zinc-400 hover:text-white hover:bg-zinc-800/40"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="text-lg flex-shrink-0">📝</div>
            <div className="font-medium text-sm truncate">Notes</div>
          </div>
        </Link>

        <Link
          to="/ai"
          className="flex items-center justify-between rounded-lg px-4 py-3 cursor-pointer transition-all duration-200 text-zinc-400 hover:text-white hover:bg-zinc-800/40"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="text-lg flex-shrink-0">🧠</div>
            <div className="font-medium text-sm truncate">Brainly AI</div>
          </div>
        </Link>


      </div>

      <div className="border-t border-zinc-800 pt-6 mt-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg text-sm flex-shrink-0">
            {username[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">
              {username}
            </p>
            <p className="text-zinc-500 text-xs truncate">
              @{username.toLowerCase()}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all font-medium text-sm active:scale-95"
        >
          <span className="text-lg">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
