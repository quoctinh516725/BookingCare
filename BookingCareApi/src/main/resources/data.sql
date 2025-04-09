-- File chèn dữ liệu mẫu chỉ khi các bảng trống
-- Được sửa để không xóa dữ liệu hiện có nếu đã có trong cơ sở dữ liệu

-- Chèn dữ liệu cần thiết vào bảng users nếu trống
INSERT INTO users (id, first_name, last_name, email, username, password, phone, role, created_at, updated_at)
SELECT UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000001'), 'Admin', 'User', 'admin@example.com', 'admin', '$2a$10$6lw1ojmNxlT/guWQP27fyuD/T4XgEpkTAmiVmWbzKKKBBr8y.c7Ie', '+84987654321', 'ADMIN', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users LIMIT 1);

-- Staff nhân viên làm đẹp - chỉ chèn nếu bảng trống
INSERT INTO users (id, first_name, last_name, email, username, password, phone, role, description, created_at, updated_at)
SELECT UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000002'), 'Nguyễn Thị', 'Lan', 'staff1@example.com', 'staff1', '$2a$10$6lw1ojmNxlT/guWQP27fyuD/T4XgEpkTAmiVmWbzKKKBBr8y.c7Ie', '+84912345678', 'STAFF', 'Bác sĩ da liễu với hơn 10 năm kinh nghiệm điều trị các vấn đề về da. Chuyên gia trong điều trị mụn, thâm nám và các liệu pháp trẻ hóa da không xâm lấn.', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users LIMIT 1);

INSERT INTO users (id, first_name, last_name, email, username, password, phone, role, description, created_at, updated_at)
SELECT UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000003'), 'Trần Minh', 'Khoa', 'staff2@example.com', 'staff2', '$2a$10$6lw1ojmNxlT/guWQP27fyuD/T4XgEpkTAmiVmWbzKKKBBr8y.c7Ie', '+84912345679', 'STAFF', 'Chuyên gia thẩm mỹ được đào tạo tại Pháp, với chuyên môn sâu về liệu pháp cung cấp collagen và tái tạo cấu trúc da. Sở hữu nhiều chứng chỉ từ các tổ chức thẩm mỹ quốc tế.', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users LIMIT 1);

-- Thêm thêm các nhân viên còn lại với UUID tiêu chuẩn - chỉ chèn nếu bảng trống
INSERT INTO users (id, first_name, last_name, email, username, password, phone, role, description, created_at, updated_at)
SELECT UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000004'), 'Lê Thu', 'Hằng', 'staff3@example.com', 'staff3', '$2a$10$6lw1ojmNxlT/guWQP27fyuD/T4XgEpkTAmiVmWbzKKKBBr8y.c7Ie', '+84912345676', 'STAFF', 'Chuyên viên massage trị liệu với kỹ thuật độc quyền kết hợp giữa phương pháp truyền thống phương Đông và hiện đại. Giúp thư giãn, cải thiện tuần hoàn máu và phục hồi năng lượng.', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users LIMIT 1);

INSERT INTO users (id, first_name, last_name, email, username, password, phone, role, description, created_at, updated_at)
SELECT UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000005'), 'Phạm Văn', 'Dũng', 'staff4@example.com', 'staff4', '$2a$10$6lw1ojmNxlT/guWQP27fyuD/T4XgEpkTAmiVmWbzKKKBBr8y.c7Ie', '+84912345675', 'STAFF', 'Chuyên gia tư vấn với kinh nghiệm hơn 8 năm trong ngành thẩm mỹ. Sở trường phân tích và đưa ra các giải pháp cá nhân hóa cho từng loại da và vấn đề về da.', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users LIMIT 1);

INSERT INTO users (id, first_name, last_name, email, username, password, phone, role, description, created_at, updated_at)
SELECT UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000006'), 'Đỗ Mỹ', 'Linh', 'staff5@example.com', 'staff5', '$2a$10$6lw1ojmNxlT/guWQP27fyuD/T4XgEpkTAmiVmWbzKKKBBr8y.c7Ie', '+84912345674', 'STAFF', 'Chuyên gia về liệu pháp thiên nhiên, sử dụng các sản phẩm hữu cơ trong chăm sóc da. Tốt nghiệp xuất sắc từ Học viện Thẩm mỹ Paris, với chứng chỉ chuyên sâu về spa tự nhiên và liệu pháp hương thơm.', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users LIMIT 1);

