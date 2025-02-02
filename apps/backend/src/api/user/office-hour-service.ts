import * as officeHourDatabase from "@/database/office-hours";
import type { OfficeHour } from "@/schemas/office-hour";
import { logger } from "@/server";
import env from "@/utils/env";
import ServiceResponse from "@/utils/service-response";
import sgMail from "@sendgrid/mail";
import { StatusCodes } from "http-status-codes";
import ical, { ICalEventRepeatingFreq, ICalEvent, type ICalEventData } from "ical-generator";

const { SENDGRID_API_KEY } = env;
sgMail.setApiKey(SENDGRID_API_KEY);

function transformTime(day: string, time: string): Date {
  const dayOfWeek: { [key: string]: number } = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  const today = new Date();
  const index_of_today = today.getDay();
  const office_hour_day_index = dayOfWeek[day];

  const officeHourDate = new Date();
  officeHourDate.setDate(today.getDate() + ((office_hour_day_index - index_of_today + 7) % 7 || 7));

  const [time_str, am_pm] = time.toLowerCase().split(" ");
  let [hours, minutes] = time_str.split(":").map(Number);

  if (am_pm === "pm" && hours !== 12) {
    hours += 12;
  } else if (am_pm === "am" && hours === 12) {
    hours = 0;
  }

  officeHourDate.setHours(hours);
  officeHourDate.setMinutes(minutes);

  return officeHourDate;
}

