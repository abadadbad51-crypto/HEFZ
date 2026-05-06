// ==============================
// HELPERS
// ==============================
function levelBadge(l) {
  var colors = {'متفوق':'green','جيد':'blue','متوسط':'gold','ضعيف':'red','Advanced':'green','Good':'blue','Average':'gold','Weak':'red','Excellent':'green'};
  var lbls = {'متفوق':'excellent','جيد':'good','متوسط':'average','ضعيف':'weak','Advanced':'excellent','Good':'good','Average':'average','Weak':'weak','Excellent':'excellent'};
  var cls = colors[l] || 'gray';
  var lbl = lbls[l] ? t(lbls[l]) : l;
  return '<span class="badge ' + cls + '">' + lbl + '</span>';
}
function gradeBadge(g) {
  var colors = {'ممتاز':'green','جيد جداً':'blue','جيد':'gold','مقبول':'orange','ضعيف':'red','Excellent':'green','Very Good':'blue','Good':'gold','Pass':'orange','Fail':'red'};
  var lbls = {'ممتاز':'gradeExcellent','جيد جداً':'gradeVGood','جيد':'gradeGood','مقبول':'gradePass','ضعيف':'gradeFail','Excellent':'gradeExcellent','Very Good':'gradeVGood','Good':'gradeGood','Pass':'gradePass','Fail':'gradeFail'};
  var cls = colors[g] || 'gray';
  var lbl = lbls[g] ? t(lbls[g]) : g;
  return '<span class="badge ' + cls + '">' + lbl + '</span>';
}
function pctBar(v,max,cls=''){
  const p=Math.round(v/max*100);
  return `<div style="display:flex;align-items:center;gap:8px;">
    <div class="progress-bar" style="flex:1"><div class="progress-fill ${cls}" style="width:${p}%"></div></div>
    <span style="font-size:.72rem;color:var(--text-muted);min-width:32px">${p}%</span>
  </div>`;
}


// Juz names
const JUZ_NAMES = [
  'الجزء الأول','الجزء الثاني','الجزء الثالث','الجزء الرابع','الجزء الخامس',
  'الجزء السادس','الجزء السابع','الجزء الثامن','الجزء التاسع','الجزء العاشر',
  'الحادي عشر','الثاني عشر','الثالث عشر','الرابع عشر','الخامس عشر',
  'السادس عشر','السابع عشر','الثامن عشر','التاسع عشر','العشرون',
  'الحادي والعشرون','الثاني والعشرون','الثالث والعشرون','الرابع والعشرون','الخامس والعشرون',
  'السادس والعشرون','السابع والعشرون','الثامن والعشرون','التاسع والعشرون','جزء عمّ'
];

