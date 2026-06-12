"use client";

import { useState } from "react";

interface AddBarProps {
  onOpen: (prefillUrl?: string) => void;
}

export default function AddBar({ onOpen }: AddBarProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onOpen(url.trim() || undefined);
    setUrl("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B6B]"
          width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
        >
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
        </svg>
        <input
          type="url"
          placeholder="Paste a URL to save it…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full pl-8 pr-4 py-2.5 text-[13px] font-google-sans bg-white border border-[#E2DDD6] rounded-sm text-[#0D0D0D] placeholder-[#6B6B6B] focus:outline-none focus:border-[#0D0D0D] transition-colors"
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2.5 bg-[#0D0D0D] text-white text-[12px] font-google-sans font-medium rounded-sm hover:bg-[#2a2a2a] transition-colors whitespace-nowrap"
      >
        Add to Room
      </button>
    </form>
  );
}
