/* Plain HTML/CSS/JavaScript conversion of the React HR dashboard. */

const NEON_GREEN = '#39ff14';
const NEON_BLUE = '#00d4ff';
const NEON_PURPLE = '#9333ea';
const NEON_GOLD = '#ffd700';
const NEON_RED = '#ff6b6b';
const MUTED = '#6272a4';
const CHART_COLORS = [NEON_GREEN, NEON_BLUE, NEON_PURPLE, NEON_GOLD, NEON_RED];

const DATA_FILES = {
  employees: './data/employees.json',
  timeOffRequests: './data/time-off-requests.json',
  attendanceRecords: './data/attendance-records.json',
  payrollRecords: './data/payroll-records.json',
  user: './data/user.json',
};

const NAV_ITEMS = [
  { path: 'dashboard', label: 'Dashboard', icon: 'layout' },
  { path: 'employees', label: 'Employees', icon: 'users' },
  { path: 'payroll', label: 'Payroll', icon: 'dollar' },
  { path: 'time-off', label: 'Time Off', icon: 'calendar' },
  { path: 'attendance', label: 'Attendance', icon: 'clipboard' },
];

const state = {
  employees: [],
  timeOffRequests: [],
  attendanceRecords: [],
  payrollRecords: [],
  user: null,
};

const ui = {
  employeeSearch: '',
  employeeDepartment: 'all',
  payrollMonth: 'July',
  payrollYear: '2025',
  timeOffStatus: 'all',
  attendanceDate: '2025-07-25',
  attendanceStatus: 'all',
  mobileMenuOpen: false,
};

let timers = [];

const app = () => document.getElementById('app');
const modalRoot = () => document.getElementById('modal-root');
const toastRoot = () => document.getElementById('toast-root');
const clone = (v) => JSON.parse(JSON.stringify(v));
const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

function clearTimers() {
  timers.forEach((t) => clearInterval(t));
  timers = [];
}

function icon(name, size = 16, extra = '') {
  const attrs = `width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${extra}`;
  const paths = {
    layout: '<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    dollar: '<line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>',
    clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M8 12h8M8 16h5"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
    menu: '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    terminal: '<polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    user: '<path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    trash: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.32 1.77.57 2.61a2 2 0 0 1-.45 2.11L8 9.67a16 16 0 0 0 6.33 6.33l1.23-1.23a2 2 0 0 1 2.11-.45c.84.25 1.71.45 2.61.57A2 2 0 0 1 22 16.92Z"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
    fileText: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M16 13H8M16 17H8M10 9H8"/>',
    trendDown: '<polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/>',
    trendingUp: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
    checkCircle: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    xCircle: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  };
  return `<svg ${attrs}>${paths[name] || paths.activity}</svg>`;
}

function formatMoney(n) {
  return `R ${Number(n || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(date, options) {
  if (!date) return '—';
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-ZA', options);
}

function toast(message, type = 'success') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  toastRoot().appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(12px)';
    setTimeout(() => el.remove(), 220);
  }, 2600);
}

async function fetchJSON(path) {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Could not load ${path}`);
  return response.json();
}

async function loadData() {
  try {
    const [employees, timeOffRequests, attendanceRecords, payrollRecords, user] = await Promise.all([
      fetchJSON(DATA_FILES.employees),
      fetchJSON(DATA_FILES.timeOffRequests),
      fetchJSON(DATA_FILES.attendanceRecords),
      fetchJSON(DATA_FILES.payrollRecords),
      fetchJSON(DATA_FILES.user),
    ]);
    Object.assign(state, { employees, timeOffRequests, attendanceRecords, payrollRecords, user });
  } catch (error) {
    const fallback = window.EMBEDDED_DATA;
    if (!fallback) throw error;
    Object.assign(state, {
      employees: clone(fallback.employees),
      timeOffRequests: clone(fallback.timeOffRequests),
      attendanceRecords: clone(fallback.attendanceRecords),
      payrollRecords: clone(fallback.payrollRecords),
      user: clone(fallback.user),
    });
  }
}

function route() {
  const raw = (window.location.hash || '#/dashboard').replace('#/', '');
  return raw || 'dashboard';
}

function go(path) {
  window.location.hash = `#/${path}`;
}

function isAuthenticated() {
  return localStorage.getItem('isAuthenticated') === 'true';
}

function currentPageLabel(path = route()) {
  return NAV_ITEMS.find((item) => item.path === path)?.label || 'Dashboard';
}

function render() {
  clearTimers();
  const current = route();

  if (current === 'login' || !isAuthenticated()) {
    renderLogin();
    return;
  }

  if (!NAV_ITEMS.some((item) => item.path === current)) {
    go('dashboard');
    return;
  }

  renderShell(current);
}

function renderLogin() {
  modalRoot().innerHTML = '';
  app().innerHTML = `
    <main class="login-screen">
      <div class="login-grid-bg"></div>
      <div class="scan-line"></div>
      <div class="vignette"></div>
      <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>

      <div id="login-card" class="login-card-wrap">
        <div class="neon-border">
          <section class="login-card">
            <div class="login-logo">
              <div class="logo-icon-lg">${icon('zap', 24)}</div>
              <h1 id="login-title" class="login-title">SYNTAX TERRORISTS</h1>
              <div class="login-subtitle">${icon('terminal', 12)}<span>HR MANAGEMENT SYSTEM v2.0</span></div>
            </div>
            <div class="login-divider"></div>

            <form id="login-form">
              <div class="form-row" style="margin-bottom:20px">
                <label class="label" for="username">${icon('user', 10)} USERNAME</label>
                <div id="username-border" class="field-border">
                  <input id="username" class="input mono" type="text" placeholder="Enter username" autocomplete="username" />
                </div>
                <p id="username-error" class="field-error" hidden></p>
              </div>

              <div class="form-row" style="margin-bottom:20px">
                <label class="label" for="password">${icon('lock', 10)} PASSWORD</label>
                <div id="password-border" class="field-border">
                  <input id="password" class="input mono" type="password" placeholder="Enter password" autocomplete="current-password" />
                </div>
                <p id="password-error" class="field-error" hidden></p>
              </div>

              <button id="login-submit" class="btn login-submit" type="submit">INITIALIZE SESSION</button>
            </form>

            <div class="demo-box">
              <p class="demo-title">// DEMO ACCESS CREDENTIALS</p>
              <p>user: <span>admin</span></p>
              <p>pass: <span>admin123</span></p>
            </div>
          </section>
        </div>
      </div>
    </main>
  `;

  const title = document.getElementById('login-title');
  const glitchTimer = setInterval(() => {
    title?.classList.add('glitch');
    setTimeout(() => title?.classList.remove('glitch'), 200);
  }, 5000);
  timers.push(glitchTimer);

  document.getElementById('login-form').addEventListener('submit', handleLogin);
  ['username', 'password'].forEach((field) => {
    document.getElementById(field).addEventListener('input', () => clearLoginError(field));
  });
}

function clearLoginError(field) {
  const error = document.getElementById(`${field}-error`);
  const border = document.getElementById(`${field}-border`);
  if (error) { error.hidden = true; error.textContent = ''; }
  border?.classList.remove('error');
}

function setLoginError(field, message) {
  const error = document.getElementById(`${field}-error`);
  const border = document.getElementById(`${field}-border`);
  if (error) { error.hidden = false; error.textContent = `⚠ ${message}`; }
  border?.classList.add('error');
}

