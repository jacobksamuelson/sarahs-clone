"use client";

export type TopTab = "reminders" | "notes";

interface TopNavProps {
  activeTab: TopTab;
  onTabChange: (tab: TopTab) => void;
}

const TABS: { label: string; value: TopTab }[] = [
  { label: "Quick Reminders", value: "reminders" },
  { label: "Mom's Notes", value: "notes" },
];

export default function TopNav({ activeTab, onTabChange }: TopNavProps) {
  return (
    <nav className="w-full max-w-2xl mx-auto px-6 pb-6">
      <div className="flex rounded-2xl bg-white border border-[var(--cream)] p-1">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={`
              flex-1 py-3 rounded-xl text-sm font-medium tracking-wide
              transition-all duration-200 cursor-pointer
              ${activeTab === tab.value
                ? "bg-[var(--gold)] text-white shadow-sm"
                : "text-[var(--warm-gray)] hover:text-[var(--foreground)]"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
