import type { AxiosProgressEvent } from "axios";

class Sermon {
  client;

  constructor(client: unknown, secondaryClient?: unknown) {
    this.client = client;
    void secondaryClient;
  }

  getSermons(payload: unknown) {
    return this.client.get("/sermons", payload);
  }

  getSermonsByMinister(
    ministerId: string,
    params?: {
      page?: number;
      limit?: number;
      sort?: string;
      q?: string;
      status?: "all" | "draft" | "published";
      dateFrom?: string;
      dateTo?: string;
    }
  ) {
    return this.client.get(`/sermon/minister/${ministerId}`, { params });
  }

  updateSermon(id: string, body: Record<string, unknown>) {
    return this.client.put(`/sermon/update/${id}`, body);
  }

  moveSermonToBin(id: string, body?: Record<string, unknown>) {
    return this.client.put(`/sermon/move-to-bin/${id}`, body ?? {});
  }

  startUpload(
    formData: FormData,
    onProgress?: (percent: number) => void,
    signal?: AbortSignal
  ) {
    return this.client.post("/sermon/start-upload", formData, {
      timeout: 0,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      signal,
      onUploadProgress: onProgress
        ? (evt: AxiosProgressEvent) => {
            const total = evt.total;
            if (total)
              onProgress(Math.min(100, Math.round((evt.loaded / total) * 100)));
          }
        : undefined,
    });
  }

  uploadCover(
    formData: FormData,
    onProgress?: (percent: number) => void
  ) {
    return this.client.post("/sermon/image-upload", formData, {
      timeout: 0,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      onUploadProgress: onProgress
        ? (evt: AxiosProgressEvent) => {
            const total = evt.total;
            if (total)
              onProgress(Math.min(100, Math.round((evt.loaded / total) * 100)));
          }
        : undefined,
    });
  }

  publishSermon(id: string, body: Record<string, unknown>) {
    return this.client.post(`/sermon/publish/${id}`, body);
  }

  getSermonById(sermonId: string) {
    return this.client.get(`/sermon/${sermonId}`);
  }
}

export default Sermon;
