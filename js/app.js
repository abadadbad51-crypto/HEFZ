
// ==============================
// INIT APP
// ==============================
function initApp() {
  if (!currentUser) return; // حماية من null
  loadSavedTheme();
  // Sync institute name to sidebar
  const instNameEl = document.getElementById('sidebarInstituteName');
  if (instNameEl && typeof INSTITUTE !== 'undefined') instNameEl.textContent = INSTITUTE.name;
  // Sync login screen institute info
  const loginNameEl = document.getElementById('loginInstituteName');
  if (loginNameEl && typeof INSTITUTE !== 'undefined') loginNameEl.textContent = INSTITUTE.name;
  const loginSubEl = document.getElementById('loginInstituteSubtitle');
  if (loginSubEl && typeof INSTITUTE !== 'undefined') loginSubEl.textContent = INSTITUTE.subtitle;
  const loginCityEl = document.getElementById('loginInstituteCity');
  if (loginCityEl && typeof INSTITUTE !== 'undefined') loginCityEl.textContent = '📍 ' + INSTITUTE.city;
  // Date
  const now = new Date();
  document.getElementById('pageDate').textContent = now.toLocaleDateString('ar-SA',{weekday:'long',year:'numeric',month:'long',day:'numeric'});

  // Avatar — نص فقط (textContent آمن)
  const av = document.getElementById('sidebarAvatar');
  av.textContent = (currentUser.name||'?').charAt(0);
  av.style.background = currentUser.color+'30';
  av.style.color = currentUser.color;
  av.style.border = '2px solid '+currentUser.color+'50';

  document.getElementById('sidebarName').textContent = currentUser.name || '';
  document.getElementById('sidebarRole').textContent = currentLang==='en'
    ? {admin:'System Admin',teacher:'Circle Teacher',parent:'Parent'}[currentUser.role]
    : {admin:'مدير النظام',teacher:'معلم حلقة',parent:'ولي أمر'}[currentUser.role];

  buildNav();
  buildNotifPanel();
  navigateTo(getDefaultPage());

  // ── ابدأ المزامنة الفورية مع Firebase ──
  if (window.startFirebaseSync) window.startFirebaseSync();
}

