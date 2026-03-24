"use client";

import { useState, useRef } from "react";
import type { MomNote } from "../hooks/useMomsNotes";
import { AssigneeBadge } from "./RecordingModal";

interface NoteCardProps {
  note: MomNote;
  onToggleItem: (noteId: string, itemId: string) => void;
  onDelete: (noteId: string) => void;
}

export default function NoteCard({ note, onToggleItem, onDelete }: NoteCardProps) {
  const [playingTTS, setPlayingTTS] = useState(false);
  const [loadingTTS, setLoadingTTS] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const checkedCount = note.checklistItems.filter((i) => i.checked).length;
  const totalCount = note.checklistItems.length;

  async function playInMomsVoice() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setPlayingTTS(false);
      return;
    }

    setLoadingTTS(true);
    try {
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: note.transcript }),
      });

      if (!res.ok) throw new Error("TTS failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onplay = () => {
        setLoadingTTS(false);
        setPlayingTTS(true);
      };
      audio.onended = () => {
        setPlayingTTS(false);
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };
      audio.onerror = () => {
        setLoadingTTS(false);
        setPlayingTTS(false);
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };

      await audio.play();
    } catch {
      setLoadingTTS(false);
    }
  }

  const dateStr = new Date(note.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="bg-white rounded-2xl border border-[var(--cream)] p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <p className="text-xs text-[var(--warm-gray)]">{dateStr}</p>
        <button
          onClick={() => onDelete(note.id)}
          className="text-xs text-[var(--warm-gray)] hover:text-[var(--rose)] transition-colors cursor-pointer"
        >
          Delete
        </button>
      </div>

      {/* Transcript */}
      <p className="text-sm text-[var(--foreground)] leading-relaxed italic">
        &ldquo;{note.transcript}&rdquo;
      </p>

      {/* Play button */}
      <button
        onClick={playInMomsVoice}
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium
          transition-all cursor-pointer
          ${playingTTS
            ? "bg-[var(--gold)] text-white animate-gentle-pulse"
            : "bg-[var(--cream)] text-[var(--warm-gray)] hover:border-[var(--gold-light)]"
          }
        `}
      >
        {loadingTTS ? (
          <span className="animate-shimmer">Loading...</span>
        ) : playingTTS ? (
          <>⏹️ Stop</>
        ) : (
          <>▶️ Play in Mom&apos;s Voice</>
        )}
      </button>

      {/* Checklist */}
      {note.checklistItems.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.15em] text-[var(--warm-gray)]">
              Tasks
            </p>
            <p className="text-xs text-[var(--warm-gray)]">
              {checkedCount}/{totalCount}
            </p>
          </div>

          {/* Progress bar */}
          {totalCount > 0 && (
            <div className="h-1 rounded-full bg-[var(--cream)] overflow-hidden">
              <div
                className="h-full bg-[var(--gold)] rounded-full transition-all duration-300"
                style={{ width: `${(checkedCount / totalCount) * 100}%` }}
              />
            </div>
          )}

          <ul className="space-y-1.5">
            {note.checklistItems.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <button
                  onClick={() => onToggleItem(note.id, item.id)}
                  className={`
                    w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0
                    transition-all cursor-pointer
                    ${item.checked
                      ? "bg-[var(--gold)] border-[var(--gold)] text-white"
                      : "border-[var(--cream)] hover:border-[var(--gold-light)]"
                    }
                  `}
                >
                  {item.checked && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2.5 6L5 8.5L9.5 3.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
                <AssigneeBadge assignee={item.assignee} />
                <span
                  className={`text-sm transition-all ${
                    item.checked
                      ? "line-through text-[var(--warm-gray)]"
                      : "text-[var(--foreground)]"
                  }`}
                >
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
