// ════════════════════════════════════════════════════════
// 🔐 SECURITY — تشفير كلمات المرور + انتهاء الجلسة
// ════════════════════════════════════════════════════════
//
// تنسيقات كلمات المرور المدعومة:
//   1. نص عادي (legacy)                    — نص قبل أول تحميل
//   2. SHA-256 بدون salt (legacy)          — 64 hex char
//   3. PBKDF2 + salt (الحالي والموصى به)   — "pbkdf2$<iter>$<saltHex>$<hashHex>"
//
// كل تنسيق قديم يُرقَّى تلقائياً إلى PBKDF2 عند أول تسجيل دخول ناجح.

const PBKDF2_ITERATIONS = 100000;
const PBKDF2_SALT_BYTES = 16;
const PBKDF2_HASH_BYTES = 32;

function _bytesToHex(bytes) {
  return Array.from(bytes).map(function(b){ return b.toString(16).padStart(2,'0'); }).join('');
}

function _hexToBytes(hex) {
  var out = new Uint8Array(hex.length / 2);
  for (var i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i*2, 2), 16);
  return out;
}

function _generateSalt() {
  var salt = new Uint8Array(PBKDF2_SALT_BYTES);
  crypto.getRandomValues(salt);
  return salt;
}

// مقارنة آمنة وقتياً (constant-time) — تمنع توقيت الهجمات
function _constantTimeEqual(a, b) {
  if (a.length !== b.length) return false;
  var diff = 0;
  for (var i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// SHA-256 (للتوافق مع كلمات المرور القديمة فقط)
async function _sha256Hex(pass) {
  var enc = new TextEncoder();
  var buf = await crypto.subtle.digest('SHA-256', enc.encode(pass));
  return _bytesToHex(new Uint8Array(buf));
}

// PBKDF2 — اشتقاق المفتاح من كلمة المرور والـ salt
async function _pbkdf2(pass, saltBytes, iterations) {
  var enc = new TextEncoder();
  var keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(pass), { name: 'PBKDF2' }, false, ['deriveBits']
  );
  var bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltBytes, iterations: iterations, hash: 'SHA-256' },
    keyMaterial,
    PBKDF2_HASH_BYTES * 8
  );
  return _bytesToHex(new Uint8Array(bits));
}

// تشفير كلمة مرور جديدة (التنسيق الحالي: PBKDF2 + salt)
async function hashPassword(pass) {
  var salt = _generateSalt();
  var hashHex = await _pbkdf2(pass, salt, PBKDF2_ITERATIONS);
  return 'pbkdf2$' + PBKDF2_ITERATIONS + '$' + _bytesToHex(salt) + '$' + hashHex;
}

// كشف تنسيق كلمة المرور المخزّنة
function _detectFormat(stored) {
  if (!stored) return 'plain';
  if (typeof stored === 'string' && stored.indexOf('pbkdf2$') === 0) return 'pbkdf2';
  if (typeof stored === 'string' && stored.length === 64 && /^[0-9a-f]+$/.test(stored)) return 'sha256';
  return 'plain';
}

// تحقق من كلمة مرور مدخلة مقابل كلمة مخزّنة (يدعم كل التنسيقات)
async function verifyPassword(inputPass, storedPass) {
  var fmt = _detectFormat(storedPass);
  if (fmt === 'pbkdf2') {
    var parts = storedPass.split('$'); // ['pbkdf2', iter, saltHex, hashHex]
    if (parts.length !== 4) return false;
    var iter = parseInt(parts[1], 10) || PBKDF2_ITERATIONS;
    var saltBytes = _hexToBytes(parts[2]);
    var expected = parts[3];
    var actual = await _pbkdf2(inputPass, saltBytes, iter);
    return _constantTimeEqual(actual, expected);
  }
  if (fmt === 'sha256') {
    var actualHash = await _sha256Hex(inputPass);
    return _constantTimeEqual(actualHash, storedPass);
  }
  // plain text legacy
  return inputPass === storedPass;
}

// ترقية كلمة مرور مستخدم إلى PBKDF2 (يُستدعى عند نجاح الدخول)
async function upgradePasswordIfNeeded(user, plainPass) {
  if (!user || !plainPass) return false;
  var fmt = _detectFormat(user.pass);
  if (fmt === 'pbkdf2') return false;
  user.pass = await hashPassword(plainPass);
  saveDB();
  return true;
}

// عند أول تحميل: شفِّر فقط كلمات المرور النصية (plain) — أما SHA-256 فلا نملك أصلها
async function migratePasswords() {
  var changed = false;
  for (var i = 0; i < DB.users.length; i++) {
    var u = DB.users[i];
    var fmt = _detectFormat(u.pass);
    if (fmt === 'plain' && u.pass) {
      DB.users[i].pass = await hashPassword(u.pass);
      changed = true;
    }
  }
  if (changed) saveDB();
}

