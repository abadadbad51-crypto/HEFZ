// ==============================
// INTERNATIONALIZATION (i18n)
// ==============================
let currentLang = 'ar';

const T = {
  ar: {
    // ── Navigation ──
    analytics:'الإحصائيات المتقدمة', rewards:'نقاط المكافآت', calendar:'تقويم الحلقات',
    circles:'الحلقات القرآنية', attendance:'سجل الحضور والغياب',
    reports:'التقارير الشاملة', notifications:'الإشعارات', settings:'إعدادات النظام',
    't-dashboard':'لوحة المعلم', 't-students':'طلابي', 't-session':'تسجيل الجلسة',
    't-attendance':'الحضور', 't-plans':'خطط الحفظ', 't-reports':'تقارير الطلاب',
    't-notifications':'إشعارات المعلم', 'p-dashboard':'الصفحة الرئيسية',
    'p-progress':'تقدم الحفظ', 'p-reports':'التقارير الدورية', 'p-notifications':'الإشعارات',
    // ── Roles ──
    admin:'مدير النظام', teacher:'معلم حلقة', parent:'ولي أمر',
    roleAdmin:'المدير', roleTeacher:'المعلم', roleParent:'ولي الأمر',
    // ── Sidebar ──
    langLabel:'🌐 اللغة', logout:'🚪 تسجيل خروج',
    // ── Levels ──
    excellent:'متفوق', good:'جيد', average:'متوسط', weak:'ضعيف',
    // ── Buttons ──
    save:'💾 حفظ', cancel:'إلغاء', edit:'✏️ تعديل', delete:'🗑 حذف',
    send:'📤 إرسال', export:'📄 تصدير', viewAll:'عرض الكل', details:'تفاصيل',
    addStudent:'+ إضافة طالب', addCircle:'+ إضافة حلقة', addTeacher:'+ إضافة معلم',
    view:'عرض', back:'← رجوع', close:'✕ إغلاق', confirm:'تأكيد', search:'بحث...',
    // ── Attendance ──
    present:'حاضر', absent:'غائب', late:'متأخر',
    // ── Grades ──
    gradeExcellent:'ممتاز', gradeVGood:'جيد جداً', gradeGood:'جيد', gradePass:'مقبول', gradeFail:'ضعيف',
    // ── Dashboard stats ──
    totalStudents:'إجمالي الطلاب', memorizedPages:'صفحات محفوظة',
    attendanceRate:'نسبة الحضور', needSupport:'يحتاجون دعماً',
    urgentFollowup:'تحتاج متابعة عاجلة', clickToView:'← اضغط للعرض',
    weeklyActivity:'نشاط الحفظ الأسبوعي (آيات)', activeCircles:'الحلقات النشطة',
    topStudents:'أبرز الطلاب هذا الأسبوع', quranMap:'خريطة حفظ القرآن — إجمالي الطلاب',
    thisMonth:'↑ طالبان هذا الشهر', thisWeek:'↑ +٤٢ هذا الأسبوع',
    attendanceUp:'↑ +٣% عن الأسبوع',
    // ── Table headers ──
    thStudent:'الطالب', thCircle:'الحلقة', thLevel:'المستوى',
    thPages:'الصفحات المحفوظة', thAttendance:'الحضور',
    thLastSession:'آخر جلسة', thAction:'إجراء', thName:'الاسم',
    thPhone:'الهاتف', thSpecialization:'التخصص', thExperience:'الخبرة',
    thStatus:'الحالة', thDate:'التاريخ', thNew:'جديد', thReview:'مراجعة',
    thGrade:'التقييم', thNotes:'ملاحظات',
    // ── Student fields ──
    name:'الاسم', age:'العمر', level:'المستوى', circle:'الحلقة',
    plan:'خطة الحفظ', dailyAyah:'آيات يومياً', reviewDays:'أيام المراجعة',
    weeklyGoal:'الهدف الأسبوعي', currentSurah:'السورة الحالية',
    currentAyah:'الآية الحالية', memorized:'المحفوظات', sessions:'الجلسات',
    pages:'الصفحات', totalPages:'إجمالي الصفحات',
    // ── Session ──
    sessionDate:'تاريخ الجلسة', newMemorization:'حفظ جديد (آيات)',
    reviewAyahs:'مراجعة (آيات)', grade:'التقييم', notes:'ملاحظات',
    saveSession:'💾 حفظ الجلسة', surahName:'اسم السورة',
    fromAyah:'من آية', toAyah:'إلى آية',
    // ── Teacher fields ──
    specialization:'التخصص', experience:'سنوات الخبرة',
    joinDate:'تاريخ الالتحاق', bio:'نبذة تعريفية', phone:'الهاتف',
    // ── Circle fields ──
    time:'وقت الحلقة', days:'أيام الحلقة', room:'مكان الانعقاد',
    // ── Quran map ──
    complete:'مكتمل', partial:'جزئي', notStarted:'لم يبدأ',
    juz:'الجزء',
    // ── Status ──
    active:'نشط', inactive:'غير نشط',
    // ── Login ──
    loginTitle:'نظام إدارة المتكامل', chooseAccount:'اختر نوع الحساب',
    loginBtn:'🔐 دخول للنظام', emailLabel:'البريد الإلكتروني',
    passLabel:'كلمة المرور', forgotPass:'🔑 نسيت كلمة المرور؟',
    noAccount:'ليس لديك حساب؟', createAccount:'إنشاء حساب جديد',
    // ── Notifications ──
    noNotifs:'لا توجد إشعارات حالياً', markAllRead:'تحديد الكل كمقروء',
    // ── Settings ──
    instituteName:'اسم المعهد', instituteSubtitle:'التخصص', instituteCity:'المدينة',
    changePass:'تغيير كلمة المرور', currentPass:'كلمة المرور الحالية',
    newPass:'كلمة المرور الجديدة', confirmPass:'تأكيد كلمة المرور الجديدة',
    // ── Reports ──
    reportAllStudents:'تقرير جميع الطلاب', reportByCircle:'حسب الحلقة',
    reportWeak:'الطلاب الضعاف', reportAttendance:'الحضور والغياب',
    printReport:'🖨️ طباعة التقرير', exportReport:'📄 تصدير',
    // ── Empty states ──
    noStudents:'لا يوجد طلاب مسجلون بعد', noCircles:'لا توجد حلقات بعد',
    noTeachers:'لا يوجد معلمون بعد', noSessions:'لا توجد جلسات مسجلة بعد',
    addFirst:'ابدأ بالإضافة من الأعلى',
    // ── Days ──
    days_sat:'سبت', days_sun:'أحد', days_mon:'اثن', days_tue:'ثلا',
    days_wed:'أرب', days_thu:'خمس', days_fri:'جمع',
  },
  en: {
    // ── Navigation ──
    dashboard:'Dashboard', students:'Students', teachers:'Teachers',
    circles:'Quran Circles', attendance:'Attendance',
    reports:'Reports', notifications:'Notifications', settings:'Settings',
    't-dashboard':'Teacher Dashboard', 't-students':'My Students', 't-session':'Record Session',
    't-attendance':'Attendance', 't-plans':'Study Plans', 't-reports':'Student Reports',
    't-notifications':'Notifications', 'p-dashboard':'Home',
    'p-progress':'Progress', 'p-reports':'Reports', 'p-notifications':'Notifications',
    // ── Roles ──
    admin:'System Admin', teacher:'Circle Teacher', parent:'Parent',
    roleAdmin:'Admin', roleTeacher:'Teacher', roleParent:'Parent',
    // ── Sidebar ──
    langLabel:'🌐 Language', logout:'🚪 Log Out',
    // ── Levels ──
    excellent:'Advanced', good:'Good', average:'Average', weak:'Weak',
    // ── Buttons ──
    save:'💾 Save', cancel:'Cancel', edit:'✏️ Edit', delete:'🗑 Delete',
    send:'📤 Send', export:'📄 Export', viewAll:'View All', details:'Details',
    addStudent:'+ Add Student', addCircle:'+ Add Circle', addTeacher:'+ Add Teacher',
    view:'View', back:'← Back', close:'✕ Close', confirm:'Confirm', search:'Search...',
    // ── Attendance ──
    present:'Present', absent:'Absent', late:'Late',
    // ── Grades ──
    gradeExcellent:'Excellent', gradeVGood:'Very Good', gradeGood:'Good', gradePass:'Pass', gradeFail:'Fail',
    // ── Dashboard stats ──
    totalStudents:'Total Students', memorizedPages:'Memorized Pages',
    attendanceRate:'Attendance Rate', needSupport:'Need Support',
    urgentFollowup:'Urgent follow-up needed', clickToView:'← Click to view',
    weeklyActivity:'Weekly Memorization Activity (Verses)', activeCircles:'Active Circles',
    topStudents:'Top Students This Week', quranMap:'Quran Memorization Map — All Students',
    thisMonth:'↑ 2 students this month', thisWeek:'↑ +42 this week',
    attendanceUp:'↑ +3% vs last week',
    // ── Table headers ──
    thStudent:'Student', thCircle:'Circle', thLevel:'Level',
    thPages:'Memorized Pages', thAttendance:'Attendance',
    thLastSession:'Last Session', thAction:'Action', thName:'Name',
    thPhone:'Phone', thSpecialization:'Specialization', thExperience:'Experience',
    thStatus:'Status', thDate:'Date', thNew:'New', thReview:'Review',
    thGrade:'Grade', thNotes:'Notes',
    // ── Student fields ──
    name:'Name', age:'Age', level:'Level', circle:'Circle',
    plan:'Study Plan', dailyAyah:'Daily Verses', reviewDays:'Review Days',
    weeklyGoal:'Weekly Goal', currentSurah:'Current Surah',
    currentAyah:'Current Verse', memorized:'Memorized', sessions:'Sessions',
    pages:'Pages', totalPages:'Total Pages',
    // ── Session ──
    sessionDate:'Session Date', newMemorization:'New Memorization (Verses)',
    reviewAyahs:'Review (Verses)', grade:'Grade', notes:'Notes',
    saveSession:'💾 Save Session', surahName:'Surah Name',
    fromAyah:'From Verse', toAyah:'To Verse',
    // ── Teacher fields ──
    specialization:'Specialization', experience:'Years of Experience',
    joinDate:'Join Date', bio:'Biography', phone:'Phone',
    // ── Circle fields ──
    time:'Session Time', days:'Session Days', room:'Location',
    // ── Quran map ──
    complete:'Complete', partial:'Partial', notStarted:'Not Started',
    juz:'Juz',
    // ── Status ──
    active:'Active', inactive:'Inactive',
    // ── Login ──
    loginTitle:'Integrated Management System', chooseAccount:'Choose Account Type',
    loginBtn:'🔐 Sign In', emailLabel:'Email Address',
    passLabel:'Password', forgotPass:'🔑 Forgot password?',
    noAccount:"Don't have an account?", createAccount:'Create Account',
    // ── Notifications ──
    noNotifs:'No notifications yet', markAllRead:'Mark all as read',
    // ── Settings ──
    instituteName:'Institute Name', instituteSubtitle:'Subtitle', instituteCity:'City',
    changePass:'Change Password', currentPass:'Current Password',
    newPass:'New Password', confirmPass:'Confirm New Password',
    // ── Reports ──
    reportAllStudents:'All Students Report', reportByCircle:'By Circle',
    reportWeak:'Weak Students', reportAttendance:'Attendance Report',
    printReport:'🖨️ Print Report', exportReport:'📄 Export',
    // ── Empty states ──
    noStudents:'No students registered yet', noCircles:'No Halaqas yet',
    noTeachers:'No teachers yet', noSessions:'No sessions recorded yet',
    addFirst:'Start by adding one above',
    // ── Days ──
    days_sat:'Sat', days_sun:'Sun', days_mon:'Mon', days_tue:'Tue',
    days_wed:'Wed', days_thu:'Thu', days_fri:'Fri',
  }
};

