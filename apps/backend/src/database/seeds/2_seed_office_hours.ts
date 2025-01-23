import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("office_hours").del();
  await knex("office_hours").insert([
    {
      course_id: 8371,
      host: "Shreyas Adireddy",
      mode: "remote",
      link: "https://discord.gg/eXU9Q7J8hm",
      start_time: "09:35:00",
      end_time: "10:25:00",
      day: "monday",
    }
  ])

  


}