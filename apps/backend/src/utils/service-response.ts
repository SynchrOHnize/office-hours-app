import type { Response } from "express";
import { StatusCodes } from "http-status-codes";

export default class ServiceResponse<T = null> {
  readonly message: string;
  readonly data: T;
  readonly status: number;

  private constructor(message: string, data: T, status: number) {
    this.message = message;
    this.data = data;
    this.status = status;
  }

  static success<T>(message: string, data: T, status: number = StatusCodes.OK) {
    return new ServiceResponse(message, data, status);
  }

  static failure<T>(message: string, data: T, status: number = StatusCodes.BAD_REQUEST) {
    return new ServiceResponse(message, data, status);
  }

  static ok<T>(message: string, data: T) {
    return new ServiceResponse(message, data, StatusCodes.OK);
  }

  static badRequest(message: string) {
    return new ServiceResponse(message, null, StatusCodes.BAD_REQUEST);
  }

  static notFound(message: string) {
    return new ServiceResponse(message, null, StatusCodes.NOT_FOUND);
  }

  static internal(message: string) {
    return new ServiceResponse(message, null, StatusCodes.INTERNAL_SERVER_ERROR);
  }

  emit(res: Response) {
    res.status(this.status).send(this);
  }
}
