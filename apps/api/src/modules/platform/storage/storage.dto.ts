import { IResult } from '@/utils/interfaces.util';

export interface ImageDTO {
  uploadRef: string; // Unique upload identifier
  uploadedBy: string; // User ID who uploaded the image
  fileName: string; // Original filename
  file: string; // Full S3 URL (rawFile) - Use this for frontend display/sharing
  s3Key?: string; // S3 key/path (e.g., "images/upload-id") - Use this for backend operations (delete, update) and database storage
}

class ImageMapper {
  constructor() {}

  /**
   * @name mapImage
   * @param uploadResult - Result from storage service upload
   * @param uploadedBy - User ID who uploaded the image
   * @returns ImageDTO
   * @description Converts a storage upload result into a DTO for API responses.
   * 
   * @note
   * - `file` (rawFile): Full S3 URL (e.g., "https://bucket.s3.region.amazonaws.com/images/upload-id")
   *   Use for: Frontend display, sharing, direct image access
   * 
   * - `s3Key`: S3 key/path (e.g., "images/upload-id")
   *   Use for: Database storage, backend operations (delete, update, check existence)
   *   This is what gets stored in models like { fileName: string, s3Key: string }
   */
  public mapImage(
    uploadResult: IResult,
    uploadedBy: string,
  ): ImageDTO {
    const result: ImageDTO = {
      uploadRef: uploadResult.data.uploadId,
      uploadedBy: uploadedBy,
      fileName: uploadResult.data.fileName,
      file: uploadResult.data.rawFile,
      s3Key: uploadResult.data.s3Key,
    };

    return result;
  }
}

export default new ImageMapper();