// ==============================
// NAVIGATION
// ==============================
const navConfig = {
  admin:[
    {section:'الرئيسية',     sectionEn:'Main'},
    {id:'dashboard',  icon:'📊', label:'لوحة التحكم',          labelEn:'Dashboard'},
    {id:'analytics',  icon:'📈', label:'الإحصائيات المتقدمة',   labelEn:'Analytics'},
    {section:'إدارة الحلقات', sectionEn:'Halaqa Management'},
    {id:'students',   icon:'👥', label:'الطلاب',               labelEn:'Students'},
    {id:'teachers',   icon:'👨‍🏫', label:'المعلمون',            labelEn:'Teachers'},
    {id:'employees',  icon:'🧑‍💼', label:'الموظفون',            labelEn:'Employees'},
    {id:'circles',    icon:'🕌', label:'الحلقات',              labelEn:'Quran Halaqas'},
    {id:'attendance', icon:'✅', label:'الحضور والغياب',        labelEn:'Attendance'},
    {id:'calendar',   icon:'📅', label:'التقويم',              labelEn:'Calendar'},
    {section:'التحفيز والمتابعة', sectionEn:'Motivation & Follow-up'},
    {id:'rewards',       icon:'🏆', label:'نقاط المكافآت',     labelEn:'Rewards'},
    {id:'finance',       icon:'💰', label:'النظام المالي',      labelEn:'Finance'},
    {id:'reports',       icon:'📋', label:'التقارير',           labelEn:'Reports'},
    {id:'audit',         icon:'🧾', label:'سجل العمليات',       labelEn:'Audit Log'},
    {id:'notifications', icon:'🔔', label:'الإشعارات', badge:3, labelEn:'Notifications'},
    {id:'settings',      icon:'⚙️', label:'الإعدادات',          labelEn:'Settings'},
  ],
  teacher:[
    {section:'الرئيسية', sectionEn:'Main'},
    {id:'t-dashboard',   icon:'📊', label:'لوحة المعلم',       labelEn:'Dashboard'},
    {section:'الحلقة', sectionEn:'Halaqa'},
    {id:'t-students',    icon:'👥', label:'طلابي',             labelEn:'My Students'},
    {id:'t-session',     icon:'📖', label:'تسجيل الجلسة',      labelEn:'Record Session'},
    {id:'t-attendance',  icon:'✅', label:'الحضور',            labelEn:'Attendance'},
    {id:'t-messages',    icon:'💬', label:'رسائل الأولياء',    labelEn:'Parent Messages'},
    {section:'التقارير', sectionEn:'Reports'},
    {id:'t-plans',       icon:'📝', label:'خطط الحفظ',         labelEn:'Study Plans'},
    {id:'t-reports',     icon:'📋', label:'تقارير الطلاب',     labelEn:'Student Reports'},
  ],
  parent:[
    {section:'متابعة الطالب', sectionEn:'Student Follow-up'},
    {id:'p-dashboard',      icon:'🏠', label:'الصفحة الرئيسية', labelEn:'Home'},
    {id:'p-map',            icon:'🗺️', label:'خريطة الحفظ',    labelEn:'Memorization Map'},
    {id:'p-exam',           icon:'📝', label:'اختبار الحفظ',    labelEn:'Exam'},
    {id:'p-progress',       icon:'📈', label:'تقدم الحفظ',     labelEn:'Progress'},
    {id:'p-finance',        icon:'💰', label:'الرسوم والمدفوعات', labelEn:'Fees & Payments'},
    {id:'p-messages',       icon:'💬', label:'رسائل المعلم',   labelEn:'Teacher Messages'},
    {id:'p-reports',        icon:'📋', label:'التقارير الدورية', labelEn:'Reports'},
    {id:'p-notifications',  icon:'🔔', label:'الإشعارات', badge:2, labelEn:'Notifications'},
  ],
};

function buildNav() {
  const nav = document.getElementById('sidebarNav');
  nav.innerHTML = '';
  const isEn = currentLang === 'en';
  const config = navConfig[currentUser.role] || navConfig['admin'];
  config.forEach(item=>{
    if (item.section) {
      const sec = escapeHtml(isEn ? (item.sectionEn || item.section) : item.section);
      nav.innerHTML += `<div class="nav-section">${sec}</div>`;
    } else {
      const label = escapeHtml(isEn ? (item.labelEn || item.label) : item.label);
      const icon  = escapeHtml(item.icon || '');
      const id    = escapeHtml(item.id || '');
      nav.innerHTML += `
        <div class="nav-item" id="nav-${id}" onclick="navigateTo('${id}')">
          <span class="nav-icon">${icon}</span>
          ${label}
          ${item.badge?`<span class="nav-badge">${Number(item.badge)||0}</span>`:''}
        </div>`;
    }
  });
}

function getDefaultPage() {
  return {admin:'dashboard', teacher:'t-dashboard', parent:'p-dashboard'}[currentUser.role] || 'dashboard';
}

