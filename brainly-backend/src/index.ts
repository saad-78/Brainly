import express from "express";
import { random } from "./utils";
import jwt from "jsonwebtoken";
import { ContentModel, LinkModel, UserModel, NoteModel } from "./db";
import { JWT_PASSWORD } from "./config";
import { userMiddleware } from "./middleware";
import cors from "cors";
import mongoose from "mongoose";
import Groq from "groq-sdk";
import {
  getYouTubeContent,
  getTwitterContent,
  getLatestNews,
} from "./scraper"; 

const app = express();
app.use(express.json());
app.use(cors());

app.post("/api/v1/signup", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    await UserModel.create({
      username: username,
      password: password,
    });

    res.json({
      message: "User signed up",
    });
  } catch (e) {
    res.status(411).json({
      message: "User already exists",
    });
  }
});

app.post("/api/v1/signin", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const existingUser = await UserModel.findOne({
    username,
    password,
  });
  if (existingUser) {
    const token = jwt.sign(
      {
        id: existingUser._id,
      },
      JWT_PASSWORD
    );

    res.json({
      token,
    });
  } else {
    res.status(403).json({
      message: "Incorrrect credentials",
    });
  }
});

app.post("/api/v1/content", userMiddleware, async (req, res) => {
  const link = req.body.link;
  const type = req.body.type;
  const shareHash = req.body.shareHash;
  const description = req.body.description; // NEW: Get description from frontend

  let userId = req.userId;

  if (shareHash) {
    const sharedLink = await LinkModel.findOne({ hash: shareHash });
    if (!sharedLink) {
      return res.status(404).json({ message: "Invalid share link" });
    }
    // @ts-ignore
    userId = sharedLink.userId;
  }

  await ContentModel.create({
    link,
    type,
    title: req.body.title,
    description: description || "", // NEW: Save description
    userId: userId,
    tags: [],
  });

  res.json({
    message: "Content added",
  });
});

app.get("/api/v1/content", userMiddleware, async (req, res) => {
  // @ts-ignore
  const userId = req.userId;
  const content = await ContentModel.find({
    userId: userId,
  }).populate("userId", "username");
  res.json({
    content,
  });
});

app.post("/api/v1/brain/share", userMiddleware, async (req, res) => {
  const share = req.body.share;
  if (share) {
    const existingLink = await LinkModel.findOne({
      userId: req.userId,
    });

    if (existingLink) {
      res.json({
        hash: existingLink.hash,
      });
      return;
    }
    const hash = random(10);
    await LinkModel.create({
      userId: req.userId,
      hash: hash,
    });

    res.json({
      hash,
    });
  } else {
    await LinkModel.deleteOne({
      userId: req.userId,
    });

    res.json({
      message: "Removed link",
    });
  }
});

app.get("/api/v1/brain/:shareLink", async (req, res) => {
  const hash = req.params.shareLink;

  const link = await LinkModel.findOne({
    hash,
  });

  if (!link) {
    res.status(411).json({
      message: "Sorry incorrect input",
    });
    return;
  }
  const content = await ContentModel.find({
    userId: link.userId,
  });

  console.log(link);
  const user = await UserModel.findOne({
    _id: link.userId,
  });

  if (!user) {
    res.status(411).json({
      message: "user not found, error should ideally not happen",
    });
    return;
  }

  res.json({
    username: user.username,
    content: content,
  });
});

app.delete("/api/v1/content", userMiddleware, async (req, res) => {
  const { contentId } = req.body;

  if (!contentId) {
    return res.status(400).json({ message: "contentId required" });
  }

  if (!mongoose.Types.ObjectId.isValid(contentId)) {
    return res.status(400).json({ message: "Invalid contentId format" });
  }

  try {
    const result = await ContentModel.deleteOne({
      _id: contentId,
      userId: req.userId,
    });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "Content not found or not yours" });
    }

    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Failed to delete content" });
  }
});

app.get("/api/v1/user", userMiddleware, async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId).select("username");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch user data" });
  }
});

// ===== NOTE ENDPOINTS =====

app.post("/api/v1/note", userMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    const noteCount = await NoteModel.countDocuments({ userId: req.userId });
    const colorIndex = noteCount % 10;

    // @ts-ignore
    const note = await NoteModel.create({
      userId: req.userId,
      title: title.trim(),
      content: content || "",
      colorIndex: colorIndex,
      isPinned: false,
    });

    res.json({ message: "Note created", note });
  } catch (err) {
    console.error("Note creation error:", err);
    res.status(500).json({ message: "Failed to create note", error: err });
  }
});

app.get("/api/v1/notes", userMiddleware, async (req, res) => {
  try {
    // @ts-ignore
    const notes = await NoteModel.find({ userId: req.userId }).sort({
      isPinned: -1,
      updatedAt: -1,
    });

    res.json({ notes });
  } catch (err) {
    console.error("Fetch notes error:", err);
    res.status(500).json({ message: "Failed to fetch notes" });
  }
});

