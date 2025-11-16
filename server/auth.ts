import bcrypt from "bcrypt";
import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session && (req.session as any).userId) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
}

// Middleware to require user to be both authenticated AND approved
export async function requireApprovedUser(req: Request, res: Response, next: NextFunction) {
  if (!req.session || !(req.session as any).userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const userId = (req.session as any).userId;
    const user = await storage.getUser(userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.status === "rejected") {
      return res.status(403).json({ 
        message: "Your account application has been rejected. Please contact support." 
      });
    }

    if (user.status === "pending") {
      return res.status(403).json({ 
        message: "Your account is awaiting approval. You will be notified when approved." 
      });
    }

    // User is approved, proceed
    next();
  } catch (error) {
    console.error("Error in requireApprovedUser middleware:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
