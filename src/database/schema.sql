-- Database schema for First Step Public School Management System

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Classes table
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    grade VARCHAR(10) NOT NULL,
    section VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Address table
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Medical Info table
CREATE TABLE medical_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blood_group VARCHAR(10),
    allergies TEXT[],
    medical_conditions TEXT[],
    medications TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Parents table
CREATE TABLE parents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    father_name VARCHAR(255),
    father_occupation VARCHAR(255),
    father_phone VARCHAR(20),
    father_email VARCHAR(255),
    mother_name VARCHAR(255),
    mother_occupation VARCHAR(255),
    mother_phone VARCHAR(20),
    mother_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Emergency Contacts table
CREATE TABLE emergency_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    alternate_phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Documents table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    birth_certificate_url VARCHAR(255),
    previous_school_records_url VARCHAR(255),
    medical_records_url VARCHAR(255),
    photo_id_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Academic Info table
CREATE TABLE academic_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    previous_school VARCHAR(255),
    previous_class VARCHAR(50),
    academic_year VARCHAR(20),
    admission_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Transportation table
CREATE TABLE transportation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bus_number VARCHAR(20),
    route_number VARCHAR(20),
    pickup_point VARCHAR(255),
    drop_point VARCHAR(255),
    pickup_time TIME,
    drop_time TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Students table
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    roll_no VARCHAR(20) UNIQUE NOT NULL,
    class_id UUID REFERENCES classes(id),
    class_name VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    blood_group VARCHAR(10),
    address_id UUID REFERENCES addresses(id),
    house VARCHAR(50),
    photo_url VARCHAR(255),
    medical_info_id UUID REFERENCES medical_info(id),
    parents_id UUID REFERENCES parents(id),
    emergency_contact_id UUID REFERENCES emergency_contacts(id),
    documents_id UUID REFERENCES documents(id),
    academic_info_id UUID REFERENCES academic_info(id),
    transportation_id UUID REFERENCES transportation(id),
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fees table
CREATE TABLE fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id),
    fee_name VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) DEFAULT 0,
    due_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    paid_date DATE,
    receipt_number VARCHAR(50),
    receipt_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users table for authentication
CREATE TABLE Users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert admin user (password should be hashed in production)
INSERT INTO Users (name, email, password, role)
VALUES ('Admin', 'admin@school.com', '$2b$10$5dwsS5snIRlKu8ka5r5UhuM5E6STqxYpqgP9hV.1XwYf2s8m9T8ke', 'admin');

-- Insert test data

-- Test Classes
INSERT INTO classes (id, name, grade, section)
VALUES 
    ('11111111-1111-1111-1111-111111111111', '6A', '6', 'A'),
    ('22222222-2222-2222-2222-222222222222', '4B', '4', 'B');

-- Test Address
INSERT INTO addresses (id, street, city, state, zip_code)
VALUES 
    ('11111111-1111-1111-1111-111111111111', '123 Main St', 'Delhi', 'Delhi', '110001'),
    ('22222222-2222-2222-2222-222222222222', '456 Park Road', 'Delhi', 'Delhi', '110002');

-- Test Medical Info
INSERT INTO medical_info (id, blood_group, allergies, medical_conditions, medications)
VALUES 
    ('33333333-3333-3333-3333-333333333333', 'B+', ARRAY['Peanuts'], ARRAY['None'], ARRAY['None']),
    ('44444444-4444-4444-4444-444444444444', 'O+', ARRAY['None'], ARRAY['Asthma'], ARRAY['Inhaler']);

-- Test Parents
INSERT INTO parents (id, father_name, father_occupation, father_phone, father_email, mother_name, mother_occupation, mother_phone, mother_email)
VALUES 
    ('55555555-5555-5555-5555-555555555555', 'Rajesh Kumar', 'Business', '9876543210', 'rajesh@email.com', 'Priya Kumar', 'Teacher', '9876543211', 'priya@email.com'),
    ('66666666-6666-6666-6666-666666666666', 'Amit Singh', 'Engineer', '9876543212', 'amit@email.com', 'Neha Singh', 'Doctor', '9876543213', 'neha@email.com');

