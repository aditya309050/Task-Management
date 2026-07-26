import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth";
import { prisma } from "../utils/db";

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Authentication token missing or invalid" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      res.status(401).json({ message: "Authentication token is expired or invalid" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      res.status(401).json({ message: "Authenticated user no longer exists" });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Internal server error during authentication" });
  }
}
