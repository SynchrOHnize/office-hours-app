import { StatusCodes } from "http-status-codes";

import type { OfficeHour } from "@/common/schemas/officeHoursSchema";
import { OfficeHourRepository } from "@/database/officeHoursRepository";
import { ServiceResponse } from "@/common/schemas/serviceResponse";
import { logger } from "@/server";
import ical, { ICalCalendar, ICalEventRepeatingFreq } from 'ical-generator';

export class OfficeHourService {
  private officeHourRepository: OfficeHourRepository;

  constructor(repository: OfficeHourRepository) {
    this.officeHourRepository = repository;
  }

  transformTime(day: string, time: string) : Date {

        // Rewriting values in office hour object into date object type

        const dayOfWeek: {[key:string]: number} = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6};

        const today = new Date();
        const index_of_today = today.getDay();
        const office_hour_day_index = dayOfWeek[day];

        const officeHourDate = new Date();
        officeHourDate.setDate(today.getDate() + (((office_hour_day_index - index_of_today + 7) % 7) || 7));

        const [time_str, am_pm] = time.split(' ');
        let [hours, minutes] = time_str.split(':').map(Number);
        
        if(am_pm === "pm" && hours !== 12) { hours += 12; }
        else if(am_pm === "am" && hours === 12) { hours = 0; }

        officeHourDate.setHours(hours);
        officeHourDate.setMinutes(minutes);

        return officeHourDate;
  }

  // Retrieves all courses from the database
  async getAll(): Promise<ServiceResponse<OfficeHour[] | null>> {
    try {
      const officehours = await this.officeHourRepository.getAllOfficeHours();
      if (!officehours || officehours.length === 0) {
        return ServiceResponse.failure("No office hours found", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success<OfficeHour[]>("Office hours found", officehours);
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

  async getOfficeHoursByUserId(id: number): Promise<ServiceResponse<OfficeHour[] | null>> {
    try {
      const officehours = await this.officeHourRepository.getOfficeHoursByUserId(id);
      if (!officehours) {
        return ServiceResponse.failure("No office hours found", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success<OfficeHour[]>("Office hours found", officehours);
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

  async getIcalFileByUserId(id: number): Promise<ServiceResponse<string | null>> {
    try {
      const officehours = await this.officeHourRepository.getOfficeHoursByUserId(id);
      if(!officehours) {
        return ServiceResponse.failure("No office hours found", null, StatusCodes.NOT_FOUND)
      }
      const ical_file = ical ({ name: `Office Hours for User ${id}` });

      for(const oh of officehours) {
        const descr = 
        `Course Id: ${oh.course_id}. 
        Mode: ${oh.mode}.
        Link: ${oh.link}.`;
        ical_file.createEvent({
          
          start: this.transformTime(oh.day, oh.start_time),
          end: this.transformTime(oh.day, oh.end_time),
          summary: `${oh.host}'s Office Hours`,
          description: descr,
          location: oh.location,
          organizer: {
            name: oh.host,
          },
          repeating: {
            freq: ICalEventRepeatingFreq.WEEKLY, // Repeat every week, until...
            until: new Date(Date.now() + 3 * 3600 * 1000 * 24 * 7 * 4) // ... 12 weeks from now (approx 1 semester...?)
          }
        })

      }

      const data_str = ical_file.toString();
      if(data_str) { 
        const url = `data:text/calendar;base64,${Buffer.from(data_str).toString('base64')}`;
        return ServiceResponse.success<string>("Office hours found", url);
      } else { throw new Error("Empty calendar data.") }

    } catch (ex) {
      const errorMessage = `Error in generating office hour ical file by id: $${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while retrieving and storing office hours to ical file.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async storeOfficeHours(host: string, mode: string, link: string, location: string, start_time: string, end_time: string): Promise<ServiceResponse<null>> {
    try {
      await this.officeHourRepository.storeOfficeHours(host, mode, link, location, start_time, end_time);
      logger.info("Office hours successfully stored.");
      return ServiceResponse.success("Office hours successfully stored", null);
    } catch (ex) {
      const errorMessage = `Error storing office hours: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure("An error occurred while storing office hours.", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}