-- Test Emergency Contacts
INSERT INTO emergency_contacts (id, name, relationship, phone, alternate_phone)
VALUES 
    ('77777777-7777-7777-7777-777777777777', 'Suresh Kumar', 'Uncle', '9876543214', '9876543215'),
    ('88888888-8888-8888-8888-888888888888', 'Meena Singh', 'Aunt', '9876543216', '9876543217');

-- Test Documents
INSERT INTO documents (id, birth_certificate_url, previous_school_records_url, medical_records_url, photo_id_url)
VALUES 
    ('99999999-9999-9999-9999-999999999999', 'https://storage/birth_cert_1.pdf', 'https://storage/school_records_1.pdf', 'https://storage/medical_1.pdf', 'https://storage/photo_1.jpg'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'https://storage/birth_cert_2.pdf', 'https://storage/school_records_2.pdf', 'https://storage/medical_2.pdf', 'https://storage/photo_2.jpg');

-- Test Academic Info
INSERT INTO academic_info (id, previous_school, previous_class, academic_year, admission_date)
VALUES 
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Delhi Public School', '5th', '2023-2024', '2023-04-01'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Ryan International', '3rd', '2023-2024', '2023-04-01');

-- Test Transportation
INSERT INTO transportation (id, bus_number, route_number, pickup_point, drop_point, pickup_time, drop_time)
VALUES 
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'BUS001', 'R1', 'Sector 1', 'School', '07:30:00', '14:30:00'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'BUS002', 'R2', 'Sector 2', 'School', '07:45:00', '14:45:00');

-- Test Students
INSERT INTO students (
    id, first_name, last_name, roll_no, class_id, class_name, date_of_birth, gender,
    blood_group, address_id, house, photo_url, medical_info_id, parents_id,
    emergency_contact_id, documents_id, academic_info_id, transportation_id
)
VALUES 
    (
        uuid_generate_v4(),
        'Rahul', 'Kumar', 'R001',
        '11111111-1111-1111-1111-111111111111', '6A',
        '2012-05-15', 'Male', 'B+',
        '11111111-1111-1111-1111-111111111111', 'Blue',
        'https://storage/student_photo_1.jpg',
        '33333333-3333-3333-3333-333333333333',
        '55555555-5555-5555-5555-555555555555',
        '77777777-7777-7777-7777-777777777777',
        '99999999-9999-9999-9999-999999999999',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'dddddddd-dddd-dddd-dddd-dddddddddddd'
    ),
    (
        uuid_generate_v4(),
        'Priya', 'Singh', 'R002',
        '22222222-2222-2222-2222-222222222222', '4B',
        '2014-08-20', 'Female', 'O+',
        '22222222-2222-2222-2222-222222222222', 'Red',
        'https://storage/student_photo_2.jpg',
        '44444444-4444-4444-4444-444444444444',
        '66666666-6666-6666-6666-666666666666',
        '88888888-8888-8888-8888-888888888888',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'
    );

-- Test Fees
INSERT INTO fees (id, student_id, fee_name, amount, amount_paid, due_date, status, paid_date, receipt_number, receipt_url)
VALUES 
    (
        uuid_generate_v4(),
        (SELECT id FROM students WHERE roll_no = 'R001'),
        'Tuition Fee Q1',
        25000.00,
        25000.00,
        '2023-04-10',
        'PAID',
        '2023-04-05',
        'REC001',
        'https://storage/receipt_1.pdf'
    ),
    (
        uuid_generate_v4(),
        (SELECT id FROM students WHERE roll_no = 'R002'),
        'Tuition Fee Q1',
        25000.00,
        0.00,
        '2023-04-10',
        'PENDING',
        NULL,
        NULL,
        NULL
    );
