let employees = [];
const employeeDataUrl = "employee_info.json";
let selectedDept = "All Departments";
const tableBody = document.getElementById("employeeTableBody");
const searchInput = document.getElementById("searchInput");
const recordCount = document.getElementById("recordCount");
const dropdownToggle = document.getElementById("dropdownToggle");
const dropdownMenu = document.getElementById("dropdownMenu");
const selectedDeptLabel = document.getElementById("selectedDeptLabel");

// Modal Hook References
const employeeModal = document.getElementById("employeeModal");
const modalTitle = document.getElementById("modalTitle");
const employeeForm = document.getElementById("employeeForm");
const addEmployeeBtn = document.getElementById("addEmployeeBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");

const formEmployeeId = document.getElementById("formEmployeeId");
const formName = document.getElementById("formName");
const formType = document.getElementById("formType");
const formDept = document.getElementById("formDept");
const formRole = document.getElementById("formRole");
const formEmail = document.getElementById("formEmail");
const formPhone = document.getElementById("formPhone");

// Dropdown UI Setup Controller
dropdownToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  dropdownMenu.classList.toggle("show");
});

document.addEventListener("click", () => {
  dropdownMenu.classList.remove("show");
});

document.querySelectorAll(".target-option").forEach((option) => {
  option.addEventListener("click", function (e) {
    e.stopPropagation();
    selectedDept = this.getAttribute("data-value");
    selectedDeptLabel.textContent = selectedDept;

    document.querySelectorAll(".target-option").forEach((opt) => {
      opt.className =
        "px-3 py-2 text-xs text-slate-400 hover:text-slate-200 hover:bg-[#121424] cursor-pointer target-option";
      const checkIcon = opt.querySelector("svg");
      if (checkIcon) checkIcon.remove();
    });

    this.className =
      "px-3 py-2 text-xs text-[#00c2ff] bg-[#00c2ff]/10 flex items-center justify-between cursor-pointer font-medium target-option";
    this.insertAdjacentHTML(
      "beforeend",
      '<i data-lucide="check" class="w-4 h-4 text-[#00c2ff]"></i>',
    );
    lucide.createIcons();

    dropdownMenu.classList.remove("show");
    renderTable();
  });
});

searchInput.addEventListener("input", renderTable);

// --- OVERLAY MODAL LOGIC ---
const openModal = (editId = null) => {
  employeeForm.reset();
  if (editId) {
    modalTitle.textContent = "CORRECT ACCESS PROFILE";
    const emp = employees.find((e) => e.id === editId);
    if (emp) {
      formEmployeeId.value = emp.id;
      formName.value = emp.name;
      formType.value = emp.type;
      formDept.value = emp.dept;
      formRole.value = emp.role;
      formEmail.value = emp.email;
      formPhone.value = emp.phone;
    }
  } else {
    modalTitle.textContent = "INITIALIZE NEW ACCESS PROFILE";
    formEmployeeId.value = "";
  }
  employeeModal.classList.remove("hidden");
};

const closeModal = () => {
  employeeModal.classList.add("hidden");
};

addEmployeeBtn.addEventListener("click", () => openModal());
closeModalBtn.addEventListener("click", closeModal);
cancelModalBtn.addEventListener("click", closeModal);

// Save Data Form Stream
employeeForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const targetId = formEmployeeId.value;

  if (targetId) {
    // Edit Existing
    employees = employees.map((emp) =>
      emp.id === targetId
        ? {
            ...emp,
            name: formName.value,
            type: formType.value,
            dept: formDept.value,
            role: formRole.value,
            email: formEmail.value,
            phone: formPhone.value,
          }
        : emp,
    );
  } else {
    // Push New Data Matrix Node
    const nextIndex =
      employees.length > 0
        ? Math.max(...employees.map((e) => parseInt(e.id.replace("EMP", "")))) +
          1
        : 1;
    const generatedId = `EMP${String(nextIndex).padStart(3, "0")}`;

    employees.push({
      id: generatedId,
      name: formName.value,
      type: formType.value,
      dept: formDept.value,
      role: formRole.value,
      email: formEmail.value,
      phone: formPhone.value,
      status: "ACTIVE",
    });
  }

  closeModal();
  renderTable();
});

