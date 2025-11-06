import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../config";

interface ContentItem {
  createdAt: string | number | Date;
  createdAt: string | number | Date;
  _id: string;
  title: string;
  link: string;
  type: "youtube" | "twitter";
}

export function useContent() {
  const [contents, setContents] = useState<ContentItem[]>([]);

  function refresh() {
    axios
      .get(`${BACKEND_URL}/api/v1/content`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      })
      .then((response) => {
        setContents(response.data.content);
      })
      .catch((err) => console.error("Failed to load contents:", err));
  }

  useEffect(() => {
    refresh();
    const interval = setInterval(() => {
      refresh();
    }, 10 * 1000);

    return () => clearInterval(interval);
  }, []);

  return { contents, refresh };
}
