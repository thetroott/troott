import { Request, Response, NextFunction, RequestHandler } from 'express';
import asyncHandler from '../../../middlewares/async.mdw';
import ErrorResponse from '../../../utils/error.util';
import storageService from './storage.service';
import { IFile } from '../../../utils/interfaces.util';
import imageMapper, { ImageDTO } from './storage.dto';

/**
 * @name uploadImage
 * @description Uploads an image file (image, logo, avatar, etc.) and returns a DTO
 * that can be submitted as part of JSON for any resource
 * @route POST /storage/upload
 * @access Private
 */
export const uploadImage: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      return next(new ErrorResponse('Unauthorized', 401, []));
    }

    // Extract file from req.files
    const files = (req as any).files as IFile[] | undefined;
    
    if (!files || files.length === 0) {
      return next(new ErrorResponse('No file uploaded', 400, []));
    }

    // Get the first file (can be image, logo, avatar, etc.)
    const file = files[0];

    if (!file) {
      return next(new ErrorResponse('No file found in upload', 400, []));
    }

    // Validate that it's an image
    if (!file.mimeType?.startsWith('image/')) {
      return next(
        new ErrorResponse('File must be an image', 400, []),
      );
    }

    // Prepare file data for upload
    const fileData: IFile = {
      stream: file.stream,
      mimeType: file.mimeType,
      uploadId: file.uploadId,
      info: file.info,
      size: file.size,
      fileType: file.fileType,
      uploadedBy: userId,
    };

    // Upload to S3
    const uploadResult = await storageService.uploadFile(fileData);

    if (uploadResult.error) {
      return next(
        new ErrorResponse(
          uploadResult.message,
          uploadResult.code || 500,
          [],
        ),
      );
    }

    // Map to ImageDTO
    const imageDTO: ImageDTO = imageMapper.mapImage(uploadResult, userId);

    res.status(200).json({
      error: false,
      errors: [],
      data: imageDTO,
      message: 'Image uploaded successfully',
      status: 200,
    });
  },
);
