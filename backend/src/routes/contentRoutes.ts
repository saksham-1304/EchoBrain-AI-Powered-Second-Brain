import { Router } from "express";
import { ContentController } from "../controllers/contentController";
import { userMiddleware } from "../middlewares/middleware";

const contentRouter = Router();

// Protected routes (require authentication)
contentRouter.post("/", userMiddleware, ContentController.createContent);
contentRouter.get("/home", userMiddleware, ContentController.getUserContent);
contentRouter.get("/stats", userMiddleware, ContentController.getContentStats);
contentRouter.get("/:type", userMiddleware, ContentController.getContentByType);
contentRouter.delete("/", userMiddleware, ContentController.deleteContent);
contentRouter.post("/share", userMiddleware, ContentController.shareContent);
contentRouter.post("/search", userMiddleware, ContentController.searchContent);

// Public routes
contentRouter.get("/shared/:shareLink", ContentController.getSharedContent);

export { contentRouter };
