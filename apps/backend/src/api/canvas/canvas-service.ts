import { logger } from "@/server";
import axios from "axios";

import ServiceResponse from "@/utils/service-response";

interface Course {
  id: number;
  name: string;
  account_id: number;
  uuid: string;
  start_at: string | null;
  grading_standard_id: number | null;
  is_public: boolean;
  created_at: string;
  course_code: string;
  default_view: string;
  root_account_id: number;
  enrollment_term_id: number;
  license: string;
  grade_passback_setting: string | null;
  end_at: string | null;
  public_syllabus: boolean;
  public_syllabus_to_auth: boolean;
  storage_quota_mb: number;
  is_public_to_auth_users: boolean;
  homeroom_course: boolean;
  course_color: string | null;
  friendly_name: string | null;
  apply_assignment_group_weights: boolean;
  calendar: {
    ics: string;
  };
  time_zone: string;
  blueprint: boolean;
  template: boolean;
  enrollments: Enrollment[];
  hide_final_grades: boolean;
  workflow_state: string;
  restrict_enrollments_to_course_dates: boolean;
}

interface Enrollment {
  type: string;
  role: string;
  role_id: number;
  user_id: number;
  enrollment_state: string;
  limit_privileges_to_course_section: boolean;
}

// Using this video as tutorial template [https://www.youtube.com/watch?v=g-XOxZxrW6Q]

type File = {};

export class CanvasService {
  constructor() {}

  async getCourses(accessToken: string): Promise<ServiceResponse<Course[] | null>> {
    try {
      const url = `https://ufl.instructure.com/api/v1/courses/`;
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };
      const res = await axios.get(url, {
        headers,
      });

      return ServiceResponse.success<Course[]>("Successfully fetched courses", res.data as Course[]);
    } catch (err) {
      const errMsg = `Error finding courses from Canvas: $${(err as Error).message}`;
      logger.error(errMsg);
      return ServiceResponse.failure("An error occurred while retreiving courses from Canvas.", null);
    }
  }

  async getCourseFiles(course_id: string, accessToken: string): Promise<ServiceResponse<File[] | null>> {
    try {
      const url = `https://ufl.instructure.com/api/v1/courses/${course_id}/files`;

      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };
      const res = await axios.get(url, {
        headers,
      });

      return ServiceResponse.success<File[]>("Successfully fetched courses", res.data as File[]);
    } catch (err) {
      const errMsg = `Error finding course files from Canvas: $${(err as Error).message}`;
      logger.error(errMsg);
      return ServiceResponse.failure("An error occurred while retreiving course files", null);
    }
  }
}
