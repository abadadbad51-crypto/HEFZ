;

// ==============================
// DEMO HINTS — removed (passwords now hashed)
// ==============================
window.selectLoginAccount = function() {};
window.backToRoleSelect = function() { showStep(1); };
function selectRole() {}

// ── Login language switcher ──
window.setLoginLang = function(lang) {
  currentLang = lang;
  localStorage.setItem('hifzLang', lang);
  var isEn = lang === 'en';
  document.documentElement.setAttribute('dir', isEn ? 'ltr' : 'rtl');
  document.documentElement.setAttribute('lang', lang);

  var arBtn = document.getElementById('loginLang-ar');
  var enBtn = document.getElementById('loginLang-en');
  if (arBtn) {
    arBtn.style.background  = isEn ? 'var(--surface2)' : 'var(--emerald-glow)';
    arBtn.style.borderColor = isEn ? 'var(--border)' : 'var(--emerald-mid)';
    arBtn.style.color       = isEn ? 'var(--text-muted)' : 'var(--emerald-light)';
  }
  if (enBtn) {
    enBtn.style.background  = isEn ? 'var(--emerald-glow)' : 'var(--surface2)';
    enBtn.style.borderColor = isEn ? 'var(--emerald-mid)' : 'var(--border)';
    enBtn.style.color       = isEn ? 'var(--emerald-light)' : 'var(--text-muted)';
  }

  var title = document.getElementById('loginCardTitle');
  if (title) title.textContent = isEn ? 'Sign In' : 'تسجيل الدخول';
  var emailLbl = document.getElementById('loginEmailLabel');
  if (emailLbl) emailLbl.textContent = isEn ? 'Username or Email' : 'اسم المستخدم أو البريد';
  var passLbl = document.getElementById('loginPassLabel');
  if (passLbl) passLbl.textContent = isEn ? 'Password' : 'كلمة المرور';
  var forgotLnk = document.getElementById('forgotPassLink');
  if (forgotLnk) forgotLnk.textContent = isEn ? '🔑 Forgot password?' : '🔑 نسيت كلمة المرور؟';
  var submitBtn = document.getElementById('loginSubmitBtn');
  if (submitBtn) submitBtn.textContent = isEn ? '🔐 Sign In' : '🔐 دخول للنظام';
  var gBtn = document.getElementById('googleBtnLabel');
  if (gBtn) gBtn.textContent = isEn ? 'Sign in with Google' : 'تسجيل الدخول بـ Google';
  var orLbl = document.getElementById('orLabel');
  if (orLbl) orLbl.textContent = isEn ? 'or' : 'أو';
  var noAcc = document.getElementById('noAccountLabel');
  if (noAcc) noAcc.textContent = isEn ? "Don't have an account?" : 'ليس لديك حساب؟';
  var createAcc = document.getElementById('createAccountLink');
  if (createAcc) createAcc.textContent = isEn ? '✨ Create Account' : '✨ إنشاء حساب';
};

// ── Forgot Password ──
// Public password resets must go through an authenticated admin/backend flow.
var _fpUser = null;

window.showForgotPassword = function() {
  showStep(4);
  // reset
  document.getElementById('fpEmail').value    = '';
  var newPass = document.getElementById('fpNewPass');
  var newPass2 = document.getElementById('fpNewPass2');
  if (newPass) newPass.value = '';
  if (newPass2) newPass2.value = '';
  document.getElementById('fpErrorA').style.display = 'none';
  document.getElementById('fpErrorB').style.display = 'none';
  document.getElementById('fpStepA').style.display  = 'block';
  document.getElementById('fpStepB').style.display  = 'none';
  _fpUser = null;
  setTimeout(function() { document.getElementById('fpEmail').focus(); }, 120);
};

window.hideForgotPassword = function() { showStep(1); };

window.checkFpEmail = function() {
  var email  = (document.getElementById('fpEmail').value || '').trim().toLowerCase();
  var errEl  = document.getElementById('fpErrorA');
  errEl.style.display = 'none';

  if (!email) {
    errEl.textContent = '⚠️ يرجى إدخال البريد الإلكتروني';
    errEl.style.display = 'block';
    return;
  }

  _fpUser = null;
  document.getElementById('fpFoundName').textContent =
    currentLang === 'en'
      ? 'If the account exists, an administrator must reset it from inside the system.'
      : 'إذا كان الحساب موجوداً، يجب أن يعيد المدير تعيينه من داخل النظام.';
  document.getElementById('fpStepA').style.display = 'none';
  document.getElementById('fpStepB').style.display = 'block';
};

