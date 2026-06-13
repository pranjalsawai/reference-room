"use client";

import { useState } from "react";
import { ROOMS } from "@/lib/constants";
import type { RoomId } from "@/lib/constants";
import type { Resource } from "@/lib/types";

interface SidebarProps {
  activeRoom: RoomId | "all" | "favorites";
  onRoomChange: (room: RoomId | "all" | "favorites") => void;
  resources: Resource[];
  onSignOut: () => void;
}

export default function Sidebar({ activeRoom, onRoomChange, resources, onSignOut }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const countFor = (roomId: string) => resources.filter((r) => r.category === roomId).length;
  const favCount = resources.filter((r) => r.is_favorite).length;

  return (
    <aside
      className={`flex flex-col h-screen bg-[#F0EDE6] border-r border-[#DDD9D0] transition-all duration-300 shrink-0 ${
        collapsed ? "w-14" : "w-52"
      }`}
    >
      {/* Wordmark */}
      <div className={`px-4 pt-7 pb-6 ${collapsed ? "flex justify-center" : ""}`}>
        {collapsed ? (
          <button
            onClick={() => setCollapsed(false)}
            className="text-[#6B6B6B] hover:text-[#0D0D0D] transition-colors"
            aria-label="Expand sidebar"
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        ) : (
          <div className="flex items-start justify-between">
            <div>
              <p className="font-prata text-[13px] text-[#0D0D0D] leading-[1.3] tracking-tight">
                The Reference<br />Room
              </p>
              <div className="mt-2 w-6 h-px bg-[#0D0D0D]" />
            </div>
            <button
              onClick={() => setCollapsed(true)}
              className="mt-0.5 text-[#6B6B6B] hover:text-[#0D0D0D] transition-colors"
              aria-label="Collapse sidebar"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-px">
        {/* Library section */}
        {!collapsed && (
          <p className="px-2 pb-1 text-[9px] font-google-sans font-medium tracking-[0.12em] uppercase text-[#9B9690]">
            Library
          </p>
        )}
        <NavItem
          label="All Resources"
          count={resources.length}
          active={activeRoom === "all"}
          collapsed={collapsed}
          icon={
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          }
          onClick={() => onRoomChange("all")}
        />
        <NavItem
          label="Favorites"
          count={favCount}
          active={activeRoom === "favorites"}
          collapsed={collapsed}
          icon={
            <svg width="13" height="13" viewBox="0 0 24 24" fill={activeRoom === "favorites" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.75">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          }
          onClick={() => onRoomChange("favorites")}
        />

        {/* Divider */}
        <div className="py-2 px-2">
          <div className="border-t border-[#DDD9D0]" />
        </div>

        {/* Rooms section */}
        {!collapsed && (
          <p className="px-2 pb-1 text-[9px] font-google-sans font-medium tracking-[0.12em] uppercase text-[#9B9690]">
            Rooms
          </p>
        )}

        {ROOMS.map((room) => (
          <NavItem
            key={room.id}
            label={room.label}
            count={countFor(room.id)}
            active={activeRoom === room.id}
            collapsed={collapsed}
            dot={room.color}
            onClick={() => onRoomChange(room.id)}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#DDD9D0] mx-3 pt-3 pb-4">
        {!collapsed && (
          <div className="px-1 space-y-2">
            <p className="text-[9px] font-google-sans font-medium tracking-[0.12em] uppercase text-[#9B9690]">Studio</p>
            <p className="text-[11px] font-google-sans text-[#6B6B6B]">Shared Library</p>
          </div>
        )}
        <button
          onClick={onSignOut}
          title="Sign out"
          className={`mt-3 flex items-center gap-2 text-[#9B9690] hover:text-[#EF3054] transition-colors ${collapsed ? "justify-center w-full" : "px-1"}`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          {!collapsed && <span className="text-[10px] font-google-sans">Sign out</span>}
        </button>
      </div>
    </aside>
  );
}

function NavItem({
  label,
  count,
  active,
  collapsed,
  dot,
  icon,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  collapsed: boolean;
  dot?: string;
  icon?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-[3px] text-left transition-all duration-150 group ${
        active
          ? "bg-[#0D0D0D] text-white"
          : "text-[#3D3A35] hover:bg-[#E5E1DA] hover:text-[#0D0D0D]"
      }`}
    >
      {/* Icon or dot */}
      <span className={`shrink-0 flex items-center justify-center w-4 h-4 ${active ? "text-white" : "text-[#6B6B6B] group-hover:text-[#0D0D0D]"}`}>
        {icon ? (
          icon
        ) : (
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: active ? "rgba(255,255,255,0.7)" : dot }}
          />
        )}
      </span>

      {!collapsed && (
        <>
          <span className="text-[11.5px] font-google-sans flex-1 truncate leading-none">{label}</span>
          {count > 0 && (
            <span className={`text-[10px] font-google-sans tabular-nums leading-none ${active ? "text-white/50" : "text-[#9B9690]"}`}>
              {count}
            </span>
          )}
        </>
      )}
    </button>
  );
}
