import { StatusCodes } from "http-status-codes";
import type { User } from "@/common/schemas/userSchema";
import { clerkClient } from "@clerk/express";
import { UserRepository } from "@/database/userRepository";
import { ServiceResponse } from "@/common/schemas/serviceResponse";
import { logger } from "@/server";

export class UserService {
  private userRepository: UserRepository;

  constructor(repository: UserRepository) {
    this.userRepository = repository;
  }

  // Retrieves all users from the database
  async getAll(): Promise<ServiceResponse<User[] | null>> {
    try {
      const users = await this.userRepository.getAllUsers();
      if (!users || users.length === 0) {
        return ServiceResponse.failure("No Users found", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success<User[]>("Users found", users);
    } catch (ex) {
      const errorMessage = `Error finding all users: $${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure("An error occurred while retrieving users.", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getById(id: string): Promise<ServiceResponse<User | null>> {
    try {
      const user = await this.userRepository.getById(id);
      if (!user) {
        return ServiceResponse.failure("No User found", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success<User>("User found", user);
    } catch (ex) {
      const errorMessage = `Error finding user: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure("An error occurred while retrieving user.", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async storeUser(id: string, role: string): Promise<ServiceResponse<User | null>> {
    const clerkUser = await clerkClient.users.getUser(id);
    if (!clerkUser) {
      return ServiceResponse.failure("No Clerk User found", null, StatusCodes.NOT_FOUND);
    }

    const firstName = clerkUser.firstName?.replace(/,/g, "") || "";
    await clerkClient.users.updateUser(id, { firstName });

    const email = clerkUser.primaryEmailAddress?.emailAddress || "";
    const imageUrl = clerkUser.imageUrl;
    const lastName = clerkUser.lastName || "";
    const user = await this.userRepository.storeUser(id, imageUrl, firstName, lastName, email, role);
    if (!user) {
      return ServiceResponse.failure("Error storing user", null, StatusCodes.NOT_FOUND);
    }
    return ServiceResponse.success<User>("User stored", user);
  }
}
