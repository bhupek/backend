-- Database schema for First Step Public School Management System

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Schools table
CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    subscription_id UUID REFERENCES school_subscriptions(id),
    settings JSONB DEFAULT '{}',
    domain_name VARCHAR(255),
    logo_url VARCHAR(255),
    theme_colors JSONB DEFAULT '{"primary": "#1a73e8", "secondary": "#4285f4"}',
    features JSONB DEFAULT '[]'
);

-- Classes table
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    grade VARCHAR(10) NOT NULL,
    section VARCHAR(10) NOT NULL,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
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
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert admin user (password should be hashed in production)
INSERT INTO users (name, email, password, role)
VALUES ('Admin', 'admin@school.com', '$2b$10$5dwsS5snIRlKu8ka5r5UhuM5E6STqxYpqgP9hV.1XwYf2s8m9T8ke', 'admin');

-- Subjects table
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, school_id)
);

-- Insert default subjects (will need to be done per school)
-- This is just an example, actual insertion will be done through the application
INSERT INTO subjects (name, school_id) VALUES 
    ('English', '00000000-0000-0000-0000-000000000000'),
    ('Mathematics', '00000000-0000-0000-0000-000000000000'),
    ('Science', '00000000-0000-0000-0000-000000000000'),
    ('Hindi', '00000000-0000-0000-0000-000000000000'),
    ('Social Studies', '00000000-0000-0000-0000-000000000000');

-- Classwork/Homework entries table
CREATE TABLE class_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('classwork', 'homework')),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    assignment_date DATE NOT NULL,
    description TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Assignment files table
CREATE TABLE assignment_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID NOT NULL REFERENCES class_assignments(id) ON DELETE CASCADE,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Attendance table
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
    remarks TEXT,
    marked_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for attendance table
CREATE INDEX idx_attendance_student_id ON attendance(student_id);
CREATE INDEX idx_attendance_class_id ON attendance(class_id);
CREATE INDEX idx_attendance_school_id ON attendance(school_id);
CREATE INDEX idx_attendance_date ON attendance(date);

-- Create indexes for better query performance
CREATE INDEX idx_class_assignments_class_id ON class_assignments(class_id);
CREATE INDEX idx_class_assignments_subject_id ON class_assignments(subject_id);
CREATE INDEX idx_class_assignments_school_id ON class_assignments(school_id);
CREATE INDEX idx_class_assignments_date ON class_assignments(assignment_date);
CREATE INDEX idx_assignment_files_assignment_id ON assignment_files(assignment_id);
CREATE INDEX idx_assignment_files_school_id ON assignment_files(school_id);
CREATE INDEX idx_subjects_school_id ON subjects(school_id);

-- Subscription Plans table
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    billing_cycle VARCHAR(20) NOT NULL,
    features JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- School Branches table
CREATE TABLE school_branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address_id UUID REFERENCES addresses(id),
    contact_number VARCHAR(20),
    email VARCHAR(255),
    principal_name VARCHAR(255),
    is_main_branch BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- School Subscriptions table
CREATE TABLE school_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    payment_status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Academic Years table
CREATE TABLE academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Departments table
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    head_id UUID REFERENCES users(id),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Staff table
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id),
    employee_id VARCHAR(50) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    joining_date DATE NOT NULL,
    qualification TEXT[],
    experience_years INTEGER,
    salary DECIMAL(10,2),
    address_id UUID REFERENCES addresses(id),
    documents JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Staff Attendance table
CREATE TABLE staff_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    check_in TIME,
    check_out TIME,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Leave Types table
CREATE TABLE leave_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    days_allowed INTEGER NOT NULL,
    is_paid BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Staff Leave table