async function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  let valid = true;

  if (!username) { setLoginError('username', 'Username required'); valid = false; }
  if (!password) { setLoginError('password', 'Password required'); valid = false; }
  if (!valid) return;

  const button = document.getElementById('login-submit');
  button.disabled = true;
  button.innerHTML = `<span class="inline-row"> <span class="spinner"></span> AUTHENTICATING...</span>`;
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (username === state.user.username && password === state.user.password) {
    localStorage.setItem('isAuthenticated', 'true');
    toast('ACCESS GRANTED');
    go('dashboard');
  } else {
    button.disabled = false;
    button.textContent = 'INITIALIZE SESSION';
    setLoginError('username', 'Invalid credentials');
    document.getElementById('login-card')?.classList.add('shake');
    setTimeout(() => document.getElementById('login-card')?.classList.remove('shake'), 650);
    toast('ACCESS DENIED — Invalid credentials', 'error');
  }
}

function renderShell(current) {
  const content = renderPage(current);
  app().innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">${sidebarHTML(current)}</aside>
      <div id="mobile-backdrop" class="mobile-backdrop ${ui.mobileMenuOpen ? 'open' : ''}"></div>
      <aside id="mobile-drawer" class="mobile-drawer ${ui.mobileMenuOpen ? 'open' : ''}">
        <button class="drawer-close" id="drawer-close" aria-label="Close menu">${icon('x', 14)}</button>
        ${sidebarHTML(current, true)}
      </aside>

      <div class="main-wrap">
        <header class="topbar">
          <div class="topbar-left">
            <button id="mobile-menu" class="mobile-menu-btn" aria-label="Open menu">${icon('menu', 16)}</button>
            <p class="current-page">${escapeHtml(currentPageLabel(current))}</p>
          </div>
          <div class="profile">
            <div class="profile-copy">
              <p class="profile-name">${escapeHtml(state.user.fullName)}</p>
              <p class="profile-role">${escapeHtml(state.user.role).toUpperCase()}</p>
            </div>
            <div class="avatar">LM</div>
          </div>
        </header>
        <main class="content">${content}</main>
      </div>
    </div>
  `;

  startClock();
  attachShellEvents();
  attachPageEvents(current);
  animateCounters();
}

function sidebarHTML(current) {
  return `
    <div class="sidebar-inner">
      <div class="brand-row">
        <div class="brand-icon">${icon('zap', 18)}</div>
        <div>
          <h1 class="brand-title">SYNTAX<br/>TERRORISTS</h1>
          <p class="brand-time">00:00:00</p>
        </div>
      </div>
      <nav class="nav">
        ${NAV_ITEMS.map((item, i) => `
          <a class="nav-link ${item.path === current ? 'active' : ''}" href="#/${item.path}" style="animation:slide-left .3s ease both; animation-delay:${i * 60}ms">
            ${icon(item.icon, 16)}
            <span>${item.label.toUpperCase()}</span>
            ${item.path === current ? '<i class="active-dot"></i>' : icon('chevron', 12)}
          </a>
        `).join('')}
      </nav>
      <div class="system-status">
        <div class="system-online"><i class="system-dot"></i><span>SYSTEM ONLINE</span></div>
        <button class="logout-btn" data-logout>${icon('logout', 14)} LOGOUT</button>
      </div>
    </div>
  `;
}

function startClock() {
  const update = () => {
    const value = new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    document.querySelectorAll('.brand-time').forEach((el) => { el.textContent = value; });
  };
  update();
  const timer = setInterval(update, 1000);
  timers.push(timer);
}

function attachShellEvents() {
  document.getElementById('mobile-menu')?.addEventListener('click', () => {
    ui.mobileMenuOpen = true;
    render();
  });
  document.getElementById('drawer-close')?.addEventListener('click', closeMobileMenu);
  document.getElementById('mobile-backdrop')?.addEventListener('click', closeMobileMenu);
  document.querySelectorAll('.mobile-drawer .nav-link').forEach((link) => link.addEventListener('click', closeMobileMenu));
  document.querySelectorAll('[data-logout]').forEach((button) => {
    button.addEventListener('click', () => {
      localStorage.removeItem('isAuthenticated');
      ui.mobileMenuOpen = false;
      go('login');
    });
  });
}

function closeMobileMenu() {
  ui.mobileMenuOpen = false;
  render();
}

function renderPage(current) {
  const map = {
    dashboard: renderDashboard,
    employees: renderEmployees,
    payroll: renderPayroll,
    'time-off': renderTimeOff,
    attendance: renderAttendance,
  };
  return map[current]?.() || renderDashboard();
}

function pageHeader(title, subtitle, action = '') {
  return `
    <div class="page-header stack">
      <div>
        <h1 class="page-title">${title}</h1>
        <p class="page-subtitle">${subtitle}</p>
      </div>
      ${action}
    </div>
  `;
}

function sectionHeader(title, sub) {
  return `<div class="section-header"><h2>${title}</h2><p>${sub}</p></div>`;
}

function statCard({ label, value, display, sub = '', iconName = 'activity', color = NEON_GREEN, prefix = '', suffix = '', delay = 0, mini = false, payroll = false }) {
  const isAnimated = typeof value === 'number' && display === undefined;
  const shown = display ?? `${prefix}<span data-count-to="${value}">0</span>${suffix}`;
  return `
    <div class="stat-card ${mini ? 'mini-stat' : ''} ${payroll ? 'payroll-stat' : ''}" style="border-color:${color}20; box-shadow:0 0 20px ${color}08; animation-delay:${delay}ms" onmouseenter="this.style.boxShadow='0 0 25px ${color}20, inset 0 0 25px ${color}05'" onmouseleave="this.style.boxShadow='0 0 20px ${color}08'">
      <div class="stat-accent" style="background:radial-gradient(circle at top right, ${color}, transparent)"></div>
      <div class="stat-top">
        <p class="stat-label">${label}</p>
        <span class="stat-icon" style="color:${color}; background:${color}15; border-color:${color}40">${icon(iconName, 14)}</span>
      </div>
      <div class="stat-value" style="color:${color}; text-shadow:0 0 12px ${color}60">${isAnimated ? `${prefix}<span data-count-to="${value}">0</span>${suffix}` : shown}</div>
      ${sub ? `<p class="stat-sub">${sub}</p>` : ''}
      <div class="stat-glow" style="background:linear-gradient(90deg, transparent, ${color}40, transparent)"></div>
    </div>
  `;
}

function animateCounters() {
  const counters = document.querySelectorAll('[data-count-to]');
  counters.forEach((el) => {
    const target = Number(el.getAttribute('data-count-to')) || 0;
    const start = performance.now();
    const duration = 1400;
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target).toLocaleString('en-ZA');
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

function renderDashboard() {
  const totalEmployees = state.employees.length;
  const activeEmployees = state.employees.filter((e) => e.status === 'active').length;
  const onLeaveEmployees = state.employees.filter((e) => e.status === 'on-leave').length;
  const pendingTimeOff = state.timeOffRequests.filter((r) => r.status === 'pending').length;
  const todayPresent = state.attendanceRecords.filter((r) => r.status === 'present' || r.status === 'late').length;
  const totalPayroll = state.payrollRecords.reduce((sum, p) => sum + p.netSalary, 0);
  const departments = countBy(state.employees, 'department').map(([name, count]) => ({ name, count }));
  const attendanceTrend = [
    { month: 'Feb', present: 94, absent: 6 },
    { month: 'Mar', present: 91, absent: 9 },
    { month: 'Apr', present: 95, absent: 5 },
    { month: 'May', present: 93, absent: 7 },
    { month: 'Jun', present: 96, absent: 4 },
    { month: 'Jul', present: 92, absent: 8 },
  ];
  const timeOffTypes = countBy(state.timeOffRequests, 'type').map(([name, value]) => ({ name, value }));

  const stats = [
    { label: 'Total Employees', value: totalEmployees, sub: `${activeEmployees} active · ${onLeaveEmployees} on leave`, iconName: 'users', color: NEON_GREEN, delay: 0 },
    { label: "Today's Attendance", value: todayPresent, sub: `${((todayPresent / state.attendanceRecords.length) * 100 || 0).toFixed(0)}% present rate`, iconName: 'checkCircle', color: NEON_BLUE, delay: 80 },
    { label: 'Pending Leave', value: pendingTimeOff, sub: 'Time off requests awaiting', iconName: 'clock', color: NEON_PURPLE, delay: 160 },
    { label: 'Total Payroll', value: Math.round(totalPayroll / 1000), sub: `${state.payrollRecords.length} employees processed`, iconName: 'dollar', color: NEON_GOLD, prefix: 'R', suffix: 'K', delay: 240 },
    { label: 'Departments', value: departments.length, sub: 'Active business units', iconName: 'trendingUp', color: NEON_GREEN, delay: 320 },
    { label: 'On Leave', value: onLeaveEmployees, sub: 'Currently away', iconName: 'calendar', color: NEON_BLUE, delay: 400 },
  ];

  return `
    <div class="page dashboard">
      <div class="page-header">
        <div>
          <h1 class="page-title">COMMAND CENTER</h1>
          <p class="page-subtitle">HR metrics · live overview</p>
        </div>
        <div class="live"><i class="live-dot"></i><span>LIVE</span>${icon('activity', 12)}</div>
      </div>

      <div class="grid grid-2">
        ${stats.map(statCard).join('')}
      </div>

      <div class="grid charts-grid">
        <section class="neon-card" style="border-color:${NEON_GREEN}20">
          ${sectionHeader('ATTENDANCE TREND', 'Monthly presence rate')}
          <div class="chart-area">${lineChart(attendanceTrend, [{ key: 'present', label: 'Present %', color: NEON_GREEN }, { key: 'absent', label: 'Absent %', color: NEON_RED }], 'month')}</div>
        </section>
        <section class="neon-card" style="border-color:${NEON_BLUE}20">
          ${sectionHeader('DEPARTMENT HEADCOUNT', 'Employees per business unit')}
          <div class="chart-area">${barChart(departments, [{ key: 'count', label: 'Employees', color: NEON_BLUE }], 'name', true)}</div>
        </section>
      </div>

      <div class="grid charts-grid">
        <section class="neon-card" style="border-color:${NEON_PURPLE}20">
          ${sectionHeader('LEAVE TYPE BREAKDOWN', 'Distribution by request category')}
          <div class="chart-area">${pieChart(timeOffTypes, 'name', 'value')}</div>
        </section>
        <section class="neon-card" style="border-color:${NEON_GREEN}20">
          ${sectionHeader('RECENT LEAVE REQUESTS', 'Latest submissions')}
          <div class="recent-list">
            ${state.timeOffRequests.slice(0, 5).map((req, i) => `
              <div class="recent-item" style="animation-delay:${700 + i * 50}ms">
                <div>
                  <p class="recent-name">${escapeHtml(req.employeeName)}</p>
                  <p class="recent-meta">${escapeHtml(req.type)} · ${req.days} day${req.days !== 1 ? 's' : ''}</p>
                </div>
                ${badge(req.status, statusColor(req.status))}
              </div>
            `).join('')}
          </div>
        </section>
      </div>
    </div>
  `;
}

function countBy(list, key) {
  const map = new Map();
  list.forEach((item) => map.set(item[key], (map.get(item[key]) || 0) + 1));
  return [...map.entries()];
}

function renderEmployees() {
  const departments = [...new Set(state.employees.map((e) => e.department))];
  const q = ui.employeeSearch.toLowerCase();
  const filtered = state.employees.filter((emp) => {
    const matches = emp.firstName.toLowerCase().includes(q) || emp.lastName.toLowerCase().includes(q) || emp.email.toLowerCase().includes(q) || emp.id.toLowerCase().includes(q);
    return matches && (ui.employeeDepartment === 'all' || emp.department === ui.employeeDepartment);
  });

  return `
    <div class="page">
      ${pageHeader('EMPLOYEE DIRECTORY', 'Manage employee records', `<button id="add-employee" class="btn">${icon('plus', 16)} ADD EMPLOYEE</button>`)}

      <section class="card">
        <div class="card-content pt">
          <div class="filters">
            <div class="input-wrap grow">
              <span class="input-icon">${icon('search', 16)}</span>
              <input id="employee-search" class="input with-icon" value="${escapeHtml(ui.employeeSearch)}" placeholder="Search by name, email, or ID..." />
            </div>
            <select id="employee-department" class="select" style="max-width:220px">
              <option value="all">All Departments</option>
              ${departments.map((d) => `<option value="${escapeHtml(d)}" ${ui.employeeDepartment === d ? 'selected' : ''}>${escapeHtml(d)}</option>`).join('')}
            </select>
          </div>
        </div>
      </section>

      <section class="card">
        <div class="card-header">
          <h2 class="card-title">EMPLOYEE RECORDS</h2>
          <p class="card-desc">${filtered.length} record${filtered.length !== 1 ? 's' : ''} found</p>
        </div>
        <div class="card-content">
          <div class="table-wrap">
            <table>
              <thead><tr>${['ID', 'Name', 'Contact', 'Department', 'Position', 'Status', 'Actions'].map((h) => `<th class="${h === 'Actions' ? 'right' : ''}">${h}</th>`).join('')}</tr></thead>
              <tbody>
                ${filtered.length === 0 ? `<tr><td colspan="7" class="no-records">// NO RECORDS FOUND</td></tr>` : filtered.map((emp) => `
                  <tr>
                    <td class="mono-cell" style="color:${NEON_GREEN}">${escapeHtml(emp.id)}</td>
                    <td><div class="primary-text">${escapeHtml(emp.firstName)} ${escapeHtml(emp.lastName)}</div><div class="meta-text">${escapeHtml(emp.employmentType)}</div></td>
                    <td>
                      <div class="inline-row" style="font-size:12px;color:#9ca3af">${icon('mail', 10)} ${escapeHtml(emp.email)}</div>
                      <div class="inline-row" style="font-size:12px;color:#9ca3af;margin-top:2px">${icon('phone', 10)} ${escapeHtml(emp.phone)}</div>
                    </td>
                    <td style="font-size:13px;color:${NEON_BLUE}">${escapeHtml(emp.department)}</td>
                    <td style="font-size:13px;color:var(--foreground)">${escapeHtml(emp.position)}</td>
                    <td>${badge(emp.status.toUpperCase(), employeeStatusColor(emp.status))}</td>
                    <td class="right"><div class="actions">
                      <button class="icon-btn" data-edit-employee="${emp.id}" style="color:${NEON_BLUE}" aria-label="Edit employee">${icon('edit', 14)}</button>
                      <button class="icon-btn" data-delete-employee="${emp.id}" style="color:${NEON_RED}" aria-label="Delete employee">${icon('trash', 14)}</button>
                    </div></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  `;
}

function attachEmployeesEvents() {
  document.getElementById('add-employee')?.addEventListener('click', () => openEmployeeModal());
  document.getElementById('employee-search')?.addEventListener('input', (e) => {
    ui.employeeSearch = e.target.value;
    render();
    document.getElementById('employee-search')?.focus();
  });
  document.getElementById('employee-department')?.addEventListener('change', (e) => {
    ui.employeeDepartment = e.target.value;
    render();
  });
  document.querySelectorAll('[data-edit-employee]').forEach((button) => {
    button.addEventListener('click', () => openEmployeeModal(button.getAttribute('data-edit-employee')));
  });
  document.querySelectorAll('[data-delete-employee]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.getAttribute('data-delete-employee');
      state.employees = state.employees.filter((emp) => emp.id !== id);
      toast('Employee deleted!');
      render();
    });
  });
}

