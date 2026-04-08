import { Request, Response, NextFunction } from "express";
import asyncHandler from "../middlewares/async.mdw";
import ErrorResponse from "../utils/error.util";
import { pathParam } from "../utils/route-params.util";
import sermonRepository from "../repositories/sermon.repository";
import {
  DeleteSermonDTO,
  PublishSermonDTO,
  UpdateSermonDTO,
} from "../dtos/sermon.dto";
import { IFile, ISermonDoc } from "../utils/interfaces.util";
import { ContentState, ContentStatus } from "../utils/enums.util";
import sermonService from "../services/sermon.service";
import sermonMapper from "../mappers/sermon.mapper";

/**
 * @name uploadSermom
 * @description A method to handle sermon file uploads.
 * Processes the multipart form data, validates the upload,
 * and initiates the upload session.
 * @route POST /api/v1/sermon/start-upload
 * @access Public
 * @param {File} file
 * @returns {Object} uplaod sermon details
 */
export const uploadSermon = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    
    const files: IFile[] = (req as any).files;
    const file: IFile | undefined = files && files.length > 0 ? files[0] : undefined;
    
    if (!file) {
      return next(new ErrorResponse("No file found in request", 400, []));
    }

    const upload = await sermonService.handleUploadSermon(file);
    if (upload.error || !upload.data) {
      return next(new ErrorResponse(upload.message, 500, []));
    }

    const response = await sermonMapper.mapUploadSermon(upload.data as ISermonDoc);

    res.status(200).json({
      error: false,
      errors: [],
      data: response,
      message: upload.message,
      status: 200,
    });
  }
);


/**
 * @name uploadSermomCover
 * @description A method to handle sermon image file uploads.
 * Processes the multipart form data, validates the upload,
 * and initiates the upload session.
 * @route POST /api/v1/sermon/image-upload
 * @access Public
 * @param {File} file
 * @returns {Object} uploaded file
 */
export const uploadSermonCover = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    
    const files: IFile[] = (req as any).files;
    const file: IFile | undefined = files && files.length > 0 ? files[0] : undefined;
    
    if (!file) {
      return next(new ErrorResponse("No file found in request", 400, []));
    }

    const upload = await sermonService.handleUploadImage(file);
    if (upload.error || !upload.data) {
      return next(new ErrorResponse(upload.message, 500, []));
    }

    const response = await sermonMapper.mapSermonCover(upload.data as ISermonDoc);

    res.status(200).json({
      error: false,
      errors: [],
      data: response,
      message: upload.message,
      status: 200,
    });
  }
);


/**
 * @name publishSermon
 * @description A method to publish a processed sermon.
 * Makes the sermon publicly accessible and updates its status.
 * @route POST /api/v1/sermon/publish
 * @access Public
 * @returns {Object} publlished sermon
 */
export const publishSermon = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {

    const id = pathParam(req.params.id);
    if (!id) {
      return next(new ErrorResponse("id is required", 400, []));
    }
    const sermonExist = await sermonRepository.findBySermonId(id);
    if (sermonExist.error) {
      return next(
        new ErrorResponse(sermonExist.message, sermonExist.code!, [])
      );
    }

    const {
      title,
      description,
      duration,
      releaseDate,
      releaseYear,
      sermonUrl,
      imageUrl,
      size,
      topic,
      tags,
      isPublic,
      shareableUrl,
      isSeries,
      series,
      state,
      status,
      minister,
      playlist,
      publishedBy,
      versionId,
      changesSummary,
      uploadRef,
      uploadSummary,
    } = req.body;

    const updatePayload: Partial<UpdateSermonDTO> = {
      title,
      description,
      duration,
      releaseDate,
      releaseYear,
      sermonUrl,
      imageUrl,
      size,
      topic,
      tags,
      isPublic,
      shareableUrl,
      isSeries,
      series,
      state,
      status,
      minister,
      playlist,
      publishedBy,
      versionId,
      changesSummary,
      uploadRef,
      uploadSummary,
    };

    const updated = await sermonRepository.updateSermon(
      id,
      updatePayload as Partial<ISermonDoc>
    );

    if (updated.error) {
      return next(new ErrorResponse(updated.message, updated.code!, []));
    }

    res.status(200).json({
      error: false,
      errors: [],
      data: updated.data,
      message: "Sermon updated successfully",
      status: 200,
    });
  }
);