app.put("/api/v1/note/:noteId", userMiddleware, async (req, res) => {
  try {
    const { noteId } = req.params;
    const { title, content, isPinned } = req.body;

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return res.status(400).json({ message: "Invalid note ID" });
    }

    // @ts-ignore
    const note = await NoteModel.findOneAndUpdate(
      { _id: noteId, userId: req.userId },
      {
        title: title || undefined,
        content: content !== undefined ? content : undefined,
        isPinned: isPinned !== undefined ? isPinned : undefined,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json({ message: "Note updated", note });
  } catch (err) {
    console.error("Update note error:", err);
    res.status(500).json({ message: "Failed to update note" });
  }
});

app.delete("/api/v1/note/:noteId", userMiddleware, async (req, res) => {
  try {
    const { noteId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return res.status(400).json({ message: "Invalid note ID" });
    }

    // @ts-ignore
    const result = await NoteModel.deleteOne({
      _id: noteId,
      userId: req.userId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json({ message: "Note deleted" });
  } catch (err) {
    console.error("Delete note error:", err);
    res.status(500).json({ message: "Failed to delete note" });
  }
});

app.post("/api/v1/note/:noteId/pin", userMiddleware, async (req, res) => {
  try {
    const { noteId } = req.params;
    const { isPinned } = req.body;

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return res.status(400).json({ message: "Invalid note ID" });
    }

    // @ts-ignore
    const note = await NoteModel.findOneAndUpdate(
      { _id: noteId, userId: req.userId },
      { isPinned, updatedAt: new Date() },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json({ message: "Note updated", note });
  } catch (err) {
    console.error("Pin note error:", err);
    res.status(500).json({ message: "Failed to pin note" });
  }
});

// ===== BRAINLY AI ENDPOINTS =====

app.post("/api/v1/ai/ask", userMiddleware, async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ message: "Question required" });
    }

    // @ts-ignore
    const userId = req.userId;

    console.log("Fetching user data for AI...");

    // Fetch user's notes
    const notes = await NoteModel.find({ userId });
    const notesText = notes
      .map((n) => `Note: ${n.title}\nContent: ${n.content}`)
      .join("\n\n");

    // Fetch user's content
    const content = await ContentModel.find({ userId });

    // NEW: Scrape actual content from links + get latest news
    let enrichedContentText = "";

    for (const item of content) {
      //@ts-ignore
      let text = `${item.type.toUpperCase()}: ${item.title}`;

      try {
        // NEW: Get actual content from link
        if (item.type === "youtube" && item.link) {
          console.log(`Fetching YouTube content for ${item.title}...`);
          const youtubeData = await getYouTubeContent(
            //@ts-ignore

            item.link,
            process.env.YOUTUBE_API_KEY || ""
          );
          if (youtubeData) {
            text += `\nYouTube Details:\n${youtubeData}`;
          }
        } else if (item.type === "twitter" && item.link) {
          console.log(`Fetching Twitter content for ${item.title}...`);
          //@ts-ignore

          const twitterData = await getTwitterContent(item.link);
          if (twitterData) {
            text += `\nTweet Content: ${twitterData}`;
          }
        }

        // NEW: Add user's description if available
        if (item.description) {
          text += `\nUser Notes: ${item.description}`;
        }

        // NEW: Get latest news about this topic
        console.log(`Fetching latest news about ${item.title}...`);
        const newsData = await getLatestNews(
          //@ts-ignore

          item.title,
          process.env.NEWS_API_KEY || ""
        );
        if (newsData) {
          text += `\n\nLatest News about "${item.title}":\n${newsData}`;
        }
      } catch (itemErr) {
        console.error(`Error processing content item: ${item.title}`, itemErr);
        // Continue with other items if one fails
      }

      enrichedContentText += text + "\n\n";
    }

    const prompt = `Based on this user's saved content and latest news:

NOTES:
${notesText || "No notes saved"}

SAVED CONTENT WITH LATEST INFO:
${enrichedContentText || "No content saved"}

USER QUESTION: ${question}

Answer based on ALL the information above - the user's saved content, actual content details, AND latest news. Provide the most current and comprehensive answer. If information is not available, say so honestly.`;

    console.log("Sending to Groq with enriched context...");

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const message = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      max_tokens: 1000,
    });

    const answer =
      message.choices[0]?.message?.content || "No answer generated";

    res.json({
      answer,
      sources: {
        notesCount: notes.length,
        contentCount: content.length,
      },
    });
  } catch (err) {
    console.error("AI ask error:", err);
    res.status(500).json({ message: "Failed to process question" });
  }
});

app.get("/api/v1/ai/health", async (req, res) => {
  try {
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    await groq.chat.completions.create({
      messages: [{ role: "user", content: "test" }],
      model: "llama-3.3-70b-versatile",
      max_tokens: 10,
    });

    res.json({ status: "AI is ready", ready: true });
  } catch {
    res.json({ status: "AI is offline", ready: false });
  }
});

app.listen(3000, () => {
  console.log("Server started on 3000");
});
