-- Fix script for user_permission_groups table

-- Log the beginning of fix
SELECT 'BEGINNING USER_PERMISSION_GROUPS TABLE FIX' AS message;

-- Check if both columns exist (group_id and permission_group_id)
SET @group_id_exists = (
    SELECT COUNT(*) FROM information_schema.columns 
    WHERE table_schema = database() 
    AND table_name = 'user_permission_groups' 
    AND column_name = 'group_id'
);

SET @permission_group_id_exists = (
    SELECT COUNT(*) FROM information_schema.columns 
    WHERE table_schema = database() 
    AND table_name = 'user_permission_groups' 
    AND column_name = 'permission_group_id'
);

-- If group_id exists but permission_group_id doesn't, rename the column
SET @rename_sql = CONCAT(
    'ALTER TABLE user_permission_groups ',
    'CHANGE COLUMN group_id permission_group_id BIGINT NOT NULL;'
);

-- Execute the rename if needed
SET @execute_rename = IF(@group_id_exists > 0 AND @permission_group_id_exists = 0, @rename_sql, 'SELECT "No rename needed" AS message');
PREPARE rename_stmt FROM @execute_rename;
EXECUTE rename_stmt;
DEALLOCATE PREPARE rename_stmt;

-- If both columns exist, we need to migrate data and drop the old column
SET @migrate_sql = CONCAT(
    'UPDATE user_permission_groups SET permission_group_id = group_id ',
    'WHERE permission_group_id IS NULL AND group_id IS NOT NULL;'
);

SET @drop_sql = 'ALTER TABLE user_permission_groups DROP COLUMN group_id;';

-- Execute the migration if needed
SET @execute_migrate = IF(@group_id_exists > 0 AND @permission_group_id_exists > 0, @migrate_sql, 'SELECT "No migration needed" AS message');
PREPARE migrate_stmt FROM @execute_migrate;
EXECUTE migrate_stmt;
DEALLOCATE PREPARE migrate_stmt;

-- Execute the drop if needed
SET @execute_drop = IF(@group_id_exists > 0 AND @permission_group_id_exists > 0, @drop_sql, 'SELECT "No column drop needed" AS message');
PREPARE drop_stmt FROM @execute_drop;
EXECUTE drop_stmt;
DEALLOCATE PREPARE drop_stmt;

-- If there is a FK constraint on group_id, we need to recreate it on permission_group_id
-- First, check for FK constraints on group_id
SET @fk_exists = (
    SELECT COUNT(*) FROM information_schema.key_column_usage
    WHERE table_schema = database() 
    AND table_name = 'user_permission_groups'
    AND column_name = 'group_id'
    AND referenced_table_name IS NOT NULL
);

-- Log the name of the FK constraint if it exists
SET @fk_name = (
    SELECT constraint_name FROM information_schema.key_column_usage
    WHERE table_schema = database() 
    AND table_name = 'user_permission_groups'
    AND column_name = 'group_id'
    AND referenced_table_name IS NOT NULL
    LIMIT 1
);

-- Get referenced table and column
SET @ref_table = (
    SELECT referenced_table_name FROM information_schema.key_column_usage
    WHERE table_schema = database() 
    AND table_name = 'user_permission_groups'
    AND column_name = 'group_id'
    AND referenced_table_name IS NOT NULL
    LIMIT 1
);

SET @ref_column = (
    SELECT referenced_column_name FROM information_schema.key_column_usage
    WHERE table_schema = database() 
    AND table_name = 'user_permission_groups'
    AND column_name = 'group_id'
    AND referenced_table_name IS NOT NULL
    LIMIT 1
);

-- Drop old FK constraint
SET @drop_fk_sql = CONCAT('ALTER TABLE user_permission_groups DROP FOREIGN KEY ', @fk_name, ';');

-- Create new FK constraint
SET @add_fk_sql = CONCAT(
    'ALTER TABLE user_permission_groups ADD CONSTRAINT FK_user_permission_groups_permission_group ',
    'FOREIGN KEY (permission_group_id) REFERENCES ', @ref_table, '(', @ref_column, ');'
);

-- Execute the FK constraint changes if needed
SET @execute_drop_fk = IF(@fk_exists > 0, @drop_fk_sql, 'SELECT "No FK drop needed" AS message');
PREPARE drop_fk_stmt FROM @execute_drop_fk;
EXECUTE drop_fk_stmt;
DEALLOCATE PREPARE drop_fk_stmt;

SET @execute_add_fk = IF(@fk_exists > 0, @add_fk_sql, 'SELECT "No FK add needed" AS message');
PREPARE add_fk_stmt FROM @execute_add_fk;
EXECUTE add_fk_stmt;
DEALLOCATE PREPARE add_fk_stmt;

-- Log the end of fix
SELECT 'END OF USER_PERMISSION_GROUPS TABLE FIX' AS message; 