function juzsWidget(s, opts={}) {
  const juz = s.juzProgress || Array(30).fill(0);
  const totalPages = s.totalPages || 604;
  const pagesPerJuz = totalPages / 30;
  const overallPct = Math.round(s.pages / totalPages * 100);
  const doneJuz = juz.filter(v => v >= 20).length;
  const partialJuz = juz.filter(v => v > 0 && v < 20).length;
  const labelSize = opts.compact ? '.7rem' : '.8rem';
  const uid = 'juz-' + s.id + '-' + Math.random().toString(36).slice(2,6);
  const isEn = currentLang==='en';
  const juzLabel = (i) => isEn ? `Juz ${i+1}` : JUZ_NAMES[i];

  const overallHtml = `
    <div style="margin-bottom:${opts.compact?'10px':'14px'}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
        <span style="font-size:${labelSize};color:var(--text-muted)">${isEn?'Overall Progress':'التقدم الكلي'}</span>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:.7rem;color:var(--text-muted)">${s.pages} / ${totalPages} ${isEn?'pg':'صفحة'}</span>
          <span style="font-size:.88rem;font-weight:900;color:var(--emerald-light)">${overallPct}%</span>
        </div>
      </div>
      ${pctBar(s.pages, totalPages, s.level==='ضعيف'||s.level==='Weak'?'red':'')}
      <div style="display:flex;gap:12px;margin-top:6px;font-size:.68rem;color:var(--text-muted)">
        <span>✅ ${isEn?'Complete:':'مكتمل:'} <strong style="color:var(--emerald-light)">${doneJuz}</strong> ${isEn?'juz':'جزء'}</span>
        <span>🔶 ${isEn?'Partial:':'جزئي:'} <strong style="color:var(--gold-light)">${partialJuz}</strong> ${isEn?'juz':'جزء'}</span>
        <span>⬜ ${isEn?'Remaining:':'متبقي:'} <strong style="color:var(--text-muted)">${30-doneJuz-partialJuz}</strong> ${isEn?'juz':'جزء'}</span>
      </div>
    </div>`;

  const rowsHtml = juz.map((pages, i) => {
    const pct = Math.round(pages / pagesPerJuz * 100);
    const cls = pages >= 20 ? 'full' : pages > 0 ? 'partial' : 'empty';
    const statusIcon = pages >= 20 ? '<span style="color:var(--emerald-light)">✓</span>'
                      : pages > 0  ? '<span style="color:var(--gold-light)">◑</span>'
                      :              '<span style="color:var(--text-dim)">○</span>';
    return `
      <div class="juz-row">
        <div class="juz-num">${juzLabel(i)}</div>
        <div class="juz-bar-wrap">
          <div class="juz-bar-fill ${cls}" style="width:${Math.min(100,pct)}%" data-pct="${Math.min(100,pct)}"></div>
        </div>
        <div class="juz-pct">${pct > 0 ? pct+'%' : ''}</div>
        <div class="juz-status">${statusIcon}</div>
      </div>`;
  }).join('');

  return `
    ${overallHtml}
    <div class="juz-panel-toggle" id="toggle-${uid}" onclick="toggleJuzPanel('${uid}')">
      <span>📊 ${isEn?'30 Juz Details':'تفاصيل الأجزاء الثلاثين'}</span>
      <span class="arrow">▼</span>
    </div>
    <div class="juz-panel-body" id="body-${uid}">
      <div class="juz-list">${rowsHtml}</div>
    </div>`;
}

window.toggleJuzPanel = function(uid) {
  const toggle = document.getElementById('toggle-'+uid);
  const body   = document.getElementById('body-'+uid);
  if (!toggle || !body) return;
  const opening = !body.classList.contains('open');
  toggle.classList.toggle('open', opening);
  body.classList.toggle('open', opening);
  // Animate bars on first open
  if (opening) {
    body.querySelectorAll('.juz-bar-fill').forEach(bar => {
      const target = bar.getAttribute('data-pct') + '%';
      bar.style.width = '0';
      requestAnimationFrame(() => { bar.style.width = target; });
    });
  }
};


