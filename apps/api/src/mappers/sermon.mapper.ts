import {  SermonDTO, SermonImageDTO, SermonUploadDTO } from "../dtos/sermon.dto";
import { ISermonDoc } from "../utils/interfaces.util";

class SermonMapper {
  constructor() {}


    /**
   * @name mapUploadSermon
   * @param sermon
   * @returns SermonUploadDTO
   * @description Converts a sermon document into a DTO for API responses.
   */
  public async mapUploadSermon(sermon: ISermonDoc): Promise<SermonUploadDTO> {
    const result: SermonUploadDTO = {
          id: (sermon as any).id?.toString?.() ?? (sermon as any)._id?.toString?.(),
          uploadRef: sermon.uploadSummary.uploadId,
          uploadedBy: sermon.uploadSummary.uploadedBy,
          file: sermon.uploadSummary.fileName,    
    };

    return result;
  }

      /**
   * @name mapUploadSermon
   * @param sermon
   * @returns SermonImageDTO
   * @description Converts a sermon document into a DTO for API responses.
   */
  public async mapSermonCover(sermon: ISermonDoc): Promise<SermonImageDTO> {
    const result: SermonImageDTO = {         
          uploadRef: sermon.imageSummary.uploadId,
          uploadedBy: sermon.imageSummary.uploadedBy,
          fileName: sermon.imageSummary.fileName,
          file: sermon.imageSummary.rawFile       };

    return result;
  }


  /**
   * @name mapSermon
   * @param sermon
   * @returns SermonDTO
   * @description Converts a sermon document into a DTO for API responses.
   */
  public async mapSermon(sermon: ISermonDoc): Promise<SermonDTO> {
    const result: SermonDTO = {
      id: sermon.id.toString(),
      title: sermon.title,
      description: sermon.description,
      duration: sermon.duration,
      sermonUrl: sermon.sermonUrl,
      imageUrl: sermon.imageUrl,
    };

    return result;
  }


}

export default new SermonMapper();
