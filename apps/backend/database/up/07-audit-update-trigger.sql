CREATE OR REPLACE FUNCTION office_hours_audit_update()
  RETURNS TRIGGER
  LANGUAGE PLPGSQL
  AS $$ BEGIN
    INSERT INTO audit_log (
      data_id,
      user_id,
      action,
      data_before,
      data_after
    ) VALUES (
      NEW.id,
      NEW.updated_by,
      CASE
        WHEN NEW.is_deleted = true AND OLD.is_deleted = false THEN 'DELETE'
        ELSE 'UPDATE'
      END,
      JSON_OBJECT(
        'id', OLD.id,
        'course_id', OLD.course_id,
        'host', OLD.host,
        'mode', OLD.mode,
        'link', OLD.link,
        'location', OLD.location,
        'start_time', OLD.start_time,
        'end_time', OLD.end_time,
        'day', OLD.day,
        'created_at', OLD.created_at,
        'updated_at', OLD.updated_at,
        'updated_by', OLD.updated_by,
        'is_deleted', OLD.is_deleted
      ),
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

CREATE OR REPLACE TRIGGER office_hours_audit_update
  AFTER UPDATE ON office_hours
  FOR EACH ROW
  EXECUTE FUNCTION office_hours_audit_update();
