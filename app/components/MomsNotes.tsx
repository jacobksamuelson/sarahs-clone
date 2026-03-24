"use client";

import { useState } from "react";
import { useMomsNotes } from "../hooks/useMomsNotes";
import RecordingModal from "./RecordingModal";
import NoteCard from "./NoteCard";

export default function MomsNotes() {
  const { notes, loaded, addNote, toggleChecklistItem, deleteNote } = useMomsNotes();
  const [showRecording, setShowRecording] = useState(false);

  if (!loaded) {
    return (
      <div className="w-full max-w-2xl mx-auto px-6 py-12 text-center">
        <p className="text-sm text-[var(--warm-gray)] animate-shimmer">Loading notes...</p>
      </div>
    );
  }

  return (
    <section className="w-full max-w-2xl mx-auto px-6 pb-12">
      {/* Record button */}
      <div className="flex justify-center mb-8">
        <button
          onClick={() => setShowRecording(true)}
          className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl
            bg-[var(--gold)] text-white font-medium text-sm tracking-wide
            hover:bg-[var(--gold-dark)] transition-all cursor-pointer shadow-sm"
        >
          🎙️ Record a Note
        </button>
      </div>

      {/* Notes list */}
      {notes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-3xl mb-3">📝</p>
          <p
            className="text-lg text-[var(--foreground)] mb-1"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            No notes yet
          </p>
          <p className="text-sm text-[var(--warm-gray)]">
            Record a voice note and it&apos;ll show up here with a checklist
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onToggleItem={toggleChecklistItem}
              onDelete={deleteNote}
            />
          ))}
        </div>
      )}

      {/* Recording modal */}
      {showRecording && (
        <RecordingModal
          onSave={(transcript, items) => {
            addNote(transcript, items);
            setShowRecording(false);
          }}
          onClose={() => setShowRecording(false)}
        />
      )}
    </section>
  );
}
