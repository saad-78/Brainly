// pages/NotesPage.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { Button } from "../components/ui/Button";
import { PlusIcon } from "../icons/PlusIcon";
import { Delete } from "../icons/Delete";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../hooks/auth";

interface Note {
    _id: string;
    title: string;
    content: string;
    colorIndex: number;
    isPinned: boolean;
    updatedAt: string;
}

const COLORS = [
    "from-red-500/10 to-red-500/5 border-red-500/20 bg-red-900/20",
    "from-orange-500/10 to-orange-500/5 border-orange-500/20 bg-orange-900/20",
    "from-yellow-500/10 to-yellow-500/5 border-yellow-500/20 bg-yellow-900/20",
    "from-green-500/10 to-green-500/5 border-green-500/20 bg-green-900/20",
    "from-cyan-500/10 to-cyan-500/5 border-cyan-500/20 bg-cyan-900/20",
    "from-blue-500/10 to-blue-500/5 border-blue-500/20 bg-blue-900/20",
    "from-purple-500/10 to-purple-500/5 border-purple-500/20 bg-purple-900/20",
    "from-pink-500/10 to-pink-500/5 border-pink-500/20 bg-pink-900/20",
    "from-fuchsia-500/10 to-fuchsia-500/5 border-fuchsia-500/20 bg-fuchsia-900/20",
    "from-indigo-500/10 to-indigo-500/5 border-indigo-500/20 bg-indigo-900/20",
];

