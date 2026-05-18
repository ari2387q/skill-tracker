import { Request, Response } from "express";
import { chatWithAI, getChatHistory } from "./ai.service";
import { callAI } from "./ai.service";

export const aiChat = async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: "Prompt required" });
  }

  const response = await chatWithAI(userId, prompt, callAI);

  res.json({ response });
};

export const aiHistory = async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const messages = await getChatHistory(userId);
  res.json({ messages });
};
