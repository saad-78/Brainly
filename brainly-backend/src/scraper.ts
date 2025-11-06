import axios from "axios";
import * as cheerio from "cheerio";

// Extract text from YouTube video metadata
export async function getYouTubeContent(videoUrl: string, apiKey: string) {
  try {
    const videoId = extractYouTubeId(videoUrl);
    if (!videoId || !apiKey) return "";

    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos`,
      {
        params: {
          key: apiKey,
          id: videoId,
          part: "snippet,statistics",
        },
      }
    );

    const video = response.data.items?.[0];
    if (!video) return "";

    return `
Title: ${video.snippet.title}
Channel: ${video.snippet.channelTitle}
Description: ${video.snippet.description}
Views: ${video.statistics.viewCount}
Published: ${video.snippet.publishedAt}
    `.trim();
  } catch (err) {
    console.error("YouTube scrape error:", err);
    return "";
  }
}

// Extract Twitter/X post content
export async function getTwitterContent(tweetUrl: string) {
  try {
    const response = await axios.get(tweetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 5000,
    });

    const $ = cheerio.load(response.data);
    
    // Try to extract tweet content from common meta tags
    let tweetContent = $('meta[property="og:description"]').attr("content") || "";
    
    if (!tweetContent) {
      tweetContent = $('meta[name="description"]').attr("content") || "";
    }

    return tweetContent || "Tweet content not available";
  } catch (err) {
    console.error("Twitter scrape error:", err);
    return "Could not fetch tweet content";
  }
}

// Get latest news about a topic
export async function getLatestNews(topic: string, newsApiKey: string) {
  try {
    if (!newsApiKey) {
      return "News API key not configured";
    }

    const response = await axios.get("https://newsapi.org/v2/everything", {
      params: {
        q: topic,
        apiKey: newsApiKey,
        sortBy: "publishedAt",
        language: "en",
        pageSize: 3,
        searchIn: "title,description",
      },
      timeout: 8000,
    });

    const articles = response.data.articles || [];
    
    if (articles.length === 0) {
      return `No recent news found about "${topic}"`;
    }

    return articles
      .map(
        (article: any) =>
          `• "${article.title}" (${article.source.name}) - ${new Date(article.publishedAt).toLocaleDateString()}\n  ${article.description || ""}`
      )
      .join("\n\n");
  } catch (err) {
    console.error("News API error:", err);
    return "Could not fetch latest news";
  }
}

function extractYouTubeId(url: string): string | null {
  const regexps = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const regexp of regexps) {
    const match = url.match(regexp);
    if (match) return match[1];
  }
  return null;
}
