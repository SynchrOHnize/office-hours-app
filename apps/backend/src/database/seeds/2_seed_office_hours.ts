import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("office_hours").del();

  // Inserts seed entries
  await knex("office_hours").insert([
    {
      course_id: 508104,
      host: "Shreyas Adireddy",
      mode: "remote",
      location: "https://discord.gg/eXU9Q7J8hm",
      start_time: "9:35 am",
      end_time: "10:25 am",
      day: "Monday",
    },
    {
      course_id: 508104,
      host: "Chris Tressler",
      mode: "in-person",
      location: "MALA5200",
      start_time: "9:35 am",
      end_time: "10:25 am",
      day: "Tuesday",
    },
    {
      course_id: 508104,
      host: "Shreyas Adireddy",
      mode: "remote",
      location: "https://discord.gg/eXU9Q7J8hm",
      start_time: "9:35 am",
      end_time: "10:25 am",
      day: "Wednesday",
    },
    {
      course_id: 508104,
      host: "Tony Wong",
      mode: "remote",
      location: "https://discord.gg/eXU9Q7J8hm",
      start_time: "9:35 am",
      end_time: "10:25 am",
      day: "Thursday",
    },
    {
      course_id: 508104,
      host: "Anna Albertelli",
      mode: "in-person",
      location: "MALA5200",
      start_time: "9:35 am",
      end_time: "10:25 am",
      day: "Friday",
    },
    {
      course_id: 507903,
      host: "Adam Bracci",
      mode: "remote",
      location: "https://discord.gg/eXU9Q7J8hm",
      start_time: "10:40 am",
      end_time: "11:30 am",
      day: "Monday",
    },
    {
      course_id: 507903,
      host: "Jackie Wang",
      mode: "in-person",
      location: "MALA5200",
      start_time: "10:40 am",
      end_time: "11:30 am",
      day: "Tuesday",
    },
    {
      course_id: 507903,
      host: "Adam Benali",
      mode: "in-person",
      location: "MALA5200",
      start_time: "10:40 am",
      end_time: "11:30 am",
      day: "Wednesday",
    },
    {
      course_id: 507903,
      host: "Tony Wong",
      mode: "remote",
      location: "https://discord.gg/eXU9Q7J8hm",
      start_time: "10:40 am",
      end_time: "11:30 am",
      day: "Thursday",
    },
    {
      course_id: 507903,
      host: "Anna Albertelli",
      mode: "in-person",
      location: "MALA5200",
      start_time: "10:40 am",
      end_time: "11:30 am",
      day: "Friday",
    },
    {
      course_id: 507903,
      host: "Shane Ferrell",
      mode: "in-person",
      location: "MALA5200",
      start_time: "11:45 am",
      end_time: "12:35 pm",
      day: "Thursday",
    },
    {
      course_id: 507903,
      host: "Shane Ferrell",
      mode: "in-person",
      location: "MALA5200",
      start_time: "12:50 pm",
      end_time: "1:40 pm",
      day: "Wednesday",
    },
    {
      course_id: 508104,
      host: "Ethan King",
      mode: "in-person",
      location: "MALA5200",
      start_time: "1:55 pm",
      end_time: "2:45 pm",
      day: "Monday",
    },
    {
      course_id: 508104,
      host: "Brandon Barker",
      mode: "in-person",
      location: "MALA5200",
      start_time: "1:55 pm",
      end_time: "2:45 pm",
      day: "Tuesday/Wednesday",
    },
    {
      course_id: 508104,
      host: "Adam Hassan",
      mode: "in-person",
      location: "MALA5200",
      start_time: "1:55 pm",
      end_time: "2:45 pm",
      day: "Friday",
    },
    {
      course_id: 508104,
      host: "Chris Tressler",
      mode: "in-person",
      location: "MALA5200",
      start_time: "4:05 pm",
      end_time: "4:55 pm",
      day: "Monday",
    },
    {
      course_id: 508104,
      host: "Brandon Barker",
      mode: "in-person",
      location: "MALA5200",
      start_time: "4:05 pm",
      end_time: "4:55 pm",
      day: "Tuesday/Wednesday",
    },
    {
      course_id: 508104,
      host: "Adam Bracci",
      mode: "remote",
      location: "https://discord.gg/eXU9Q7J8hm",
      start_time: "4:05 pm",
      end_time: "4:55 pm",
      day: "Friday",
    },
  ]);
}
