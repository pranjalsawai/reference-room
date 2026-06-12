"use client";

import { useState } from "react";
import type { Resource } from "@/lib/types";
import { ROOM_MAP } from "@/lib/constants";

interface ResourceCardProps {
  resource: Resource;
  onFavoriteToggle: (id: string) => void;
  onClick: (resource: Resource) => void;
}

export default function ResourceCard({ resource, onFavoriteToggle, onClick }: ResourceCardProps) {
  const [imgError, setImgError] = useState(false);
  const room = ROOM_MAP[resource.category];
  const coverSrc = resource.cover_image_override || resource.cover_image_url;

  const formattedDate = new Date(resource.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className="card-lift group bg-white border border-[#E2DDD6] rounded-[2px] overflow-hidden cursor-pointer"
      onClick={() => onClick(resource)}
    >
      {/* Cover image */}
      <div className="aspect-[3/2] bg-[#F0EDE6] overflow-hidden relative">
        {coverSrc && !imgError ? (
          <img
            src={coverSrc}
            alt={resource.title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-prata text-[32px] text-[#DDD9D0]">{resource.title[0]}</span>
          </div>
        )}

        {/* Favorite button */}
        <button
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 w-6 h-6 bg-white/90 backdrop-blur-sm rounded-[2px] flex items-center justify-center shadow-sm hover:bg-white"
          onClick={(e) => { e.stopPropagation(); onFavoriteToggle(resource.id); }}
          aria-label={resource.is_favorite ? "Remove from favorites" : "Add to favorites"}
        >
          <svg
            width="11" height="11" viewBox="0 0 24 24"
            fill={resource.is_favorite ? "#EF3054" : "none"}
            stroke={resource.is_favorite ? "#EF3054" : "#0D0D0D"}
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </button>

        {/* Favorite indicator (always visible when favorited) */}
        {resource.is_favorite && (
          <span className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-[#EF3054]" />
        )}
      </div>

      {/* Card body */}
      <div className="p-3 space-y-1.5">
        {/* Room tag + date */}
        <div className="flex items-center justify-between">
          <span
            className="text-[9px] font-google-sans font-medium px-1.5 py-0.5 rounded-[2px] tracking-wide uppercase"
            style={{ backgroundColor: room?.color + "15", color: room?.color }}
          >
            {room?.label}
          </span>
          <span className="text-[9px] font-google-sans text-[#9B9690]">{formattedDate}</span>
        </div>

        {/* Title */}
        <h3 className="font-prata text-[12.5px] text-[#0D0D0D] leading-[1.4] line-clamp-2">
          {resource.title}
        </h3>

        {/* Tags */}
        {resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {resource.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-[9px] font-google-sans text-[#9B9690] bg-[#F5F2EC] px-1.5 py-0.5 rounded-[2px]"
              >
                #{tag}
              </span>
            ))}
            {resource.tags.length > 2 && (
              <span className="text-[9px] font-google-sans text-[#9B9690]">+{resource.tags.length - 2}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
