CREATE TABLE audit_log (
  id serial PRIMARY KEY,
  data_id intEGER REFERENCES office_hours(id),
  user_id varchar(255),
  action varchar(255),
  data_before JSON,
  data_after JSON,
  timestamp timestamp DEFAULT CURRENT_TIMESTAMP
);
