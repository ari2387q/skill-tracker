import  Skill  from "../skills/skill.model";
import  Log  from "../logs/log.model";

export const getDashboardData = async (userId: string)=>{
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

    let activeStreak = 0;
    
    const uniqueLogDates = Array.from(new Set(
        logs.map(log => {
            const d = new Date(log.practicedAt);
            d.setHours(0, 0, 0, 0);
            return d.getTime();
        })
    )).sort((a, b) => b - a); // newest dates first

    if (uniqueLogDates.length > 0) {
        const mostRecent = uniqueLogDates[0];
        const diffToday = (today.getTime() - mostRecent) / (1000 * 60 * 60 * 24);

        if (diffToday <= 1) {
            activeStreak = 1;
            let lastTime = mostRecent;

            for (let i = 1; i < uniqueLogDates.length; i++) {
                const currentTime = uniqueLogDates[i];
                const diff = (lastTime - currentTime) / (1000 * 60 * 60 * 24);
                if (diff === 1) {
                    activeStreak++;
                    lastTime = currentTime;
                } else {
                    break;
                }
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