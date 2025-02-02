import { StatusCodes } from "http-status-codes";
import request from "supertest";

import { app } from "@/server";
import type ServiceResponse from "@/utils/service-response";

describe("Canvas API endpoints", () => {
  it("GET / - success", async () => {
    const response = await request(app).get("/canvas");
    const result: ServiceResponse = response.body;

    expect(response.statusCode).toEqual(StatusCodes.OK);
    expect(result.success).toBeTruthy();
    expect(result.data).toBeNull();
    expect(result.message).toEqual("Success!");
  });
});
