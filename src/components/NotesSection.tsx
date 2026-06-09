"use client";

import { useState, useRef, useEffect } from "react";

type Note = {
  id: string;
  content: string;
  created_at: string;
};

export default function NotesSection({
  initialNotes,
  projectId,
}: {
  initialNotes: Note[];
  projectId: string;
}) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [notes]);

  async function handlePost() {
    if (!content.trim()) return;
    setError("");
    setLoading(true);

    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, projectId }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      setLoading(false);
      return;
    }

    setNotes([...notes, data]);
    setContent("");
    setLoading(false);
  }

  function formatTime(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="flex flex-col">
      <h2 className="text-base font-semibold text-[#1A1035] mb-6">Updates</h2>

      {/* Notes feed */}
      <div className="flex flex-col gap-4 mb-6 min-h-[200px]">
        {notes.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-[#DDD8FF] rounded-2xl p-12 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-xl bg-[#EEE9FF] flex items-center justify-center mb-4">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-[#5B4EE8]">
                <path d="M3 3h12v10H3V3zm0 4h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                <path d="M6 16l3-3 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-[#1A1035] text-sm font-medium mb-1">No updates yet</p>
            <p className="text-[#9B90C2] text-xs">Post the first update for this project</p>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="bg-white border border-[#DDD8FF] rounded-xl px-5 py-4"
            >
              <p className="text-sm text-[#1A1035] leading-relaxed whitespace-pre-wrap">{note.content}</p>
              <p className="text-xs text-[#C4BBEE] mt-3">{formatTime(note.created_at)}</p>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border border-[#DDD8FF] rounded-2xl p-4 sticky bottom-6 shadow-lg shadow-[#5B4EE8]/5">
        {error && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
            {error}
          </p>
        )}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handlePost();
            }
          }}
          placeholder="Write an update... (Enter to post, Shift+Enter for new line)"
          rows={3}
          className="w-full bg-[#F7F5FF] border border-[#DDD8FF] rounded-lg px-3.5 py-2.5 text-sm text-[#1A1035] placeholder:text-[#C4BBEE] focus:outline-none focus:border-[#5B4EE8] focus:ring-2 focus:ring-[#5B4EE8]/10 transition-all resize-none mb-3"
        />
        <div className="flex justify-end">
          <button
            onClick={handlePost}
            disabled={loading || !content.trim()}
            className="bg-[#5B4EE8] hover:bg-[#4A3ED6] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg px-5 py-2 transition-colors shadow-md shadow-[#5B4EE8]/20"
          >
            {loading ? "Posting..." : "Post update"}
          </button>
        </div>
      </div>
    </div>
  );
}