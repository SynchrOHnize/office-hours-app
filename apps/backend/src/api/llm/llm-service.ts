import { logger } from "@/server";
import { capitalize } from "@/utils/helper";
import ServiceResponse from "@/utils/service-response";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import type { Response } from "express";
import { StatusCodes } from "http-status-codes";

const llm = new ChatOpenAI({
  modelName: "gpt-4o",
});

function validateData(officeHour: Record<string, any>) {
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  if (!officeHour.host || typeof officeHour.host !== "string" || officeHour.host.trim() === "") {
    officeHour.host = officeHour.complete ? "INVALID" : officeHour.host;
  }

  // Validate 'day'
  if (!["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].includes(officeHour.day)) {
    officeHour.day = officeHour.complete ? "INVALID" : officeHour.day;
  }

  // Validate 'start_time' and 'end_time' as HH:mm format
  const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/;
  if (!officeHour.start_time || !timeRegex.test(officeHour.start_time)) {
    officeHour.start_time = officeHour.complete ? "INVALID" : officeHour.start_time;
  }
  if (!officeHour.end_time || !timeRegex.test(officeHour.end_time)) {
    officeHour.end_time = officeHour.complete ? "INVALID" : officeHour.end_time;
  }

  // Validate 'location' and 'link' based on 'mode'
  if (officeHour.mode === "Remote") {
    // Remote: Requires valid link and no location
    if (!officeHour.link || !isValidUrl(officeHour.link)) {
      officeHour.link = officeHour.complete ? "INVALID" : officeHour.link;
    }
    officeHour.location = "";
  } else if (officeHour.mode === "In-person") {
    // In-person: Requires location and no link
    if (!officeHour.location || !/^[A-Z]+[0-9]+$/.test(officeHour.location)) {
      officeHour.location = officeHour.complete ? "INVALID" : officeHour.location;
    }
    officeHour.link = "";
  } else if (officeHour.mode === "Hybrid") {
    // Hybrid: Requires both valid link and location
    if (!officeHour.link || !isValidUrl(officeHour.link)) {
      officeHour.link = officeHour.complete ? "INVALID" : officeHour.link;
    }
    if (!officeHour.location || !/^[A-Z]+[0-9]+$/.test(officeHour.location)) {
      officeHour.location = officeHour.complete ? "INVALID" : officeHour.location;
    }
  }
}

function formatData(officeHour: Record<string, any>) {
  // Ensure host name is capitalized and trimmed
  officeHour.host =
    officeHour.host
      .split(" ")
      .map((word: string) => capitalize(word))
      .join(" ") || "";
  officeHour.day = capitalize(officeHour.day) || "";
  officeHour.link = officeHour.link || "";
  officeHour.location = officeHour.location || "";
  officeHour.mode = officeHour.link
    ? officeHour.location
      ? "Hybrid"
      : "Remote"
    : officeHour.location
      ? "In-person"
      : officeHour.complete
        ? "INVALID"
        : "";
  officeHour.start_time = officeHour.start_time ? officeHour.start_time.toUpperCase() : "";
  officeHour.end_time = officeHour.end_time ? officeHour.end_time.toUpperCase() : "";

  validateData(officeHour);

  return officeHour;
}

export async function parseOfficeHoursJson(
  courseId: number,
  rawData: string,
): Promise<ServiceResponse<Record<string, any>[] | null>> {
  const template = `Parse the given data into a list of objects with this schema:
{{
  "host": string,
  "day": "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" (allow any casing),
  "start_time": "HH:mm PM/AM" (convert time to this format),
  "end_time": "HH:mm PM/AM" (convert time to this format),
  "location": string,
  "link": string,
}}
Location must be uppercase letters followed by numbers (e.g., MALA5200). Set as "INVALID" if not explicitly given in this format.
At least one of link or location must be provided. If only one is provided, set the other as "". If neither is provided, set both as "INVALID".
Return only valid JSON array. Allow missing or incorrect data, simply set the value as "INVALID". Include as much information as possible. You should almost never return empty unless there is truly no information.`;

  try {
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", template],
      ["user", "Raw Data: {rawData}"],
    ]);
    const outputParser = new StringOutputParser();
    const chain = prompt.pipe(llm).pipe(outputParser);
    let response = await chain.invoke({ rawData });
    response = response.replace(/```json\n?|\n?```/g, "");
    const parsed = JSON.parse(response);

    for (let officeHour of parsed) {
      officeHour.course_id = courseId;
      officeHour = formatData(officeHour);
    }

    return ServiceResponse.success("Successfully parsed office hours", parsed);
  } catch (ex) {
    logger.error(`Error parsing office hours: ${(ex as Error).message}`);
    return ServiceResponse.failure("Failed to parse office hours", null, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

export async function parseOfficeHoursText(rawData: string): Promise<ServiceResponse<string | null>> {
  const template = `Parse the given data into formatted markdown of office hours, looking for this data:
  "host": string (full legal name of the host),
  "day": "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" (allow any casing),
  "start_time": "HH:mm PM/AM" (convert time to this format),
  "end_time": "HH:mm PM/AM" (convert time to this format),
  "location": string,
  "link": string,

  Look for the table header. If it has default values, make sure to apply them to all rows.
  Make sure to format the markdown in an extremely readable format. Output the markdown only.`;

  try {
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", template],
      ["user", "Raw Data: {rawData}"],
    ]);
    const outputParser = new StringOutputParser();
    const chain = prompt.pipe(llm).pipe(outputParser);
    let response = await chain.invoke({ rawData });
    response = response.replace(/```markdown\n?|\n?```/g, "");
    return ServiceResponse.success("Successfully parsed office hours", response);
  } catch (ex) {
    logger.error(`Error parsing office hours: ${(ex as Error).message}`);
    return ServiceResponse.failure("Failed to parse office hours", null, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

export async function parseOfficeHoursJsonStream(
  courseId: number,
  rawData: string,
  res: Response,
): Promise<ServiceResponse> {
  const template = `Parse the given data into a jsonl format (no backtick delimiters) with this schema:
  {{
    "host": string,
    "day": "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" (allow any casing),
    "start_time": "HH:mm PM/AM" (convert time to this format),
    "end_time": "HH:mm PM/AM" (convert time to this format),
    "location": string,
    "link": string,
  }}
  Location must be uppercase letters followed by numbers (e.g., MALA5200). Set as "INVALID" if not explicitly given in this format.
  At least one of link or location must be provided. If only one is provided, set the other as "". If neither is provided, set both as "INVALID".
  Return only valid JSON. Allow missing or incorrect data, simply set the value as "INVALID". Include as much information as possible. You should almost never return empty unless there is truly no information.
  Return empty {{}} if there is no information.`;
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", template],
    ["user", "Raw Data: {rawData}"],
  ]);

  const outputParser = new StringOutputParser();
  const chain = prompt.pipe(llm).pipe(outputParser);
  let sentData = false;
  try {
    const stream = await chain.stream({ rawData });
    let curr = "";
    let isNew = true;
    for await (const chunk of stream) {
      if (chunk && chunk != "{}") {
        sentData = true;
      }

      curr += chunk;
      curr = curr.replace(/```json\n?|\n?```/g, "");
      curr = curr.replace("\n", "");
      const temp = curr;
      try {
        if (curr.endsWith('",')) {
          curr += '"complete": false';
          if (isNew) {
            curr += ',"new": true';
            isNew = false;
          }
          curr += "}";
        } else if (curr.endsWith('","')) {
          curr += 'complete": false';
          if (isNew) {
            curr += ',"new": true';
            isNew = false;
          }
          curr += "}";
        } else {
          try {
            JSON.parse(curr + '"}');
            curr += '","complete": false';
            if (isNew) {
              curr += ',"new": true';
              isNew = false;
            }
            curr += "}";
          } catch (error) {}
        }
        let parsed = JSON.parse(curr);
        parsed.course_id = courseId;
        if (parsed?.complete !== false) {
          parsed.complete = true;
          curr = "";
          isNew = true;
        }

        if (parsed?.new !== true) {
          parsed.new = false;
        }

        parsed = formatData(parsed);
        const final = JSON.stringify(parsed);
        res.write(final);
        if (parsed.complete === false) {
          curr = temp;
        }
      } catch (error) {
        continue;
      }
    }
    if (!sentData) {
      return ServiceResponse.failure("Invalid input data. Nothing to parse.", null, 400);
    }

    return ServiceResponse.success("Data parsed successfully.", null, 200);
  } catch (err) {
    const error = err as Error;
    return ServiceResponse.failure(error.message, null, 400);
  }
}
