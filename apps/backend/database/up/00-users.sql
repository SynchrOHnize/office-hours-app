CREATE TYPE user_role
  AS ENUM ('admin', 'professor', 'teaching_assistant', 'student');

CREATE TABLE users (
  id varchar(255) PRIMARY KEY,
  email varchar(255) NOT NULL,
  first_name varchar(255) NOT NULL,
  last_name varchar(255) NOT NULL,
  img_url varchar(255),
  role user_role NOT NULL DEFAULT 'student',
  ical_link varchar(255),
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
