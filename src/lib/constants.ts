export const ROOMS = [
  { id: "websites", label: "Websites", color: "#EF3054", count: 0 },
  { id: "branding", label: "Branding", color: "#564592", count: 0 },
  { id: "typography", label: "Typography", color: "#724CF9", count: 0 },
  { id: "motion", label: "Motion", color: "#CA7DF9", count: 0 },
  { id: "packaging", label: "Packaging", color: "#EDF67D", count: 0 },
  { id: "books", label: "Books", color: "#EF3054", count: 0 },
  { id: "articles", label: "Articles", color: "#564592", count: 0 },
  { id: "tools", label: "Tools", color: "#724CF9", count: 0 },
  { id: "job-resources", label: "Job Resources", color: "#CA7DF9", count: 0 },
  { id: "portfolios", label: "Portfolios", color: "#EDF67D", count: 0 },
  { id: "ai-tools", label: "AI Tools", color: "#EF3054", count: 0 },
  { id: "creative-technology", label: "Creative Technology", color: "#564592", count: 0 },
  { id: "miscellaneous", label: "Miscellaneous", color: "#6B6B6B", count: 0 },
] as const;

export type RoomId = typeof ROOMS[number]["id"];

export const ROOM_MAP = Object.fromEntries(ROOMS.map((r) => [r.id, r])) as Record<RoomId, typeof ROOMS[number]>;