function openEmployeeModal(id = null) {
  const employee = id ? state.employees.find((emp) => emp.id === id) : null;
  const departments = [...new Set(state.employees.map((e) => e.department))];
  const data = employee || { firstName: '', lastName: '', email: '', phone: '', department: '', position: '', hireDate: '', salary: 0, employmentType: 'Full-time', status: 'active', manager: '' };
  const field = (name, label, type = 'text') => `
    <div class="form-row">
      <label class="label" for="emp-${name}">${label}</label>
      <input id="emp-${name}" name="${name}" type="${type}" class="input" value="${escapeHtml(data[name] ?? '')}" />
      <p id="err-${name}" class="field-error" hidden></p>
    </div>
  `;
  showModal(`
    <h2 class="modal-title">${employee ? 'EDIT EMPLOYEE' : 'NEW EMPLOYEE'}</h2>
    <p class="modal-desc">${employee ? 'Update employee data' : 'Enter employee details'}</p>
    <form id="employee-form">
      <div class="form-grid">
        ${field('firstName', 'FIRST NAME')}
        ${field('lastName', 'LAST NAME')}
        ${field('email', 'EMAIL', 'email')}
        ${field('phone', 'PHONE')}
        ${field('position', 'POSITION')}
        ${field('hireDate', 'HIRE DATE', 'date')}
        <div class="form-row">
          <label class="label" for="emp-department">DEPARTMENT</label>
          <select id="emp-department" name="department" class="select">
            <option value="">Select department</option>
            ${departments.map((d) => `<option value="${escapeHtml(d)}" ${data.department === d ? 'selected' : ''}>${escapeHtml(d)}</option>`).join('')}
            <option value="Other" ${data.department === 'Other' ? 'selected' : ''}>Other</option>
          </select>
          <p id="err-department" class="field-error" hidden></p>
        </div>
        <div class="form-row">
          <label class="label" for="emp-salary">ANNUAL SALARY</label>
          <input id="emp-salary" name="salary" type="number" class="input" value="${escapeHtml(data.salary ?? 0)}" />
          <p id="err-salary" class="field-error" hidden></p>
        </div>
        <div class="form-row">
          <label class="label" for="emp-employmentType">EMPLOYMENT TYPE</label>
          <select id="emp-employmentType" name="employmentType" class="select">
            ${['Full-time', 'Part-time', 'Contract'].map((v) => `<option value="${v}" ${data.employmentType === v ? 'selected' : ''}>${v}</option>`).join('')}
          </select>
        </div>
        <div class="form-row">
          <label class="label" for="emp-status">STATUS</label>
          <select id="emp-status" name="status" class="select">
            ${[['active', 'Active'], ['on-leave', 'On Leave'], ['inactive', 'Inactive']].map(([v, l]) => `<option value="${v}" ${data.status === v ? 'selected' : ''}>${l}</option>`).join('')}
          </select>
        </div>
        <div class="form-row full">
          <label class="label" for="emp-manager">MANAGER (OPTIONAL)</label>
          <input id="emp-manager" name="manager" class="input" value="${escapeHtml(data.manager ?? '')}" />
        </div>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn outline" data-close-modal>Cancel</button>
        <button type="submit" class="btn">${employee ? 'UPDATE' : 'ADD'} EMPLOYEE</button>
      </div>
    </form>
  `);

  document.getElementById('employee-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    values.salary = parseFloat(values.salary);
    const errors = validateEmployee(values);
    showFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    if (employee) {
      state.employees = state.employees.map((emp) => emp.id === employee.id ? { ...emp, ...values } : emp);
      toast('Employee updated!');
    } else {
      state.employees.push({ id: `EMP${String(state.employees.length + 1).padStart(3, '0')}`, ...values });
      toast('Employee added!');
    }
    closeModal();
    render();
  });
}

