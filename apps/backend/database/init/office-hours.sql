CREATE TYPE office_hour_day
  AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

CREATE TYPE office_hour_mode
  AS ENUM ('remote', 'in-person', 'hybrid');

CREATE TABLE office_hours (
  id int PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  host_id text NOT NULL REFERENCES users ON DELETE CASCADE,
  course_id int NOT NULL REFERENCES courses ON DELETE CASCADE,
  mode office_hour_mode NOT NULL,
  link text,
  location text,
  day office_hour_day NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT '2024-01-01 00:00:00',
  updated_by text DEFAULT NULL REFERENCES users ON DELETE SET NULL,
  UNIQUE (host_id, course_id, day, start_time, end_time)
);
