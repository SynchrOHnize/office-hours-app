CREATE TABLE courses (
  id int PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  owner_id text NOT NULL REFERENCES users,
  semester int NOT NULL,
  title text NOT NULL,
  code text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);