function validateEmployee(values) {
  const errors = {};
  if (!values.firstName?.trim()) errors.firstName = 'First name is required';
  if (!values.lastName?.trim()) errors.lastName = 'Last name is required';
  if (!values.email?.trim()) errors.email = 'Email is required';
  else if (!/\S+@\S+\.\S+/.test(values.email)) errors.email = 'Email is invalid';
  if (!values.phone?.trim()) errors.phone = 'Phone is required';
  if (!values.department?.trim()) errors.department = 'Department is required';
  if (!values.position?.trim()) errors.position = 'Position is required';
  if (!values.hireDate) errors.hireDate = 'Hire date is required';
  if (!values.salary || values.salary <= 0) errors.salary = 'Valid salary is required';
  return errors;
}

function renderPayroll() {
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const filtered = state.payrollRecords.filter((r) => r.month === ui.payrollMonth && r.year === parseInt(ui.payrollYear));
  const totalGross = filtered.reduce((s, r) => s + r.baseSalary + r.bonus, 0);
  const totalDeductions = filtered.reduce((s, r) => s + r.deductions, 0);
  const totalNet = filtered.reduce((s, r) => s + r.netSalary, 0);
  const stats = [
    { label: 'EMPLOYEES', display: String(filtered.length), iconName: 'users', color: NEON_BLUE },
    { label: 'GROSS', display: formatMoney(totalGross), iconName: 'trendDown', color: NEON_GREEN },
    { label: 'DEDUCTIONS', display: formatMoney(totalDeductions), iconName: 'trendDown', color: NEON_RED },
    { label: 'NET PAYOUT', display: formatMoney(totalNet), iconName: 'dollar', color: NEON_PURPLE },
  ];

  return `
    <div class="page">
      ${pageHeader('PAYROLL ENGINE', 'Process and generate payslips')}
      <div class="grid grid-4">
        ${stats.map((s, i) => statCard({ ...s, sub: `${ui.payrollMonth} ${ui.payrollYear}`, delay: i * 70, payroll: true })).join('')}
      </div>
      <section class="card">
        <div class="card-content pt">
          <div class="filters">
            <select id="payroll-month" class="select" style="max-width:220px">${months.map((m) => `<option value="${m}" ${ui.payrollMonth === m ? 'selected' : ''}>${m}</option>`).join('')}</select>
            <select id="payroll-year" class="select" style="max-width:160px">${['2024','2025','2026'].map((y) => `<option value="${y}" ${ui.payrollYear === y ? 'selected' : ''}>${y}</option>`).join('')}</select>
          </div>
        </div>
      </section>
      <section class="card">
        <div class="card-header">
          <h2 class="card-title">PAYROLL RECORDS</h2>
          <p class="card-desc">${filtered.length} record${filtered.length !== 1 ? 's' : ''} · ${ui.payrollMonth} ${ui.payrollYear}</p>
        </div>
        <div class="card-content">
          <div class="table-wrap">
            <table>
              <thead><tr>${['Employee','Base Salary','Hours','Overtime','Bonus','Deductions','Net Salary','Status','Actions'].map((h) => `<th class="${h === 'Actions' ? 'right' : ''}">${h}</th>`).join('')}</tr></thead>
              <tbody>
                ${filtered.length === 0 ? `<tr><td colspan="9" class="no-records">// NO RECORDS FOR THIS PERIOD</td></tr>` : filtered.map((rec) => `
                  <tr>
                    <td><div class="primary-text">${escapeHtml(rec.employeeName)}</div><div class="meta-text" style="color:${NEON_GREEN}">${escapeHtml(rec.employeeId)}</div></td>
                    <td class="mono-cell">${formatMoney(rec.baseSalary)}</td>
                    <td class="mono-cell" style="color:#9ca3af">${rec.hoursWorked}h</td>
                    <td class="mono-cell" style="color:${NEON_GOLD}">${rec.overtimeHours}h</td>
                    <td class="mono-cell" style="color:${NEON_GREEN}">${formatMoney(rec.bonus)}</td>
                    <td class="mono-cell" style="color:${NEON_RED}">-${formatMoney(rec.deductions)}</td>
                    <td class="mono-cell" style="color:${NEON_BLUE}; font-weight:700; font-size:13px">${formatMoney(rec.netSalary)}</td>
                    <td>${badge(rec.status.toUpperCase(), payrollStatusColor(rec.status))}</td>
                    <td class="right"><div class="actions">
                      <button class="icon-btn" data-view-payslip="${rec.id}" style="color:${NEON_BLUE}" aria-label="View payslip">${icon('eye', 14)}</button>
                      <button class="icon-btn" data-download-payslip="${rec.id}" aria-label="Download payslip">${icon('download', 14)}</button>
                      ${rec.status === 'pending' ? `<button class="icon-btn" data-process-payroll="${rec.id}" style="color:${NEON_PURPLE}" aria-label="Process payroll">${icon('fileText', 14)}</button>` : ''}
                    </div></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  `;
}

function attachPayrollEvents() {
  document.getElementById('payroll-month')?.addEventListener('change', (e) => { ui.payrollMonth = e.target.value; render(); });
  document.getElementById('payroll-year')?.addEventListener('change', (e) => { ui.payrollYear = e.target.value; render(); });
  document.querySelectorAll('[data-view-payslip]').forEach((button) => button.addEventListener('click', () => openPayslip(button.getAttribute('data-view-payslip'))));
  document.querySelectorAll('[data-download-payslip]').forEach((button) => button.addEventListener('click', () => {
    const rec = state.payrollRecords.find((r) => r.id === button.getAttribute('data-download-payslip'));
    toast(`Payslip for ${rec.employeeName} downloaded!`);
  }));
  document.querySelectorAll('[data-process-payroll]').forEach((button) => button.addEventListener('click', () => {
    const id = button.getAttribute('data-process-payroll');
    state.payrollRecords = state.payrollRecords.map((r) => r.id === id ? { ...r, status: 'processed' } : r);
    toast('Payroll processed!');
    render();
  }));
}

function openPayslip(id) {
  const rec = state.payrollRecords.find((r) => r.id === id);
  if (!rec) return;
  const emp = state.employees.find((e) => e.id === rec.employeeId);
  const overtimePay = rec.overtimeHours * Math.round(rec.baseSalary / 160);
  const grossEarnings = rec.baseSalary + rec.bonus + overtimePay;
  const paye = Number((rec.deductions * 0.60).toFixed(2));
  const uif = Number((rec.deductions * 0.20).toFixed(2));
  const medical = Number((rec.deductions * 0.15).toFixed(2));
  const retirement = Number((rec.deductions * 0.05).toFixed(2));
  const row = (label, value, color = '#f0f4ff') => `<div class="pay-row"><span>${label}</span><span style="color:${color}">${value}</span></div>`;

  showModal(`
    <h2 class="modal-title">DIGITAL PAYSLIP</h2>
    <p class="modal-desc">${rec.month} ${rec.year} — ${escapeHtml(rec.employeeName)}</p>
    <div class="payslip-company">
      <h3>${icon('zap', 16)} SYNTAX TERRORISTS</h3>
      <p>EMPLOYEE PAYSLIP · ${rec.month.toUpperCase()} ${rec.year}</p>
    </div>
    <div class="payslip-info">
      ${[['Employee', rec.employeeName], ['Employee ID', rec.employeeId], ['Department', emp?.department || 'N/A'], ['Position', emp?.position || 'N/A']].map(([label, value]) => `
        <div><p class="info-label">${label.toUpperCase()}</p><p class="info-value">${escapeHtml(value)}</p></div>
      `).join('')}
    </div>
    <div class="payslip-block">
      <p class="payslip-block-title" style="color:${NEON_GREEN}">EARNINGS</p>
      ${row('Base Salary', formatMoney(rec.baseSalary), NEON_GREEN)}
      ${row('Bonus', formatMoney(rec.bonus))}
      ${row(`Overtime (${rec.overtimeHours}h)`, formatMoney(overtimePay))}
      <div class="pay-total"><span>GROSS EARNINGS</span><span style="color:${NEON_GREEN}">${formatMoney(grossEarnings)}</span></div>
    </div>
    <div class="payslip-block">
      <p class="payslip-block-title" style="color:${NEON_RED}">DEDUCTIONS</p>
      ${row('PAYE (Income Tax)', formatMoney(paye), NEON_RED)}
      ${row('UIF', formatMoney(uif), NEON_RED)}
      ${row('Medical Aid', formatMoney(medical), NEON_RED)}
      ${row('Retirement Fund', formatMoney(retirement), NEON_RED)}
      <div class="pay-total"><span>TOTAL DEDUCTIONS</span><span style="color:${NEON_RED}">-${formatMoney(rec.deductions)}</span></div>
    </div>
    <div class="net-box"><span>NET SALARY</span><span>${formatMoney(rec.netSalary)}</span></div>
    <p class="generated">Computer-generated payslip · Generated ${new Date().toLocaleDateString('en-ZA')}</p>
    <div class="modal-actions">
      <button type="button" class="btn outline" data-close-modal>Close</button>
      <button type="button" id="download-current-payslip" class="btn">${icon('download', 14)} DOWNLOAD PDF</button>
    </div>
  `);
  document.getElementById('download-current-payslip')?.addEventListener('click', () => toast(`Payslip for ${rec.employeeName} downloaded!`));
}

function renderTimeOff() {
  const filtered = state.timeOffRequests.filter((r) => ui.timeOffStatus === 'all' || r.status === ui.timeOffStatus);
  const pending = state.timeOffRequests.filter((r) => r.status === 'pending').length;
  const approved = state.timeOffRequests.filter((r) => r.status === 'approved').length;
  const rejected = state.timeOffRequests.filter((r) => r.status === 'rejected').length;
  const stats = [
    { label: 'PENDING', value: pending, iconName: 'clock', color: NEON_GOLD },
    { label: 'APPROVED', value: approved, iconName: 'checkCircle', color: NEON_GREEN },
    { label: 'REJECTED', value: rejected, iconName: 'xCircle', color: NEON_RED },
  ];

  return `
    <div class="page">
      ${pageHeader('LEAVE REQUESTS', 'Manage employee time-off', `<button id="new-leave-request" class="btn">${icon('plus', 16)} NEW REQUEST</button>`)}
      <div class="grid grid-3">
        ${stats.map((s, i) => statCard({ ...s, delay: i * 80, mini: true })).join('')}
      </div>
      <section class="card">
        <div class="card-header">
          <div class="page-header stack" style="animation:none">
            <div>
              <h2 class="card-title">ALL REQUESTS</h2>
              <p class="card-desc">${filtered.length} record${filtered.length !== 1 ? 's' : ''}</p>
            </div>
            <div class="tabs">
              ${['all', 'pending', 'approved', 'rejected'].map((v) => `<button class="tab ${ui.timeOffStatus === v ? 'active' : ''}" data-timeoff-filter="${v}">${v.toUpperCase()}</button>`).join('')}
            </div>
          </div>
        </div>
        <div class="card-content">
          <div class="table-wrap">
            <table>
              <thead><tr>${['Employee', 'Type', 'Start', 'End', 'Days', 'Reason', 'Status', 'Actions'].map((h) => `<th class="${h === 'Actions' ? 'right' : ''}">${h}</th>`).join('')}</tr></thead>
              <tbody>
                ${filtered.length === 0 ? `<tr><td colspan="8" class="no-records">// NO REQUESTS FOUND</td></tr>` : filtered.map((req) => `
                  <tr>
                    <td><div class="primary-text">${escapeHtml(req.employeeName)}</div><div class="meta-text">${escapeHtml(req.employeeId)}</div></td>
                    <td>${badge(req.type.toUpperCase(), typeColor(req.type))}</td>
                    <td class="mono-cell" style="color:#9ca3af">${new Date(req.startDate).toLocaleDateString()}</td>
                    <td class="mono-cell" style="color:#9ca3af">${new Date(req.endDate).toLocaleDateString()}</td>
                    <td><div class="inline-row">${icon('calendar', 10)}<span class="mono-cell">${req.days}</span></div></td>
                    <td class="truncate" style="font-size:13px;color:#9ca3af">${escapeHtml(req.reason)}</td>
                    <td>${badge(req.status.toUpperCase(), statusColor(req.status))}</td>
                    <td class="right">
                      ${req.status === 'pending' ? `<div class="actions"><button class="icon-btn" data-approve-request="${req.id}" style="color:${NEON_GREEN}">${icon('checkCircle', 14)}</button><button class="icon-btn" data-reject-request="${req.id}" style="color:${NEON_RED}">${icon('xCircle', 14)}</button></div>` : '<span class="meta-text">—</span>'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  `;
}

function attachTimeOffEvents() {
  document.getElementById('new-leave-request')?.addEventListener('click', openLeaveModal);
  document.querySelectorAll('[data-timeoff-filter]').forEach((button) => button.addEventListener('click', () => {
    ui.timeOffStatus = button.getAttribute('data-timeoff-filter');
    render();
  }));
  document.querySelectorAll('[data-approve-request]').forEach((button) => button.addEventListener('click', () => {
    const id = button.getAttribute('data-approve-request');
    state.timeOffRequests = state.timeOffRequests.map((r) => r.id === id ? { ...r, status: 'approved' } : r);
    toast('Request approved!');
    render();
  }));
  document.querySelectorAll('[data-reject-request]').forEach((button) => button.addEventListener('click', () => {
    const id = button.getAttribute('data-reject-request');
    state.timeOffRequests = state.timeOffRequests.map((r) => r.id === id ? { ...r, status: 'rejected' } : r);
    toast('Request rejected!');
    render();
  }));
}

function openLeaveModal() {
  showModal(`
    <h2 class="modal-title">SUBMIT LEAVE REQUEST</h2>
    <p class="modal-desc">Fill in the details for the time off request</p>
    <form id="leave-form">
      <div class="form-row" style="margin-bottom:16px">
        <label class="label">EMPLOYEE</label>
        <select id="leave-employeeId" name="employeeId" class="select">
          <option value="">Select employee</option>
          ${state.employees.map((e) => `<option value="${e.id}">${escapeHtml(e.firstName)} ${escapeHtml(e.lastName)} — ${escapeHtml(e.department)}</option>`).join('')}
        </select>
        <p id="err-employeeId" class="field-error" hidden></p>
      </div>
      <div class="form-row" style="margin-bottom:16px">
        <label class="label">LEAVE TYPE</label>
        <select id="leave-type" name="type" class="select">
          <option value="vacation">Vacation</option><option value="sick">Sick Leave</option><option value="personal">Personal</option><option value="other">Other</option>
        </select>
      </div>
      <div class="form-grid">
        <div class="form-row">
          <label class="label">START DATE</label><input id="leave-startDate" name="startDate" type="date" class="input" />
          <p id="err-startDate" class="field-error" hidden></p>
        </div>
        <div class="form-row">
          <label class="label">END DATE</label><input id="leave-endDate" name="endDate" type="date" class="input" />
          <p id="err-endDate" class="field-error" hidden></p>
        </div>
      </div>
      <div id="leave-duration" class="info-box" style="display:none;margin-top:16px"></div>
      <div class="form-row" style="margin-top:16px">
        <label class="label">REASON</label>
        <textarea id="leave-reason" name="reason" class="textarea" rows="3" placeholder="Provide reason for time off"></textarea>
        <p id="err-reason" class="field-error" hidden></p>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn outline" data-close-modal>Cancel</button>
        <button type="submit" class="btn">SUBMIT REQUEST</button>
      </div>
    </form>
  `, 'small');

  const updateDuration = () => {
    const start = document.getElementById('leave-startDate').value;
    const end = document.getElementById('leave-endDate').value;
    const box = document.getElementById('leave-duration');
    if (start && end && new Date(end) >= new Date(start)) {
      box.style.display = 'block';
      box.textContent = `Duration: ${calcDays(start, end)} day(s)`;
    } else {
      box.style.display = 'none';
    }
  };
  document.getElementById('leave-startDate').addEventListener('change', updateDuration);
  document.getElementById('leave-endDate').addEventListener('change', updateDuration);

  document.getElementById('leave-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const errors = {};
    if (!values.employeeId) errors.employeeId = 'Employee required';
    if (!values.startDate) errors.startDate = 'Start date required';
    if (!values.endDate) errors.endDate = 'End date required';
    if (!values.reason?.trim()) errors.reason = 'Reason required';
    if (values.startDate && values.endDate && new Date(values.endDate) < new Date(values.startDate)) errors.endDate = 'End date must be after start date';
    showFormErrors(errors, 'leave-');
    if (Object.keys(errors).length > 0) return;

    const emp = state.employees.find((x) => x.id === values.employeeId);
    state.timeOffRequests.push({
      id: `TO${String(state.timeOffRequests.length + 1).padStart(3, '0')}`,
      employeeId: values.employeeId,
      employeeName: emp ? `${emp.firstName} ${emp.lastName}` : '',
      type: values.type,
      startDate: values.startDate,
      endDate: values.endDate,
      days: calcDays(values.startDate, values.endDate),
      reason: values.reason,
      status: 'pending',
      submittedDate: new Date().toISOString().split('T')[0],
    });
    toast('Leave request submitted!');
    closeModal();
    render();
  });
}

function calcDays(start, end) {
  return Math.ceil(Math.abs(new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1;
}

function renderAttendance() {
  const filtered = state.attendanceRecords.filter((r) => r.date === ui.attendanceDate && (ui.attendanceStatus === 'all' || r.status === ui.attendanceStatus));
  const presentCount = filtered.filter((r) => r.status === 'present').length;
  const absentCount = filtered.filter((r) => r.status === 'absent').length;
  const lateCount = filtered.filter((r) => r.status === 'late').length;
  const totalHours = filtered.reduce((s, r) => s + r.hoursWorked, 0);
  const avgHours = filtered.length > 0 ? (totalHours / filtered.length).toFixed(1) : '0';
  const weeklyData = [
    { day: 'Mon', present: 10, absent: 2, late: 0 },
    { day: 'Tue', present: 11, absent: 1, late: 0 },
    { day: 'Wed', present: 9, absent: 2, late: 1 },
    { day: 'Thu', present: 12, absent: 0, late: 0 },
    { day: 'Fri', present: 8, absent: 3, late: 1 },
  ];
  const statusData = [
    { name: 'Present', value: presentCount },
    { name: 'Absent', value: absentCount },
    { name: 'Late', value: lateCount },
  ].filter((d) => d.value > 0);
  const stats = [
    { label: 'PRESENT TODAY', value: presentCount, sub: `${filtered.length > 0 ? ((presentCount / filtered.length) * 100).toFixed(0) : 0}% rate`, iconName: 'checkCircle', color: NEON_GREEN },
    { label: 'ABSENT', value: absentCount, sub: 'Not present', iconName: 'xCircle', color: NEON_RED },
    { label: 'LATE ARRIVALS', value: lateCount, sub: 'After 09:00', iconName: 'clock', color: NEON_GOLD },
    { label: 'AVG HRS WORKED', display: `${avgHours}h`, sub: 'Per employee', iconName: 'calendar', color: NEON_BLUE },
  ];

  return `
    <div class="page">
      ${pageHeader('ATTENDANCE TRACKER', 'Monitor employee check-ins', `<button id="export-attendance" class="btn blue">${icon('download', 16)} EXPORT REPORT</button>`)}
      <div class="grid grid-4">
        ${stats.map((s, i) => statCard({ ...s, delay: i * 70, mini: true })).join('')}
      </div>
      <section class="card">
        <div class="card-content pt">
          <div class="filters">
            <input id="attendance-date" type="date" class="input grow" value="${ui.attendanceDate}" />
            <select id="attendance-status" class="select" style="max-width:220px">
              ${[['all', 'All Statuses'], ['present', 'Present'], ['absent', 'Absent'], ['late', 'Late'], ['half-day', 'Half Day']].map(([v, l]) => `<option value="${v}" ${ui.attendanceStatus === v ? 'selected' : ''}>${l}</option>`).join('')}
            </select>
          </div>
        </div>
      </section>
      <div class="grid charts-grid">
        <section class="card">
          <div class="card-header"><h2 class="card-title">WEEKLY TREND</h2><p class="card-desc">Daily breakdown</p></div>
          <div class="card-content">${barChart(weeklyData, [{ key: 'present', label: 'Present', color: NEON_GREEN }, { key: 'late', label: 'Late', color: NEON_GOLD }, { key: 'absent', label: 'Absent', color: NEON_RED }], 'day')}</div>
        </section>
        <section class="card">
          <div class="card-header"><h2 class="card-title">STATUS DISTRIBUTION</h2><p class="card-desc">${formatDate(ui.attendanceDate, { dateStyle: 'medium' })}</p></div>
          <div class="card-content">${statusData.length === 0 ? '<div class="empty-chart">// NO DATA FOR SELECTED DATE</div>' : pieChart(statusData, 'name', 'value', { Present: NEON_GREEN, Absent: NEON_RED, Late: NEON_GOLD })}</div>
        </section>
      </div>
      <section class="card">
        <div class="card-header"><h2 class="card-title">ATTENDANCE RECORDS</h2><p class="card-desc">${filtered.length} record${filtered.length !== 1 ? 's' : ''} · ${formatDate(ui.attendanceDate)}</p></div>
        <div class="card-content">
          <div class="table-wrap"><table>
            <thead><tr>${['Employee', 'Department', 'Check In', 'Check Out', 'Hours', 'Status'].map((h) => `<th>${h}</th>`).join('')}</tr></thead>
            <tbody>
              ${filtered.length === 0 ? `<tr><td colspan="6" class="no-records">// NO RECORDS FOR THIS DATE — TRY 2025-07-25 TO 2025-07-29</td></tr>` : filtered.map((rec) => {
                const emp = state.employees.find((e) => e.id === rec.employeeId);
                return `<tr>
                  <td><div class="primary-text">${escapeHtml(rec.employeeName)}</div><div class="meta-text">${escapeHtml(rec.employeeId)}</div></td>
                  <td style="font-size:13px;color:${NEON_BLUE}">${escapeHtml(emp?.department || '—')}</td>
                  <td><div class="inline-row">${attendanceStatusIcon(rec.status)}<span class="mono-cell">${escapeHtml(rec.checkIn)}</span></div></td>
                  <td class="mono-cell" style="color:#9ca3af">${escapeHtml(rec.checkOut)}</td>
                  <td style="font-family:var(--font-orbitron);font-size:13px;font-weight:600;color:${NEON_GREEN}">${rec.hoursWorked > 0 ? `${rec.hoursWorked}h` : '—'}</td>
                  <td>${badge(rec.status.toUpperCase(), attendanceColor(rec.status))}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table></div>
        </div>
      </section>
    </div>
  `;
}

function attachAttendanceEvents() {
  document.getElementById('export-attendance')?.addEventListener('click', () => toast('Attendance report exported!'));
  document.getElementById('attendance-date')?.addEventListener('change', (e) => { ui.attendanceDate = e.target.value; render(); });
  document.getElementById('attendance-status')?.addEventListener('change', (e) => { ui.attendanceStatus = e.target.value; render(); });
}

function attachPageEvents(current) {
  if (current === 'employees') attachEmployeesEvents();
  if (current === 'payroll') attachPayrollEvents();
  if (current === 'time-off') attachTimeOffEvents();
  if (current === 'attendance') attachAttendanceEvents();
}

function showModal(content, size = '') {
  modalRoot().innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <section class="modal-panel ${size}">
        <button class="modal-close" data-close-modal aria-label="Close modal">${icon('x', 14)}</button>
        ${content}
      </section>
    </div>
  `;
  modalRoot().querySelectorAll('[data-close-modal]').forEach((button) => button.addEventListener('click', closeModal));
  document.getElementById('modal-backdrop')?.addEventListener('click', (event) => {
    if (event.target.id === 'modal-backdrop') closeModal();
  });
}

function closeModal() {
  modalRoot().innerHTML = '';
}

function showFormErrors(errors, prefix = 'emp-') {
  document.querySelectorAll('.field-error').forEach((el) => { el.hidden = true; el.textContent = ''; });
  document.querySelectorAll('.input.error, .select.error, .textarea.error').forEach((el) => el.classList.remove('error'));
  Object.entries(errors).forEach(([field, message]) => {
    const error = document.getElementById(`err-${field}`);
    const input = document.getElementById(`${prefix}${field}`);
    if (error) { error.hidden = false; error.textContent = message; }
    input?.classList.add('error');
  });
}

function badge(text, color) {
  return `<span class="badge" style="background:${hexToRgba(color, .15)}; border:1px solid ${hexToRgba(color, .35)}; color:${color}">${escapeHtml(text)}</span>`;
}
function hexToRgba(hex, alpha) {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const r = parseInt(full.substring(0, 2), 16);
  const g = parseInt(full.substring(2, 4), 16);
  const b = parseInt(full.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
function statusColor(status) { return status === 'approved' ? NEON_GREEN : status === 'pending' ? NEON_GOLD : NEON_RED; }
function employeeStatusColor(status) { return status === 'active' ? NEON_GREEN : status === 'on-leave' ? NEON_GOLD : status === 'inactive' ? NEON_RED : MUTED; }
function payrollStatusColor(status) { return status === 'paid' ? NEON_GREEN : status === 'processed' ? NEON_BLUE : status === 'pending' ? NEON_GOLD : MUTED; }
function typeColor(type) { return type === 'vacation' ? NEON_BLUE : type === 'sick' ? NEON_RED : type === 'personal' ? '#c084fc' : MUTED; }
function attendanceColor(status) { return status === 'present' ? NEON_GREEN : status === 'absent' ? NEON_RED : status === 'late' ? NEON_GOLD : status === 'half-day' ? NEON_BLUE : MUTED; }
function attendanceStatusIcon(status) {
  const map = { present: ['checkCircle', NEON_GREEN], absent: ['xCircle', NEON_RED], late: ['clock', NEON_GOLD], 'half-day': ['calendar', MUTED] };
  const [name, color] = map[status] || ['calendar', MUTED];
  return `<span style="color:${color};display:inline-flex">${icon(name, 14)}</span>`;
}

function lineChart(data, series, xKey) {
  const width = 560, height = 240, left = 42, right = 16, top = 18, bottom = 38;
  const chartW = width - left - right, chartH = height - top - bottom;
  const max = Math.max(...data.flatMap((d) => series.map((s) => d[s.key])), 10);
  const min = Math.min(0, ...data.flatMap((d) => series.map((s) => d[s.key])));
  const x = (i) => left + (i * chartW) / Math.max(data.length - 1, 1);
  const y = (v) => top + chartH - ((v - min) / (max - min || 1)) * chartH;
  const grid = [0, .25, .5, .75, 1].map((p) => `<line class="grid-line" x1="${left}" x2="${width - right}" y1="${top + chartH * p}" y2="${top + chartH * p}"/>`).join('');
  const lines = series.map((s) => {
    const points = data.map((d, i) => `${x(i)},${y(d[s.key])}`).join(' ');
    const dots = data.map((d, i) => `<circle cx="${x(i)}" cy="${y(d[s.key])}" r="3" fill="${s.color}" filter="drop-shadow(0 0 4px ${s.color})"><title>${s.label}: ${d[s.key]}</title></circle>`).join('');
    return `<polyline points="${points}" fill="none" stroke="${s.color}" stroke-width="2" filter="drop-shadow(0 0 4px ${s.color})"/>${dots}`;
  }).join('');
  const labels = data.map((d, i) => `<text class="axis-text" x="${x(i)}" y="${height - 12}" text-anchor="middle">${escapeHtml(d[xKey])}</text>`).join('');
  return `<svg class="chart-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">${grid}${lines}${labels}</svg>${legend(series)}`;
}

function barChart(data, series, xKey, colorful = false) {
  const width = 560, height = 240, left = 38, right = 16, top = 14, bottom = 54;
  const chartW = width - left - right, chartH = height - top - bottom;
  const max = Math.max(...data.flatMap((d) => series.map((s) => d[s.key])), 1);
  const groupW = chartW / Math.max(data.length, 1);
  const barW = Math.min(18, (groupW - 12) / series.length);
  const grid = [0, .25, .5, .75, 1].map((p) => `<line class="grid-line" x1="${left}" x2="${width - right}" y1="${top + chartH * p}" y2="${top + chartH * p}"/>`).join('');
  const bars = data.map((d, i) => {
    const baseX = left + i * groupW + groupW / 2 - (barW * series.length) / 2;
    return series.map((s, si) => {
      const val = d[s.key] || 0;
      const h = (val / max) * chartH;
      const color = colorful ? CHART_COLORS[i % CHART_COLORS.length] : s.color;
      return `<rect x="${baseX + si * barW}" y="${top + chartH - h}" width="${barW}" height="${h}" rx="3" fill="${color}" filter="drop-shadow(0 0 4px ${color})"><title>${escapeHtml(d[xKey])} · ${s.label}: ${val}</title></rect>`;
    }).join('');
  }).join('');
  const labels = data.map((d, i) => {
    const tx = left + i * groupW + groupW / 2;
    return `<text class="axis-text" x="${tx}" y="${height - 12}" text-anchor="middle" transform="${colorful ? `rotate(-35 ${tx} ${height - 12})` : ''}">${escapeHtml(String(d[xKey]).slice(0, 11))}</text>`;
  }).join('');
  return `<svg class="chart-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">${grid}${bars}${labels}</svg>${legend(colorful ? data.map((d, i) => ({ label: d[xKey], color: CHART_COLORS[i % CHART_COLORS.length] })) : series)}`;
}

function pieChart(data, nameKey, valueKey, colorMap = null) {
  const total = data.reduce((sum, d) => sum + d[valueKey], 0);
  if (!total) return '<div class="empty-chart">// NO DATA</div>';
  const cx = 120, cy = 110, r = 82, inner = 52;
  let angle = -90;
  const paths = data.map((d, i) => {
    const value = d[valueKey];
    const slice = (value / total) * 360;
    const start = polar(cx, cy, r, angle);
    const end = polar(cx, cy, r, angle + slice);
    const innerStart = polar(cx, cy, inner, angle + slice);
    const innerEnd = polar(cx, cy, inner, angle);
    const large = slice > 180 ? 1 : 0;
    const color = colorMap?.[d[nameKey]] || CHART_COLORS[i % CHART_COLORS.length];
    angle += slice;
    return `<path d="M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y} L ${innerStart.x} ${innerStart.y} A ${inner} ${inner} 0 ${large} 0 ${innerEnd.x} ${innerEnd.y} Z" fill="${color}" filter="drop-shadow(0 0 5px ${color})"><title>${escapeHtml(d[nameKey])}: ${value}</title></path>`;
  }).join('');
  const items = data.map((d, i) => ({ label: `${d[nameKey]} (${d[valueKey]})`, color: colorMap?.[d[nameKey]] || CHART_COLORS[i % CHART_COLORS.length] }));
  return `<svg class="chart-svg" viewBox="0 0 240 220">${paths}<circle cx="${cx}" cy="${cy}" r="${inner - 4}" fill="#0a0a1e"/></svg>${legend(items)}`;
}
function polar(cx, cy, r, angle) {
  const rad = (angle - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
function legend(items) {
  return `<div class="legend">${items.map((s) => `<span class="legend-item"><i class="legend-dot" style="background:${s.color};color:${s.color}"></i>${escapeHtml(s.label)}</span>`).join('')}</div>`;
}

window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  if (!window.location.hash) window.location.hash = isAuthenticated() ? '#/dashboard' : '#/login';
  render();
});