function navigateTo(pageId) {
  currentPage = pageId;
  // أغلق الـ sidebar تلقائياً عند الانتقال (موبايل)
  closeSidebar();
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  const navEl = document.getElementById('nav-'+pageId);
  if (navEl) navEl.classList.add('active');

  const titles = {
    'dashboard':       currentLang==='en' ? 'Admin Dashboard'      : 'لوحة التحكم',
    'analytics':       currentLang==='en' ? 'Advanced Analytics'   : 'الإحصائيات المتقدمة',
    'students':        currentLang==='en' ? 'Students'             : 'إدارة الطلاب',
    'teachers':        currentLang==='en' ? 'Teachers'             : 'إدارة المعلمين',
    'employees':       currentLang==='en' ? 'Employees'            : 'إدارة الموظفين',
    'circles':         currentLang==='en' ? 'Quran Halaqas'        : 'الحلقات القرآنية',
    'attendance':      currentLang==='en' ? 'Attendance'           : 'الحضور والغياب',
    'calendar':        currentLang==='en' ? 'Calendar'             : 'التقويم',
    'rewards':         currentLang==='en' ? 'Rewards'              : 'نقاط المكافآت',
    'finance':         currentLang==='en' ? 'Finance'              : 'النظام المالي',
    'reports':         currentLang==='en' ? 'Reports'              : 'التقارير',
    'audit':           currentLang==='en' ? 'Audit Log'            : 'سجل العمليات',
    'notifications':   currentLang==='en' ? 'Notifications'        : 'الإشعارات',
    'settings':        currentLang==='en' ? 'Settings'             : 'الإعدادات',
    't-dashboard':     currentLang==='en' ? 'Teacher Dashboard'    : 'لوحة المعلم',
    't-students':      currentLang==='en' ? 'My Students'          : 'طلابي',
    't-session':       currentLang==='en' ? 'Record Session'       : 'تسجيل الجلسة',
    't-attendance':    currentLang==='en' ? 'Attendance'           : 'الحضور',
    't-messages':      currentLang==='en' ? 'Parent Messages'      : 'رسائل الأولياء',
    't-plans':         currentLang==='en' ? 'Study Plans'          : 'خطط الحفظ',
    't-reports':       currentLang==='en' ? 'Student Reports'      : 'تقارير الطلاب',
    't-notifications': currentLang==='en' ? 'Notifications'        : 'الإشعارات',
    'p-dashboard':     currentLang==='en' ? 'Home'                 : 'الصفحة الرئيسية',
    'p-map':           currentLang==='en' ? 'Memorization Map'     : 'خريطة الحفظ',
    'p-exam':          currentLang==='en' ? 'Memorization Exam'    : 'اختبار الحفظ',
    'p-progress':      currentLang==='en' ? 'Progress'             : 'تقدم الحفظ',
    'p-finance':       currentLang==='en' ? 'Fees & Payments'      : 'الرسوم والمدفوعات',
    'p-messages':      currentLang==='en' ? 'Teacher Messages'     : 'رسائل المعلم',
    'p-reports':       currentLang==='en' ? 'Reports'              : 'التقارير الدورية',
    'p-notifications': currentLang==='en' ? 'Notifications'        : 'الإشعارات',
  };
  document.getElementById('pageTitle').textContent = titles[pageId] || pageId;

  const container = document.getElementById('pagesContainer');
  container.innerHTML = '';
  const page = document.createElement('div');
  page.className = 'page active';
  page.id = 'page-'+pageId;
  container.appendChild(page);

  const renderFn = pages[pageId];
  if (renderFn) renderFn(page);
  updateFabVisibility();
  closeFab();
  updateBottomNav();
}

// ==============================
// NOTIFICATIONS
// ==============================
function buildNotifPanel() {
  const list = document.getElementById('notifList');
  list.innerHTML = '';
  DB.notifications.forEach(n=>{
    const cls = n.type==='alert'?'alert':n.type==='warn'?'warn':'';
    const safeMsg  = escapeHtml(n.msg  || '');
    const safeTime = escapeHtml(n.time || '');
    list.innerHTML += `
      <div class="notif-item ${cls}">
        ${safeMsg}
        <div class="notif-time">⏰ ${safeTime}</div>
      </div>`;
  });
  if (DB.notifications.length === 0) {
    list.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text-muted);font-size:.85rem">🔔 لا توجد إشعارات</div>';
  }
}

function toggleNotifPanel() {
  notifPanelOpen = !notifPanelOpen;
  const panel = document.getElementById('notifPanel');
  if (panel) panel.classList.toggle('open', notifPanelOpen);
  // إغلاق الـ sidebar إذا كان مفتوحاً
  if (notifPanelOpen) closeSidebar();
  document.body.style.overflow = notifPanelOpen ? 'hidden' : '';
}

