// ==============================
// DATA STORE
// ==============================
// ==============================
// APP STATE
// ==============================
var currentUser = null;
var currentRole = 'admin';
var currentPage = '';
var notifPanelOpen = false;

// ── Institute configuration ──
const INSTITUTE = {
  name: 'معهد نور القرآن الكريم',
  subtitle: 'لتحفيظ القرآن الكريم وعلومه',
  city: 'دمشق',
  logo: '☪️',
};

const DB = {
  users: [
    {id:1,role:'admin',name:'المدير',email:'admin@hifz.com',pass:'03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4',color:'#6e3f28'},
  ],
  students: [],
  circles: [],
  notifications: [],
  weeklyData: [0,0,0,0,0,0,0],
  attendance: {},
  rewards: {},    // { studentId: { points, badges:[] } }
  calendar: [],   // [ { id, title, date, type, circleId, color, note } ]
  branches: [],
  auditLog: [],
  messages: [],
  employees: [],
  financeSettings: {
    currency: 'SYP',
    defaultFee: 0,
    dueDay: 1,
    lateAfterDays: 10,
  },
  transactions: [],
}

// ════════════════════════════════════════════════════════
// DB PERSISTENCE — save/load from localStorage
// ════════════════════════════════════════════════════════
const DB_KEY = 'hifz_db_v1';
const FIREBASE_SYNC_OPT_IN_KEY = 'hifz_allow_unsafe_firebase_rest_sync';
const LEGACY_BRAND_COLORS = {
  '#22a86f': '#6e3f28',
  '#4a9fd4': '#3d6975',
  '#e07830': '#92512c',
  '#d4a017': '#836128',
  '#9b6fd4': '#6e3f28',
  '#e05555': '#a7352a',
  '#44b8a8': '#6f7c5a',
  '#60b0f0': '#3d6975',
  '#f0b860': '#b79758',
};

function isFirebaseRestSyncEnabled() {
  if (localStorage.getItem(FIREBASE_SYNC_OPT_IN_KEY) === '1') {
    console.warn('Unsafe Firebase REST sync is blocked. Use Firebase Auth/SDK before enabling shared sync.');
  }
  return false;
}

function normalizeLegacyBrandColors() {
  let changed = false;
  DB.users.forEach(user => {
    const current = String(user.color || '').toLowerCase();
    if (LEGACY_BRAND_COLORS[current]) {
      user.color = LEGACY_BRAND_COLORS[current];
      changed = true;
    }
  });
  return changed;
}

function saveDB() {
  try {
    const snapshot = JSON.parse(JSON.stringify(DB));
    // حفظ محلي (يشتغل بدون إنترنت)
    localStorage.setItem(DB_KEY, JSON.stringify(snapshot));
    // مزامنة REST المباشرة متوقفة افتراضياً حتى توجد قواعد أمان/Backend صريح.
    if (isFirebaseRestSyncEnabled() && window.saveToFirebase) window.saveToFirebase(snapshot);
  } catch(e) {
    console.warn('DB save failed:', e.message);
  }
}

function loadDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return; // First run — use defaults
    const saved = JSON.parse(raw);
    if (saved.users)         DB.users         = saved.users;
    if (saved.students)      DB.students      = saved.students;
    if (saved.circles)       DB.circles       = saved.circles;
    if (saved.notifications) DB.notifications = saved.notifications;
    if (saved.attendance)    DB.attendance    = saved.attendance;
    if (saved.rewards)       DB.rewards       = saved.rewards;
    if (saved.calendar)      DB.calendar      = saved.calendar;
    if (saved.branches)      DB.branches      = saved.branches;
    if (saved.auditLog)      DB.auditLog      = saved.auditLog;
    if (saved.messages)      DB.messages      = saved.messages;
    if (saved.employees)     DB.employees     = saved.employees;
    if (saved.financeSettings) DB.financeSettings = Object.assign(DB.financeSettings || {}, saved.financeSettings);
    if (saved.transactions)  DB.transactions  = saved.transactions;
    if (typeof ensureStudentLearningDefaults === 'function') {
      DB.students.forEach(ensureStudentLearningDefaults);
    }
    if (normalizeLegacyBrandColors()) {
      localStorage.setItem(DB_KEY, JSON.stringify(JSON.parse(JSON.stringify(DB))));
    }
  } catch(e) {
    console.warn('DB load failed:', e.message);
  }
}

// Auto-save wrapper — patches all mutating functions
function autoSave(fn) {
  return function(...args) {
    const result = fn.apply(this, args);
    saveDB();
    return result;
  };
}

