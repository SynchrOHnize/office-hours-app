import api from "./api";

export interface SearchClass {
  key: string;
  code: string;
  title: string;
  instructors: string[];
}

export interface SearchPayload<T> {
  statusCode: number;
  data: T;
  message: string;
}

/**
 * Search for faculty by email in UF directory
 * @param email - Faculty email address
 * @returns Boolean indicating if faculty exists
 */
export const verifyProfessor = async (email: string): Promise<boolean> => {
  try {
    const response = await api.get(`/search/faculty/${encodeURIComponent(email)}`);
    const payload: SearchPayload<boolean> = response.data;
    return payload.data;
  } catch (error) {
    console.error("Error searching faculty:", error);
    return false;
  }
};

/**
 * Search for classes by keyword
 * @param keyword - Search term for classes
 * @returns Array of matching classes
 */
export const searchClasses = async (keyword: string): Promise<SearchClass[] | null> => {
  try {
    const response = await api.get(`/search/classes/${encodeURIComponent(keyword)}`);
    const payload: SearchPayload<SearchClass[]> = response.data;
    return payload.data;
  } catch (error) {
    console.error("Error searching classes:", error);
    return null;
  }
};