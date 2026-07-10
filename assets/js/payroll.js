// ======================================================
// ELEMENTS
// ======================================================

const payrollTable = document.getElementById("payrollTable");

const employeeCount = document.getElementById("employeeCount");
const grossSalary = document.getElementById("grossSalary");
const deductions = document.getElementById("deductions");
const netSalary = document.getElementById("netSalary");
const recordCount = document.getElementById("recordCount");

const monthFilter = document.getElementById("month");
const yearFilter = document.getElementById("year");
const statusFilter = document.getElementById("statusFilter");

// Modal

const modal = document.getElementById("payslipModal");
const payslipContent = document.getElementById("payslipContent");
const closeModalBtn = document.querySelector(".close");
const downloadBtn = document.getElementById("downloadBtn");

let employees = [];
let payroll = [];
let filteredPayroll = [];

// ======================================================
// LOAD DATA
// ======================================================

async function loadPayroll() {
  try {
    const employeeResponse = await fetch("./data/employees.json");

    const payrollResponse = await fetch("./data/payroll-records.json");

    employees = await employeeResponse.json();
    payroll = await payrollResponse.json();

    filteredPayroll = [...payroll];
    displayPayroll();
  } catch (error) {
    console.error(error);
  }
}

// ======================================================
// DISPLAY PAYROLL
// ======================================================

function displayPayroll() {
  payrollTable.innerHTML = "";

  let gross = 0;
  let totalDeduction = 0;
  let totalNet = 0;

  filteredPayroll.forEach((record) => {
    const employee = employees.find((emp) => emp.id === record.employeeId);

    if (!employee) return;

    gross += record.baseSalary;
    totalDeduction += record.deductions;
    totalNet += record.netSalary;

    const initials = employee.firstName.charAt(0) + employee.lastName.charAt(0);

    const row = document.createElement("tr");

    row.innerHTML = `

<td>

<div class="employee">

<div class="employee-avatar">

${initials}

</div>

<div class="employee-details">

<div class="employee-name">

${employee.firstName} ${employee.lastName}

</div>

<div class="employee-id">

${employee.id}

</div>

</div>

</div>

</td>

<td class="salary">

R ${record.baseSalary.toLocaleString()}

</td>

<td class="hours">

${record.hoursWorked} hrs

</td>

<td class="overtime">

${record.overtimeHours || 0} hrs

</td>

<td class="bonus">

+ R ${(record.bonus || 0).toLocaleString()}

</td>

<td class="deduction">

- R ${record.deductions.toLocaleString()}

</td>

<td class="final-salary">

R ${record.netSalary.toLocaleString()}

</td>

<td>

<span class="status ${record.status.toLowerCase()}">

${record.status}

</span>

</td>

<td class="actions">

<button
class="view-btn"
data-id="${employee.id}">

<i class="fa-solid fa-eye"></i>

</button>

<button
class="download-btn">

<i class="fa-solid fa-download"></i>

</button>

<button
class="edit-btn">

<i class="fa-solid fa-pen"></i>

</button>

<button
class="delete-btn">

<i class="fa-solid fa-trash"></i>

</button>

</td>

`;

    payrollTable.appendChild(row);
  });

  updateSummary(gross, totalDeduction, totalNet);

  recordCount.textContent = `${filteredPayroll.length} Records • ${monthFilter.value} ${yearFilter.value}`;

  addButtonEvents();
}

// ======================================================
// SUMMARY
// ======================================================

function updateSummary(gross, deduction, net) {
  employeeCount.textContent = employees.length;

  grossSalary.textContent = "R " + gross.toLocaleString();

  deductions.textContent = "R " + deduction.toLocaleString();

  netSalary.textContent = "R " + net.toLocaleString();
}

// ======================================================
// BUTTON EVENTS
// ======================================================

