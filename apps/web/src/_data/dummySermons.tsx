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
}

export const dummySermons: Sermon[] = [
  {
    id: "1",
    name: "RecordingHopefilled",
    duration: "34:01",
    dateCreated: "Yesterday",
    plays: 5,
    comments: 12,
    likes: 5,
    dislikes: 3,
    type: "audio",
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
  },
];
