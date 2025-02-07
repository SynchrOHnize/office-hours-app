CREATE TABLE user_courses (
  user_id text REFERENCES users ON DELETE CASCADE,
  course_id int REFERENCES courses ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, course_id)
);
