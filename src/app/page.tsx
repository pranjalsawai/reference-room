"use client";

import { useState, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import ResourceCard from "@/components/ResourceCard";
import ResourceDetail from "@/components/ResourceDetail";
import AddResourcePanel from "@/components/AddResourcePanel";
import AddBar from "@/components/AddBar";
import { MOCK_RESOURCES } from "@/lib/mock-data";
import { ROOMS, ROOM_MAP } from "@/lib/constants";
import type { RoomId } from "@/lib/constants";
import type { Resource, SortOption } from "@/lib/types";

export default function Home() {
  const [resources, setResources] = useState<Resource[]>(MOCK_RESOURCES);
  const [activeRoom, setActiveRoom] = useState<RoomId | "all" | "favorites">("all");
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [prefillUrl, setPrefillUrl] = useState<string | undefined>();
  const [editResource, setEditResource] = useState<Resource | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");

  const filtered = useMemo(() => {
    let list = [...resources];
    if (activeRoom === "favorites") list = list.filter((r) => r.is_favorite);
    else if (activeRoom !== "all") list = list.filter((r) => r.category === activeRoom);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.tags.some((t) => t.includes(q))
      );
    }
    if (sort === "newest") list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    else if (sort === "oldest") list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    else if (sort === "favorites") list.sort((a, b) => Number(b.is_favorite) - Number(a.is_favorite));
    return list;
  }, [resources, activeRoom, search, sort]);

  const recentResources = useMemo(
    () => [...resources].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 4),
    [resources]
  );

  const toggleFavorite = (id: string) => {
    setResources((rs) => rs.map((r) => (r.id === id ? { ...r, is_favorite: !r.is_favorite } : r)));
    if (selectedResource?.id === id) setSelectedResource((r) => r ? { ...r, is_favorite: !r.is_favorite } : null);
  };

  const handleSave = (data: Omit<Resource, "id" | "created_at" | "user_id">) => {
    const newResource: Resource = {
      ...data,
      id: Math.random().toString(36).slice(2),
      created_at: new Date().toISOString(),
      user_id: "user_1",
    };
    setResources((rs) => [newResource, ...rs]);
  };

  const handleUpdate = (updated: Resource) => {
    setResources((rs) => rs.map((r) => (r.id === updated.id ? updated : r)));
    if (selectedResource?.id === updated.id) setSelectedResource(updated);
  };

  const openAdd = (url?: string) => {
    setEditResource(null);
    setPrefillUrl(url);
    setAddOpen(true);
  };

  const openEdit = (resource: Resource) => {
    setSelectedResource(null);
    setEditResource(resource);
    setPrefillUrl(undefined);
    setAddOpen(true);
  };

  const roomCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    resources.forEach((r) => { counts[r.category] = (counts[r.category] || 0) + 1; });
    return counts;
  }, [resources]);

  const activeRoomLabel =
    activeRoom === "all" ? "All Resources"
    : activeRoom === "favorites" ? "Favorites"
    : ROOM_MAP[activeRoom]?.label ?? "";

  const activeRoomColor =
    activeRoom === "all" || activeRoom === "favorites"
      ? null
      : ROOM_MAP[activeRoom]?.color ?? null;

  const showHomepage = activeRoom === "all" && !search;

  return (
    <div className="grain flex h-full overflow-hidden bg-[#F5F2EC]">
      <Sidebar activeRoom={activeRoom} onRoomChange={setActiveRoom} resources={resources} />

      <main className="flex-1 overflow-y-auto min-w-0" style={activeRoomColor ? { backgroundColor: activeRoomColor + "08" } : {}}>
        {/* Top bar */}
        <div
          className="sticky top-0 z-10 backdrop-blur-sm border-b px-8 py-3 flex items-center gap-4 transition-colors duration-300"
          style={{
            backgroundColor: activeRoomColor ? activeRoomColor + "14" : "rgba(245,242,236,0.95)",
            borderColor: activeRoomColor ? activeRoomColor + "30" : "#DDD9D0",
          }}
        >
          <div className="flex items-center gap-2.5">
            {activeRoomColor && (
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: activeRoomColor }} />
            )}
            <h1 className="font-prata text-[16px] text-[#0D0D0D] whitespace-nowrap">{activeRoomLabel}</h1>
          </div>
          <div className="flex-1 max-w-xs ml-6">
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9B9690]" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 text-[12px] font-google-sans bg-white border border-[#DDD9D0] rounded-[2px] text-[#0D0D0D] placeholder-[#9B9690] focus:outline-none focus:border-[#0D0D0D] transition-colors"
              />
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="text-[11px] font-google-sans bg-transparent border-0 text-[#6B6B6B] focus:outline-none cursor-pointer hover:text-[#0D0D0D] transition-colors"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="favorites">Favorites first</option>
            </select>
          </div>
        </div>

        <div className="px-8 py-7 space-y-10">
          {/* Add bar */}
          <AddBar onOpen={openAdd} />

          {showHomepage && (
            <>
              {/* Recently Added */}
              <section>
                <div className="flex items-baseline justify-between mb-1">
                  <h2 className="font-prata text-[15px] text-[#0D0D0D]">Recently Added</h2>
                  <span className="text-[10px] font-google-sans text-[#9B9690] tracking-wide">{resources.length} references</span>
                </div>
                <div className="w-full h-px bg-[#DDD9D0] mb-4" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {recentResources.map((r) => (
                    <ResourceCard key={r.id} resource={r} onFavoriteToggle={toggleFavorite} onClick={setSelectedResource} />
                  ))}
                </div>
              </section>

              {/* Rooms */}
              <section>
                <div className="flex items-baseline justify-between mb-1">
                  <h2 className="font-prata text-[15px] text-[#0D0D0D]">Browse by Room</h2>
                  <span className="text-[10px] font-google-sans text-[#9B9690] tracking-wide">{ROOMS.length} rooms</span>
                </div>
                <div className="w-full h-px bg-[#DDD9D0] mb-4" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {ROOMS.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => setActiveRoom(room.id)}
                      className="card-lift group text-left bg-white border border-[#E2DDD6] rounded-[2px] px-3.5 py-3 hover:border-[#0D0D0D]"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: room.color }} />
                        <span className="text-[11.5px] font-prata text-[#0D0D0D] leading-tight">{room.label}</span>
                      </div>
                      <span className="text-[10px] font-google-sans text-[#9B9690] pl-3.5">
                        {roomCounts[room.id] ?? 0} saved
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Filtered / search grid */}
          {!showHomepage && (
            <section>
              {filtered.length === 0 ? (
                <div className="text-center py-32">
                  <p className="font-prata text-[24px] text-[#DDD9D0]">—</p>
                  <p className="font-prata text-[16px] text-[#6B6B6B] mt-3">Nothing here yet.</p>
                  <p className="text-[12px] font-google-sans text-[#9B9690] mt-2">
                    {activeRoom === "favorites"
                      ? "Mark references as favorites to find them here."
                      : search
                      ? `No results for "${search}"`
                      : "Add your first reference to this room."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-baseline justify-between mb-1">
                    <h2 className="font-prata text-[15px] text-[#0D0D0D]">{activeRoomLabel}</h2>
                    <span className="text-[10px] font-google-sans text-[#9B9690] tracking-wide">{filtered.length} references</span>
                  </div>
                  <div
                    className="w-full mb-4 transition-colors duration-300"
                    style={{ height: activeRoomColor ? "2px" : "1px", backgroundColor: activeRoomColor ?? "#DDD9D0" }}
                  />
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {filtered.map((r) => (
                      <ResourceCard key={r.id} resource={r} onFavoriteToggle={toggleFavorite} onClick={setSelectedResource} />
                    ))}
                  </div>
                </>
              )}
            </section>
          )}
        </div>
      </main>

      {/* FAB */}
      <button
        onClick={() => openAdd()}
        className="fixed bottom-6 right-6 w-12 h-12 text-white rounded-sm shadow-lg flex items-center justify-center z-30 transition-colors duration-300"
        style={{ backgroundColor: activeRoomColor ?? "#0D0D0D" }}
        aria-label="Add resource"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      <ResourceDetail
        resource={selectedResource}
        onClose={() => setSelectedResource(null)}
        onFavoriteToggle={toggleFavorite}
        onEdit={openEdit}
      />
      <AddResourcePanel
        open={addOpen}
        onClose={() => { setAddOpen(false); setEditResource(null); setPrefillUrl(undefined); }}
        onSave={handleSave}
        prefillUrl={prefillUrl}
        editResource={editResource}
        onUpdate={handleUpdate}
      />
    </div>
  );
}
