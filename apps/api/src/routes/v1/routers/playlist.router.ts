import { Router } from "express";
import {
  addItemToPlaylist,
  createPlaylist,
  deletePlaylist,
  getAllPlaylists,
  getPlaylistById,
  getPlaylistsByUser,
  removeItemFromPlaylist,
  updatePlaylist,
} from "../../../controllers/playlist.controller";
import uploadHandler from "../../../middlewares/upload.mdw";

const playlistRouter = Router({ mergeParams: true });

playlistRouter.post("/", uploadHandler, createPlaylist);
playlistRouter.get("/:id", getPlaylistById);
playlistRouter.get("/user/:id", getPlaylistsByUser);
playlistRouter.get("/", getAllPlaylists);
playlistRouter.put("/:id", uploadHandler, updatePlaylist);
playlistRouter.delete("/:id", deletePlaylist);
playlistRouter.patch("/:playlistId/add", addItemToPlaylist);
playlistRouter.patch("/:playlistId/remove", removeItemFromPlaylist);

export default playlistRouter;
