import User from "./user.model";

/**
 * Custom application error
 * (later you can move this to a common errors folder)
 */
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

/**
 * Register user (production)
 */
export const registerUser = async ({ email, password }: RegisterInput) => {
  // Normalize email
  const normalizedEmail = email.toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new AuthError("User already exists", 409);
  }

  const user = await User.create({
    email: normalizedEmail,
    password,
  });

  return {
    id: user._id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
};

/**
 * Login user (production)
 */
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

  return {
    id: user._id,
    email: user.email,
    role: user.role,
  };
};
