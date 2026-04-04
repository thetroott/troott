import { ObjectId } from "mongoose";
import { ContentState, ContentStatus } from "../utils/enums.util";
import { IAudioMetadata } from "../utils/interfaces.util";


export interface PublishSermonDTO {
  title: string;
  description: string;
  sermon: string;
  image: string;
  size: number;
  duration: number;
  releaseDate: Date;
  releaseYear: number;
  topic: string;
  tags: Array<string>;
  isPublic: boolean;
  isSeries?: boolean;
  series?: Array<ObjectId>;
  minister: ObjectId | string;
  playlist?: ObjectId | string;
  publishedBy: ObjectId | string;
}


export interface UpdateSermonDTO {
  id: string;

  title?: string;
  description?: string;
  duration?: number;
  releaseDate?: Date;
  releaseYear?: number;
  sermonUrl?: string;
  imageUrl?: string;
  size?: number;

  topic?: string;
  tags?: Array<string>;
  isPublic?: boolean;
  shareableUrl?: string;

  isSeries?: boolean;
  series?: Array<ObjectId>;

  state?: ContentState;
  status?: ContentStatus;

  minister?: ObjectId;
  playlist?: ObjectId;
  publishedBy?: ObjectId;

  versionId?: ObjectId;
  changesSummary?: string;

  uploadRef?: ObjectId;
  uploadSummary?: {
    fileName?: string;
    fileSize?: number;
    mimetype?: string;
    s3Key?: string;
    s3Url?: string;
    metadata?: IAudioMetadata;
    uploadedBy?: ObjectId;
  };
}

export interface DeleteSermonDTO {
  id: string;
  state?: ContentState;
  status?: ContentStatus;
  publishedBy?: ObjectId;
}

export interface SermonDTO {
  id: string;
  title: string;
  description: string;
  duration: number;

  sermonUrl: string;
  imageUrl: string;
}

export interface SermonUploadDTO {
  file: string;
  uploadedBy: ObjectId;
  uploadRef: string;
}

export interface SermonImageDTO {
  fileName: string
  file: string;
  uploadedBy: ObjectId;
  uploadRef: string;

}
