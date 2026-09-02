CREATE TYPE user_role AS ENUM ('Admin', 'Principal', 'Teacher', 'Student', 'Parent', 'Accountant');
CREATE TYPE attendance_status AS ENUM ('Present', 'Absent', 'Late', 'Excused');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE academic_years (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL, -- e.g., '2023-2024'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE
);

CREATE TABLE terms (
    id SERIAL PRIMARY KEY,
    academic_year_id INTEGER REFERENCES academic_years(id),
    name VARCHAR(50) NOT NULL, -- e.g., 'Semester 1'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL
);

CREATE TABLE class_levels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL -- e.g., 'Grade 10'
);

CREATE TABLE sections (
    id SERIAL PRIMARY KEY,
    class_level_id INTEGER REFERENCES class_levels(id),
    name VARCHAR(50) NOT NULL, -- e.g., 'Section A'
    capacity INTEGER DEFAULT 30
);

CREATE TABLE student_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    enrollment_date DATE DEFAULT CURRENT_DATE
);

CREATE TABLE parent_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20)
);

CREATE TABLE student_parent (
    student_id INTEGER REFERENCES student_profiles(id),
    parent_id INTEGER REFERENCES parent_profiles(id),
    PRIMARY KEY (student_id, parent_id)
);

CREATE TABLE teacher_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    hire_date DATE DEFAULT CURRENT_DATE
);

CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES student_profiles(id),
    section_id INTEGER REFERENCES sections(id),
    academic_year_id INTEGER REFERENCES academic_years(id)
);

CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL
);

CREATE TABLE timetables (
    id SERIAL PRIMARY KEY,
    section_id INTEGER REFERENCES sections(id),
    subject_id INTEGER REFERENCES subjects(id),
    teacher_id INTEGER REFERENCES teacher_profiles(id),
    day_of_week VARCHAR(10) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    classroom VARCHAR(50)
);

CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES student_profiles(id),
    timetable_id INTEGER REFERENCES timetables(id),
    date DATE NOT NULL,
    status attendance_status NOT NULL,
    remarks TEXT,
    UNIQUE (student_id, timetable_id, date)
);

CREATE TABLE exam_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL, -- e.g., 'Midterm', 'Final'
    weight_percentage DECIMAL(5, 2) NOT NULL
);

CREATE TABLE marks (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES student_profiles(id),
    subject_id INTEGER REFERENCES subjects(id),
    exam_type_id INTEGER REFERENCES exam_types(id),
    term_id INTEGER REFERENCES terms(id),
    score DECIMAL(5, 2) NOT NULL,
    max_score DECIMAL(5, 2) DEFAULT 100.00
);

CREATE TABLE fee_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- e.g., 'Tuition Fee', 'Library Fee'
    description TEXT
);

CREATE TABLE fee_structures (
    id SERIAL PRIMARY KEY,
    fee_type_id INTEGER REFERENCES fee_types(id),
    class_level_id INTEGER REFERENCES class_levels(id),
    academic_year_id INTEGER REFERENCES academic_years(id),
    amount DECIMAL(10, 2) NOT NULL
);

CREATE TABLE student_invoices (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES student_profiles(id),
    fee_structure_id INTEGER REFERENCES fee_structures(id),
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    amount_due DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending' -- Pending, Paid, Partially Paid
);

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES student_invoices(id),
    amount_paid DECIMAL(10, 2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100)
);

CREATE TABLE ai_student_notes (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES student_profiles(id),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    note_content TEXT NOT NULL,
    insights_json JSONB,
    requires_intervention BOOLEAN DEFAULT FALSE
);
