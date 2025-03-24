-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS skincarebeauti;
USE skincarebeauti;

-- Drop table statements are commented out to preserve data between application restarts
-- If you need to reset the database, uncomment these statements
/*
-- Drop dependent tables first - ordered to respect foreign key constraints
-- Start with child tables (those with foreign keys)
DROP TABLE IF EXISTS treatment_result_images;
DROP TABLE IF EXISTS treatment_product_recommendations;
DROP TABLE IF EXISTS treatment_services;
DROP TABLE IF EXISTS treatment_result;
DROP TABLE IF EXISTS treatment;
DROP TABLE IF EXISTS payment;  -- Payment has FK to booking
DROP TABLE IF EXISTS booking_detail;  -- Booking detail has FK to booking
DROP TABLE IF EXISTS rating;
DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS notification;
DROP TABLE IF EXISTS skin_test_result;
DROP TABLE IF EXISTS skin_test_option;
DROP TABLE IF EXISTS skin_test_question;
DROP TABLE IF EXISTS blogs;  -- Changed from 'blog' to 'blogs' to match CREATE statement
-- Now drop tables with less dependencies
DROP TABLE IF EXISTS booking;  -- Now booking can be dropped after its dependents
DROP TABLE IF EXISTS work_schedule; -- Must drop before specialists
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS specialists;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS service_entity;
DROP TABLE IF EXISTS service_category;
DROP TABLE IF EXISTS skin_test;
DROP TABLE IF EXISTS blog_categories;
*/

-- Create tables in the correct order (base tables first)

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    firstName VARCHAR(255),
    lastName VARCHAR(255),
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL,
    dob DATE,
    avatar VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Customer table - extends User
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(36) PRIMARY KEY,
    address VARCHAR(255),
    skinType VARCHAR(50),
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

-- Specialist table - extends User
CREATE TABLE IF NOT EXISTS specialists (
    id VARCHAR(36) PRIMARY KEY,
    bio TEXT,
    expertise VARCHAR(255),
    yearsOfExperience INT,
    certifications VARCHAR(255),
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

-- Work schedule for specialists
CREATE TABLE IF NOT EXISTS work_schedule (
    id VARCHAR(36) PRIMARY KEY,
    specialist_id VARCHAR(36) NOT NULL,
    day_of_week INT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    FOREIGN KEY (specialist_id) REFERENCES specialists(id)
);

-- Service categories
CREATE TABLE IF NOT EXISTS service_category (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Services
CREATE TABLE IF NOT EXISTS service_entity (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration INT,
    image_url VARCHAR(255),
    category_id VARCHAR(36),
    FOREIGN KEY (category_id) REFERENCES service_category(id)
);

-- Blog categories
CREATE TABLE IF NOT EXISTS blog_categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Blogs
CREATE TABLE IF NOT EXISTS blogs (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    image_url VARCHAR(255),
    slug VARCHAR(255),
    published BOOLEAN DEFAULT FALSE,
    category_id VARCHAR(36),
    author_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES blog_categories(id),
    FOREIGN KEY (author_id) REFERENCES users(id)
);

-- Skin tests
CREATE TABLE IF NOT EXISTS skin_test (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Skin test questions
CREATE TABLE IF NOT EXISTS skin_test_question (
    id VARCHAR(36) PRIMARY KEY,
    test_id VARCHAR(36) NOT NULL,
    question_text TEXT NOT NULL,
    order_index INT,
    FOREIGN KEY (test_id) REFERENCES skin_test(id)
);

-- Skin test options
CREATE TABLE IF NOT EXISTS skin_test_option (
    id VARCHAR(36) PRIMARY KEY,
    question_id VARCHAR(36) NOT NULL,
    option_text TEXT NOT NULL,
    skin_type_value VARCHAR(50),
    order_index INT,
    FOREIGN KEY (question_id) REFERENCES skin_test_question(id)
);

-- Skin test results
CREATE TABLE IF NOT EXISTS skin_test_result (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    test_id VARCHAR(36) NOT NULL,
    result_text TEXT,
    skin_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (test_id) REFERENCES skin_test(id)
);

-- Bookings
CREATE TABLE IF NOT EXISTS booking (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    specialist_id VARCHAR(36),
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (specialist_id) REFERENCES specialists(id)
);

-- Booking details
CREATE TABLE IF NOT EXISTS booking_detail (
    id VARCHAR(36) PRIMARY KEY,
    booking_id VARCHAR(36) NOT NULL,
    service_id VARCHAR(36) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES booking(id),
    FOREIGN KEY (service_id) REFERENCES service_entity(id)
);

-- Payments
CREATE TABLE IF NOT EXISTS payment (
    id VARCHAR(36) PRIMARY KEY,
    booking_id VARCHAR(36) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    status VARCHAR(20),
    transaction_id VARCHAR(255),
    payment_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES booking(id)
);

-- Treatments
CREATE TABLE IF NOT EXISTS treatment (
    id VARCHAR(36) PRIMARY KEY,
    booking_id VARCHAR(36),
    specialist_id VARCHAR(36),
    note TEXT,
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES booking(id),
    FOREIGN KEY (specialist_id) REFERENCES users(id)
);

-- Treatment services junction table
CREATE TABLE IF NOT EXISTS treatment_services (
    treatment_id VARCHAR(36) NOT NULL,
    service_id VARCHAR(36) NOT NULL,
    PRIMARY KEY (treatment_id, service_id),
    FOREIGN KEY (treatment_id) REFERENCES treatment(id),
    FOREIGN KEY (service_id) REFERENCES service_entity(id)
);

-- Treatment results
CREATE TABLE IF NOT EXISTS treatment_result (
    id VARCHAR(36) PRIMARY KEY,
    treatment_id VARCHAR(36),
    description TEXT NOT NULL,
    recommendations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (treatment_id) REFERENCES treatment(id)
);

-- Treatment result images
CREATE TABLE IF NOT EXISTS treatment_result_images (
    result_id VARCHAR(36) NOT NULL,
    image_url VARCHAR(255),
    FOREIGN KEY (result_id) REFERENCES treatment_result(id)
);

-- Treatment product recommendations
CREATE TABLE IF NOT EXISTS treatment_product_recommendations (
    result_id VARCHAR(36) NOT NULL,
    product_recommendation VARCHAR(255),
    FOREIGN KEY (result_id) REFERENCES treatment_result(id)
);

-- Ratings and reviews
CREATE TABLE IF NOT EXISTS rating (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    service_id VARCHAR(36),
    specialist_id VARCHAR(36),
    rating_value INT NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (service_id) REFERENCES service_entity(id),
    FOREIGN KEY (specialist_id) REFERENCES specialists(id)
);

-- Feedback
CREATE TABLE IF NOT EXISTS feedback (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notification (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
); 