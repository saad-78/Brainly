import express from "express";
import { random } from "./utils";
import jwt from "jsonwebtoken";
import { ContentModel, LinkModel, UserModel, NoteModel } from "./db";
import { JWT_PASSWORD } from "./config";
import { userMiddleware } from "./middleware";
import cors from "cors";
import mongoose from "mongoose";

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

    // Get total notes count for this user to generate unique color
    const noteCount = await NoteModel.countDocuments({ userId: req.userId });
    const colorIndex = noteCount % 10; // 10 colors available

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

app.listen(3000, () => {
  console.log("Server started on 3000");
});