// ==============================
// MODAL
// ==============================
function openModal(title, html) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = html;
  document.getElementById('modalOverlay').classList.add('open');
}
function closeModal(e) { if(e.target===document.getElementById('modalOverlay')) closeModalDirect(); }
function closeModalDirect() { document.getElementById('modalOverlay').classList.remove('open'); }

// ==============================
// TOAST
// ==============================
function showToast(msg, type) {
  const t = document.getElementById('toast');
  // إزالة كلاسات النوع السابقة
  t.className = 'toast';
  // تحديد النوع (success / error / warning / info)
  const toastType = type || detectToastType(msg);
  if (toastType) t.classList.add('toast-' + toastType);
  t.textContent = msg;
  t.classList.add('show');
  const duration = (toastType === 'error') ? 5000 : (toastType === 'warning') ? 4000 : 3000;
  clearTimeout(t._hideTimer);
  t._hideTimer = setTimeout(() => t.classList.remove('show'), duration);
}

function detectToastType(msg) {
  if (!msg) return 'info';
  const s = String(msg);
  if (s.includes('✅') || s.includes('تم') || s.includes('نجح') || s.includes('Success')) return 'success';
  if (s.includes('❌') || s.includes('خطأ') || s.includes('فشل') || s.includes('Error')) return 'error';
  if (s.includes('⚠️') || s.includes('تحذير') || s.includes('Warning')) return 'warning';
  return 'info';
}

// ==============================
// FLOATING ACTION BUTTON
// ==============================
window.toggleFab = function() {
  const fab = document.getElementById('teacherFab');
  const btn = document.getElementById('fabBtn');
  if (!fab) return;
  const isOpen = fab.classList.toggle('open');
  btn.style.transform = isOpen ? 'scale(1.05) rotate(45deg)' : '';
  btn.textContent = isOpen ? '✕' : '✏️';
};

window.closeFab = function() {
  const fab = document.getElementById('teacherFab');
  const btn = document.getElementById('fabBtn');
  if (!fab) return;
  fab.classList.remove('open');
  if (btn) { btn.style.transform=''; btn.textContent='✏️'; }
};

function updateFabVisibility() {
  const fab = document.getElementById('teacherFab');
  if (!fab) return;
  const teacherPages = ['t-dashboard','t-students','t-session','t-reports','t-plans','t-attendance','t-messages'];
  if (currentUser?.role === 'teacher' && teacherPages.includes(currentPage)) {
    fab.style.display = 'block';
    fab.style.animation = 'fabIn .4s cubic-bezier(.34,1.56,.64,1)';
  } else {
    fab.style.display = 'none';
    closeFab();
  }
}

// ==============================
// MOBILE: SIDEBAR TOGGLE
// ==============================
window.toggleSidebar = function() {
  var sb = document.getElementById('sidebar');
  if (!sb) return;
  if (sb.classList.contains('open')) { closeSidebar(); } else { openSidebar(); }
};

window.openSidebar = function() {
  var sb = document.getElementById('sidebar');
  var ov = document.getElementById('sidebarOverlay');
  if (sb) sb.classList.add('open');
  if (ov) ov.style.display = 'block';
};

window.closeSidebar = function() {
  var sb = document.getElementById('sidebar');
  var ov = document.getElementById('sidebarOverlay');
  if (sb) sb.classList.remove('open');
  if (ov) ov.style.display = 'none';
  document.body.classList.remove('sidebar-open');
};

