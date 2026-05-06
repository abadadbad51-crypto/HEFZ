// ════════════════════════════════════════════════════════
// 🔔 PUSH NOTIFICATIONS SYSTEM
// ════════════════════════════════════════════════════════

var PUSH = {
  permission: 'default',
  enabled: false,

  // طلب إذن الإشعارات
  request: function() {
    if (!('Notification' in window)) return Promise.resolve('unsupported');
    return Notification.requestPermission().then(function(result) {
      PUSH.permission = result;
      PUSH.enabled = result === 'granted';
      localStorage.setItem('pushEnabled', PUSH.enabled ? '1' : '0');
      return result;
    });
  },

  // إرسال إشعار فوري
  send: function(title, body, opts) {
    opts = opts || {};
    // 1. إشعار المتصفح (Push Notification)
    if (PUSH.enabled && document.hidden) {
      try {
        var n = new Notification(title, {
          body: body,
          icon: opts.icon || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHRleHQgeT0iNDgiIGZvbnQtc2l6ZT0iNDgiPiDimKo8L3RleHQ+PC9zdmc+',
          badge: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PHRleHQgeT0iMjQiIGZvbnQtc2l6ZT0iMjQiPiDimKo8L3RleHQ+PC9zdmc+',
          tag: opts.tag || 'hifz-' + Date.now(),
          requireInteraction: opts.important || false,
        });
        n.onclick = function() { window.focus(); n.close(); };
        if (!opts.persist) setTimeout(function() { n.close(); }, 6000);
      } catch(e) {}
    }

    // 2. إشعار داخل التطبيق (In-app toast)
    if (!document.hidden || !PUSH.enabled) {
      showToast((opts.emoji||'🔔') + ' ' + title + (body ? ' — ' + body : ''));
    }

    // 3. حفظ في سجل الإشعارات
    var notif = {
      id: Date.now(),
      type: opts.type || 'info',
      title: title,
      msg: (opts.emoji||'🔔') + ' ' + title + (body ? ': ' + body : ''),
      time: new Date().toLocaleTimeString('ar-SA', {hour:'2-digit', minute:'2-digit'}),
      read: false,
    };
    DB.notifications.unshift(notif);
    if (DB.notifications.length > 50) DB.notifications.pop(); // keep last 50
    saveDB();

    // تحديث عدد الشارات في الـ nav
    PUSH.updateBadge();
  },

  // تحديث شارة عدد الإشعارات غير المقروءة
  updateBadge: function() {
    var unread = DB.notifications.filter(function(n) { return !n.read; }).length;
    var badge = document.querySelector('#nav-notifications .nav-badge, #nav-p-notifications .nav-badge');
    if (badge) badge.textContent = unread > 0 ? unread : '';
    // title tab
    document.title = unread > 0 ? '(' + unread + ') نظام التحفيظ' : 'نظام التحفيظ';
  },

  // تهيئة عند الدخول
  init: function() {
    PUSH.enabled = localStorage.getItem('pushEnabled') === '1';
    PUSH.permission = Notification.permission;
    if (PUSH.permission === 'granted') PUSH.enabled = true;
    PUSH.updateBadge();

    // طلب الإذن بعد 3 ثوان من الدخول (مرة واحدة)
    if (PUSH.permission === 'default' && !localStorage.getItem('pushAsked')) {
      setTimeout(function() {
        if (currentUser) {
          localStorage.setItem('pushAsked', '1');
          showPushPermissionBanner();
        }
      }, 3000);
    }
  }
};

// شريط طلب الإذن
function showPushPermissionBanner() {
  if (document.getElementById('pushBanner')) return;
  var isEn = currentLang === 'en';
  var banner = document.createElement('div');
  banner.id = 'pushBanner';
  banner.style.position = 'fixed';
  banner.style.bottom = '80px';
  banner.style.left = '50%';
  banner.style.transform = 'translateX(-50%)';
  banner.style.background = 'var(--surface)';
  banner.style.border = '1px solid var(--emerald-mid)';
  banner.style.borderRadius = '14px';
  banner.style.padding = '14px 18px';
  banner.style.zIndex = '9999';
  banner.style.boxShadow = '0 8px 32px rgba(0,0,0,.25)';
  banner.style.maxWidth = '360px';
  banner.style.width = '90%';
  banner.style.fontFamily = 'Tajawal,sans-serif';
  var t1 = isEn ? 'Enable Push Notifications?' : '\u062a\u0641\u0639\u064a\u0644 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062a';
  var t2 = isEn ? 'Instant alerts for sessions and attendance' : '\u062a\u0646\u0628\u064a\u0647\u0627\u062a \u0641\u0648\u0631\u064a\u0629 \u0644\u0644\u062c\u0644\u0633\u0627\u062a';
  var okTxt = isEn ? 'Enable' : '\u062a\u0641\u0639\u064a\u0644';
  var ltTxt = isEn ? 'Later' : '\u0644\u0627\u062d\u0642\u0627\u064b';
  var row1 = document.createElement('div');
  row1.style.cssText = 'display:flex;align-items:center;gap:12px;margin-bottom:12px';
  row1.innerHTML = '<div style="font-size:1.5rem">&#128276;</div><div><div style="font-weight:700;font-size:.9rem">' + t1 + '</div><div style="font-size:.74rem;color:var(--text-muted)">' + t2 + '</div></div>';
  var row2 = document.createElement('div');
  row2.style.cssText = 'display:flex;gap:8px';
  var btn1 = document.createElement('button');
  btn1.className = 'btn btn-solid'; btn1.style.flex = '1';
  btn1.textContent = okTxt;
  btn1.onclick = function() { enablePushAndClose(); };
  var btn2 = document.createElement('button');
  btn2.className = 'btn'; btn2.style.cssText = 'flex:1;background:var(--surface2)';
  btn2.textContent = ltTxt;
  btn2.onclick = function() { closePushBanner(); };
  row2.appendChild(btn1); row2.appendChild(btn2);
  banner.appendChild(row1); banner.appendChild(row2);
  document.body.appendChild(banner);
  setTimeout(function() { if (banner.parentNode) banner.remove(); }, 15000);
}

// Push banner button helpers
window.enablePushAndClose = function() {
  var b = document.getElementById('pushBanner');
  if (b) b.remove();
  PUSH.request().then(function(r) {
    if (r === 'granted') showToast('🔔 ' + (currentLang==='en'?'Notifications enabled!':'تم تفعيل الإشعارات!'));
  });
};
window.closePushBanner = function() {
  var b = document.getElementById('pushBanner');
  if (b) b.remove();
};

