import User from "./user.model";
import { sendVerificationEmail } from "./email.service";
import crypto from "crypto"

export class AuthError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

interface RegisterInput {
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}


//Register user (production)

export const registerUser = async ({ email, password }: RegisterInput) => {
  // Normalize email
  const normalizedEmail = email.toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser && existingUser.isVerified) {
    throw new AuthError("User already exists", 409);
  }
  let user;
  if(existingUser && !existingUser.isVerified){
    user=existingUser;
    user.password=password;}
    else{
      user=new User({email:normalizedEmail,password});
    }
  
  const rawToken = user.generateVerificationToken();
  await user.save();
  await sendVerificationEmail(user.email, rawToken);
  return {
    id: user._id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
};


//Login user (production)

export const loginUser = async ({ email, password }: LoginInput) => {
  const normalizedEmail = email.toLowerCase();

  const user = await User.findOne({ email: normalizedEmail }).select("+password");
  if (!user) {
    throw new AuthError("Invalid email or password", 401);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AuthError("Invalid email or password", 401);
  }
  if (!user.isVerified) {
    throw new AuthError("Please verify your email before logging in", 403);
  }
  return {
    id: user._id,
    email: user.email,
    role: user.role,
  };
};

export const verifyEmail = async (token: string) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({ verificationTokenHash: hashedToken });

  if (!user) {
    throw new AuthError("Invalid or expired verification token", 400);
  }

  if (!user.verificationTokenExpiry || user.verificationTokenExpiry < new Date()) {
    throw new AuthError("Verification token has expired", 400);
  }

  user.isVerified = true;
  user.verificationTokenHash = undefined;
  user.verificationTokenExpiry = undefined;
  await user.save();

  return { email: user.email };
};