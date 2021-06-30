import express from "express";
import {
  createComment,
  deleteComment,
  modifyComment,
  registerView,
} from "../controllers/videoController";

const apiRouter = express.Router();

apiRouter.post("/videos/:id([0-9a-f]{24})/view", registerView);
apiRouter.post("/videos/:id([0-9a-f]{24})/comment", createComment);
apiRouter.post(
  "/videos/:videoId([0-9a-f]{24})/modifyComment/:commentId([0-9a-f]{24})",
  modifyComment
);
apiRouter.delete(
  "/:videoId([0-9a-f]{24})/comments/:commentId([0-9a-f]{24})",
  deleteComment
);

export default apiRouter;