function t(key) {
  return (T[currentLang] && T[currentLang][key]) || (T['ar'][key]) || key;
}

// ── tt(ar, en): مساعد للنصوص الديناميكية ضمن قوالب الصفحات ──
// يحلّ محل النمط القديم: currentLang === 'en' ? 'X' : 'Y'
// الاستخدام: ${tt('اليوم', 'Today')}
function tt(ar, en) {
  return currentLang === 'en' ? (en || ar) : (ar || en);
}

// Apply lang to all static elements on the page
function applyLangToDOM(lang) {
  const isEn = lang === 'en';
  document.documentElement.setAttribute('dir', isEn ? 'ltr' : 'rtl');
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.style.fontFamily = isEn ? "'Tajawal', sans-serif" : "'Tajawal', sans-serif";

  // Sidebar
  const lbl = document.getElementById('langLabel');
  if (lbl) lbl.textContent = t('langLabel');
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.textContent = t('logout');
  const langBtns = document.getElementById('lang-ar');
  if (langBtns) {
    document.getElementById('lang-ar')?.classList.toggle('active', !isEn);
    document.getElementById('lang-en')?.classList.toggle('active', isEn);
  }
  // Sidebar role
  if (currentUser) {
    const roleMap = { admin: t('admin'), teacher: t('teacher'), parent: t('parent') };
    const roleEl = document.getElementById('sidebarRole');
    if (roleEl) roleEl.textContent = roleMap[currentUser.role] || '';
  }
  // Login screen static elements
  const loginSubEl = document.getElementById('loginInstituteSubtitle');
  const loginSubEl2 = document.getElementById('sidebarInstituteSubtitle');
  if (loginSubEl2) loginSubEl2.textContent = isEn ? 'Management System' : 'نظام الإدارة المتكامل';

  // Top bar title
  const pageTitle = document.getElementById('pageTitle');
  if (pageTitle && currentPage) {
    const titles = {
      dashboard: isEn ? 'Admin Dashboard' : 'لوحة التحكم — المدير',
    };
    if (titles[currentPage]) pageTitle.textContent = titles[currentPage];
  }
}

window.setLang = function(lang) {
  currentLang = lang;
  localStorage.setItem('hifzLang', lang);
  applyLangToDOM(lang);
  buildNav();
  if (currentPage) navigateTo(currentPage);
  showToast(lang === 'en' ? '🌐 Language: English' : '🌐 اللغة: العربية');
};

function loadSavedLang() {
  const saved = localStorage.getItem('hifzLang') || 'ar';
  currentLang = saved;
  applyLangToDOM(saved);
}