/**
 * @name updateSermon
 * @description A method to update an existing sermon by ID.
 * @route PUT /api/v1/sermon/update/:id
 * @access Public
 * @returns {Object} updated sermon
 */
export const updateSermon = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {

    const id = pathParam(req.params.id);
    if (!id) {
      return next(new ErrorResponse("id is required", 400, []));
    }
    const sermonExist = await sermonRepository.findBySermonId(id);
    if (sermonExist.error) {
      return next(
        new ErrorResponse(sermonExist.message, sermonExist.code!, [])
      );
    }

    const {
      title,
      description,
      duration,
      releaseDate,
      releaseYear,
      sermonUrl,
      imageUrl,
      size,
      topic,
      tags,
      isPublic,
      shareableUrl,
      isSeries,
      series,
      state,
      status,
      minister,
      playlist,
      publishedBy,
      versionId,
      changesSummary,
      uploadRef,
      uploadSummary,
    } = req.body;

    const updatePayload: Partial<UpdateSermonDTO> = {
      title,
      description,
      duration,
      releaseDate,
      releaseYear,
      sermonUrl,
      imageUrl,
      size,
      topic,
      tags,
      isPublic,
      shareableUrl,
      isSeries,
      series,
      state,
      status,
      minister,
      playlist,
      publishedBy,
      versionId,
      changesSummary,
      uploadRef,
      uploadSummary,
    };

    const updated = await sermonRepository.updateSermon(
      id,
      updatePayload as Partial<ISermonDoc>
    );

    if (updated.error) {
      return next(new ErrorResponse(updated.message, updated.code!, []));
    }

    res.status(200).json({
      error: false,
      errors: [],
      data: updated.data,
      message: "Sermon updated successfully",
      status: 200,
    });
  }
);

/**
 * @name moveSermonToBin
 * @description Soft deletes a sermon by marking its status as DELETED.
 * This does not remove the sermon from the database, but makes it invisible in active listings
 * @route PUT /api/v1/sermon/move-to-bin/:id
 * @access Public
 * @returns {Object} updated sermon
 */
export const moveSermonToBin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {

    const id = pathParam(req.params.id);
    if (!id) {
      return next(new ErrorResponse("id is required", 400, []));
    }
    const { state, status, publishedBy }: Partial<DeleteSermonDTO> = req.body;

    const sermonExist = await sermonRepository.findBySermonId(id);
    if (sermonExist.error) {
      return next(
        new ErrorResponse(sermonExist.message, sermonExist.code!, [])
      );
    }

    const deletePayload = {
      state: state || ContentState.DELETED,
      status: status || ContentStatus.DELETED,
      publishedBy: publishedBy,
    };

    const deleted = await sermonRepository.moveSermonToBin(id, deletePayload);
    if (deleted.error) {
      return next(new ErrorResponse(deleted.message, deleted.code!, []));
    }

    res.status(200).json({
      error: false,
      errors: [],
      data: deleted.data,
      message: "Sermon moved to bin successfully",
      status: 200,
    });
  }
);

/**
 * @name deleteSermon
 * @description deletes a sermon from the database.
 * @route DELETE /api/v1/sermon/deleete/:id
 * @access Private - Admin Only
 * @returns {Object} updated sermon
 */
export const deleteSermon = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {

    const id = pathParam(req.params.id);
    if (!id) {
      return next(new ErrorResponse("id is required", 400, []));
    }
    const sermonExist = await sermonRepository.findBySermonId(id);
    if (sermonExist.error) {
      return next(
        new ErrorResponse(sermonExist.message, sermonExist.code!, [])
      );
    }

    const deleted = await sermonRepository.deleteSermon(id);
    if (deleted.error) {
      return next(new ErrorResponse(deleted.message, deleted.code!, []));
    }

    res.status(200).json({
      error: false,
      errors: [],
      data: deleted.data,
      message: "Sermon deleted successfully",
      status: 200,
    });
  }
);

/**
 * @name getSermonById
 * @description Get a sermon and its metadata by ID
 * @route GET /api/v1/sermon/:id
 * @access Public
 */
