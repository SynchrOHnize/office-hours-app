import type { DirectorySearchParams } from "@/schemas/directory-search";
import { logger } from "@/server";
import ServiceResponse from "@/utils/service-response";
import axios, { type AxiosResponse } from "axios";
import { StatusCodes } from "http-status-codes";

interface DirectoryPerson {
  firstName: string;
  lastName: string;
  email: string;
}

interface GraduateCourse {
  id: string;
  name: string;
}

export async function searchDirectory(params: DirectorySearchParams): Promise<ServiceResponse<DirectoryPerson[]>> {
  try {
    const response = await axios.get("https://www.directory.ufl.edu/search/", {
      params: {
        f: params.first_name,
        l: params.last_name,
        e: params.email,
        a: params.type,
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
    return ServiceResponse.failure(
      "An error occurred while searching the directory",
      [],
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
}

export async function searchClasses(keyword: string): Promise<ServiceResponse<Record<string, any> | null>> {
  const baseUrl = "https://one.uf.edu/apix/soc/schedule";
  const termUrl = "https://one.uf.edu/apix/soc/filters";

  try {
    // Step 1: Fetch the current term from the Python script's logic
    const termResponse = await axios.get(termUrl);
    const currentTerm = termResponse.data.terms[0].CODE;

    // Step 2: Prepare parameters as per the Python functionality
    const params = {
      "course-code": keyword, // e.g., COP3502 or similar
      "course-title": "",
      instructor: "",
      term: currentTerm,
    };

    // Step 3: Query the UF API with course details
    const courseResponse = await axios.get(baseUrl, { params });

    if (!courseResponse.data || courseResponse.data.length === 0) {
      return ServiceResponse.failure("No courses found for the given keyword", null, StatusCodes.NOT_FOUND);
    }

    const courses = courseResponse.data[0]?.COURSES || [];

    // Step 4: Process and structure data as per the Python logic
    const data = courses.map((course: Record<string, any>) => ({
      key: course.courseId,
      code: course.code,
      title: course.name,
      instructors: Array.from(
        new Set(
          course.sections.flatMap((section: Record<string, any>) =>
            section.instructors.map((instructor: Record<string, any>) => instructor.name),
          ),
        ),
      ),
    }));

    return ServiceResponse.success("Classes found", data);
  } catch (error) {
    console.error(`Error while searching classes: ${error}`);
    return ServiceResponse.failure(
      "An error occurred while searching for classes",
      null,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
}

export async function listGraduateCourses(): Promise<ServiceResponse<GraduateCourse[] | null>> {
  let response: AxiosResponse<string, any> | null;
  let match: RegExpExecArray | null;

  const indexUrl = "https://gradcatalog.ufl.edu/graduate/courses-az/english/";
  try {
    response = await axios.get<string>(indexUrl, { responseType: "text" });
  } catch (e: any) {
    logger.error(`Failed to retrieve ${indexUrl}: ${e.message}`);
    return ServiceResponse.failure("Internal server error", null, StatusCodes.INTERNAL_SERVER_ERROR);
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
        response = await axios.get<string>(categoryUrl, { responseType: "text" });
      } catch (e: any) {
        if (e.code !== "ECONNRESET") {
          logger.error(`Failed to retrieve ${categoryUrl}: ${e.message}`);
          return ServiceResponse.failure("Internal server error", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
      }
    }

    const categoryHtml = response.data;
    while ((match = courseRegex.exec(categoryHtml)) !== null) {
      const id = match[1];
      const name = match[2].replace(/&amp;/g, "&");
      if (!(id in courses)) courses[id] = { id, name };
    }
  }

  return ServiceResponse.success("Success", Object.values(courses));
}
