-- Xóa dữ liệu hiện có (nếu có)
SET FOREIGN_KEY_CHECKS = 0;

-- TRUNCATE TABLE refresh_tokens;
-- TRUNCATE TABLE feedbacks;
-- TRUNCATE TABLE booking_services;
-- TRUNCATE TABLE bookings;
-- TRUNCATE TABLE services;
-- TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

-- Chèn dữ liệu mẫu vào bảng users nếu chưa tồn tại
INSERT INTO users (id, first_name, last_name, email, password, phone, role, created_at, updated_at)
SELECT UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000001'), 'Admin', 'User', 'admin@example.com', '$2a$10$6lw1ojmNxlT/guWQP27fyuD/T4XgEpkTAmiVmWbzKKKBBr8y.c7Ie', '+84987654321', 'ADMIN', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000001'));

INSERT INTO users (id, first_name, last_name, email, password, phone, role, created_at, updated_at)
SELECT UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000002'), 'Staff', 'One', 'staff1@example.com', '$2a$10$6lw1ojmNxlT/guWQP27fyuD/T4XgEpkTAmiVmWbzKKKBBr8y.c7Ie', '+84912345678', 'STAFF', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000002'));

INSERT INTO users (id, first_name, last_name, email, password, phone, role, created_at, updated_at)
SELECT UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000003'), 'Staff', 'Two', 'staff2@example.com', '$2a$10$6lw1ojmNxlT/guWQP27fyuD/T4XgEpkTAmiVmWbzKKKBBr8y.c7Ie', '+84912345679', 'STAFF', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000003'));

INSERT INTO users (id, first_name, last_name, email, password, phone, role, created_at, updated_at)
SELECT UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000004'), 'John', 'Doe', 'john@example.com', '$2a$10$6lw1ojmNxlT/guWQP27fyuD/T4XgEpkTAmiVmWbzKKKBBr8y.c7Ie', '+84912345680', 'CUSTOMER', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000004'));

INSERT INTO users (id, first_name, last_name, email, password, phone, role, created_at, updated_at)
SELECT UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000005'), 'Jane', 'Smith', 'jane@example.com', '$2a$10$6lw1ojmNxlT/guWQP27fyuD/T4XgEpkTAmiVmWbzKKKBBr8y.c7Ie', '+84912345681', 'CUSTOMER', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000005'));

INSERT INTO users (id, first_name, last_name, email, password, phone, role, created_at, updated_at)
SELECT UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000006'), 'Alice', 'Johnson', 'alice@example.com', '$2a$10$6lw1ojmNxlT/guWQP27fyuD/T4XgEpkTAmiVmWbzKKKBBr8y.c7Ie', '+84912345682', 'CUSTOMER', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000006'));

INSERT INTO users (id, first_name, last_name, email, password, phone, role, created_at, updated_at)
SELECT UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000007'), 'Bob', 'Brown', 'bob@example.com', '$2a$10$6lw1ojmNxlT/guWQP27fyuD/T4XgEpkTAmiVmWbzKKKBBr8y.c7Ie', '+84912345683', 'CUSTOMER', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000007'));

INSERT INTO users (id, first_name, last_name, email, password, phone, role, created_at, updated_at)
SELECT UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000008'), 'Emma', 'Davis', 'emma@example.com', '$2a$10$6lw1ojmNxlT/guWQP27fyuD/T4XgEpkTAmiVmWbzKKKBBr8y.c7Ie', '+84912345684', 'CUSTOMER', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000008'));

-- Lưu ý: Mật khẩu được mã hóa là 'password'

-- Chèn dữ liệu mẫu vào bảng services nếu chưa tồn tại
INSERT INTO services (id, name, description, price, duration, image_url, is_active, created_at, updated_at)
SELECT UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000001'), 'Facial Treatment', 'Comprehensive facial treatment for all skin types', 500000, 60, 'https://example.com/images/facial.jpg', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services WHERE id = UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000001'));

INSERT INTO services (id, name, description, price, duration, image_url, is_active, created_at, updated_at)
SELECT UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000002'), 'Deep Cleansing', 'Deep cleansing to remove impurities and unclog pores', 350000, 45, 'https://example.com/images/cleansing.jpg', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services WHERE id = UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000002'));

