import mongoose, { model, Model, Schema } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

mongoose.connect(process.env.MONGO_URL as string);

const UserSchema = new Schema({
  username: { type: String, unique: true },
  password: String,
});

export const UserModel = model("User", UserSchema);

const ContentSchema = new Schema({
  title: String,
  link: String,
  description: String, 
  tags: [{ type: mongoose.Types.ObjectId, ref: "Tag" }],
  type: String,
  userId: [{ type: mongoose.Types.ObjectId, ref: "User", required: true }],
});

const LinkSchema = new Schema({
  hash: String,
  userId: { type: mongoose.Types.ObjectId, ref: "User", required: true, unique: true },
});

const NoteSchema = new Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    default: "",
  },
  colorIndex: {
    type: Number,
    default: 0,
    min: 0,
    max: 9,
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const LinkModel = model("Links", LinkSchema);
export const ContentModel = model("Content", ContentSchema);
export const NoteModel = model("Note", NoteSchema);
