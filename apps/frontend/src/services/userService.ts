import { AxiosResponse } from "axios";
import api from "./api";

export interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  img_url: string | null;
  role: 'admin' | 'professor' | 'teaching_assistant' | 'student';
  ical_link: string | null;
  created_at: string;
  updated_at: string;
}

export interface OfficeHour {
  id: number;
  course_id: number;
  course_code: string;
  host: string;
  mode: string;
  link?: string;
  location?: string;
  start_time: string;
  end_time: string;
  day: string;
  created_at: string;
  updated_at: string;
}

export interface PreviewOfficeHour {
  host: string;
  day: string;
  start_time: string;
  end_time: string;
  mode: string;
  location: string;
  link: string;
}

export interface Course {
  course_id: number;
  course_code: string;
  title: string;
}

export interface Payload {
  statusCode: number;
  data: any;
  message: string;
}

export const storeUser = async (): Promise<User | null> => {
  try {
    const response = await api.post(`/users/me`);
    const payload = response.data;
    return payload;
  } catch (error) {
    console.error("Error storing user:", error);
    return null;
  }
}

// Fetch user by ID
export const fetchUser = async (): Promise<User | null> => {
  try {
    const response = await api.get("/users/me");
    const payload = response.data;
    return payload.data;
  } catch (error) {
    const user = await storeUser();
    if (user) {
      return user;
    }
    console.error("Error fetching user:", error);
    return null;
  }
};

export const fetchAllCourses = async (): Promise<Course[]> => {
  try {
    const response = await api.get(`/users/courses`);
    const payload = response.data;
    return payload.data;
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
}

// Fetch courses for a user by ID
export const fetchUserCourses = async (): Promise<Course[]> => {
  try {
    const response = await api.get(`/users/me/courses`);
    const payload = response.data;
    return payload.data;
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
};

export const storeUserCourse = async (courseId: number): Promise<Payload | null> => {
  try {
    const response = await api.post(`/users/me/courses/${courseId}`);
    const payload = response.data;
    return payload;
  } catch (error) {
    console.error("Error storing user course:", error);
    return null;
  }
}

export const deleteUserCourse = async (courseId: number): Promise<Payload | null> => {
  try {
    const response = await api.delete(`/users/me/courses/${courseId}`);
    const payload = response.data;
    return payload;
  } catch (error) {
    console.error("Error deleting user course:", error);
    return null;
  }
}

export const fetchCourseById = async (courseId: number): Promise<Course | null> => {
  try {
    const response = await api.get(`/users/courses/${courseId}`);
    const payload = response.data;
    return payload.data;
  } catch (error) {
    console.error("Error fetching course:", error);
    return null;
  }
}

export const fetchOfficeHours = async (): Promise<OfficeHour[]> => {
  try {
    const response = await api.get(`/users/me/office-hours`);
    const payload = response.data;
    const officeHours = payload.data as OfficeHour[];
    return officeHours.map(item => ({
      ...item,
      day: item.day.charAt(0).toUpperCase() + item.day.slice(1),
      mode: item.mode.charAt(0).toUpperCase() + item.mode.slice(1),
      start_time: new Date(`2000-01-01T${item.start_time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      end_time: new Date(`2000-01-01T${item.end_time}`).toLocaleTimeString('en-US', {
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true
      })
    }))
  } catch (error) {
    console.error("Error fetching office hours:", error);
    return [];
  }
};



export const sendFeedback = async (rating: number, content: string): Promise<Payload | null> => {
  try {
    const response = await api.post(`/users/feedback`, {
      rating,
      content,
    });
    const payload = response.data;
    return payload;
  } catch (error) {
    console.error("Error fetching office hours:", error);
    return null;
  }
};

export const getIcalFile = async (): Promise<Payload | null> => {
  try {
    const response = await api.get(`/users/me/ical-file`);
    const payload = response.data;
    return payload;
  } catch(error) {
    console.error("Error fetching ical file:", error);
    return null;
  }
}

export const getIcalFileByIds = async(ids: number[]): Promise<Payload | null> => {
  try {
    const response = await api.get('/users/ical-file', {
      params: {
        ids: ids.join(',')
      }});
    const payload = response.data;
    return payload;
  } catch(error) {
    console.error("Error fetching ical file:", error);
    return null;
  }
}

export const storeOfficeHour = async (courseId: number, officeHour: Record<string, any>): Promise<Payload | null> => {
  officeHour.course_id = courseId;
  try {
    const response = await api.post(`/users/office-hours`, officeHour);
    const payload = response.data;
    return payload;
  } catch (error) {
    console.error("Error storing office hour:", error);
    return null;
  }
}

export const storeOfficeHourList = async (officeHours: Record<string, any>[]): Promise<Payload | null> => {
  try {
    const response = await api.post(`/users/office-hours-list`, officeHours);
    const payload = response.data;
    return payload;
  } catch (error) {
    console.error("Error storing office hour list:", error);
    return null;
  }
}

export const parseOfficeHours = async (
  course_id: number,
  raw_data: string
): Promise<AxiosResponse | null> => {
  try {
    const response = await api.post(`/ai/office-hours`, { raw_data, course_id });
    return response; // Return the full AxiosResponse object
  } catch (error: any) {
    if (error.response) {
      // Return the error response if it exists
      return error.response;
    } else {
      // Log and return null for unexpected errors
      console.error("Unexpected error while parsing office hours:", error);
      return null;
    }
  }
};

export const updateOfficeHour = async (id: number, officeHour: Record<string, any>): Promise<Payload | null> => {
  console.log(officeHour.id)
  try {
    const response = await api.put(`/users/office-hours/${id}`, officeHour);
    const payload = response.data;
    return payload;
  } catch (error) {
    console.error("Error updating office hour:", error);
    return null;
  }
}

export const deleteOfficeHours = async(ids: number[]): Promise<Payload | null> => {
  try {
    const response = await api.delete('users/office-hours', {
      params: {
        ids: ids.join(',')
      }});
    const payload = response.data;
    return payload;
  } catch(error) {
    console.error("Error deleting office hour:", error);
    return null;
  }
}

export const storeCourse = async (course: Record<string, any>): Promise<Payload | null> => {
  try {
    const response = await api.post(`/users/courses`, course);
    const payload = response.data;
    return payload;
  } catch (error) {
    console.error("Error storing course:", error);
    return null;
  }
}