INSERT INTO services (id, name, description, price, duration, image_url, is_active, created_at, updated_at)
SELECT UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000003'), 'Anti-Aging Treatment', 'Advanced anti-aging treatment to reduce fine lines and wrinkles', 650000, 75, 'https://example.com/images/antiaging.jpg', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services WHERE id = UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000003'));

INSERT INTO services (id, name, description, price, duration, image_url, is_active, created_at, updated_at)
SELECT UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000004'), 'Acne Treatment', 'Specialized treatment for acne-prone skin', 450000, 50, 'https://example.com/images/acne.jpg', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services WHERE id = UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000004'));

INSERT INTO services (id, name, description, price, duration, image_url, is_active, created_at, updated_at)
SELECT UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000005'), 'Brightening Facial', 'Brightening and evening out skin tone', 550000, 60, 'https://example.com/images/brightening.jpg', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services WHERE id = UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000005'));

INSERT INTO services (id, name, description, price, duration, image_url, is_active, created_at, updated_at)
SELECT UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000006'), 'Relaxing Massage', 'Full body relaxing massage', 400000, 60, 'https://example.com/images/massage.jpg', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services WHERE id = UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000006'));

INSERT INTO services (id, name, description, price, duration, image_url, is_active, created_at, updated_at)
SELECT UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000007'), 'Manicure', 'Professional nail care for hands', 200000, 30, 'https://example.com/images/manicure.jpg', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services WHERE id = UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000007'));

INSERT INTO services (id, name, description, price, duration, image_url, is_active, created_at, updated_at)
SELECT UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000008'), 'Pedicure', 'Professional nail care for feet', 250000, 40, 'https://example.com/images/pedicure.jpg', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services WHERE id = UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000008'));

INSERT INTO services (id, name, description, price, duration, image_url, is_active, created_at, updated_at)
SELECT UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000009'), 'Hair Styling', 'Professional hair styling service', 300000, 45, 'https://example.com/images/hairstyling.jpg', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services WHERE id = UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000009'));

INSERT INTO services (id, name, description, price, duration, image_url, is_active, created_at, updated_at)
SELECT UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000010'), 'Eyebrow Shaping', 'Professional eyebrow shaping and tinting', 150000, 20, 'https://example.com/images/eyebrow.jpg', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services WHERE id = UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000010'));

-- Chèn dữ liệu mẫu vào bảng bookings (đặt lịch) nếu chưa tồn tại
INSERT INTO bookings (id, customer_id, staff_id, appointment_time, status, notes, total_price, created_at, updated_at)
SELECT UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000001'), UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000004'), UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000002'), DATE_SUB(NOW(), INTERVAL 7 DAY) + INTERVAL 10 HOUR, 'COMPLETED', 'Please use gentle products for sensitive skin', 500000, DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY)
WHERE NOT EXISTS (SELECT 1 FROM bookings WHERE id = UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000001'));

INSERT INTO bookings (id, customer_id, staff_id, appointment_time, status, notes, total_price, created_at, updated_at)
SELECT UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000002'), UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000005'), UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000003'), DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 14 HOUR, 'COMPLETED', NULL, 650000, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)
WHERE NOT EXISTS (SELECT 1 FROM bookings WHERE id = UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000002'));

INSERT INTO bookings (id, customer_id, staff_id, appointment_time, status, notes, total_price, created_at, updated_at)
SELECT UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000003'), UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000006'), UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000002'), DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 16 HOUR, 'CANCELLED', 'Had a family emergency', 450000, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY)
WHERE NOT EXISTS (SELECT 1 FROM bookings WHERE id = UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000003'));

INSERT INTO bookings (id, customer_id, staff_id, appointment_time, status, notes, total_price, created_at, updated_at)
SELECT UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000004'), UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000007'), NULL, DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 11 HOUR, 'NO_SHOW', NULL, 550000, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)
WHERE NOT EXISTS (SELECT 1 FROM bookings WHERE id = UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000004'));

INSERT INTO bookings (id, customer_id, staff_id, appointment_time, status, notes, total_price, created_at, updated_at)
SELECT UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000005'), UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000004'), UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000003'), DATE_ADD(NOW(), INTERVAL 1 DAY) + INTERVAL 13 HOUR, 'CONFIRMED', 'Prefer female staff', 750000, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)
WHERE NOT EXISTS (SELECT 1 FROM bookings WHERE id = UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000005'));

INSERT INTO bookings (id, customer_id, staff_id, appointment_time, status, notes, total_price, created_at, updated_at)
SELECT UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000006'), UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000005'), UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000002'), DATE_ADD(NOW(), INTERVAL 2 DAY) + INTERVAL 15 HOUR, 'CONFIRMED', NULL, 600000, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)
WHERE NOT EXISTS (SELECT 1 FROM bookings WHERE id = UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000006'));

INSERT INTO bookings (id, customer_id, staff_id, appointment_time, status, notes, total_price, created_at, updated_at)
SELECT UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000007'), UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000006'), NULL, DATE_ADD(NOW(), INTERVAL 3 DAY) + INTERVAL 10 HOUR, 'PENDING', 'First time customer', 450000, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM bookings WHERE id = UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000007'));