export function NotesPage() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [showForm, setShowForm] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated()) navigate("/signin");
        fetchNotes();
    }, [navigate]);

    const fetchNotes = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/api/v1/notes`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setNotes(response.data.notes);
        } catch (err) {
            toast.error("Failed to load notes");
        } finally {
            setLoading(false);
        }
    };

    const getColorStyle = (colorIndex: number) => {
        return COLORS[colorIndex % COLORS.length];
    };

    const handleSaveNote = async (title: string, content: string) => {
        if (!title.trim()) {
            toast.error("Please enter a title");
            return;
        }

        try {
            if (editingNote) {
                await axios.put(
                    `${BACKEND_URL}/api/v1/note/${editingNote._id}`,
                    { title, content },
                    { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
                );
                toast.success("Note updated!");
            } else {
                await axios.post(
                    `${BACKEND_URL}/api/v1/note`,
                    { title, content },
                    { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
                );
                toast.success("Note created!");
            }
            setEditingNote(null);
            setShowForm(false);
            fetchNotes();
        } catch (err) {
            console.error(err);
            toast.error("Failed to save note");
        }
    };


    const handleDeleteNote = async (e: React.MouseEvent, noteId: string) => {
        e.stopPropagation();
        try {
            await axios.delete(`${BACKEND_URL}/api/v1/note/${noteId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            toast.success("Note deleted!");
            fetchNotes();
        } catch (err) {
            toast.error("Failed to delete note");
        }
    };

    const handlePinNote = async (e: React.MouseEvent, note: Note) => {
        e.stopPropagation();
        try {
            await axios.post(
                `${BACKEND_URL}/api/v1/note/${note._id}/pin`,
                { isPinned: !note.isPinned },
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );
            fetchNotes();
        } catch (err) {
            toast.error("Failed to pin note");
        }
    };

    const filteredNotes = notes.filter((note) =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
    const unpinnedNotes = filteredNotes.filter((n) => !n.isPinned);

    if (loading) {
        return (
            <div className="h-screen w-screen bg-black flex items-center justify-center">
                <div className="text-white">Loading notes...</div>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen bg-gradient-to-br from-black via-zinc-950 to-black flex flex-col overflow-hidden">
            <Toaster position="top-center" />

            {/* Header */}
            <div className="flex-shrink-0 bg-gradient-to-br from-black via-zinc-950 to-black border-b border-zinc-800 backdrop-blur-lg">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="text-white hover:bg-zinc-800 p-2 rounded-lg transition-all"
                            >
                                ← Back
                            </button>
                            <h1 className="text-3xl md:text-4xl font-bold text-white">Notes</h1>
                        </div>
                        <Button
                            onClick={() => {
                                setEditingNote(null);
                                setShowForm(true);
                            }}
                            variant="primary"
                            text="New Note"
                            startIcon={<PlusIcon />}
                        />
                    </div>

                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Search notes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 px-4 py-2 md:py-3 rounded-xl focus:outline-none focus:border-zinc-700 transition-all"
                    />
                </div>
            </div>

            {/* Note Editor Modal */}
            {showForm && (
                <NoteForm
                    note={editingNote}
                    onSave={handleSaveNote}
                    onCancel={() => setShowForm(false)}
                />
            )}

            {/* Notes Grid - Scrollable */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                    {/* Pinned Notes Section */}
                    {pinnedNotes.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-zinc-400 text-sm font-semibold mb-4 uppercase tracking-wider">
                                Pinned
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                                {pinnedNotes.map((note) => (
                                    <div
                                        key={note._id}
                                        onClick={() => {
                                            setEditingNote(note);
                                            setShowForm(true);
                                        }}
                                        className={`group relative bg-gradient-to-br ${getColorStyle(
                                            note.colorIndex
                                        )} backdrop-blur-xl border rounded-2xl p-5 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer h-fit min-h-40`}
                                    >
                                        <div className="flex justify-between items-start gap-2">
                                            <h3 className="text-white font-semibold text-base line-clamp-2 flex-1">
                                                {note.title}
                                            </h3>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => handlePinNote(e, note)}
                                                    className="text-yellow-400 hover:text-yellow-300 transition-colors"
                                                >
                                                    📌
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeleteNote(e, note._id)}
                                                    className="text-zinc-400 hover:text-red-400 transition-colors"
                                                >
                                                    <Delete />
                                                </button>
                                            </div>
                                        </div>

                                        <p className="text-zinc-300 text-sm mt-3 line-clamp-4">
                                            {note.content || "No content"}
                                        </p>

                                        <p className="text-xs text-zinc-500 mt-4">
                                            {new Date(note.updatedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* All Notes Section */}
                    {unpinnedNotes.length > 0 && (
                        <div>
                            {pinnedNotes.length > 0 && (
                                <h2 className="text-zinc-400 text-sm font-semibold mb-4 uppercase tracking-wider">
                                    Others
                                </h2>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {unpinnedNotes.map((note) => (
                                    <div
                                        key={note._id}
                                        onClick={() => {
                                            setEditingNote(note);
                                            setShowForm(true);
                                        }}
                                        className={`group relative bg-gradient-to-br ${getColorStyle(
                                            note.colorIndex
                                        )} backdrop-blur-xl border rounded-2xl p-5 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer h-fit min-h-40`}
                                    >
                                        <div className="flex justify-between items-start gap-2">
                                            <h3 className="text-white font-semibold text-base line-clamp-2 flex-1">
                                                {note.title}
                                            </h3>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => handlePinNote(e, note)}
                                                    className="text-zinc-400 hover:text-yellow-400 transition-colors"
                                                >
                                                    📍
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeleteNote(e, note._id)}
                                                    className="text-zinc-400 hover:text-red-400 transition-colors"
                                                >
                                                    <Delete />
                                                </button>
                                            </div>
                                        </div>

                                        <p className="text-zinc-300 text-sm mt-3 line-clamp-4">
                                            {note.content || "No content"}
                                        </p>

                                        <p className="text-xs text-zinc-500 mt-4">
                                            {new Date(note.updatedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {filteredNotes.length === 0 && (
                        <div className="flex flex-col items-center justify-center min-h-96">
                            <div className="text-6xl mb-4">📝</div>
                            <h2 className="text-2xl font-bold text-white mb-2">No notes yet</h2>
                            <p className="text-zinc-500 mb-6">
                                {searchQuery
                                    ? "Try a different search"
                                    : "Create your first note to get started"}
                            </p>
                            {!searchQuery && (
                                <Button
                                    onClick={() => setShowForm(true)}
                                    variant="primary"
                                    text="Create Note"
                                    startIcon={<PlusIcon />}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
        </div>
    );
}

// Note Form Component
function NoteForm({
    note,
    onSave,
    onCancel,
}: {
    note: Note | null;
    onSave: (title: string, content: string) => void;
    onCancel: () => void;
}) {
    const [title, setTitle] = useState(note?.title || "");
    const [content, setContent] = useState(note?.content || "");

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 max-w-2xl w-full shadow-2xl">
                <h2 className="text-white font-bold text-2xl mb-4">
                    {note ? "Edit Note" : "Create Note"}
                </h2>

                <input
                    autoFocus
                    type="text"
                    placeholder="Note title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 px-4 py-3 rounded-lg mb-4 focus:outline-none focus:border-zinc-600 transition-all"
                />

                <textarea
                    placeholder="Note content..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 px-4 py-3 rounded-lg mb-4 h-48 resize-none focus:outline-none focus:border-zinc-600 transition-all"
                />

                <div className="flex gap-3">
                    <Button
                        onClick={() => onSave(title, content)}
                        variant="primary"
                        text={note ? "Update" : "Save"}
                        fullWidth
                    />
                    <Button onClick={onCancel} variant="secondary" text="Cancel" fullWidth />
                </div>
            </div>
        </div>
    );
}
