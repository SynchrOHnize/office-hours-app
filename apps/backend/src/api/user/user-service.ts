import * as userDatabase from "@/database/users";
import type { User } from "@/schemas/user";
import { logger } from "@/server";
import ServiceResponse from "@/utils/service-response";
import { clerkClient } from "@clerk/express";
import { StatusCodes } from "http-status-codes";

// Retrieves all users from the database
export async function getAll(): Promise<ServiceResponse<User[] | null>> {
  try {
    const users = await userDatabase.getAllUsers();
    if (!users || users.length === 0) {
      return ServiceResponse.failure("No Users found", null, StatusCodes.NOT_FOUND);
    }
    return ServiceResponse.success<User[]>("Users found", users);
  } catch (ex) {
    const errorMessage = `Error finding all users: $${(ex as Error).message}`;
    logger.error(errorMessage);
    return ServiceResponse.failure(
      "An error occurred while retrieving users.",
      null,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
}

export async function getById(id: string): Promise<ServiceResponse<User | null>> {
  try {
    const user = await userDatabase.getById(id);
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

export async function storeUser(id: string, role: string): Promise<ServiceResponse<User | null>> {
  const clerkUser = await clerkClient.users.getUser(id);
  if (!clerkUser) {
    return ServiceResponse.failure("No Clerk User found", null, StatusCodes.NOT_FOUND);
  }

  let firstName = clerkUser.firstName?.replace(/,/g, "") || "";
  let lastName = clerkUser.lastName || "";
  console.log(firstName, lastName);
  console.log(clerkUser.firstName, clerkUser.lastName);
  if (firstName !== clerkUser.firstName || lastName.includes(".")) {
    console.log("Swapping first and last name because it's messed up in Microsoft.");
    [firstName, lastName] = [lastName, firstName]; // Swap first and last name when Microsoft stupidly reverses them
    console.log(firstName, lastName);
  }

  await clerkClient.users.updateUser(id, { firstName, lastName });

  const email = clerkUser.primaryEmailAddress?.emailAddress || "";
  const imageUrl = clerkUser.imageUrl;
  const user = await userDatabase.storeUser(id, imageUrl, firstName, lastName, email, role);
  if (!user) {
    return ServiceResponse.failure("Error storing user", null, StatusCodes.NOT_FOUND);
  }
  return ServiceResponse.success<User>("User stored", user);
}
