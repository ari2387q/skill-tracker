import Log from "./log.model";
import Skill from '../skills/skill.model';

interface CreateLogInput{
    userId: string;
    skillId: string;
    notes?: string;
    duration?: number;
    practicedAt?: string;
}
interface UpdateLogInput {
  logId: string;
  userId: string;
  notes?: string;
  duration?: number;
  practicedAt?: Date | string;
}

interface DeleteLogInput {
  logId: string;
  userId: string;
}

export const createLog = async ({
    userId,
    skillId,
    notes,
    duration,
}: CreateLogInput) => {
    const skill= await Skill.findOne({_id: skillId, user: userId});
    if(!skill){
        throw new Error("Skill not found");
    }
    const log = await Log.create({
        user: userId,
        skill: skillId,
        notes,
        duration,
        practicedAt: new Date(),
    });
    return log;
};

export const getlogsforskill =async(
    userId: string,
    skillId: string
) =>{
    return Log.find({user: userId, skill: skillId}).sort({
        practicedAt: -1,
    });
};

export const find = async ({user}: {user:string})=>{
    return Log.find({user}).sort({practicedAt:-1});
}

export const updateLog = async ({
  logId,
  userId,
  notes,
  duration,
  practicedAt,
}: UpdateLogInput) => {
  return Log.findOneAndUpdate(
    { _id: logId, user: userId },
    { notes, duration, practicedAt },
    { new: true }
  );
};
export const deleteLog = async ({ logId, userId }: DeleteLogInput) => {
  return Log.findOneAndDelete({
    _id: logId,
    user: userId,
  });
};

export const getAllLogsPopulated = async (userId: string) => {
  return Log.find({ user: userId })
    .populate("skill", "name")
    .sort({ practicedAt: -1 })
}
