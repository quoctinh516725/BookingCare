-- This is a placeholder SQL statement to prevent the script from being empty
SELECT 1;

-- You can add initial data here if needed
-- For example:
-- INSERT INTO treatment (id, status, created_at) VALUES ('init-treatment', 'PENDING', NOW()); 

-- Add users with different roles (passwords are bcrypt hashed)
-- Admin user (password: admin123)
INSERT INTO users (id, username, password, email, firstName, lastName, role, active, createdAt, updatedAt) 
VALUES ('admin-user-id', 'admin', '$2a$10$6Q527Bv9ao.fA6.4Gj6pju/AWRk5HlRtdF9hYWMh7S5J5quNqJ9wy', 'admin@beautifulcare.com', 'Admin', 'User', 'ADMIN', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE username = 'admin';

-- Specialist user (password: specialist123)
INSERT INTO users (id, username, password, email, firstName, lastName, role, active, createdAt, updatedAt) 
VALUES ('specialist-user-id', 'specialist', '$2a$10$z5jOHVSfI1NCixg5MpkVQeWD/pVnzHu.O1EdEZ.H2LxwjANj0ZwY2', 'specialist@beautifulcare.com', 'Specialist', 'User', 'SPECIALIST', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE username = 'specialist';

-- Customer user (password: customer123)
INSERT INTO users (id, username, password, email, firstName, lastName, role, active, createdAt, updatedAt) 
VALUES ('customer-user-id', 'customer', '$2a$10$xVqYyg1U76jEBtIXx7XnfuoRQl8aS5Q3JrzV0LOuM/BTuP8QKz2ma', 'customer@beautifulcare.com', 'Customer', 'User', 'CUSTOMER', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE username = 'customer';

-- Content Creator user (password: content123)
INSERT INTO users (id, username, password, email, firstName, lastName, role, active, createdAt, updatedAt) 
VALUES ('content-user-id', 'content', '$2a$10$YNmtX0ciPtZ.KyMJ4tMsUOwq2GkZWyr/d7ab/vYxY9EGgETJXGHNu', 'content@beautifulcare.com', 'Content', 'Creator', 'CONTENT_CREATOR', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE username = 'content';

-- Add service categories
INSERT INTO service_category (id, name, description, created_at, updated_at)
VALUES ('cat1', 'Facial Treatments', 'All facial treatment services', NOW(), NOW())
ON DUPLICATE KEY UPDATE name = 'Facial Treatments';

INSERT INTO service_category (id, name, description, created_at, updated_at)
VALUES ('cat2', 'Body Treatments', 'All body treatment services', NOW(), NOW())
ON DUPLICATE KEY UPDATE name = 'Body Treatments';

-- Add sample services
INSERT INTO service_entity (id, name, description, price, duration, category_id)
VALUES ('serv1', 'Basic Facial', 'A refreshing facial treatment for all skin types', 150.00, 60, 'cat1')
ON DUPLICATE KEY UPDATE name = 'Basic Facial';

INSERT INTO service_entity (id, name, description, price, duration, category_id)
VALUES ('serv2', 'Deep Cleansing Facial', 'Deep pore cleansing facial with extraction', 200.00, 90, 'cat1')
ON DUPLICATE KEY UPDATE name = 'Deep Cleansing Facial';

INSERT INTO service_entity (id, name, description, price, duration, category_id)
VALUES ('serv3', 'Body Scrub', 'Full body scrub treatment with natural ingredients', 250.00, 120, 'cat2')
ON DUPLICATE KEY UPDATE name = 'Body Scrub'; 