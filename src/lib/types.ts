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
  created_by?: string;
  workspace_id?: string;
  added_by_name?: string;
  contribution_note?: string;
  user_id?: string;
}

export type WorkspaceRole = "owner" | "contributor";

export interface WorkspaceAccess {
  workspaceId: string;
  workspaceName: string;
  workspaceKind: "shared" | "personal";
  role: WorkspaceRole;
  displayName: string;
}

export type SortOption = "newest" | "oldest" | "favorites";
