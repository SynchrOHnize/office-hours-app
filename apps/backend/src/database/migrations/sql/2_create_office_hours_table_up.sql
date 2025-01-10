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
  updated_at TIMESTAMP NOT NULL DEFAULT '1970-01-01 00:00:00',
  updated_by VARCHAR(255) DEFAULT NULL,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
);
