export interface Sermon {
  id: number;
  title: string;
  duration: string;
  dateCreated: string;
  status: "Published" | "Draft";
  plays: number | string;
  comments: number | string;
  likes: string;
  avatar?: string;
}