function addButtonEvents() {
  document.querySelectorAll(".view-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.id;

      openPayslip(id);
    });
  });

  document.querySelectorAll(".download-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const row = button.closest("tr");
      const id = row.querySelector(".view-btn").dataset.id;
      openPayslip(id, true);
    });
  });

  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const row = button.closest("tr");
      const id = row.querySelector(".view-btn").dataset.id;
      alert(`Edit payroll record for ${id} is not enabled in this demo.`);
    });
  });

  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const row = button.closest("tr");
      const id = row.querySelector(".view-btn").dataset.id;
      const confirmed = confirm(`Delete payroll record for ${id}?`);
      if (!confirmed) return;
      payroll = payroll.filter((record) => record.employeeId !== id);
      filteredPayroll = filteredPayroll.filter(
        (record) => record.employeeId !== id,
      );
      displayPayroll();
    });
  });
}

function openPayslip(employeeId, autoDownload = false) {
  const record = filteredPayroll.find((item) => item.employeeId === employeeId);
  if (!record) return;

  const employee = employees.find((emp) => emp.id === record.employeeId);
  if (!employee) return;

  payslipContent.innerHTML = `
        <div class="payslip-company">
            <h3>Modern Tech Solutions</h3>
            <p>Payroll Summary for ${record.month} ${record.year}</p>
        </div>
        <div class="payslip-info">
            <div>
                <p class="info-label">Employee</p>
                <p class="info-value">${employee.firstName} ${employee.lastName}</p>
            </div>
            <div>
                <p class="info-label">Employee ID</p>
                <p class="info-value">${employee.id}</p>
            </div>
            <div>
                <p class="info-label">Status</p>
                <p class="info-value">${record.status.charAt(0).toUpperCase() + record.status.slice(1)}</p>
            </div>
            <div>
                <p class="info-label">Net Salary</p>
                <p class="info-value">R ${record.netSalary.toLocaleString()}</p>
            </div>
        </div>
        <div class="payslip-block">
            <h4 class="payslip-block-title">Payment Details</h4>
            <div class="pay-row"><span>Base Salary</span><span>R ${record.baseSalary.toLocaleString()}</span></div>
            <div class="pay-row"><span>Hours Worked</span><span>${record.hoursWorked} hrs</span></div>
            <div class="pay-row"><span>Overtime</span><span>${record.overtimeHours || 0} hrs</span></div>
            <div class="pay-row"><span>Bonus</span><span>R ${(record.bonus || 0).toLocaleString()}</span></div>
            <div class="pay-row"><span>Deductions</span><span>R ${record.deductions.toLocaleString()}</span></div>
        </div>
    `;

  modal.style.display = "flex";

  if (autoDownload) {
    downloadPayslip(record, employee);
  }
}

function closePayslipModal() {
  modal.style.display = "none";
}

function downloadPayslip(record, employee) {
  const content = `Payroll Payslip\n\nEmployee: ${employee.firstName} ${employee.lastName}\nEmployee ID: ${employee.id}\nStatus: ${record.status.charAt(0).toUpperCase() + record.status.slice(1)}\n\nBase Salary: R ${record.baseSalary.toLocaleString()}\nHours Worked: ${record.hoursWorked} hrs\nOvertime: ${record.overtimeHours || 0} hrs\nBonus: R ${(record.bonus || 0).toLocaleString()}\nDeductions: R ${record.deductions.toLocaleString()}\nNet Salary: R ${record.netSalary.toLocaleString()}`;
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${employee.id}-${record.month}-${record.year}-payslip.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function applyFilters() {
  const month = monthFilter.value;
  const year = yearFilter.value;
  const status = statusFilter.value.toLowerCase();

  filteredPayroll = payroll.filter((record) => {
    const matchMonth = record.month === month;
    const matchYear = String(record.year) === year;
    const matchStatus =
      status === "all" || record.status.toLowerCase() === status;
    return matchMonth && matchYear && matchStatus;
  });

  displayPayroll();
}

closeModalBtn.addEventListener("click", closePayslipModal);
window.addEventListener("click", function (event) {
  if (event.target === modal) {
    closePayslipModal();
  }
});

monthFilter.addEventListener("change", applyFilters);
yearFilter.addEventListener("change", applyFilters);
statusFilter.addEventListener("change", applyFilters);

// ======================================================
// INITIALIZE

loadPayroll();
