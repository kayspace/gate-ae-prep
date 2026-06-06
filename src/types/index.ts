// shared app-wide types
export type Progress = Record<string, boolean>;
export type Notes = Record<string, string>;

export type PlaylistVideo = {
  videoId: string;
  title: string;
  thumb: string;
  done: boolean;
};

export type Resource = {
  id: string;
  title: string;
  url: string;
  kind: "video" | "playlist" | "link";
  playlistId?: string;
  videos?: PlaylistVideo[];
  loading?: boolean;
  error?: string;
  source?: "default" | "custom" | "recommended";
};

export type Resources = Record<string, Resource[]>;

export type ReviseItem = {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
};
export type Revisions = Record<string, ReviseItem[]>;

export type WatchState = { watched: number; pos: number; dur: number };
export type WatchMap = Record<string, WatchState>;

export type ViewKey = "syllabus" | "books" | "resources" | "revise" | "log" | "guide" | "feedback";
