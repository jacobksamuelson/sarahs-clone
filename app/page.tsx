"use client";

import { useState, useRef } from "react";
import Image from "next/image";

type Category = "all" | "reminders" | "love";

const PRESETS = [
  { emoji: "🪥", label: "Brush your teeth", category: "reminders" as const },
  { emoji: "🧼", label: "Wash your hands before dinner", category: "reminders" as const },
  { emoji: "👕", label: "Put away your clothes", category: "reminders" as const },
  { emoji: "🍽️", label: "Put away the dishes", category: "reminders" as const },
  { emoji: "✨", label: "Think first, be kind, have fun", category: "reminders" as const },
  { emoji: "📖", label: "Time to read for 30 minutes", category: "reminders" as const },
  { emoji: "🚗", label: "Can you help me empty the car?", category: "reminders" as const },
  { emoji: "🦁", label: "Leo, mom loves you so much", category: "love" as const },
  { emoji: "🌟", label: "Felix, keep being you", category: "love" as const },
  { emoji: "💛", label: "Jake, thanks for being my partner", category: "love" as const },
  { emoji: "🤗", label: "I love you thiiiiiiisssss much", category: "love" as const },
  { emoji: "🏠", label: "I love our family", category: "love" as const },
];

const TABS: { label: string; value: Category }[] = [
  { label: "All", value: "all" },
  { label: "Reminders", value: "reminders" },
  { label: "Love", value: "love" },
];

