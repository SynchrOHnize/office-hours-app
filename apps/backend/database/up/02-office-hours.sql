CREATE TYPE office_hour_day
  AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

CREATE TYPE office_hour_mode
  AS ENUM ('remote', 'in-person', 'hybrid');

CREATE TABLE office_hours (
  id serial PRIMARY KEY,
  course_id int,
  host varchar(255),
  mode office_hour_mode,
  link varchar(255),
  location varchar(255),
  start_time time NOT NULL,
  end_time time NOT NULL,
  day office_hour_day NOT NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NOT NULL DEFAULT '2024-01-01 00:00:00',
  updated_by varchar(255) DEFAULT NULL,
  is_deleted boolean NOT NULL DEFAULT FALSE,
  UNIQUE (course_id, host, mode, start_time, end_time, day, is_deleted),
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
