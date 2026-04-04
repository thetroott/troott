import { Router } from "express";
import { createLibrary, deleteLibrary, getAllLibraries, getLibraryById, getLibraryByUser, updateLibrary } from "../../../controllers/library.controller";
import uploadHandler from "../../../middlewares/upload.mdw";

const libraryRouter = Router({ mergeParams: true });

libraryRouter.post("/", uploadHandler, createLibrary);
libraryRouter.get("/:id", getLibraryById);
libraryRouter.get("/:userId", getLibraryByUser);
libraryRouter.get("/", getAllLibraries);
libraryRouter.put("/userId", uploadHandler, updateLibrary);
libraryRouter.delete("/userId", deleteLibrary);

export default libraryRouter;