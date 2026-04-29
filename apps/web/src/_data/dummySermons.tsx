export interface Sermon {
  id: string;
  name: string;
  duration: string;
  dateCreated: string;
  plays: number;
  comments: number;
  likes: number;
  dislikes: number;
  type: "audio" | "video" | "short";
  /** My Sermons list — Figma status pill (`10154:35090`). */
  publicationStatus?: "published" | "draft";
  /** From API for client-side sort (My Sermons table local mode). */
  createdAtMs?: number;
  updatedAtMs?: number;
  releaseDateMs?: number;
}

export const dummySermons: Sermon[] = [
  {
    id: "1",
    name: "Hope filled",
    duration: "34:01",
    dateCreated: "Yesterday",
    plays: 7,
    comments: 15,
    likes: 7,
    dislikes: 0,
    type: "audio",
    publicationStatus: "published",
  },
  {
    id: "2",
    name: "Faith and Hope",
    duration: "28:45",
    dateCreated: "2 days ago",
    plays: 12,
    comments: 8,
    likes: 15,
    dislikes: 1,
    type: "video",
    publicationStatus: "published",
  },
  {
    id: "3",
    name: "Walking in Love",
    duration: "15:30",
    dateCreated: "1 week ago",
    plays: 25,
    comments: 20,
    likes: 32,
    dislikes: 2,
    type: "audio",
    publicationStatus: "draft",
  },
  {
    id: "4",
    name: "Quick Inspiration",
    duration: "2:15",
    dateCreated: "3 days ago",
    plays: 45,
    comments: 8,
    likes: 28,
    dislikes: 1,
    type: "short",
    publicationStatus: "published",
  },
];
