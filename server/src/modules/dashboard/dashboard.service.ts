import  Skill  from "../skills/skill.model";
import  Log  from "../logs/log.model";

export const getDashboardData = async (userId:String)=>{
    //fetching data from skill model
    const skills = await Skill.find({user: userId})
    const logs = await Log.find({user:userId}).sort({practicedAt:1})

    const totalSkills = skills.length

    const today = new Date()
    today.setHours(0,0,0,0)

    const practicedToday = logs.filter(log =>{
        const logDate = new Date(log.practicedAt)
        logDate.setHours(0,0,0,0)
        return logDate.getTime() === today.getTime()

    }).length

    const uniqueDays = new Set(
        logs.map(log => new Date(log.practicedAt).toDateString())

    )
    const daysTracked = uniqueDays.size

    let activeStreak =0
    let lastDate: Date| null =null
     for (let i = logs.length - 1; i >= 0; i--) {
    const current = new Date(logs[i].practicedAt)
    current.setHours(0, 0, 0, 0)

    if (!lastDate) {
      activeStreak = 1
      lastDate = current
    } else {
      const diff =
        (lastDate.getTime() - current.getTime()) / (1000 * 60 * 60 * 24)

      if (diff === 1) {
        activeStreak++
        lastDate = current
      } else {
        break
      }
    }
     }
     let motivation = "Start practicing today 🚀"
  if (activeStreak >= 5) motivation = "🔥 Amazing streak! Keep pushing!"
  else if (activeStreak >= 3) motivation = "You're building momentum 💪"
  else if (activeStreak >= 1) motivation = "Good start! Stay consistent 🌱"

  
  return {
    totalSkills,
    practicedToday,
    daysTracked,
    activeStreak,
    motivation,
  }
     }