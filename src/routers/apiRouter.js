import express from "express";
import { deleteFollowing, following } from "../controllers/userController";
import {
  createComment,
  deleteComment,
  modifyComment,
  registerView,
} from "../controllers/videoController";
import { protectorMiddleware } from "../middlewares";

const apiRouter = express.Router();

apiRouter.post("/videos/:id([0-9a-f]{24})/view", registerView);
apiRouter.post(
  "/videos/:id([0-9a-f]{24})/comment",
  protectorMiddleware,
  createComment
);
apiRouter.post(
  "/videos/:videoId([0-9a-f]{24})/modifyComment/:commentId([0-9a-f]{24})",
  protectorMiddleware,
  modifyComment
);
apiRouter.delete(
  "/videos/:videoId([0-9a-f]{24})/comments/:commentId([0-9a-f]{24})",
  protectorMiddleware,
  deleteComment
);
apiRouter.post(
  "/users/:followId([0-9a-f]{24})/:followingId([0-9a-f]{24})/following",
  protectorMiddleware,
  following
);
apiRouter.delete(
  "/users/:followId([0-9a-f]{24})/:followingId([0-9a-f]{24})/deleteFollowing",
  protectorMiddleware,
  deleteFollowing
);

export default apiRouter;