window.doResetPassword = function() {
  var errEl = document.getElementById('fpErrorB');
  errEl.textContent = currentLang === 'en'
    ? 'Password reset is disabled on the public login screen. Contact the system administrator.'
    : 'تم تعطيل إعادة التعيين من شاشة الدخول العامة. يرجى التواصل مع مدير النظام.';
  errEl.style.display = 'block';
};
let currentRegRole = 'teacher';

// Helper: show one login step, hide others
window.showStep = function(n) {
  // أخفِ كل الخطوات بشكل قاطع
  ['loginStep1','loginStep3','loginStep4'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) { el.style.display = 'none'; el.style.visibility = 'hidden'; el.style.position = 'absolute'; }
  });
  // إخفاء/إظهار الشعار
  var logo = document.getElementById('loginLogoArea');
  if (logo) logo.style.display = (n === 1) ? '' : 'none';
  // أظهر الخطوة المطلوبة فقط
  var target = document.getElementById('loginStep' + n);
  if (target) {
    target.style.display = 'block';
    target.style.visibility = 'visible';
    target.style.position = 'relative';
    target.style.animation = 'fadeUp .35s ease';
  }
};

window.showRegisterForm = function() {
  showStep(3);
  ['regName','regEmail','regPass','regPass2'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.value = '';
  });
  var errEl = document.getElementById('regError');
  var okEl  = document.getElementById('regSuccess');
  if (errEl) errEl.style.display = 'none';
  if (okEl)  okEl.style.display  = 'none';
  setRegRole('teacher', document.getElementById('reg-role-teacher'));
  setTimeout(function() {
    var nm = document.getElementById('regName');
    if (nm) nm.focus();
  }, 120);
};

window.setRegRole = function(role, el) {
  currentRegRole = role;
  ['admin','teacher','parent'].forEach(r => {
    const btn = document.getElementById('reg-role-' + r);
    if (btn) btn.classList.remove('active');
  });
  if (el) el.classList.add('active');
};

window.doRegister = function() {
  const errEl = document.getElementById('regError');
  const okEl  = document.getElementById('regSuccess');

  errEl.style.display = 'none';
  okEl.style.display  = 'none';
  errEl.textContent = currentLang === 'en'
    ? 'Public admin registration is disabled. Create users from an existing admin account.'
    : 'تم تعطيل إنشاء المدير من الشاشة العامة. تُنشأ الحسابات من داخل حساب مدير موجود.';
  errEl.style.display = 'block';
};

window.quickFillAccount = function(email, pass) {
  document.getElementById('loginEmail').value = email;
  document.getElementById('loginPass').value  = pass;
  doLogin();
};

// ==============================
// LOGIN
// ==============================
function doLogin() {
  var email = (document.getElementById('loginEmail').value || '').trim().toLowerCase();
  var pass  = (document.getElementById('loginPass').value  || '').trim();
  var errEl = document.getElementById('loginError');
  var btn   = document.getElementById('loginSubmitBtn');

  if (!email || !pass) {
    if (errEl) errEl.style.display = 'block';
    return;
  }

  // البحث عن المستخدم بالإيميل أو اسم المستخدم
  var candidates = DB.users.filter(function(u) {
    return (u.email && u.email.toLowerCase() === email) || (u.username && u.username.toLowerCase() === email);
  });
  if (candidates.length === 0) {
    if (errEl) errEl.style.display = 'block';
    return;
  }

  // تعطيل الزر أثناء التحقق
  if (btn) { btn.disabled = true; btn.textContent = '...'; }

  // التحقق من كلمة المرور بشكل async
  var checks = candidates.map(function(u) {
    return verifyPassword(pass, u.pass).then(function(ok) {
      return ok ? u : null;
    });
  });

  Promise.all(checks).then(function(results) {
    var matches = results.filter(Boolean);
    var user = matches.find(function(u) { return u.role === 'admin'; }) || matches[0];

    if (btn) { btn.disabled = false; btn.textContent = '🔐 دخول للنظام'; }

    if (!user) {
      if (errEl) errEl.style.display = 'block';
      var passInput = document.getElementById('loginPass');
      if (passInput) { passInput.value = ''; passInput.focus(); }
      return;
    }

    if (errEl) errEl.style.display = 'none';
    // ترقية كلمة المرور تلقائياً إلى PBKDF2 إن كانت بتنسيق قديم
    if (typeof upgradePasswordIfNeeded === 'function') {
      upgradePasswordIfNeeded(user, pass);
    }
    currentUser = user;
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    initApp();
    setTimeout(buildBottomNav, 100);
    startSessionWatcher(); // بدء مراقبة الخمول
    setTimeout(updateSessionIndicator, 500);
    PUSH.init(); // تهيئة نظام الإشعارات
  });
}

