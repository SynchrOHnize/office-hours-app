import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/schemas/serviceResponse";
import { logger } from "@/server";
import axios from "axios";
import { z } from "zod";
import { DirectorySearchSchema } from "@/common/schemas/directorySearchSchema";

interface DirectoryPerson {
  firstName: string;
  lastName: string;
  email: string;
}

export class SearchService {
  async searchDirectory(params: z.infer<typeof DirectorySearchSchema>): Promise<ServiceResponse<DirectoryPerson[]>> {
    // This ensures params has all fields with at least empty strings
    const validatedParams = DirectorySearchSchema.parse(params);

    try {
      const response = await axios.get("https://www.directory.ufl.edu/search/", {
        params: {
          f: validatedParams.first_name,
          l: validatedParams.last_name,
          e: validatedParams.email,
          a: validatedParams.type,
        },
      });

      if (!response.data) {
        return ServiceResponse.failure("No response received from directory", [], StatusCodes.NOT_FOUND);
      }

      const decodedHtml = decodeURIComponent(response.data.replace(/\+/g, " "));
      const results: DirectoryPerson[] = [];
      // First check if there's a match
      const matchCountRegex = /<strong><\/strong><strong>(\d+)\s*<\/strong>\s*match/;
      const matchCount = decodedHtml.match(matchCountRegex);
      if (!matchCount || matchCount[1] === "0") {
        return ServiceResponse.failure("No matches found in directory", [], StatusCodes.NOT_FOUND);
      }

      const resultRegex = /href=".*?e=(.*?)&.*?">(.*?),(\s*.*?)<\/a>/g;

      let match;
      while ((match = resultRegex.exec(decodedHtml)) !== null) {
        const [_, email, lastName, firstAndMiddle] = match;

        // Split and format name
        const firstName = firstAndMiddle.trim().split(" ")[0]; // Take only first name, ignore middle

        // Properly capitalize names
        const formattedFirstName = firstName.toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
        const formattedLastName = lastName.toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

        results.push({
          firstName: formattedFirstName,
          lastName: formattedLastName,
          email: email.toLowerCase(),
        });
      }

      if (results.length === 0) {
        return ServiceResponse.failure("No matches found in directory", [], StatusCodes.NOT_FOUND);
      }

      return ServiceResponse.success("Matches found in directory", results);
    } catch (ex) {
      logger.error(`Error searching directory by email: ${(ex as Error).message}`);
      return ServiceResponse.failure("An error occurred while searching the directory", [], StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async searchClasses(keyword: string): Promise<ServiceResponse<Record<string, any> | null>> {
    const formattedKeyword = keyword.replace(/^([A-Za-z]{3})(\d{1,4})$/, "$1 $2");
    const prefix = formattedKeyword !== keyword ? formattedKeyword.split(" ")[0] : null;
    try {
      const response = await axios.post("https://catalog.ufl.edu/course-search/api/?page=fose&route=search", {
        other: {
          srcdb: "",
        },
        criteria: [
          {
            field: "keyword",
            value: prefix ? prefix : formattedKeyword,
          },
        ],
      });
      if (!response.data) {
        return ServiceResponse.failure("No response received from catalog", null, StatusCodes.NOT_FOUND);
      }
      response.data.results = response.data.results.filter((result: Record<string, any>) => {
        const code = (result?.code || "").toUpperCase();
        const title = (result?.title || "").toUpperCase();
        const validResult = code.includes(formattedKeyword.toUpperCase()) || title.includes(formattedKeyword.toUpperCase());
        return validResult;
      });
      response.data.count = response.data.results.length;

      // If the original keyword was a course code, and there are multiple results, filter to only the exact match
      return ServiceResponse.success("Classes found", response.data);
    } catch (ex) {
      logger.error(`Error searching classes by keyword: ${(ex as Error).message}`);
      return ServiceResponse.failure("An error occurred while searching the catalog", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}
