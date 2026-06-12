"use client";

import { useEffect } from "react";
import type { Resource } from "@/lib/types";
import { ROOM_MAP } from "@/lib/constants";

interface ResourceDetailProps {
  resource: Resource | null;
  onClose: () => void;
  onFavoriteToggle: (id: string) => void;
  onEdit: (resource: Resource) => void;
}

export default function ResourceDetail({ resource, onClose, onFavoriteToggle, onEdit }: ResourceDetailProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!resource) return null;

  const room = ROOM_MAP[resource.category];
  const coverSrc = resource.cover_image_override || resource.cover_image_url;
  const formattedDate = new Date(resource.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[#F5F2EC] border-l border-[#E2DDD6] z-50 overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <span
            className="text-[10px] font-google-sans font-medium px-2 py-1 rounded-[3px]"
            style={{ backgroundColor: room?.color + "18", color: room?.color }}
          >
            {room?.label}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(resource)}
              className="w-8 h-8 flex items-center justify-center rounded-sm hover:bg-[#E2DDD6] transition-colors"
              title="Edit resource"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              onClick={() => onFavoriteToggle(resource.id)}
              className="w-8 h-8 flex items-center justify-center rounded-sm hover:bg-[#E2DDD6] transition-colors"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill={resource.is_favorite ? "#EF3054" : "none"}
                stroke={resource.is_favorite ? "#EF3054" : "#0D0D0D"}
                strokeWidth="2"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-sm hover:bg-[#E2DDD6] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="#0D0D0D" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Cover */}
        {coverSrc && (
          <div className="mx-6 mb-5 rounded-sm overflow-hidden aspect-[16/9] bg-[#E2DDD6]">
            <img src={coverSrc} alt={resource.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Content */}
        <div className="px-6 pb-10 space-y-5">
          <h2 className="font-prata text-[22px] text-[#0D0D0D] leading-snug">{resource.title}</h2>

          {resource.description && (
            <p className="font-google-sans text-[13px] text-[#6B6B6B] leading-relaxed">
              {resource.description}
            </p>
          )}

          {/* URL */}
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[12px] font-google-sans text-[#724CF9] hover:text-[#564592] transition-colors break-all group"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
            </svg>
            <span className="group-hover:underline">{resource.url}</span>
          </a>

          <div className="border-t border-[#E2DDD6]" />

          {/* Notes */}
          {resource.notes && (
            <div>
              <p className="text-[10px] font-google-sans font-medium tracking-widest uppercase text-[#6B6B6B] mb-2">
                Notes
              </p>
              <p className="font-google-sans text-[13px] text-[#0D0D0D] leading-relaxed">
                {resource.notes}
              </p>
            </div>
          )}

          {/* Tags */}
          {resource.tags.length > 0 && (
            <div>
              <p className="text-[10px] font-google-sans font-medium tracking-widest uppercase text-[#6B6B6B] mb-2">
                Tags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {resource.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-google-sans text-[#0D0D0D] bg-white border border-[#E2DDD6] px-2 py-1 rounded-[3px]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="border-t border-[#E2DDD6] pt-4">
            <p className="text-[11px] font-google-sans text-[#6B6B6B]">Saved {formattedDate}</p>
          </div>
        </div>
      </div>
    </>
  );
}
