"use client";

import { useState, useRef, useEffect } from "react";
import type { Assignee } from "../hooks/useMomsNotes";

interface ExtractedItem {
  text: string;
  assignee: Assignee;
}

interface RecordingModalProps {
  onSave: (transcript: string, items: ExtractedItem[]) => void;
  onClose: () => void;
}

const MAX_DURATION = 120; // 2 minutes

export default function RecordingModal({ onSave, onClose }: RecordingModalProps) {
  const [stage, setStage] = useState<
    "idle" | "recording" | "transcribing" | "review" | "extracting"
  >("idle");
  const [seconds, setSeconds] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [items, setItems] = useState<ExtractedItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
        mediaRecorder.current.stop();
      }
    };
  }, []);

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorder.current = recorder;
      chunks.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);

        const blob = new Blob(chunks.current, { type: recorder.mimeType });
        await transcribeAudio(blob);
      };

      recorder.start();
      setStage("recording");
      setSeconds(0);

      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_DURATION) {
            recorder.stop();
            return s + 1;
          }
          return s + 1;
        });
      }, 1000);
    } catch {
      setError("Microphone access is required to record a note.");
    }
  }

  function stopRecording() {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
    }
  }

  async function transcribeAudio(blob: Blob) {
    setStage("transcribing");
    try {
      const form = new FormData();
      form.append("audio", blob);

      const res = await fetch("/api/transcribe", { method: "POST", body: form });
      if (!res.ok) throw new Error("Transcription failed");

      const { transcript: text } = await res.json();
      setTranscript(text);
      await extractChecklist(text);
    } catch {
      setError("Failed to transcribe. Please try again.");
      setStage("idle");
    }
  }

  async function extractChecklist(text: string) {
    setStage("extracting");
    try {
      const res = await fetch("/api/extract-checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text }),
      });
      if (!res.ok) throw new Error("Extraction failed");

      const { items: extracted } = await res.json();
      setItems(extracted);
      setStage("review");
    } catch {
      setError("Failed to extract tasks. You can still save the note.");
      setItems([]);
      setStage("review");
    }
  }

  function handleSave() {
    if (transcript.trim()) {
      onSave(transcript.trim(), items);
    }
  }

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg p-8 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--warm-gray)] hover:text-[var(--foreground)] text-xl cursor-pointer"
        >
          &times;
        </button>

        <h2
          className="text-2xl font-semibold text-center mb-6 text-[var(--foreground)]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Record a Note
        </h2>

        {/* Idle — start button */}
        {stage === "idle" && (
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={startRecording}
              className="w-20 h-20 rounded-full bg-[var(--rose)] text-white text-3xl
                flex items-center justify-center hover:bg-[var(--rose)]/90
                transition-all cursor-pointer shadow-lg"
            >
              🎙️
            </button>
            <p className="text-sm text-[var(--warm-gray)]">Tap to start recording</p>
          </div>
        )}

        {/* Recording — stop button + timer */}
        {stage === "recording" && (
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={stopRecording}
              className="w-20 h-20 rounded-full bg-[var(--rose)] text-white text-3xl
                flex items-center justify-center animate-recording-pulse
                transition-all cursor-pointer shadow-lg"
            >
              ⏹️
            </button>
            <p className="text-lg font-mono text-[var(--foreground)]">
              {formatTime(seconds)}
            </p>
            <p className="text-sm text-[var(--warm-gray)]">Tap to stop</p>
          </div>
        )}

        {/* Transcribing */}
        {stage === "transcribing" && (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="animate-shimmer text-3xl">🎙️</div>
            <p className="text-sm text-[var(--warm-gray)]">Transcribing...</p>
          </div>
        )}

        {/* Extracting */}
        {stage === "extracting" && (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="animate-shimmer text-3xl">✨</div>
            <p className="text-sm text-[var(--warm-gray)]">Extracting tasks...</p>
          </div>
        )}

        {/* Review */}
        {stage === "review" && (
          <div className="flex flex-col gap-4">
            <label className="text-xs uppercase tracking-[0.2em] text-[var(--warm-gray)]">
              Transcript
            </label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-[var(--cream)] bg-[var(--background)]
                text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--gold-light)]
                focus:ring-1 focus:ring-[var(--gold-light)] resize-none"
            />

            {items.length > 0 && (
              <>
                <label className="text-xs uppercase tracking-[0.2em] text-[var(--warm-gray)]">
                  Tasks extracted
                </label>
                <ul className="space-y-2">
                  {items.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 px-4 py-2 bg-[var(--background)] rounded-xl text-sm"
                    >
                      <AssigneeBadge assignee={item.assignee} />
                      <span className="text-[var(--foreground)]">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <div className="flex gap-3 mt-2">
              <button
                onClick={() => extractChecklist(transcript)}
                className="flex-1 py-3 rounded-xl border border-[var(--cream)] text-sm
                  text-[var(--warm-gray)] hover:border-[var(--gold-light)] transition-all cursor-pointer"
              >
                Re-extract Tasks
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 rounded-xl bg-[var(--gold)] text-white text-sm
                  font-medium hover:bg-[var(--gold-dark)] transition-all cursor-pointer shadow-sm"
              >
                Save Note
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-center text-sm text-[var(--rose)] mt-4">{error}</p>
        )}
      </div>
    </div>
  );
}

const ASSIGNEE_CONFIG: Record<Assignee, { emoji: string; label: string }> = {
  leo: { emoji: "🦁", label: "Leo" },
  felix: { emoji: "⭐", label: "Felix" },
  boys: { emoji: "👦👦", label: "Boys" },
  jake: { emoji: "💛", label: "Jake" },
  everyone: { emoji: "👨‍👩‍👦‍👦", label: "Everyone" },
};

export function AssigneeBadge({ assignee }: { assignee: Assignee }) {
  const config = ASSIGNEE_CONFIG[assignee];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--cream)] text-xs text-[var(--warm-gray)] whitespace-nowrap">
      {config.emoji} {config.label}
    </span>
  );
}