INSERT INTO bookings (id, customer_id, staff_id, appointment_time, status, notes, total_price, created_at, updated_at)
SELECT UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000008'), UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000007'), UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000003'), DATE_ADD(NOW(), INTERVAL 4 DAY) + INTERVAL 14 HOUR, 'PENDING', NULL, 850000, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM bookings WHERE id = UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000008'));

INSERT INTO bookings (id, customer_id, staff_id, appointment_time, status, notes, total_price, created_at, updated_at)
SELECT UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000009'), UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000008'), UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000002'), DATE_ADD(NOW(), INTERVAL 5 DAY) + INTERVAL 16 HOUR, 'PENDING', 'Allergic to nuts', 500000, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM bookings WHERE id = UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000009'));

-- Chèn dữ liệu mẫu vào bảng booking_services (quan hệ nhiều-nhiều giữa bookings và services) nếu chưa tồn tại
INSERT INTO booking_services (booking_id, service_id)
SELECT UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000001'), UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000001')
WHERE NOT EXISTS (
    SELECT 1 FROM booking_services 
    WHERE booking_id = UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000001') 
    AND service_id = UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000001')
);

INSERT INTO booking_services (booking_id, service_id)
SELECT UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000002'), UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000003')
WHERE NOT EXISTS (
    SELECT 1 FROM booking_services 
    WHERE booking_id = UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000002') 
    AND service_id = UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000003')
);

INSERT INTO booking_services (booking_id, service_id)
SELECT UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000003'), UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000004')
WHERE NOT EXISTS (
    SELECT 1 FROM booking_services 
    WHERE booking_id = UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000003') 
    AND service_id = UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000004')
);

INSERT INTO booking_services (booking_id, service_id)
SELECT UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000004'), UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000005')
WHERE NOT EXISTS (
    SELECT 1 FROM booking_services 
    WHERE booking_id = UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000004') 
    AND service_id = UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000005')
);

INSERT INTO booking_services (booking_id, service_id)
SELECT UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000005'), UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000001')
WHERE NOT EXISTS (
    SELECT 1 FROM booking_services 
    WHERE booking_id = UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000005') 
    AND service_id = UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000001')
);

INSERT INTO booking_services (booking_id, service_id)
SELECT UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000005'), UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000006')
WHERE NOT EXISTS (
    SELECT 1 FROM booking_services 
    WHERE booking_id = UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000005') 
    AND service_id = UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000006')
);

INSERT INTO booking_services (booking_id, service_id)
SELECT UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000006'), UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000002')
WHERE NOT EXISTS (
    SELECT 1 FROM booking_services 
    WHERE booking_id = UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000006') 
    AND service_id = UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000002')
);

INSERT INTO booking_services (booking_id, service_id)
SELECT UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000006'), UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000005')
WHERE NOT EXISTS (
    SELECT 1 FROM booking_services 
    WHERE booking_id = UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000006') 
    AND service_id = UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000005')
);

INSERT INTO booking_services (booking_id, service_id)
SELECT UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000007'), UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000004')
WHERE NOT EXISTS (
    SELECT 1 FROM booking_services 
    WHERE booking_id = UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000007') 
    AND service_id = UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000004')
);

