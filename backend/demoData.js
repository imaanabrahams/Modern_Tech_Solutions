import bcryptjs from "bcryptjs";

export const DEMO_USER = {
  id: 1,
  username: "admin",
  password_hash: bcryptjs.hashSync("admin123", 10),
  full_name: "Lungile Moyo",
  role: "HR Manager",
  employee_id: "EMP002",
};

export const DEMO_EMPLOYEES = [
  {
    id: "EMP001",
    first_name: "Sibongile",
    last_name: "Nkosi",
    email: "sibongile.nkosi@moderntech.com",
    phone: "+27 11 123 4001",
    department: "Development",
    position: "Software Engineer",
    hire_date: "2015-01-01",
    salary: 70000,
    employment_type: "Full-time",
    status: "active",
    manager: null,
  },
  {
    id: "EMP002",
    first_name: "Lungile",
    last_name: "Moyo",
    email: "lungile.moyo@moderntech.com",
    phone: "+27 11 123 4002",
    department: "HR",
    position: "HR Manager",
    hire_date: "2013-01-01",
    salary: 80000,
    employment_type: "Full-time",
    status: "active",
    manager: null,
  },
  {
    id: "EMP003",
    first_name: "Thabo",
    last_name: "Molefe",
    email: "thabo.molefe@moderntech.com",
    phone: "+27 11 123 4003",
    department: "QA",
    position: "Quality Analyst",
    hire_date: "2018-01-01",
    salary: 55000,
    employment_type: "Full-time",
    status: "active",
    manager: null,
  },
];

export const DEMO_ATTENDANCE = [
  {
    id: "ATT001",
    employee_id: "EMP001",
    employee_name: "Sibongile Nkosi",
    date: "2025-07-25",
    check_in: "08:55",
    check_out: "17:30",
    hours_worked: 8.5,
    status: "present",
  },
  {
    id: "ATT002",
    employee_id: "EMP002",
    employee_name: "Lungile Moyo",
    date: "2025-07-25",
    check_in: "09:00",
    check_out: "17:40",
    hours_worked: 8.67,
    status: "present",
  },
];

export const DEMO_PAYROLL = [
  {
    id: "PAY001",
    employee_id: "EMP001",
    employee_name: "Sibongile Nkosi",
    month: "July",
    year: 2025,
    base_salary: 5833.33,
    hours_worked: 160,
    overtime_hours: 0,
    bonus: 0,
    deductions: 500,
    net_salary: 69500,
    status: "paid",
  },
  {
    id: "PAY002",
    employee_id: "EMP002",
    employee_name: "Lungile Moyo",
    month: "July",
    year: 2025,
    base_salary: 6666.67,
    hours_worked: 150,
    overtime_hours: 0,
    bonus: 0,
    deductions: 1000,
    net_salary: 79000,
    status: "paid",
  },
];

export const DEMO_TIMEOFF = [
  {
    id: "TO001",
    employee_id: "EMP001",
    employee_name: "Sibongile Nkosi",
    type: "sick",
    start_date: "2025-07-22",
    end_date: "2025-07-22",
    days: 1,
    reason: "Sick Leave",
    status: "approved",
    submitted_date: "2025-07-22",
  },
  {
    id: "TO002",
    employee_id: "EMP002",
    employee_name: "Lungile Moyo",
    type: "personal",
    start_date: "2025-07-15",
    end_date: "2025-07-15",
    days: 1,
    reason: "Family Responsibility",
    status: "pending",
    submitted_date: "2025-07-12",
  },
];

export function isDbUnavailableError(error) {
  return Boolean(
    error &&
    (error.code === "ECONNREFUSED" ||
      error.code === "ER_BAD_DB_ERROR" ||
      error.code === "ENOTFOUND" ||
      String(error.message).includes("ECONNREFUSED") ||
      String(error.message).includes("connect")),
  );
}

export function findDemoUserByUsername(username) {
  if (!username) return null;
  return DEMO_USER.username === username ? { ...DEMO_USER } : null;
}

export function findDemoUserById(id) {
  if (!id) return null;
  return Number(id) === DEMO_USER.id ? { ...DEMO_USER } : null;
}