export const getSermonById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {

    const id = pathParam(req.params.id);
    if (!id) {
      return next(new ErrorResponse("id is required", 400, []));
    }

    const sermon = await sermonRepository.findBySermonId(id);
    if (sermon.error)
      return next(new ErrorResponse(sermon.message, sermon.code!, []));

    res.status(200).json({
      error: false,
      errors: [],
      data: sermon.data,
      message: "Sermon fetched successfully",
      status: 200,
    });
  }
);

/**
 * @name getSermonsBytopic
 * @description Get sermons filtered by topic
 * @route GET /api/v1/sermon/topic/:topic
 * @access Public
 * @returns {Object} list of sermons
 */
export const getSermonsByTopic = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {

    const topic = pathParam(req.params.topic);
    if (!topic) {
      return next(new ErrorResponse("topic is required", 400, []));
    }
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    const options = {
      limit,
      skip,
      sort: req.query.sort as string,
      populate: "minister series topic",
    };

    const result = await sermonRepository.findByTopic(topic, options);

    if (result.error) {
      return next(new ErrorResponse(result.message, result.code, []));
    }

    res.status(200).json({
      error: false,
      errors: [],
      data: result.data,
      message: `Sermons for topic "${topic}" retrieved successfully`,
      status: 200,
    });
  }
);

/**
 * @name getAllSermons
 * @description Get all sermons with pagination, filtering, sorting
 * @route GET /api/v1/sermon
 * @access Public
 * @returns {Object} list of sermons
 */
export const getAllSermons = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    const filters = {};
    const options = {
      limit,
      skip,
      sort: req.query.sort as string,
      populate: "minister series topic",
    };

    const result = await sermonRepository.findAll(filters, options);

    if (result.error) {
      return next(new ErrorResponse(result.message, result.code || 500, []));
    }

    res.status(200).json({
      error: false,
      errors: [],
      data: result.data,
      message: "Sermons retrieved successfully",
      status: 200,
    });
  }
);

/**
 * @name getSermonsByminister
 * @description Get sermons by minister
 * @route GET /api/v1/sermon/minister/:ministerId
 * @access Public
 * @returns {Object} list of sermons
 */
export const getSermonsByminister = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {

    const ministerId = pathParam(req.params.ministerId);
    if (!ministerId) {
      return next(new ErrorResponse("ministerId is required", 400, []));
    }
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    const options = {
      limit,
      skip,
      sort: req.query.sort as string,
      populate: "minister series topic",
    };

    const result = await sermonRepository.getSermonsByMinister(
      ministerId,
      options
    );

    if (result.error) {
      return next(new ErrorResponse(result.message, result.code || 500, []));
    }

    res.status(200).json({
      error: false,
      errors: [],
      data: result.data,
      message: `Sermons by minister retrieved successfully`,
      status: 200,
    });
  }
);

/**
 * @name getSermonsByministerSorted
 * @description Internal helper to fetch sermons by minister with dynamic sort field.
 * Helper to get sermons by minister sorted by various criteria
 * @param {"playCount" | "likeCount" | "shareCount" | "releaseDate"} sortField
 * @returns {Function} Express handler function
 */
const getSermonsByMinisterSorted = (
  sortField: "playCount" | "likeCount" | "shareCount" | "releaseDate"
) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    
    const ministerId = pathParam(req.params.ministerId);
    if (!ministerId) {
      return next(new ErrorResponse("ministerId is required", 400, []));
    }
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    const options = {
      limit,
      skip,
      populate: "minister series topic",
      recentOnly: sortField === "releaseDate", // for recent filter
    };

    const result = await sermonRepository.findByMinisterSorted(
      ministerId,
      sortField,
      options
    );

    if (result.error) {
      return next(new ErrorResponse(result.message, result.code || 500, []));
    }

    const messagesMap: Record<string, string> = {
      playCount: "Most played sermons retrieved successfully",
      likeCount: "Most liked sermons retrieved successfully",
      shareCount: "Most shared sermons retrieved successfully",
      releaseDate: "Recently published sermons retrieved successfully",
    };

    res.status(200).json({
      error: false,
      errors: [],
      data: result.data,
      message: messagesMap[sortField],
      status: 200,
    });
  });