const PHOTOS = [
  { src: "/photos/swings.jpg", alt: "Sarah and the kids on swings" },
  { src: "/photos/waterfall.jpg", alt: "Family under a waterfall" },
  { src: "/photos/cuddle.jpg", alt: "Sarah cuddling with the boys" },
  { src: "/photos/festival.jpg", alt: "Sarah and son at a festival" },
  { src: "/photos/boat.jpg", alt: "Sarah on the lake" },
  { src: "/photos/dog.jpg", alt: "Sarah with the dog" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<Category>("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [customText, setCustomText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const filteredPresets = activeTab === "all"
    ? PRESETS
    : PRESETS.filter((p) => p.category === activeTab);

  async function speak(text: string, id: string) {
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setError(null);
    setLoadingId(id);
    setPlayingId(null);

    try {
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate speech");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onplay = () => {
        setLoadingId(null);
        setPlayingId(id);
      };

      audio.onended = () => {
        setPlayingId(null);
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };

      audio.onerror = () => {
        setLoadingId(null);
        setPlayingId(null);
        setError("Couldn't play the audio");
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };

      await audio.play();
    } catch {
      setLoadingId(null);
      setPlayingId(null);
      setError("Something went wrong. Please try again.");
    }
  }

  const isDisabled = loadingId !== null || playingId !== null;

  return (
    <div className="flex flex-col items-center min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="w-full max-w-2xl mx-auto px-6 pt-12 pb-8 text-center">
        <p className="text-[var(--warm-gray)] text-xs tracking-[0.3em] uppercase mb-4">
          Welcome to
        </p>
        <h1
          className="text-5xl md:text-6xl font-serif font-semibold text-[var(--foreground)] mb-3"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          <span className="italic font-normal">Sarah&apos;s</span> Clone
        </h1>
        <p className="text-[var(--warm-gray)] text-sm tracking-wide mb-8">
          Mom&apos;s voice, one tap away
        </p>

        {/* Gold divider */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-[var(--gold-light)]" />
          <div className="w-2 h-2 rounded-full bg-[var(--gold)]" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-[var(--gold-light)]" />
        </div>

        {/* Motto */}
        <p
          className="text-lg md:text-xl text-[var(--foreground)] italic"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          &ldquo;Think first, be kind, have fun.&rdquo;
        </p>
      </header>

      {/* Tabs */}
      <section className="w-full max-w-2xl mx-auto px-6 pb-8">
        <div className="flex justify-center gap-2 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`
                px-5 py-2 rounded-full text-xs font-medium tracking-[0.15em] uppercase
                transition-all duration-200 cursor-pointer
                ${activeTab === tab.value
                  ? "bg-[var(--gold)] text-white shadow-sm"
                  : "bg-white border border-[var(--cream)] text-[var(--warm-gray)] hover:border-[var(--gold-light)]"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Preset Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredPresets.map((preset) => {
            const id = `preset-${preset.label}`;
            const isLoading = loadingId === id;
            const isPlaying = playingId === id;

            return (
              <button
                key={preset.label}
                onClick={() => speak(preset.label, id)}
                disabled={isDisabled && !isPlaying}
                className={`
                  group relative flex items-center gap-4 px-6 py-5
                  bg-white rounded-2xl border transition-all duration-200
                  ${isPlaying
                    ? "border-[var(--gold)] shadow-md animate-gentle-pulse"
                    : "border-[var(--cream)] hover:border-[var(--gold-light)] hover:shadow-sm"
                  }
                  ${isDisabled && !isPlaying ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                <span className="text-2xl flex-shrink-0">
                  {isLoading ? (
                    <span className="animate-shimmer inline-block">
                      {preset.emoji}
                    </span>
                  ) : (
                    preset.emoji
                  )}
                </span>
                <span
                  className="text-left text-[var(--foreground)] text-sm tracking-wide"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {preset.label}
                </span>
                {isPlaying && (
                  <span className="absolute right-4 flex gap-[3px] items-end h-4">
                    <span className="w-[3px] bg-[var(--gold)] rounded-full animate-bounce" style={{ height: "60%", animationDelay: "0ms" }} />
                    <span className="w-[3px] bg-[var(--gold)] rounded-full animate-bounce" style={{ height: "100%", animationDelay: "150ms" }} />
                    <span className="w-[3px] bg-[var(--gold)] rounded-full animate-bounce" style={{ height: "40%", animationDelay: "300ms" }} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Custom Text Input */}
      <section className="w-full max-w-2xl mx-auto px-6 pb-12">
        <p className="text-[var(--warm-gray)] text-xs tracking-[0.3em] uppercase text-center mb-6">
          Say Anything
        </p>
        <div className="flex gap-3">
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && customText.trim() && !isDisabled) {
                speak(customText.trim(), "custom");
              }
            }}
            placeholder="Type something for mom to say..."
            maxLength={500}
            className="flex-1 px-5 py-4 rounded-2xl border border-[var(--cream)] bg-white
              text-[var(--foreground)] text-sm placeholder:text-[var(--warm-gray)]/50
              focus:outline-none focus:border-[var(--gold-light)] focus:ring-1 focus:ring-[var(--gold-light)]
              transition-all"
          />
          <button
            onClick={() => {
              if (customText.trim()) speak(customText.trim(), "custom");
            }}
            disabled={!customText.trim() || isDisabled}
            className={`
              px-6 py-4 rounded-2xl text-sm font-medium tracking-wide transition-all duration-200
              ${!customText.trim() || isDisabled
                ? "bg-[var(--cream)] text-[var(--warm-gray)] cursor-not-allowed"
                : "bg-[var(--gold)] text-white hover:bg-[var(--gold-dark)] cursor-pointer shadow-sm"
              }
            `}
          >
            {loadingId === "custom" ? (
              <span className="animate-shimmer">Speaking...</span>
            ) : playingId === "custom" ? (
              "Playing"
            ) : (
              "Say It"
            )}
          </button>
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className="w-full max-w-2xl mx-auto px-6 pb-4">
          <p className="text-center text-sm text-[var(--rose)]">{error}</p>
        </div>
      )}

      {/* Gold Brush Stroke Divider */}
      <div className="w-full max-w-2xl mx-auto px-6 pb-8">
        <div
          className="h-[3px] rounded-full mx-auto"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, var(--gold-light) 20%, var(--gold) 50%, var(--gold-light) 80%, transparent 100%)",
            maxWidth: "200px",
          }}
        />
      </div>

      {/* Photo Gallery */}
      <section className="w-full max-w-2xl mx-auto px-6 pb-16">
        <p className="text-[var(--warm-gray)] text-xs tracking-[0.3em] uppercase text-center mb-2">
          With Love
        </p>
        <p
          className="text-2xl text-center mb-8 text-[var(--foreground)]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          <span className="italic">from Mom</span>
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {PHOTOS.map((photo) => (
            <div
              key={photo.src}
              className="relative aspect-square rounded-xl overflow-hidden shadow-sm
                hover:shadow-md transition-shadow duration-300"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 text-center">
        <p className="text-[var(--warm-gray)] text-xs tracking-wide">
          Made with love for the boys
        </p>
      </footer>
    </div>
  );
}
