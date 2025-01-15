// aiService.ts
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ServiceResponse } from "@/common/schemas/serviceResponse";
import { StatusCodes } from "http-status-codes";
import { logger } from "@/server";

export class AIService {
  private llm: ChatOpenAI;
  private cheapLlm: ChatOpenAI;
  constructor() {
    this.llm = new ChatOpenAI({ modelName: "gpt-4o" });
    this.cheapLlm = new ChatOpenAI({ modelName: "gpt-4o-mini" });
  }

  formatData(officeHour: Record<string, any>) {
    const isValidUrl = (url: string) => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    };

    officeHour.day = officeHour.day.charAt(0).toUpperCase() + officeHour.day.slice(1);
    officeHour.mode = officeHour.mode.charAt(0).toUpperCase() + officeHour.mode.slice(1);
    officeHour.start_time = officeHour.start_time.toUpperCase();
    officeHour.end_time = officeHour.end_time.toUpperCase();

    // Validate 'host'
    if (!officeHour.host || typeof officeHour.host !== "string" || officeHour.host.trim() === "") {
      officeHour.host = "INVALID";
    }

    // Validate 'day'
    if (!["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].includes(officeHour.day)) {
      officeHour.day = "INVALID";
    }

    // Validate 'start_time' and 'end_time' as HH:mm format
    const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/;
    if (!timeRegex.test(officeHour.start_time)) {
      officeHour.start_time = "INVALID";
    }
    if (!timeRegex.test(officeHour.end_time)) {
      officeHour.end_time = "INVALID";
    }

    // Validate 'mode'
    if (!["In-person", "Remote", "Hybrid"].includes(officeHour.mode)) {
      officeHour.mode = "INVALID";
    }

    // Validate 'location' and 'link' based on 'mode'
    if (officeHour.mode === "Remote") {
      // Remote: Requires valid link and no location
      if (!officeHour.link || !isValidUrl(officeHour.link)) {
        officeHour.link = "INVALID";
      }
      officeHour.location = "";
    } else if (officeHour.mode === "In-person") {
      // In-person: Requires location and no link
      if (!officeHour.location || !/^[A-Z]+[0-9]+$/.test(officeHour.location)) {
        officeHour.location = "INVALID";
      }
      officeHour.link = "";
    } else if (officeHour.mode === "Hybrid") {
      // Hybrid: Requires both valid link and location
      if (!officeHour.link || !isValidUrl(officeHour.link)) {
        officeHour.link = "INVALID";
      }
      if (!officeHour.location || !/^[A-Z]+[0-9]+$/.test(officeHour.location)) {
        officeHour.location = "INVALID";
      }
    }

    return officeHour;
  }

  async parseOfficeHoursJson(courseId: number, rawData: string): Promise<ServiceResponse<Record<string, any>[] | null>> {
    const template = `Parse the given data into a list of objects with this schema:
  {{
    "host": string,
    "day": "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" (allow any casing),
    "start_time": "HH:mm PM/AM" (convert time to this format),
    "end_time": "HH:mm PM/AM" (convert time to this format),
    "mode": "in-person" | "remote" | "hybrid" (allow any casing or deduce),
    "location": string,
    "link": string,
  }}
  Link is only empty if mode is "in-person". Location is only empty if mode is "remote". Hybrid requires both.
  Location must be uppercase letters followed by numbers (e.g., MALA5200). Set as "INVALID" if not explicitly given in this format.
  Return only valid JSON array. Allow missing or incorrect data, simply set the value as "INVALID". Include as much information as possible. You should almost never return empty unless there is truly no information.`;

    try {
      const prompt = ChatPromptTemplate.fromMessages([
        ["system", template],
        ["user", "Course ID: {courseId} Raw Data: {rawData}"],
      ]);
      const outputParser = new StringOutputParser();
      const chain = prompt.pipe(this.llm).pipe(outputParser);
      let response = await chain.invoke({ courseId, rawData });
      response = response.replace(/```json\n?|\n?```/g, "");
      const parsed = JSON.parse(response);

      for (let officeHour of parsed) {
        officeHour.course_id = courseId;
        console.log(officeHour);
        officeHour = this.formatData(officeHour);
      }

      return ServiceResponse.success("Successfully parsed office hours", parsed);
    } catch (ex) {
      logger.error(`Error parsing office hours: ${(ex as Error).message}`);
      return ServiceResponse.failure("Failed to parse office hours", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async parseOfficeHoursText(rawData: string): Promise<ServiceResponse<string | null>> {
    const template = `Parse the given data into formatted markdown of office hours, looking for this data:
    "host": string (full legal name of the host),
    "day": "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" (allow any casing),
    "start_time": "HH:mm PM/AM" (convert time to this format),
    "end_time": "HH:mm PM/AM" (convert time to this format),
    "mode": "in-person" | "remote" | "hybrid" (allow any casing or deduce),
    "location": string,
    "link": string,
    
    Make sure to format the markdown in an extremely readable format.`;

    try {
      const prompt = ChatPromptTemplate.fromMessages([
        ["system", template],
        ["user", "Raw Data: {rawData}"],
      ]);
      const outputParser = new StringOutputParser();
      const chain = prompt.pipe(this.cheapLlm).pipe(outputParser);
      let response = await chain.invoke({ rawData });
      return ServiceResponse.success("Successfully parsed office hours", response);
    } catch (ex) {
      logger.error(`Error parsing office hours: ${(ex as Error).message}`);
      return ServiceResponse.failure("Failed to parse office hours", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}
