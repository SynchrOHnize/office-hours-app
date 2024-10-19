import { StatusCodes } from "http-status-codes";
import request from "supertest";

import type { ServiceResponse } from "@/common/schemas/serviceResponse";
import { app } from "@/server";

describe("Web Scraping API endpoints", () => {
  it("GET / - success", async () => {
    const response = await request(app).get("/health-check");
    const result: ServiceResponse = response.body;

    expect(response.statusCode).toEqual(StatusCodes.OK);
    expect(result.success).toBeTruthy();
    expect(result.responseObject).toBeNull();
    expect(result.message).toEqual("Service is healthy");
  });
});
