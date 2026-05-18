import { Router } from "express";
import { aiChat,aiHistory } from "./ai.controller";
import { protect } from "../../middlewares/auth.middleware";

const router = Router();
router.post("/",protect, aiChat);
router.get("/history", protect, aiHistory);
export default router;
