-- Script to recreate the permission_group_permissions join table from scratch
-- Only executed as a last resort if the other fixes don't work

-- Create a backup of the existing data
CREATE TEMPORARY TABLE IF NOT EXISTS temp_permission_group_permissions AS
SELECT * FROM permission_group_permissions;

-- Drop the existing table
DROP TABLE IF EXISTS permission_group_permissions;

-- Recreate the table with the correct schema
CREATE TABLE permission_group_permissions (
    permission_group_id BINARY(16) NOT NULL,
    permission_id BINARY(16) NOT NULL,
    PRIMARY KEY (permission_group_id, permission_id),
    CONSTRAINT fk_permission_group_id FOREIGN KEY (permission_group_id) 
        REFERENCES permission_groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_permission_id FOREIGN KEY (permission_id) 
        REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Check if the temporary table exists and has data
SET @has_temp_table = (
    SELECT COUNT(*) > 0 
    FROM information_schema.tables 
    WHERE table_schema = database() 
    AND table_name = 'temp_permission_group_permissions'
);

-- Restore data from backup if it exists
SET @restore_data = CONCAT(
    "INSERT INTO permission_group_permissions (permission_group_id, permission_id) ",
    "SELECT ",
    "  CASE ",
    "    WHEN permission_group_id IS NOT NULL THEN permission_group_id ",
    "    ELSE group_id ",
    "  END AS permission_group_id, ",
    "  permission_id ",
    "FROM temp_permission_group_permissions;"
);

-- Execute the data restoration if we have data to restore
PREPARE stmt FROM @restore_data;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop the temporary table
DROP TEMPORARY TABLE IF EXISTS temp_permission_group_permissions; 