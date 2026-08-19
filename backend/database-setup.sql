-- Modern Tech Solutions Database Schema
-- Run this script to create the database and all necessary tables

-- Create database
CREATE DATABASE IF NOT EXISTS modern_tech_solutions;
USE modern_tech_solutions;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50),
  employee_id VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  id VARCHAR(20) PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  department VARCHAR(100),
  position VARCHAR(100),
  hire_date DATE,
  salary DECIMAL(12, 2),
  employment_type VARCHAR(50),
  status VARCHAR(50) DEFAULT 'active',
  manager VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Attendance records table
CREATE TABLE IF NOT EXISTS attendance (
  id VARCHAR(20) PRIMARY KEY,
  employee_id VARCHAR(20) NOT NULL,
  employee_name VARCHAR(255),
  date DATE NOT NULL,
  check_in VARCHAR(10),
  check_out VARCHAR(10),
  hours_worked DECIMAL(5, 2),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Payroll records table
CREATE TABLE IF NOT EXISTS payroll (
  id VARCHAR(20) PRIMARY KEY,
  employee_id VARCHAR(20) NOT NULL,
  employee_name VARCHAR(255),
  month VARCHAR(20) NOT NULL,
  year INT NOT NULL,
  base_salary DECIMAL(12, 2),
  hours_worked DECIMAL(5, 2),
  overtime_hours DECIMAL(5, 2),
  bonus DECIMAL(12, 2),
  deductions DECIMAL(12, 2),
  net_salary DECIMAL(12, 2),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Time off requests table
CREATE TABLE IF NOT EXISTS time_off_requests (
  id VARCHAR(20) PRIMARY KEY,
  employee_id VARCHAR(20) NOT NULL,
  employee_name VARCHAR(255),
  type VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days INT,
  reason TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  submitted_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_attendance_employee_date ON attendance(employee_id, date);
CREATE INDEX idx_payroll_employee_month ON payroll(employee_id, year, month);
CREATE INDEX idx_timeoff_employee_status ON time_off_requests(employee_id, status);
CREATE INDEX idx_users_username ON users(username);
