"use client";

import { useState, useCallback, useSyncExternalStore } from "react";

export type Assignee = "leo" | "felix" | "boys" | "jake" | "everyone";

export interface ChecklistItem {
  id: string;
  text: string;
  assignee: Assignee;
  checked: boolean;
}

export interface MomNote {
  id: string;
  createdAt: string;
  transcript: string;
  checklistItems: ChecklistItem[];
}

const STORAGE_KEY = "moms-notes";

let listeners: Array<() => void> = [];
let cachedNotes: MomNote[] | null = null;

function getSnapshot(): MomNote[] {
  if (cachedNotes === null) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      cachedNotes = raw ? JSON.parse(raw) : [];
    } catch {
      cachedNotes = [];
    }
  }
  return cachedNotes!;
}

function getServerSnapshot(): MomNote[] {
  return [];
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function persistAndNotify(notes: MomNote[]) {
  cachedNotes = notes;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  listeners.forEach((l) => l());
}

export function useMomsNotes() {
  const notes = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [loaded] = useState(true);

  const addNote = useCallback(
    (transcript: string, items: { text: string; assignee: Assignee }[]) => {
      const note: MomNote = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        transcript,
        checklistItems: items.map((item) => ({
          id: crypto.randomUUID(),
          text: item.text,
          assignee: item.assignee,
          checked: false,
        })),
      };
      persistAndNotify([note, ...getSnapshot()]);
    },
    []
  );

  const toggleChecklistItem = useCallback(
    (noteId: string, itemId: string) => {
      const next = getSnapshot().map((note) =>
        note.id === noteId
          ? {
              ...note,
              checklistItems: note.checklistItems.map((item) =>
                item.id === itemId
                  ? { ...item, checked: !item.checked }
                  : item
              ),
            }
          : note
      );
      persistAndNotify(next);
    },
    []
  );

  const deleteNote = useCallback((noteId: string) => {
    persistAndNotify(getSnapshot().filter((n) => n.id !== noteId));
  }, []);

  return { notes, loaded, addNote, toggleChecklistItem, deleteNote };
}