/**
 * @name getSermonsByministerMostPlayed
 * @description Get most played sermons by minister
 * @route GET /api/v1/sermon/minister/:ministerId/most-played
 * @access Public
 * @returns {Object} list of sermons sorted by most played
 */
export const getSermonsByMinisterMostPlayed =
  getSermonsByMinisterSorted("playCount");

/**
 * @name getSermonsByMinisterMostLiked
 * @description Get most liked sermons by minister
 * @route GET /api/v1/sermon/minister/:ministerId/most-liked
 * @access Public
 * @returns {Object} list of sermons sorted by most liked
 */
export const getSermonsByministerMostLiked =
  getSermonsByMinisterSorted("likeCount");

/**
 * @name getSermonsByMinisterMostShared
 * @description Get most shared sermons by minister
 * @route GET /api/v1/sermon/minister/:ministerId/most-shared
 * @access Public
 * @returns {Object} list of sermons sorted by most shared
 */
export const getSermonsByministerMostShared =
  getSermonsByMinisterSorted("shareCount");

/**
 * @name getSermonsByMinisterRecentlyPublished
 * @description Get recently published sermons by minister (within the last 7 days)
 * @route GET /api/v1/sermon/minister/:ministerId/recently-published
 * @access Public
 * @returns {Object} list of recently published sermons
 */
export const getSermonsByministerRecentlyPublished =
  getSermonsByMinisterSorted("releaseDate");

/**
 * @name getSermonsAllSorted
 * @description Internal helper to fetch sermons across all ministers with dynamic sort field
 * @param {"playCount" | "likeCount" | "shareCount" | "releaseDate"} sortField
 * @returns {Function} Express route handler function
 */
const getSermonsAllSorted = (
  sortField: "playCount" | "likeCount" | "shareCount" | "releaseDate"
) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    const options = {
      limit,
      skip,
      populate: "minister series topic",
      recentOnly: sortField === "releaseDate",
    };

    const result = await sermonRepository.findAllSorted(sortField, options);

    if (result.error) {
      return next(new ErrorResponse(result.message, result.code || 500, []));
    }

    const messagesMap: Record<string, string> = {
      playCount: "Most played sermons retrieved successfully",
      likeCount: "Most liked sermons retrieved successfully",
      shareCount: "Most shared sermons retrieved successfully",
      releaseDate: "Recently published sermons retrieved successfully",
    };

    res.status(200).json({
      error: false,
      errors: [],
      data: result.data,
      message: messagesMap[sortField],
      status: 200,
    });
  });

/**
 * @name getSermonsMostPlayed
 * @description Get most played sermons across all ministers
 * @route GET /api/v1/sermon/most-played
 * @access Public
 * @returns {Object} List of most played sermons
 */
export const getSermonsMostPlayed = getSermonsAllSorted("playCount");

/**
 * @name getSermonsMostLiked
 * @description Get most liked sermons across all ministers
 * @route GET /api/v1/sermon/most-liked
 * @access Public
 * @returns {Object} List of most liked sermons
 */
export const getSermonsMostLiked = getSermonsAllSorted("likeCount");

/**
 * @name getSermonsMostShared
 * @description Get most shared sermons across all ministers
 * @route GET /api/v1/sermon/most-shared
 * @access Public
 * @returns {Object} List of most shared sermons
 */
export const getSermonsMostShared = getSermonsAllSorted("shareCount");

/**
 * @name getSermonsRecentlyPublished
 * @description Get recently published sermons across all ministers (last 7 days)
 * @route GET /api/v1/sermon/recently-published
 * @access Public
 * @returns {Object} List of recent sermons
 */
export const getSermonsRecentlyPublished = getSermonsAllSorted("releaseDate");

/**
 * @name getRecentlyAddedSermons
 * @description Get sermons released in the last 30 days
 * @returns {Function} Express route handler function
 */
export const getRecentlyAddedSermons = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    const options = { limit, skip, populate: "minister series category" };
    const result = await sermonRepository.findRecentlyAddedMonthly(options);

    if (result.error) {
      return next(new ErrorResponse(result.message, result.code, []));
    }

    res.status(200).json({
      error: false,
      errors: [],
      data: result.data,
      message: "Recently added sermons retrieved successfully",
      status: 200,
    });
  }
);

