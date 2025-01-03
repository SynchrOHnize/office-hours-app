// aiService.ts
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ServiceResponse } from "@/common/schemas/serviceResponse";
import { StatusCodes } from "http-status-codes";
import { logger } from "@/server";

export class AIService {
  private llm: ChatOpenAI;

  constructor() {
    this.llm = new ChatOpenAI({ modelName: "gpt-4o" });
  }

  async parseOfficeHours(courseId: number, rawData: string) {
    const template = `Parse the user's given office hours data into a list of objects with this schema:
  {{
    "host": string,
    "day": "monday" | "tuesday" | "wednesday" | "thursday" | "friday",
    "start_time": "HH:mm",
    "end_time": "HH:mm",
    "mode": "in-person" | "remote" | "hybrid",
    "location": string,
    "link": string
  }}
  Return only valid JSON array.`

    try {
      const prompt = ChatPromptTemplate.fromMessages([
        ["system", template],
        ["user", "Course ID: {courseId} Raw Data: {rawData}"],
      ]);
      const outputParser = new StringOutputParser();
      const chain = prompt.pipe(this.llm).pipe(outputParser);
      let response = await chain.invoke({ courseId, rawData });
      response = response.replace(/```json\n?|\n?```/g, '');
      const parsed = JSON.parse(response);

      for (const officeHour of parsed) {
        officeHour.course_id = courseId;
      }

      return ServiceResponse.success("Successfully parsed office hours", parsed);
    } catch (ex) {
      logger.error(`Error parsing office hours: ${(ex as Error).message}`);
      return ServiceResponse.failure("Failed to parse office hours", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}
