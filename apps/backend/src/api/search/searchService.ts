import axios, { type AxiosResponse } from "axios";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { ServiceResponse } from "@/common/schemas/serviceResponse";
import { DirectorySearchSchema } from "@/common/schemas/directorySearchSchema";
import { logger } from "@/server";

interface DirectoryPerson {
  firstName: string;
  lastName: string;
  email: string;
}

interface GraduateCourse {
  id: string;
  name: string;
}

export class SearchService {

  async searchDirectory(params: z.infer<typeof DirectorySearchSchema>): Promise<ServiceResponse<DirectoryPerson[]>> {
    // This ensures params has all fields with at least empty strings
    const validatedParams = DirectorySearchSchema.parse(params);

    try {
      const response = await axios.get('https://www.directory.ufl.edu/search/', {
        params: {
          f: validatedParams.first_name,
          l: validatedParams.last_name,
          e: validatedParams.email,
          a: validatedParams.type
        }
      });

      if (!response.data) {
        return ServiceResponse.failure("No response received from directory", [], StatusCodes.NOT_FOUND);
      }

      const decodedHtml = decodeURIComponent(response.data.replace(/\+/g, " "));
      const results: DirectoryPerson[] = [];
      // First check if there's a match
      const matchCountRegex = /<strong><\/strong><strong>(\d+)\s*<\/strong>\s*match/;
      const matchCount = decodedHtml.match(matchCountRegex);
      if (!matchCount || matchCount[1] === '0') {
        return ServiceResponse.failure("No matches found in directory", [], StatusCodes.NOT_FOUND);
      }

      const resultRegex = /href=".*?e=(.*?)&.*?">(.*?),(\s*.*?)<\/a>/g;

      let match;
      while ((match = resultRegex.exec(decodedHtml)) !== null) {
        const [_, email, lastName, firstAndMiddle] = match;

        // Split and format name
        const firstName = firstAndMiddle.trim().split(' ')[0]; // Take only first name, ignore middle

        // Properly capitalize names
        const formattedFirstName = firstName.toLowerCase().replace(/^\w/, c => c.toUpperCase());
        const formattedLastName = lastName.toLowerCase().replace(/^\w/, c => c.toUpperCase());

        results.push({
          firstName: formattedFirstName,
          lastName: formattedLastName,
          email: email.toLowerCase()
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
    const formattedKeyword = keyword.replace(/^([A-Za-z]{3})(\d{4})$/, '$1 $2');
    try {
        const response = await axios.post("https://catalog.ufl.edu/course-search/api/?page=fose&route=search", {
            other: {
                srcdb: ""
            },
            criteria: [
                {
                    field: "keyword",
                    value: formattedKeyword
                }
            ]
        });
        if (!response.data) {
            return ServiceResponse.failure("No response received from catalog", null, StatusCodes.NOT_FOUND);
        }

        response.data.results = response.data.results.slice(0, 50);

        response.data.results = response.data.results.filter((result: Record<string, any>) => {
          const code = (result.code || "").toUpperCase();
          const title = (result.title || "").toUpperCase();
          return (
            code.includes(formattedKeyword.toUpperCase()) ||
            title.includes(formattedKeyword.toUpperCase())
          );
        });


        // If the original keyword was a course code, and there are multiple results, filter to only the exact match
        if (keyword !== formattedKeyword && response.data.count > 1) {
          response.data.count = 1;
          response.data.results = [response.data.results[0]];
        }

        return ServiceResponse.success("Classes found", response.data);
    } catch (ex) {
        logger.error(`Error searching classes by keyword: ${(ex as Error).message}`);
        return ServiceResponse.failure("An error occurred while searching the catalog", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async listGraduateCourses(): Promise<ServiceResponse<GraduateCourse[] | null>> {
    let response: AxiosResponse<string, any> | null;
    let match: RegExpExecArray | null;

    const indexUrl = 'https://gradcatalog.ufl.edu/graduate/courses-az/english/';
    try {
      response = await axios.get<string>(indexUrl, { responseType: 'text' });
    } catch (e: any) {
      logger.error(`Failed to retrieve ${indexUrl}: ${e.message}`);
      return ServiceResponse.failure('Internal server error', null, StatusCodes.INTERNAL_SERVER_ERROR);
    }

    const indexHtml = response.data;
    const categoryRegex = /<li><a href="\/graduate\/courses-az\/(\w+)\/">.*?<\/a><\/li>/g;
    const courses: Record<string, GraduateCourse> = Object.create(null);

    let count = 0;
    while ((match = categoryRegex.exec(indexHtml)) !== null) {
      const categoryUrl = `https://gradcatalog.ufl.edu/graduate/courses-az/${match[1]}/`;
      const courseRegex = /<strong>\s+([A-Z]{3}\s+\d{4}[CL]?)\s+(.*?)\s+<span/g;
      logger.debug(`graduate-courses-list: ${match[1]} ${count++}`);

      response = null;
      while (response === null) {
        try {
          response = await axios.get<string>(categoryUrl, { responseType: 'text' });
        } catch (e: any) {
          if (e.code !== 'ECONNRESET') {
            logger.error(`Failed to retrieve ${categoryUrl}: ${e.message}`);
            return ServiceResponse.failure('Internal server error', null, StatusCodes.INTERNAL_SERVER_ERROR);
          }
        }
      }

      const categoryHtml = response.data;
      while ((match = courseRegex.exec(categoryHtml)) !== null) {
        const id = match[1];
        const name = match[2].replace(/&amp;/g, '&');
        if (!(id in courses))
          courses[id] = { id, name };
      }
    }

    return ServiceResponse.success('Success', Object.values(courses));
  }

}