// ==============================
// QURAN SURAHS LIST
// ==============================
const QURAN_SURAHS = [
  {n:1,  name:'الفاتحة',      ayah:7,   juz:1},
  {n:2,  name:'البقرة',       ayah:286, juz:1},
  {n:3,  name:'آل عمران',     ayah:200, juz:3},
  {n:4,  name:'النساء',       ayah:176, juz:4},
  {n:5,  name:'المائدة',      ayah:120, juz:6},
  {n:6,  name:'الأنعام',      ayah:165, juz:7},
  {n:7,  name:'الأعراف',      ayah:206, juz:8},
  {n:8,  name:'الأنفال',      ayah:75,  juz:9},
  {n:9,  name:'التوبة',       ayah:129, juz:10},
  {n:10, name:'يونس',         ayah:109, juz:11},
  {n:11, name:'هود',          ayah:123, juz:11},
  {n:12, name:'يوسف',         ayah:111, juz:12},
  {n:13, name:'الرعد',        ayah:43,  juz:13},
  {n:14, name:'إبراهيم',      ayah:52,  juz:13},
  {n:15, name:'الحجر',        ayah:99,  juz:14},
  {n:16, name:'النحل',        ayah:128, juz:14},
  {n:17, name:'الإسراء',      ayah:111, juz:15},
  {n:18, name:'الكهف',        ayah:110, juz:15},
  {n:19, name:'مريم',         ayah:98,  juz:16},
  {n:20, name:'طه',           ayah:135, juz:16},
  {n:21, name:'الأنبياء',     ayah:112, juz:17},
  {n:22, name:'الحج',         ayah:78,  juz:17},
  {n:23, name:'المؤمنون',     ayah:118, juz:18},
  {n:24, name:'النور',        ayah:64,  juz:18},
  {n:25, name:'الفرقان',      ayah:77,  juz:18},
  {n:26, name:'الشعراء',      ayah:227, juz:19},
  {n:27, name:'النمل',        ayah:93,  juz:19},
  {n:28, name:'القصص',        ayah:88,  juz:20},
  {n:29, name:'العنكبوت',     ayah:69,  juz:20},
  {n:30, name:'الروم',        ayah:60,  juz:21},
  {n:31, name:'لقمان',        ayah:34,  juz:21},
  {n:32, name:'السجدة',       ayah:30,  juz:21},
  {n:33, name:'الأحزاب',      ayah:73,  juz:21},
  {n:34, name:'سبأ',          ayah:54,  juz:22},
  {n:35, name:'فاطر',         ayah:45,  juz:22},
  {n:36, name:'يس',           ayah:83,  juz:22},
  {n:37, name:'الصافات',      ayah:182, juz:23},
  {n:38, name:'ص',            ayah:88,  juz:23},
  {n:39, name:'الزمر',        ayah:75,  juz:23},
  {n:40, name:'غافر',         ayah:85,  juz:24},
  {n:41, name:'فصلت',         ayah:54,  juz:24},
  {n:42, name:'الشورى',       ayah:53,  juz:25},
  {n:43, name:'الزخرف',       ayah:89,  juz:25},
  {n:44, name:'الدخان',       ayah:59,  juz:25},
  {n:45, name:'الجاثية',      ayah:37,  juz:25},
  {n:46, name:'الأحقاف',      ayah:35,  juz:26},
  {n:47, name:'محمد',         ayah:38,  juz:26},
  {n:48, name:'الفتح',        ayah:29,  juz:26},
  {n:49, name:'الحجرات',      ayah:18,  juz:26},
  {n:50, name:'ق',            ayah:45,  juz:26},
  {n:51, name:'الذاريات',     ayah:60,  juz:26},
  {n:52, name:'الطور',        ayah:49,  juz:27},
  {n:53, name:'النجم',        ayah:62,  juz:27},
  {n:54, name:'القمر',        ayah:55,  juz:27},
  {n:55, name:'الرحمن',       ayah:78,  juz:27},
  {n:56, name:'الواقعة',      ayah:96,  juz:27},
  {n:57, name:'الحديد',       ayah:29,  juz:27},
  {n:58, name:'المجادلة',     ayah:22,  juz:28},
  {n:59, name:'الحشر',        ayah:24,  juz:28},
  {n:60, name:'الممتحنة',     ayah:13,  juz:28},
  {n:61, name:'الصف',         ayah:14,  juz:28},
  {n:62, name:'الجمعة',       ayah:11,  juz:28},
  {n:63, name:'المنافقون',    ayah:11,  juz:28},
  {n:64, name:'التغابن',      ayah:18,  juz:28},
  {n:65, name:'الطلاق',       ayah:12,  juz:28},
  {n:66, name:'التحريم',      ayah:12,  juz:28},
  {n:67, name:'الملك',        ayah:30,  juz:29},
  {n:68, name:'القلم',        ayah:52,  juz:29},
  {n:69, name:'الحاقة',       ayah:52,  juz:29},
  {n:70, name:'المعارج',      ayah:44,  juz:29},
  {n:71, name:'نوح',          ayah:28,  juz:29},
  {n:72, name:'الجن',         ayah:28,  juz:29},
  {n:73, name:'المزمل',       ayah:20,  juz:29},
  {n:74, name:'المدثر',       ayah:56,  juz:29},
  {n:75, name:'القيامة',      ayah:40,  juz:29},
  {n:76, name:'الإنسان',      ayah:31,  juz:29},
  {n:77, name:'المرسلات',     ayah:50,  juz:29},
  {n:78, name:'النبأ',        ayah:40,  juz:30},
  {n:79, name:'النازعات',     ayah:46,  juz:30},
  {n:80, name:'عبس',          ayah:42,  juz:30},
  {n:81, name:'التكوير',      ayah:29,  juz:30},
  {n:82, name:'الانفطار',     ayah:19,  juz:30},
  {n:83, name:'المطففين',     ayah:36,  juz:30},
  {n:84, name:'الانشقاق',     ayah:25,  juz:30},
  {n:85, name:'البروج',       ayah:22,  juz:30},
  {n:86, name:'الطارق',       ayah:17,  juz:30},
  {n:87, name:'الأعلى',       ayah:19,  juz:30},
  {n:88, name:'الغاشية',      ayah:26,  juz:30},
  {n:89, name:'الفجر',        ayah:30,  juz:30},
  {n:90, name:'البلد',        ayah:20,  juz:30},
  {n:91, name:'الشمس',        ayah:15,  juz:30},
  {n:92, name:'الليل',        ayah:21,  juz:30},
  {n:93, name:'الضحى',        ayah:11,  juz:30},
  {n:94, name:'الشرح',        ayah:8,   juz:30},
  {n:95, name:'التين',        ayah:8,   juz:30},
  {n:96, name:'العلق',        ayah:19,  juz:30},
  {n:97, name:'القدر',        ayah:5,   juz:30},
  {n:98, name:'البينة',       ayah:8,   juz:30},
  {n:99, name:'الزلزلة',      ayah:8,   juz:30},
  {n:100,name:'العاديات',     ayah:11,  juz:30},
  {n:101,name:'القارعة',      ayah:11,  juz:30},
  {n:102,name:'التكاثر',      ayah:8,   juz:30},
  {n:103,name:'العصر',        ayah:3,   juz:30},
  {n:104,name:'الهمزة',       ayah:9,   juz:30},
  {n:105,name:'الفيل',        ayah:5,   juz:30},
  {n:106,name:'قريش',         ayah:4,   juz:30},
  {n:107,name:'الماعون',      ayah:7,   juz:30},
  {n:108,name:'الكوثر',       ayah:3,   juz:30},
  {n:109,name:'الكافرون',     ayah:6,   juz:30},
  {n:110,name:'النصر',        ayah:3,   juz:30},
  {n:111,name:'المسد',        ayah:5,   juz:30},
  {n:112,name:'الإخلاص',      ayah:4,   juz:30},
  {n:113,name:'الفلق',        ayah:5,   juz:30},
  {n:114,name:'الناس',        ayah:6,   juz:30},
];