-- Thêm người dùng để test - chỉ chèn nếu bảng trống
INSERT INTO users (id, first_name, last_name, email, username, password, phone, role, created_at, updated_at)
SELECT UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000007'), 'Khách', 'Hàng', 'customer@example.com', 'customer', '$2a$10$6lw1ojmNxlT/guWQP27fyuD/T4XgEpkTAmiVmWbzKKKBBr8y.c7Ie', '+84912345673', 'CUSTOMER', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users LIMIT 1);

INSERT INTO users (id, first_name, last_name, email, username, password, phone, role, created_at, updated_at)
SELECT UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000008'), 'Nguyễn Văn', 'An', 'customer2@example.com', 'customer2', '$2a$10$6lw1ojmNxlT/guWQP27fyuD/T4XgEpkTAmiVmWbzKKKBBr8y.c7Ie', '+84912345672', 'CUSTOMER', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users LIMIT 1);

-- Chèn dữ liệu cần thiết vào bảng services khớp với frontend - chỉ chèn nếu bảng trống
INSERT INTO services (id, name, description, price, duration, image_url, is_active, created_at, updated_at)
SELECT UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000001'), 'Chăm sóc da cơ bản', 'Quy trình chăm sóc toàn diện bao gồm làm sạch sâu, tẩy tế bào chết nhẹ nhàng với hạt mơ tự nhiên, massage thư giãn và đắp mặt nạ dưỡng ẩm chuyên sâu với chiết xuất lô hội và vitamin E. Phù hợp với mọi loại da, đặc biệt là da khô và nhạy cảm.', 450000, 60, 'https://i.imgur.com/0qAzuLL.jpg', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services LIMIT 1);

INSERT INTO services (id, name, description, price, duration, image_url, is_active, created_at, updated_at)
SELECT UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000002'), 'Trị mụn chuyên sâu', 'Liệu trình điều trị tận gốc các vấn đề về mụn, sử dụng công nghệ chiết xuất mủ mụn không đau, kết hợp với ánh sáng xanh diệt khuẩn và mặt nạ chống viêm. Sản phẩm sử dụng không chứa corticoid, an toàn cho da nhạy cảm và giúp giảm thâm sau mụn hiệu quả.', 650000, 90, 'https://i.imgur.com/GcajYdP.jpg', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services LIMIT 1);

INSERT INTO services (id, name, description, price, duration, image_url, is_active, created_at, updated_at)
SELECT UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000003'), 'Trẻ hóa da', 'Sử dụng công nghệ RF (sóng cao tần) kết hợp với tinh chất nhau thai cừu và collagen thủy phân, giúp kích thích sản sinh collagen tự nhiên, làm săn chắc và căng mịn da. Hiệu quả rõ rệt sau 1-3 liệu trình, giúp xóa mờ nếp nhăn, cải thiện độ đàn hồi và làm sáng da.', 850000, 120, 'https://i.imgur.com/7nninua.jpg', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services LIMIT 1);

INSERT INTO services (id, name, description, price, duration, image_url, is_active, created_at, updated_at)
SELECT UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000004'), 'Massage mặt', 'Kỹ thuật massage độc quyền theo phương pháp Nhật Bản, tác động lên 36 huyệt đạo chính trên khuôn mặt. Giúp giảm căng thẳng, thúc đẩy tuần hoàn máu, ngăn ngừa lão hóa và nâng cơ tự nhiên, mang lại làn da tươi sáng và trẻ trung hơn.', 350000, 45, 'https://i.imgur.com/bIXxqQZ.jpg', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services LIMIT 1);

INSERT INTO services (id, name, description, price, duration, image_url, is_active, created_at, updated_at)
SELECT UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000005'), 'Tẩy trang chuyên sâu', 'Quy trình làm sạch da hoàn hảo sử dụng dầu tẩy trang gốc thực vật, sau đó là sữa rửa mặt dịu nhẹ và nước cân bằng không cồn. Loại bỏ hoàn toàn mọi lớp trang điểm, bụi bẩn và dầu thừa mà không gây khô da. Kết thúc với xịt khoáng dưỡng ẩm.', 250000, 30, 'https://i.imgur.com/Wj7B3FF.jpg', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services LIMIT 1);

-- Thêm các dịch vụ khác với thông tin chi tiết - chỉ chèn nếu bảng trống
INSERT INTO services (id, name, description, price, duration, image_url, is_active, created_at, updated_at)
SELECT UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000006'), 'Massage toàn thân', 'Liệu pháp massage toàn thân kết hợp các kỹ thuật Thái, Bali và Thụy Điển, sử dụng tinh dầu thiên nhiên. Giúp giải tỏa căng thẳng, thúc đẩy tuần hoàn máu và phục hồi năng lượng. Đặc biệt tốt cho người thường xuyên ngồi máy tính hoặc bị đau mỏi vai gáy.', 400000, 60, 'https://i.imgur.com/9k9TgQA.jpg', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services LIMIT 1);

