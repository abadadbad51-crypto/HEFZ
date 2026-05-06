// ---- TEACHER DASHBOARD ----
pages['t-dashboard'] = function(el) {
  const myStudents = DB.students.filter(s=>s.teacher===currentUser.id);
  myStudents.forEach(s => typeof refreshStudentLearningState === 'function' && refreshStudentLearningState(s));
  const circle = DB.circles.find(c=>c.teacher===currentUser.id);

  el.innerHTML = `
    <div class="grid-3" style="margin-bottom:20px">
      <div class="stat-box">
        <div class="stat-icon green">👥</div>
        <div><div class="stat-val">${myStudents.length}</div><div class="stat-lbl">${tt('طلابي','My Students')}</div></div>
      </div>
      <div class="stat-box">
        <div class="stat-icon gold">📅</div>
        <div><div class="stat-val">${tt('اليوم','Today')}</div><div class="stat-lbl">${circle?.days?.split('و')[0]||''}</div></div>
      </div>
      <div class="stat-box">
        <div class="stat-icon red">⚠️</div>
        <div><div class="stat-val">${myStudents.filter(s=>s.weak).length}</div><div class="stat-lbl">${tt('يحتاجون متابعة','Need Follow-up')}</div></div>
      </div>
    </div>

    <div class="card" style="margin-bottom:16px">
      <div class="card-title"><span class="ct-icon">🔔</span> ${tt('تنبيهات اليوم',"Today's Alerts")}</div>
      ${myStudents.filter(s=>s.weak).length===0&&myStudents.length===0
        ? `<div style="color:var(--text-muted);font-size:.85rem">${tt('لا توجد تنبيهات اليوم','No alerts today')}</div>`
        : ''}
      ${myStudents.filter(s=>s.weak || s.needsSupport).map(s=>`
        <div class="notif-item alert">⚠️ ${s.name} — ${(s.supportReasons||[])[0] || tt('يحتاج متابعة مكثفة','needs intensive follow-up')}</div>
      `).join('')}
    </div>

    <div class="card">
      <div class="section-hdr">
        <h2>${tt('طلاب الحلقة','Halaqa Students')}</h2>
        <button class="btn btn-solid btn-sm" onclick="navigateTo('t-session')">+ ${tt('تسجيل جلسة','Record Session')}</button>
      </div>
      ${myStudents.length===0
        ? `<div style="text-align:center;padding:32px;color:var(--text-muted)">${t('noStudents')}</div>`
        : `<div class="table-wrap">
        <table>
          <thead><tr>
            <th>${t('thStudent')}</th>
            <th>${tt('السورة الحالية','Current Surah')}</th>
            <th>${t('thLevel')}</th>
            <th>${tt('التقدم','Progress')}</th>
            <th>${t('thAttendance')}</th>
            <th>${t('thAction')}</th>
          </tr></thead>
          <tbody>
            ${myStudents.map(s=>`
              <tr style="cursor:pointer" onclick="openStudentModal(${s.id})"
                  onmouseenter="this.style.background='var(--emerald-glow)'"
                  onmouseleave="this.style.background=''">
                <td>
                  <div style="display:flex;align-items:center;gap:8px">
                    <div style="width:28px;height:28px;border-radius:50%;background:var(--emerald-glow);color:var(--emerald-light);display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:800;flex-shrink:0">${s.name.charAt(0)}</div>
                    <span style="font-weight:600;color:var(--emerald-light)">${s.name}</span>
                    ${s.weak?`<span class="badge red" style="font-size:.6rem">${tt('دعم','Support')}</span>`:''}
                  </div>
                </td>
                <td style="color:var(--gold-light)">${s.currentSurah||'—'} <span style="color:var(--text-dim)">(${tt('آية','v.')} ${s.currentAyah||1})</span></td>
                <td>${levelBadge(s.level)}</td>
                <td>${pctBar(s.pages,s.totalPages)}</td>
                <td><span class="${s.attendance>=90?'badge green':s.attendance>=75?'badge gold':'badge red'}">${s.attendance}%</span></td>
                <td onclick="event.stopPropagation()">
                  <div style="display:flex;gap:5px">
                    <button class="btn btn-green btn-sm" onclick="openStudentModal(${s.id})">📋 ${tt('ملف','File')}</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>`}
    </div>
  `;
};

// ---- TEACHER STUDENTS PAGE ----
pages['t-students'] = function(el) {
  const myStudents = DB.students.filter(s => s.teacher === currentUser.id);
  const circle     = DB.circles.find(c => c.teacher === currentUser.id);

  if (myStudents.length === 0) {
    el.innerHTML = `
      <div style="text-align:center;padding:60px 20px;color:var(--text-muted)">
        <div style="font-size:3rem;margin-bottom:12px">👥</div>
        <div style="font-size:1rem;font-weight:600;margin-bottom:6px">لا يوجد طلاب في حلقتك</div>
        <div style="font-size:.85rem">تواصل مع المدير لإضافة طلاب لحلقتك</div>
      </div>`;
    return;
  }

  // Build tabs
  const tabsHTML = myStudents.map((s,i) => {
    const col = {متفوق:'var(--emerald-light)',جيد:'var(--blue)',متوسط:'var(--gold-light)',ضعيف:'var(--red)'}[s.level]||'var(--text-muted)';
    return `
      <div id="stab-${s.id}" onclick="switchStudentFile(${s.id})"
        style="display:flex;align-items:center;gap:8px;padding:10px 14px;cursor:pointer;
               border-radius:10px;border:1px solid var(--border);background:var(--surface2);
               transition:all .2s;white-space:nowrap;flex-shrink:0;user-select:none"
        onmouseenter="if(!this.classList.contains('stab-active'))this.style.borderColor='var(--emerald-mid)'"
        onmouseleave="if(!this.classList.contains('stab-active'))this.style.borderColor=''">
        ${s.photo
          ? `<img src="${s.photo}" alt="${s.name}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;flex-shrink:0">`
          : `<div style="width:28px;height:28px;border-radius:50%;background:${col}20;color:${col};display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:800;flex-shrink:0">${(s.name||'?').charAt(0)}</div>`}
        <div>
          <div style="font-size:.82rem;font-weight:700">${s.name}</div>
          ${s.weak ? '<div style="font-size:.6rem;color:var(--red)">⚠️ يحتاج دعم</div>' : `<div style="font-size:.6rem;color:var(--text-muted)">${s.level}</div>`}
        </div>
      </div>`;
  }).join('');

  // Build file panels for each student
  const panelsHTML = myStudents.map((s,i) => {
    const pct        = Math.round(s.pages/s.totalPages*100);
    const teacher    = DB.users.find(u=>u.id===s.teacher);
    const totalNew   = (s.sessions||[]).reduce((a,ses)=>a+ses.new,0);
    const weeklyAyah = s.plan.dailyAyah*(7-s.plan.reviewDays);
    const weeklyPg   = Math.round(weeklyAyah/15*10)/10;
    const daysLeft   = s.pages<s.totalPages ? Math.ceil((s.totalPages-s.pages)/(s.plan.dailyAyah/15)) : 0;
    const mLeft      = Math.ceil(daysLeft/30);
    const timeLabel  = daysLeft===0?'✅ مكتمل':mLeft>12?Math.ceil(mLeft/12)+' سنة':mLeft+' شهر';
    const colors     = {متفوق:'#536f5a',جيد:'#3d6975',متوسط:'#836128',ضعيف:'#a7352a'};
    const col        = colors[s.level]||'#888';
    const lastSes    = (s.sessions||[]).length>0?s.sessions[0]:null;

    return `
      <div id="spanel-${s.id}" style="display:${i===0?'block':'none'};animation:fadeUp .3s ease">

        <!-- Profile banner -->
        <div style="background:linear-gradient(135deg,var(--emerald),var(--emerald-mid));
             border-radius:14px;padding:20px 24px;margin-bottom:16px;
             position:relative;overflow:hidden">
          <div style="position:absolute;left:-20px;top:-20px;width:80px;height:80px;
               border-radius:50%;background:rgba(255,255,255,.07)"></div>
          <div style="display:flex;align-items:center;gap:14px;position:relative;flex-wrap:wrap">
            ${s.photo
              ? `<img src="${s.photo}" alt="${s.name}" style="width:54px;height:54px;border-radius:50%;object-fit:cover;border:3px solid rgba(255,255,255,.4);flex-shrink:0">`
              : `<div style="width:54px;height:54px;border-radius:50%;background:rgba(255,255,255,.2);border:3px solid rgba(255,255,255,.3);display:flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:800;flex-shrink:0">${(s.name||'?').charAt(0)}</div>`}
            <div style="flex:1">
              <div style="font-size:1.1rem;font-weight:800">${s.name}</div>
              <div style="font-size:.76rem;opacity:.9;margin-top:2px">
                ${s.circle} · العمر: ${s.age} سنة · ${teacher?.name||'—'}
              </div>
              <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">
                <span class="badge" style="background:rgba(255,255,255,.18);color:#fff;font-size:.68rem">${s.level}</span>
                ${s.weak?'<span class="badge" style="background:rgba(224,85,85,.35);color:#fff;font-size:.65rem">⚠️ يحتاج دعم</span>':''}
                <span class="badge" style="background:rgba(255,255,255,.12);color:#fff;font-size:.65rem">📖 ${s.currentSurah} · آية ${s.currentAyah}</span>
              </div>
            </div>
            <div style="text-align:center;flex-shrink:0">
              <div style="font-size:1.8rem;font-weight:900">${pct}%</div>
              <div style="font-size:.62rem;opacity:.8">من القرآن</div>
            </div>
          </div>
        </div>

        <!-- Quick stats -->
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px">
          ${[[s.pages,'صفحة محفوظة','var(--emerald-light)'],[s.attendance+'%','نسبة الحضور',s.attendance>=90?'var(--emerald-light)':s.attendance>=75?'var(--gold-light)':'var(--red)'],[totalNew,'آية إجمالاً','var(--blue)'],[(s.sessions||[]).length,'جلسة مسجلة','var(--gold-light)']].map(([v,l,c])=>`
            <div style="background:var(--surface);border-radius:10px;padding:12px;text-align:center;border:1px solid var(--border)">
              <div style="font-size:1.2rem;font-weight:900;color:${c}">${v}</div>
              <div style="font-size:.62rem;color:var(--text-muted);margin-top:2px">${l}</div>
            </div>`).join('')}
        </div>

        <!-- خطة الحفظ -->
        <div style="background:var(--surface);border-radius:12px;padding:16px;margin-bottom:16px;
             border:1px solid var(--border-gold);border-right:4px solid var(--gold)">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <div style="font-size:.9rem;font-weight:800;color:var(--gold-light)">📝 خطة الحفظ</div>
            <span class="badge ${s.weak?'red':'green'}" style="font-size:.68rem">${s.weak?'خطة مخففة':'خطة عادية'}</span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px">
            ${[[s.plan.dailyAyah,'📖','آيات/يوم','var(--emerald-light)'],[s.plan.reviewDays,'🔁','أيام مراجعة','var(--blue)'],[s.plan.weeklyGoal,'🎯','الهدف الأسبوعي','var(--gold-light)'],[timeLabel,'⏳','وقت الختم','var(--orange)']].map(([v,ic,l,c])=>`
              <div style="background:var(--surface2);border-radius:9px;padding:10px;text-align:center;border:1px solid var(--border)">
                <div style="font-size:.9rem;margin-bottom:3px">${ic}</div>
                <div style="font-size:1rem;font-weight:900;color:${c}">${v}</div>
                <div style="font-size:.58rem;color:var(--text-muted);margin-top:2px">${l}</div>
              </div>`).join('')}
          </div>
          <div style="background:var(--surface2);border-radius:8px;padding:8px 12px;border:1px solid var(--border)">
            <div style="display:flex;justify-content:space-between;font-size:.72rem;color:var(--text-muted);margin-bottom:5px">
              <span>التقدم الأسبوعي المتوقع</span>
              <span style="color:var(--emerald-light);font-weight:700">${weeklyAyah} آية · ${weeklyPg} صفحة</span>
            </div>
            <div style="height:7px;background:var(--bg2);border-radius:4px;overflow:hidden">
              <div style="height:100%;width:${Math.min(100,Math.round(weeklyPg/20*100))}%;
                   background:linear-gradient(90deg,var(--emerald),var(--emerald-light));border-radius:4px"></div>
            </div>
          </div>
        </div>

        <!-- Juz progress -->
        <div style="margin-bottom:16px">
          ${juzsWidget(s,{compact:true})}
        </div>

        <!-- آخر الجلسات -->
        <div style="background:var(--surface);border-radius:12px;padding:16px;margin-bottom:16px;border:1px solid var(--border)">
          <div style="font-size:.88rem;font-weight:700;color:var(--gold-light);margin-bottom:10px">🗓 آخر الجلسات</div>
          ${(s.sessions||[]).length>0?(s.sessions||[]).slice(0,3).map(ses=>`
            <div style="display:flex;align-items:center;gap:8px;padding:8px 0;
                 border-bottom:1px solid var(--border);flex-wrap:wrap">
              <span style="font-size:.78rem;color:var(--text-muted);min-width:80px">${ses.date}</span>
              <span style="font-size:.78rem">حفظ <strong style="color:var(--emerald-light)">+${ses.new}</strong></span>
              <span style="font-size:.78rem">مراجعة <strong style="color:var(--blue)">${ses.review}</strong></span>
              ${ses.surah?`<span style="font-size:.75rem;color:var(--gold-light)">${ses.surah}</span>`:''}
              ${gradeBadge(ses.grade)}
              ${ses.notes?`<span style="font-size:.72rem;color:var(--orange);width:100%">📌 ${ses.notes}</span>`:''}
            </div>`).join('')
          :`<div style="color:var(--text-muted);font-size:.82rem;text-align:center;padding:8px 0">لا توجد جلسات بعد</div>`}
        </div>

        <!-- الإجراءات -->
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-solid btn-sm" onclick="navigateTo('t-session')">📖 تسجيل جلسة</button>
          <button class="btn btn-gold btn-sm" onclick="navigateTo('t-plans')">✏️ تعديل الخطة</button>
          <button class="btn btn-green btn-sm" onclick="exportStudentPDF(${s.id})">🖨️ تصدير PDF</button>
          <button class="btn btn-sm" style="background:var(--blue-soft);color:var(--blue);border:1px solid rgba(61,105,117,.3)"
            onclick="showToast('📤 إرسال إشعار لولي أمر ${s.name}')">📤 إشعار لولي الأمر</button>
        </div>
      </div>`;
  }).join('');

  el.innerHTML = `
    <!-- Circle info -->
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
      <span style="font-size:1.3rem">🕌</span>
      <div>
        <div style="font-size:.95rem;font-weight:700">${circle?.name||'حلقتي'}</div>
        <div style="font-size:.75rem;color:var(--text-muted)">
          ${myStudents.length} طالب
          ${myStudents.filter(s=>s.weak).length>0?` · <span style="color:var(--red)">⚠️ ${myStudents.filter(s=>s.weak).length} يحتاجون دعماً</span>`:''}
        </div>
      </div>
      <button class="btn btn-solid btn-sm" style="margin-right:auto" onclick="navigateTo('t-session')">📖 + تسجيل جلسة</button>
    </div>

    <!-- Tabs -->
    <div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:10px;margin-bottom:20px;
         scrollbar-width:thin">
      ${tabsHTML}
    </div>

    <!-- File panels -->
    <div id="studentFilePanels">
      ${panelsHTML}
    </div>
  `;

  // Activate first tab
  if (myStudents.length > 0) activateStudentTab(myStudents[0].id);
};

window.switchStudentFile = function(sid) {
  activateStudentTab(sid);
};

function activateStudentTab(sid) {
  // Hide all panels
  document.querySelectorAll('[id^="spanel-"]').forEach(p => p.style.display='none');
  // Show selected
  const panel = document.getElementById('spanel-'+sid);
  if (panel) { panel.style.display='block'; panel.style.animation='fadeUp .3s ease'; }
  // Update tabs styling
  document.querySelectorAll('[id^="stab-"]').forEach(t => {
    t.classList.remove('stab-active');
    t.style.background   = 'var(--surface2)';
    t.style.borderColor  = 'var(--border)';
  });
  const tab = document.getElementById('stab-'+sid);
  if (tab) {
    tab.classList.add('stab-active');
    tab.style.background  = 'var(--emerald-glow)';
    tab.style.borderColor = 'var(--emerald-mid)';
    tab.scrollIntoView({behavior:'smooth', block:'nearest', inline:'center'});
  }
}

function renderTeacherStudentCard(s) {
  const pct      = Math.round(s.pages / s.totalPages * 100);
  const lastSes  = (s.sessions||[]).length > 0 ? s.sessions[0] : null;
  const colors   = {متفوق:'#536f5a', جيد:'#3d6975', متوسط:'#836128', ضعيف:'#a7352a'};
  const col      = colors[s.level] || '#888';

  return `
    <div class="card" style="position:relative;overflow:hidden;transition:all .2s;cursor:pointer"
         onclick="openStudentModal(${s.id})"
         onmouseenter="this.style.borderColor='var(--emerald-mid)';this.style.transform='translateY(-2px)'"
         onmouseleave="this.style.borderColor='';this.style.transform=''">

      <!-- Weak indicator strip -->
      ${s.weak ? `<div style="position:absolute;top:0;right:0;left:0;height:3px;background:var(--red)"></div>` : ''}

      <!-- Header -->
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;${s.weak?'margin-top:6px':''}">
        ${s.photo
          ? `<img src="${s.photo}" alt="${s.name}" style="width:46px;height:46px;border-radius:50%;object-fit:cover;border:2px solid ${col}40;flex-shrink:0">`
          : `<div style="width:46px;height:46px;border-radius:50%;background:${col}18;color:${col};border:2px solid ${col}40;display:flex;align-items:center;justify-content:center;font-size:1.1rem;font-weight:800;flex-shrink:0">${(s.name||'?').charAt(0)}</div>`}
        <div style="flex:1;min-width:0">
          <div style="font-weight:800;font-size:.95rem;cursor:pointer;
               color:var(--emerald-light);text-decoration:underline;
               text-underline-offset:3px;text-decoration-style:dotted"
               onclick="openStudentModal(${s.id})">${s.name}</div>
          <div style="font-size:.72rem;color:var(--text-muted);margin-top:2px">
            العمر: ${s.age} سنة
            ${s.weak ? ' · <span style="color:var(--red);font-weight:600">يحتاج دعم ⚠️</span>' : ''}
          </div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
          ${levelBadge(s.level)}
        </div>
      </div>

      <!-- Current position -->
      <div style="background:var(--surface2);border-radius:8px;padding:8px 12px;
           margin-bottom:12px;display:flex;align-items:center;gap:8px;font-size:.8rem">
        <span>📖</span>
        <span style="color:var(--text-muted)">السورة الحالية:</span>
        <strong style="color:var(--gold-light)">${s.currentSurah}</strong>
        <span style="color:var(--text-dim)">— آية ${s.currentAyah}</span>
      </div>

      <!-- Stats grid -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:12px">
        <div style="background:var(--surface2);border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:1.05rem;font-weight:900;color:var(--emerald-light)">${s.pages}</div>
          <div style="font-size:.6rem;color:var(--text-muted)">صفحة</div>
        </div>
        <div style="background:var(--surface2);border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:1.05rem;font-weight:900;
               color:${s.attendance>=90?'var(--emerald-light)':s.attendance>=75?'var(--gold-light)':'var(--red)'}">
            ${s.attendance}%
          </div>
          <div style="font-size:.6rem;color:var(--text-muted)">حضور</div>
        </div>
        <div style="background:var(--surface2);border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:1.05rem;font-weight:900;color:var(--blue)">${s.plan.dailyAyah}</div>
          <div style="font-size:.6rem;color:var(--text-muted)">آيات/يوم</div>
        </div>
      </div>

      <!-- Progress bar -->
      <div style="margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;font-size:.68rem;
             color:var(--text-muted);margin-bottom:3px">
          <span>تقدم الحفظ</span><span>${pct}%</span>
        </div>
        ${pctBar(s.pages, s.totalPages, s.level==='ضعيف'?'red':'')}
      </div>

      <!-- Last session -->
      ${lastSes ? `
        <div style="background:var(--surface2);border-radius:8px;padding:7px 10px;
             margin-bottom:10px;font-size:.75rem;display:flex;align-items:center;gap:6px;flex-wrap:wrap">
          <span style="color:var(--text-dim)">آخر جلسة:</span>
          <span style="color:var(--text-muted)">${lastSes.date}</span>
          <span>·</span>
          <span>+<strong style="color:var(--emerald-light)">${lastSes.new}</strong> آيات</span>
          <span>·</span>
          ${gradeBadge(lastSes.grade)}
          ${lastSes.notes ? `<span style="color:var(--orange);width:100%;margin-top:2px">📌 ${lastSes.notes}</span>` : ''}
        </div>` :
        `<div style="font-size:.75rem;color:var(--text-dim);margin-bottom:10px">لم تُسجَّل أي جلسة بعد</div>`
      }

      <!-- Plan summary -->
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">
        <span class="badge green" style="font-size:.68rem">${s.plan.dailyAyah} آيات/يوم</span>
        <span class="badge blue" style="font-size:.68rem">مراجعة ${s.plan.reviewDays} أيام</span>
        <span class="badge gold" style="font-size:.68rem">${s.plan.weeklyGoal}</span>
      </div>

      <!-- Actions -->
      <div style="display:flex;gap:7px;flex-wrap:wrap" onclick="event.stopPropagation()">
        <button class="btn btn-solid btn-sm" onclick="navigateTo('t-session')">📖 تسجيل جلسة</button>
        <button class="btn btn-green btn-sm" onclick="openStudentModal(${s.id})">📋 الملف الكامل</button>
        <button class="btn btn-gold btn-sm" onclick="exportStudentPDF(${s.id})">🖨️ PDF</button>
        <button class="btn btn-sm" style="background:rgba(155,111,212,.12);color:var(--gold-light);border:1px solid rgba(155,111,212,.3)"
          onclick="showToast('📤 إرسال إشعار لولي أمر ${s.name}')">📤 إشعار</button>
      </div>
    </div>
  `;
}

// ---- TEACHER SESSION ----
let _sessionSurahMax = 5;

pages['t-session'] = function(el) {
  const myStudents = DB.students.filter(s=>s.teacher===currentUser.id);
  el.innerHTML = `
    <div class="card" style="margin-bottom:16px">
      <div class="card-title"><span class="ct-icon">📖</span> ${tt('تسجيل جلسة حفظ جديدة','Record New Memorization Session')}</div>
      ${myStudents.length===0
        ? `<div style="text-align:center;padding:32px;color:var(--text-muted)">${t('noStudents')}</div>`
        : `
      <div class="grid-2" style="margin-bottom:14px">
        <div class="field" style="margin:0"><label>${t('thStudent')}</label>
          <select id="sessionStudent" onchange="onSessionStudentChange(this)">
            ${myStudents.map(s=>`<option value="${s.id}">${s.name}</option>`).join('')}
          </select>
        </div>
        <div class="field" style="margin:0"><label>${t('sessionDate')}</label>
          <input type="date" id="sessionDate" value="${new Date().toISOString().split('T')[0]}">
        </div>
      </div>
      <div id="studentInfoBar" style="display:none;background:var(--surface2);border-radius:10px;
           padding:10px 14px;margin-bottom:14px;font-size:.82rem;
           border:1px solid var(--border);display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        <span id="sib-name" style="font-weight:700"></span>
        <span style="color:var(--text-dim)">·</span>
        <span style="color:var(--text-muted)">${tt('السورة الحالية:','Current Surah:')} <strong id="sib-surah" style="color:var(--gold-light)"></strong> ${tt('آية','v.')} <strong id="sib-ayah"></strong></span>
        <span style="color:var(--text-dim)">·</span>
        <span style="color:var(--text-muted)">${tt('الخطة:','Plan:')} <strong id="sib-plan" style="color:var(--emerald-light)"></strong> ${tt('آيات/يوم','v/day')}</span>
      </div>
      <div class="grid-3" style="margin-bottom:14px">
        <div class="field" style="margin:0"><label>${tt('السورة','Surah')}</label>
          <div class="surah-wrap" id="surahWrap">
            <div class="surah-input-row">
              <span class="surah-num-badge" id="surahNumBadge">—</span>
              <input id="sessionSurah" value="" placeholder="${tt('ابحث عن سورة...','Search surah...')}"
                autocomplete="off" oninput="filterSurahs(this.value)"
                onfocus="openSurahDropdown()" onkeydown="surahKeyNav(event)">
            </div>
            <div class="surah-dropdown" id="surahDropdown"></div>
          </div>
          <div id="surahAyahHint" style="font-size:.7rem;color:var(--text-muted);margin-top:4px">
            ${tt('عدد آياتها:','Total verses:')} <strong id="surahMaxHint" style="color:var(--emerald-light)">—</strong>
          </div>
        </div>
        <div class="field" style="margin:0">
          <label>${t('fromAyah')}</label>
          <input type="number" id="sessionFrom" value="1" min="1" oninput="validateAyahRange()" style="width:100%">
          <div id="fromErr" style="font-size:.7rem;color:var(--red);margin-top:3px;display:none"></div>
        </div>
        <div class="field" style="margin:0">
          <label>${t('toAyah')}</label>
          <input type="number" id="sessionTo" value="5" min="1" oninput="validateAyahRange();syncNewCount()" style="width:100%">
          <div id="toErr" style="font-size:.7rem;color:var(--red);margin-top:3px;display:none"></div>
        </div>
      </div>
      <div id="ayahRangeInfo" style="background:var(--emerald-glow);border:1px solid var(--border);
           border-radius:8px;padding:8px 12px;margin-bottom:14px;font-size:.78rem;
           color:var(--emerald-light);display:flex;align-items:center;gap:6px">
        ✅ ${tt('النطاق: آية','Range: v.')} <strong id="rangeFrom">1</strong> → <strong id="rangeTo">5</strong>
        — ${tt('الآيات الجديدة:','New verses:')} <strong id="rangeCount">5</strong>
      </div>
      <div class="grid-3" style="margin-bottom:14px">
        <div class="field" style="margin:0">
          <label>${t('newMemorization')} <span style="font-size:.68rem;color:var(--text-dim)">(${tt('تلقائي','auto')})</span></label>
          <input type="number" id="sessionNew" value="5" min="0" oninput="validateNewAyah()" style="width:100%">
          <div id="newErr" style="font-size:.7rem;color:var(--red);margin-top:3px;display:none"></div>
        </div>
        <div class="field" style="margin:0"><label>${t('reviewAyahs')}</label>
          <input type="number" id="sessionReview" value="10" min="0" style="width:100%">
        </div>
        <div class="field" style="margin:0"><label>${t('grade')}</label>
          <select id="sessionGrade">
            <option>${t('gradeExcellent')}</option>
            <option>${t('gradeVGood')}</option>
            <option>${t('gradeGood')}</option>
            <option>${t('gradePass')}</option>
            <option>${t('gradeFail')}</option>
          </select>
        </div>
      </div>
      <div class="grid-3" style="margin-bottom:14px">
        <div class="field" style="margin:0"><label>${tt('أخطاء الحفظ','Memorization Errors')}</label>
          <input type="number" id="sessionErrors" value="0" min="0" style="width:100%">
        </div>
        <div class="field" style="margin:0"><label>${tt('درجة التجويد','Tajweed Score')}</label>
          <input type="number" id="sessionTajweed" value="90" min="0" max="100" style="width:100%">
        </div>
        <div class="field" style="margin:0"><label>${tt('درجة الطلاقة','Fluency Score')}</label>
          <input type="number" id="sessionFluency" value="90" min="0" max="100" style="width:100%">
        </div>
      </div>
      <div class="field"><label>${t('notes')}</label>
        <input placeholder="${tt('أي ملاحظات على الجلسة...','Any notes about the session...')}" id="sessionNotes">
      </div>
      <div style="display:flex;gap:10px">
        <button class="btn btn-solid" onclick="saveSession()">💾 ${tt('حفظ الجلسة','Save Session')}</button>
        <button class="btn btn-gold" onclick="showToast(tt('📤 تم إرسال إشعار لولي الأمر','📤 Notification sent'))">📤 ${tt('إرسال لولي الأمر','Notify Parent')}</button>
      </div>`}
    </div>

    <div class="card">
      <div class="card-title"><span class="ct-icon">📅</span> ${tt('آخر الجلسات المسجلة','Recent Recorded Sessions')}</div>
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th>${t('thStudent')}</th><th>${t('thDate')}</th><th>${tt('السورة','Surah')}</th>
            <th>${t('thNew')}</th><th>${t('thReview')}</th><th>${t('thGrade')}</th><th>${t('thNotes')}</th>
          </tr></thead>
          <tbody>
            ${myStudents.flatMap(s=>(s.sessions||[]).map(ses=>({...ses,name:s.name}))).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,10).map(ses=>`
              <tr>
                <td>${ses.name}</td>
                <td style="color:var(--text-muted)">${ses.date}</td>
                <td style="color:var(--gold-light)">${ses.surah||'—'}</td>
                <td style="color:var(--emerald-light);font-weight:700">+${ses.new}</td>
                <td style="color:var(--blue)">${ses.review}</td>
                <td>${gradeBadge(ses.grade)}</td>
                <td style="color:var(--text-muted);font-size:.78rem">${ses.notes||'—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  if (myStudents.length > 0) onSessionStudentChange(document.getElementById('sessionStudent'));
};

// Update student info bar when student changes
window.onSessionStudentChange = function(sel) {
  const sid = parseInt(sel?.value);
  const s   = DB.students.find(st=>st.id===sid);
  if (!s) return;
  const bar = document.getElementById('studentInfoBar');
  if (bar) {
    bar.style.display = 'flex';
    document.getElementById('sib-name').textContent  = s.name;
    document.getElementById('sib-surah').textContent = s.currentSurah;
    document.getElementById('sib-ayah').textContent  = s.currentAyah;
    document.getElementById('sib-plan').textContent  = s.plan.dailyAyah;
    // Pre-fill surah from student's current position
    const surahObj = QURAN_SURAHS.find(q=>q.name===s.currentSurah);
    if (surahObj) {
      const input = document.getElementById('sessionSurah');
      const badge = document.getElementById('surahNumBadge');
      if (input) input.value = surahObj.name;
      if (badge) badge.textContent = surahObj.n;
      _sessionSurahMax = surahObj.ayah;
      document.getElementById('surahMaxHint').textContent = surahObj.ayah;
      // Pre-fill from ayah from student's current ayah
      const fromInput = document.getElementById('sessionFrom');
      const toInput   = document.getElementById('sessionTo');
      if (fromInput) fromInput.value = s.currentAyah;
      const toVal = Math.min(s.currentAyah + s.plan.dailyAyah - 1, surahObj.ayah);
      if (toInput) toInput.value = toVal;
      syncNewCount();
      validateAyahRange();
    }
  }
};

// Called from selectSurah (override to also update max)
const _origSelectSurah = window.selectSurah;
window.selectSurah = function(name, n, maxAyah) {
  _origSelectSurah(name, n, maxAyah);
  _sessionSurahMax = parseInt(maxAyah) || 0;
  const hint = document.getElementById('surahMaxHint');
  if (hint) hint.textContent = maxAyah;
  // Reset from/to within valid range
  const fromInput = document.getElementById('sessionFrom');
  const toInput   = document.getElementById('sessionTo');
  if (fromInput && parseInt(fromInput.value) > _sessionSurahMax)
    fromInput.value = 1;
  if (toInput && parseInt(toInput.value) > _sessionSurahMax)
    toInput.value = Math.min(5, _sessionSurahMax);
  validateAyahRange();
  syncNewCount();
};

window.syncNewCount = function() {
  const from = parseInt(document.getElementById('sessionFrom')?.value)||1;
  const to   = parseInt(document.getElementById('sessionTo')?.value)||1;
  const newInput = document.getElementById('sessionNew');
  const count = to >= from ? (to - from + 1) : 0;
  if (newInput && count > 0) newInput.value = count;
  // Update range info bar
  const rf = document.getElementById('rangeFrom');
  const rt = document.getElementById('rangeTo');
  const rc = document.getElementById('rangeCount');
  if (rf) rf.textContent = from;
  if (rt) rt.textContent = to;
  if (rc) rc.textContent = count > 0 ? count : '—';
};

window.validateAyahRange = function() {
  const max  = _sessionSurahMax;
  const from = parseInt(document.getElementById('sessionFrom')?.value)||0;
  const to   = parseInt(document.getElementById('sessionTo')?.value)||0;
  const fromErr = document.getElementById('fromErr');
  const toErr   = document.getElementById('toErr');
  const bar     = document.getElementById('ayahRangeInfo');
  let valid = true;

  // Reset
  if (fromErr) { fromErr.style.display='none'; fromErr.textContent=''; }
  if (toErr)   { toErr.style.display='none';   toErr.textContent=''; }
  if (bar) { bar.style.background='var(--emerald-glow)'; bar.style.borderColor='var(--border)'; bar.style.color='var(--emerald-light)'; }

  if (max > 0) {
    if (from < 1) {
      fromErr.textContent = '⚠️ رقم الآية يجب أن يكون ١ على الأقل';
      fromErr.style.display = 'block'; valid = false;
    } else if (from > max) {
      fromErr.textContent = `⚠️ هذه السورة تحتوي على ${max} آية فقط`;
      fromErr.style.display = 'block'; valid = false;
    }
    if (to < 1) {
      toErr.textContent = '⚠️ رقم الآية يجب أن يكون ١ على الأقل';
      toErr.style.display = 'block'; valid = false;
    } else if (to > max) {
      toErr.textContent = `⚠️ تجاوزت عدد آيات السورة — الحد الأقصى: آية ${max}`;
      toErr.style.display = 'block'; valid = false;
    } else if (to < from) {
      toErr.textContent = '⚠️ آية النهاية يجب أن تكون أكبر من أو تساوي آية البداية';
      toErr.style.display = 'block'; valid = false;
    }
  }

  if (bar) {
    if (!valid) {
      bar.style.background  = 'var(--red-bg)';
      bar.style.borderColor = 'rgba(224,85,85,.3)';
      bar.style.color       = 'var(--red)';
    }
  }
  return valid;
};

window.validateNewAyah = function() {
  const max      = _sessionSurahMax;
  const from     = parseInt(document.getElementById('sessionFrom')?.value)||1;
  const newVal   = parseInt(document.getElementById('sessionNew')?.value)||0;
  const newErr   = document.getElementById('newErr');
  const remaining = max - from + 1;

  if (newErr) { newErr.style.display='none'; newErr.textContent=''; }

  if (max > 0 && newVal > remaining) {
    newErr.textContent = `⚠️ لا يمكن إضافة أكثر من ${remaining} آية من هذه السورة ابتداءً من آية ${from}`;
    newErr.style.display = 'block';
    return false;
  }
  if (newVal < 0) {
    newErr.textContent = '⚠️ عدد الآيات لا يمكن أن يكون سالباً';
    newErr.style.display = 'block';
    return false;
  }
  return true;
};

window.saveSession = function() {
  const sid     = parseInt(document.getElementById('sessionStudent').value);
  const student = DB.students.find(s=>s.id===sid);
  if (!student) { showToast('⚠️ يرجى اختيار الطالب'); return; }

  const surahName = (document.getElementById('sessionSurah')?.value||'').trim();
  const from      = parseInt(document.getElementById('sessionFrom')?.value)||1;
  const to        = parseInt(document.getElementById('sessionTo')?.value)||1;
  const newAyah   = parseInt(document.getElementById('sessionNew')?.value)||0;
  const review    = parseInt(document.getElementById('sessionReview')?.value)||0;
  const grade     = document.getElementById('sessionGrade')?.value;
  const notes     = document.getElementById('sessionNotes')?.value||'';
  const errors    = parseInt(document.getElementById('sessionErrors')?.value)||0;
  const tajweed   = clampNumber(document.getElementById('sessionTajweed')?.value, 0, 100);
  const fluency   = clampNumber(document.getElementById('sessionFluency')?.value, 0, 100);
  const date      = document.getElementById('sessionDate')?.value || new Date().toISOString().split('T')[0];

  // Validate
  if (!surahName) { showToast('⚠️ يرجى اختيار السورة من القائمة'); return; }
  if (!validateAyahRange()) { showToast('⚠️ يرجى تصحيح نطاق الآيات أولاً'); return; }
  if (!validateNewAyah())   { showToast('⚠️ عدد الآيات الجديدة يتجاوز المسموح'); return; }

  // Save
  student.pages = Math.min(604, Math.round((student.pages + newAyah / 15) * 10) / 10);
  student.currentSurah = surahName;
  student.currentAyah  = to < _sessionSurahMax ? to + 1 : 1;
  student.sessions.unshift({ date, surah: surahName, from, to, new: newAyah, review, grade, notes, errors, tajweed, fluency });
  student.lastSession = 'اليوم';
  if (typeof refreshStudentLearningState === 'function') refreshStudentLearningState(student);
  if (typeof logAudit === 'function') logAudit('session.create', 'تسجيل جلسة للطالب: ' + student.name);

  saveDB(); showToast('✅ تم حفظ جلسة ' + student.name + ' — ' + surahName + ' (آية ' + from + '–' + to + ')');

  // 🔔 إشعار Push لولي الأمر
  var gradeEmoji = grade==='ممتاز'||grade==='Excellent'?'🌟':grade==='جيد جداً'||grade==='Very Good'?'⭐':'📖';
  PUSH.send(
    'جلسة حفظ جديدة — ' + student.name,
    surahName + ' آية ' + from + '–' + to + ' · التقييم: ' + grade,
    { emoji: gradeEmoji, type: 'session', tag: 'session-' + student.id }
  );

  // Re-render page to update table
  navigateTo('t-session');
};

// ---- TEACHER PLANS ----
pages['t-plans'] = function(el) {
  const myStudents = DB.students.filter(s=>s.teacher===currentUser.id);
  el.innerHTML = `
    <div style="margin-bottom:16px">
      <div class="notif-item warn">💡 يمكنك تعديل خطة أي طالب وفق مستواه وقدراته. الطلاب الضعاف تم تعديل خططهم تلقائياً.</div>
    </div>
    ${myStudents.map(s=>{
      if (typeof ensureStudentLearningDefaults === 'function') ensureStudentLearningDefaults(s);
      const suggestion = typeof getSmartPlanSuggestion === 'function' ? getSmartPlanSuggestion(s) : null;
      return `
      <div class="card" style="margin-bottom:16px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:10px">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:38px;height:38px;border-radius:50%;background:var(--success-soft);display:flex;align-items:center;justify-content:center;font-weight:700">${s.name.charAt(0)}</div>
            <div>
              <div style="font-weight:700">${s.name}</div>
              <div style="font-size:.75rem;color:var(--text-muted)">السورة الحالية: ${s.currentSurah}</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            ${levelBadge(s.level)}
            ${s.weak?'<span class="badge red">خطة معدّلة</span>':''}
          </div>
        </div>
        ${suggestion ? `
          <div style="background:var(--emerald-glow);border:1px solid var(--emerald-mid);
               border-radius:10px;padding:10px 12px;margin-bottom:14px;
               display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap">
            <div style="font-size:.78rem;color:var(--emerald-light);line-height:1.7">
              🧠 اقتراح ذكي: ${suggestion.dailyAyah} آيات يومياً · ${suggestion.reviewDays} أيام مراجعة · ${suggestion.weeklyGoal} أسبوعياً
            </div>
            <button class="btn btn-green btn-sm" onclick="applySuggestedPlan(${s.id})">تطبيق الاقتراح</button>
          </div>` : ''}
        <div class="grid-3" style="margin-bottom:14px">
          <div>
            <div style="font-size:.72rem;color:var(--text-muted);margin-bottom:4px">آيات جديدة يومياً</div>
            <input type="number" value="${s.plan.dailyAyah}" min="1" max="20" style="width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:8px;color:var(--text);font-family:'Tajawal',sans-serif;text-align:center;font-size:1.1rem;font-weight:700" onchange="updatePlan(${s.id},'dailyAyah',this.value)">
          </div>
          <div>
            <div style="font-size:.72rem;color:var(--text-muted);margin-bottom:4px">أيام مراجعة أسبوعياً</div>
            <input type="number" value="${s.plan.reviewDays}" min="1" max="6" style="width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:8px;color:var(--text);font-family:'Tajawal',sans-serif;text-align:center;font-size:1.1rem;font-weight:700" onchange="updatePlan(${s.id},'reviewDays',this.value)">
          </div>
          <div>
            <div style="font-size:.72rem;color:var(--text-muted);margin-bottom:4px">الهدف الأسبوعي</div>
            <input value="${s.plan.weeklyGoal}" style="width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:8px;color:var(--text);font-family:'Tajawal',sans-serif;text-align:center" onchange="updatePlan(${s.id},'weeklyGoal',this.value)">
          </div>
        </div>
        ${s.weak?`<div class="notif-item" style="margin-bottom:10px;font-size:.8rem">⚠️ هذا الطالب في مستوى ضعيف — تم تخفيض الخطة تلقائياً. يُنصح بجلسات دعم إضافية.</div>`:''}
        <button class="btn btn-solid btn-sm" onclick="showToast('✅ تم حفظ خطة ${s.name}')">💾 حفظ الخطة</button>
      </div>
    `}).join('')}
  `;
};

window.applySuggestedPlan = function(id) {
  const s = DB.students.find(st=>st.id===id);
  if (!s || typeof applySmartPlan !== 'function') return;
  const suggestion = applySmartPlan(s);
  if (typeof logAudit === 'function') logAudit('plan.smart_apply', 'تطبيق خطة ذكية للطالب: ' + s.name);
  saveDB();
  showToast('✅ تم تطبيق الخطة الذكية: ' + suggestion.dailyAyah + ' آيات يومياً');
  navigateTo('t-plans');
};

window.updatePlan = function(id,field,val) {
  const s = DB.students.find(s=>s.id===id);
  if (!s) return;
  s.plan[field]=isNaN(val)?val:parseInt(val);
  if (typeof refreshStudentLearningState === 'function') refreshStudentLearningState(s);
  if (typeof logAudit === 'function') logAudit('plan.update', 'تعديل خطة الطالب: ' + s.name);
  saveDB();
  showToast('تم تحديث خطة '+s.name);
};

// ---- TEACHER MESSAGES ----
pages['t-messages'] = function(el) {
  const myStudentIds = new Set(DB.students.filter(s => s.teacher === currentUser.id).map(s => s.id));
  const messages = (DB.messages || []).filter(m => myStudentIds.has(m.studentId));
  el.innerHTML = `
    <div class="card">
      <div class="card-title"><span class="ct-icon">💬</span> رسائل أولياء الأمور</div>
      ${messages.length === 0 ? `
        <div style="text-align:center;padding:34px;color:var(--text-muted)">
          <div style="font-size:2rem;margin-bottom:8px">💬</div>
          <div>لا توجد رسائل من أولياء الأمور بعد</div>
        </div>` : messages.map(m => {
          const student = DB.students.find(s => s.id === m.studentId);
          const parent = DB.users.find(u => u.id === m.parentId);
          return `
            <div style="background:var(--surface2);border:1px solid var(--border);border-radius:12px;
                 padding:12px 14px;margin-bottom:10px">
              <div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:6px;flex-wrap:wrap">
                <div>
                  <strong style="color:var(--emerald-light)">${escapeHtml(student?.name || 'طالب')}</strong>
                  <span style="font-size:.75rem;color:var(--text-muted)"> · ${escapeHtml(parent?.name || 'ولي الأمر')}</span>
                </div>
                <span style="font-size:.7rem;color:var(--text-muted)">${new Date(m.at).toLocaleString('ar-SA')}</span>
              </div>
              <div style="font-size:.82rem;color:var(--text-muted);line-height:1.7;margin-bottom:10px">${escapeHtml(m.text)}</div>
              ${m.fromRole === 'parent' ? `
                <div style="display:flex;gap:8px">
                  <input id="reply-${m.id}" placeholder="اكتب رداً مختصراً..."
                    style="flex:1;background:var(--surface);border:1px solid var(--border);
                           border-radius:8px;padding:8px 10px;color:var(--text);font-family:Tajawal,sans-serif">
                  <button class="btn btn-solid btn-sm" onclick="sendTeacherReply(${m.id})">رد</button>
                </div>` : ''}
            </div>`;
        }).join('')}
    </div>
  `;
};

window.sendTeacherReply = function(messageId) {
  const original = (DB.messages || []).find(m => m.id === messageId);
  const text = (document.getElementById('reply-' + messageId)?.value || '').trim();
  if (!original || !text) { showToast('⚠️ اكتب الرد أولاً'); return; }
  DB.messages.unshift({
    id: Date.now(),
    studentId: original.studentId,
    teacherId: currentUser.id,
    parentId: original.parentId,
    fromRole: 'teacher',
    text,
    at: new Date().toISOString(),
    status: 'new'
  });
  original.status = 'replied';
  if (typeof logAudit === 'function') logAudit('message.teacher_reply', 'رد المعلم على رسالة ولي الأمر');
  saveDB();
  showToast('✅ تم إرسال الرد');
  navigateTo('t-messages');
};

// ---- TEACHER REPORTS ----
pages['t-reports'] = function(el) {
  const circle     = DB.circles.find(c => c.teacher === currentUser.id);
  const myStudents = DB.students.filter(s => s.teacher === currentUser.id);

  if (!circle && myStudents.length === 0) {
    el.innerHTML = `
      <div style="text-align:center;padding:60px 20px;color:var(--text-muted)">
        <div style="font-size:3rem;margin-bottom:12px">📋</div>
        <div style="font-size:1rem;font-weight:600;margin-bottom:6px">${tt('لا توجد حلقة مسندة إليك','No Halaqa assigned to you')}</div>
        <div style="font-size:.85rem">${tt('تواصل مع الإدارة لإسناد حلقة لك','Contact administration to assign a Halaqa')}</div>
      </div>`;
    return;
  }

  const totalSes  = myStudents.reduce((a,s)=>a+(s.sessions||[]).length, 0);
  const avgAtt    = myStudents.length ? Math.round(myStudents.reduce((a,s)=>a+s.attendance,0)/myStudents.length) : 0;
  const avgPct    = myStudents.length ? Math.round(myStudents.reduce((a,s)=>a+s.pages,0)/(myStudents.length*604)*100) : 0;
  const weakCount = myStudents.filter(s=>s.weak).length;

  el.innerHTML = `
    <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap">
      <button class="btn btn-solid btn-sm" onclick="showToast(tt('📄 جاري التصدير...','📄 Exporting...'))">📄 ${tt('تصدير الكل PDF','Export All PDF')}</button>
      <button class="btn btn-gold btn-sm" onclick="showToast(tt('📤 تم الإرسال','📤 Reports sent'))">📤 ${tt('إرسال لأولياء الأمور','Send to Parents')}</button>
      <button class="btn btn-green btn-sm" onclick="window.print()">🖨️ ${tt('طباعة','Print')}</button>
    </div>

    <div style="background:linear-gradient(135deg,var(--emerald),var(--emerald-mid));
         border-radius:14px;padding:20px 24px;margin-bottom:20px;position:relative;overflow:hidden">
      <div style="position:absolute;left:-30px;top:-30px;width:120px;height:120px;
           border-radius:50%;background:rgba(255,255,255,.07)"></div>
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;position:relative">
        <div style="display:flex;align-items:center;gap:14px">
          <div style="font-size:2rem">🕌</div>
          <div>
            <div style="font-size:1.15rem;font-weight:800">${circle?.name||tt('حلقتي','My Halaqa')}</div>
            <div style="font-size:.78rem;opacity:.9;margin-top:3px">🕐 ${circle?.time||'—'} · 📅 ${circle?.days||'—'}</div>
          </div>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          ${[
            [myStudents.length, tt('طالب','Students')],
            [avgAtt+'%', tt('متوسط الحضور','Avg Attendance')],
            [avgPct+'%', tt('متوسط التقدم','Avg Progress')],
            [totalSes, tt('جلسة مسجلة','Sessions')],
          ].map(([v,l])=>`
            <div style="text-align:center;background:rgba(255,255,255,.15);border-radius:10px;padding:8px 14px">
              <div style="font-size:1.1rem;font-weight:900">${v}</div>
              <div style="font-size:.65rem;opacity:.85">${l}</div>
            </div>`).join('')}
        </div>
      </div>
      ${weakCount > 0 ? `
        <div style="margin-top:12px;position:relative;background:rgba(224,85,85,.25);
             border-radius:8px;padding:7px 12px;font-size:.78rem">
          ⚠️ ${weakCount} ${tt('طالب يحتاج متابعة مكثفة','student(s) need intensive follow-up')}
        </div>` : ''}
    </div>

    ${myStudents.length === 0
      ? `<div style="text-align:center;padding:40px;color:var(--text-muted)">
           <div style="font-size:2rem;margin-bottom:8px">📭</div>
           <div>${t('noStudents')}</div>
         </div>`
      : myStudents.map(s => renderStudentReport(s)).join('')
    }
  `;
};

// ---- TEACHER NOTIFICATIONS ----
pages['t-notifications'] = function(el) {
  const myStudents = DB.students.filter(s=>s.teacher===currentUser.id);
  const recLabels = currentLang === 'en'
    ? [['parent','Parent','👨‍👦','For student progress follow-up'],['admin','Admin','👑','To report a case or request']]
    : [['parent','ولي الأمر','👨‍👦','لمتابعة تقدم الطالب'],['admin','الإدارة','👑','للإبلاغ عن حالة أو طلب']];
  const typeOptions = currentLang === 'en' ? [
    ['progress','Progress Report'],['attendance','Absence Alert'],
    ['achievement','Outstanding Achievement 🎉'],['meeting','Meeting Request'],
    ['weak','Student Needs Support'],['reminder','Home Review Reminder'],['report','Submit Report to Admin'],
  ] : [
    ['progress','تقرير تقدم الحفظ'],['attendance','تنبيه غياب'],
    ['achievement','إنجاز متميز 🎉'],['meeting','طلب اجتماع'],
    ['weak','طالب يحتاج دعماً'],['reminder','تذكير مراجعة منزلية'],['report','رفع تقرير للإدارة'],
  ];

  el.innerHTML = `
    <div class="grid-2" style="margin-bottom:20px">
      <div class="card">
        <div class="card-title"><span class="ct-icon">📤</span> ${tt('إرسال إشعار جديد','Send New Notification')}</div>
        <div style="margin-bottom:12px">
          <div style="font-size:.82rem;font-weight:700;color:var(--gold-light);margin-bottom:8px">📬 ${tt('إلى','To')}</div>
          ${recLabels.map(([v,l,ic,sub])=>`
            <label id="t-rec-${v}" style="display:flex;align-items:center;gap:10px;padding:9px 12px;
                   border-radius:8px;border:1px solid var(--border);cursor:pointer;
                   background:var(--surface2);transition:all .2s;margin-bottom:6px"
                   onclick="teacherToggleRec('${v}',this)">
              <div style="width:30px;height:30px;border-radius:50%;background:var(--emerald-glow);
                   display:flex;align-items:center;justify-content:center;font-size:.95rem">${ic}</div>
              <div style="flex:1">
                <div style="font-size:.83rem;font-weight:600">${l}</div>
                <div style="font-size:.68rem;color:var(--text-muted)">${sub}</div>
              </div>
              <div id="t-chk-${v}" style="width:18px;height:18px;border-radius:50%;
                   border:2px solid var(--border);display:flex;align-items:center;
                   justify-content:center;font-size:.6rem;transition:all .2s;flex-shrink:0"></div>
            </label>`).join('')}
        </div>
        <div class="field">
          <label>${tt('عن الطالب (اختياري)','Regarding student (optional)')}</label>
          <select id="tNotifStudent">
            <option value="">— ${tt('عام','General')} —</option>
            ${myStudents.map(s=>`<option value="${s.id}">${s.name}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label>${tt('نوع الإشعار','Notification type')}</label>
          <select id="tNotifType">
            ${typeOptions.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}
          </select>
        </div>        <div class="field">
          <label>الأولوية</label>
          <div style="display:flex;gap:8px;margin-top:4px">
            ${[['عادي','normal','green'],['مهم','important','gold'],['عاجل','urgent','red']].map(([l,v,c])=>`
              <label style="display:flex;align-items:center;gap:5px;cursor:pointer;font-size:.8rem">
                <input type="radio" name="tPriority" value="${v}" ${v==='normal'?'checked':''}>
                <span class="badge ${c}" style="font-size:.7rem">${l}</span>
              </label>`).join('')}
          </div>
        </div>

        <div class="field">
          <label>نص الإشعار</label>
          <textarea id="tNotifMsg" rows="3" placeholder="اكتب نص الإشعار..."
            style="width:100%;background:var(--surface2);border:1px solid var(--border);
                   border-radius:8px;padding:10px;color:var(--text);font-family:'Tajawal',sans-serif;
                   font-size:.9rem;resize:vertical;outline:none;line-height:1.6"
            onfocus="this.style.borderColor='var(--emerald-mid)'"
            onblur="this.style.borderColor=''"></textarea>
        </div>
        <button class="btn btn-solid" style="width:100%" onclick="teacherSendNotif()">📤 إرسال الإشعار</button>
      </div>

      <!-- Inbox panel -->
      <div class="card">
        <div class="card-title"><span class="ct-icon">🔔</span> إشعاراتي الواردة</div>
        ${DB.notifications.map(n=>`
          <div class="notif-item ${n.type==='alert'?'alert':n.type==='warn'?'warn':''}">
            ${n.msg}<div class="notif-time">⏰ ${n.time}</div>
          </div>`).join('')}
      </div>
    </div>
  `;
};

window._tNotifRecs = new Set();
window.teacherToggleRec = function(val, label) {
  const chk = document.getElementById('t-chk-'+val);
  if (window._tNotifRecs.has(val)) {
    window._tNotifRecs.delete(val);
    label.style.background='var(--surface2)'; label.style.borderColor='var(--border)';
    if(chk){chk.style.background='';chk.style.borderColor='var(--border)';chk.textContent='';}
  } else {
    window._tNotifRecs.add(val);
    label.style.background='var(--emerald-glow)'; label.style.borderColor='var(--emerald-mid)';
    if(chk){chk.style.background='var(--emerald-mid)';chk.style.borderColor='var(--emerald-mid)';chk.textContent='✓';chk.style.color='#fff';}
  }
};

window.teacherSendNotif = function() {
  const recs = [...(window._tNotifRecs||[])];
  const msg  = document.getElementById('tNotifMsg')?.value?.trim();
  const priority = document.querySelector('input[name="tPriority"]:checked')?.value||'normal';
  const sid  = document.getElementById('tNotifStudent')?.value;

  if (recs.length === 0) { showToast('⚠️ يرجى اختيار جهة الإرسال (ولي الأمر أو الإدارة)'); return; }
  if (!msg) { showToast('⚠️ يرجى كتابة نص الإشعار'); return; }

  const recMap = {parent:'ولي الأمر', admin:'الإدارة'};
  const recLabels = recs.map(v=>recMap[v]||v).join(' و');
  const nType = priority==='urgent'?'alert':priority==='important'?'warn':'info';
  const pIcon = priority==='urgent'?'🚨':priority==='important'?'⚠️':'📤';

  const student = sid ? DB.students.find(s=>s.id===parseInt(sid)) : null;
  const fullMsg = student ? `[عن: ${student.name}] ${msg}` : msg;

  DB.notifications.unshift({id:Date.now(), type:nType, msg:fullMsg, time:'الآن'});
  saveDB();

  // 🔔 Push notification
  PUSH.send(
    pIcon + ' ' + tt('إشعار جديد','New Notification') + ' → ' + recLabels,
    fullMsg,
    { emoji: pIcon, type: nType, important: priority==='urgent' }
  );
  window._tNotifRecs = new Set();
  document.getElementById('tNotifMsg').value = '';
  ['parent','admin'].forEach(v=>{
    const lbl=document.getElementById('t-rec-'+v);
    const chk=document.getElementById('t-chk-'+v);
    if(lbl){lbl.style.background='var(--surface2)';lbl.style.borderColor='var(--border)';}
    if(chk){chk.style.background='';chk.style.borderColor='var(--border)';chk.textContent='';}
  });

  showToast(pIcon + ' تم إرسال الإشعار إلى: ' + recLabels);
  navigateTo('t-notifications');
};

// ---- TEACHER ATTENDANCE ----
pages['t-attendance'] = function(el) {
  const myStudents = DB.students.filter(s => s.teacher === currentUser.id);
  const circle     = DB.circles.find(c => c.teacher === currentUser.id);
  const locale = currentLang === 'en' ? 'en-US' : 'ar-SA';
  const today = new Date().toLocaleDateString(locale,{weekday:'long',year:'numeric',month:'long',day:'numeric'});

  if (myStudents.length === 0) {
    el.innerHTML = `<div style="text-align:center;padding:60px 20px;color:var(--text-muted)">
      <div style="font-size:3rem;margin-bottom:12px">📋</div>
      <div style="font-size:1rem;font-weight:600">${t('noStudents')}</div>
    </div>`;
    return;
  }

  el.innerHTML = `
    <div class="card" style="margin-bottom:16px">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">
        <div>
          <div style="font-size:1rem;font-weight:700">📅 ${tt('سجل الحضور','Attendance Record')} — ${today}</div>
          <div style="font-size:.8rem;color:var(--text-muted);margin-top:4px">
            🕌 ${circle?.name||tt('حلقتي','My Halaqa')} · ${myStudents.length} ${t('students')}
          </div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-gold btn-sm" onclick="teacherMarkAll('present')">✅ ${tt('تحديد الكل حاضر','Mark All Present')}</button>
          <button class="btn btn-solid btn-sm" onclick="saveTeacherAtt()">💾 ${tt('حفظ السجل','Save Record')}</button>
        </div>
      </div>
    </div>

    <div class="card" style="margin-bottom:16px">
      <div style="display:flex;gap:16px;margin-bottom:16px;font-size:.82rem">
        <span class="badge green">● ${t('present')}</span>
        <span class="badge red">● ${t('absent')}</span>
        <span class="badge gold">● ${t('late')}</span>
      </div>
      ${myStudents.map(s => {
        const st = DB.attendance[s.id] || 'todo';
        return `
          <div class="att-row" id="att-row-${s.id}">
            <div style="display:flex;align-items:center;gap:10px;flex:1">
              ${s.photo
                ? `<img src="${s.photo}" style="width:30px;height:30px;border-radius:50%;object-fit:cover;flex-shrink:0">`
                : `<div style="width:30px;height:30px;border-radius:50%;background:var(--emerald-glow);color:var(--emerald-light);display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:700">${(s.name||'?').charAt(0)}</div>`}
              <div>
                <div style="font-size:.88rem;font-weight:600">${s.name}</div>
                <div style="font-size:.72rem;color:var(--text-muted)">${tt('آخر حضور:','Last session:')} ${s.lastSession||'—'}</div>
              </div>
            </div>
            <div class="att-btns">
              <button class="att-btn present ${st==='present'?'active':''}" title="${t('present')}" onclick="setAtt(${s.id},'present',this)">✓</button>
              <button class="att-btn absent ${st==='absent'?'active':''}" title="${t('absent')}" onclick="setAtt(${s.id},'absent',this)">✗</button>
              <button class="att-btn late ${st==='late'?'active':''}" title="${t('late')}" onclick="setAtt(${s.id},'late',this)">⏰</button>
            </div>
            <span class="badge ${st==='present'?'green':st==='absent'?'red':st==='late'?'gold':'gray'}"
                  id="att-badge-${s.id}" style="min-width:64px;justify-content:center">
              ${st==='present'?t('present'):st==='absent'?t('absent'):st==='late'?t('late'):'—'}
            </span>
          </div>`;
      }).join('')}
    </div>

    <div class="card">
      <div class="card-title"><span class="ct-icon">📊</span> ${tt('ملخص الحضور الشهري — حلقتي','Monthly Attendance Summary — My Circle')}</div>
      <div class="grid-4">
        ${myStudents.map(s => `
          <div style="text-align:center;padding:12px;background:var(--surface2);border-radius:10px">
            <div style="font-size:.8rem;font-weight:600;margin-bottom:6px">${s.name.split(' ')[0]}</div>
            <div style="font-size:1.2rem;font-weight:900;color:${s.attendance>=90?'var(--emerald-light)':s.attendance>=75?'var(--gold-light)':'var(--red)'}">${s.attendance}%</div>
            ${pctBar(s.attendance, 100, s.attendance < 75 ? 'red' : '')}
          </div>`).join('')}
      </div>
    </div>
  `;
};

window.teacherMarkAll = function(status) {
  const myStudents = DB.students.filter(s => s.teacher === currentUser.id);
  myStudents.forEach(s => {
    DB.attendance[s.id] = status;
    const row   = document.getElementById('att-row-' + s.id);
    const badge = document.getElementById('att-badge-' + s.id);
    if (row) row.querySelectorAll('.att-btn').forEach(b => {
      b.classList.toggle('active', b.classList.contains(status));
    });
    if (badge) {
      badge.textContent = status==='present'?t('present'):status==='absent'?t('absent'):t('late');
      badge.className = 'badge '+(status==='present'?'green':status==='absent'?'red':'gold');
      badge.style.minWidth='64px'; badge.style.justifyContent='center';
    }
  });
  saveDB();
  showToast('✅ '+(status==='present'?t('present'):status==='absent'?t('absent'):t('late')));
};

window.saveTeacherAtt = function() {
  const myStudents = DB.students.filter(s => s.teacher === currentUser.id);
  let present=0, absent=0, late=0;
  const absentStudents = [], lateStudents = [];
  myStudents.forEach(s => {
    const st = DB.attendance[s.id];
    if (st==='present'){present++; s.attendance=Math.min(100,s.attendance+1);}
    if (st==='absent') {absent++;  s.attendance=Math.max(0,  s.attendance-3); absentStudents.push(s.name);}
    if (st==='late')   {late++;    s.attendance=Math.max(0,  s.attendance-1); lateStudents.push(s.name);}
  });
  saveDB();
  showToast(`💾 ${tt('تم الحفظ','Saved')} — ${t('present')}: ${present} · ${t('absent')}: ${absent} · ${t('late')}: ${late}`);

  // 🔔 إشعار Push لكل طالب غائب
  if (absentStudents.length > 0) {
    PUSH.send(
      tt('⚠️ تسجيل غياب','⚠️ Absence Recorded'),
      tt('غائب اليوم: ','Absent today: ') + absentStudents.join(', '),
      { emoji:'⚠️', type:'alert', tag:'absence-today', important:true }
    );
  }
  if (lateStudents.length > 0) {
    PUSH.send(
      tt('⏰ تأخر عن الحلقة','⏰ Late Arrival'),
      lateStudents.join(', '),
      { emoji:'⏰', type:'warn', tag:'late-today' }
    );
  }
};