// Retrieves all courses from the database
export async function getAll(): Promise<ServiceResponse<OfficeHour[] | null>> {
  try {
    const officeHours = await officeHourDatabase.getAllOfficeHours();
    if (!officeHours || officeHours.length === 0) {
      return ServiceResponse.failure("No office hours found", null, StatusCodes.NOT_FOUND);
    }
    return ServiceResponse.success<OfficeHour[]>("Office hours found", officeHours);
  } catch (ex) {
    const errorMessage = `Error finding all office hours: $${(ex as Error).message}`;
    logger.error(errorMessage);
    return ServiceResponse.failure(
      "An error occurred while retrieving office hours.",
      null,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
}

export async function getOfficeHoursByUserId(id: string): Promise<ServiceResponse<OfficeHour[] | null>> {
  try {
    const officeHours = await officeHourDatabase.getOfficeHoursByUserId(id);
    // const officeHours = await officeHourDatabase.getAllOfficeHours();
    if (!officeHours) {
      return ServiceResponse.failure("No office hours found", null, StatusCodes.NOT_FOUND);
    }
    return ServiceResponse.success<OfficeHour[]>("Office hours found", officeHours);
  } catch (ex) {
    const errorMessage = `Error finding office hour by id: $${(ex as Error).message}`;
    logger.error(errorMessage);
    return ServiceResponse.failure(
      "An error occurred while retrieving office hours.",
      null,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
}

export async function deleteOfficeHours(
  officeHourIds: number[],
  userId: string,
): Promise<ServiceResponse<{ deletedCount: number }>> {
  try {
    const result = await officeHourDatabase.deleteOfficeHours(officeHourIds, userId);

    if (result.affectedRows === 0) {
      return ServiceResponse.failure(
        "No office hours were found to delete",
        { deletedCount: 0 },
        StatusCodes.NOT_FOUND,
      );
    }

    return ServiceResponse.success(`Successfully deleted ${result.affectedRows} office hours`, {
      deletedCount: result.affectedRows,
    });
  } catch (ex) {
    const errorMessage = `Error deleting office hours: ${(ex as Error).message}`;
    logger.error(errorMessage);
    return ServiceResponse.failure(
      "An error occurred while deleting office hours",
      { deletedCount: 0 },
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
}

export async function createIcalEvents(
  officeHours: OfficeHour[],
  calendarName: string,
): Promise<ServiceResponse<string | null>> {
  try {
    if (!officeHours) {
      return ServiceResponse.failure("No office hours found", null, StatusCodes.NOT_FOUND);
    }

    // create ical file
    const ical_file = ical({ name: calendarName });

    // define semesterEnd (office hour events will repeat for however many weeks)
    const semesterEnd = new Date(Date.now() + 3 * 3600 * 1000 * 24 * 7 * 5); // 15 weeks from now

    // set the timezone
    ical_file.timezone("America/New_York");

    for (const oh of officeHours) {
      // Base event properties that are common to all modes
      const eventConfig: ICalEventData = {
        start: transformTime(oh.day, oh.start_time),
        end: transformTime(oh.day, oh.end_time),
        timezone: "America/New_York",
        summary: `${oh.host}'s Office Hours`,
        organizer: {
          name: oh.host,
        },
        repeating: {
          freq: ICalEventRepeatingFreq.WEEKLY,
          until: semesterEnd,
        },
      };

      // Add optional properties based on mode
      if (oh.mode !== "remote") {
        eventConfig.location = oh.location;
      }
      if (oh.mode !== "in-person") {
        eventConfig["url"] = oh.link;
      }

      ical_file.createEvent(eventConfig);
    }

    const data_str = ical_file.toString();
    if (!data_str) {
      throw new Error("Empty calendar data.");
    }

    const url = `data:text/calendar;base64,${Buffer.from(data_str).toString("base64")}`;
    return ServiceResponse.success<string>("Office hours found", url);
  } catch (ex) {
    const errorMessage = `Error in generating office hour ical file: ${(ex as Error).message}`;
    logger.error(errorMessage);
    return ServiceResponse.failure(
      "An error occurred while retrieving and storing office hours to ical file.",
      null,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
}

export async function getIcalFileByIds(officeHourIds: number[]): Promise<ServiceResponse<string | null>> {
  try {
    const officeHours = await officeHourDatabase.getOfficeHoursByIds(officeHourIds);
    return createIcalEvents(officeHours, `Office Hours for Selected Classes`);
  } catch (ex) {
    const errorMessage = `Error in generating office hour ical file by id: ${(ex as Error).message}`;
    logger.error(errorMessage);
    return ServiceResponse.failure(
      "An error occurred while retrieving and storing office hours to ical file.",
      null,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
}

export async function getIcalFileByUserId(user_id: string): Promise<ServiceResponse<string | null>> {
  try {
    const officeHours = await officeHourDatabase.getOfficeHoursByUserId(user_id);
    return createIcalEvents(officeHours, `Office Hours for User ${user_id}`);
  } catch (ex) {
    const errorMessage = `Error in generating office hour ical file by user_id: ${(ex as Error).message}`;
    logger.error(errorMessage);
    return ServiceResponse.failure(
      "An error occurred while retrieving and storing office hours to ical file.",
      null,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
}

export async function storeOfficeHours(
  data: OfficeHour[],
  userId: string,
): Promise<ServiceResponse<OfficeHour[] | null>> {
  try {
    const officeHours = await officeHourDatabase.storeOfficeHours(data, userId);
    return ServiceResponse.success("Office hours created successfully", officeHours);
  } catch (ex) {
    const errorMessage = `Error storing office hours: ${(ex as Error).message}`;
    logger.error(errorMessage);
    return ServiceResponse.failure(
      "An error occurred while storing the office hours",
      null,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
}

export async function sendEmailNotification(users: { email: string }[], updatedOfficeHour: any): Promise<void> {
  if (!users || users.length === 0) {
    console.error("No users provided to send email notifications.");
    return;
  }

  if (!updatedOfficeHour) {
    console.error("Updated office hour details are missing.");
    return;
  }

  const messages = users.map((user) => ({
    to: user.email,
    from: {
      email: "support@ohsync.me",
      name: "OHsync Team",
    },
    subject: "Updated Office Hours Notification",
    text: `Hello,

We wanted to let you know that the office hours for the course have been updated.

Updated Office Hours:
- Host: ${updatedOfficeHour.host}
- Day: ${updatedOfficeHour.day}
- Time: ${updatedOfficeHour.start_time} - ${updatedOfficeHour.end_time}
- Mode: ${updatedOfficeHour.mode}
- Location: ${updatedOfficeHour.location || "N/A"}
- Link: ${updatedOfficeHour.link || "N/A"}

Thank you!`,

    // HTML version of the email
    html: `
      <html>
        <body>
          <p>Hello,</p>
          <p>We wanted to let you know that the office hours for the course have been updated.</p>
          <p><strong>Updated Office Hours:</strong></p>
          <ul>
            <li><strong>Host:</strong> ${updatedOfficeHour.host}</li>
            <li><strong>Day:</strong> ${updatedOfficeHour.day}</li>
            <li><strong>Time:</strong> ${updatedOfficeHour.start_time} - ${updatedOfficeHour.end_time}</li>
            <li><strong>Mode:</strong> ${updatedOfficeHour.mode}</li>
            <li><strong>Location:</strong> ${updatedOfficeHour.location || "N/A"}</li>
            <li><strong>Link:</strong> ${updatedOfficeHour.link || "N/A"}</li>
          </ul>
          <p>Thank you!</p>
        </body>
      </html>
    `,
  }));

  try {
    for (const msg of messages) {
      try {
        await sgMail.send(msg);
        console.log(`Email sent successfully to: ${msg.to}`);
      } catch (error) {
        console.error(`Failed to send email to: ${msg.to}. Error:`, error);
      }
    }
  } catch (error) {
    console.error("An error occurred while sending email notifications:", error);
  }
}

export async function updateOfficeHour(
  id: number,
  data: OfficeHour,
  userId: string,
): Promise<ServiceResponse<OfficeHour | null>> {
  try {
    const officeHour = await officeHourDatabase.updateOfficeHour(id, data, userId);

    // Fetch users enrolled in the course
    const users = await officeHourDatabase.getUsersByCourseId(data.course_id);
    console.log(users);

    // Send email notifications to all users
    await sendEmailNotification(users, officeHour);
    console.log("email sent");

    return ServiceResponse.success("Office hour updated successfully", officeHour);
  } catch (ex) {
    const errorMessage = `Error storing office hours: ${(ex as Error).message}`;
    logger.error(errorMessage);
    return ServiceResponse.failure(
      "An error occurred while storing the office hours",
      null,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
}
