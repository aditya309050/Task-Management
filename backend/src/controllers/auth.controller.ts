import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/db";
import { hashPassword, comparePassword, generateToken } from "../utils/auth";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-for-development";

export async function signup(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: "A user with this email already exists" });
      return;
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const token = generateToken(user.id);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error during signup" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const token = generateToken(user.id);

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error during login" });
  }
}

export async function getMe(req: Request, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    res.status(200).json({
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        avatarUrl: req.user.avatarUrl,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ message: "Internal server error retrieving user profile" });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return 200 to prevent user enumeration attacks in production
      res.status(200).json({ message: "If the email is registered, a password reset link has been generated" });
      return;
    }

    // Generate password reset token containing userId (expires in 15 minutes)
    const resetToken = jwt.sign({ userId: user.id, type: "password-reset" }, JWT_SECRET, { expiresIn: "15m" });
    
    // Simulate sending email by printing details to the node console
    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
    console.log("\n==================================================");
    console.log(`PASSWORD RESET REQUEST FOR: ${email}`);
    console.log(`RESET LINK: ${resetLink}`);
    console.log("==================================================\n");

    res.status(200).json({
      message: "If the email is registered, a password reset link has been generated",
      // Return the token in development mode to make manual/automated testing easy
      token: process.env.NODE_ENV === "development" ? resetToken : undefined,
    });
  } catch (error) {
    console.error("ForgotPassword error:", error);
    res.status(500).json({ message: "Internal server error during forgot password" });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { token, password } = req.body;

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      res.status(400).json({ message: "Password reset token is invalid or has expired" });
      return;
    }

    if (decoded.type !== "password-reset") {
      res.status(400).json({ message: "Invalid reset token type" });
      return;
    }

    const hashedPassword = await hashPassword(password);
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: "Password has been successfully updated" });
  } catch (error) {
    console.error("ResetPassword error:", error);
    res.status(500).json({ message: "Internal server error during password reset" });
  }
}
