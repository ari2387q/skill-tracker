import { Router } from "express"
import * as skillsController from "./skills.controller"
import {protect} from "../../middlewares/auth.middleware"

const router = Router()

// Apply auth once for all routes
router.use(protect)

router.post("/", skillsController.createSkill)
router.get("/", skillsController.getSkills)
router.patch("/:id/toggle", skillsController.toggleSkill)
router.post("/:id/practice", skillsController.markPracticed);

export default router;
