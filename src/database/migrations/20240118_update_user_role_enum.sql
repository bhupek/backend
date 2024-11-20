-- Drop the existing enum type if it exists
DROP TYPE IF EXISTS enum_users_role CASCADE;

-- Create the new enum type
CREATE TYPE enum_users_role AS ENUM ('ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT');