INSERT INTO services (id, name, description, price, duration, image_url, is_active, created_at, updated_at)
SELECT UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000007'), 'Chăm sóc móng tay', 'Chăm sóc móng tay chuyên nghiệp, bao gồm ngâm, tẩy da chết, cắt và tạo hình móng, đẩy lui lớp biểu bì và massage nhẹ nhàng. Sử dụng các sản phẩm hữu cơ và dầu dưỡng thiên nhiên giúp móng khỏe mạnh và tự nhiên.', 200000, 30, 'https://i.imgur.com/9P0mcTb.jpg', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services LIMIT 1);

INSERT INTO services (id, name, description, price, duration, image_url, is_active, created_at, updated_at)
SELECT UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000008'), 'Chăm sóc móng chân', 'Liệu trình chăm sóc toàn diện cho bàn chân mệt mỏi, bao gồm ngâm chân với tinh dầu bạc hà, tẩy da chết vùng gót, cắt và tạo hình móng, kết hợp với massage phản xạ. Giúp lưu thông khí huyết và thư giãn toàn thân.', 250000, 40, 'https://i.imgur.com/AXITRiZ.jpg', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services LIMIT 1);

INSERT INTO services (id, name, description, price, duration, image_url, is_active, created_at, updated_at)
SELECT UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000009'), 'Tạo kiểu tóc', 'Dịch vụ tạo kiểu tóc từ các chuyên gia hàng đầu, tư vấn phong cách phù hợp với gương mặt và phong cách cá nhân. Sử dụng các sản phẩm tạo kiểu cao cấp, không gây hại cho tóc và giữ nếp lâu.', 300000, 45, 'https://i.imgur.com/KQa1ajC.jpg', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services LIMIT 1);

INSERT INTO services (id, name, description, price, duration, image_url, is_active, created_at, updated_at)
SELECT UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000010'), 'Tạo hình lông mày', 'Tạo hình lông mày theo phương pháp cân đối khuôn mặt, sử dụng chì kẻ tự nhiên và nhuộm lông mày an toàn. Giúp định hình khuôn mặt và tạo vẻ đẹp hài hòa, phù hợp với từng khách hàng.', 150000, 20, 'https://i.imgur.com/RrFtOFW.jpg', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services LIMIT 1);

-- Chèn dữ liệu mẫu cho bảng service_categories - chỉ chèn nếu bảng trống
INSERT INTO service_categories (id, name, code, description, is_active, created_at, updated_at)
SELECT UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000001'), 'Chăm sóc da', 'SKIN_CARE', 'Các dịch vụ chăm sóc da cơ bản và chuyên sâu', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM service_categories LIMIT 1);

INSERT INTO service_categories (id, name, code, description, is_active, created_at, updated_at)
SELECT UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000002'), 'Điều trị da', 'SKIN_TREATMENT', 'Các dịch vụ điều trị da chuyên sâu', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM service_categories LIMIT 1);

INSERT INTO service_categories (id, name, code, description, is_active, created_at, updated_at)
SELECT UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000003'), 'Trẻ hóa', 'REJUVENATION', 'Các dịch vụ trẻ hóa da và chống lão hóa', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM service_categories LIMIT 1);

INSERT INTO service_categories (id, name, code, description, is_active, created_at, updated_at)
SELECT UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000004'), 'Massage', 'MASSAGE', 'Các dịch vụ massage mặt và cơ thể', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM service_categories LIMIT 1);

INSERT INTO service_categories (id, name, code, description, is_active, created_at, updated_at)
SELECT UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000005'), 'Làm đẹp', 'BEAUTY', 'Các dịch vụ làm đẹp khác', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM service_categories LIMIT 1);

-- Cập nhật category_id cho các dịch vụ hiện có
UPDATE services SET category_id = UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000001') WHERE id = UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000001');
UPDATE services SET category_id = UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000002') WHERE id = UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000002');
UPDATE services SET category_id = UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000003') WHERE id = UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000003');
UPDATE services SET category_id = UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000004') WHERE id = UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000004');
UPDATE services SET category_id = UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000001') WHERE id = UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000005');
UPDATE services SET category_id = UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000004') WHERE id = UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000006');
UPDATE services SET category_id = UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000005') WHERE id = UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000007');
UPDATE services SET category_id = UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000005') WHERE id = UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000008');
UPDATE services SET category_id = UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000005') WHERE id = UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000009');
UPDATE services SET category_id = UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000005') WHERE id = UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000010'); 