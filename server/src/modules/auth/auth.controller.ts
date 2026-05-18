import { Request, Response } from "express";
import * as authService from "./auth.service";
import jwt from "jsonwebtoken";

const generateToken = (userId: string) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );
};

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;


  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await authService.registerUser({ email, password });

  const token = generateToken(user.id.toString());

  res.status(201).json({
    success: true,
    token,
    user,
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await authService.loginUser({ email, password });

  const token = generateToken(user.id.toString());

  res.status(200).json({
    success: true,
    token,
    user,
  });
};

export const getMe = async (req: Request, res: Response) => {
  res.json({ user: req.user });
};

export const getProfile = async (req: Request, res: Response) => {
  res.json({ user: (req as any).user });
};