// ── Student avatar: photo if available, else initial letter ──
function studentAvatar(s, size=40, border=true) {
  const colors = {متفوق:'#536f5a', جيد:'#3d6975', متوسط:'#836128', ضعيف:'#a7352a'};
  const col    = colors[s.level] || '#888';
  const bStyle = border ? `border:2px solid ${col}50;` : '';
  if (s.photo) {
    return `<img src="${s.photo}" alt="${s.name}"
               style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;
                      flex-shrink:0;${bStyle}">`;
  }
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;
               background:${col}20;color:${col};${bStyle}
               display:flex;align-items:center;justify-content:center;
               font-size:${Math.round(size*.4)}px;font-weight:800;flex-shrink:0">${(s.name||'?').charAt(0)}</div>`;
}


// ==============================
// TODAY'S TASK HELPER
// ==============================
function buildTodayTask(s) {
  const surahObj   = QURAN_SURAHS ? QURAN_SURAHS.find(q => q.name === s.currentSurah) : null;
  const fromAyah   = s.currentAyah;
  const toAyah     = surahObj ? Math.min(fromAyah + s.plan.dailyAyah - 1, surahObj.ayah) : fromAyah + s.plan.dailyAyah - 1;
  const count      = toAyah - fromAyah + 1;
  const todayDay   = new Date().toLocaleDateString('ar-SA', {weekday:'long'});
  const reviewDays = s.plan.reviewDays >= 2 ? ['الجمعة','الخميس'].slice(0, s.plan.reviewDays) : ['الجمعة'];
  const isReview   = reviewDays.includes(todayDay);
  const nextSurah  = surahObj && toAyah >= surahObj.ayah ? (QURAN_SURAHS.find(q => q.n === surahObj.n + 1) || null) : null;
  const remaining  = surahObj ? surahObj.ayah - toAyah : 0;

  if (isReview) {
    return `
      <div style="background:linear-gradient(135deg,rgba(32,104,184,.12),rgba(32,104,184,.06));
           border:2px solid var(--blue);border-radius:14px;padding:18px 20px;margin-bottom:12px;
           position:relative;overflow:hidden">
        <div style="position:absolute;left:-16px;top:-16px;width:70px;height:70px;
             border-radius:50%;background:rgba(32,104,184,.1)"></div>
        <div style="position:relative">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
            <span style="font-size:1.3rem">🔁</span>
            <div style="font-size:.88rem;font-weight:800;color:var(--blue)">${todayDay} — يوم مراجعة</div>
          </div>
          <div style="font-size:.82rem;color:var(--text-muted);line-height:1.8">
            اليوم يراجع ابنك ما سبق حفظه. ذكّره بتلاوة ما يحفظه في صلواته اليوم.
          </div>
          <div style="margin-top:10px;background:var(--surface);border-radius:9px;padding:10px 12px;
               font-size:.82rem;color:var(--text-muted)">
            📖 السورة الحالية: <strong style="color:var(--gold-light)">${s.currentSurah}</strong>
            · وصل إلى <strong>آية ${s.currentAyah}</strong>
          </div>
        </div>
      </div>`;
  }

  return `
    <div style="background:linear-gradient(135deg,var(--emerald-glow),rgba(255,255,255,0));
         border:2px solid var(--emerald-mid);border-radius:14px;padding:18px 20px;margin-bottom:12px;
         position:relative;overflow:hidden">
      <div style="position:absolute;left:-16px;top:-16px;width:70px;height:70px;
           border-radius:50%;background:var(--emerald-glow)"></div>
      <div style="position:relative">

        <!-- Header -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:1.3rem">📅</span>
            <div style="font-size:.9rem;font-weight:800;color:var(--emerald-light)">${todayDay} — مهمة الحفظ اليوم</div>
          </div>
          <span class="badge green" style="font-size:.72rem">${count} آيات جديدة</span>
        </div>

        <!-- Surah + Ayah range -->
        <div style="background:var(--surface);border-radius:12px;padding:16px 18px;margin-bottom:10px;
             border-right:4px solid var(--emerald-mid)">
          <div style="font-size:.72rem;color:var(--text-muted);margin-bottom:6px;font-weight:600;letter-spacing:.04em">
            السورة المطلوب حفظها اليوم
          </div>
          <div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap">
            <div style="font-size:1.6rem;font-weight:900;color:var(--emerald-light);font-family:'Amiri',serif">
              سورة ${s.currentSurah}
            </div>
            ${surahObj ? `<span style="font-size:.72rem;color:var(--text-muted)">(${surahObj.ayah} آية · الجزء ${surahObj.juz})</span>` : ''}
          </div>
          <div style="margin-top:10px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <div style="background:var(--emerald-glow);border-radius:8px;padding:8px 14px;
                 font-size:.88rem;font-weight:700;color:var(--emerald-light)">
              من آية <strong style="font-size:1.1rem">${fromAyah}</strong>
            </div>
            <div style="font-size:1rem;color:var(--text-dim)">←</div>
            <div style="background:var(--emerald-glow);border-radius:8px;padding:8px 14px;
                 font-size:.88rem;font-weight:700;color:var(--emerald-light)">
              إلى آية <strong style="font-size:1.1rem">${toAyah}</strong>
            </div>
            <div style="font-size:.78rem;color:var(--text-muted)">(${count} آية)</div>
          </div>
          ${nextSurah
            ? `<div style="margin-top:8px;font-size:.72rem;color:var(--text-dim)">
                📌 بعد هذه الآيات تنتهي السورة · التالية: <strong style="color:var(--gold-light)">${nextSurah.name}</strong>
               </div>`
            : `<div style="margin-top:8px;font-size:.72rem;color:var(--text-dim)">
                متبقٍّ في هذه السورة: <strong style="color:var(--gold-light)">${remaining} آية</strong>
               </div>`}
        </div>

        <!-- Tip -->
        <div style="font-size:.78rem;color:var(--text-muted);background:var(--surface);
             border-radius:8px;padding:9px 12px;line-height:1.7">
          💡 <strong>كيف تساعده؟</strong> — اطلب منه تلاوة هذه الآيات أمامك مساءً،
          وشجّعه إذا أتقنها. يُنصح بالاستماع لها من مقرئ قبل الحفظ.
        </div>
      </div>
    </div>`;
}

