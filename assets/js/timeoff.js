// ========================================
// ELEMENTS
// ========================================

const leaveTable = document.getElementById("leaveTableBody");

const totalRequests = document.getElementById("totalRequests");
const approvedRequests = document.getElementById("approvedRequests");
const pendingRequests = document.getElementById("pendingRequests");
const rejectedRequests = document.getElementById("rejectedRequests");

const recordCount = document.getElementById("recordCount");

const leaveTypeFilter = document.getElementById("leaveType");
const statusFilter = document.getElementById("statusFilter");
const searchEmployee = document.getElementById("searchEmployee");

// ========================================
// ARRAYS
// ========================================

let requests = [];
let filteredRequests = [];

// ========================================
// LOAD JSON
// ========================================

async function loadRequests() {

    try {

        const response = await fetch("./data/time-off-requests.json");

        const data = await response.json();

        requests = data.map(request => {

            let status = request.status.toLowerCase();

            if (status === "rejected") {
                status = "denied";
            }

            return {
                employeeId: request.employeeId,
                employeeName: request.employeeName,
                leaveType: request.reason,
                startDate: request.startDate,
                status: status.charAt(0).toUpperCase() + status.slice(1)
            };

        });

        filteredRequests = [...requests];

        displayRequests(filteredRequests);

    }

    catch(error){

        console.error("Error loading requests:", error);

    }

}

// ========================================
// DISPLAY TABLE
// ========================================

function displayRequests(data){

    leaveTable.innerHTML = "";

    let approved = 0;
    let pending = 0;
    let denied = 0;

    data.forEach(request=>{

        if(request.status === "Approved") approved++;
        if(request.status === "Pending") pending++;
        if(request.status === "Denied") denied++;

        const initials = request.employeeName
            .split(" ")
            .map(name => name[0])
            .join("")
            .substring(0,2)
            .toUpperCase();

        const row = document.createElement("tr");

        row.innerHTML = `

        <td>

            <div class="employee">

                <div class="employee-avatar">

                    ${initials}

                </div>

                <div class="employee-details">

                    <div class="employee-name">

                        ${request.employeeName}

                    </div>

                    <div class="employee-id">

                        EMP-${request.employeeId}

                    </div>

                </div>

            </div>

        </td>

        <td class="leave-type">

            ${request.leaveType}

        </td>

        <td>

            ${request.startDate}

        </td>

        <td>

            1 Day

        </td>

        <td>

            <span class="status ${request.status.toLowerCase()}">

                ${request.status}

            </span>

        </td>

        <td class="actions">

            <button
                class="view-btn"
                data-id="${request.employeeId}">

                <i class="fa-solid fa-eye"></i>

            </button>

        </td>

        `;

        leaveTable.appendChild(row);

    });

    updateSummary(data, approved, pending, denied);

}

// ========================================
// SUMMARY CARDS
// ========================================

function updateSummary(data, approved, pending, denied){

    totalRequests.textContent = data.length;

    approvedRequests.textContent = approved;

    pendingRequests.textContent = pending;

    rejectedRequests.textContent = denied;

    recordCount.textContent =
        `${data.length} Records`;

}

// ========================================
// START
// ========================================

loadRequests();

// ========================================
// MODAL ELEMENTS
// ========================================

const leaveModal = document.getElementById("leaveModal");
const leaveDetails = document.getElementById("leaveDetails");

const closeBtn = document.querySelector(".close");

const approveBtn = document.getElementById("approveBtn");
const rejectBtn = document.getElementById("rejectBtn");

let selectedRequest = null;

// ========================================
// TABLE BUTTON EVENTS
// ========================================

leaveTable.addEventListener("click", function(event){

    const button = event.target.closest(".view-btn");

    if(!button) return;

    const employeeId = Number(button.dataset.id);

    selectedRequest = requests.find(request =>
        request.employeeId === employeeId
    );

    if(selectedRequest){

        showRequest(selectedRequest);

    }

});

// ========================================
// SHOW MODAL
// ========================================

function showRequest(request){

    leaveDetails.innerHTML = `

        <div class="leave-row">

            <span>Employee</span>

            <span>${request.employeeName}</span>

        </div>

        <div class="leave-row">

            <span>Employee ID</span>

            <span>EMP-${request.employeeId}</span>

        </div>

        <div class="leave-row">

            <span>Leave Type</span>

            <span>${request.leaveType}</span>

        </div>

        <div class="leave-row">

            <span>Start Date</span>

            <span>${request.startDate}</span>

        </div>

        <div class="leave-row">

            <span>Duration</span>

            <span>1 Day</span>

        </div>

        <div class="leave-row">

            <span>Status</span>

            <span class="status ${request.status.toLowerCase()}">

                ${request.status}

            </span>

        </div>

    `;

    leaveModal.style.display = "flex";

}

// ========================================
// CLOSE MODAL
// ========================================

function closeModal(){

    leaveModal.style.display = "none";

    selectedRequest = null;

}

closeBtn.addEventListener("click", closeModal);

window.addEventListener("click", function(event){

    if(event.target === leaveModal){

        closeModal();

    }

});

document.addEventListener("keydown", function(event){

    if(event.key === "Escape"){

        closeModal();

    }

});

// ========================================
// UPDATE STATUS
// ========================================

function updateStatus(status){

    if(!selectedRequest) return;

    selectedRequest.status = status;

    closeModal();

    displayRequests(filteredRequests);

}

// ========================================
// APPROVE
// ========================================

approveBtn.addEventListener("click", function(){

    updateStatus("Approved");

});

// ========================================
// REJECT
// ========================================

rejectBtn.addEventListener("click", function(){

    updateStatus("Denied");

});

// ========================================
// FILTER EVENTS
// ========================================

leaveTypeFilter.addEventListener("change", applyFilters);

statusFilter.addEventListener("change", applyFilters);

searchEmployee.addEventListener("input", applyFilters);

// ========================================
// APPLY FILTERS
// ========================================

function applyFilters(){

    const leaveType = leaveTypeFilter.value.toLowerCase();

    const status = statusFilter.value.toLowerCase();

    const search = searchEmployee.value.trim().toLowerCase();

    filteredRequests = requests.filter(request =>{

        const matchLeaveType =
            leaveType === "all" ||
            request.leaveType.toLowerCase() === leaveType;

        const matchStatus =
            status === "all" ||
            request.status.toLowerCase() === status;

        const matchSearch =
            request.employeeName
            .toLowerCase()
            .includes(search);

        return matchLeaveType &&
               matchStatus &&
               matchSearch;

    });

    displayRequests(filteredRequests);

}

// ========================================
// EMPTY TABLE MESSAGE
// ========================================

function showEmptyState(){

    leaveTable.innerHTML = `

        <tr>

            <td colspan="6" class="no-data">

                <i class="fa-solid fa-folder-open"></i>

                <br><br>

                No leave requests found.

            </td>

        </tr>

    `;

}

// ========================================
// LEAVE FORM
// ========================================

const leaveForm = document.getElementById("leaveForm");

leaveForm.addEventListener("submit", function(event){

    event.preventDefault();
    const newRequest = {

        employeeId: requests.length + 1,

        employeeName: document.getElementById("employeeName").value,

        leaveType: document.getElementById("leaveReason").value,

        startDate: document.getElementById("startDate").value,

        status: "Pending"

    };

    requests.unshift(newRequest);

    applyFilters();

    leaveForm.reset();

});