CREATE TABLE staff_leaves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    leave_type_id UUID NOT NULL REFERENCES leave_types(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(20) NOT NULL,
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Library Books table
CREATE TABLE library_books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(50),
    category VARCHAR(100),
    publisher VARCHAR(255),
    publication_year INTEGER,
    edition VARCHAR(50),
    copies_available INTEGER NOT NULL DEFAULT 0,
    location VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Book Issues table
CREATE TABLE book_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID NOT NULL REFERENCES library_books(id),
    user_id UUID NOT NULL REFERENCES users(id),
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE,
    fine_amount DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles table
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    vehicle_number VARCHAR(50) NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    capacity INTEGER NOT NULL,
    driver_name VARCHAR(255),
    driver_contact VARCHAR(20),
    insurance_expiry DATE,
    service_due_date DATE,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Routes table
CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    route_name VARCHAR(100) NOT NULL,
    vehicle_id UUID REFERENCES vehicles(id),
    stops JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Hostel Buildings table
CREATE TABLE hostel_buildings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    total_rooms INTEGER NOT NULL,
    address_id UUID REFERENCES addresses(id),
    warden_name VARCHAR(255),
    warden_contact VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Hostel Rooms table
CREATE TABLE hostel_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    building_id UUID NOT NULL REFERENCES hostel_buildings(id) ON DELETE CASCADE,
    room_number VARCHAR(50) NOT NULL,
    room_type VARCHAR(50) NOT NULL,
    capacity INTEGER NOT NULL,
    current_occupancy INTEGER DEFAULT 0,
    floor_number INTEGER,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Hostel Allocations table
CREATE TABLE hostel_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES hostel_rooms(id),
    student_id UUID NOT NULL REFERENCES students(id),
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Categories table
CREATE TABLE inventory_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Items table
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES inventory_categories(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit VARCHAR(50),
    quantity INTEGER NOT NULL DEFAULT 0,
    minimum_quantity INTEGER DEFAULT 0,
    unit_price DECIMAL(10,2),
    supplier_info JSONB,
    last_purchase_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Transactions table
CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES inventory_items(id),
    transaction_type VARCHAR(20) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2),
    total_amount DECIMAL(10,2),
    reference_number VARCHAR(100),
    remarks TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert test data

-- Test Schools
INSERT INTO schools (id, name) VALUES 
    ('00000000-0000-0000-0000-000000000000', 'First Step Public School'),
    ('11111111-1111-1111-1111-111111111111', 'Delhi Public School'),
    ('22222222-2222-2222-2222-222222222222', 'St. Mary''s School');

-- Test Classes
INSERT INTO classes (id, name, grade, section, school_id) VALUES 
    ('33333333-3333-3333-3333-333333333333', 'Class 6', '6', 'A', '11111111-1111-1111-1111-111111111111'),
    ('44444444-4444-4444-4444-444444444444', 'Class 7', '7', 'B', '11111111-1111-1111-1111-111111111111'),
    ('55555555-5555-5555-5555-555555555555', 'Class 6', '6', 'A', '22222222-2222-2222-2222-222222222222'),
    ('66666666-6666-6666-6666-666666666666', 'Class 7', '7', 'A', '22222222-2222-2222-2222-222222222222'),
    ('77777777-7777-7777-7777-777777777777', '6A', '6', 'A', '00000000-0000-0000-0000-000000000000'),
    ('88888888-8888-8888-8888-888888888888', '4B', '4', 'B', '00000000-0000-0000-0000-000000000000');

-- Test Address
INSERT INTO addresses (id, street, city, state, zip_code) VALUES 
    ('11111111-1111-1111-1111-111111111111', '123 Main St', 'Delhi', 'Delhi', '110001'),
    ('22222222-2222-2222-2222-222222222222', '456 Park Road', 'Delhi', 'Delhi', '110002');

-- Test Medical Info
INSERT INTO medical_info (id, blood_group, allergies, medical_conditions, medications) VALUES 
    ('33333333-3333-3333-3333-333333333333', 'B+', ARRAY['Peanuts'], ARRAY['None'], ARRAY['None']),
    ('44444444-4444-4444-4444-444444444444', 'O+', ARRAY['None'], ARRAY['Asthma'], ARRAY['Inhaler']);

-- Test Parents
INSERT INTO parents (id, father_name, father_occupation, father_phone, father_email, mother_name, mother_occupation, mother_phone, mother_email) VALUES 
    ('55555555-5555-5555-5555-555555555555', 'Rajesh Kumar', 'Business', '9876543210', 'rajesh@email.com', 'Priya Kumar', 'Teacher', '9876543211', 'priya@email.com'),
    ('66666666-6666-6666-6666-666666666666', 'Amit Singh', 'Engineer', '9876543212', 'amit@email.com', 'Neha Singh', 'Doctor', '9876543213', 'neha@email.com');

-- Test Emergency Contacts
INSERT INTO emergency_contacts (id, name, relationship, phone, alternate_phone) VALUES 
    ('77777777-7777-7777-7777-777777777777', 'Suresh Kumar', 'Uncle', '9876543214', '9876543215'),
    ('88888888-8888-8888-8888-888888888888', 'Meena Singh', 'Aunt', '9876543216', '9876543217');

-- Test Documents
INSERT INTO documents (id, birth_certificate_url, previous_school_records_url, medical_records_url, photo_id_url) VALUES 
    ('99999999-9999-9999-9999-999999999999', 'https://storage/birth_cert_1.pdf', 'https://storage/school_records_1.pdf', 'https://storage/medical_1.pdf', 'https://storage/photo_1.jpg'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'https://storage/birth_cert_2.pdf', 'https://storage/school_records_2.pdf', 'https://storage/medical_2.pdf', 'https://storage/photo_2.jpg');

-- Test Academic Info
INSERT INTO academic_info (id, previous_school, previous_class, academic_year, admission_date) VALUES 
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Delhi Public School', '5th', '2023-2024', '2023-04-01'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Ryan International', '3rd', '2023-2024', '2023-04-01');

-- Test Transportation
INSERT INTO transportation (id, bus_number, route_number, pickup_point, drop_point, pickup_time, drop_time) VALUES 
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
        '77777777-7777-7777-7777-777777777777', '6A',
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
        '88888888-8888-8888-8888-888888888888', '4B',
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