// إغلاق لوحة الإشعارات عند الضغط خارجها
document.addEventListener('click', function(e) {
  const panel = document.getElementById('notifPanel');
  const bell  = document.querySelector('.notif-bell');
  if (notifPanelOpen && panel && !panel.contains(e.target) && bell && !bell.contains(e.target)) {
    notifPanelOpen = false;
    panel.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// Close sidebar on nav item click (mobile)
document.addEventListener('click', function(e) {
  const navItem = e.target.closest('.nav-item');
  if (navItem && window.innerWidth <= 768) {
    closeSidebar();
  }
});

// ==============================
// MOBILE: BOTTOM NAV BAR
// ==============================
function buildBottomNav() {
  const bn = document.getElementById('bottomNav');
  if (!bn || !currentUser) return;

  const navItems = {
    admin: [
      {icon:'🏠', label: currentLang==='en'?'Home':'الرئيسية',      page:'dashboard'},
      {icon:'👥', label: currentLang==='en'?'Students':'الطلاب',    page:'students'},
      {icon:'🧑‍💼', label: currentLang==='en'?'Staff':'الموظفون',   page:'employees'},
      {icon:'📈', label: currentLang==='en'?'Analytics':'إحصائيات', page:'analytics'},
      {icon:'💰', label: currentLang==='en'?'Finance':'المالية',    page:'finance'},
      {icon:'📅', label: currentLang==='en'?'Calendar':'التقويم',   page:'calendar'},
    ],
    teacher: [
      {icon:'🏠', label: currentLang==='en'?'Home':'الرئيسية',    page:'t-dashboard'},
      {icon:'👥', label: currentLang==='en'?'Students':'طلابي',    page:'t-students'},
      {icon:'📖', label: currentLang==='en'?'Session':'جلسة',      page:'t-session'},
      {icon:'✅', label: currentLang==='en'?'Attendance':'الحضور', page:'t-attendance'},
      {icon:'💬', label: currentLang==='en'?'Messages':'الرسائل', page:'t-messages'},
      {icon:'📋', label: currentLang==='en'?'Reports':'التقارير',  page:'t-reports'},
    ],
    parent: [
      {icon:'🏠', label: currentLang==='en'?'Home':'الرئيسية',      page:'p-dashboard'},
      {icon:'🗺️', label: currentLang==='en'?'Map':'خريطة الحفظ',   page:'p-map'},
      {icon:'📝', label: currentLang==='en'?'Exam':'الاختبار',      page:'p-exam'},
      {icon:'📈', label: currentLang==='en'?'Progress':'التقدم',    page:'p-progress'},
      {icon:'💰', label: currentLang==='en'?'Fees':'الرسوم',        page:'p-finance'},
      {icon:'🔔', label: currentLang==='en'?'Alerts':'الإشعارات',   page:'p-notifications'},
    ],
  };

  const items = navItems[currentUser.role] || navItems['admin'];
  bn.innerHTML = items.map(item => `
    <div class="bottom-nav-item ${currentPage === item.page ? 'active' : ''}"
         onclick="navigateTo('${item.page}');updateBottomNav()">
      <span class="bn-icon">${item.icon}</span>
      <span>${item.label}</span>
    </div>
  `).join('');
}

function updateBottomNav() {
  const items = document.querySelectorAll('.bottom-nav-item');
  items.forEach(item => {
    const page = item.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
    item.classList.toggle('active', page === currentPage);
  });
}

// ---- Date init ----
document.getElementById('pageDate').textContent = new Date().toLocaleDateString('ar-SA',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
// ---- تحميل البيانات ----
loadDB();
// تشفير كلمات المرور القديمة تلقائياً
migratePasswords();
// ---- اكتشاف Dark Mode من النظام (أول مرة فقط) ----
if (!localStorage.getItem('hifz_theme')) {
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  localStorage.setItem('hifz_theme', prefersDark ? 'dark' : 'emerald');
}
loadSavedTheme();
loadSavedLang();

// ---- INIT SCRIPT ----
document.addEventListener('DOMContentLoaded', function() {
  const pd = document.getElementById('pageDate');
  if (pd) pd.textContent = new Date().toLocaleDateString('ar-SA',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  if (typeof loadDB === 'function') loadDB();
  if (typeof migratePasswords === 'function') migratePasswords();
  if (typeof loadSavedTheme === 'function') loadSavedTheme();
  if (typeof loadSavedLang === 'function') loadSavedLang();
});