// ==============================
// LEARNING INTELLIGENCE HELPERS
// ==============================
function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, function(ch) {
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];
  });
}

function getLevelPlanBounds(level) {
  const normalized = String(level || '');
  if (normalized === 'ضعيف' || normalized === 'Weak') return { min: 2, max: 5, reviewDays: 3 };
  if (normalized === 'متفوق' || normalized === 'Advanced' || normalized === 'Excellent') return { min: 6, max: 14, reviewDays: 1 };
  if (normalized === 'متوسط' || normalized === 'Average') return { min: 3, max: 8, reviewDays: 2 };
  return { min: 4, max: 10, reviewDays: 2 };
}

function normalizeAttendanceDays(days) {
  if (Array.isArray(days)) return days.filter(Boolean);
  if (!days) return ['sun','mon','tue','wed','thu'];
  return String(days).split(/[،,\s]+|و/).map(d => d.trim()).filter(Boolean);
}

function ensureStudentLearningDefaults(s) {
  if (!s) return s;
  s.status = s.status || 'active';
  s.branch = s.branch || s.mosque || '';
  s.targetDate = s.targetDate || '';
  s.attendanceDays = normalizeAttendanceDays(s.attendanceDays || s.days || '');
  s.plan = s.plan || {};
  const bounds = getLevelPlanBounds(s.level);
  s.plan.dailyAyah = Number(s.plan.dailyAyah) || bounds.min;
  s.plan.reviewDays = Number(s.plan.reviewDays) || bounds.reviewDays;
  s.plan.weeklyGoal = s.plan.weeklyGoal || 'صفحة';
  s.sessions = Array.isArray(s.sessions) ? s.sessions : [];
  s.exams = Array.isArray(s.exams) ? s.exams : [];
  s.certificates = Array.isArray(s.certificates) ? s.certificates : [];
  s.messages = Array.isArray(s.messages) ? s.messages : [];
  s.supportReasons = Array.isArray(s.supportReasons) ? s.supportReasons : [];
  return s;
}