-- Test Subjects for Delhi Public School
INSERT INTO subjects (id, name, school_id) VALUES 
    ('77777777-7777-7777-7777-777777777777', 'Mathematics', '11111111-1111-1111-1111-111111111111'),
    ('88888888-8888-8888-8888-888888888888', 'Science', '11111111-1111-1111-1111-111111111111'),
    ('99999999-9999-9999-9999-999999999999', 'English', '11111111-1111-1111-1111-111111111111');

-- Test Subjects for St. Mary's School
INSERT INTO subjects (id, name, school_id) VALUES 
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Mathematics', '22222222-2222-2222-2222-222222222222'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Science', '22222222-2222-2222-2222-222222222222'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'English', '22222222-2222-2222-2222-222222222222');

-- Test Users (Teachers)
INSERT INTO users (id, name, email, password, role) VALUES
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'John Teacher', 'john@dps.edu', '$2b$10$5dwsS5snIRlKu8ka5r5UhuM5E6STqxYpqgP9hV.1XwYf2s8m9T8ke', 'teacher'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Mary Teacher', 'mary@stmarys.edu', '$2b$10$5dwsS5snIRlKu8ka5r5UhuM5E6STqxYpqgP9hV.1XwYf2s8m9T8ke', 'teacher');

-- Test Assignments for Delhi Public School
INSERT INTO class_assignments (id, type, class_id, subject_id, school_id, assignment_date, description, created_by) VALUES
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'homework', '33333333-3333-3333-3333-333333333333', '77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', '2024-01-20', 'Complete exercises 1-5 from Chapter 3', 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
    ('11111111-2222-3333-4444-555555555555', 'classwork', '33333333-3333-3333-3333-333333333333', '88888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', '2024-01-21', 'Lab experiment on photosynthesis', 'dddddddd-dddd-dddd-dddd-dddddddddddd');

-- Test Assignments for St. Mary's School
INSERT INTO class_assignments (id, type, class_id, subject_id, school_id, assignment_date, description, created_by) VALUES
    ('22222222-3333-4444-5555-666666666666', 'homework', '55555555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', '2024-01-20', 'Solve problems from page 45-46', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
    ('33333333-4444-5555-6666-777777777777', 'classwork', '55555555-5555-5555-5555-555555555555', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', '2024-01-21', 'Group presentation on renewable energy', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee');

-- Test Assignment Files
INSERT INTO assignment_files (id, assignment_id, file_url, school_id) VALUES
    ('44444444-5555-6666-7777-888888888888', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'https://storage.example.com/math_homework.pdf', '11111111-1111-1111-1111-111111111111'),
    ('55555555-6666-7777-8888-999999999999', '22222222-3333-4444-5555-666666666666', 'https://storage.example.com/science_presentation.pptx', '22222222-2222-2222-2222-222222222222');

-- Add indexes for new tables
CREATE INDEX idx_school_branches_school_id ON school_branches(school_id);
CREATE INDEX idx_school_subscriptions_school_id ON school_subscriptions(school_id);
CREATE INDEX idx_academic_years_school_id ON academic_years(school_id);
CREATE INDEX idx_departments_school_id ON departments(school_id);
CREATE INDEX idx_staff_school_id ON staff(school_id);
CREATE INDEX idx_staff_attendance_staff_id ON staff_attendance(staff_id);
CREATE INDEX idx_staff_leaves_staff_id ON staff_leaves(staff_id);
CREATE INDEX idx_library_books_school_id ON library_books(school_id);
CREATE INDEX idx_book_issues_user_id ON book_issues(user_id);
CREATE INDEX idx_vehicles_school_id ON vehicles(school_id);
CREATE INDEX idx_routes_school_id ON routes(school_id);
CREATE INDEX idx_hostel_buildings_school_id ON hostel_buildings(school_id);
CREATE INDEX idx_hostel_rooms_building_id ON hostel_rooms(building_id);
CREATE INDEX idx_hostel_allocations_student_id ON hostel_allocations(student_id);
CREATE INDEX idx_inventory_categories_school_id ON inventory_categories(school_id);
CREATE INDEX idx_inventory_items_category_id ON inventory_items(category_id);
CREATE INDEX idx_inventory_transactions_item_id ON inventory_transactions(item_id);

-- Insert sample subscription plans
INSERT INTO subscription_plans (name, description, price, billing_cycle, features) VALUES
('Basic', 'Essential features for small schools', 999.00, 'MONTHLY', 
 '{"max_students": 500, "max_teachers": 50, "features": ["attendance", "fee_management", "basic_reports"]}'),
('Standard', 'Complete solution for medium schools', 1999.00, 'MONTHLY',
 '{"max_students": 2000, "max_teachers": 200, "features": ["attendance", "fee_management", "library", "transportation", "advanced_reports"]}'),
('Premium', 'Enterprise solution for large schools', 4999.00, 'MONTHLY',
 '{"max_students": -1, "max_teachers": -1, "features": ["attendance", "fee_management", "library", "transportation", "hostel", "inventory", "advanced_reports", "api_access"]}');
