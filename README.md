# ⚡ Syntax Terrorists HR Management System

A modern, responsive Human Resource Management System (HRMS) built using **HTML, CSS, and JavaScript**. This project provides a complete HR dashboard for managing employees, payroll, attendance, and leave requests through an intuitive cyberpunk-inspired interface.

The application was converted from a React/Vite project into a standalone HTML/CSS/JavaScript version while maintaining the original functionality and user experience.

---

# 📖 Project Overview

The Syntax Terrorists HR Management System is designed to simplify day-to-day HR operations by providing a centralized dashboard where administrators can manage employee information, monitor attendance, process payroll, and review leave requests.

The application stores user sessions using Local Storage and can run entirely on the client side without requiring a backend server.

---

# ✨ Features

## 🔐 Authentication

* Secure login page
* Session management using Local Storage
* Logout functionality
* Automatic authentication check

---

## 📊 Dashboard

The dashboard provides an overview of the organisation including:

* Employee statistics
* Payroll summary
* Attendance overview
* Pending leave requests
* Animated statistic cards
* Interactive SVG charts
* Recent activity section

---

## 👥 Employee Management

Manage employee records with full CRUD functionality.

Features include:

* View employee directory
* Search employees instantly
* Filter by department
* Add new employees
* Edit employee information
* Delete employee records
* Responsive employee table

---

## 💰 Payroll Management

Payroll tools include:

* Monthly payroll records
* Filter by month and year
* Process payroll
* View payslip modal
* Payroll summary
* Download payslip notifications

---

## 🗓 Time Off Management

Leave management system featuring:

* Submit leave requests
* View request history
* Filter requests by status
* Approve requests
* Reject requests
* Real-time status updates

---

## ⏰ Attendance Tracking

Attendance dashboard includes:

* Attendance records
* Date filtering
* Status filtering
* Attendance summary cards
* Interactive charts
* Attendance table
* Export notification

---

## 📱 Responsive Design

Designed to work across multiple screen sizes.

Includes:

* Desktop sidebar navigation
* Mobile slide-out menu
* Responsive layouts
* Mobile-friendly tables
* Adaptive cards
* Smooth animations

---

# 🛠 Technologies Used

* HTML5
* CSS3
* JavaScript (ES6)
* Local Storage API
* SVG Charts
* JSON Data Files

---

# 📁 Project Structure

```
Syntax-Terrorists-HR-System/
│
├── index.html
│
├── assets/
│   ├── css/
│   │   └── styles.css
│   │
│   └── js/
│       ├── app.js
│       └── embeddedData.js
│
├── data/
│   ├── employees.json
│   ├── attendance-records.json
│   ├── payroll-records.json
│   ├── time-off-requests.json
│   └── user.json
│
└── README.md
```

---

# 📂 Data Files

The application loads data from JSON files located inside the **data** folder.

Available datasets include:

* employees.json
* attendance-records.json
* payroll-records.json
* time-off-requests.json
* user.json

If these files cannot be loaded (for example, when opening the project directly from the browser), the application automatically falls back to the embedded data contained in:

```
assets/js/embeddedData.js
```

---

# 🔑 Demo Login

```
Username: admin

Password: admin123
```

---

# 🚀 Running the Project

## Option 1 (Recommended)

Run a local web server from the project folder:

```bash
python -m http.server 5500
```

Open your browser and navigate to:

```
http://localhost:5500
```

---

## Option 2

Simply open:

```
index.html
```

The embedded fallback data allows the application to function in most modern browsers without a local server.

---

# 🎨 User Interface

The project features a futuristic cyberpunk design including:

* Neon-inspired colour palette
* Glassmorphism interface
* Smooth animations
* Responsive layouts
* Interactive cards
* Modern dashboards
* Toast notifications
* Modal windows
* Custom tables
* Dynamic charts

---

# 📌 Application Modules

✔ Login System

✔ Dashboard

✔ Employee Management

✔ Payroll Management

✔ Time Off Management

✔ Attendance Tracking

✔ Search & Filters

✔ CRUD Operations

✔ Charts & Statistics

✔ Responsive Navigation

✔ Local Storage Sessions

✔ Toast Notifications

✔ Modal Dialogs

---

# 📈 Future Improvements

Potential enhancements include:

* Backend database integration
* User role management
* Email notifications
* PDF payslip generation
* Employee profile photos
* Dark/Light mode switch
* Analytics dashboard
* API integration
* Cloud deployment
* Multi-user authentication

---

# 📄 License

This project was created for educational and portfolio purposes.

Feel free to explore, modify, and expand upon the project for learning and development.

---

# 👨‍💻 Author

Developed by the **Syntax Terrorists** team as part of an HR Management System project.

Built using **HTML, CSS, and JavaScript** to demonstrate modern front-end development, responsive design, and interactive user interfaces.

# 👨‍💻 Development Team

This project was developed by the **Syntax Terrorists** team as part of an HR Management System project.

### Team Members

* **Imaan Abrahams**
* **Maiesha Moohan**
* **Muhammad Qasim Moos**
* **Khanya Gcilitshane**

Together, the team collaborated to design and develop a modern Human Resource Management System using **HTML, CSS, and JavaScript**. The project demonstrates responsive web design, interactive user interfaces, and front-end development best practices while providing a complete HR management experience.