function getRecentSessions(s, days) {
  ensureStudentLearningDefaults(s);
  const cutoff = Date.now() - (days || 14) * 24 * 60 * 60 * 1000;
  return (s.sessions || []).filter(session => {
    const time = Date.parse(session.date || '');
    return !Number.isNaN(time) && time >= cutoff;
  });
}

function getStudentSupportAlerts(s) {
  ensureStudentLearningDefaults(s);
  const alerts = [];
  const recent = getRecentSessions(s, 14);
  const recentNew = recent.reduce((sum, session) => sum + (Number(session.new) || 0), 0);
  const expected = Math.max(1, (Number(s.plan.dailyAyah) || 0) * Math.max(1, 7 - (Number(s.plan.reviewDays) || 0)) * 2);
  const lastSessionTime = s.sessions[0] ? Date.parse(s.sessions[0].date || '') : 0;
  const inactiveDays = lastSessionTime ? Math.floor((Date.now() - lastSessionTime) / 86400000) : 999;

  if ((Number(s.attendance) || 0) < 75) alerts.push('انخفاض الحضور عن 75%');
  if (recent.length > 0 && recentNew < expected * 0.45) alerts.push('إنجاز آخر أسبوعين أقل من نصف الخطة');
  if (recent.length === 0 && (s.sessions || []).length > 0 && inactiveDays >= 10) alerts.push('لا توجد جلسات حديثة منذ 10 أيام أو أكثر');
  if (String(s.level || '') === 'ضعيف' || String(s.level || '') === 'Weak') alerts.push('مستوى الطالب يحتاج متابعة');
  return alerts;
}

