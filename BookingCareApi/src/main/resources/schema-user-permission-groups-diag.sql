-- Script chẩn đoán cho bảng user_permission_groups
-- Được sử dụng để kiểm tra cấu trúc và xác định lỗi tiềm ẩn

-- Thông báo bắt đầu chẩn đoán
SELECT 'BẮT ĐẦU CHẨN ĐOÁN BẢNG USER_PERMISSION_GROUPS' AS message;

-- Kiểm tra xem bảng user_permission_groups có tồn tại không
SELECT 
    IF(COUNT(*) > 0, 'Bảng user_permission_groups tồn tại', 'Bảng user_permission_groups KHÔNG tồn tại') AS table_check
FROM information_schema.tables 
WHERE table_schema = database() 
AND table_name = 'user_permission_groups';

-- Kiểm tra các cột trong bảng user_permission_groups
SELECT 
    table_name AS 'Bảng',
    column_name AS 'Tên cột',
    column_type AS 'Kiểu dữ liệu',
    is_nullable AS 'Cho phép NULL',
    column_key AS 'Loại khóa'
FROM information_schema.columns
WHERE table_schema = database()
AND table_name = 'user_permission_groups'
ORDER BY ordinal_position;

-- Kiểm tra index và khóa chính
SELECT 
    table_name AS 'Bảng',
    index_name AS 'Tên index',
    column_name AS 'Tên cột',
    non_unique AS 'Không duy nhất'
FROM information_schema.statistics
WHERE table_schema = database()
AND table_name = 'user_permission_groups'
ORDER BY index_name, seq_in_index;

-- Kiểm tra ràng buộc khóa ngoại
SELECT 
    tc.constraint_name AS 'Tên ràng buộc',
    tc.table_name AS 'Bảng', 
    kcu.column_name AS 'Cột khóa ngoại', 
    kcu.referenced_table_name AS 'Bảng tham chiếu',
    kcu.referenced_column_name AS 'Cột tham chiếu'
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = database()
AND tc.table_name = 'user_permission_groups';

-- Tìm vấn đề tiềm ẩn: kiểm tra sự tồn tại của cả hai cột group_id và permission_group_id
SELECT 
    'VẤN ĐỀ TIỀM ẨN' AS 'Loại',
    'Tồn tại cả hai cột group_id và permission_group_id' AS 'Mô tả',
    COUNT(*) AS 'Số cột'
FROM information_schema.columns
WHERE table_schema = database()
AND table_name = 'user_permission_groups'
AND column_name IN ('group_id', 'permission_group_id')
HAVING COUNT(*) > 1;

-- Kiểm tra dữ liệu trong bảng
SELECT 'Số lượng bản ghi trong bảng:' AS description, COUNT(*) AS total_records 
FROM user_permission_groups;

-- Kiểm tra quan hệ giữa Users và PermissionGroups
SELECT 
    u.username AS 'Tên người dùng',
    COUNT(upg.permission_group_id) AS 'Số lượng nhóm quyền'
FROM users u
LEFT JOIN user_permission_groups upg ON u.id = upg.user_id
GROUP BY u.id
ORDER BY COUNT(upg.permission_group_id) DESC
LIMIT 10;

-- Kiểm tra các nhóm quyền và số lượng người dùng
SELECT 
    pg.name AS 'Tên nhóm quyền',
    COUNT(upg.user_id) AS 'Số lượng người dùng'
FROM permission_groups pg
LEFT JOIN user_permission_groups upg ON pg.id = upg.permission_group_id
GROUP BY pg.id
ORDER BY COUNT(upg.user_id) DESC
LIMIT 10;

-- Kết thúc chẩn đoán
SELECT 'KẾT THÚC CHẨN ĐOÁN BẢNG USER_PERMISSION_GROUPS' AS message; 