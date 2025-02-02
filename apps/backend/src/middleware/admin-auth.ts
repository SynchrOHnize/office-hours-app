import * as userService from "@/api/user/user-service";
import type { NextFunction, Request, Response } from "express";

export default (authorizedRoles = ["professor", "admin"]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.auth.userId;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const user = await userService.getById(userId);
      if (!user.data?.role || !authorizedRoles.includes(user.data.role)) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
