CREATE TABLE IF NOT EXISTS office_hours (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT,
  host VARCHAR(255),
  mode ENUM('remote', 'in-person', 'hybrid'),
  link VARCHAR(255),
  location VARCHAR(255),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  day ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT '2024-01-01 00:00:00',
  updated_by VARCHAR(255) DEFAULT NULL,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (course_id, host, mode, start_time, end_time, day, is_deleted),
  INDEX idx_office_hours_course_id_is_deleted (course_id, is_deleted),
  INDEX idx_office_hours_day_start_time (day, start_time),
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
