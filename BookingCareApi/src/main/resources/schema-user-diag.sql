-- Diagnostic script to identify user_permission_groups table structure issues

-- Log the beginning of diagnosis
SELECT 'BEGINNING USER_PERMISSION_GROUPS TABLE DIAGNOSIS' AS message;

-- Check if the user_permission_groups table exists
SELECT 
    IF(COUNT(*) > 0, 'Table user_permission_groups exists', 'Table user_permission_groups does NOT exist') AS table_check
FROM information_schema.tables 
WHERE table_schema = database() 
AND table_name = 'user_permission_groups';

-- Check columns in the user_permission_groups table
SELECT 
    table_name,
    column_name,
    column_type,
    is_nullable,
    column_key
FROM information_schema.columns
WHERE table_schema = database()
AND table_name = 'user_permission_groups'
ORDER BY ordinal_position;

-- Check indexes on the user_permission_groups table
SELECT 
    table_name,
    index_name,
    column_name,
    non_unique
FROM information_schema.statistics
WHERE table_schema = database()
AND table_name = 'user_permission_groups'
ORDER BY index_name, seq_in_index;

-- Check foreign key constraints
SELECT 
    tc.constraint_name,
    tc.table_name, 
    kcu.column_name, 
    kcu.referenced_table_name,
    kcu.referenced_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = database()
AND tc.table_name = 'user_permission_groups';

-- Log the end of diagnosis
SELECT 'END OF USER_PERMISSION_GROUPS TABLE DIAGNOSIS' AS message; 