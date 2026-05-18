import { Router } from "express";
import * as logscontroller from "./logs.controller";
import {protect} from "../../middlewares/auth.middleware";

const router = Router();
router.use(protect);

router.post("/",logscontroller.createLog);
router.get("/", logscontroller.getAllLogs);
router.get("/grouped", logscontroller.getGroupedLogs);
router.get("/skill/:skillId", logscontroller.getSkillLogs);
router.patch("/:logId",logscontroller.updateLog);
router.delete("/:logId",logscontroller.deleteLog);

export default router;
