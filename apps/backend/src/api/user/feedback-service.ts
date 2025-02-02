import { StatusCodes } from "http-status-codes";

import * as feedbackDatabase from "@/database/feedback";
import type { Feedback } from "@/schemas/feedback";
import { logger } from "@/server";
import ServiceResponse from "@/utils/service-response";

export async function getAll(): Promise<ServiceResponse<Feedback[] | null>> {
  try {
    const feedbacks = await feedbackDatabase.getAllFeedback();
    if (!feedbacks || feedbacks.length === 0) {
      return ServiceResponse.failure("No Feedback found", null, StatusCodes.NOT_FOUND);
    }
    return ServiceResponse.success<Feedback[]>("Feedback found", feedbacks);
  } catch (ex) {
    const errorMessage = `Error finding all feedback: ${(ex as Error).message}`;
    logger.error(errorMessage);
    return ServiceResponse.failure(
      "An error occurred while retrieving feedback.",
      null,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
}

export async function storeFeedback(user_id: string, rating: number, content: string): Promise<ServiceResponse<null>> {
  try {
    await feedbackDatabase.createFeedback(user_id, rating, content);
    logger.info("Feedback successfully stored.");
    return ServiceResponse.success("Feedback successfully stored", null);
  } catch (ex) {
    const errorMessage = `Error storing feedback: ${(ex as Error).message}`;
    logger.error(errorMessage);
    return ServiceResponse.failure(
      "An error occurred while storing feedback.",
      null,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
}