function doLogout() {
  stopSessionWatcher();
  closeSidebar(); // أغلق القائمة الجانبية
  currentUser = null;
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('app').style.display = 'none';
  showStep(1);
  var e = document.getElementById('loginEmail');
  var p = document.getElementById('loginPass');
  if (e) e.value = '';
  if (p) p.value = '';
}
var GOOGLE_CLIENT_ID = '914239917689-gi2hq2fa5ord96ncg8tq1073f865mbmp.apps.googleusercontent.com';

window.signInWithGoogle = function() {
  // تحقق إن مكتبة Google محملة
  if (typeof google === 'undefined' || !google.accounts) {
    showToast('⚠️ جاري تحميل Google... حاول مرة ثانية');
    return;
  }

  var client = google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: 'email profile',
    callback: function(response) {
      if (response.error) {
        showToast('❌ فشل تسجيل الدخول بـ Google');
        return;
      }
      // احصل على بيانات المستخدم من Google
      fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: 'Bearer ' + response.access_token }
      })
      .then(function(r) { return r.json(); })
      .then(function(info) {
        var email = info.email;
        var name  = info.name || email;

        // ابحث إذا الحساب موجود مسبقاً
        var existing = DB.users.find(function(u) { return u.email === email; });
        if (existing) {
          // دخول مباشر
          currentUser = existing;
          document.getElementById('loginScreen').style.display = 'none';
          document.getElementById('app').style.display = 'block';
          initApp();
          setTimeout(buildBottomNav, 100);
          startSessionWatcher();
          PUSH.init();
          showToast('✅ أهلاً ' + existing.name + '!');
        } else {
          showToast('⚠️ هذا البريد غير مرتبط بحساب في النظام. اطلب من المدير إنشاء الحساب أولاً.');
        }
      })
      .catch(function() { showToast('❌ تعذّر الاتصال بـ Google'); });
    }
  });

  client.requestAccessToken();
};

// بيانات مؤقتة لمستخدم Google الجديد
var _pendingGoogleUser = null;

window.showGoogleRoleModal = function() {
  openModal('🔑 اختر نوع حسابك', `
    <p style="font-size:.88rem;color:var(--text-muted);margin-bottom:16px">
      مرحباً <strong style="color:var(--gold-light)">${_pendingGoogleUser.name}</strong>!<br>
      هذا أول دخول لك — اختر نوع حسابك:
    </p>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px">
      <div class="role-btn" onclick="completeGoogleSignIn('admin',this)" style="padding:16px 8px;cursor:pointer">
        <span class="role-icon">👑</span>
        <div class="role-name">مدير</div>
      </div>
      <div class="role-btn" onclick="completeGoogleSignIn('teacher',this)" style="padding:16px 8px;cursor:pointer">
        <span class="role-icon">📚</span>
        <div class="role-name">معلم</div>
      </div>
      <div class="role-btn" onclick="completeGoogleSignIn('parent',this)" style="padding:16px 8px;cursor:pointer">
        <span class="role-icon">👨‍👦</span>
        <div class="role-name">ولي أمر</div>
      </div>
    </div>
  `);
};

window.completeGoogleSignIn = function(role) {
  if (!_pendingGoogleUser) return;
  _pendingGoogleUser = null;
  showToast('⚠️ لا يمكن إنشاء حسابات جديدة عبر Google من شاشة الدخول العامة.');
};
