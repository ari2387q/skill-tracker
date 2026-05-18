import { Request, Response } from "express"
import * as skillsService from "./skills.service"

export const createSkill = async (req: Request, res: Response) => {
  const { name } = req.body
  const userId = (req as any).user._id

  const skill = await skillsService.createSkill({ name, userId })

  res.status(201).json({
    success: true,
    skill,
  })
}

export const getSkills = async (req: Request, res: Response) => {
  const userId = (req as any).user._id
  const skills = await skillsService.getUserSkills(userId)

  res.status(200).json({
    success: true,
    skills,
  })
}
export const markPracticed = async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const { id } = req.params;

  const skill = await skillsService.markSkillPracticed(id, userId);

  res.json(skill);
};

export const toggleSkill = async (req: Request, res: Response) => {
  try {
    const skill = await skillsService.toggleSkillActive(req.params.id)
    res.status(200).json(skill)
  } catch (err) {
    res.status(400).json({ message: (err as Error).message })
  }
}
