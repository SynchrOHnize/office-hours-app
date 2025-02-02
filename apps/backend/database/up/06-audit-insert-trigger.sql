CREATE OR REPLACE FUNCTION office_hours_audit_insert() RETURNS TRIGGER LANGUAGE PLPGSQL AS $$ BEGIN
  INSERT INTO audit_log (
    data_id,
    user_id,
    action,
    data_before,
    data_after
  ) VALUES (
    NEW.id,
    NEW.updated_by,
    'CREATE',
    NULL,
    JSON_OBJECT(
      'id', NEW.id,
      'course_id', NEW.course_id,
      'host', NEW.host,
      'mode', NEW.mode,
      'link', NEW.link,
      'location', NEW.location,
      'start_time', NEW.start_time,
      'end_time', NEW.end_time,
      'day', NEW.day,
      'created_at', NEW.created_at,
      'updated_at', NEW.updated_at,
      'updated_by', NEW.updated_by,
      'is_deleted', NEW.is_deleted
    )
  );
END $$;

CREATE OR REPLACE TRIGGER office_hours_audit_insert
  AFTER INSERT ON office_hours
  FOR EACH ROW
  EXECUTE FUNCTION office_hours_audit_insert();