function refreshStudentLearningState(s) {
  ensureStudentLearningDefaults(s);
  const alerts = getStudentSupportAlerts(s);
  s.supportReasons = alerts;
  s.needsSupport = alerts.length > 0;
  s.weak = s.weak || alerts.length >= 2 || alerts.some(a => a.indexOf('مستوى') !== -1);
  return s;
}

function getSmartPlanSuggestion(s, opts={}) {
  ensureStudentLearningDefaults(s);
  const bounds = getLevelPlanBounds(s.level);
  const attendanceDays = normalizeAttendanceDays(opts.attendanceDays || s.attendanceDays);
  const activeDays = Math.max(1, Math.min(6, attendanceDays.length || 5));
  const remainingAyah = Math.max(0, ((Number(s.totalPages) || 604) - (Number(s.pages) || 0)) * 15);
  let dailyAyah = Number(s.plan.dailyAyah) || bounds.min;
  let targetDate = opts.targetDate || s.targetDate;
  let daysLeft = null;

  if (targetDate) {
    const diff = Math.ceil((Date.parse(targetDate) - Date.now()) / 86400000);
    if (diff > 0) {
      daysLeft = diff;
      const learningWeeks = Math.max(1, diff / 7);
      dailyAyah = Math.ceil(remainingAyah / (learningWeeks * activeDays));
    }
  }

  dailyAyah = clampNumber(dailyAyah, bounds.min, bounds.max);
  const reviewDays = clampNumber(opts.reviewDays || s.plan.reviewDays || bounds.reviewDays, 1, 4);
  const weeklyAyah = Math.max(0, dailyAyah * Math.max(1, activeDays - reviewDays));
  const weeklyPages = Math.round((weeklyAyah / 15) * 10) / 10;

  return {
    dailyAyah,
    reviewDays,
    weeklyAyah,
    weeklyPages,
    activeDays,
    targetDate,
    daysLeft,
    weeklyGoal: weeklyPages >= 1 ? `${weeklyPages} صفحة` : `${weeklyAyah} آيات`,
  };
}

function applySmartPlan(s, opts={}) {
  const suggestion = getSmartPlanSuggestion(s, opts);
  s.plan.dailyAyah = suggestion.dailyAyah;
  s.plan.reviewDays = suggestion.reviewDays;
  s.plan.weeklyGoal = suggestion.weeklyGoal;
  s.targetDate = suggestion.targetDate || s.targetDate || '';
  s.attendanceDays = normalizeAttendanceDays(opts.attendanceDays || s.attendanceDays);
  refreshStudentLearningState(s);
  return suggestion;
}

function logAudit(action, details) {
  if (typeof DB === 'undefined') return;
  if (!Array.isArray(DB.auditLog)) DB.auditLog = [];
  DB.auditLog.unshift({
    id: Date.now(),
    at: new Date().toISOString(),
    userId: currentUser ? currentUser.id : null,
    userName: currentUser ? currentUser.name : 'system',
    action,
    details: details || '',
  });
  DB.auditLog = DB.auditLog.slice(0, 300);
}

// ==============================
// THEME MANAGEMENT
// ==============================
window.loadSavedTheme = function() {
  const theme = localStorage.getItem('hifz_theme') || 'emerald';
  document.documentElement.setAttribute('data-theme', theme);
};

window.setTheme = function(theme) {
  localStorage.setItem('hifz_theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
  // Update UI if dots exist
  document.querySelectorAll('.theme-dot').forEach(d => {
    d.classList.toggle('active', d.getAttribute('data-t') === theme);
  });
};
