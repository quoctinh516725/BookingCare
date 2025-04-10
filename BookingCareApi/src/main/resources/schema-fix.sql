-- First, check if both columns exist
SET @check_columns = (
    SELECT COUNT(*) 
    FROM information_schema.columns 
    WHERE table_schema = database() 
    AND table_name = 'permission_group_permissions' 
    AND column_name IN ('group_id', 'permission_group_id')
);

-- Fix scenario 1: If both columns exist, copy values from group_id to permission_group_id
-- and make permission_group_id accept NULL values temporarily
SET @fix_both_columns = CONCAT(
    "ALTER TABLE permission_group_permissions MODIFY permission_group_id BINARY(16) NULL; ",
    "UPDATE permission_group_permissions SET permission_group_id = group_id WHERE permission_group_id IS NULL; ",
    "ALTER TABLE permission_group_permissions MODIFY permission_group_id BINARY(16) NOT NULL; "
);

-- Fix scenario 2: If only group_id exists, rename it to permission_group_id
SET @rename_column = "ALTER TABLE permission_group_permissions CHANGE group_id permission_group_id BINARY(16) NOT NULL;";

-- Fix scenario 3: If only permission_group_id exists, ensure it's setup correctly
SET @ensure_column = "ALTER TABLE permission_group_permissions MODIFY permission_group_id BINARY(16) NOT NULL;";

-- Execute the appropriate fix based on column existence
SET @sql = IF(@check_columns = 2, 
              @fix_both_columns, 
              IF(@check_columns = 1, 
                 -- Check if the existing column is group_id
                 IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = database() AND table_name = 'permission_group_permissions' AND column_name = 'group_id') = 1,
                    @rename_column, 
                    @ensure_column),
                 -- If no columns found, table may not exist yet
                 "SELECT 'Table not found or columns do not exist' AS message;"
              )
           );

-- Prepare and execute the dynamic SQL
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add a message to confirm execution
SELECT 'Schema fix script executed' AS message; 