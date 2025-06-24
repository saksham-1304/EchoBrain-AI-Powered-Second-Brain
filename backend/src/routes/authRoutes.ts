import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { userMiddleware } from "../middlewares/middleware";

const authRouter = Router();

// Public routes
authRouter.post("/signup", AuthController.signup);
authRouter.post("/signin", AuthController.signin);
authRouter.post("/refresh", AuthController.refreshToken);

// Protected routes
authRouter.get("/profile", userMiddleware, AuthController.getProfile);

export { authRouter };
