-- Diagnostic script to identify table structure issues

-- Log the beginning of diagnosis
SELECT 'BEGINNING DATABASE STRUCTURE DIAGNOSIS' AS message;

-- Check if the permission_group_permissions table exists
SELECT 
    IF(COUNT(*) > 0, 'Table permission_group_permissions exists', 'Table permission_group_permissions does NOT exist') AS table_check
FROM information_schema.tables 
WHERE table_schema = database() 
AND table_name = 'permission_group_permissions';

-- Check columns in the permission_group_permissions table
SELECT 
    table_name,
    column_name,
    column_type,
    is_nullable,
    column_key
FROM information_schema.columns
WHERE table_schema = database()
AND table_name = 'permission_group_permissions'
ORDER BY ordinal_position;

-- Check indexes on the permission_group_permissions table
SELECT 
    table_name,
    index_name,
    column_name,
    non_unique
FROM information_schema.statistics
WHERE table_schema = database()
AND table_name = 'permission_group_permissions'
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
AND tc.table_name = 'permission_group_permissions';

-- Log the end of diagnosis
SELECT 'END OF DATABASE STRUCTURE DIAGNOSIS' AS message; 