// ════════ انتهاء الجلسة تلقائياً ════════
var SESSION_TIMEOUT  = 30 * 60 * 1000; // 30 دقيقة
var SESSION_WARNING  =  1 * 60 * 1000; // تحذير قبل دقيقة
var _sessionTimer    = null;
var _warningTimer    = null;
var _countdownInterval = null;
var _lastActivity    = Date.now();

function createSessionWarningBanner() {
  if (document.getElementById('sessionWarningBanner')) return;
  var banner = document.createElement('div');
  banner.id = 'sessionWarningBanner';
  banner.style.cssText = [
    'position:fixed','top:0','left:0','right:0','z-index:99999',
    'background:linear-gradient(90deg,#c0392b,#e74c3c)',
    'color:#fff','padding:10px 20px',
    'display:flex','align-items:center','justify-content:space-between',
    'font-family:Tajawal,sans-serif','font-size:.9rem','font-weight:600',
    'box-shadow:0 3px 12px rgba(0,0,0,.3)','animation:fadeUp .3s ease',
    'display:none'
  ].join(';');
  banner.innerHTML = [
    '<span>⚠️ <span id="sessionCountdown">60</span> ثانية حتى انتهاء الجلسة</span>',
    '<button onclick="resetSessionTimer();document.getElementById(\'sessionWarningBanner\').style.display=\'none\'"',
    ' style="background:rgba(255,255,255,.25);border:1px solid rgba(255,255,255,.5);',
    'color:#fff;padding:5px 14px;border-radius:6px;cursor:pointer;',
    'font-family:Tajawal,sans-serif;font-weight:700">🔄 تجديد الجلسة</button>'
  ].join('');
  document.body.appendChild(banner);
}

function showSessionWarning() {
  var banner = document.getElementById('sessionWarningBanner');
  if (!banner) return;
  banner.style.display = 'flex';
  var secs = 60;
  var cd = document.getElementById('sessionCountdown');
  if (cd) cd.textContent = secs;
  if (_countdownInterval) clearInterval(_countdownInterval);
  _countdownInterval = setInterval(function() {
    secs--;
    if (cd) cd.textContent = secs;
    if (secs <= 0) clearInterval(_countdownInterval);
  }, 1000);
}

function hideSessionWarning() {
  var banner = document.getElementById('sessionWarningBanner');
  if (banner) banner.style.display = 'none';
  if (_countdownInterval) clearInterval(_countdownInterval);
}

// مؤشر الجلسة في الـ sidebar
function updateSessionIndicator() {
  var el = document.getElementById('sessionIndicator');
  if (!el || !currentUser) return;
  var remaining = Math.max(0, SESSION_TIMEOUT - (Date.now() - _lastActivity));
  var mins = Math.floor(remaining / 60000);
  var secs = Math.floor((remaining % 60000) / 1000);
  var color = remaining < 5 * 60000 ? '#a7352a' : remaining < 10 * 60000 ? '#836128' : '#536f5a';
  el.innerHTML = '<span style="color:' + color + ';font-size:.72rem">⏱ ' +
    (mins + ':' + (secs < 10 ? '0' : '') + secs) + ' متبقي</span>';
}

function resetSessionTimer() {
  _lastActivity = Date.now();
  hideSessionWarning();
  if (_sessionTimer) clearTimeout(_sessionTimer);
  if (_warningTimer)  clearTimeout(_warningTimer);
  if (!currentUser) return;

  // تحذير قبل دقيقة
  _warningTimer = setTimeout(function() {
    if (!currentUser) return;
    showSessionWarning();
  }, SESSION_TIMEOUT - SESSION_WARNING);

  // تسجيل خروج عند انتهاء الوقت
  _sessionTimer = setTimeout(function() {
    if (!currentUser) return;
    hideSessionWarning();
    showToast('⏰ انتهت جلستك — يرجى الدخول من جديد');
    setTimeout(doLogout, 1500);
  }, SESSION_TIMEOUT);
}

function startSessionWatcher() {
  createSessionWarningBanner();
  ['click','keydown','touchstart','scroll'].forEach(function(ev) {
    document.addEventListener(ev, resetSessionTimer, { passive: true });
  });
  // تحديث المؤشر كل 30 ثانية
  setInterval(updateSessionIndicator, 30000);
  resetSessionTimer();
}

function stopSessionWatcher() {
  if (_sessionTimer)       clearTimeout(_sessionTimer);
  if (_warningTimer)       clearTimeout(_warningTimer);
  if (_countdownInterval)  clearInterval(_countdownInterval);
  hideSessionWarning();
}