// ====== FIREBASE REST API — بدون أي مكتبة خارجية ======
(function() {
  var BASE_URL = 'https://hifz-17bc4-default-rtdb.firebaseio.com/hifzDB.json';

  if (!isFirebaseRestSyncEnabled()) {
    console.warn('Firebase REST sync disabled: using localStorage only.');
    window.saveToFirebase = function() {};
    window.startFirebaseSync = function() {};
    window.cleanFirebaseUsers = function() {};
    return;
  }

  // إذا الملف مفتوح من file:// — Firebase لن يعمل، نستخدم localStorage فقط
  var isLocalFile = window.location.protocol === 'file:';
  if (isLocalFile) {
    console.log('ℹ️ وضع offline — البيانات محفوظة محلياً فقط');
    window.saveToFirebase = function() {};
    window.startFirebaseSync = function() {};
    window.cleanFirebaseUsers = function() {};
    return;
  }

  // حفظ البيانات على Firebase
  window.saveToFirebase = function(data) {
    fetch(BASE_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(function(r) {
      if (r.ok) console.log('✅ Firebase: تم الحفظ');
      else console.warn('⚠️ Firebase: خطأ في الحفظ', r.status);
    })
    .catch(function() {}); // صامت
  };

  // تنظيف Firebase عند التحميل: احذف أي مستخدمين قدامى بدور teacher/parent
  window.cleanFirebaseUsers = function() {
    fetch(BASE_URL)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (!data || !data.users) return;
        // إذا Firebase فيه teacher أو parent — احذفهم ونظّف
        var hasDirtyUsers = data.users.some(function(u) {
          return u.role === 'teacher' || u.role === 'parent';
        });
        if (hasDirtyUsers) {
          // ابقِ فقط المستخدمين الـ admin
          var cleanUsers = data.users.filter(function(u) { return u.role === 'admin'; });
          // إذا ما فيه admin في Firebase، استخدم المستخدمين المحليين
          if (cleanUsers.length === 0) cleanUsers = DB.users.filter(function(u) { return u.role === 'admin'; });
          data.users = cleanUsers;
          // احفظ الـ Firebase نظيفاً
          fetch(BASE_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          }).then(function() {
            console.log('🧹 تم تنظيف Firebase من البيانات القديمة');
            // حدّث DB المحلي
            DB.students      = data.students      || [];
            DB.circles       = data.circles       || [];
            DB.attendance    = data.attendance    || {};
            DB.notifications = data.notifications || [];
            DB.weeklyData    = data.weeklyData    || [0,0,0,0,0,0,0];
            // دمج المستخدمين: Firebase admins + المحليين
            var merged = cleanUsers.slice();
            DB.users.forEach(function(u) {
              var exists = merged.find(function(x) { return x.id === u.id; });
              if (!exists) merged.push(u);
            });
            DB.users = merged;
          });
        } else {
          // Firebase نظيف — فقط حدّث البيانات
          if (data.students)      DB.students      = data.students;
          if (data.circles)       DB.circles       = data.circles;
          if (data.attendance)    DB.attendance    = data.attendance;
          if (data.notifications) DB.notifications = data.notifications;
          if (data.weeklyData)    DB.weeklyData    = data.weeklyData;
          if (data.users && data.users.some(function(u){return u.role==='admin';})) {
            var merged = data.users.slice();
            DB.users.forEach(function(u) {
              var exists = merged.find(function(x) { return x.id === u.id; });
              if (!exists) merged.push(u);
            });
            DB.users = merged;
          }
        }
      })
      .catch(function() {}); // صامت إذا انقطع الإنترنت
  };

  // مزامنة كل 5 ثواني
  var lastHash = '';
  window.startFirebaseSync = function() {
    // تنظيف فوري عند البداية
    window.cleanFirebaseUsers();

    setInterval(function() {
      fetch(BASE_URL)
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (!data) return;
          var h = JSON.stringify(data).length + (data.students ? data.students.length : 0);
          if (h === lastHash) return;
          lastHash = h;
          var changed = false;
          ['students','circles','attendance','notifications','weeklyData','branches','messages','employees','transactions','financeSettings'].forEach(function(key) {
            if (data[key]) { DB[key] = data[key]; changed = true; }
          });
          if (data.users && Array.isArray(data.users)) {
            var firebaseAdmins = data.users.filter(function(u) { return u.role === 'admin'; });
            if (firebaseAdmins.length > 0) {
              var merged = firebaseAdmins.slice();
              DB.users.forEach(function(localUser) {
                var exists = merged.find(function(u) { return u.id === localUser.id; });
                if (!exists) merged.push(localUser);
              });
              DB.users = merged;
              changed = true;
            }
          }
          if (changed && typeof navigateTo === 'function' && typeof currentPage !== 'undefined') {
            navigateTo(currentPage);
          }
        })
        .catch(function() {});
    }, 5000);
  };

  console.log('✅ Firebase REST API جاهز');
})();
