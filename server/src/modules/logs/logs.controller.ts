import { Request, Response } from "express";
import * as logsService from "./logs.service";

export const createLog = async (req: Request, res: Response) => {
  const { skillId, notes, duration, practicedAt } = req.body;
  const userId = (req as any).user._id;
  const log = await logsService.createLog({
    userId,
    skillId,
    notes,
    duration,
    practicedAt,
  });

  res.status(201).json({
    success: true,
    log,
  });
};

export const getSkillLogs = async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const { skillId } = req.params;

  const logs = await logsService.getlogsforskill(userId, skillId);

  res.status(200).json({
    success: true,
    logs,
  });
};
export const getAllLogs = async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const logs = await logsService.find({ user: userId })
  

  res.status(200).json({
    success: true,
    logs,
  });
};

export const updateLog = async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const { logId } = req.params;
  const { notes, duration, practicedAt } = req.body;

  const log = await logsService.updateLog({
    logId,
    userId,
    notes,
    duration,
    practicedAt,
  });

  res.status(200).json({
    success: true,
    log,
  });
};

export const deleteLog = async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const { logId } = req.params;

  await logsService.deleteLog({
    logId,
    userId,
  });
  res.status(200).json({
    success:true,
    message:"log deleted",
  });
};

export const getGroupedLogs = async (req: Request, res: Response) => {
  const userId = (req as any).user._id

  const logs = await logsService.getAllLogsPopulated(userId)

  const grouped = logs.reduce((acc: any, log: any) => {
    const date = new Date(log.practicedAt).toDateString()
    const skillName = log.skill?.name ?? "Unknown Skill"

    acc[date] ??= {}
    acc[date][skillName] ??= []

    acc[date][skillName].push({
      id: log._id,
      notes: log.notes,
      duration: log.duration,
      practicedAt: log.practicedAt,
    })

    return acc
  }, {} as Record<string, Record<string, any[]>>)

  res.status(200).json({
    success: true,
    grouped,
  })
}