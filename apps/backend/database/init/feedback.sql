CREATE TABLE feedback (
  id int PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id text REFERENCES users ON DELETE SET NULL,
  rating int NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);
