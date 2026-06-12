import type { RoomId } from "./constants";

export interface Resource {
  id: string;
  url: string;
  title: string;
  description: string;
  cover_image_url: string | null;
  cover_image_override: string | null;
  category: RoomId;
  is_favorite: boolean;
  notes: string;
  tags: string[];
  created_at: string;
  user_id: string;
}

export type SortOption = "newest" | "oldest" | "favorites";
