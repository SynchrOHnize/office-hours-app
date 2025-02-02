CREATE TABLE courses (
  id serial PRIMARY KEY,
  course_code varchar(255) NOT NULL,
  title varchar(255) NOT NULL,
  instructor varchar(255) NOT NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (course_code, title, instructor)
);
