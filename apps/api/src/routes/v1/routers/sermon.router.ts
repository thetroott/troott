import { Router } from "express";
import {
  deleteSermon,
  moveSermonToBin,
  publishSermon,
  updateSermon,
  uploadSermon,
  getSermonById,
  getSermonsByTopic,
  getAllSermons,
  getSermonsByminister,
  getSermonsByministerMostLiked,
  getSermonsByministerMostShared,
  getSermonsByministerRecentlyPublished,
  getSermonsMostPlayed,
  getSermonsMostLiked,
  getSermonsMostShared,
  getSermonsRecentlyPublished,
  getRecentlyAddedSermons,
  getUserRecentlyPlayedSermons,
  getPopularSermonsRecentlyPlayed,
  getSermonsByUserInterests,
  uploadSermonCover,
  getSermonsByMinisterMostPlayed,
  getFavoriteMinisterSermons
} from "../../../controllers/sermon.controller";
import uploadHandler from "../../../middlewares/upload.mdw";

const sermonRouter = Router({ mergeParams: true });

// Upload and Publish routes
sermonRouter.post("/start-upload", uploadHandler, uploadSermon);
sermonRouter.post("/image-upload", uploadHandler, uploadSermonCover);
sermonRouter.post("/publish", publishSermon);

// Update and Delete routes
sermonRouter.put("/update/:id", updateSermon);
sermonRouter.put("/move-to-bin/:id", moveSermonToBin);
sermonRouter.delete("/delete/:id", deleteSermon);

// Get single sermon
sermonRouter.get("/:id", getSermonById);

// Get sermons by topic
sermonRouter.get("/topic/:topic", getSermonsByTopic);

// Get all sermons
sermonRouter.get("/", getAllSermons);

// minister-specific routes
sermonRouter.get("/minister/:ministerId", getSermonsByminister);
sermonRouter.get("/minister/:ministerId/most-played", getSermonsByMinisterMostPlayed);
sermonRouter.get("/minister/:ministerId/most-liked", getSermonsByministerMostLiked);
sermonRouter.get("/minister/:ministerId/most-shared", getSermonsByministerMostShared);
sermonRouter.get("/minister/:ministerId/recently-published", getSermonsByministerRecentlyPublished);

// Global sermon statistics routes
sermonRouter.get("/stats/most-played", getSermonsMostPlayed);
sermonRouter.get("/stats/most-liked", getSermonsMostLiked);
sermonRouter.get("/stats/most-shared", getSermonsMostShared);
sermonRouter.get("/stats/recently-published", getSermonsRecentlyPublished);

// User-specific sermon routes
sermonRouter.get("/user/recently-added", getRecentlyAddedSermons);
sermonRouter.get("/user/recently-played", getUserRecentlyPlayedSermons);
sermonRouter.get("/user/popular", getPopularSermonsRecentlyPlayed);
sermonRouter.get("/user/favorite-ministers", getFavoriteMinisterSermons);
sermonRouter.get("/user/interests", getSermonsByUserInterests);

export default sermonRouter;