import { Router } from "express";
import { authRouter } from "../authRoutes";
import { contentRouter } from "../contentRoutes";

const router = Router();

// Health check route
router.get("/", (req, res) => {
    res.json({
        success: true,
        message: "SecondBrain API is running",
        version: "1.0.0"
    });
});

// API v1 routes
router.use("/auth", authRouter);
router.use("/content", contentRouter);

export { router };