INSERT INTO booking_services (booking_id, service_id)
SELECT UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000008'), UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000001')
WHERE NOT EXISTS (
    SELECT 1 FROM booking_services 
    WHERE booking_id = UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000008') 
    AND service_id = UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000001')
);

INSERT INTO booking_services (booking_id, service_id)
SELECT UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000008'), UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000003')
WHERE NOT EXISTS (
    SELECT 1 FROM booking_services 
    WHERE booking_id = UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000008') 
    AND service_id = UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000003')
);

INSERT INTO booking_services (booking_id, service_id)
SELECT UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000009'), UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000001')
WHERE NOT EXISTS (
    SELECT 1 FROM booking_services 
    WHERE booking_id = UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000009') 
    AND service_id = UUID_TO_BIN('b1b2c3d4-e5f6-11ec-8000-000000000001')
);

-- Thêm phản hồi mẫu (feedbacks)
INSERT INTO feedbacks (id, booking_id, customer_id, rating, comment, created_at, updated_at)
SELECT UUID_TO_BIN('d1b2c3d4-e5f6-11ec-8000-000000000001'), UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000001'), UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000004'), 5, 'Excellent service! My skin feels amazing after the treatment.', DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY)
WHERE NOT EXISTS (SELECT 1 FROM feedbacks WHERE id = UUID_TO_BIN('d1b2c3d4-e5f6-11ec-8000-000000000001'));

INSERT INTO feedbacks (id, booking_id, customer_id, rating, comment, created_at, updated_at)
SELECT UUID_TO_BIN('d1b2c3d4-e5f6-11ec-8000-000000000002'), UUID_TO_BIN('c1b2c3d4-e5f6-11ec-8000-000000000002'), UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000005'), 4, 'Great anti-aging treatment. Would recommend to others.', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)
WHERE NOT EXISTS (SELECT 1 FROM feedbacks WHERE id = UUID_TO_BIN('d1b2c3d4-e5f6-11ec-8000-000000000002'));

-- Chèn dữ liệu mẫu vào bảng refresh_tokens nếu chưa tồn tại
INSERT INTO refresh_tokens (id, token, user_id, expires_at, is_valid, created_at, updated_at)
SELECT UUID_TO_BIN('e1b2c3d4-e5f6-11ec-8000-000000000001'), 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkBleGFtcGxlLmNvbSIsImlhdCI6MTY4NjgyNDcxNywiZXhwIjoxNjg3NDI5NTE3fQ.nYwIiGGM_y1ynjAH0_xt9vSxfH', UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000001'), DATE_ADD(NOW(), INTERVAL 7 DAY), 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM refresh_tokens WHERE id = UUID_TO_BIN('e1b2c3d4-e5f6-11ec-8000-000000000001'));

INSERT INTO refresh_tokens (id, token, user_id, expires_at, is_valid, created_at, updated_at)
SELECT UUID_TO_BIN('e1b2c3d4-e5f6-11ec-8000-000000000002'), 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huQGV4YW1wbGUuY29tIiwiaWF0IjoxNjg2ODI0NzE3LCJleHAiOjE2ODc0Mjk1MTd9.dv-pu14qzFxR-t-OYX', UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000004'), DATE_ADD(NOW(), INTERVAL 7 DAY), 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM refresh_tokens WHERE id = UUID_TO_BIN('e1b2c3d4-e5f6-11ec-8000-000000000002'));

INSERT INTO refresh_tokens (id, token, user_id, expires_at, is_valid, created_at, updated_at)
SELECT UUID_TO_BIN('e1b2c3d4-e5f6-11ec-8000-000000000003'), 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqYW5lQGV4YW1wbGUuY29tIiwiaWF0IjoxNjg2ODI0NzE3LCJleHAiOjE2ODc0Mjk1MTd9.g8TmrAgTgU-s6NbV5q', UUID_TO_BIN('a1b2c3d4-e5f6-11ec-8000-000000000005'), DATE_ADD(NOW(), INTERVAL 7 DAY), 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM refresh_tokens WHERE id = UUID_TO_BIN('e1b2c3d4-e5f6-11ec-8000-000000000003'));

-- Cập nhật sequence các bảng (nếu cần thiết) 