// Window Global Function Triggers
window.triggerEdit = (id) => openModal(id);
window.triggerDelete = (id) => {
  if (confirm(`Purge profile data for node matrix reference: ${id}?`)) {
    employees = employees.filter((emp) => emp.id !== id);
    renderTable();
  }
};

// TABLE VIEW RENDER ENGINE
function renderTable() {
  const query = searchInput.value.toLowerCase().trim();

  const filtered = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query) ||
      emp.id.toLowerCase().includes(query);
    const matchesDept =
      selectedDept === "All Departments" || emp.dept === selectedDept;
    return matchesSearch && matchesDept;
  });

  recordCount.textContent = filtered.length;

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <div class="text-center py-8 text-xs font-mono text-[#2a2f45] uppercase tracking-widest">
        No matching records detected
      </div>
    `;
    return;
  }

  tableBody.innerHTML = filtered
    .map(
      (emp) => `
      <div class="table-grid py-3.5 text-xs hover:bg-[#090b1c]/50 transition-colors duration-150">
        <div class="font-mono font-bold text-[#00ff22]">${emp.id}</div>
        <div>
          <div class="font-bold text-slate-200 text-xs">${emp.name}</div>
          <div class="text-[10px] text-[#4d5573] font-medium mt-0.5">${emp.type}</div>
        </div>
        <div class="font-mono text-[11px] text-[#697394] space-y-0.5">
          <div class="flex items-center gap-1.5"><i data-lucide="mail" class="w-3 h-3 text-[#222538]"></i> ${emp.email}</div>
          <div class="flex items-center gap-1.5"><i data-lucide="phone" class="w-3 h-3 text-[#222538]"></i> ${emp.phone}</div>
        </div>
        <div class="text-[#00c2ff] font-medium">${emp.dept}</div>
        <div class="text-slate-300">${emp.role}</div>
        <div>
          <span class="active-pill text-[9px] font-bold px-2 py-0.5 rounded">
            ${emp.status}
          </span>
        </div>
        <div class="text-right pr-3 space-x-2">
          <button onclick="triggerEdit('${emp.id}')" class="p-1.5 rounded bg-[#090b1c] border border-[#00c2ff]/60 text-[#00c2ff] hover:bg-[#00c2ff]/10 transition-colors cursor-pointer inline-flex items-center justify-center align-middle">
            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
          </button>
          <button onclick="triggerDelete('${emp.id}')" class="p-1.5 rounded bg-[#090b1c] border border-[#ff3b4c]/60 text-[#ff3b4c] hover:bg-[#ff3b4c]/10 transition-colors cursor-pointer inline-flex items-center justify-center align-middle">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
    `,
    )
    .join("");

  lucide.createIcons();
}

function updateClock() {
  const clockEl = document.getElementById("liveClock");
  if (clockEl) {
    const now = new Date();
    clockEl.textContent = now.toTimeString().split(" ")[0];
  }
}

async function loadEmployees() {
  try {
    const response = await fetch(employeeDataUrl, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(
        `Unable to load employee data: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    employees = Array.isArray(data) ? data : (data.employeeInformation ?? []);
    renderTable();
  } catch (error) {
    console.error("Failed to load employee data:", error);
    recordCount.textContent = "0";
    tableBody.innerHTML = `
      <div class="text-center py-8 text-xs font-mono text-[#2a2f45] uppercase tracking-widest">
        Unable to load employee data.
      </div>
    `;
  }
}

// Initialization Hooks
setInterval(updateClock, 1000);
updateClock();
loadEmployees();
