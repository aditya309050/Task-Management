import { Request, Response } from "express";
import { prisma } from "../utils/db";
import { hashPassword } from "../utils/auth";

export async function updateProfile(req: Request, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { name, email, password } = req.body;

    const updateData: any = {};

    if (name) {
      updateData.name = name;
    }

    if (email && email !== req.user.email) {
      // Check if new email is already taken
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        res.status(400).json({ message: "This email is already in use by another account" });
        return;
      }
      updateData.email = email;
    }

    if (password) {
      updateData.password = await hashPassword(password);
    }

    // If nothing is to update, just return current user
    if (Object.keys(updateData).length === 0) {
      res.status(200).json({
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          avatarUrl: req.user.avatarUrl,
        },
      });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
    });

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatarUrl: updatedUser.avatarUrl,
      },
    });
  } catch (error) {
    console.error("UpdateProfile error:", error);
    res.status(500).json({ message: "Internal server error updating profile settings" });
  }
}

export async function uploadAvatar(req: Request, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: "No image file provided" });
      return;
    }

    // Save portable relative path
    const avatarUrl = `/uploads/${req.file.filename}`;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatarUrl },
    });

    res.status(200).json({
      message: "Avatar uploaded successfully",
      avatarUrl,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatarUrl: updatedUser.avatarUrl,
      },
    });
  } catch (error) {
    console.error("UploadAvatar error:", error);
    res.status(500).json({ message: "Internal server error saving profile avatar" });
  }
}
