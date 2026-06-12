"use client";

import { useState, useEffect, useRef } from "react";
import { ROOMS } from "@/lib/constants";
import type { RoomId } from "@/lib/constants";
import type { Resource } from "@/lib/types";

interface AddResourcePanelProps {
  open: boolean;
  onClose: () => void;
  onSave: (resource: Omit<Resource, "id" | "created_at" | "user_id">) => void;
  prefillUrl?: string;
  editResource?: Resource | null;
  onUpdate?: (resource: Resource) => void;
}

const EMPTY = {
  url: "",
  title: "",
  description: "",
  cover_image_url: null as string | null,
  cover_image_override: null as string | null,
  category: "websites" as RoomId,
  is_favorite: false,
  notes: "",
  tags: [] as string[],
};

type CoverTab = "website" | "upload";

export default function AddResourcePanel({
  open,
  onClose,
  onSave,
  prefillUrl,
  editResource,
  onUpdate,
}: AddResourcePanelProps) {
  const [form, setForm] = useState({ ...EMPTY });
  const [tagInput, setTagInput] = useState("");
  const [fetching, setFetching] = useState(false);
  const [coverTab, setCoverTab] = useState<CoverTab>("website");
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!editResource;
  const activeCover = form.cover_image_override || form.cover_image_url;

  useEffect(() => {
    if (!open) { setForm({ ...EMPTY }); setTagInput(""); setCoverTab("website"); return; }
    if (editResource) {
      setForm({
        url: editResource.url,
        title: editResource.title,
        description: editResource.description,
        cover_image_url: editResource.cover_image_url,
        cover_image_override: editResource.cover_image_override,
        category: editResource.category,
        is_favorite: editResource.is_favorite,
        notes: editResource.notes,
        tags: [...editResource.tags],
      });
      setCoverTab(editResource.cover_image_override ? "upload" : "website");
    } else if (prefillUrl) {
      setForm((f) => ({ ...f, url: prefillUrl }));
      fetchMeta(prefillUrl);
    }
  }, [open, prefillUrl, editResource]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const fetchMeta = async (url: string) => {
    setFetching(true);
    try {
      const res = await fetch(`/api/fetch-meta?url=${encodeURIComponent(url)}`);
      if (res.ok) {
        const data = await res.json();
        setForm((f) => ({
          ...f,
          title: data.title || f.title,
          description: data.description || f.description,
          cover_image_url: data.image || f.cover_image_url,
        }));
      }
    } catch {}
    setFetching(false);
  };

  const handleUrlBlur = async () => {
    if (!form.url || form.title) return;
    await fetchMeta(form.url);
  };

  const handleRefetchCover = async () => {
    if (!form.url) return;
    await fetchMeta(form.url);
    setCoverTab("website");
    setForm((f) => ({ ...f, cover_image_override: null }));
  };

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setForm((f) => ({ ...f, cover_image_override: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, "").toLowerCase();
    if (t && !form.tags.includes(t)) setForm((f) => ({ ...f, tags: [...f.tags, t] }));
    setTagInput("");
  };

  const removeTag = (tag: string) => setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));

  const handleSave = () => {
    if (!form.url || !form.title) return;
    if (isEditing && editResource && onUpdate) {
      onUpdate({ ...editResource, ...form });
    } else {
      onSave(form);
    }
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-[#F8F6F1] border-l border-[#DDD9D0] z-50 flex flex-col shadow-2xl">

        {/* Header */}
        <div className="px-6 pt-6 pb-5 border-b border-[#DDD9D0]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[9px] font-google-sans font-medium tracking-[0.12em] uppercase text-[#9B9690] mb-1">
                {isEditing ? "Editing" : "New Reference"}
              </p>
              <h2 className="font-prata text-[18px] text-[#0D0D0D] leading-tight">
                {isEditing ? "Edit Resource" : "Add to Room"}
              </h2>
            </div>
            <button onClick={onClose} className="mt-1 w-7 h-7 flex items-center justify-center hover:bg-[#E5E1DA] rounded-[2px] transition-colors text-[#9B9690] hover:text-[#0D0D0D]">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* URL */}
          <div>
            <label className="form-label">URL</label>
            <div className="relative">
              <input
                type="url"
                placeholder="https://"
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                onBlur={handleUrlBlur}
                className="form-input"
              />
              {fetching && (
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  <div className="w-3.5 h-3.5 border-2 border-[#724CF9] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="form-label">Title</label>
            <input
              type="text"
              placeholder="Resource title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="form-input font-prata text-[14px] placeholder:font-google-sans placeholder:text-[13px]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="form-label">Description</label>
            <textarea
              placeholder="What is this about?"
              rows={2}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="form-input resize-none"
            />
          </div>

          {/* Cover Image — two tabs */}
          <div>
            <label className="form-label">Cover Image</label>

            {/* Tab switcher */}
            <div className="flex border border-[#E2DDD6] rounded-sm overflow-hidden mb-2">
              <button
                onClick={() => setCoverTab("website")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-google-sans transition-colors ${
                  coverTab === "website"
                    ? "bg-[#0D0D0D] text-white"
                    : "bg-white text-[#6B6B6B] hover:bg-[#F5F2EC]"
                }`}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                </svg>
                Pull from website
              </button>
              <div className="w-px bg-[#E2DDD6]" />
              <button
                onClick={() => setCoverTab("upload")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-google-sans transition-colors ${
                  coverTab === "upload"
                    ? "bg-[#0D0D0D] text-white"
                    : "bg-white text-[#6B6B6B] hover:bg-[#F5F2EC]"
                }`}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                Upload / Drop
              </button>
            </div>

            {/* Website tab — OG image preview */}
            {coverTab === "website" && (
              <div>
                {form.cover_image_url && !form.cover_image_override ? (
                  <div className="relative group rounded-sm overflow-hidden aspect-[16/9] bg-[#F5F2EC]">
                    <img
                      src={form.cover_image_url}
                      alt="Website cover"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button
                        onClick={handleRefetchCover}
                        className="text-[11px] font-google-sans text-white bg-black/60 px-3 py-1.5 rounded-sm flex items-center gap-1.5"
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M23 4v6h-6M1 20v-6h6" />
                          <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                        </svg>
                        Refresh
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[16/9] rounded-sm bg-[#F5F2EC] border border-dashed border-[#E2DDD6] flex flex-col items-center justify-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                    </svg>
                    <p className="text-[11px] font-google-sans text-[#6B6B6B] text-center px-4">
                      {form.url
                        ? <button onClick={() => fetchMeta(form.url)} className="text-[#724CF9] hover:underline">Fetch from URL</button>
                        : "Enter a URL above to pull the cover image"}
                    </p>
                  </div>
                )}
                {form.url && (
                  <button
                    onClick={handleRefetchCover}
                    className="mt-1.5 text-[11px] font-google-sans text-[#724CF9] hover:text-[#564592] transition-colors"
                  >
                    ↻ Re-fetch from URL
                  </button>
                )}
              </div>
            )}

            {/* Upload tab — drag & drop */}
            {coverTab === "upload" && (
              <div>
                {form.cover_image_override ? (
                  <div className="relative group rounded-sm overflow-hidden aspect-[16/9] bg-[#F5F2EC]">
                    <img
                      src={form.cover_image_override}
                      alt="Uploaded cover"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[11px] font-google-sans text-white bg-black/60 px-3 py-1.5 rounded-sm"
                      >
                        Replace
                      </button>
                      <button
                        onClick={() => setForm((f) => ({ ...f, cover_image_override: null }))}
                        className="text-[11px] font-google-sans text-white bg-black/60 px-3 py-1.5 rounded-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`aspect-[16/9] rounded-sm border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors ${
                      dragging
                        ? "border-[#724CF9] bg-[#724CF9]/5"
                        : "border-[#E2DDD6] bg-[#F5F2EC] hover:border-[#0D0D0D] hover:bg-white"
                    }`}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={dragging ? "#724CF9" : "#6B6B6B"} strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                    </svg>
                    <div className="text-center">
                      <p className="text-[12px] font-google-sans text-[#0D0D0D]">
                        {dragging ? "Drop to upload" : "Drop image here"}
                      </p>
                      <p className="text-[11px] font-google-sans text-[#6B6B6B]">or click to browse</p>
                    </div>
                    <p className="text-[10px] font-google-sans text-[#6B6B6B]">PNG, JPG, WEBP</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }}
                />
              </div>
            )}
          </div>

          {/* Room */}
          <div>
            <label className="form-label">Room</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as RoomId }))}
              className="form-input"
            >
              {ROOMS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="form-label">Tags</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="#tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); } }}
                className="form-input flex-1"
              />
              <button onClick={addTag} className="px-3 py-2 bg-[#F8F6F1] border border-[#DDD9D0] rounded-[2px] text-[11px] font-google-sans hover:bg-[#E5E1DA] transition-colors text-[#0D0D0D]">
                Add
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 text-[11px] font-google-sans text-[#0D0D0D] bg-[#F5F2EC] border border-[#E2DDD6] px-2 py-0.5 rounded-[3px]">
                    #{tag}
                    <button onClick={() => removeTag(tag)} className="text-[#6B6B6B] hover:text-[#EF3054]">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="form-label">Personal Notes</label>
            <textarea
              placeholder="Why did you save this? What struck you?"
              rows={3}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="form-input resize-none"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#DDD9D0] bg-[#F0EDE6]">
          <button
            onClick={handleSave}
            disabled={!form.url || !form.title}
            className="w-full bg-[#0D0D0D] text-white text-[12px] font-google-sans font-medium py-2.5 rounded-[2px] hover:bg-[#222] disabled:opacity-30 disabled:cursor-not-allowed transition-colors tracking-wide"
          >
            {isEditing ? "Save Changes" : "Save to Room"}
          </button>
          {(!form.url || !form.title) && (
            <p className="text-center text-[10px] font-google-sans text-[#9B9690] mt-2">URL and title required</p>
          )}
        </div>
      </div>
    </>
  );
}