/**
 * @name getUserRecentlyPlayedSermons
 * @description Get sermons the user recently played
 * @returns {Function} Express route handler function
 */
export const getUserRecentlyPlayedSermons = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    
    const userId = pathParam(req.params.userId);
    
    if (!userId) return next(new ErrorResponse("Unauthorized", 401, []));

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    const options = { limit, skip, populate: "minister series category" };
    const result = await sermonRepository.findRecentlyPlayedByUser(
      userId,
      options
    );

    if (result.error) {
      return next(new ErrorResponse(result.message, result.code, []));
    }

    res.status(200).json({
      error: false,
      errors: [],
      data: result.data,
      message: "Recently played sermons retrieved successfully",
      status: 200,
    });
  }
);

/**
 * @name getPopularSermonsRecentlyPlayed
 * @description Get sermons most recently played by users across the app
 * @returns {Function} Express route handler function
 */
export const getPopularSermonsRecentlyPlayed = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    const options = { limit, skip, populate: "minister series topic" };
    const result = await sermonRepository.findMostRecentlyPlayed(options);

    if (result.error) {
      return next(new ErrorResponse(result.message, result.code, []));
    }

    res.status(200).json({
      error: false,
      errors: [],
      data: result.data,
      message: "Popular sermons retrieved successfully",
      status: 200,
    });
  }
);

/**
 * @name getFavoriteMinisterSermons
 * @description Get a random list of sermons from a user's favorite ministers
 * @returns {Function} Express route handler function
 */
export const getFavoriteMinisterSermons = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    
    const rawIds = pathParam(req.params.id);
    const favoriteMinisterIds = rawIds
      ? rawIds.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    if (favoriteMinisterIds.length === 0) {
      return next(new ErrorResponse("No favorite ministers found", 400, []));
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    const options = { limit, skip, populate: "minister series topic" };
    const result = await sermonRepository.findFavoriteMinistersSermonsRandom(
      favoriteMinisterIds,
      options
    );

    if (result.error) {
      return next(new ErrorResponse(result.message, result.code, []));
    }

    res.status(200).json({
      error: false,
      errors: [],
      data: result.data,
      message: "Sermons from favorite ministers retrieved successfully",
      status: 200,
    });
  }
);

/**
 * @name getSermonsByUserInterests
 * @description Get sermons based on user interest tags or topics
 * @returns {Function} Express route handler function
 */
export const getSermonsByUserInterests = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const rawInterests = pathParam(req.params.interests);
    const interests = rawInterests
      ? rawInterests.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    if (interests.length === 0) {
      return next(new ErrorResponse("No interests provided", 400, []));
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    const options = { limit, skip, populate: "minister series topic" };
    const result = await sermonRepository.findByUserInterests(
      interests,
      options
    );

    if (result.error) {
      return next(new ErrorResponse(result.message, result.code, []));
    }

    res.status(200).json({
      error: false,
      errors: [],
      data: result.data,
      message: "Sermons based on interests retrieved successfully",
      status: 200,
    });
  }
);

// create sermon metadata
// get sermon metadata
// update sermon metadata
// delete sermon metadata
// publish sermon
// edit sermon
// delete sermon

// get all sermon list
// get a sermon + metadata
// get sermon by topic
// get sermon by minister
// get sermon by minister: most played
// get sermon by minister: most liked
// get sermon by minister: most shared
// get sermon by minister: recently published (new release)

// get sermon list by series
// get sermon list by date
// get sermon list by search
// get sermon list by topic
// get most played sermon list
// get most liked sermon list
// get most shared sermon list

// share a sermon

// get catalog for new user
// get trending sermons (week)
// get popuar sermons (quarterly)
// get new release (weekly)
// get recently added (monthly)
// get most recently played (by users) - popular/recommended
// get favourite ministers sermons (randomly) - the lsit
// get sermon based on user interests

// get catalog for returning user
// get trending sermons
// get new release (weekly)
// get recently added (monthly)
// get recently played (by user)
// get most recently played (by users) - popular/recommended
// get favourite ministers sermons (randomly) - the lsit
// get sermon based on user interests

// Recommendations
// get user's listening history (completed, skipped, liked, disliked).
// get user’s interactions (comments, shares, saves).
// get user’s following list (creators, ministers).
