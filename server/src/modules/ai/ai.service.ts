import { AIChat } from "./ai.model";
import PracticeLog from "../logs/log.model";
import Skill from "../skills/skill.model";

type Role = "system" | "user" | "assistant";

/* ======================================================
   BUILD SYSTEM CONTEXT (Optimized & Lightweight)
====================================================== */

const buildSystemContext = async (userId: string) => {
  
const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const logs = await PracticeLog.find({
    user: userId,
    practicedAt: { $gte: sevenDaysAgo },
  })
    .populate("skill", "name")
    .lean(); // Faster query

  if (!logs.length) {
    return `
You are SkillTracker Pro AI — a performance analytics engine.

DATA (Last 7 Days):
No practice activity recorded.

Respond analytically in structured markdown with:
- Activity Overview
- Risk Assessment
- 24-Hour Recovery Plan
- Performance Projection
`;
  }

  const skillCount: Record<string, number> = {};

  for (const log of logs) {
    const skillName = (log.skill as any)?.name;
    if (!skillName) continue;

    skillCount[skillName] = (skillCount[skillName] || 0) + 1;
  }

  const sorted = Object.entries(skillCount).sort((a, b) => b[1] - a[1]);

  const mostPracticed = sorted[0]?.[0] || "N/A";
  const leastPracticed = sorted[sorted.length - 1]?.[0] || "N/A";

  return `
You are SkillTracker Pro AI — a performance analytics engine.

DATA (Last 7 Days):
Active Skills: ${sorted.map((s) => s[0]).join(", ")}
Most Practiced: ${mostPracticed}
Least Practiced: ${leastPracticed}
Total Sessions: ${logs.length}

Respond analytically in structured markdown with:
- Key Metrics
- Strongest Area
- Optimization Opportunity
- 48-Hour Plan
- Performance Projection
`;
};

/* ======================================================
   CHAT WITH AI (Optimized)
====================================================== */

export const chatWithAI = async (
  userId: string,
  prompt: string,
  callAI: (messages: { role: Role; content: string }[]) => Promise<string>
) => {
  let chat = await AIChat.findOne({ user: userId });

  if (!chat) {
    chat = await AIChat.create({
      user: userId,
      messages: [],
    });
  }

  // Save user message
  chat.messages.push({
    role: "user",
    content: prompt,
  });

  // Limit stored DB messages (prevent infinite growth)
  const MAX_DB_MESSAGES = 50;
  if (chat.messages.length > MAX_DB_MESSAGES) {
  const excess = chat.messages.length - MAX_DB_MESSAGES;
  chat.messages.splice(0, excess);
}

  // Build system context
  const systemContext = await buildSystemContext(userId);

  // Limit messages sent to AI
  const MAX_HISTORY = 16; // Last 16 messages only
  const trimmedMessages = chat.messages.slice(-MAX_HISTORY);

  const messagesForAI: { role: Role; content: string }[] = [
    { role: "system", content: systemContext },
    ...trimmedMessages.map((m) => ({
      role: m.role as Role,
      content: m.content,
    })),
  ];

  // Call AI
  const aiReply = await callAI(messagesForAI);

  // Save assistant reply
  chat.messages.push({
    role: "assistant",
    content: aiReply,
  });

  await chat.save();

  return aiReply;
};

/* ======================================================
   GET CHAT HISTORY
====================================================== */

export const getChatHistory = async (userId: string) => {
  const chat = await AIChat.findOne({ user: userId }).lean();
  return chat?.messages || [];
};

/* ======================================================
   CALL AI (Performance Optimized)
====================================================== */

export const callAI = async (
  messages: { role: string; content: string }[]
): Promise<string> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000); // 15 sec timeout

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "X-Title": "skill-tracker",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages,
        max_tokens: 500,       // Prevent long slow responses
        temperature: 0.4,      // More focused, faster output
        top_p: 0.9,
      }),
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenRouter API error: ${errText}`);
    }

    const data = await res.json();

    return data.choices?.[0]?.message?.content || "No response generated.";
  } catch (error: any) {
    if (error.name === "AbortError") {
      return "AI request timed out. Please try again.";
    }
    throw error;
  }
};
