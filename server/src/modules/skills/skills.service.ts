import Skill, { ISkill } from "./skill.model"
import Log from "../logs/log.model";

interface CreateSkillInput {
  name: string
  userId: string
}

export const createSkill = async ({ name, userId }: CreateSkillInput) => {
  const existingSkill = await Skill.findOne({ name, user: userId })
  if (existingSkill) throw new Error("Skill already exists")

  const skill = await Skill.create({ name, user: userId })

  return transformSkill(skill)
}

export const getUserSkills = async (userId: string) => {
  const skills = await Skill.find({ user: userId });
  return skills.map(transformSkill)
}

export const markSkillPracticed = async (skillId: string, userId: string) => {
  const skill = await Skill.findOne({ _id: skillId, user: userId });
  if (!skill) throw new Error("Skill not found");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // prevent duplicate log same day
  const existingLog = await Log.findOne({
    user: userId,
    skill: skillId,
    practicedAt: { $gte: today },
  });

  if (existingLog) {
    return transformSkill(skill); // already practiced today
  }

  // update streak
  if (skill.lastpracticed) {
    const last = new Date(skill.lastpracticed);
    last.setHours(0, 0, 0, 0);

    const diff = (today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      skill.streak += 1;
    } else {
      // not consecutive, start a new streak at 1
      skill.streak = 1;
    }
  } else {
    // first practice -> streak is 1
    skill.streak = 1;
  }

  skill.lastpracticed = new Date();
  await skill.save();
  return transformSkill(skill);
};
export const toggleSkillActive = async (skillId: string) => {
  const skill = await Skill.findById(skillId)
  if (!skill) throw new Error("Skill not found")

  skill.isActive = !skill.isActive
  await skill.save()

  return transformSkill(skill)
}

// Helper to transform Mongo document to frontend-friendly object
const transformSkill = (skill: ISkill) => {
  let currentStreak = skill.streak;
  if (skill.lastpracticed) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const last = new Date(skill.lastpracticed);
    last.setHours(0, 0, 0, 0);
    const diff = (today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
    if (diff > 1) {
      currentStreak = 0;
    }
  }

  return {
    id: skill._id.toString(),
    name: skill.name,
    isActive: skill.isActive,
    currentStreak: currentStreak,
    longestStreak: skill.streak, // optionally track max in DB
    lastPracticed: skill.lastpracticed ? skill.lastpracticed.toISOString() : null,
    totalPractices: skill.streak, // for now same as streak
    createdAt: skill.createdAt,
    updatedAt: skill.updatedAt,
  };
};