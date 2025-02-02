import * as userService from "@/api/user/user-service";
import { clerkClient } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";

export default (authorizedRoles = ["professor", "admin"]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.auth.userId;
      const clerkUser = await clerkClient.users.getUser(userId);
      if (!clerkUser) {
        return res.status(404).json({ error: "No Clerk User found" });
      }
      const email = clerkUser.primaryEmailAddress?.emailAddress || "";
      if (!email) {
        return res.status(400).json({ error: "No email found for user" });
      }

      const user = await userService.getById(userId);

      if (email.endsWith("@ufl.edu")) {
        next();
      } else if (user && authorizedRoles.includes(user.data?.role || "")) {
        next();
      } else {
        return res.status(401).json({ error: "Unauthorized, must be UF email" });
      }
    } catch (error) {
      console.error("Auth middleware error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
