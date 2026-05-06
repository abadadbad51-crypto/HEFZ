const pages = {};

// ---- ADMIN DASHBOARD ----
pages['dashboard'] = function(el) {
  const totalStudents = DB.students.length;
  const totalPages = DB.students.reduce((a,s)=>a+s.pages,0);
  const avgAttendance = totalStudents ? Math.round(DB.students.reduce((a,s)=>a+s.attendance,0)/totalStudents) : 0;
  DB.students.forEach(s => typeof refreshStudentLearningState === 'function' && refreshStudentLearningState(s));
  const weakStudents = DB.students.filter(s=>s.weak || s.needsSupport).length;
  const dayLabels = [t('days_sat'),t('days_sun'),t('days_mon'),t('days_tue'),t('days_wed'),t('days_thu'),t('days_fri')];

  el.innerHTML = `
    <div class="grid-4" style="margin-bottom:20px">
      <div class="stat-box">
        <div class="stat-icon green">👥</div>
        <div><div class="stat-val">${totalStudents}</div><div class="stat-lbl">${t('totalStudents')}</div><div class="stat-change up">${t('thisMonth')}</div></div>
      </div>
      <div class="stat-box">
        <div class="stat-icon gold">📖</div>
        <div><div class="stat-val">${totalPages}</div><div class="stat-lbl">${t('memorizedPages')}</div><div class="stat-change up">${t('thisWeek')}</div></div>
      </div>
      <div class="stat-box">
        <div class="stat-icon blue">✅</div>
        <div><div class="stat-val">${avgAttendance}%</div><div class="stat-lbl">${t('attendanceRate')}</div><div class="stat-change up">${t('attendanceUp')}</div></div>
      </div>
      <div class="stat-box" onclick="openWeakStudentsModal()" style="cursor:pointer;transition:all .2s"
           onmouseenter="this.style.borderColor='var(--red)';this.style.transform='translateY(-2px)'"
           onmouseleave="this.style.borderColor='';this.style.transform=''">
        <div class="stat-icon red">⚠️</div>
        <div>
          <div class="stat-val">${weakStudents}</div>
          <div class="stat-lbl">${t('needSupport')}</div>
          <div class="stat-change down" style="display:flex;align-items:center;gap:4px">
            <span>${t('urgentFollowup')}</span>
            <span style="font-size:.65rem;color:var(--text-dim)">${t('clickToView')}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="grid-2" style="margin-bottom:20px">
      <div class="card">
        <div class="card-title"><span class="ct-icon">📈</span> ${t('weeklyActivity')}</div>
        <div class="chart-bars" id="weekChart"></div>
        <div class="chart-labels">
          ${dayLabels.map(d=>`<div class="chart-label">${d}</div>`).join('')}
        </div>
      </div>
      <div class="card">
        <div class="card-title"><span class="ct-icon">🕌</span> ${t('activeCircles')}</div>
        ${DB.circles.length === 0
          ? `<div style="color:var(--text-muted);font-size:.85rem;padding:12px 0">${t('noCircles')}</div>`
          : DB.circles.map(c=>{
          const teacher = DB.users.find(u=>u.id===c.teacher);
          return `<div class="plan-row" style="margin-bottom:8px;cursor:pointer;transition:all .2s;" onclick="openCircleModal(${c.id})"
            onmouseenter="this.style.borderColor='var(--emerald-mid)'"
            onmouseleave="this.style.borderColor=''">
            <span class="plan-icon">🕌</span>
            <div class="plan-text">
              <div style="font-weight:600">${c.name}</div>
              <div style="font-size:.75rem;color:var(--text-muted)">${teacher?.name||''} · ${c.time} · ${c.days}</div>
            </div>
            <div style="display:flex;align-items:center;gap:6px">
              <span class="badge green">${c.students.length} ${t('students')}</span>
            </div>
          </div>`;
        }).join('')}
        <button class="btn btn-green btn-sm" style="margin-top:8px" onclick="navigateTo('circles')">${t('addCircle')}</button>
      </div>
    </div>

    <div class="card" style="margin-bottom:20px">
      <div class="section-hdr">
        <h2 class="card-title" style="margin:0"><span class="ct-icon">⭐</span> ${t('topStudents')}</h2>
        <button class="btn btn-green btn-sm" onclick="navigateTo('students')">${t('viewAll')}</button>
      </div>
      ${DB.students.length === 0
        ? `<div style="text-align:center;padding:32px;color:var(--text-muted)">
            <div style="font-size:2rem;margin-bottom:8px">👥</div>
            <div>${t('noStudents')}</div>
            <div style="font-size:.78rem;margin-top:4px">${t('addFirst')}</div>
           </div>`
        : `<div class="table-wrap">
        <table>
          <thead><tr>
            <th>${t('thStudent')}</th><th>${t('thCircle')}</th><th>${t('thLevel')}</th>
            <th>${t('thPages')}</th><th>${t('thAttendance')}</th>
            <th>${t('thLastSession')}</th><th>${t('thAction')}</th>
          </tr></thead>
          <tbody>
            ${DB.students.slice(0,5).map(s=>`
              <tr>
                <td><div style="display:flex;align-items:center;gap:8px">
                  ${studentAvatar(s, 30, false)}
                  <span>${s.name}</span>
                </div></td>
                <td>${s.circle}</td>
                <td>${levelBadge(s.level)}</td>
                <td>
                  <div>${s.pages} / ${s.totalPages}</div>
                  ${pctBar(s.pages,s.totalPages)}
                </td>
                <td><span class="${s.attendance>=90?'badge green':s.attendance>=75?'badge gold':'badge red'}">${s.attendance}%</span></td>
                <td style="color:var(--text-muted)">${s.lastSession||'—'}</td>
                <td><button class="btn btn-green btn-sm" onclick="openStudentModal(${s.id})">${t('view')}</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>`}
    </div>

    <div class="card">
      <div class="card-title"><span class="ct-icon">🗺️</span> ${t('quranMap')}</div>
      <div class="quran-grid" id="quranGrid"></div>
      <div style="display:flex;gap:16px;margin-top:8px;font-size:.72rem">
        <span><span style="display:inline-block;width:12px;height:12px;border-radius:2px;background:var(--emerald);margin-left:4px;vertical-align:middle"></span>${t('complete')}</span>
        <span><span style="display:inline-block;width:12px;height:12px;border-radius:2px;background:var(--gold-pale);margin-left:4px;vertical-align:middle"></span>${t('partial')}</span>
        <span><span style="display:inline-block;width:12px;height:12px;border-radius:2px;background:var(--surface2);margin-left:4px;vertical-align:middle"></span>${t('notStarted')}</span>
      </div>
    </div>
  `;

  // Week chart
  const chartEl = document.getElementById('weekChart');
  const max = Math.max(...DB.weeklyData, 1);
  DB.weeklyData.forEach((v,i)=>{
    const bar = document.createElement('div');
    bar.className='chart-bar';
    bar.setAttribute('data-val', v + (currentLang==='en' ? ' verses' : ' آية'));
    setTimeout(()=>{ bar.style.height = (v/max*100)+'%'; },100+i*60);
    chartEl.appendChild(bar);
  });

  // Quran grid
  const gridEl = document.getElementById('quranGrid');
  for(let j=1;j<=30;j++){
    const cell = document.createElement('div');
    cell.className = 'juz-cell ' + (j<=3?'done':j<=7?'partial':'todo');
    cell.textContent = j;
    cell.title = t('juz')+' '+j;
    gridEl.appendChild(cell);
  }
};

// ---- STUDENTS PAGE ----
pages['students'] = function(el) {
  const isEn = currentLang === 'en';
  el.innerHTML = `
    <div style="display:flex;gap:10px;margin-bottom:10px;flex-wrap:wrap">
      <input id="studentSearch" oninput="filterStudents()" style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:8px 12px;color:var(--text);font-family:'Tajawal',sans-serif;flex:1;min-width:180px;outline:none" placeholder="🔍 ${t('search')}">
      <select id="studentCircleFilter" onchange="filterStudents()" style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:8px 12px;color:var(--text);font-family:'Tajawal',sans-serif">
        <option value="">${isEn?'All Halaqas':'كل الحلقات'}</option>
        ${DB.circles.map(c=>`<option value="${escapeStudentHtml(c.name)}">${escapeStudentHtml(c.name)}</option>`).join('')}
      </select>
      <select id="studentLevelFilter" onchange="filterStudents()" style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:8px 12px;color:var(--text);font-family:'Tajawal',sans-serif">
        <option value="">${isEn?'All Levels':'كل المستويات'}</option>
        <option value="متفوق">${t('excellent')}</option>
        <option value="جيد">${t('good')}</option>
        <option value="متوسط">${t('average')}</option>
        <option value="ضعيف">${t('weak')}</option>
      </select>
      <button class="btn btn-green" onclick="clearStudentFilters()">↺ ${isEn?'Clear':'مسح'}</button>
      <button class="btn btn-solid" onclick="openAddStudentModal()">${t('addStudent')}</button>
    </div>
    <div id="studentResultsCount" style="font-size:.78rem;color:var(--text-muted);margin-bottom:14px"></div>
    <div class="grid-3" id="studentsGrid"></div>
    <div id="studentsEmpty"></div>
  `;

  window.renderStudentsGrid();
};

function escapeStudentHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, function(ch) {
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];
  });
}

function normalizeStudentText(value) {
  return String(value ?? '').trim().toLowerCase();
}

function getStudentFilters() {
  return {
    q: normalizeStudentText(document.getElementById('studentSearch')?.value),
    circle: document.getElementById('studentCircleFilter')?.value || '',
    level: document.getElementById('studentLevelFilter')?.value || '',
  };
}

function studentMatchesFilters(s, filters) {
  const searchable = normalizeStudentText([
    s.name, s.circle, s.level, s.age, s.currentSurah, s.currentAyah,
    s.pages, s.attendance, s.lastSession,
  ].join(' '));
  const matchesSearch = !filters.q || searchable.includes(filters.q);
  const matchesCircle = !filters.circle || s.circle === filters.circle;
  const matchesLevel = !filters.level || s.level === filters.level;
  return matchesSearch && matchesCircle && matchesLevel;
}

function renderStudentCard(s) {
  const pct = Math.round(s.pages/s.totalPages*100);
  const colors = {متفوق:'#536f5a',جيد:'#3d6975',متوسط:'#836128',ضعيف:'#a7352a',
                  Advanced:'#536f5a',Good:'#3d6975',Average:'#836128',Weak:'#a7352a'};
  const col = colors[s.level]||'#aaa';
  const isEn = currentLang === 'en';
  const safeName = escapeStudentHtml(s.name);
  const safeCircle = escapeStudentHtml(s.circle || '—');
  const safeInitial = escapeStudentHtml((s.name || '?').charAt(0));
  const safeLastSession = escapeStudentHtml(s.lastSession&&s.lastSession!=='—'?s.lastSession.split(' ').slice(0,2).join(' '):'—');
  const avatar = s.photo
    ? `<img src="${escapeStudentHtml(s.photo)}" alt="${safeName}" class="s-photo" style="width:42px;height:42px;border:2px solid ${col}40">`
    : `<div class="s-avatar" style="background:${col}20;color:${col};border:2px solid ${col}40">${safeInitial}</div>`;

  return `
    <div class="student-card" onclick="openStudentModal(${s.id})">
      <div class="student-card-top">
        ${avatar}
        <div>
          <div class="s-name">${safeName}</div>
          <div class="s-level">${safeCircle} · ${escapeStudentHtml(s.age)} ${isEn?'yrs':'سنة'}</div>
        </div>
        ${levelBadge(s.level)}
      </div>
      <div style="margin-bottom:8px">
        <div style="display:flex;justify-content:space-between;font-size:.75rem;color:var(--text-muted);margin-bottom:4px">
          <span>${isEn?'Pages':'الحفظ'}: ${escapeStudentHtml(s.pages)} ${isEn?'pg':'صفحة'}</span><span>${pct}%</span>
        </div>
        ${pctBar(s.pages,s.totalPages,s.level==='ضعيف'||s.level==='Weak'?'red':'')}
      </div>
      <div class="s-stats">
        <div class="s-stat">${isEn?'Att':'حضور'}: <span>${escapeStudentHtml(s.attendance)}%</span></div>
        <div class="s-stat">${isEn?'Last':'آخر'}: <span>${safeLastSession}</span></div>
        ${s.weak?`<span class="badge red" style="font-size:.65rem">${isEn?'Needs Support':'يحتاج دعم'}</span>`:''}
      </div>
    </div>`;
}

window.renderStudentsGrid = function() {
  const grid = document.getElementById('studentsGrid');
  const empty = document.getElementById('studentsEmpty');
  const countEl = document.getElementById('studentResultsCount');
  if (!grid || !empty) return;

  const filters = getStudentFilters();
  const filtered = DB.students.filter(s => studentMatchesFilters(s, filters));
  const isEn = currentLang === 'en';
  grid.innerHTML = filtered.map(renderStudentCard).join('');

  if (countEl) {
    countEl.textContent = DB.students.length === 0
      ? (isEn ? 'No students yet' : 'لا يوجد طلاب بعد')
      : (isEn ? `${filtered.length} of ${DB.students.length} students` : `${filtered.length} من ${DB.students.length} طالب`);
  }

  if (DB.students.length === 0) {
    empty.innerHTML = `
      <div style="text-align:center;padding:60px 20px;color:var(--text-muted)">
        <div style="font-size:3rem;margin-bottom:12px">👥</div>
        <div style="font-size:1rem;font-weight:600;margin-bottom:6px">${t('noStudents')}</div>
        <div style="font-size:.85rem;margin-bottom:16px">${t('addFirst')}</div>
        <button class="btn btn-solid" onclick="openAddStudentModal()">${t('addStudent')}</button>
      </div>`;
  } else if (filtered.length === 0) {
    empty.innerHTML = `
      <div style="text-align:center;padding:46px 20px;color:var(--text-muted)">
        <div style="font-size:2.4rem;margin-bottom:10px">🔎</div>
        <div style="font-size:.95rem;font-weight:700;margin-bottom:8px">${isEn?'No matching students':'لا توجد نتائج مطابقة'}</div>
        <button class="btn btn-green btn-sm" onclick="clearStudentFilters()">↺ ${isEn?'Clear filters':'مسح الفلاتر'}</button>
      </div>`;
  } else {
    empty.innerHTML = '';
  }
};

window.filterStudents = function() { window.renderStudentsGrid(); };

window.clearStudentFilters = function() {
  const search = document.getElementById('studentSearch');
  const circle = document.getElementById('studentCircleFilter');
  const level = document.getElementById('studentLevelFilter');
  if (search) search.value = '';
  if (circle) circle.value = '';
  if (level) level.value = '';
  window.renderStudentsGrid();
};

// ---- CIRCLES PAGE ----
pages['circles'] = function(el) { renderCirclesPage(el); };

function renderCirclesPage(el) {
  const teachers = DB.users.filter(u => u.role === 'teacher');
  el.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:10px">
      <div>
        <div style="font-size:.85rem;color:var(--text-muted)">${DB.circles.length} ${currentLang==='en'?'active circles':'حلقة نشطة'} · ${DB.students.length} ${currentLang==='en'?'total students':'طالب إجمالاً'}</div>
      </div>
      <button class="btn btn-solid" onclick="openAddCircleModal()">🕌 ${t('addCircle')}</button>
    </div>
    <div class="grid-2" id="circlesGrid">
      ${DB.circles.map(c => renderCircleCard(c)).join('')}
    </div>
    ${DB.circles.length === 0 ? `
      <div style="text-align:center;padding:60px 20px;color:var(--text-muted)">
        <div style="font-size:3rem;margin-bottom:12px">🕌</div>
        <div style="font-size:1rem;font-weight:600;margin-bottom:6px">${t('noCircles')}</div>
        <div style="font-size:.85rem;margin-bottom:16px">${t('addFirst')}</div>
        <button class="btn btn-solid" onclick="openAddCircleModal()">${t('addCircle')}</button>
      </div>` : ''}
  `;
}

function renderCircleCard(c) {
  const teacher  = DB.users.find(u => u.id === c.teacher);
  const students = DB.students.filter(s => c.students.includes(s.id));
  const avgPct   = students.length ? Math.round(students.reduce((a,s)=>a+s.pages,0)/(students.length*604)*100) : 0;
  const avgAtt   = students.length ? Math.round(students.reduce((a,s)=>a+s.attendance,0)/students.length) : 0;
  const safeCircleName = escapeHtml(c.name);
  const safeTime = escapeHtml(c.time);
  const safeDays = escapeHtml(c.days);
  const safeRoom = escapeHtml(c.room || '—');
  const safeTeacherName = escapeHtml(teacher?.name || (currentLang==='en'?'Unassigned':'غير محدد'));
  return `
    <div class="card" id="circle-card-${c.id}">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
        <div style="width:46px;height:46px;border-radius:12px;background:var(--emerald-glow);border:1px solid var(--border);
             display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0">🕌</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:1.05rem;font-weight:700">${safeCircleName}</div>
          <div style="font-size:.74rem;color:var(--text-muted);margin-top:1px">🕐 ${safeTime} · 📅 ${safeDays}</div>
        </div>
        <span class="badge green">${students.length} ${t('students')}</span>
      </div>
      <div class="plan-row" style="margin-bottom:6px">
        <span class="plan-icon">👤</span>
        <div class="plan-text"><span style="color:var(--text-muted)">${currentLang==='en'?'Teacher:':'المعلم:'}</span> <strong>${safeTeacherName}</strong></div>
      </div>
      <div class="plan-row" style="margin-bottom:6px">
        <span class="plan-icon">🕌</span>
        <div class="plan-text"><span style="color:var(--text-muted)">${currentLang==='en'?'Location:':'المسجد:'}</span> <strong>${safeRoom}</strong></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0">
        <div style="background:var(--surface2);border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:1.1rem;font-weight:800;color:var(--emerald-light)">${avgPct}%</div>
          <div style="font-size:.62rem;color:var(--text-muted)">${currentLang==='en'?'Avg Progress':'متوسط التقدم'}</div>
        </div>
        <div style="background:var(--surface2);border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:1.1rem;font-weight:800;color:${avgAtt>=90?'var(--emerald-light)':avgAtt>=75?'var(--gold-light)':'var(--red)'}">${avgAtt}%</div>
          <div style="font-size:.62rem;color:var(--text-muted)">${currentLang==='en'?'Avg Attendance':'متوسط الحضور'}</div>
        </div>
      </div>
      <div style="margin-bottom:10px">
        <div style="font-size:.72rem;color:var(--text-muted);margin-bottom:4px">${currentLang==='en'?'Avg Memorization Progress':'متوسط تقدم الحفظ'}</div>
        ${pctBar(avgPct, 100)}
      </div>
      <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:12px;min-height:24px">
        ${students.length > 0
          ? students.map(s=>`<span style="font-size:.72rem;padding:3px 9px;background:var(--surface2);border-radius:20px;border:1px solid var(--border)">${escapeHtml(s.name)}</span>`).join('')
          : `<span style="font-size:.75rem;color:var(--text-dim)">${t('noStudents')}</span>`}
      </div>
      <div style="display:flex;gap:7px;flex-wrap:wrap">
        <button class="btn btn-green btn-sm" onclick="openCircleModal(${c.id})">👁 ${t('view')}</button>
        <button class="btn btn-gold btn-sm" onclick="openEditCircleModal(${c.id})">✏️ ${t('edit')}</button>
        <button class="btn btn-red btn-sm" onclick="deleteCircle(${c.id})">🗑 ${t('delete')}</button>
      </div>
    </div>`;
}


// ---- TEACHERS PAGE ----
pages['teachers'] = function(el) {
  const teachers = DB.users.filter(u => u.role === 'teacher');
  el.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:10px">
      <div style="font-size:.85rem;color:var(--text-muted)">${teachers.length} ${currentLang==='en'?'teacher(s) registered':'معلم مسجل في النظام'}</div>
      <button class="btn btn-solid" onclick="openAddTeacherModal()">👨‍🏫 ${t('addTeacher')}</button>
    </div>
    ${teachers.length === 0 ? `
      <div style="text-align:center;padding:60px 20px;color:var(--text-muted)">
        <div style="font-size:3rem;margin-bottom:12px">👨‍🏫</div>
        <div style="font-size:1rem;font-weight:600;margin-bottom:6px">${t('noTeachers')}</div>
        <button class="btn btn-solid" onclick="openAddTeacherModal()">${t('addTeacher')}</button>
      </div>` : ''}
    <div class="grid-2" id="teachersGrid">
      ${teachers.map(tc => renderTeacherCard(tc)).join('')}
    </div>
  `;
};

function renderTeacherCard(tc) {
  const circle   = DB.circles.find(c => c.teacher === tc.id);
  const students = circle ? DB.students.filter(s => circle.students.includes(s.id)) : [];
  const avgAtt   = students.length ? Math.round(students.reduce((a,s)=>a+s.attendance,0)/students.length) : 0;
  const avgPct   = students.length ? Math.round(students.reduce((a,s)=>a+s.pages,0)/(students.length*604)*100) : 0;
  const weakCount = students.filter(s=>s.weak).length;
  const isActive  = tc.status==='active'||!tc.status;
  const locale    = currentLang==='en'?'en-US':'ar-SA';
  const safeName = escapeHtml(tc.name);
  const safeInitial = escapeHtml((tc.name || '?').charAt(0));
  const safeSpec = escapeHtml(tc.specialization || (currentLang==='en'?'Memorization & Review':'حفظ ومراجعة'));
  const safeExperience = escapeHtml(tc.experience || '—');
  const safeCircle = circle ? escapeHtml(circle.name) : `<span style="color:var(--text-dim)">${currentLang==='en'?'Unassigned':'غير مسند'}</span>`;
  const safeEmail = escapeHtml(tc.email || '—');
  const safePhone = escapeHtml(tc.phone || (currentLang==='en'?'Not registered':'غير مسجل'));
  const safeBio = escapeHtml(tc.bio || '');

  return `
    <div class="card" style="position:relative;overflow:hidden">
      <div style="position:absolute;left:-24px;top:-24px;width:100px;height:100px;border-radius:50%;
           background:${tc.color||'#6e3f28'}12;pointer-events:none"></div>
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;position:relative">
        <div style="width:52px;height:52px;border-radius:50%;
             background:${tc.color||'#6e3f28'}22;color:${tc.color||'#6e3f28'};
             border:2px solid ${tc.color||'#6e3f28'}44;
             display:flex;align-items:center;justify-content:center;
             font-size:1.3rem;font-weight:800;flex-shrink:0">${safeInitial}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:1rem;font-weight:800">${safeName}</div>
          <div style="font-size:.72rem;color:var(--text-muted);margin-top:2px">
            ${safeSpec} · ${safeExperience} ${currentLang==='en'?'yrs exp':'سنوات خبرة'}
          </div>
        </div>
        <span class="badge ${isActive?'green':'red'}" style="flex-shrink:0">
          ${isActive ? ('● '+t('active')) : ('● '+t('inactive'))}
        </span>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:14px">
        <div class="plan-row" style="margin:0">
          <span class="plan-icon">🕌</span>
          <div class="plan-text">
            <span style="color:var(--text-muted)">${currentLang==='en'?'Halaqa:':'الحلقة:'}</span>
            <strong>${safeCircle}</strong>
          </div>
          ${circle?`<span class="badge green">${students.length} ${t('students')}</span>`:''}
        </div>
        <div class="plan-row" style="margin:0">
          <span class="plan-icon">📧</span>
          <div class="plan-text" style="font-size:.8rem;color:var(--text-muted)">${safeEmail}</div>
        </div>
        <div class="plan-row" style="margin:0">
          <span class="plan-icon">📞</span>
          <div class="plan-text" style="font-size:.8rem;color:var(--text-muted)">${safePhone}</div>
        </div>
        <div class="plan-row" style="margin:0">
          <span class="plan-icon">📅</span>
          <div class="plan-text" style="font-size:.8rem;color:var(--text-muted)">
            ${currentLang==='en'?'Joined:':'تاريخ الانضمام:'} ${tc.joinDate?new Date(tc.joinDate).toLocaleDateString(locale):(currentLang==='en'?'Unknown':'غير مسجل')}
          </div>
        </div>
      </div>
      ${circle ? `
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px">
          <div style="background:var(--surface2);border-radius:8px;padding:8px;text-align:center">
            <div style="font-size:1.1rem;font-weight:800;color:var(--emerald-light)">${students.length}</div>
            <div style="font-size:.62rem;color:var(--text-muted)">${t('students')}</div>
          </div>
          <div style="background:var(--surface2);border-radius:8px;padding:8px;text-align:center">
            <div style="font-size:1.1rem;font-weight:800;color:${avgAtt>=90?'var(--emerald-light)':avgAtt>=75?'var(--gold-light)':'var(--red)'}">${avgAtt}%</div>
            <div style="font-size:.62rem;color:var(--text-muted)">${currentLang==='en'?'Avg Att.':'متوسط الحضور'}</div>
          </div>
          <div style="background:var(--surface2);border-radius:8px;padding:8px;text-align:center">
            <div style="font-size:1.1rem;font-weight:800;color:var(--gold-light)">${avgPct}%</div>
            <div style="font-size:.62rem;color:var(--text-muted)">${currentLang==='en'?'Avg Progress':'متوسط التقدم'}</div>
          </div>
        </div>
        ${weakCount>0?`
          <div style="background:var(--red-bg);border:1px solid rgba(224,85,85,.25);border-radius:8px;
               padding:8px 12px;font-size:.78rem;color:var(--red);margin-bottom:12px">
            ⚠️ ${weakCount} ${currentLang==='en'?'student(s) need intensive follow-up':'طالب يحتاج متابعة مكثفة في هذه الحلقة'}
          </div>`:''}
      ` : `
        <div style="background:var(--surface2);border-radius:8px;padding:10px;text-align:center;
             font-size:.8rem;color:var(--text-dim);margin-bottom:14px">
          ${currentLang==='en'?'No Halaqa assigned to this teacher yet':'لم يتم إسناد حلقة لهذا المعلم بعد'}
        </div>`}
      ${tc.bio?`
        <div style="font-size:.78rem;color:var(--text-muted);line-height:1.7;
             background:var(--surface2);border-radius:8px;padding:10px;margin-bottom:12px;
             border-right:3px solid ${tc.color||'var(--emerald-mid)'}">
          ${safeBio}
        </div>`:''}
      <div style="display:flex;gap:7px;flex-wrap:wrap">
        <button class="btn btn-green btn-sm" onclick="openTeacherProfileModal(${tc.id})">📋 ${currentLang==='en'?'Full Profile':'الملف الكامل'}</button>
        <button class="btn btn-gold btn-sm" onclick="openEditTeacherModal(${tc.id})">✏️ ${t('edit')}</button>
        ${circle?`<button class="btn btn-green btn-sm" onclick="openCircleModal(${circle.id})">👥 ${currentLang==='en'?'Students':'طلاب الحلقة'}</button>`:''}
        <button class="btn btn-red btn-sm" onclick="deleteTeacher(${tc.id})">🗑</button>
      </div>
    </div>
  `;
}

// ---- TEACHER PROFILE MODAL ----
window.openTeacherProfileModal = function(id) {
  const t        = DB.users.find(u=>u.id===id);
  if (!t) return;
  const circle   = DB.circles.find(c=>c.teacher===id);
  const students = circle ? DB.students.filter(s=>circle.students.includes(s.id)) : [];
  const totalSessions = students.reduce((a,s)=>(a + (s.sessions||[]).length), 0);
  const avgAtt   = students.length ? Math.round(students.reduce((a,s)=>a+s.attendance,0)/students.length) : 0;
  const avgPct   = students.length ? Math.round(students.reduce((a,s)=>a+s.pages,0)/(students.length*604)*100) : 0;
  const safeName = escapeHtml(t.name);
  const safeInitial = escapeHtml((t.name || '?').charAt(0));
  const safeEmail = escapeHtml(t.email || '—');
  const safePhone = escapeHtml(t.phone || 'غير مسجل');
  const safeSpecialization = escapeHtml(t.specialization || 'حفظ ومراجعة');
  const safeExperience = escapeHtml(t.experience || '—');
  const safeBio = escapeHtml(t.bio || '');
  const safeCvName = escapeHtml(t.cvName || 'CV مرفق');
  const safeCircleName = escapeHtml(circle?.name || '');
  const safeCircleTime = escapeHtml(circle?.time || '');
  const safeCircleDays = escapeHtml(circle?.days || '');
  const safeCircleRoom = escapeHtml(circle?.room || '—');

  openModal('👨‍🏫 الملف الكامل: ' + (t.name || ''), `
    <!-- Profile banner -->
    <div style="background:linear-gradient(135deg,var(--emerald),var(--emerald-mid));border-radius:12px;
         padding:20px;margin-bottom:18px;position:relative;overflow:hidden">
      <div style="position:absolute;left:-20px;top:-20px;width:90px;height:90px;border-radius:50%;background:rgba(255,255,255,.07)"></div>
      <div style="display:flex;align-items:center;gap:14px;position:relative">
        <div style="width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,.2);
             display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:800">${safeInitial}</div>
        <div>
          <div style="font-size:1.1rem;font-weight:800">${safeName}</div>
          <div style="font-size:.78rem;opacity:.9;margin-top:2px">${safeSpecialization}</div>
          <div style="margin-top:5px">
            <span class="badge" style="background:rgba(255,255,255,.2);color:#fff;font-size:.7rem">
              ${safeExperience} سنوات خبرة
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Contact info -->
    <div style="background:var(--surface2);border-radius:10px;padding:14px;margin-bottom:14px">
      <div style="font-size:.82rem;font-weight:700;color:var(--gold-light);margin-bottom:10px">📇 بيانات التواصل</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:.8rem">
        <div><span style="color:var(--text-muted)">البريد:</span> <span style="color:var(--text)">${safeEmail}</span></div>
        <div><span style="color:var(--text-muted)">الجوال:</span> <span style="color:var(--text)">${safePhone}</span></div>
        <div><span style="color:var(--text-muted)">الانضمام:</span> <span style="color:var(--text)">${t.joinDate?new Date(t.joinDate).toLocaleDateString('ar-SA'):'—'}</span></div>
        <div><span style="color:var(--text-muted)">الحالة:</span> <span class="badge ${t.status==='active'||!t.status?'green':'red'}" style="font-size:.68rem">${t.status==='active'||!t.status?'نشط':'غير نشط'}</span></div>
      </div>
    </div>

    <!-- Performance stats -->
    <div style="font-size:.82rem;font-weight:700;color:var(--gold-light);margin-bottom:8px">📊 إحصائيات الأداء</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px">
      ${[
        [students.length,'طلاب','var(--emerald-light)'],
        [totalSessions,'جلسة مسجلة','var(--blue)'],
        [avgAtt+'%','متوسط الحضور', avgAtt>=90?'var(--emerald-light)':avgAtt>=75?'var(--gold-light)':'var(--red)'],
        [avgPct+'%','متوسط التقدم','var(--gold-light)'],
      ].map(([v,l,c])=>`
        <div style="background:var(--surface2);border-radius:8px;padding:10px;text-align:center">
          <div style="font-size:1.2rem;font-weight:900;color:${c}">${v}</div>
          <div style="font-size:.62rem;color:var(--text-muted)">${l}</div>
        </div>`).join('')}
    </div>

    <!-- Circle -->
    ${circle ? `
      <div style="background:var(--surface2);border-radius:10px;padding:12px;margin-bottom:14px">
        <div style="font-size:.82rem;font-weight:700;color:var(--gold-light);margin-bottom:8px">🕌 الحلقة المُسندة</div>
        <div style="font-size:.85rem;font-weight:700">${safeCircleName}</div>
        <div style="font-size:.75rem;color:var(--text-muted);margin-top:3px">🕐 ${safeCircleTime} · 📅 ${safeCircleDays} · 🕌 ${safeCircleRoom}</div>
        <div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:8px">
          ${students.map(s=>`<span style="font-size:.72rem;padding:3px 9px;background:var(--surface);border-radius:20px;border:1px solid var(--border)">${escapeHtml(s.name)}</span>`).join('')}
        </div>
      </div>` : `
      <div style="background:var(--surface2);border-radius:10px;padding:12px;text-align:center;
           font-size:.82rem;color:var(--text-dim);margin-bottom:14px">
        لم يتم إسناد حلقة لهذا المعلم بعد
      </div>`}

    <!-- Bio -->
    ${t.bio ? `
      <div style="background:var(--surface2);border-radius:10px;padding:12px;margin-bottom:14px;
           border-right:3px solid ${t.color||'var(--emerald-mid)'}">
        <div style="font-size:.82rem;font-weight:700;color:var(--gold-light);margin-bottom:6px">📝 نبذة تعريفية</div>
        <div style="font-size:.82rem;color:var(--text-muted);line-height:1.8">${safeBio}</div>
      </div>` : ''}

    <!-- CV Section -->
    <div style="background:var(--surface2);border-radius:10px;padding:14px;margin-bottom:14px;border:1px solid var(--border)">
      <div style="font-size:.85rem;font-weight:700;color:var(--gold-light);margin-bottom:10px">📄 السيرة الذاتية (CV)</div>
      ${t.cv ? `
        <div style="display:flex;align-items:center;gap:12px;padding:10px 12px;
             background:var(--surface);border-radius:9px;border:1px solid var(--border)">
          <div style="width:40px;height:40px;border-radius:10px;background:var(--gold-pale);
               display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0">
            ${t.cvType?.startsWith('image/') ? '🖼️' : t.cvType==='application/pdf' ? '📕' : '📄'}
          </div>
          <div style="flex:1;min-width:0">
            <div style="font-size:.85rem;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
              ${safeCvName}
            </div>
            <div style="font-size:.7rem;color:var(--text-muted);margin-top:2px">
              ${t.cvType==='application/pdf'?'ملف PDF':t.cvType?.startsWith('image/')?'صورة':'ملف Word / نصي'}
            </div>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            <button class="btn btn-green btn-sm" onclick="previewCV('existing',${t.id})">👁 عرض</button>
            <button class="btn btn-gold btn-sm" onclick="downloadCV(${t.id})">⬇️ تحميل</button>
            <button class="btn btn-red btn-sm" onclick="removeCVFromTeacher(${t.id})">🗑 حذف</button>
          </div>
        </div>` : `
        <div style="text-align:center;padding:14px;color:var(--text-dim);font-size:.82rem">
          <div style="font-size:1.5rem;margin-bottom:6px">📭</div>
          لم يُرفع CV لهذا المعلم بعد
          <div style="margin-top:8px">
            <button class="btn btn-gold btn-sm" onclick="closeModalDirect();openEditTeacherModal(${t.id})">
              📎 رفع CV الآن
            </button>
          </div>
        </div>`}
    </div>

    <!-- Actions -->
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn btn-solid btn-sm" onclick="closeModalDirect();openEditTeacherModal(${t.id})">✏️ تعديل البيانات</button>
      ${circle ? `<button class="btn btn-green btn-sm" onclick="closeModalDirect();openCircleModal(${circle.id})">👥 عرض طلاب الحلقة</button>` : ''}
      <button class="btn btn-gold btn-sm" onclick="showToast('📤 تم إرسال إشعار للمعلم')">📤 إرسال إشعار</button>
    </div>
  `);
};

// ---- ADD TEACHER MODAL ----
window.openAddTeacherModal = function() {
  window._newTeacherCV = null;
  const isEn = currentLang==='en';
  const specs = isEn
    ? ['Tajweed & Memorization','Memorization & Review','Recitation & Tarteel','Readings & Narrations','Children Teaching']
    : ['تجويد وحفظ','حفظ ومراجعة','تلاوة وترتيل','الروايات والقراءات','تعليم الأطفال'];
  openModal('👨‍🏫 '+(isEn?'Add New Teacher':'إضافة معلم جديد'), `

    <!-- بيانات الدخول -->
    <div style="background:var(--emerald-glow);border:1px solid var(--emerald-mid);
         border-radius:10px;padding:14px;margin-bottom:16px">
      <div style="font-size:.82rem;font-weight:700;color:var(--emerald-light);margin-bottom:10px">
        🔐 ${isEn?'Login Credentials (Teacher will use these to sign in)':'بيانات الدخول (سيستخدمها المعلم لتسجيل الدخول)'}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div class="field" style="margin:0">
          <label style="font-size:.78rem">${isEn?'Email *':'البريد الإلكتروني *'}</label>
          <input id="tEmail" type="email" placeholder="teacher@example.com"
            onfocus="this.style.borderColor='var(--emerald-mid)'" onblur="this.style.borderColor=''">
        </div>
        <div class="field" style="margin:0;position:relative">
          <label style="font-size:.78rem">${isEn?'Password *':'كلمة المرور *'}</label>
          <input id="tPass" type="text" placeholder="${isEn?'Set a password':'ضع كلمة مرور'}" value="1234"
            onfocus="this.style.borderColor='var(--emerald-mid)'" onblur="this.style.borderColor=''">
        </div>
      </div>
    </div>

    <!-- البيانات الشخصية -->
    <div style="font-size:.8rem;font-weight:700;color:var(--text-muted);margin-bottom:8px">
      👤 ${isEn?'Personal Information':'البيانات الشخصية'}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div class="field" style="grid-column:1/-1"><label>${isEn?'Full Name *':'الاسم الكامل *'}</label>
        <input id="tName" placeholder="${isEn?'Full teacher name':'اسم المعلم كاملاً'}">
      </div>
      <div class="field"><label>${isEn?'Phone':'رقم الجوال'}</label>
        <input id="tPhone" placeholder="05xxxxxxxx">
      </div>
      <div class="field"><label>${t('specialization')}</label>
        <select id="tSpec">${specs.map(s=>`<option>${s}</option>`).join('')}</select>
      </div>
      <div class="field"><label>${isEn?'Years of Experience':'سنوات الخبرة'}</label>
        <input id="tExp" type="number" placeholder="0" min="0" max="50">
      </div>
      <div class="field"><label>${t('joinDate')}</label>
        <input id="tJoin" type="date" value="${new Date().toISOString().split('T')[0]}">
      </div>
      <div class="field" style="grid-column:1/-1"><label>${isEn?'Bio':'نبذة تعريفية'}</label>
        <input id="tBio" placeholder="${isEn?'Brief teacher bio...':'معلومات مختصرة عن المعلم...'}">
      </div>
    </div>
    <div style="display:flex;gap:10px;margin-top:14px">
      <button class="btn btn-solid" style="flex:1" onclick="saveNewTeacher()">✅ ${isEn?'Add Teacher & Create Account':'إضافة المعلم وفتح الحساب'}</button>
      <button class="btn btn-red btn-sm" onclick="closeModalDirect()">${t('cancel')}</button>
    </div>
  `);
};

window.saveNewTeacher = function() {
  const isEn = currentLang==='en';
  const name  = (document.getElementById('tName')?.value||'').trim();
  const email = (document.getElementById('tEmail')?.value||'').trim().toLowerCase();
  const pass  = (document.getElementById('tPass')?.value||'').trim();

  if (!name)  { showToast('⚠️ '+(isEn?'Please enter teacher name':'يرجى كتابة اسم المعلم')); return; }
  if (!email) { showToast('⚠️ '+(isEn?'Please enter email':'يرجى إدخال البريد الإلكتروني')); return; }
  if (!pass)  { showToast('⚠️ '+(isEn?'Please set a password':'يرجى تعيين كلمة مرور')); return; }
  if (DB.users.find(u=>u.email.toLowerCase()===email)) {
    showToast('⚠️ '+(isEn?'Email already in use':'البريد الإلكتروني مستخدم مسبقاً')); return;
  }

  const newId  = DB.users.length > 0 ? Math.max(...DB.users.map(u=>u.id)) + 1 : 1;
  hashPassword(pass).then(function(hashedPass) {
    const colors = ['#3d6975','#92512c','#6e3f28','#a7352a','#836128','#536f5a','#b79758'];
    DB.users.push({
      id: newId, role: 'teacher', name, email, pass: hashedPass,
      color: colors[newId % colors.length],
      phone: (document.getElementById('tPhone')?.value||'').trim(),
      specialization: document.getElementById('tSpec')?.value || (isEn?'Memorization & Review':'حفظ ومراجعة'),
      experience: parseInt(document.getElementById('tExp')?.value)||0,
      joinDate: document.getElementById('tJoin')?.value || new Date().toISOString().split('T')[0],
      status: 'active',
      bio: (document.getElementById('tBio')?.value||'').trim(),
    });
    saveDB();
    closeModalDirect();
    showToast('✅ '+(isEn?'Teacher account created: ':'تم إنشاء حساب المعلم: ')+name);
    navigateTo('teachers');
  });
};

// ---- EDIT TEACHER MODAL ----
window.openEditTeacherModal = function(id) {
  const t = DB.users.find(u=>u.id===id);
  if (!t) return;
  openModal('✏️ تعديل: ' + t.name, `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div class="field" style="grid-column:1/-1"><label>الاسم الكامل *</label>
        <input id="etName" value="${t.name}">
      </div>
      <div class="field"><label>البريد الإلكتروني</label>
        <input id="etEmail" type="email" value="${t.email||''}">
      </div>
      <div class="field"><label>رقم الجوال</label>
        <input id="etPhone" value="${t.phone||''}">
      </div>
      <div class="field"><label>التخصص</label>
        <select id="etSpec">
          ${['تجويد وحفظ','حفظ ومراجعة','تلاوة وترتيل','الروايات والقراءات','تعليم الأطفال'].map(s=>`<option ${s===t.specialization?'selected':''}>${s}</option>`).join('')}
        </select>
      </div>
      <div class="field"><label>سنوات الخبرة</label>
        <input id="etExp" type="number" value="${t.experience||0}" min="0" max="50">
      </div>
      <div class="field"><label>تاريخ الانضمام</label>
        <input id="etJoin" type="date" value="${t.joinDate||''}">
      </div>
      <div class="field"><label>الحالة</label>
        <select id="etStatus">
          <option value="active" ${t.status==='active'||!t.status?'selected':''}>نشط</option>
          <option value="inactive" ${t.status==='inactive'?'selected':''}>غير نشط</option>
        </select>
      </div>
      <div class="field" style="grid-column:1/-1"><label>نبذة تعريفية</label>
        <input id="etBio" value="${t.bio||''}">
      </div>
    </div>
    <!-- CV Section in Edit Modal -->
    <div style="margin-top:14px;margin-bottom:4px">
      <div style="font-size:.82rem;font-weight:700;color:var(--gold-light);margin-bottom:8px">
        📄 السيرة الذاتية (CV)
      </div>
      ${t.cv ? `
        <div style="background:var(--emerald-glow);border:1px solid var(--border);border-radius:10px;
             padding:10px 14px;display:flex;align-items:center;gap:10px;margin-bottom:8px">
          <div style="font-size:1.2rem">📄</div>
          <div style="flex:1">
            <div style="font-size:.82rem;font-weight:700;color:var(--emerald-light)">${t.cvName||'CV مرفق'}</div>
            <div style="font-size:.7rem;color:var(--text-muted)">تم الرفع مسبقاً</div>
          </div>
          <button class="btn btn-green btn-sm" onclick="previewCV('existing',${id})">👁 معاينة</button>
          <button class="btn btn-red btn-sm" onclick="removeCVFromTeacher(${id})">🗑</button>
        </div>
        <div style="font-size:.75rem;color:var(--text-muted);margin-bottom:6px">رفع CV جديد سيستبدل الحالي:</div>
      ` : ''}
      <div class="cv-upload-wrap" onclick="document.getElementById('etCvInput').click()">
        <input type="file" id="etCvInput" accept=".pdf,.doc,.docx,.txt,image/*"
               style="display:none" onchange="handleEditCvUpload(this,${id})">
        <div class="cv-icon">📎</div>
        <div class="cv-info">
          <div class="cv-name" id="etCvStatus">${t.cv ? 'رفع CV جديد...' : 'اضغط لرفع الـ CV'}</div>
          <div class="cv-hint">PDF · Word · صورة — الحد الأقصى 5 ميغابايت</div>
        </div>
      </div>
    </div>

    <div style="display:flex;gap:10px;margin-top:10px">
      <button class="btn btn-solid" style="flex:1" onclick="saveEditTeacher(${id})">💾 حفظ التعديلات</button>
      <button class="btn btn-red btn-sm" onclick="closeModalDirect()">إلغاء</button>
    </div>
  `);
};

window.handleEditCvUpload = function(input, teacherId) {
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  if (file.size > 5 * 1024 * 1024) { showToast('⚠️ الحد الأقصى 5 ميغابايت'); return; }
  const reader = new FileReader();
  reader.onload = function(e) {
    const t = DB.users.find(u => u.id === teacherId);
    if (t) { t.cv = e.target.result; t.cvName = file.name; t.cvType = file.type; }
    const statusEl = document.getElementById('etCvStatus');
    if (statusEl) { statusEl.textContent = '✅ ' + file.name; statusEl.style.color = 'var(--emerald-light)'; }
    showToast('📄 تم رفع الـ CV: ' + file.name);
  };
  reader.readAsDataURL(file);
};

window.saveEditTeacher = function(id) {
  const t = DB.users.find(u=>u.id===id);
  if (!t) return;
  const name = (document.getElementById('etName')?.value||'').trim();
  if (!name) { showToast('⚠️ الاسم لا يمكن أن يكون فارغاً'); return; }
  t.name           = name;
  t.email          = (document.getElementById('etEmail')?.value||'').trim() || t.email;
  t.phone          = (document.getElementById('etPhone')?.value||'').trim();
  t.specialization = document.getElementById('etSpec')?.value || t.specialization;
  t.experience     = parseInt(document.getElementById('etExp')?.value)||t.experience||0;
  t.joinDate       = document.getElementById('etJoin')?.value || t.joinDate;
  t.status         = document.getElementById('etStatus')?.value || 'active';
  t.bio            = (document.getElementById('etBio')?.value||'').trim();
  saveDB();
  closeModalDirect();
  showToast('✅ تم تحديث بيانات ' + t.name);
  navigateTo('teachers');
};


// ==============================
// CV UPLOAD & PREVIEW
// ==============================
window.handleCvUpload = function(input, statusId, previewBtnId) {
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  if (file.size > 5 * 1024 * 1024) {
    showToast('⚠️ حجم الملف كبير — الحد الأقصى 5 ميغابايت');
    input.value = ''; return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    window._newTeacherCV     = e.target.result;
    window._newTeacherCVName = file.name;
    window._newTeacherCVType = file.type;
    const statusEl = document.getElementById(statusId);
    const btnEl    = document.getElementById(previewBtnId);
    if (statusEl) { statusEl.textContent = '✅ ' + file.name; statusEl.style.color = 'var(--emerald-light)'; }
    if (btnEl) btnEl.style.display = 'block';
    showToast('📄 تم رفع الـ CV: ' + file.name);
  };
  reader.readAsDataURL(file);
};

window.previewCV = function(source, teacherId) {
  let cvData, cvName, cvType;
  if (source === 'new') {
    cvData = window._newTeacherCV;
    cvName = window._newTeacherCVName;
    cvType = window._newTeacherCVType;
  } else {
    const t = DB.users.find(u => u.id === parseInt(teacherId));
    cvData = t?.cv; cvName = t?.cvName; cvType = t?.cvType;
  }
  if (!cvData) { showToast('⚠️ لا يوجد CV مرفق'); return; }
  const win = window.open('', '_blank', 'width=900,height=700');
  if (cvType && cvType.startsWith('image/')) {
    win.document.write(`<!DOCTYPE html><html dir="rtl"><head><title>${cvName||'CV'}</title>
      <style>body{margin:0;background:#111;display:flex;align-items:center;justify-content:center;min-height:100vh}
      img{max-width:100%;max-height:100vh;object-fit:contain}</style></head>
      <body><img src="${cvData}" alt="CV"><div id="sidebarOverlay" onclick="closeSidebar()" ontouchstart="closeSidebar()" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.5);z-index:9999;cursor:pointer;-webkit-tap-highlight-color:transparent;"></div>
</body></html>`);
    win.document.close();
  } else if (cvType === 'application/pdf') {
    win.document.write(`<!DOCTYPE html><html dir="rtl"><head><title>${cvName||'CV'}</title>
      <style>body,html{margin:0;padding:0;height:100%}iframe{width:100%;height:100%;border:none}</style></head>
      <body><iframe src="${cvData}"></iframe><div id="sidebarOverlay" onclick="closeSidebar()" ontouchstart="closeSidebar()" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.5);z-index:9999;cursor:pointer;-webkit-tap-highlight-color:transparent;"></div>
</body></html>`);
    win.document.close();
  } else {
    const a = win.document.createElement('a');
    a.href = cvData; a.download = cvName || 'cv';
    win.document.body.appendChild(a); a.click(); win.close();
    showToast('📥 جاري تحميل الـ CV...');
  }
};

window.downloadCV = function(id) {
  const t = DB.users.find(u => u.id === id);
  if (!t?.cv) { showToast('⚠️ لا يوجد CV'); return; }
  const a = document.createElement('a');
  a.href = t.cv; a.download = t.cvName || 'CV';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  showToast('📥 جاري تحميل: ' + (t.cvName||'CV'));
};

window.removeCVFromTeacher = function(id) {
  const t = DB.users.find(u => u.id === id);
  if (!t) return;
  t.cv = null; t.cvName = null; t.cvType = null;
  saveDB();
  showToast('🗑 تم حذف الـ CV');
  openTeacherProfileModal(id);
};

// ---- DELETE TEACHER ----
window.deleteTeacher = function(id) {
  const t = DB.users.find(u=>u.id===id);
  if (!t) return;
  const circle = DB.circles.find(c=>c.teacher===id);
  if (circle) { showToast('⚠️ لا يمكن حذف المعلم — مسؤول عن ' + circle.name); return; }
  openModal('🗑 تأكيد الحذف', `
    <div style="text-align:center;padding:10px 0">
      <div style="font-size:2.5rem;margin-bottom:12px">⚠️</div>
      <div style="font-size:1rem;font-weight:700;margin-bottom:8px">هل تريد حذف "${t.name}"؟</div>
      <div style="font-size:.85rem;color:var(--text-muted);margin-bottom:20px">هذا الإجراء لا يمكن التراجع عنه</div>
      <div style="display:flex;gap:10px;justify-content:center">
        <button class="btn btn-red" onclick="confirmDeleteTeacher(${id})">🗑 نعم، احذف</button>
        <button class="btn btn-green" onclick="closeModalDirect()">إلغاء</button>
      </div>
    </div>
  `);
};

window.confirmDeleteTeacher = function(id) {
  const idx = DB.users.findIndex(u=>u.id===id);
  if (idx===-1) return;
  const name = DB.users[idx].name;
  DB.users.splice(idx,1);
  saveDB();
  closeModalDirect();
  showToast('🗑 تم حذف ' + name);
  navigateTo('teachers');
};

// ---- ADD CIRCLE MODAL ----
window.openAddCircleModal = function() {
  const teachers = DB.users.filter(u => u.role === 'teacher');
  const isEn = currentLang==='en';
  const timeOpts = isEn
    ? ['After Fajr','After Dhuhr','After Asr','After Maghrib','After Isha']
    : ['بعد الفجر','بعد الظهر','بعد العصر','بعد المغرب','بعد العشاء'];
  openModal('🕌 '+(isEn?'Add New Halaqa':'إضافة حلقة جديدة'), `
    <div class="field"><label>${isEn?'Circle Name *':'اسم الحلقة *'}</label>
      <input id="cName" placeholder="${isEn?'e.g. Halaqa 3':'مثال: الحلقة الثالثة'}">
    </div>
    <div class="field">
      <label>${isEn?'Responsible Teacher *':'المعلم المسؤول *'}</label>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <select id="cTeacherSelect" style="flex:1;min-width:140px;background:var(--surface2);border:1px solid var(--border);
          border-radius:8px;padding:10px 14px;color:var(--text);font-family:'Tajawal',sans-serif;font-size:.95rem;outline:none"
          onchange="onTeacherSelectChange(this)">
          <option value="">— ${isEn?'Choose existing teacher':'اختر معلماً موجوداً'} —</option>
          ${teachers.map(tc=>`<option value="${tc.id}">${tc.name}</option>`).join('')}
          <option value="__new__">✏️ ${isEn?'Enter new teacher name...':'كتابة اسم معلم جديد...'}</option>
        </select>
      </div>
      <div id="newTeacherWrap" style="display:none;margin-top:8px">
        <div style="font-size:.75rem;color:var(--gold-light);margin-bottom:5px">✏️ ${isEn?'A new teacher account will be created automatically':'سيتم إنشاء حساب معلم جديد تلقائياً'}</div>
        <input id="cNewTeacherName" placeholder="${isEn?'Full teacher name *':'اسم المعلم الجديد كاملاً *'}"
          style="width:100%;background:var(--surface2);border:1px solid var(--border-gold);border-radius:8px;
          padding:10px 14px;color:var(--text);font-family:'Tajawal',sans-serif;font-size:.95rem;outline:none;margin-bottom:6px">
        <input id="cNewTeacherEmail" placeholder="${isEn?'Email (optional)':'البريد الإلكتروني (اختياري)'}"
          style="width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:8px;
          padding:10px 14px;color:var(--text);font-family:'Tajawal',sans-serif;font-size:.95rem;outline:none">
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div class="field"><label>${t('time')}</label>
        <select id="cTime">
          ${timeOpts.map((o,i)=>`<option${i===3?' selected':''}>${o}</option>`).join('')}
        </select>
      </div>
      <div class="field"><label>${t('room')}</label>
        <input id="cRoom" placeholder="${isEn?'e.g. Al-Rahma Mosque':'مثال: مسجد الرحمة'}">
      </div>
    </div>
    <div class="field"><label>${t('days')}</label>
      <input id="cDays" placeholder="${isEn?'e.g. Mon, Wed, Fri':'مثال: الاثنين والأربعاء والجمعة'}">
    </div>
    <div style="display:flex;gap:10px;margin-top:4px">
      <button class="btn btn-solid" style="flex:1" onclick="saveNewCircle()">✅ ${isEn?'Add Circle':'إضافة الحلقة'}</button>
      <button class="btn btn-red btn-sm" onclick="closeModalDirect()">${t('cancel')}</button>
    </div>
  `);
};

window.onTeacherSelectChange = function(sel) {
  const wrap = document.getElementById('newTeacherWrap');
  if (sel.value === '__new__') {
    wrap.style.display = 'block';
    document.getElementById('cNewTeacherName')?.focus();
  } else {
    wrap.style.display = 'none';
  }
};

window.saveNewCircle = function() {
  const isEn = currentLang==='en';
  const name  = (document.getElementById('cName')?.value||'').trim();
  const time  = document.getElementById('cTime')?.value || (isEn?'After Maghrib':'بعد المغرب');
  const room  = (document.getElementById('cRoom')?.value||'').trim() || (isEn?'Unspecified':'غير محدد');
  const days  = (document.getElementById('cDays')?.value||'').trim() || (isEn?'Unspecified':'غير محدد');
  const sel   = document.getElementById('cTeacherSelect')?.value || '';

  if (!name) { showToast('⚠️ '+(isEn?'Please enter Halaqa name':'يرجى كتابة اسم الحلقة')); return; }
  if (DB.circles.find(c => c.name === name)) { showToast('⚠️ '+(isEn?'A circle with this name already exists':'يوجد حلقة بهذا الاسم مسبقاً')); return; }

  let teacherId;
  function finishCreateCircle() {
    const newId = DB.circles.length > 0 ? Math.max(...DB.circles.map(c=>c.id)) + 1 : 1;
    DB.circles.push({ id:newId, name, teacher:teacherId, time, days, room, students:[] });
    saveDB();
    closeModalDirect();
    showToast('✅ '+(isEn?'Halaqa added: ':'تم إضافة ')+name);
    navigateTo('circles');
  }

  if (sel === '__new__') {
    const newName  = (document.getElementById('cNewTeacherName')?.value||'').trim();
    const newEmail = (document.getElementById('cNewTeacherEmail')?.value||'').trim();
    if (!newName) { showToast('⚠️ '+(isEn?'Please enter teacher name':'يرجى كتابة اسم المعلم الجديد')); return; }
    teacherId = DB.users.length > 0 ? Math.max(...DB.users.map(u=>u.id)) + 1 : 1;
    const colors = ['#6e3f28','#3d6975','#92512c','#536f5a','#a7352a','#836128'];
    hashPassword('1234').then(function(hashedPass) {
      DB.users.push({ id:teacherId, role:'teacher', name:newName, email:newEmail||'teacher'+teacherId+'@hifz.com', pass:hashedPass, color:colors[teacherId%colors.length], circle:name });
      showToast('👤 '+(isEn?'Teacher account created: ':'تم إنشاء حساب المعلم: ')+newName);
      finishCreateCircle();
    });
    return;
  } else {
    teacherId = parseInt(sel);
    if (!teacherId) { showToast('⚠️ '+(isEn?'Please choose or enter a teacher':'يرجى اختيار المعلم أو كتابة اسم جديد')); return; }
  }

  finishCreateCircle();
};

// ---- EDIT CIRCLE MODAL ----
window.openEditCircleModal = function(id) {
  const c = DB.circles.find(x=>x.id===id);
  if (!c) return;
  const teachers = DB.users.filter(u => u.role === 'teacher');
  openModal('✏️ تعديل: ' + c.name, `
    <div class="field"><label>اسم الحلقة *</label>
      <input id="eName" value="${c.name}">
    </div>
    <div class="field">
      <label>المعلم المسؤول</label>
      <select id="eTeacher" style="width:100%;background:var(--surface2);border:1px solid var(--border);
        border-radius:8px;padding:10px 14px;color:var(--text);font-family:'Tajawal',sans-serif;font-size:.95rem;outline:none"
        onchange="onEditTeacherChange(this)">
        ${teachers.map(t=>`<option value="${t.id}" ${t.id===c.teacher?'selected':''}>${t.name}</option>`).join('')}
        <option value="__new__">✏️ إضافة معلم جديد...</option>
      </select>
      <div id="eNewTeacherWrap" style="display:none;margin-top:8px">
        <div style="font-size:.75rem;color:var(--gold-light);margin-bottom:5px">✏️ سيتم إنشاء حساب معلم جديد تلقائياً</div>
        <input id="eNewTeacherName" placeholder="اسم المعلم الجديد كاملاً *"
          style="width:100%;background:var(--surface2);border:1px solid var(--border-gold);border-radius:8px;
          padding:10px 14px;color:var(--text);font-family:'Tajawal',sans-serif;font-size:.95rem;outline:none;margin-bottom:6px">
        <input id="eNewTeacherEmail" placeholder="البريد الإلكتروني (اختياري)"
          style="width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:8px;
          padding:10px 14px;color:var(--text);font-family:'Tajawal',sans-serif;font-size:.95rem;outline:none">
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div class="field"><label>وقت الحلقة</label>
        <select id="eTime">
          ${['بعد الفجر','بعد الظهر','بعد العصر','بعد المغرب','بعد العشاء'].map(t=>`<option ${t===c.time?'selected':''}>${t}</option>`).join('')}
        </select>
      </div>
      <div class="field"><label>المسجد</label>
        <input id="eRoom" value="${c.room||''}">
      </div>
    </div>
    <div class="field"><label>أيام الحلقة</label>
      <input id="eDays" value="${c.days||''}">
    </div>
    <div style="display:flex;gap:10px;margin-top:4px">
      <button class="btn btn-solid" style="flex:1" onclick="saveEditCircle(${id})">💾 حفظ التعديلات</button>
      <button class="btn btn-red btn-sm" onclick="closeModalDirect()">إلغاء</button>
    </div>
  `);
};

window.onEditTeacherChange = function(sel) {
  const wrap = document.getElementById('eNewTeacherWrap');
  if (sel.value === '__new__') {
    wrap.style.display = 'block';
    document.getElementById('eNewTeacherName')?.focus();
  } else {
    wrap.style.display = 'none';
  }
};

window.saveEditCircle = function(id) {
  const c = DB.circles.find(x=>x.id===id);
  if (!c) return;
  const name = (document.getElementById('eName')?.value||'').trim();
  if (!name) { showToast('⚠️ الاسم لا يمكن أن يكون فارغاً'); return; }

  const sel = document.getElementById('eTeacher')?.value || '';
  let teacherId = c.teacher;

  function finishEditCircle() {
    c.name    = name;
    c.teacher = teacherId;
    c.time    = document.getElementById('eTime')?.value    || c.time;
    c.room    = (document.getElementById('eRoom')?.value||'').trim() || c.room;
    c.days    = (document.getElementById('eDays')?.value||'').trim() || c.days;
    saveDB();
    closeModalDirect();
    showToast('✅ تم تحديث بيانات ' + c.name);
    navigateTo('circles');
  }

  if (sel === '__new__') {
    const newName  = (document.getElementById('eNewTeacherName')?.value||'').trim();
    const newEmail = (document.getElementById('eNewTeacherEmail')?.value||'').trim();
    if (!newName) { showToast('⚠️ يرجى كتابة اسم المعلم الجديد'); return; }
    teacherId = Math.max(...DB.users.map(u=>u.id)) + 1;
    const colors = ['#6e3f28','#3d6975','#92512c','#536f5a','#a7352a','#836128'];
    hashPassword('1234').then(function(hashedPass) {
      DB.users.push({
        id: teacherId, role: 'teacher',
        name: newName,
        email: newEmail || 'teacher'+ teacherId +'@hifz.com',
        pass: hashedPass,
        color: colors[teacherId % colors.length],
        circle: name
      });
      showToast('👤 تم إنشاء حساب المعلم: ' + newName);
      finishEditCircle();
    });
    return;
  } else if (sel && sel !== '__new__') {
    teacherId = parseInt(sel) || c.teacher;
  }

  finishEditCircle();
};

// ---- DELETE CIRCLE ----
window.deleteCircle = function(id) {
  const c = DB.circles.find(x=>x.id===id);
  if (!c) return;
  if (c.students.length > 0) {
    showToast('⚠️ لا يمكن حذف الحلقة — تحتوي على ' + c.students.length + ' طلاب');
    return;
  }
  openModal('🗑 تأكيد الحذف', `
    <div style="text-align:center;padding:10px 0">
      <div style="font-size:2.5rem;margin-bottom:12px">⚠️</div>
      <div style="font-size:1rem;font-weight:700;margin-bottom:8px">هل تريد حذف "${c.name}"؟</div>
      <div style="font-size:.85rem;color:var(--text-muted);margin-bottom:20px">هذا الإجراء لا يمكن التراجع عنه</div>
      <div style="display:flex;gap:10px;justify-content:center">
        <button class="btn btn-red" onclick="confirmDeleteCircle(${id})">🗑 نعم، احذف</button>
        <button class="btn btn-green" onclick="closeModalDirect()">إلغاء</button>
      </div>
    </div>
  `);
};

window.confirmDeleteCircle = function(id) {
  const idx = DB.circles.findIndex(x=>x.id===id);
  if (idx === -1) return;
  const name = DB.circles[idx].name;
  DB.circles.splice(idx, 1);
  saveDB();
  closeModalDirect();
  showToast('🗑 تم حذف ' + name);
  navigateTo('circles');
};

// ---- ATTENDANCE PAGE ----
pages['attendance'] = function(el) {
  const locale = currentLang==='en'?'en-US':'ar-SA';
  const today = new Date().toLocaleDateString(locale,{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  el.innerHTML = `
    <div class="card" style="margin-bottom:16px">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">
        <div>
          <div style="font-size:1rem;font-weight:700">📅 ${currentLang==='en'?'Attendance Record':'سجل الحضور'} — ${today}</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-solid btn-sm" onclick="showToast(currentLang==='en'?'✅ Attendance saved':'✅ تم حفظ سجل الحضور')">💾 ${currentLang==='en'?'Save':'حفظ السجل'}</button>
          <button class="btn btn-gold btn-sm" onclick="showToast(currentLang==='en'?'📤 Notifications sent':'📤 تم إرسال الإشعارات')">📤 ${currentLang==='en'?'Send Notifications':'إرسال إشعارات'}</button>
        </div>
      </div>
    </div>
    <div class="card" style="margin-bottom:16px">
      <div style="display:flex;gap:16px;margin-bottom:16px;font-size:.82rem">
        <span class="badge green">● ${t('present')}</span>
        <span class="badge red">● ${t('absent')}</span>
        <span class="badge gold">● ${t('late')}</span>
      </div>
      ${DB.students.length===0?`<div style="text-align:center;padding:24px;color:var(--text-muted)">${t('noStudents')}</div>`:
        DB.students.map(s=>{
          const st = DB.attendance[s.id]||'todo';
          return `
            <div class="att-row" id="att-row-${s.id}">
              <div style="display:flex;align-items:center;gap:10px;flex:1">
                <div style="width:30px;height:30px;border-radius:50%;background:var(--success-soft);display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:700">${s.name.charAt(0)}</div>
                <div>
                  <div style="font-size:.88rem;font-weight:600">${s.name}</div>
                  <div style="font-size:.72rem;color:var(--text-muted)">${s.circle}</div>
                </div>
              </div>
              <div class="att-btns">
                <button class="att-btn present ${st==='present'?'active':''}" title="${t('present')}" onclick="setAtt(${s.id},'present',this)">✓</button>
                <button class="att-btn absent ${st==='absent'?'active':''}" title="${t('absent')}" onclick="setAtt(${s.id},'absent',this)">✗</button>
                <button class="att-btn late ${st==='late'?'active':''}" title="${t('late')}" onclick="setAtt(${s.id},'late',this)">⏰</button>
              </div>
              <span class="badge ${st==='present'?'green':st==='absent'?'red':st==='late'?'gold':'gray'}" id="att-badge-${s.id}" style="min-width:64px;justify-content:center">
                ${st==='present'?t('present'):st==='absent'?t('absent'):st==='late'?t('late'):'—'}
              </span>
            </div>`;
        }).join('')}
    </div>
    <div class="card">
      <div class="card-title"><span class="ct-icon">📊</span> ${currentLang==='en'?'Monthly Attendance Summary':'ملخص الحضور الشهري'}</div>
      <div class="grid-4">
        ${DB.students.map(s=>`
          <div style="text-align:center;padding:12px;background:var(--surface2);border-radius:10px">
            <div style="font-size:.8rem;font-weight:600;margin-bottom:6px">${s.name.split(' ')[0]}</div>
            <div style="font-size:1.2rem;font-weight:900;color:${s.attendance>=90?'var(--emerald-light)':s.attendance>=75?'var(--gold-light)':'var(--red)'}">${s.attendance}%</div>
            ${pctBar(s.attendance,100,s.attendance<75?'red':'')}
          </div>
        `).join('')}
      </div>
    </div>
  `;
};

window.setAtt = function(id, val, btn) {
  DB.attendance[id] = val;
  const row = document.getElementById('att-row-'+id);
  row.querySelectorAll('.att-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const badge = document.getElementById('att-badge-'+id);
  badge.textContent = val==='present'?t('present'):val==='absent'?t('absent'):t('late');
  badge.className = 'badge '+(val==='present'?'green':val==='absent'?'red':'gold');
  badge.style.minWidth='64px'; badge.style.justifyContent='center';
  const msg = val==='present'?'✅ '+t('present'):val==='absent'?'❌ '+t('absent'):'⏰ '+t('late');
  saveDB();
  showToast(msg);
};

// ---- REPORTS PAGE ----
// ---- REPORTS PAGE (Circles → Students) ----
let activeCircleReport = 0;

pages['reports'] = function(el) {
  activeCircleReport = DB.circles.length > 0 ? DB.circles[0].id : 0;
  renderReportsPage(el);
};

function renderReportsPage(el) {
  const allStudentCount = DB.students.length;
  const totalPages      = DB.students.reduce((a,s)=>a+s.pages,0);
  const weakCount       = DB.students.filter(s=>s.weak).length;
  const avgAtt          = allStudentCount ? Math.round(DB.students.reduce((a,s)=>a+s.attendance,0)/allStudentCount) : 0;

  el.innerHTML = `
    <!-- Global summary -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px">
      ${[
        ['👥','إجمالي الطلاب', allStudentCount,'','var(--emerald-light)'],
        ['📖','صفحات محفوظة', totalPages,'من '+(604*allStudentCount),'var(--gold-light)'],
        ['✅','متوسط الحضور', avgAtt+'%','','var(--blue)'],
        ['⚠️','يحتاجون دعماً', weakCount,'طالب','var(--red)'],
      ].map(([ic,lb,vl,sub,cl])=>`
        <div class="stat-box">
          <div class="stat-icon" style="background:${cl}18;font-size:1.2rem">${ic}</div>
          <div>
            <div class="stat-val" style="color:${cl}">${vl}</div>
            <div class="stat-lbl">${lb}</div>
            ${sub?`<div style="font-size:.68rem;color:var(--text-dim)">${sub}</div>`:''}
          </div>
        </div>`).join('')}
    </div>

    <!-- Action buttons -->
    <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap">
      <button class="btn btn-solid btn-sm" onclick="showToast('📄 جاري تصدير كل التقارير...')">📄 تصدير الكل PDF</button>
      <button class="btn btn-gold btn-sm" onclick="showToast('📤 تم إرسال التقارير لأولياء الأمور')">📤 إرسال لأولياء الأمور</button>
      <button class="btn btn-green btn-sm" onclick="window.print()">🖨️ طباعة</button>
    </div>

    <!-- Circles tabs -->
    <div class="rpt-tabs" id="rptTabs">
      ${DB.circles.map(c => {
        const cnt = DB.students.filter(s=>c.students.includes(s.id)).length;
        return `<div class="rpt-tab ${c.id===activeCircleReport?'active':''}" onclick="switchCircleReport(${c.id})">
          🕌 ${c.name}
          <span class="rpt-tab-count">${cnt}</span>
        </div>`;
      }).join('')}
      ${DB.circles.length===0?'<div style="color:var(--text-muted);font-size:.85rem;padding:10px">لا توجد حلقات مسجلة</div>':''}
    </div>

    <!-- Circle reports -->
    <div id="circleReports">
      ${DB.circles.map(c => renderCircleReport(c)).join('')}
    </div>
  `;
}

function renderCircleReport(c) {
  const teacher  = DB.users.find(u=>u.id===c.teacher);
  const students = DB.students.filter(s=>c.students.includes(s.id));
  const avgAtt   = students.length ? Math.round(students.reduce((a,s)=>a+s.attendance,0)/students.length) : 0;
  const avgPct   = students.length ? Math.round(students.reduce((a,s)=>a+s.pages,0)/(students.length*604)*100) : 0;
  const totalSes = students.reduce((a,s)=>a+(s.sessions||[]).length,0);
  const weakCnt  = students.filter(s=>s.weak).length;

  return `
    <div class="circle-report ${c.id===activeCircleReport?'active':''}" id="cr-${c.id}">

      <!-- Circle banner -->
      <div class="circle-banner">
        <div style="position:relative;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
          <div style="display:flex;align-items:center;gap:14px">
            <div style="font-size:2rem">🕌</div>
            <div>
              <div style="font-size:1.15rem;font-weight:800">${c.name}</div>
              <div style="font-size:.78rem;opacity:.9;margin-top:3px">👤 ${teacher?.name||'—'} · 🕐 ${c.time} · 📅 ${c.days}</div>
            </div>
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            ${[
              [students.length,'طالب'],
              [avgAtt+'%','متوسط الحضور'],
              [avgPct+'%','متوسط التقدم'],
              [totalSes,'جلسة مسجلة'],
            ].map(([v,l])=>`
              <div style="text-align:center;background:rgba(255,255,255,.15);border-radius:10px;padding:8px 14px">
                <div style="font-size:1.1rem;font-weight:900">${v}</div>
                <div style="font-size:.65rem;opacity:.85">${l}</div>
              </div>`).join('')}
          </div>
        </div>
        ${weakCnt>0?`<div style="margin-top:12px;position:relative;background:rgba(224,85,85,.25);border-radius:8px;
          padding:7px 12px;font-size:.78rem">⚠️ ${weakCnt} طالب يحتاج متابعة مكثفة في هذه الحلقة</div>`:''}
      </div>

      <!-- Students reports -->
      ${students.length===0?`
        <div style="text-align:center;padding:40px;color:var(--text-muted)">
          <div style="font-size:2rem;margin-bottom:8px">📭</div>
          <div>لا يوجد طلاب في هذه الحلقة</div>
        </div>` :
        students.map(s => renderStudentReport(s)).join('')
      }
    </div>
  `;
}

function renderStudentReport(s) {
  const pct      = Math.round(s.pages/s.totalPages*100);
  const sessions = s.sessions||[];
  const grades   = sessions.map(ses=>ses.grade);
  const gradeCount = {};
  grades.forEach(g=>{ gradeCount[g]=(gradeCount[g]||0)+1; });
  const topGrade = Object.entries(gradeCount).sort((a,b)=>b[1]-a[1])[0];
  const colors   = {متفوق:'#536f5a',جيد:'#3d6975',متوسط:'#836128',ضعيف:'#a7352a'};
  const col      = colors[s.level]||'#aaa';
  const totalNew = sessions.reduce((a,ses)=>a+ses.new,0);
  const totalRev = sessions.reduce((a,ses)=>a+ses.review,0);

  return `
    <div class="s-report-card" id="src-${s.id}">
      <!-- Collapsible header -->
      <div class="s-report-header" onclick="toggleStudentReport(${s.id})">
        <div style="display:flex;align-items:center;gap:12px;flex:1;min-width:0">
          <div style="width:40px;height:40px;border-radius:50%;background:${col}20;color:${col};
               border:2px solid ${col}40;display:flex;align-items:center;justify-content:center;
               font-size:1rem;font-weight:800;flex-shrink:0">${s.name.charAt(0)}</div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:700;font-size:.95rem">${s.name}</div>
            <div style="font-size:.72rem;color:var(--text-muted);margin-top:2px">
              ${s.currentSurah} · آية ${s.currentAyah} · ${sessions.length} جلسة مسجلة
            </div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:10px;flex-shrink:0">
          <!-- Mini progress -->
          <div style="display:none;flex-direction:column;align-items:flex-end;gap:3px" class="rpt-mini-stats">
            <div style="font-size:.75rem;color:var(--emerald-light);font-weight:700">${s.pages} صفحة (${pct}%)</div>
            <div style="width:80px;height:4px;background:var(--surface2);border-radius:2px;overflow:hidden">
              <div style="height:100%;width:${pct}%;background:var(--emerald-mid);border-radius:2px"></div>
            </div>
          </div>
          ${levelBadge(s.level)}
          ${s.weak?'<span class="badge red" style="font-size:.62rem">دعم</span>':''}
          <span class="s-report-arrow">▼</span>
        </div>
      </div>

      <!-- Expandable body -->
      <div class="s-report-body" id="srb-${s.id}">

        <!-- Top stats -->
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:16px">
          ${[
            [s.pages,'صفحة محفوظة','var(--emerald-light)'],
            [pct+'%','نسبة الإتمام','var(--gold-light)'],
            [s.attendance+'%','نسبة الحضور', s.attendance>=90?'var(--emerald-light)':s.attendance>=75?'var(--gold-light)':'var(--red)'],
            [sessions.length,'جلسة مسجلة','var(--blue)'],
            [topGrade?topGrade[0]:'—','التقييم الأكثر','var(--text)'],
          ].map(([v,l,c])=>`
            <div style="background:var(--surface2);border-radius:9px;padding:10px;text-align:center">
              <div style="font-size:1.05rem;font-weight:900;color:${c}">${v}</div>
              <div style="font-size:.6rem;color:var(--text-muted);margin-top:2px">${l}</div>
            </div>`).join('')}
        </div>

        <!-- Progress by juz -->
        <div style="margin-bottom:16px">
          <div style="font-size:.82rem;font-weight:700;color:var(--gold-light);margin-bottom:8px">📊 تقدم الحفظ بالأجزاء</div>
          ${juzsWidget(s, {compact:true})}
        </div>

        <!-- Plan -->
        <div style="background:var(--surface2);border-radius:10px;padding:12px;margin-bottom:14px">
          <div style="font-size:.82rem;font-weight:700;color:var(--gold-light);margin-bottom:8px">📝 خطة الحفظ الحالية</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <span class="badge green">${s.plan.dailyAyah} آيات يومياً</span>
            <span class="badge blue">مراجعة ${s.plan.reviewDays} أيام/أسبوع</span>
            <span class="badge gold">هدف أسبوعي: ${s.plan.weeklyGoal}</span>
          </div>
        </div>

        <!-- Sessions totals -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
          <div style="background:var(--surface2);border-radius:10px;padding:12px;text-align:center">
            <div style="font-size:1.4rem;font-weight:900;color:var(--emerald-light)">${totalNew}</div>
            <div style="font-size:.72rem;color:var(--text-muted)">آيات جديدة إجمالاً</div>
          </div>
          <div style="background:var(--surface2);border-radius:10px;padding:12px;text-align:center">
            <div style="font-size:1.4rem;font-weight:900;color:var(--blue)">${totalRev}</div>
            <div style="font-size:.72rem;color:var(--text-muted)">آيات مراجعة إجمالاً</div>
          </div>
        </div>

        <!-- Grade distribution -->
        ${Object.keys(gradeCount).length > 0 ? `
          <div style="margin-bottom:14px">
            <div style="font-size:.82rem;font-weight:700;color:var(--gold-light);margin-bottom:8px">📈 توزيع التقييمات</div>
            <div class="grade-pills">
              ${Object.entries(gradeCount).sort((a,b)=>b[1]-a[1]).map(([g,cnt])=>`
                ${gradeBadge(g)} <span style="font-size:.72rem;color:var(--text-muted);margin-left:4px">${cnt} مرة</span>
              `).join('<span style="color:var(--text-dim);margin:0 4px">·</span>')}
            </div>
          </div>` : ''}

        <!-- Sessions log -->
        <div style="margin-bottom:14px">
          <div style="font-size:.82rem;font-weight:700;color:var(--gold-light);margin-bottom:8px">🗓 سجل الجلسات</div>
          ${sessions.length > 0 ? `
            <div class="table-wrap">
              <table>
                <thead><tr><th>التاريخ</th><th>جديد</th><th>مراجعة</th><th>التقييم</th><th>ملاحظات</th></tr></thead>
                <tbody>
                  ${sessions.map(ses=>`
                    <tr>
                      <td style="color:var(--text-muted)">${ses.date}</td>
                      <td style="color:var(--emerald-light);font-weight:700">+${ses.new}</td>
                      <td style="color:var(--blue)">${ses.review}</td>
                      <td>${gradeBadge(ses.grade)}</td>
                      <td style="color:var(--text-muted);font-size:.78rem">${ses.notes||'—'}</td>
                    </tr>`).join('')}
                </tbody>
              </table>
            </div>` :
            `<div style="color:var(--text-dim);font-size:.82rem;padding:8px 0">لا توجد جلسات مسجلة بعد</div>`
          }
        </div>

        <!-- Notes & actions -->
        ${s.weak?`<div class="notif-item alert" style="margin-bottom:12px">⚠️ هذا الطالب يحتاج متابعة مكثفة — يُنصح بجلسات دعم إضافية وتواصل منتظم مع ولي الأمر</div>`:''}
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-solid btn-sm" onclick="showToast('📄 تم تصدير تقرير ${s.name}')">📄 تصدير PDF</button>
          <button class="btn btn-gold btn-sm" onclick="showToast('📤 تم إرسال التقرير لولي الأمر')">📤 إرسال لولي الأمر</button>
          <button class="btn btn-green btn-sm" onclick="closeModalDirect();openStudentModal(${s.id})">📋 الملف التفصيلي</button>
        </div>
      </div>
    </div>
  `;
}

window.switchCircleReport = function(id) {
  activeCircleReport = id;
  // Update tabs
  document.querySelectorAll('.rpt-tab').forEach(t=>t.classList.remove('active'));
  const activeTab = [...document.querySelectorAll('.rpt-tab')].find(t=>t.textContent.includes(DB.circles.find(c=>c.id===id)?.name));
  if (activeTab) activeTab.classList.add('active');
  // Update panels
  document.querySelectorAll('.circle-report').forEach(p=>p.classList.remove('active'));
  const panel = document.getElementById('cr-'+id);
  if (panel) panel.classList.add('active');
};

window.toggleStudentReport = function(id) {
  const card = document.getElementById('src-'+id);
  const body = document.getElementById('srb-'+id);
  if (!card||!body) return;
  const opening = !body.classList.contains('open');
  card.classList.toggle('open', opening);
  body.classList.toggle('open', opening);
  // Show mini stats only when closed
  const mini = card.querySelector('.rpt-mini-stats');
  if (mini) mini.style.display = opening ? 'none' : 'flex';
};

// ---- NOTIFICATIONS PAGE ----
// selected individual IDs per group
window._adminSelectedIds = { parent: new Set(), teacher: new Set(), student: new Set() };

pages['notifications'] = function(el) {
  const teachers = DB.users.filter(u => u.role === 'teacher');
  const parents  = DB.users.filter(u => u.role === 'parent');

  // ── helpers ──
  function memberCheckbox(group, id, name, sub) {
    return `
      <label id="asub-${group}-${id}"
        style="display:flex;align-items:center;gap:8px;padding:6px 10px 6px 30px;
               border-radius:7px;cursor:pointer;transition:background .15s;font-size:.8rem"
        onmouseenter="this.style.background='var(--emerald-glow)'"
        onmouseleave="this.style.background=''"
        onclick="adminToggleIndividual('${group}',${id},this)">
        <div id="asub-chk-${group}-${id}"
             style="width:15px;height:15px;border-radius:4px;border:2px solid var(--border);
                    flex-shrink:0;display:flex;align-items:center;justify-content:center;
                    font-size:.5rem;transition:all .2s"></div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${name}</div>
          ${sub ? `<div style="font-size:.65rem;color:var(--text-muted)">${sub}</div>` : ''}
        </div>
      </label>`;
  }

  // Build per-circle sub-accordion
  function circleAccordion(circleId, circleName, members, group) {
    const cid = 'ac-' + group + '-c' + circleId;
    return `
      <div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;margin-bottom:6px">
        <div id="${cid}-hdr" style="display:flex;align-items:center;gap:8px;padding:7px 10px;
             cursor:pointer;background:var(--surface);transition:all .2s;user-select:none"
             onclick="adminToggleCircleAccordion('${cid}','${group}',${circleId})">
          <div style="font-size:1rem">🕌</div>
          <div style="flex:1">
            <div style="font-size:.8rem;font-weight:700">${circleName}</div>
            <div style="font-size:.65rem;color:var(--text-muted)" id="${cid}-count">${members.length} — اضغط لاختيار</div>
          </div>
          <div style="display:flex;align-items:center;gap:5px">
            <span id="${cid}-badge" class="badge gold" style="display:none;font-size:.6rem"></span>
            <span id="${cid}-arrow" style="color:var(--text-dim);font-size:.65rem;transition:transform .25s">▶</span>
          </div>
        </div>
        <div id="${cid}-body" style="display:none;border-top:1px solid var(--border);padding:4px 2px">
          <div style="display:flex;gap:5px;padding:3px 8px 6px">
            <button class="btn btn-green btn-sm" style="font-size:.68rem;padding:3px 8px"
              onclick="adminSelectCircle('${group}',${circleId},'${cid}')">تحديد الكل</button>
            <button class="btn btn-red btn-sm" style="font-size:.68rem;padding:3px 8px"
              onclick="adminClearCircle('${group}',${circleId},'${cid}')">إلغاء الكل</button>
          </div>
          ${members.map(m => memberCheckbox(group, m.id, m.name, m.sub)).join('')}
        </div>
      </div>`;
  }

  // ── build parent circles ──
  const parentCircleBlocks = DB.circles.map(c => {
    const studs = DB.students.filter(s => c.students.includes(s.id));
    const prts  = studs.map(s => {
      const p = parents.find(p => p.studentId === s.id);
      return p ? {id:p.id, name:p.name, sub:`ولي أمر: ${s.name}`} : null;
    }).filter(Boolean);
    return prts.length ? circleAccordion(c.id, c.name, prts, 'parent') : '';
  }).join('');

  // ── build student circles ──
  const studentCircleBlocks = DB.circles.map(c => {
    const studs = DB.students.filter(s => c.students.includes(s.id))
                             .map(s => ({id:s.id, name:s.name, sub:levelBadge?s.level:''}));
    return studs.length ? circleAccordion(c.id, c.name, studs, 'student') : '';
  }).join('');

  // ── teacher remains flat ──
  const teacherFlat = teachers.map(t => {
    const circle = DB.circles.find(c=>c.teacher===t.id);
    return memberCheckbox('teacher', t.id, t.name, circle?.name || 'بدون حلقة');
  }).join('');

  el.innerHTML = `
    <div class="grid-2" style="margin-bottom:20px">

      <!-- ── Send panel ── -->
      <div class="card">
        <div class="card-title"><span class="ct-icon">📤</span> إرسال إشعار جديد</div>

        <div style="margin-bottom:10px">
          <div style="font-size:.82rem;font-weight:700;color:var(--gold-light);margin-bottom:8px">📬 إلى</div>

          <!-- أولياء الأمور -->
          <div style="border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:8px">
            <div id="admin-grp-parent"
              style="display:flex;align-items:center;gap:10px;padding:10px 12px;cursor:pointer;
                     background:var(--surface2);transition:all .2s;user-select:none"
              onclick="adminToggleGroup('parent',this)">
              <div style="width:30px;height:30px;border-radius:50%;background:var(--emerald-glow);
                   display:flex;align-items:center;justify-content:center;font-size:.95rem">👨‍👦</div>
              <div style="flex:1">
                <div style="font-size:.85rem;font-weight:700">أولياء الأمور</div>
                <div style="font-size:.68rem;color:var(--text-muted)" id="admin-grp-parent-count">
                  ${parents.length} ولي أمر — اضغط لاختيار
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:6px">
                <span id="admin-grp-parent-badge" class="badge gray" style="display:none;font-size:.65rem"></span>
                <span id="admin-grp-parent-arrow" style="color:var(--text-dim);font-size:.75rem;transition:transform .25s">▼</span>
              </div>
            </div>
            <div id="admin-sub-parent" style="display:none;border-top:1px solid var(--border);padding:8px">
              <div style="display:flex;gap:6px;margin-bottom:8px">
                <button class="btn btn-green btn-sm" onclick="adminSelectAll('parent')">تحديد الكل</button>
                <button class="btn btn-red btn-sm" onclick="adminClearGroup('parent')">إلغاء الكل</button>
              </div>
              ${parentCircleBlocks || '<div style="color:var(--text-muted);font-size:.8rem;padding:8px">لا يوجد أولياء أمور مرتبطون بحلقات</div>'}
            </div>
          </div>

          <!-- المعلمون (flat) -->
          <div style="border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:8px">
            <div id="admin-grp-teacher"
              style="display:flex;align-items:center;gap:10px;padding:10px 12px;cursor:pointer;
                     background:var(--surface2);transition:all .2s;user-select:none"
              onclick="adminToggleGroup('teacher',this)">
              <div style="width:30px;height:30px;border-radius:50%;background:var(--emerald-glow);
                   display:flex;align-items:center;justify-content:center;font-size:.95rem">📚</div>
              <div style="flex:1">
                <div style="font-size:.85rem;font-weight:700">المعلمون</div>
                <div style="font-size:.68rem;color:var(--text-muted)" id="admin-grp-teacher-count">
                  ${teachers.length} معلم — اضغط لاختيار
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:6px">
                <span id="admin-grp-teacher-badge" class="badge gray" style="display:none;font-size:.65rem"></span>
                <span id="admin-grp-teacher-arrow" style="color:var(--text-dim);font-size:.75rem;transition:transform .25s">▼</span>
              </div>
            </div>
            <div id="admin-sub-teacher" style="display:none;border-top:1px solid var(--border);padding:6px 4px">
              <div style="display:flex;gap:6px;padding:4px 10px 8px">
                <button class="btn btn-green btn-sm" onclick="adminSelectAll('teacher')">تحديد الكل</button>
                <button class="btn btn-red btn-sm" onclick="adminClearGroup('teacher')">إلغاء الكل</button>
              </div>
              ${teacherFlat}
            </div>
          </div>

          <!-- الطلاب -->
          <div style="border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:8px">
            <div id="admin-grp-student"
              style="display:flex;align-items:center;gap:10px;padding:10px 12px;cursor:pointer;
                     background:var(--surface2);transition:all .2s;user-select:none"
              onclick="adminToggleGroup('student',this)">
              <div style="width:30px;height:30px;border-radius:50%;background:var(--emerald-glow);
                   display:flex;align-items:center;justify-content:center;font-size:.95rem">🎓</div>
              <div style="flex:1">
                <div style="font-size:.85rem;font-weight:700">الطلاب</div>
                <div style="font-size:.68rem;color:var(--text-muted)" id="admin-grp-student-count">
                  ${DB.students.length} طالب — اضغط لاختيار
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:6px">
                <span id="admin-grp-student-badge" class="badge gray" style="display:none;font-size:.65rem"></span>
                <span id="admin-grp-student-arrow" style="color:var(--text-dim);font-size:.75rem;transition:transform .25s">▼</span>
              </div>
            </div>
            <div id="admin-sub-student" style="display:none;border-top:1px solid var(--border);padding:8px">
              <div style="display:flex;gap:6px;margin-bottom:8px">
                <button class="btn btn-green btn-sm" onclick="adminSelectAll('student')">تحديد الكل</button>
                <button class="btn btn-red btn-sm" onclick="adminClearGroup('student')">إلغاء الكل</button>
              </div>
              ${studentCircleBlocks || '<div style="color:var(--text-muted);font-size:.8rem;padding:8px">لا يوجد طلاب مرتبطون بحلقات</div>'}
            </div>
          </div>

          <!-- Selected summary -->
          <div id="adminSelectedSummary" style="display:none;background:var(--emerald-glow);
               border:1px solid var(--border);border-radius:8px;padding:8px 12px;
               font-size:.75rem;color:var(--emerald-light);margin-top:4px"></div>
        </div>

        <div class="field">
          <label>نوع الإشعار</label>
          <select id="adminNotifType">
            <option value="attendance">تنبيه حضور وغياب</option>
            <option value="progress">تقرير تقدم حفظ</option>
            <option value="meeting">طلب اجتماع</option>
            <option value="achievement">إنجاز متميز</option>
            <option value="reminder">تذكير مراجعة</option>
            <option value="plan">تعديل خطة</option>
            <option value="general">عام</option>
          </select>
        </div>

        <div class="field">
          <label>الأولوية</label>
          <div style="display:flex;gap:8px;margin-top:4px">
            ${[['عادي','normal','green'],['مهم','important','gold'],['عاجل','urgent','red']].map(([l,v,c])=>`
              <label style="display:flex;align-items:center;gap:5px;cursor:pointer;font-size:.8rem">
                <input type="radio" name="adminPriority" value="${v}" ${v==='normal'?'checked':''}>
                <span class="badge ${c}" style="font-size:.7rem">${l}</span>
              </label>`).join('')}
          </div>
        </div>

        <div class="field">
          <label>نص الإشعار</label>
          <textarea id="adminNotifMsg" rows="3" placeholder="اكتب نص الإشعار..."
            style="width:100%;background:var(--surface2);border:1px solid var(--border);
                   border-radius:8px;padding:10px;color:var(--text);font-family:'Tajawal',sans-serif;
                   font-size:.9rem;resize:vertical;outline:none;line-height:1.6"
            onfocus="this.style.borderColor='var(--emerald-mid)'"
            onblur="this.style.borderColor=''"></textarea>
        </div>
        <button class="btn btn-solid" style="width:100%" onclick="adminSendNotif()">📤 إرسال الإشعار</button>
      </div>

      <!-- ── Log panel ── -->
      <div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
          <div class="card-title" style="margin:0"><span class="ct-icon">🔔</span> سجل الإشعارات</div>
          <button class="btn btn-green btn-sm" onclick="markAllRead()">✅ وضع الكل كمقروء</button>
        </div>
        <div class="timeline" id="adminNotifLog">
          ${DB.notifications.map(n => {
            const colors = {alert:'var(--red)', warn:'var(--gold-light)', info:'var(--emerald-light)'};
            const icons  = {alert:'⚠️', warn:'🔔', info:'ℹ️'};
            return `<div class="tl-item">
              <div class="tl-dot" style="background:${colors[n.type]}20;color:${colors[n.type]}">${icons[n.type]}</div>
              <div class="tl-content">
                <div class="tl-title">${n.msg}</div>
                <div class="tl-time">${n.time}</div>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>
  `;
};


// ── Circle accordion inside group ──
window.adminToggleCircleAccordion = function(cid, group, circleId) {
  const body  = document.getElementById(cid + '-body');
  const arrow = document.getElementById(cid + '-arrow');
  const hdr   = document.getElementById(cid + '-hdr');
  if (!body) return;
  const opening = body.style.display === 'none';
  body.style.display    = opening ? 'block' : 'none';
  if (arrow) arrow.style.transform = opening ? 'rotate(90deg)' : '';
  if (hdr)   hdr.style.background  = opening ? 'var(--emerald-glow)' : 'var(--surface)';
};

// ── Select all in a circle ──
window.adminSelectCircle = function(group, circleId, cid) {
  const circle  = DB.circles.find(c => c.id === circleId);
  if (!circle) return;
  const set     = window._adminSelectedIds[group];
  const parents = DB.users.filter(u => u.role === 'parent');

  let items = [];
  if (group === 'parent') {
    items = circle.students.map(sid => {
      const p = parents.find(p => p.studentId === sid);
      return p ? p.id : null;
    }).filter(Boolean);
  } else if (group === 'student') {
    items = circle.students;
  }

  items.forEach(id => {
    set.add(id);
    const chk = document.getElementById('asub-chk-' + group + '-' + id);
    if (chk) { chk.style.background='var(--emerald-mid)'; chk.style.borderColor='var(--emerald-mid)'; chk.textContent='✓'; chk.style.color='#fff'; }
  });

  adminUpdateCircleBadge(cid, items.length, items.length);
  adminUpdateGroupBadge(group);
  adminUpdateSummary();
};

// ── Clear all in a circle ──
window.adminClearCircle = function(group, circleId, cid) {
  const circle  = DB.circles.find(c => c.id === circleId);
  if (!circle) return;
  const set     = window._adminSelectedIds[group];
  const parents = DB.users.filter(u => u.role === 'parent');

  let items = [];
  if (group === 'parent') {
    items = circle.students.map(sid => {
      const p = parents.find(p => p.studentId === sid);
      return p ? p.id : null;
    }).filter(Boolean);
  } else if (group === 'student') {
    items = circle.students;
  }

  items.forEach(id => {
    set.delete(id);
    const chk = document.getElementById('asub-chk-' + group + '-' + id);
    if (chk) { chk.style.background=''; chk.style.borderColor='var(--border)'; chk.textContent=''; }
  });

  adminUpdateCircleBadge(cid, 0, items.length);
  adminUpdateGroupBadge(group);
  adminUpdateSummary();
};

// ── Update circle badge count ──
window.adminUpdateCircleBadge = function(cid, selected, total) {
  const badge = document.getElementById(cid + '-badge');
  const count = document.getElementById(cid + '-count');
  if (badge) {
    badge.style.display = selected > 0 ? 'inline-flex' : 'none';
    badge.textContent   = selected + ' محدد';
  }
  if (count) count.textContent = `${total} — ${selected > 0 ? selected + ' محدد' : 'اضغط لاختيار'}`;
};

// ── Group accordion toggle ──
window.adminToggleGroup = function(group, hdr) {
  const sub   = document.getElementById('admin-sub-' + group);
  const arrow = document.getElementById('admin-grp-' + group + '-arrow');
  const open  = sub.style.display === 'none';
  sub.style.display   = open ? 'block' : 'none';
  arrow.style.transform = open ? 'rotate(180deg)' : '';
  hdr.style.background  = open ? 'var(--emerald-glow)' : 'var(--surface2)';
};

// ── Individual checkbox toggle ──
window.adminToggleIndividual = function(group, id, lbl) {
  const set = window._adminSelectedIds[group];
  const chk = document.getElementById('asub-chk-' + group + '-' + id);
  if (set.has(id)) {
    set.delete(id);
    if (chk) { chk.style.background=''; chk.style.borderColor='var(--border)'; chk.textContent=''; }
  } else {
    set.add(id);
    if (chk) { chk.style.background='var(--emerald-mid)'; chk.style.borderColor='var(--emerald-mid)'; chk.textContent='✓'; chk.style.color='#fff'; }
  }
  // Update circle badge if parent or student
  if (group === 'parent' || group === 'student') {
    DB.circles.forEach(c => {
      const cid  = 'ac-' + group + '-c' + c.id;
      const parents = DB.users.filter(u=>u.role==='parent');
      const members = group==='parent'
        ? c.students.map(sid=>{ const p=parents.find(p=>p.studentId===sid); return p?p.id:null; }).filter(Boolean)
        : c.students;
      const sel = members.filter(mid => set.has(mid)).length;
      adminUpdateCircleBadge(cid, sel, members.length);
    });
  }
  adminUpdateGroupBadge(group);
  adminUpdateSummary();
};

// ── Select / clear all in group ──
window.adminSelectAll = function(group) {
  const items = group==='parent' ? DB.users.filter(u=>u.role==='parent') :
                group==='teacher'? DB.users.filter(u=>u.role==='teacher') :
                DB.students;
  const set = window._adminSelectedIds[group];
  items.forEach(item => {
    set.add(item.id);
    const chk = document.getElementById('asub-chk-' + group + '-' + item.id);
    if (chk) { chk.style.background='var(--emerald-mid)'; chk.style.borderColor='var(--emerald-mid)'; chk.textContent='✓'; chk.style.color='#fff'; }
  });
  adminUpdateGroupBadge(group);
  adminUpdateSummary();
};

window.adminClearGroup = function(group) {
  const set = window._adminSelectedIds[group];
  set.forEach(id => {
    const chk = document.getElementById('asub-chk-' + group + '-' + id);
    if (chk) { chk.style.background=''; chk.style.borderColor='var(--border)'; chk.textContent=''; }
  });
  set.clear();
  adminUpdateGroupBadge(group);
  adminUpdateSummary();
};

// ── Update badge count on group header ──
window.adminUpdateGroupBadge = function(group) {
  const cnt   = window._adminSelectedIds[group].size;
  const badge = document.getElementById('admin-grp-' + group + '-badge');
  const count = document.getElementById('admin-grp-' + group + '-count');
  const total = group==='parent' ? DB.users.filter(u=>u.role==='parent').length :
                group==='teacher'? DB.users.filter(u=>u.role==='teacher').length :
                DB.students.length;
  const labels = {parent:'ولي أمر', teacher:'معلم', student:'طالب'};
  if (badge) {
    badge.style.display = cnt > 0 ? 'inline-flex' : 'none';
    badge.textContent   = cnt + ' محدد';
    badge.className     = 'badge ' + (cnt === total ? 'green' : 'gold');
  }
  if (count) count.textContent = `${total} ${labels[group]} — ${cnt > 0 ? cnt + ' محدد' : 'اضغط لاختيار'}`;
};

// ── Summary bar below recipients ──
window.adminUpdateSummary = function() {
  const sum  = document.getElementById('adminSelectedSummary');
  const total = Object.values(window._adminSelectedIds).reduce((a,s)=>a+s.size,0);
  if (!sum) return;
  if (total === 0) { sum.style.display='none'; return; }
  const parts = [];
  if (window._adminSelectedIds.parent.size)  parts.push(`👨‍👦 ${window._adminSelectedIds.parent.size} ولي أمر`);
  if (window._adminSelectedIds.teacher.size) parts.push(`📚 ${window._adminSelectedIds.teacher.size} معلم`);
  if (window._adminSelectedIds.student.size) parts.push(`🎓 ${window._adminSelectedIds.student.size} طالب`);
  sum.style.display   = 'block';
  sum.textContent     = 'سيُرسل إلى: ' + parts.join(' · ') + ' — إجمالي ' + total + ' مستلم';
};

// ── Send ──
window.adminSendNotif = function() {
  const total = Object.values(window._adminSelectedIds).reduce((a,s)=>a+s.size,0);
  const msg   = document.getElementById('adminNotifMsg')?.value?.trim();
  const priority = document.querySelector('input[name="adminPriority"]:checked')?.value||'normal';

  if (total === 0) { showToast('⚠️ يرجى تحديد مستلم واحد على الأقل'); return; }
  if (!msg) { showToast('⚠️ يرجى كتابة نص الإشعار'); return; }

  const parts = [];
  if (window._adminSelectedIds.parent.size)  parts.push(`${window._adminSelectedIds.parent.size} ولي أمر`);
  if (window._adminSelectedIds.teacher.size) parts.push(`${window._adminSelectedIds.teacher.size} معلم`);
  if (window._adminSelectedIds.student.size) parts.push(`${window._adminSelectedIds.student.size} طالب`);

  const pIcon = priority==='urgent'?'🚨':priority==='important'?'⚠️':'📤';
  const nType = priority==='urgent'?'alert':priority==='important'?'warn':'info';

  DB.notifications.unshift({id:Date.now(), type:nType, msg, time:'الآن'});
  saveDB();

  // Reset
  window._adminSelectedIds = {parent:new Set(), teacher:new Set(), student:new Set()};
  document.getElementById('adminNotifMsg').value = '';

  showToast(pIcon + ' تم الإرسال إلى: ' + parts.join(' و'));
  navigateTo('notifications');
};

window.markAllRead = function() {
  showToast('✅ تم وضع جميع الإشعارات كمقروءة');
};

// ---- SETTINGS PAGE ----
pages['settings'] = function(el) {
  const studentCount  = DB.students.length;
  const teacherCount  = DB.users.filter(u=>u.role==='teacher').length;
  const circleCount   = DB.circles.length;
  const sessionCount  = DB.students.reduce((a,s)=>a+(s.sessions||[]).length,0);
  const notifCount    = DB.notifications.length;
  const isEn = currentLang==='en';

  const systemToggles = isEn ? [
    ['Attendance Notifications','Auto notify on absence',true],
    ['Weekly Reports','Auto send to parents',true],
    ['Weak Student Alerts','Instant notify to teacher',true],
    ['Permission Mode','Allow teacher to edit plans',false],
    ['Auto Backup','Daily automatic backup',true],
  ] : [
    ['إشعارات الحضور','تلقائي عند تسجيل الغياب',true],
    ['تقارير أسبوعية','إرسال تلقائي لأولياء الأمور',true],
    ['تنبيهات الطلاب الضعاف','إشعار فوري للمعلم',true],
    ['وضع الصلاحيات','السماح للمعلم بتعديل الخطط',false],
    ['النسخ الاحتياطي','نسخ احتياطي يومي تلقائي',true],
  ];

  el.innerHTML = `
    <!-- Push Notifications Card -->
    <div class="card" style="margin-bottom:16px;border:1px solid var(--emerald-mid)">
      <div class="card-title"><span class="ct-icon">🔔</span> ${isEn?'Push Notifications':'إشعارات Push'}</div>
      <div style="display:flex;align-items:center;gap:14px;padding:12px;background:var(--surface2);border-radius:10px;margin-bottom:12px">
        <div style="width:44px;height:44px;border-radius:50%;background:${PUSH.enabled?'var(--emerald-glow)':'var(--surface)'};
             border:2px solid ${PUSH.enabled?'var(--emerald-mid)':'var(--border)'};
             display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0">
          ${PUSH.enabled?'🔔':'🔕'}
        </div>
        <div style="flex:1">
          <div style="font-weight:700;font-size:.9rem">
            ${PUSH.enabled
              ? (isEn?'✅ Notifications Enabled':'✅ الإشعارات مفعّلة')
              : (isEn?'❌ Notifications Disabled':'❌ الإشعارات معطّلة')}
          </div>
          <div style="font-size:.72rem;color:var(--text-muted);margin-top:2px">
            ${PUSH.permission==='denied'
              ? (isEn?'Blocked in browser settings — please allow from site settings':'محظورة في إعدادات المتصفح — اسمح من إعدادات الموقع')
              : PUSH.enabled
              ? (isEn?'You will receive instant alerts for sessions, absences & rewards':'ستتلقى تنبيهات فورية للجلسات والغياب والمكافآت')
              : (isEn?'Enable to receive instant notifications on your device':'فعّل لتلقي إشعارات فورية على جهازك')}
          </div>
        </div>
        ${PUSH.permission !== 'denied' ? `
          <button class="btn ${PUSH.enabled?'btn-red':'btn-solid'} btn-sm"
                  onclick="togglePushNotifications(this)">
            ${PUSH.enabled?(isEn?'Disable':'تعطيل'):(isEn?'Enable':'تفعيل')}
          </button>` : ''}
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${[
          ['session', '📖', isEn?'New memorization sessions':'جلسات الحفظ الجديدة', true],
          ['absence', '⚠️', isEn?'Student absence alerts':'تنبيهات الغياب', true],
          ['reward',  '🏆', isEn?'Rewards and achievements':'المكافآت والإنجازات', true],
          ['report',  '📊', isEn?'Weekly reports':'التقارير الأسبوعية', false],
        ].map(([key,ic,lbl,def])=>`
          <div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:var(--surface);border-radius:8px;border:1px solid var(--border)">
            <span style="font-size:1.1rem">${ic}</span>
            <span style="flex:1;font-size:.82rem;font-weight:600">${lbl}</span>
            <div class="toggle ${def?'on':''}" onclick="this.classList.toggle('on')"></div>
          </div>`).join('')}
      </div>
      <div style="margin-top:10px;padding:10px;background:var(--surface2);border-radius:8px;font-size:.75rem;color:var(--text-muted);line-height:1.7">
        💡 ${isEn
          ? 'Notifications appear as browser alerts when the app is open, and as device notifications when closed (browser must support it).'
          : 'الإشعارات تظهر كتنبيهات في المتصفح عند فتح التطبيق، وعلى الجهاز عند إغلاقه (يجب أن يدعمها المتصفح).'}
      </div>
    </div>

    <div class="grid-2" style="margin-bottom:16px">
      <div class="card">
        <div class="card-title"><span class="ct-icon">⚙️</span> ${t('settings')}</div>
        ${systemToggles.map(([lbl,sub,v])=>`
          <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
            <div>
              <div style="font-size:.88rem;font-weight:600">${lbl}</div>
              <div style="font-size:.72rem;color:var(--text-muted)">${sub}</div>
            </div>
            <div class="toggle ${v?'on':''}" onclick="this.classList.toggle('on');showToast(currentLang==='en'?'Setting updated':'تم تحديث الإعداد')"></div>
          </div>
        `).join('')}
      </div>
      <div class="card">
        <div class="card-title"><span class="ct-icon">👤</span> ${isEn?'Account Settings':'بيانات الحساب'}</div>
        <div class="field"><label>${isEn?'Full Name':'الاسم الكامل'}</label><input value="${currentUser.name}"></div>
        <div class="field"><label>${isEn?'Email':'البريد الإلكتروني'}</label><input value="${currentUser.email}"></div>
        <div class="field"><label>${t('newPass')}</label><input type="password" placeholder="${isEn?'Leave blank to keep current':'اتركه فارغاً للإبقاء على الحالي'}"></div>
        <button class="btn btn-solid" onclick="saveAccountSettings()">💾 ${isEn?'Save Changes':'حفظ التعديلات'}</button>
      </div>
    </div>

    <!-- Data Management Card — LOCKED by default -->
    <div class="card" style="border:1px solid rgba(204,53,53,.2)" id="dataManagementCard">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">
        <div class="card-title" style="margin:0"><span class="ct-icon">🗃️</span> ${isEn?'Data Management':'إدارة البيانات'}</div>
        <div id="dmLockBadge" style="display:flex;align-items:center;gap:6px;padding:5px 12px;
             background:var(--red-bg);border:1px solid rgba(204,53,53,.3);border-radius:20px">
          <span style="font-size:.8rem">🔒</span>
          <span style="font-size:.75rem;font-weight:700;color:var(--red)">${isEn?'Password Protected':'محمي بكلمة المرور'}</span>
        </div>
      </div>
      <div id="dmLockScreen" style="margin-top:16px;padding:24px;text-align:center;
           background:var(--surface2);border-radius:12px;border:1px dashed var(--border)">
        <div style="font-size:2.5rem;margin-bottom:10px">🔐</div>
        <div style="font-size:.95rem;font-weight:800;margin-bottom:4px">${isEn?'This section is protected':'هذا القسم محمي'}</div>
        <div style="font-size:.78rem;color:var(--text-muted);margin-bottom:18px;line-height:1.7">
          ${isEn?'Data management is for admins only.<br>Enter the admin password to proceed.':'إدارة البيانات متاحة للمدير فقط.<br>أدخل كلمة مرور حساب المدير للمتابعة.'}
        </div>
        <div style="max-width:280px;margin:0 auto">
          <div style="position:relative;margin-bottom:10px">
            <input type="password" id="dmPassInput" placeholder="${isEn?'Admin password':'كلمة مرور المدير'}"
              style="width:100%;background:var(--surface);border:1.5px solid var(--border);
                     border-radius:10px;padding:11px 42px 11px 14px;color:var(--text);
                     font-family:'Tajawal',sans-serif;font-size:.9rem;outline:none;
                     transition:border-color .2s;text-align:center"
              onfocus="this.style.borderColor='var(--emerald-mid)'"
              onblur="this.style.borderColor='var(--border)'"
              onkeydown="if(event.key==='Enter')unlockDataManagement()">
            <button onclick="this.previousElementSibling.type=this.previousElementSibling.type==='password'?'text':'password'"
              style="position:absolute;left:10px;top:50%;transform:translateY(-50%);
                     background:none;border:none;cursor:pointer;font-size:.9rem;padding:0">👁</button>
          </div>
          <div id="dmPassErr" style="font-size:.72rem;color:var(--red);margin-bottom:10px;display:none">
            ⚠️ ${isEn?'Incorrect password':'كلمة المرور غير صحيحة'}
          </div>
          <button class="btn btn-solid" style="width:100%" onclick="unlockDataManagement()">
            🔓 ${isEn?'Unlock Section':'فتح القسم'}
          </button>
        </div>
      </div>
      <div id="dmContent" style="display:none;margin-top:16px">
        <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;
             background:var(--emerald-glow);border-radius:8px;margin-bottom:16px;
             border:1px solid var(--border)">
          <span>🔓</span>
          <span style="font-size:.78rem;color:var(--emerald-light);font-weight:600">
            ${isEn?'Section unlocked — expires on logout':'تم فتح القسم — الجلسة منتهية تلقائياً بعد الخروج'}
          </span>
          <button onclick="lockDataManagement()" style="margin-right:auto;background:none;
              border:none;cursor:pointer;font-size:.75rem;color:var(--text-muted)">🔒 ${isEn?'Lock':'إقفال'}</button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:20px">
          ${[
            [studentCount,'👥',isEn?'Students':'طالب'],
            [teacherCount,'📚',isEn?'Teachers':'معلم'],
            [circleCount,'🕌',isEn?'Halaqas':'حلقة'],
            [sessionCount,'📖',isEn?'Sessions':'جلسة'],
            [notifCount,'🔔',isEn?'Alerts':'إشعار'],
          ].map(([v,ic,l])=>`
            <div style="background:var(--surface2);border-radius:10px;padding:12px;text-align:center;border:1px solid var(--border)">
              <div style="font-size:1rem;margin-bottom:4px">${ic}</div>
              <div style="font-size:1.2rem;font-weight:900;color:var(--text)">${v}</div>
              <div style="font-size:.65rem;color:var(--text-muted);margin-top:2px">${l}</div>
            </div>`).join('')}
        </div>

        <!-- Selective reset options -->
        <div style="margin-bottom:16px">
          <div style="font-size:.82rem;font-weight:700;color:var(--text-muted);margin-bottom:10px">
            🗑 تفريغ بيانات محددة
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            ${[
              ['clearSessions', '📖 تفريغ الجلسات', 'حذف جميع جلسات الحفظ المسجلة', 'gold'],
              ['clearNotifications', '🔔 تفريغ الإشعارات', 'حذف جميع الإشعارات', 'gold'],
              ['clearStudentProgress', '📊 إعادة تقدم الطلاب', 'إعادة صفحات الحفظ للصفر', 'red'],
              ['clearStudents', '👥 حذف الطلاب', 'حذف جميع بيانات الطلاب', 'red'],
              ['clearTeachers', '📚 حذف المعلمين', 'حذف المعلمين المضافين', 'red'],
              ['clearCircles', '🕌 حذف الحلقات', 'حذف الحلقات المضافة', 'red'],
            ].map(([fn,label,desc,color])=>`
              <div style="background:var(--surface2);border-radius:10px;padding:12px;
                   border:1px solid var(--border);display:flex;align-items:center;gap:10px">
                <div style="flex:1;min-width:0">
                  <div style="font-size:.82rem;font-weight:700">${label}</div>
                  <div style="font-size:.68rem;color:var(--text-muted);margin-top:2px">${desc}</div>
                </div>
                <button class="btn btn-${color} btn-sm" style="flex-shrink:0;font-size:.72rem"
                  onclick="requireAdminPass('${fn}')">حذف</button>
              </div>`).join('')}
          </div>
        </div>

        <!-- Danger zone -->
        <div style="border-top:1px solid rgba(204,53,53,.2);padding-top:16px">
          <div style="font-size:.82rem;font-weight:700;color:var(--red);margin-bottom:10px">
            ⚠️ المنطقة الحمراء — لا يمكن التراجع
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div style="background:var(--red-bg);border:1px solid rgba(204,53,53,.25);
                 border-radius:12px;padding:16px">
              <div style="font-size:.88rem;font-weight:800;color:var(--red);margin-bottom:4px">
                🗑 تفريغ كامل المحتوى
              </div>
              <div style="font-size:.72rem;color:var(--text-muted);margin-bottom:12px;line-height:1.6">
                حذف جميع الطلاب والجلسات والحلقات والإشعارات مع الإبقاء على حسابات المستخدمين
              </div>
              <button class="btn btn-red" style="width:100%;font-weight:700"
                onclick="requireAdminPass('confirmClearAll')">
                🗑 تفريغ كل المحتوى
              </button>
            </div>
            <div style="background:var(--red-bg);border:1px solid rgba(204,53,53,.25);
                 border-radius:12px;padding:16px">
              <div style="font-size:.88rem;font-weight:800;color:var(--red);margin-bottom:4px">
                ♻️ إعادة ضبط المصنع
              </div>
              <div style="font-size:.72rem;color:var(--text-muted);margin-bottom:12px;line-height:1.6">
                إعادة جميع البيانات للوضع الافتراضي — يشمل البيانات التجريبية وجميع الإعدادات
              </div>
              <button class="btn btn-red" style="width:100%;font-weight:700"
                onclick="requireAdminPass('confirmFactoryReset')">
                ♻️ إعادة الضبط الكامل
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};

// ---- AUDIT LOG ----
pages['audit'] = function(el) {
  const isEn = currentLang === 'en';
  const logs = Array.isArray(DB.auditLog) ? DB.auditLog : [];
  el.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;gap:10px;flex-wrap:wrap">
      <div style="font-size:.85rem;color:var(--text-muted)">
        ${logs.length} ${isEn ? 'recorded actions' : 'عملية مسجلة'}
      </div>
      <button class="btn btn-green btn-sm" onclick="navigateTo('audit')">↻ ${isEn ? 'Refresh' : 'تحديث'}</button>
    </div>
    <div class="card">
      <div class="card-title"><span class="ct-icon">🧾</span> ${isEn ? 'Recent System Activity' : 'آخر العمليات على النظام'}</div>
      ${logs.length === 0 ? `
        <div style="text-align:center;padding:34px;color:var(--text-muted)">
          <div style="font-size:2rem;margin-bottom:8px">🧾</div>
          <div>${isEn ? 'No audit records yet' : 'لا توجد عمليات مسجلة بعد'}</div>
        </div>` : `
        <div class="table-wrap">
          <table>
            <thead><tr>
              <th>${isEn ? 'Time' : 'الوقت'}</th>
              <th>${isEn ? 'User' : 'المستخدم'}</th>
              <th>${isEn ? 'Action' : 'العملية'}</th>
              <th>${isEn ? 'Details' : 'التفاصيل'}</th>
            </tr></thead>
            <tbody>
              ${logs.slice(0,80).map(log => `
                <tr>
                  <td style="color:var(--text-muted);font-size:.76rem">${new Date(log.at).toLocaleString(isEn?'en-US':'ar-SA')}</td>
                  <td>${escapeHtml(log.userName || 'system')}</td>
                  <td><span class="badge gold">${escapeHtml(log.action)}</span></td>
                  <td style="color:var(--text-muted)">${escapeHtml(log.details || '')}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`}
    </div>
  `;
};

// ==============================
// DATA MANAGEMENT — LOCK / UNLOCK
// ==============================
window._dmUnlocked = false;

function showAdminPassError(input, errEl) {
  if (errEl) errEl.style.display = 'block';
  if (input) {
    input.value = '';
    input.focus();
    input.style.borderColor = 'var(--red)';
  }
  setTimeout(() => { if (input) input.style.borderColor = 'var(--border)'; }, 1500);
}

function verifyAdminPassword(pass) {
  const admin = currentUser && currentUser.role === 'admin'
    ? DB.users.find(u => u.id === currentUser.id)
    : null;
  if (!admin || !admin.pass) return Promise.resolve(false);
  return verifyPassword(pass, admin.pass);
}

window.unlockDataManagement = function() {
  const input = document.getElementById('dmPassInput');
  const errEl = document.getElementById('dmPassErr');
  const pass  = input?.value || '';

  verifyAdminPassword(pass).then(function(ok) {
    if (!ok) {
      showAdminPassError(input, errEl);
      return;
    }

    window._dmUnlocked = true;
    document.getElementById('dmLockScreen').style.display = 'none';
    document.getElementById('dmContent').style.display = 'block';
    document.getElementById('dmLockBadge').innerHTML =
      '<span style="font-size:.8rem">🔓</span><span style="font-size:.75rem;font-weight:700;color:var(--emerald-light)">مفتوح</span>';
    document.getElementById('dmLockBadge').style.background = 'var(--emerald-glow)';
    document.getElementById('dmLockBadge').style.borderColor = 'var(--emerald-mid)';
    showToast('🔓 تم فتح إدارة البيانات');
  });
};

window.lockDataManagement = function() {
  window._dmUnlocked = false;
  navigateTo('settings');
};

// ── Admin password re-verification before each action ──
window.requireAdminPass = function(actionKey) {
  const actionMeta = {
    clearSessions:        { icon:'📖', title:'تفريغ الجلسات' },
    clearNotifications:   { icon:'🔔', title:'تفريغ الإشعارات' },
    clearStudentProgress: { icon:'📊', title:'إعادة تقدم الطلاب' },
    clearStudents:        { icon:'👥', title:'حذف الطلاب' },
    clearTeachers:        { icon:'📚', title:'حذف المعلمين' },
    clearCircles:         { icon:'🕌', title:'حذف الحلقات' },
    confirmClearAll:      { icon:'🗑', title:'تفريغ كامل المحتوى' },
    confirmFactoryReset:  { icon:'♻️', title:'إعادة ضبط المصنع' },
  };
  const meta = actionMeta[actionKey] || { icon:'⚠️', title:actionKey };

  openModal('🔐 تأكيد هوية المدير', `
    <div style="text-align:center;padding:6px 0">
      <div style="font-size:2rem;margin-bottom:8px">${meta.icon}</div>
      <div style="font-weight:800;font-size:.95rem;margin-bottom:4px">${meta.title}</div>
      <div style="font-size:.78rem;color:var(--text-muted);margin-bottom:16px">
        أدخل كلمة مرور المدير لتأكيد تنفيذ هذه العملية
      </div>
      <div style="position:relative;max-width:240px;margin:0 auto 10px">
        <input type="password" id="actionPassInput" placeholder="كلمة المرور"
          style="width:100%;background:var(--surface2);border:1.5px solid var(--border);
                 border-radius:10px;padding:11px 40px 11px 14px;color:var(--text);
                 font-family:'Tajawal',sans-serif;font-size:.9rem;outline:none;text-align:center"
          onfocus="this.style.borderColor='var(--emerald-mid)'"
          onblur="this.style.borderColor='var(--border)'"
          onkeydown="if(event.key==='Enter')doActionWithPass('${actionKey}')">
        <button onclick="var i=this.previousElementSibling;i.type=i.type==='password'?'text':'password'"
          style="position:absolute;left:10px;top:50%;transform:translateY(-50%);
                 background:none;border:none;cursor:pointer;font-size:.85rem">👁</button>
      </div>
      <div id="actionPassErr" style="font-size:.72rem;color:var(--red);margin-bottom:10px;display:none">
        ⚠️ كلمة المرور غير صحيحة
      </div>
      <div style="display:flex;gap:8px;justify-content:center">
        <button class="btn btn-red" style="font-weight:700" onclick="doActionWithPass('${actionKey}')">
          🔓 تأكيد التنفيذ
        </button>
        <button class="btn btn-sm" style="background:var(--surface2)" onclick="closeModalDirect()">إلغاء</button>
      </div>
    </div>`);

  setTimeout(() => document.getElementById('actionPassInput')?.focus(), 100);
};

window.doActionWithPass = function(actionKey) {
  const input = document.getElementById('actionPassInput');
  const errEl = document.getElementById('actionPassErr');
  const pass  = input?.value || '';

  verifyAdminPassword(pass).then(function(ok) {
    if (!ok) {
      showAdminPassError(input, errEl);
      return;
    }

    closeModalDirect();
    window[actionKey]?.();
  });
};


window.saveAccountSettings = function() {
  const allInputs = document.querySelectorAll('#mainContent .card input');
  let newName='', newEmail='', newPass='';
  allInputs.forEach(inp => {
    if (inp.type === 'password')                        newPass  = inp.value.trim();
    else if (inp.type === 'email')                      newEmail = inp.value.trim();
    else if (inp.type === 'text' || !inp.type)          newName  = inp.value.trim();
  });

  if (!newName)  { showToast('⚠️ الاسم لا يمكن أن يكون فارغاً'); return; }
  if (!newEmail) { showToast('⚠️ البريد الإلكتروني لا يمكن أن يكون فارغاً'); return; }

  const conflict = DB.users.find(u => u.email === newEmail && u.id !== currentUser.id);
  if (conflict)  { showToast('⚠️ هذا البريد مستخدم بالفعل لحساب آخر'); return; }

  const user = DB.users.find(u => u.id === currentUser.id);
  if (!user) return;

  function finishSave() {
    user.name  = newName;
    user.email = newEmail;
    currentUser = user;

    const nameEl = document.getElementById('sidebarName');
    if (nameEl) nameEl.textContent = newName;

    saveDB();
    showToast('✅ تم حفظ التعديلات بنجاح' + (newPass ? ' — كلمة المرور تم تغييرها' : ''));
  }

  if (newPass) {
    hashPassword(newPass).then(function(hashedPass) {
      user.pass = hashedPass;
      finishSave();
    });
  } else {
    finishSave();
  }
};

// ── Actual action functions ──
window.clearSessions = function() {
  const count = DB.students.reduce((a,s)=>a+(s.sessions||[]).length,0);
  DB.students.forEach(s=>{s.sessions=[];s.lastSession='—';});
  saveDB();
  showToast('✅ تم تفريغ ' + count + ' جلسة مسجلة');
  navigateTo('settings');
};

window.clearNotifications = function() {
  DB.notifications = [];
  saveDB();
  showToast('✅ تم تفريغ جميع الإشعارات');
  navigateTo('settings');
};

window.clearStudentProgress = function() {
  DB.students.forEach(s=>{
    s.pages=0; s.sessions=[]; s.lastSession='—';
    s.juzProgress=Array(30).fill(0);
    s.currentAyah=1; s.memorized=[];
    s.currentSurah='الفاتحة';
  });
  saveDB();
  showToast('✅ تم إعادة تقدم الطلاب للصفر');
  navigateTo('settings');
};

window.clearStudents = function() {
  const count = DB.students.length;
  DB.students = [];
  DB.circles.forEach(c=>c.students=[]);
  saveDB();
  showToast('✅ تم حذف ' + count + ' طالب');
  navigateTo('settings');
};

window.clearTeachers = function() {
  const before = DB.users.filter(u=>u.role==='teacher').length;
  DB.users = DB.users.filter(u=>u.role!=='teacher' || u.id<=3);
  const after = DB.users.filter(u=>u.role==='teacher').length;
  saveDB();
  showToast('✅ تم حذف ' + (before-after) + ' معلم مضاف');
  navigateTo('settings');
};

window.clearCircles = function() {
  const before = DB.circles.length;
  DB.circles = DB.circles.filter(c=>c.id<=2);
  saveDB();
  showToast('✅ تم حذف ' + (before-DB.circles.length) + ' حلقة مضافة');
  navigateTo('settings');
};

window.confirmClearAll = function() {
  DB.students = [];
  DB.circles.forEach(c=>c.students=[]);
  DB.notifications = [];
  saveDB();
  showToast('✅ تم تفريغ جميع المحتوى بنجاح');
  navigateTo('settings');
};

window.confirmFactoryReset = function() {
  location.reload();
};


// ==============================
// SHARED NOTIFICATION MODAL
// ==============================
// recipients: array of {label, value}
// preselect: value to pre-select
window.openSendNotifModal = function(opts) {
  /*
  opts = {
    title,            // modal title
    recipients,       // [{label, value, icon}]
    types,            // [{label, value}]
    students,         // optional student list for "عن الطالب" field
    studentLabel,     // label for student selector (default 'الطالب')
    defaultMsg,       // optional default message
    onSend,           // function(data) called on send
  }
  */
  const recipientsHTML = opts.recipients.map(r => `
    <label style="display:flex;align-items:center;gap:10px;padding:9px 12px;
           border-radius:8px;border:1px solid var(--border);cursor:pointer;
           background:var(--surface2);transition:all .2s;margin-bottom:6px"
           onclick="this.classList.toggle('notif-rec-active');toggleNotifRecipient('${r.value}',this)">
      <div style="width:32px;height:32px;border-radius:50%;background:var(--emerald-glow);
           display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0">
        ${r.icon||'👤'}
      </div>
      <div style="flex:1">
        <div style="font-size:.85rem;font-weight:600">${r.label}</div>
        ${r.sub ? `<div style="font-size:.7rem;color:var(--text-muted)">${r.sub}</div>` : ''}
      </div>
      <div class="notif-check" style="width:18px;height:18px;border-radius:50%;border:2px solid var(--border);
           display:flex;align-items:center;justify-content:center;font-size:.65rem;transition:all .2s;flex-shrink:0"></div>
    </label>`).join('');

  const typesHTML = opts.types.map((t,i) => `
    <option value="${t.value}" ${i===0?'selected':''}>${t.label}</option>`).join('');

  const studentsHTML = opts.students?.length ? `
    <div class="field">
      <label>${opts.studentLabel||'الطالب'}</label>
      <select id="notifStudent" onchange="updateNotifPreview()">
        <option value="">— عام (ليس عن طالب محدد) —</option>
        ${opts.students.map(s=>`<option value="${s.id}">${s.name}</option>`).join('')}
      </select>
    </div>` : '';

  // Store opts globally for send
  window._notifOpts = opts;
  window._notifRecipients = new Set();

  openModal(opts.title || '📤 إرسال إشعار', `
    <!-- Recipients -->
    <div style="margin-bottom:16px">
      <div style="font-size:.82rem;font-weight:700;color:var(--gold-light);margin-bottom:8px">
        📬 المستلمون <span style="font-size:.7rem;color:var(--text-muted)">(يمكن اختيار أكثر من جهة)</span>
      </div>
      ${recipientsHTML}
      <div id="noRecipientErr" style="display:none;font-size:.75rem;color:var(--red);margin-top:4px">
        ⚠️ يرجى اختيار مستلم واحد على الأقل
      </div>
    </div>

    <!-- Student selector -->
    ${studentsHTML}

    <!-- Type -->
    <div class="field">
      <label>نوع الإشعار</label>
      <select id="notifType" onchange="updateNotifPreview()">
        ${typesHTML}
      </select>
    </div>

    <!-- Message -->
    <div class="field">
      <label>نص الرسالة</label>
      <textarea id="notifMsg" rows="3" placeholder="اكتب نص الإشعار..."
        style="width:100%;background:var(--surface2);border:1px solid var(--border);
               border-radius:8px;padding:10px 14px;color:var(--text);
               font-family:'Tajawal',sans-serif;font-size:.9rem;
               resize:vertical;outline:none;transition:border-color .2s;line-height:1.6"
        onfocus="this.style.borderColor='var(--emerald-mid)'"
        onblur="this.style.borderColor=''"
        oninput="updateNotifPreview()">${opts.defaultMsg||''}</textarea>
    </div>

    <!-- Preview -->
    <div id="notifPreview" style="background:var(--surface2);border-radius:10px;
         padding:12px 14px;margin-bottom:14px;display:none;
         border-right:3px solid var(--emerald-mid)">
      <div style="font-size:.72rem;color:var(--text-muted);margin-bottom:4px">معاينة الإشعار:</div>
      <div id="notifPreviewText" style="font-size:.82rem;line-height:1.7"></div>
    </div>

    <!-- Priority -->
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
      <div style="font-size:.82rem;color:var(--text-muted)">الأولوية:</div>
      <div style="display:flex;gap:6px">
        ${[['عادي','normal','green'],['مهم','important','gold'],['عاجل','urgent','red']].map(([l,v,c])=>`
          <label style="display:flex;align-items:center;gap:5px;cursor:pointer;font-size:.78rem">
            <input type="radio" name="notifPriority" value="${v}" ${v==='normal'?'checked':''}>
            <span class="badge ${c}" style="font-size:.68rem">${l}</span>
          </label>`).join('')}
      </div>
    </div>

    <div style="display:flex;gap:8px">
      <button class="btn btn-solid" style="flex:1" onclick="submitSendNotif()">📤 إرسال الإشعار</button>
      <button class="btn btn-red btn-sm" onclick="closeModalDirect()">إلغاء</button>
    </div>
  `);
};

window.toggleNotifRecipient = function(val, label) {
  const check = label.querySelector('.notif-check');
  if (window._notifRecipients.has(val)) {
    window._notifRecipients.delete(val);
    label.style.background = 'var(--surface2)';
    label.style.borderColor = 'var(--border)';
    if (check) { check.style.background=''; check.style.borderColor='var(--border)'; check.textContent=''; }
  } else {
    window._notifRecipients.add(val);
    label.style.background = 'var(--emerald-glow)';
    label.style.borderColor = 'var(--emerald-mid)';
    if (check) { check.style.background='var(--emerald-mid)'; check.style.borderColor='var(--emerald-mid)'; check.textContent='✓'; check.style.color='#fff'; }
  }
  document.getElementById('noRecipientErr').style.display = 'none';
  updateNotifPreview();
};

window.updateNotifPreview = function() {
  const msg     = document.getElementById('notifMsg')?.value?.trim();
  const type    = document.getElementById('notifType')?.options[document.getElementById('notifType')?.selectedIndex]?.text;
  const preview = document.getElementById('notifPreview');
  const previewText = document.getElementById('notifPreviewText');
  const recs    = [...(window._notifRecipients||[])];
  if (!msg || recs.length === 0) { if(preview) preview.style.display='none'; return; }
  if (preview) preview.style.display='block';
  const opts = window._notifOpts;
  const recLabels = recs.map(v => opts?.recipients?.find(r=>r.value===v)?.label || v).join('، ');
  if (previewText) previewText.innerHTML = `<strong>إلى:</strong> ${recLabels}<br><strong>النوع:</strong> ${type||''}<br><strong>الرسالة:</strong> ${msg}`;
};

window.submitSendNotif = function() {
  const recs = [...(window._notifRecipients||[])];
  const msg  = document.getElementById('notifMsg')?.value?.trim();
  const type = document.getElementById('notifType')?.value;
  const priority = document.querySelector('input[name="notifPriority"]:checked')?.value||'normal';
  const sid  = document.getElementById('notifStudent')?.value;

  if (recs.length === 0) {
    document.getElementById('noRecipientErr').style.display='block';
    return;
  }
  if (!msg) { showToast('⚠️ يرجى كتابة نص الإشعار'); return; }

  const opts = window._notifOpts;
  if (opts?.onSend) {
    opts.onSend({ recipients: recs, msg, type, priority, studentId: sid });
  } else {
    const opts2 = window._notifOpts;
    const recLabels = recs.map(v => opts2?.recipients?.find(r=>r.value===v)?.label || v).join(' و');
    const pIcon = priority==='urgent'?'🚨':priority==='important'?'⚠️':'📤';
    showToast(pIcon + ' تم إرسال الإشعار إلى: ' + recLabels);
    // Add to notifications log
    DB.notifications.unshift({id: Date.now(), type: priority==='urgent'?'alert':priority==='important'?'warn':'info', msg, time:'الآن'});
    saveDB();
    closeModalDirect();
  }
};


// ==============================
// ==============================
// STUDENT PDF EXPORT
// ==============================
window.exportStudentPDF = function(id) {
  const s       = DB.students.find(st => st.id === id);
  if (!s) { showToast('⚠️ الطالب غير موجود'); return; }
  const teacher = DB.users.find(u => u.id === s.teacher);
  const pct     = Math.round(s.pages / s.totalPages * 100);
  const totalNew  = (s.sessions||[]).reduce((a,ses)=>a+ses.new, 0);
  const weeklyAyah  = s.plan.dailyAyah * (7 - s.plan.reviewDays);
  const weeklyPages = Math.round(weeklyAyah / 15 * 10) / 10;
  const daysLeft    = s.pages < s.totalPages ? Math.ceil((s.totalPages - s.pages) / (s.plan.dailyAyah / 15)) : 0;
  const monthsLeft  = Math.ceil(daysLeft / 30);
  const timeLabel   = daysLeft === 0 ? 'مكتمل ✅' : monthsLeft > 12 ? Math.ceil(monthsLeft/12)+' سنة تقريباً' : monthsLeft+' شهر تقريباً';
  const today       = new Date().toLocaleDateString('ar-SA', {year:'numeric',month:'long',day:'numeric'});
  const isEn        = currentLang === 'en';

  // Juz grid
  const juz = s.juzProgress || Array(30).fill(0);
  const juzGrid = juz.map((pages, i) => {
    const bg  = pages >= 20 ? '#536f5a' : pages > 0 ? '#836128' : '#e8e2d8';
    const col = pages >= 20 || pages > 0 ? '#fff' : '#aaa';
    return `<div style="width:30px;height:30px;border-radius:5px;background:${bg};color:${col};
               display:inline-flex;align-items:center;justify-content:center;
               font-size:9.5px;font-weight:800;margin:2px;box-shadow:0 1px 3px rgba(0,0,0,.1)">${i+1}</div>`;
  }).join('');

  // Sessions rows
  const sessionRows = (s.sessions||[]).slice(0,10).map((ses,idx) => `
    <tr style="background:${idx%2===0?'#fbf6ed':'#fff'}">
      <td style="padding:6px 10px;border-bottom:1px solid #eadfce;font-size:11.5px">${ses.date}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #eadfce;font-size:11.5px;color:#536f5a;font-weight:800">+${ses.new}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #eadfce;font-size:11.5px;color:#3d6975">${ses.review}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #eadfce;font-size:11.5px;color:#836128">${ses.surah||'—'}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #eadfce;font-size:11.5px">
        <span style="background:${ses.grade==='ممتاز'||ses.grade==='Excellent'?'#eef3eb':ses.grade==='ضعيف'||ses.grade==='Fail'?'#feeaea':'#fbf2dd'};
               color:${ses.grade==='ممتاز'||ses.grade==='Excellent'?'#536f5a':ses.grade==='ضعيف'||ses.grade==='Fail'?'#a7352a':'#836128'};
               border-radius:10px;padding:2px 8px;font-size:10px;font-weight:700">${ses.grade}</span>
      </td>
      <td style="padding:6px 10px;border-bottom:1px solid #eadfce;font-size:11px;color:#888">${ses.notes||'—'}</td>
    </tr>`).join('');

  // Progress bar SVG
  const barW = Math.round(pct * 3.8);

  const instituteName = INSTITUTE?.name || 'مركز تحفيظ القرآن الكريم';
  const instituteCity = INSTITUTE?.city || '';

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<title>${isEn?'Student Report':'تقرير الطالب'} — ${s.name}</title>
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;600;700;900&family=Amiri:wght@400;700&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Tajawal',sans-serif;background:#fff;color:#1a1a1a;direction:rtl;padding:28px 32px}
  @page{size:A4;margin:15mm}
  @media print{body{padding:0}.no-print{display:none!important}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}}

  .header{background:linear-gradient(135deg,#2d160f,#6e3f28);border-radius:14px;padding:22px 26px;margin-bottom:18px;color:#fff;display:flex;align-items:center;gap:16px;position:relative;overflow:hidden}
  .header::after{content:'';position:absolute;left:-40px;bottom:-40px;width:140px;height:140px;border-radius:50%;background:rgba(255,255,255,.07)}
  .avatar{width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,.2);border:3px solid rgba(255,255,255,.4);display:flex;align-items:center;justify-content:center;font-size:1.7rem;font-weight:900;flex-shrink:0}
  .hinfo h1{font-size:1.35rem;font-weight:900;margin-bottom:3px}
  .hinfo p{font-size:.76rem;opacity:.88;line-height:1.7}
  .hpct{margin-right:auto;text-align:center;background:rgba(255,255,255,.15);border-radius:12px;padding:10px 18px;border:1px solid rgba(255,255,255,.25)}
  .hpct .pv{font-size:2.2rem;font-weight:900;line-height:1}
  .hpct .pl{font-size:.64rem;opacity:.82;margin-top:3px}

  .inst-header{text-align:center;margin-bottom:14px;padding-bottom:10px;border-bottom:2px solid #6e3f28}
  .inst-name{font-family:'Amiri',serif;font-size:1.15rem;color:#2d160f;font-weight:700}
  .inst-sub{font-size:.72rem;color:#888;margin-top:3px}

  .sec{margin-bottom:16px}
  .sec-title{font-size:.88rem;font-weight:800;color:#2d160f;margin-bottom:9px;padding-bottom:5px;border-bottom:2px solid #eadfce;display:flex;align-items:center;gap:6px}

  .grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .stat{background:#fbf6ed;border-radius:10px;padding:10px;text-align:center;border:1px solid #eadfce}
  .sv{font-size:1.4rem;font-weight:900;color:#6e3f28}
  .sl{font-size:.63rem;color:#666;margin-top:2px}

  .plan-card{background:#fffbf0;border:1px solid #e8d89a;border-radius:10px;padding:11px 13px;display:flex;align-items:center;gap:10px}
  .pi{width:36px;height:36px;border-radius:9px;background:#fff3cc;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0}
  .pn{font-size:1.35rem;font-weight:900;color:#836128}
  .plab{font-size:.76rem;font-weight:700;color:#333}
  .pdesc{font-size:.67rem;color:#888}

  .bar-track{height:9px;background:#e0e0e0;border-radius:5px;overflow:hidden;margin:6px 0}
  .bar-fill{height:100%;background:linear-gradient(90deg,#2d160f,#b79758);border-radius:5px}

  table{width:100%;border-collapse:collapse}
  thead th{background:#2d160f;color:#fff;padding:7px 10px;font-size:11.5px;font-weight:700;text-align:right}
  tfoot td{background:#fbf6ed;font-weight:700;font-size:11px;padding:6px 10px;color:#2d160f}

  .chip{display:inline-block;background:#fbf2dd;color:#2d160f;border:1px solid #d8c69f;border-radius:14px;padding:3px 11px;font-size:.72rem;font-weight:600;margin:2px}
  .note{background:#fff8e6;border:1px solid #e8d89a;border-radius:8px;padding:9px 12px;font-size:.77rem;color:#7a5800;margin-top:8px;line-height:1.7}
  .warn{background:#fff0f0;border:1px solid #f5b8b8;border-radius:8px;padding:9px 12px;font-size:.77rem;color:#8a1818;margin-top:8px;line-height:1.7}

  .footer{margin-top:20px;padding-top:10px;border-top:1px solid #e0e0e0;display:flex;justify-content:space-between;align-items:center;font-size:.68rem;color:#aaa}
  .seal{width:42px;height:42px;border-radius:50%;border:2px solid #6e3f28;display:flex;align-items:center;justify-content:center;font-size:1.2rem}

  .print-btn{position:fixed;bottom:22px;left:50%;transform:translateX(-50%);background:#2d160f;color:#fff;border:none;border-radius:12px;padding:13px 28px;font-family:'Tajawal',sans-serif;font-size:1rem;font-weight:800;cursor:pointer;box-shadow:0 6px 20px rgba(45,22,15,.22);transition:all .2s;z-index:999;display:flex;align-items:center;gap:8px}
  .print-btn:hover{opacity:.92;transform:translateX(-50%) translateY(-2px)}
</style>
</head>
<body>

<button class="print-btn no-print" onclick="window.print()">
  🖨️ ${isEn?'Print / Save as PDF':'طباعة / حفظ كـ PDF'}
</button>

<!-- معلومات المؤسسة -->
<div class="inst-header">
  <div class="inst-name">☪️ ${instituteName}</div>
  <div class="inst-sub">${isEn?'Student Report':'ملف الطالب الشهري'} &nbsp;·&nbsp; ${today} ${instituteCity?'&nbsp;·&nbsp;📍'+instituteCity:''}</div>
</div>

<!-- Header -->
<div class="header">
  <div class="avatar">${s.photo?`<img src="${s.photo}" style="width:64px;height:64px;border-radius:50%;object-fit:cover">`:s.name.charAt(0)}</div>
  <div class="hinfo">
    <h1>${s.name}</h1>
    <p>📚 ${s.circle} &nbsp;·&nbsp; 👨‍🏫 ${teacher?.name||'—'} &nbsp;·&nbsp; 🎂 ${s.age} ${isEn?'yrs':'سنة'}</p>
    <p style="margin-top:5px">
      <span style="background:rgba(255,255,255,.2);border-radius:8px;padding:2px 10px;font-size:.7rem;font-weight:700">${s.level}</span>
      ${s.weak?'<span style="background:rgba(255,100,100,.3);border-radius:8px;padding:2px 10px;font-size:.7rem;margin-right:6px">⚠️ يحتاج دعم</span>':''}
    </p>
    <p style="margin-top:6px;font-size:.72rem;opacity:.8">${isEn?'Current:':'الموضع الحالي:'} ${s.currentSurah} · ${isEn?'v.':'آية'} ${s.currentAyah}</p>
  </div>
  <div class="hpct">
    <div class="pv">${pct}%</div>
    <div class="pl">${isEn?'of Quran':'من القرآن'}</div>
    <div style="margin-top:8px;height:5px;background:rgba(255,255,255,.2);border-radius:3px;overflow:hidden;width:80px">
      <div style="height:100%;width:${pct}%;background:#fff;border-radius:3px"></div>
    </div>
    <div style="font-size:.6rem;opacity:.7;margin-top:4px">${s.pages} / ${s.totalPages} ${isEn?'pages':'صفحة'}</div>
  </div>
</div>

<!-- الإحصائيات -->
<div class="sec">
  <div class="sec-title">📊 ${isEn?'General Statistics':'الإحصائيات العامة'}</div>
  <div class="grid4">
    <div class="stat"><div class="sv">${s.pages}</div><div class="sl">${isEn?'Pages memorized':'صفحة محفوظة'}</div></div>
    <div class="stat"><div class="sv" style="color:${s.attendance>=90?'#536f5a':s.attendance>=75?'#836128':'#a7352a'}">${s.attendance}%</div><div class="sl">${isEn?'Attendance':'نسبة الحضور'}</div></div>
    <div class="stat"><div class="sv">${totalNew}</div><div class="sl">${isEn?'Total verses':'آية محفوظة إجمالاً'}</div></div>
    <div class="stat"><div class="sv">${(s.sessions||[]).length}</div><div class="sl">${isEn?'Sessions':'جلسة مسجلة'}</div></div>
  </div>
</div>

<!-- خطة الحفظ -->
<div class="sec">
  <div class="sec-title">📝 ${isEn?'Memorization Plan':'خطة الحفظ'}</div>
  <div class="grid2">
    <div class="plan-card"><div class="pi">📖</div><div><div class="pn">${s.plan.dailyAyah}</div><div class="plab">${isEn?'New verses/day':'آيات جديدة يومياً'}</div><div class="pdesc">~${Math.round(s.plan.dailyAyah/15*10)/10} ${isEn?'pg/day':'صفحة/يوم'}</div></div></div>
    <div class="plan-card"><div class="pi">🔁</div><div><div class="pn">${s.plan.reviewDays}</div><div class="plab">${isEn?'Review days/week':'أيام مراجعة/أسبوع'}</div><div class="pdesc">${7-s.plan.reviewDays} ${isEn?'new memorization days':'أيام حفظ جديد'}</div></div></div>
    <div class="plan-card"><div class="pi">🎯</div><div><div class="plab">${isEn?'Weekly goal':'الهدف الأسبوعي'}</div><div style="font-size:1rem;font-weight:800;color:#836128;margin:2px 0">${s.plan.weeklyGoal}</div><div class="pdesc">~${weeklyAyah} ${isEn?'verses':'آية'} · ${weeklyPages} ${isEn?'pages':'صفحة'}</div></div></div>
    <div class="plan-card"><div class="pi">⏳</div><div><div class="plab">${isEn?'Est. completion':'الوقت المتوقع للختم'}</div><div style="font-size:1rem;font-weight:800;color:#92512c;margin:2px 0">${timeLabel}</div><div class="pdesc">${daysLeft>0?daysLeft+(isEn?' days left':' يوم متبقٍّ'):(isEn?'Completed':'مكتمل')}</div></div></div>
  </div>
  <div style="background:#fbf6ed;border-radius:8px;padding:10px 14px;border:1px solid #eadfce;margin-top:8px">
    <div style="display:flex;justify-content:space-between;font-size:.76rem;font-weight:700;margin-bottom:5px">
      <span>${isEn?'Weekly progress estimate':'التقدم الأسبوعي المتوقع'}</span>
      <span style="color:#536f5a">${weeklyAyah} ${isEn?'verses':'آية'} · ${weeklyPages} ${isEn?'pg/wk':'صفحة/أسبوع'}</span>
    </div>
    <div class="bar-track"><div class="bar-fill" style="width:${Math.min(100,Math.round(weeklyPages/20*100))}%"></div></div>
    <div style="display:flex;justify-content:space-between;font-size:.63rem;color:#999">
      <span>${isEn?'Based on':'بناءً على'} ${s.plan.dailyAyah} ${isEn?'verses ×':'آيات ×'} ${7-s.plan.reviewDays} ${isEn?'days':'أيام'}</span>
      <span>${isEn?'of 20 pg/wk':'من ٢٠ صفحة/أسبوع'}</span>
    </div>
  </div>
  ${s.weak?`<div class="warn">⚠️ ${isEn?'Note: Plan lightened based on current level — intensive follow-up recommended':'ملاحظة: تم تخفيف الخطة بناءً على المستوى — يُنصح بمتابعة مكثفة'}</div>`:''}
</div>

<!-- خريطة الأجزاء -->
<div class="sec">
  <div class="sec-title">🗺️ ${isEn?'30-Juz Progress Map':'خريطة تقدم الحفظ — الأجزاء الثلاثون'}</div>
  <div style="background:#f8faf8;border-radius:10px;padding:12px;border:1px solid #dde8dd">
    <div style="display:flex;flex-wrap:wrap;gap:2px">${juzGrid}</div>
    <div style="display:flex;gap:14px;font-size:.7rem;color:#666;margin-top:8px">
      <span>🟩 ${isEn?'Complete':'مكتمل'}</span>
      <span>🟨 ${isEn?'Partial':'جزئي'}</span>
      <span>⬜ ${isEn?'Not started':'لم يبدأ'}</span>
    </div>
  </div>
</div>

<!-- الجلسات -->
${(s.sessions||[]).length > 0 ? `
<div class="sec">
  <div class="sec-title">🗓️ ${isEn?'Session Log':'سجل الجلسات'} (${isEn?'last':'آخر'} ${Math.min(10,(s.sessions||[]).length)})</div>
  <table>
    <thead><tr>
      <th>${isEn?'Date':'التاريخ'}</th>
      <th>${isEn?'New':'جديد'}</th>
      <th>${isEn?'Review':'مراجعة'}</th>
      <th>${isEn?'Surah':'السورة'}</th>
      <th>${isEn?'Grade':'التقييم'}</th>
      <th>${isEn?'Notes':'ملاحظات'}</th>
    </tr></thead>
    <tbody>${sessionRows}</tbody>
    <tfoot><tr>
      <td colspan="2">${isEn?'Total new verses:':'إجمالي الآيات الجديدة:'}</td>
      <td colspan="4" style="color:#536f5a">${totalNew} ${isEn?'verses':'آية'} — ${(s.sessions||[]).length} ${isEn?'sessions':'جلسة'}</td>
    </tr></tfoot>
  </table>
</div>` : ''}

<!-- السور المحفوظة -->
${(s.memorized||[]).length > 0 ? `
<div class="sec">
  <div class="sec-title">📚 ${isEn?'Memorized Surahs':'السور المحفوظة'} (${s.memorized.length})</div>
  <div>${s.memorized.map(sur=>`<span class="chip">${sur}</span>`).join('')}</div>
</div>` : ''}

<!-- ملاحظات -->
<div class="sec">
  <div class="sec-title">💬 ${isEn?"Teacher's Notes":'ملاحظات المعلم'}</div>
  <div class="note">
    ${isEn
      ? `${s.name} is ${s.level==='ضعيف'?'a student who needs extra support and encouragement':'a dedicated student showing continuous improvement'}. Daily home revision is recommended.`
      : `الطالب ${s.name} ${s.level==='ضعيف'?'يحتاج إلى دعم إضافي وتشجيع مستمر':'يُبدي اجتهاداً وتحسناً مستمراً'}. يُنصح بالمراجعة اليومية في المنزل وتلاوة ما حُفظ في الصلوات.`}
  </div>
</div>

<!-- Footer -->
<div class="footer">
  <div style="display:flex;align-items:center;gap:8px">
    <div class="seal">☪️</div>
    <div>
      <div style="font-weight:700;color:#0a3320;font-size:.75rem">${instituteName}</div>
      <div>${instituteCity}</div>
    </div>
  </div>
  <div style="text-align:center">
    <div>${isEn?'Student Report':'تقرير الطالب'}: ${s.name}</div>
    <div>${today}</div>
  </div>
  <div style="text-align:left;font-size:.65rem">
    <div>${isEn?'Generated by':'أُنشئ بواسطة'}</div>
    <div style="color:#6e3f28;font-weight:700">نظام تحفيظ القرآن</div>
  </div>
</div>

<script>
  // طباعة تلقائية بعد تحميل الخطوط
  window.onload = function() {
    setTimeout(function() {
      document.querySelector('.print-btn').style.display = 'flex';
    }, 500);
  };
<\/script>
<div id="sidebarOverlay" onclick="closeSidebar()" ontouchstart="closeSidebar()" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.5);z-index:9999;cursor:pointer;-webkit-tap-highlight-color:transparent;"></div>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=920,height=750,scrollbars=yes');
  if (!win) { showToast('⚠️ '+(currentLang==='en'?'Allow pop-ups to export PDF':'اسمح بالنوافذ المنبثقة لتصدير PDF')); return; }
  win.document.write(html);
  win.document.close();
  win.focus();
  showToast('📄 '+(currentLang==='en'?'Report opened — press Print to save as PDF':'تم فتح التقرير — اضغط طباعة لحفظه كـ PDF'));
};

// ==============================
// 📈 ANALYTICS PAGE
// ==============================
pages['analytics'] = function(el) {
  const isEn = currentLang === 'en';
  const students = DB.students;
  const totalPages = students.reduce((a,s)=>a+s.pages,0);
  const avgAtt = students.length ? Math.round(students.reduce((a,s)=>a+s.attendance,0)/students.length) : 0;
  const totalSessions = students.reduce((a,s)=>a+(s.sessions||[]).length,0);
  const topStudents = [...students].sort((a,b)=>b.pages-a.pages).slice(0,5);
  const weakStudents = students.filter(s=>s.weak);
  const levelDist = {متفوق:0,جيد:0,متوسط:0,ضعيف:0};
  students.forEach(s=>{ if(levelDist[s.level]!==undefined) levelDist[s.level]++; });
  const circleStats = DB.circles.map(c=>{
    const sts = students.filter(s=>s.circle===c.name);
    const avgPct = sts.length ? Math.round(sts.reduce((a,s)=>a+(s.pages/s.totalPages*100),0)/sts.length) : 0;
    const avgAt  = sts.length ? Math.round(sts.reduce((a,s)=>a+s.attendance,0)/sts.length) : 0;
    return {...c, count:sts.length, avgPct, avgAt};
  });

  // Monthly sessions data (last 6 months)
  const now = new Date();
  const monthlyData = Array(6).fill(0).map((_,i)=>{
    const d = new Date(now); d.setMonth(d.getMonth()-5+i);
    const m = d.toISOString().slice(0,7);
    const count = students.flatMap(s=>s.sessions||[]).filter(ses=>ses.date&&ses.date.startsWith(m)).length;
    return { label: d.toLocaleDateString(isEn?'en-US':'ar-SA',{month:'short'}), count };
  });
  const maxM = Math.max(...monthlyData.map(m=>m.count),1);

  el.innerHTML = `
    <!-- KPI Row -->
    <div class="grid-4" style="margin-bottom:20px">
      ${[
        ['📊', isEn?'Total Pages':'إجمالي الصفحات', totalPages, 'green', isEn?'memorized':'محفوظة'],
        ['✅', isEn?'Avg Attendance':'متوسط الحضور', avgAtt+'%', avgAtt>=85?'green':avgAtt>=70?'gold':'red', ''],
        ['🗓️', isEn?'Total Sessions':'إجمالي الجلسات', totalSessions, 'blue', ''],
        ['⚠️', isEn?'Need Support':'يحتاجون دعماً', weakStudents.length, weakStudents.length>0?'red':'green', isEn?'students':'طلاب'],
      ].map(([icon,lbl,val,c,sub])=>`
        <div class="stat-box">
          <div class="stat-icon ${c}">${icon}</div>
          <div><div class="stat-val">${val}</div><div class="stat-lbl">${lbl}</div>${sub?`<div class="stat-change">${sub}</div>`:''}</div>
        </div>`).join('')}
    </div>

    <div class="grid-2" style="margin-bottom:20px">
      <!-- Monthly sessions chart -->
      <div class="card">
        <div class="card-title"><span class="ct-icon">📅</span> ${isEn?'Monthly Sessions (6 months)':'الجلسات الشهرية (٦ أشهر)'}</div>
        <div class="chart-bars" id="monthlyChart" style="height:120px"></div>
        <div class="chart-labels">
          ${monthlyData.map(m=>`<div class="chart-label">${m.label}</div>`).join('')}
        </div>
      </div>

      <!-- Level distribution -->
      <div class="card">
        <div class="card-title"><span class="ct-icon">🎯</span> ${isEn?'Level Distribution':'توزيع المستويات'}</div>
        ${students.length===0?`<div style="text-align:center;padding:40px;color:var(--text-muted)">${t('noStudents')}</div>`:`
        <div style="display:flex;flex-direction:column;gap:10px;margin-top:8px">
          ${[['متفوق','green',isEn?'Advanced':'متفوق'],['جيد','blue',isEn?'Good':'جيد'],['متوسط','gold',isEn?'Average':'متوسط'],['ضعيف','red',isEn?'Weak':'ضعيف']].map(([key,c,lbl])=>{
            const cnt = levelDist[key]||0;
            const pct = students.length ? Math.round(cnt/students.length*100) : 0;
            return `<div>
              <div style="display:flex;justify-content:space-between;font-size:.78rem;margin-bottom:4px">
                <span style="font-weight:600">${lbl}</span>
                <span style="color:var(--text-muted)">${cnt} ${isEn?'students':'طالب'} · ${pct}%</span>
              </div>
              <div class="progress-bar"><div class="progress-fill ${c==='red'?'red':''}" style="width:${pct}%;background:var(--${c==='green'?'emerald':c==='blue'?'blue':c==='gold'?'gold-light':'red'})"></div></div>
            </div>`;
          }).join('')}
        </div>`}
      </div>
    </div>

    <!-- Circles comparison -->
    <div class="card" style="margin-bottom:20px">
      <div class="card-title"><span class="ct-icon">🕌</span> ${isEn?'Circles Comparison':'مقارنة الحلقات'}</div>
      ${circleStats.length===0?`<div style="text-align:center;padding:30px;color:var(--text-muted)">${t('noCircles')}</div>`:`
      <div class="table-wrap"><table>
        <thead><tr>
          <th>${isEn?'Halaqa':'الحلقة'}</th>
          <th>${isEn?'Students':'الطلاب'}</th>
          <th>${isEn?'Avg Progress':'متوسط التقدم'}</th>
          <th>${isEn?'Avg Attendance':'متوسط الحضور'}</th>
          <th>${isEn?'Status':'الحالة'}</th>
        </tr></thead>
        <tbody>
          ${circleStats.map(c=>`<tr>
            <td style="font-weight:700">${c.name}</td>
            <td>${c.count}</td>
            <td>
              <div style="display:flex;align-items:center;gap:8px">
                <div class="progress-bar" style="flex:1;min-width:80px"><div class="progress-fill" style="width:${c.avgPct}%"></div></div>
                <span style="font-size:.8rem;color:var(--emerald-light);font-weight:700">${c.avgPct}%</span>
              </div>
            </td>
            <td><span style="color:${c.avgAt>=85?'var(--emerald-light)':c.avgAt>=70?'var(--gold-light)':'var(--red)'};font-weight:700">${c.avgAt}%</span></td>
            <td><span class="badge ${c.avgPct>=50?'green':c.avgPct>=25?'gold':'red'}">${c.avgPct>=50?(isEn?'Good':'ممتاز'):c.avgPct>=25?(isEn?'Average':'متوسط'):(isEn?'Needs Attention':'يحتاج متابعة')}</span></td>
          </tr>`).join('')}
        </tbody>
      </table></div>`}
    </div>

    <!-- Top students -->
    <div class="card">
      <div class="card-title"><span class="ct-icon">🥇</span> ${isEn?'Top Students':'أفضل الطلاب تقدماً'}</div>
      ${topStudents.length===0?`<div style="text-align:center;padding:30px;color:var(--text-muted)">${t('noStudents')}</div>`:`
      <div style="display:flex;flex-direction:column;gap:10px">
        ${topStudents.map((s,i)=>{
          const medals=['🥇','🥈','🥉','4️⃣','5️⃣'];
          const pct=Math.round(s.pages/s.totalPages*100);
          return `<div style="display:flex;align-items:center;gap:12px;padding:10px;background:var(--surface2);border-radius:10px">
            <div style="font-size:1.4rem;flex-shrink:0">${medals[i]}</div>
            <div style="flex:1">
              <div style="font-weight:700;font-size:.9rem">${s.name}</div>
              <div style="font-size:.72rem;color:var(--text-muted)">${s.circle} · ${s.pages} ${isEn?'pages':'صفحة'}</div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
              ${levelBadge(s.level)}
              <span style="font-size:.78rem;font-weight:800;color:var(--emerald-light)">${pct}%</span>
            </div>
          </div>`;
        }).join('')}
      </div>`}
    </div>
  `;

  // Monthly chart
  const mc = document.getElementById('monthlyChart');
  if (mc) {
    monthlyData.forEach((m,i)=>{
      const b=document.createElement('div'); b.className='chart-bar';
      b.setAttribute('data-val', m.count+(isEn?' sessions':' جلسة'));
      setTimeout(()=>{ b.style.height=(m.count/maxM*100)+'%'; },100+i*80);
      mc.appendChild(b);
    });
  }
};

// ==============================
// 🏆 REWARDS PAGE
// ==============================
const BADGES = [
  {id:'first_page',  icon:'📄', label:'أول صفحة',       labelEn:'First Page',       cond:s=>s.pages>=1,       color:'#3d6975'},
  {id:'ten_pages',   icon:'📚', label:'عشر صفحات',       labelEn:'10 Pages',         cond:s=>s.pages>=10,      color:'#536f5a'},
  {id:'juz_complete',icon:'⭐', label:'جزء كامل',        labelEn:'Full Juz',         cond:s=>(s.juzProgress||[]).some(v=>v>=20), color:'#836128'},
  {id:'five_juz',    icon:'🌟', label:'خمسة أجزاء',      labelEn:'5 Juz',            cond:s=>(s.juzProgress||[]).filter(v=>v>=20).length>=5, color:'#92512c'},
  {id:'half_quran',  icon:'🔆', label:'نصف القرآن',      labelEn:'Half Quran',       cond:s=>s.pages>=302,     color:'#6e3f28'},
  {id:'full_attend', icon:'✅', label:'حضور مثالي',      labelEn:'Perfect Attendance',cond:s=>s.attendance>=95,color:'#536f5a'},
  {id:'ten_sessions',icon:'🗓️', label:'١٠ جلسات',        labelEn:'10 Sessions',      cond:s=>(s.sessions||[]).length>=10, color:'#3d6975'},
  {id:'khatm',       icon:'🕌', label:'ختم القرآن',      labelEn:'Full Quran',       cond:s=>s.pages>=604,     color:'#836128'},
];

function getStudentPoints(s) {
  let pts = 0;
  pts += s.pages * 2;
  pts += (s.sessions||[]).length * 5;
  pts += Math.round(s.attendance / 10);
  const rew = DB.rewards[s.id] || {};
  pts += (rew.bonus || 0);
  return pts;
}

function getStudentBadges(s) {
  return BADGES.filter(b => b.cond(s));
}

pages['rewards'] = function(el) {
  const isEn = currentLang === 'en';
  const students = [...DB.students].map(s=>({
    ...s,
    points: getStudentPoints(s),
    badges: getStudentBadges(s),
  })).sort((a,b)=>b.points-a.points);

  el.innerHTML = `
    <!-- Header stats -->
    <div class="grid-4" style="margin-bottom:20px">
      ${[
        ['🏆', isEn?'Total Points':'إجمالي النقاط', students.reduce((a,s)=>a+s.points,0), 'gold'],
        ['🎖️', isEn?'Total Badges':'إجمالي الشارات', students.reduce((a,s)=>a+s.badges.length,0), 'green'],
        ['🥇', isEn?'Top Student':'الطالب الأول', students[0]?.name||'—', 'blue'],
        ['⭐', isEn?'Avg Points':'متوسط النقاط', students.length?Math.round(students.reduce((a,s)=>a+s.points,0)/students.length):0, 'green'],
      ].map(([icon,lbl,val,c])=>`
        <div class="stat-box">
          <div class="stat-icon ${c}">${icon}</div>
          <div><div class="stat-val" style="font-size:1rem">${val}</div><div class="stat-lbl">${lbl}</div></div>
        </div>`).join('')}
    </div>

    <!-- Badge legend -->
    <div class="card" style="margin-bottom:16px">
      <div class="card-title"><span class="ct-icon">🎖️</span> ${isEn?'Achievement Badges':'شارات الإنجاز'}</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        ${BADGES.map(b=>`
          <div style="display:flex;align-items:center;gap:6px;padding:6px 12px;
               background:var(--surface2);border-radius:20px;border:1px solid var(--border)">
            <span style="font-size:1.1rem">${b.icon}</span>
            <span style="font-size:.75rem;font-weight:600">${isEn?b.labelEn:b.label}</span>
          </div>`).join('')}
      </div>
    </div>

    <!-- Leaderboard -->
    <div class="card" style="margin-bottom:16px">
      <div class="card-title"><span class="ct-icon">🏅</span> ${isEn?'Leaderboard':'لوحة المتصدرين'}</div>
      ${students.length===0
        ? `<div style="text-align:center;padding:40px;color:var(--text-muted)">${t('noStudents')}</div>`
        : students.map((s,i)=>{
          const medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':'';
          const maxPts = students[0].points || 1;
          const barW = Math.round((s.points/maxPts)*100);
          return `
          <div style="display:flex;align-items:center;gap:12px;padding:12px 0;
               border-bottom:1px solid var(--border)">
            <div style="min-width:32px;text-align:center;font-size:${i<3?'1.4rem':'.9rem'};
                 font-weight:${i<3?'900':'600'};color:var(--text-muted)">${medal||'#'+(i+1)}</div>
            <div style="width:40px;height:40px;border-radius:50%;background:var(--emerald-glow);
                 color:var(--emerald-light);display:flex;align-items:center;justify-content:center;
                 font-weight:800;flex-shrink:0;font-size:.95rem">${s.name.charAt(0)}</div>
            <div style="flex:1;min-width:0">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                <span style="font-weight:700;font-size:.9rem">${s.name}</span>
                <span style="font-size:.85rem;font-weight:900;color:var(--gold-light)">⭐ ${s.points} ${isEn?'pts':'نقطة'}</span>
              </div>
              <div class="progress-bar"><div class="progress-fill" style="width:${barW}%;background:var(--gold-light)"></div></div>
              <div style="display:flex;gap:4px;margin-top:4px;flex-wrap:wrap">
                ${s.badges.map(b=>`<span title="${isEn?b.labelEn:b.label}" style="font-size:1rem">${b.icon}</span>`).join('')}
                ${s.badges.length===0?`<span style="font-size:.7rem;color:var(--text-dim)">${isEn?'No badges yet':'لا شارات بعد'}</span>`:''}
              </div>
            </div>
            <button class="btn btn-gold btn-sm" onclick="openRewardModal(${s.id})"
              style="flex-shrink:0">🎁 ${isEn?'Reward':'مكافأة'}</button>
          </div>`;
        }).join('')}
    </div>
  `;
};

window.openRewardModal = function(id) {
  const s = DB.students.find(st=>st.id===id);
  if (!s) return;
  const isEn = currentLang==='en';
  const pts = getStudentPoints(s);
  const badges = getStudentBadges(s);
  openModal('🎁 '+(isEn?'Add Reward: ':'إضافة مكافأة: ')+s.name, `
    <div style="text-align:center;padding:16px 0;margin-bottom:16px">
      <div style="font-size:2.5rem;margin-bottom:8px">🏆</div>
      <div style="font-size:1.5rem;font-weight:900;color:var(--gold-light)">⭐ ${pts} ${isEn?'points':'نقطة'}</div>
      <div style="font-size:.8rem;color:var(--text-muted);margin-top:4px">${isEn?'Current points':'النقاط الحالية'}</div>
      <div style="display:flex;justify-content:center;gap:6px;margin-top:10px;flex-wrap:wrap">
        ${badges.map(b=>`<span style="font-size:1.5rem" title="${isEn?b.labelEn:b.label}">${b.icon}</span>`).join('')}
        ${badges.length===0?`<span style="color:var(--text-muted);font-size:.82rem">${isEn?'No badges yet':'لا شارات بعد'}</span>`:''}
      </div>
    </div>
    <div class="field">
      <label>${isEn?'Add bonus points':'إضافة نقاط مكافأة'}</label>
      <div style="display:flex;gap:8px">
        ${[5,10,20,50].map(n=>`
          <button class="btn btn-gold btn-sm" onclick="addBonusPoints(${id},${n})">+${n}</button>
        `).join('')}
      </div>
    </div>
    <div class="field">
      <label>${isEn?'Custom amount':'مبلغ مخصص'}</label>
      <div style="display:flex;gap:8px">
        <input type="number" id="customPts" placeholder="${isEn?'Points':'نقاط'}" min="1" style="flex:1">
        <button class="btn btn-solid" onclick="addBonusPoints(${id},parseInt(document.getElementById('customPts').value)||0)">✅ ${isEn?'Add':'إضافة'}</button>
      </div>
    </div>
    <div class="field">
      <label>${isEn?'Special message to student':'رسالة تحفيزية للطالب'}</label>
      <input id="rewardMsg" placeholder="${isEn?'Great work! Keep it up...':'أحسنت يا بطل، واصل التقدم...'}">
    </div>
    <button class="btn btn-solid" style="width:100%" onclick="sendRewardNotif(${id})">
      📢 ${isEn?'Send to Parent':'إرسال إشعار لولي الأمر'}
    </button>
  `);
};

window.togglePushNotifications = function(btn) {
  var isEn = currentLang === 'en';
  if (PUSH.enabled) {
    PUSH.enabled = false;
    localStorage.setItem('pushEnabled', '0');
    showToast('🔕 '+(isEn?'Notifications disabled':'تم تعطيل الإشعارات'));
    navigateTo('settings');
  } else {
    PUSH.request().then(function(result) {
      if (result === 'granted') {
        showToast('🔔 '+(isEn?'Notifications enabled!':'تم تفعيل الإشعارات!'));
        // Test notification
        setTimeout(function() {
          PUSH.send(
            isEn?'Notifications Active':'الإشعارات مفعّلة',
            isEn?'You will now receive instant alerts':'ستتلقى تنبيهات فورية الآن',
            { emoji:'🔔', type:'info' }
          );
        }, 500);
      } else {
        showToast('⚠️ '+(isEn?'Permission denied — please allow from browser settings':'تم رفض الإذن — اسمح من إعدادات المتصفح'));
      }
      navigateTo('settings');
    });
  }
};

window.addBonusPoints = function(id, pts) {
  if (!pts || pts<=0) return;
  if (!DB.rewards[id]) DB.rewards[id] = {bonus:0};
  DB.rewards[id].bonus = (DB.rewards[id].bonus||0) + pts;
  const s = DB.students.find(st=>st.id===id);
  saveDB();
  closeModalDirect();

  // 🔔 إشعار Push
  PUSH.send(
    '🏆 ' + (currentLang==='en'?'Reward Added':'مكافأة جديدة') + (s?' — '+s.name:''),
    (currentLang==='en'?'+'+pts+' points added!':'تمت إضافة '+pts+' نقطة!'),
    { emoji:'🏆', type:'achievement', tag:'reward-'+id }
  );

  navigateTo('rewards');
};

window.sendRewardNotif = function(id) {
  const s = DB.students.find(st=>st.id===id);
  const msg = document.getElementById('rewardMsg')?.value || '';
  const notif = {
    id: Date.now(), type:'achievement',
    msg: '🏆 مكافأة للطالب '+s.name+(msg?' — '+msg:''),
    time: new Date().toLocaleDateString('ar-SA')
  };
  DB.notifications.unshift(notif);
  saveDB();
  closeModalDirect();
  showToast('📢 '+(currentLang==='en'?'Notification sent!':'تم إرسال الإشعار!'));
};

// ==============================
// 📅 CALENDAR PAGE
// ==============================
pages['calendar'] = function(el) {
  const isEn = currentLang === 'en';
  const now  = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const monthName = now.toLocaleDateString(isEn?'en-US':'ar-SA',{month:'long',year:'numeric'});

  const EVENT_TYPES = {
    session:   {label:isEn?'Session':'حلقة',     color:'#536f5a', bg:'var(--success-soft)'},
    holiday:   {label:isEn?'Holiday':'إجازة',    color:'#a7352a', bg:'rgba(167,53,42,.12)'},
    exam:      {label:isEn?'Exam':'اختبار',       color:'#6e3f28', bg:'rgba(110,63,40,.14)'},
    event:     {label:isEn?'Event':'فعالية',      color:'#92512c', bg:'var(--orange-soft)'},
  };

  // Build calendar days
  const calDays = [];
  for(let i=0;i<firstDay;i++) calDays.push(null);
  for(let d=1;d<=daysInMonth;d++) calDays.push(d);

  const todayDate = now.getDate();

  el.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:10px">
      <div style="font-size:1.1rem;font-weight:800">${monthName}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${Object.entries(EVENT_TYPES).map(([k,v])=>`
          <span style="display:flex;align-items:center;gap:4px;font-size:.76rem;font-weight:600;color:${v.color}">
            <span style="width:10px;height:10px;border-radius:50%;background:${v.color};display:inline-block"></span>
            ${v.label}
          </span>`).join('')}
        <button class="btn btn-solid btn-sm" onclick="openAddEventModal()">+ ${isEn?'Add Event':'إضافة حدث'}</button>
      </div>
    </div>

    <!-- Calendar grid -->
    <div class="card" style="margin-bottom:20px">
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:8px">
        ${(isEn?['Sun','Mon','Tue','Wed','Thu','Fri','Sat']:['أحد','اثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'])
          .map(d=>`<div style="text-align:center;font-size:.72rem;font-weight:700;color:var(--text-muted);padding:4px">${d}</div>`).join('')}
      </div>
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px">
        ${calDays.map(d=>{
          if (!d) return `<div></div>`;
          const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
          const dayEvents = DB.calendar.filter(e=>e.date===dateStr);
          const isToday = d===todayDate;
          return `
          <div onclick="openDayEvents('${dateStr}',${d})"
               style="min-height:60px;padding:4px;border-radius:8px;cursor:pointer;
                      background:${isToday?'var(--emerald-glow)':'var(--surface)'};
                      border:${isToday?'2px solid var(--emerald-mid)':'1px solid var(--border)'};
                      transition:all .2s"
               onmouseenter="this.style.background='var(--surface2)'"
               onmouseleave="this.style.background='${isToday?'var(--emerald-glow)':'var(--surface)'}'">
            <div style="font-size:.78rem;font-weight:${isToday?'900':'600'};
                 color:${isToday?'var(--emerald-light)':'var(--text)'};margin-bottom:3px">${d}</div>
            ${dayEvents.slice(0,2).map(e=>`
              <div style="background:${EVENT_TYPES[e.type]?.bg||'var(--surface2)'};
                   color:${EVENT_TYPES[e.type]?.color||'var(--text)'};
                   border-radius:4px;padding:2px 4px;font-size:.6rem;font-weight:700;
                   margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                ${e.title}
              </div>`).join('')}
            ${dayEvents.length>2?`<div style="font-size:.6rem;color:var(--text-muted)">+${dayEvents.length-2}</div>`:''}
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- Upcoming events -->
    <div class="card">
      <div class="card-title"><span class="ct-icon">📋</span> ${isEn?'All Events This Month':'أحداث الشهر'}</div>
      ${DB.calendar.filter(e=>e.date.startsWith(`${year}-${String(month+1).padStart(2,'0')}`))
                   .sort((a,b)=>a.date.localeCompare(b.date))
                   .length===0
        ? `<div style="text-align:center;padding:30px;color:var(--text-muted)">
             <div style="font-size:2rem;margin-bottom:8px">📅</div>
             <div>${isEn?'No events this month':'لا توجد أحداث هذا الشهر'}</div>
           </div>`
        : DB.calendar.filter(e=>e.date.startsWith(`${year}-${String(month+1).padStart(2,'0')}`))
                     .sort((a,b)=>a.date.localeCompare(b.date))
                     .map(ev=>`
          <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
            <div style="width:44px;height:44px;border-radius:10px;background:${EVENT_TYPES[ev.type]?.bg||'var(--surface2)'};
                 display:flex;align-items:center;justify-content:center;flex-shrink:0">
              <span style="font-size:1.2rem">${ev.type==='session'?'🕌':ev.type==='holiday'?'🏖️':ev.type==='exam'?'📝':'🎉'}</span>
            </div>
            <div style="flex:1">
              <div style="font-weight:700;font-size:.9rem">${ev.title}</div>
              <div style="font-size:.72rem;color:var(--text-muted)">${ev.date} ${ev.note?'· '+ev.note:''}</div>
            </div>
            <span class="badge ${ev.type==='session'?'green':ev.type==='holiday'?'red':ev.type==='exam'?'':'gold'}"
                  style="font-size:.7rem">${EVENT_TYPES[ev.type]?.label||ev.type}</span>
            <button class="btn btn-sm" style="background:var(--red-bg);color:var(--red);border:1px solid rgba(204,53,53,.2)"
              onclick="deleteCalEvent(${ev.id})">🗑</button>
          </div>`).join('')}
    </div>
  `;
};

window.openAddEventModal = function() {
  const isEn = currentLang==='en';
  const types = isEn
    ? [['session','🕌 Session'],['holiday','🏖️ Holiday'],['exam','📝 Exam'],['event','🎉 Event']]
    : [['session','🕌 حلقة'],['holiday','🏖️ إجازة'],['exam','📝 اختبار'],['event','🎉 فعالية']];
  openModal('📅 '+(isEn?'Add Event':'إضافة حدث'), `
    <div class="field"><label>${isEn?'Title *':'العنوان *'}</label>
      <input id="evTitle" placeholder="${isEn?'Event title':'عنوان الحدث'}">
    </div>
    <div class="grid-2" style="gap:10px">
      <div class="field" style="margin:0"><label>${isEn?'Date *':'التاريخ *'}</label>
        <input type="date" id="evDate" value="${new Date().toISOString().split('T')[0]}">
      </div>
      <div class="field" style="margin:0"><label>${isEn?'Type':'النوع'}</label>
        <select id="evType">
          ${types.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="field"><label>${isEn?'Circle (optional)':'الحلقة (اختياري)'}</label>
      <select id="evCircle">
        <option value="">${isEn?'— All Halaqas —':'— كل الحلقات —'}</option>
        ${DB.circles.map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}
      </select>
    </div>
    <div class="field"><label>${isEn?'Note':'ملاحظة'}</label>
      <input id="evNote" placeholder="${isEn?'Additional details...':'تفاصيل إضافية...'}">
    </div>
    <button class="btn btn-solid" style="width:100%" onclick="saveCalEvent()">
      ✅ ${isEn?'Save Event':'حفظ الحدث'}
    </button>
  `);
};

window.saveCalEvent = function() {
  const isEn = currentLang==='en';
  const title = document.getElementById('evTitle')?.value?.trim();
  const date  = document.getElementById('evDate')?.value;
  if (!title) { showToast('⚠️ '+(isEn?'Enter event title':'أدخل عنوان الحدث')); return; }
  if (!date)  { showToast('⚠️ '+(isEn?'Select a date':'اختر التاريخ')); return; }
  DB.calendar.push({
    id: Date.now(),
    title,
    date,
    type:     document.getElementById('evType')?.value || 'session',
    circleId: document.getElementById('evCircle')?.value || '',
    note:     document.getElementById('evNote')?.value?.trim() || '',
  });
  saveDB();
  closeModalDirect();
  showToast('✅ '+(isEn?'Event added':'تم إضافة الحدث'));
  navigateTo('calendar');
};

window.deleteCalEvent = function(id) {
  DB.calendar = DB.calendar.filter(e=>e.id!==id);
  saveDB();
  navigateTo('calendar');
};

window.openDayEvents = function(dateStr, d) {
  const isEn = currentLang==='en';
  const dayEvents = DB.calendar.filter(e=>e.date===dateStr);
  if (dayEvents.length===0) {
    openAddEventModal();
    setTimeout(()=>{ const di=document.getElementById('evDate'); if(di) di.value=dateStr; },100);
    return;
  }
  openModal('📅 '+dateStr, `
    <div style="margin-bottom:12px">
      ${dayEvents.map(ev=>`
        <div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--surface2);border-radius:10px;margin-bottom:8px">
          <span style="font-size:1.3rem">${ev.type==='session'?'🕌':ev.type==='holiday'?'🏖️':ev.type==='exam'?'📝':'🎉'}</span>
          <div style="flex:1"><div style="font-weight:700">${ev.title}</div>${ev.note?`<div style="font-size:.76rem;color:var(--text-muted)">${ev.note}</div>`:''}</div>
          <button class="btn btn-sm" style="background:var(--red-bg);color:var(--red);border:none" onclick="deleteCalEvent(${ev.id});closeModalDirect();navigateTo('calendar')">🗑</button>
        </div>`).join('')}
    </div>
    <button class="btn btn-solid" style="width:100%" onclick="closeModalDirect();openAddEventModal();setTimeout(()=>{const di=document.getElementById('evDate');if(di)di.value='${dateStr}'},100)">
      + ${isEn?'Add Event':'إضافة حدث'}
    </button>
  `);
};

// ==============================
// STUDENT MODAL
// ==============================
window.openStudentModal = function(id) {
  const s       = DB.students.find(st => st.id === id);
  if (!s) return;
  const pct     = Math.round(s.pages / s.totalPages * 100);
  const teacher = DB.users.find(u => u.id === s.teacher);
  const circle  = DB.circles.find(c => c.id === (DB.circles.find(cc=>cc.name===s.circle)?.id));
  const colors  = {متفوق:'#536f5a', جيد:'#3d6975', متوسط:'#836128', ضعيف:'#a7352a'};
  const col     = colors[s.level] || '#888';
  const lastSes = (s.sessions||[]).length > 0 ? s.sessions[0] : null;
  const totalNew = (s.sessions||[]).reduce((a,ses)=>a+ses.new, 0);

  // Weekly progress estimate
  const weeklyAyah  = s.plan.dailyAyah * (7 - s.plan.reviewDays);
  const weeklyPages = Math.round(weeklyAyah / 15 * 10) / 10;
  const daysToFinish = s.pages < s.totalPages
    ? Math.ceil((s.totalPages - s.pages) / (s.plan.dailyAyah / 15))
    : 0;
  const monthsLeft  = Math.ceil(daysToFinish / 30);

  openModal('📋 ملف الطالب: ' + s.name, `

    <!-- ── Profile banner ── -->
    <div style="background:linear-gradient(135deg,var(--emerald),var(--emerald-mid));
         border-radius:12px;padding:18px 20px;margin-bottom:16px;position:relative;overflow:hidden">
      <div style="position:absolute;left:-20px;top:-20px;width:80px;height:80px;
           border-radius:50%;background:rgba(255,255,255,.07)"></div>
      <div style="display:flex;align-items:center;gap:14px;position:relative">
        <div style="position:relative;flex-shrink:0" title="اضغط لتغيير الصورة" onclick="changeStudentPhoto(${s.id})" style="cursor:pointer">
      ${s.photo
        ? `<img src="${s.photo}" alt="${s.name}"
               style="width:56px;height:56px;border-radius:50%;object-fit:cover;
                      border:3px solid rgba(255,255,255,.4);flex-shrink:0;display:block">`
        : `<div style="width:56px;height:56px;border-radius:50%;
                background:rgba(255,255,255,.2);border:3px solid rgba(255,255,255,.3);
                display:flex;align-items:center;justify-content:center;
                font-size:1.4rem;font-weight:800;flex-shrink:0">${(s.name||'?').charAt(0)}</div>`}
      <div style="position:absolute;bottom:-2px;left:-2px;width:20px;height:20px;
           border-radius:50%;background:rgba(255,255,255,.9);
           display:flex;align-items:center;justify-content:center;font-size:.65rem;
           cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.2)" onclick="event.stopPropagation();changeStudentPhoto(${s.id})">📷</div>
    </div>
        <div style="flex:1">
          <div style="font-size:1.05rem;font-weight:800">${s.name}</div>
          <div style="font-size:.75rem;opacity:.9;margin-top:2px">
            ${s.circle} · العمر: ${s.age} سنة · ${teacher?.name||'—'}
          </div>
          <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">
            <span class="badge" style="background:rgba(255,255,255,.18);color:#fff;font-size:.7rem">${s.level}</span>
            ${s.weak ? '<span class="badge" style="background:rgba(224,85,85,.35);color:#fff;font-size:.68rem">⚠️ يحتاج دعم</span>' : ''}
            <span class="badge" style="background:rgba(255,255,255,.12);color:#fff;font-size:.68rem">📖 ${s.currentSurah} · آية ${s.currentAyah}</span>
          </div>
        </div>
        <div style="text-align:center;flex-shrink:0">
          <div style="font-size:1.6rem;font-weight:900">${pct}%</div>
          <div style="font-size:.65rem;opacity:.8">من القرآن</div>
        </div>
      </div>
    </div>

    <!-- ── Quick stats ── -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-bottom:16px">
      ${[
        [s.pages,'صفحة محفوظة','var(--emerald-light)'],
        [s.attendance+'%','نسبة الحضور', s.attendance>=90?'var(--emerald-light)':s.attendance>=75?'var(--gold-light)':'var(--red)'],
        [totalNew,'آية محفوظة','var(--blue)'],
        [(s.sessions||[]).length,'جلسة مسجلة','var(--gold-light)'],
      ].map(([v,l,c])=>`
        <div style="background:var(--surface2);border-radius:9px;padding:10px;text-align:center;
             border:1px solid var(--border)">
          <div style="font-size:1.1rem;font-weight:900;color:${c}">${v}</div>
          <div style="font-size:.6rem;color:var(--text-muted);margin-top:2px">${l}</div>
        </div>`).join('')}
    </div>

    <!-- ── خطة الحفظ ── -->
    <div style="background:var(--surface2);border-radius:12px;padding:16px;
         margin-bottom:16px;border:1px solid var(--border-gold);
         border-right:4px solid var(--gold)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <div style="font-size:.9rem;font-weight:800;color:var(--gold-light)">📝 خطة الحفظ</div>
        <span class="badge ${s.weak?'red':'green'}" style="font-size:.68rem">
          ${s.weak ? 'خطة مخففة' : 'خطة عادية'}
        </span>
      </div>

      <!-- Plan items grid -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">

        <div style="background:var(--surface);border-radius:9px;padding:11px 12px;
             display:flex;align-items:center;gap:10px;border:1px solid var(--border)">
          <div style="width:34px;height:34px;border-radius:10px;background:var(--emerald-glow);
               display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0">📖</div>
          <div>
            <div style="font-size:1.2rem;font-weight:900;color:var(--emerald-light)">${s.plan.dailyAyah}</div>
            <div style="font-size:.68rem;color:var(--text-muted)">آيات جديدة يومياً</div>
          </div>
        </div>

        <div style="background:var(--surface);border-radius:9px;padding:11px 12px;
             display:flex;align-items:center;gap:10px;border:1px solid var(--border)">
          <div style="width:34px;height:34px;border-radius:10px;background:var(--blue-soft);
               display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0">🔁</div>
          <div>
            <div style="font-size:1.2rem;font-weight:900;color:var(--blue)">${s.plan.reviewDays}</div>
            <div style="font-size:.68rem;color:var(--text-muted)">أيام مراجعة / أسبوع</div>
          </div>
        </div>

        <div style="background:var(--surface);border-radius:9px;padding:11px 12px;
             display:flex;align-items:center;gap:10px;border:1px solid var(--border)">
          <div style="width:34px;height:34px;border-radius:10px;background:var(--gold-pale);
               display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0">🎯</div>
          <div>
            <div style="font-size:1rem;font-weight:800;color:var(--gold-light)">${s.plan.weeklyGoal}</div>
            <div style="font-size:.68rem;color:var(--text-muted)">الهدف الأسبوعي</div>
          </div>
        </div>

        <div style="background:var(--surface);border-radius:9px;padding:11px 12px;
             display:flex;align-items:center;gap:10px;border:1px solid var(--border)">
          <div style="width:34px;height:34px;border-radius:10px;background:var(--orange-soft);
               display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0">⏳</div>
          <div>
            <div style="font-size:1rem;font-weight:800;color:var(--orange)">
              ${daysToFinish > 0 ? (monthsLeft > 12 ? Math.ceil(monthsLeft/12)+'سنة' : monthsLeft+' شهر') : '✅ مكتمل'}
            </div>
            <div style="font-size:.68rem;color:var(--text-muted)">الوقت المتوقع للختم</div>
          </div>
        </div>
      </div>

      <!-- Weekly estimate bar -->
      <div style="background:var(--surface);border-radius:8px;padding:10px 12px;
           border:1px solid var(--border)">
        <div style="display:flex;justify-content:space-between;align-items:center;
             font-size:.75rem;color:var(--text-muted);margin-bottom:6px">
          <span>التقدم الأسبوعي المتوقع</span>
          <span style="color:var(--emerald-light);font-weight:700">~${weeklyAyah} آية · ${weeklyPages} صفحة</span>
        </div>
        <div style="height:6px;background:var(--surface2);border-radius:3px;overflow:hidden">
          <div style="height:100%;width:${Math.min(100,Math.round(weeklyPages/20*100))}%;
               background:linear-gradient(90deg,var(--emerald),var(--emerald-light));
               border-radius:3px;transition:width .6s ease"></div>
        </div>
        <div style="font-size:.65rem;color:var(--text-dim);margin-top:4px">
          بناءً على ${s.plan.dailyAyah} آيات/يوم × ${7-s.plan.reviewDays} أيام حفظ في الأسبوع
        </div>
      </div>
    </div>

    <!-- ── Juz progress ── -->
    <div style="margin-bottom:16px">
      ${juzsWidget(s, {compact:true})}
    </div>

    <!-- ── Last session ── -->
    <div style="margin-bottom:14px">
      <div style="font-size:.85rem;font-weight:700;color:var(--gold-light);margin-bottom:8px">🗓 آخر جلسة</div>
      <div style="background:var(--surface2);border-radius:10px;padding:12px;border:1px solid var(--border)">
        ${lastSes ? `
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:8px">
            <span style="font-size:.78rem;color:var(--text-muted)">📅 ${lastSes.date}</span>
            ${gradeBadge(lastSes.grade)}
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:6px">
            <div style="background:var(--surface);border-radius:7px;padding:8px;text-align:center">
              <div style="font-size:1.1rem;font-weight:900;color:var(--emerald-light)">+${lastSes.new}</div>
              <div style="font-size:.62rem;color:var(--text-muted)">آيات جديدة</div>
            </div>
            <div style="background:var(--surface);border-radius:7px;padding:8px;text-align:center">
              <div style="font-size:1.1rem;font-weight:900;color:var(--blue)">${lastSes.review}</div>
              <div style="font-size:.62rem;color:var(--text-muted)">آيات مراجعة</div>
            </div>
          </div>
          ${lastSes.surah ? `<div style="font-size:.75rem;color:var(--text-muted)">📖 ${lastSes.surah} (${lastSes.from||''}–${lastSes.to||''})</div>` : ''}
          ${lastSes.notes ? `<div style="font-size:.75rem;color:var(--orange);margin-top:4px">📌 ${lastSes.notes}</div>` : ''}
        ` : `<div style="color:var(--text-muted);font-size:.82rem;text-align:center;padding:8px 0">
          لا توجد جلسات مسجلة بعد
        </div>`}
      </div>
    </div>

    <!-- ── Actions ── -->
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn btn-solid btn-sm" onclick="closeModalDirect();navigateTo('t-session')">📖 تسجيل جلسة</button>
      <button class="btn btn-gold btn-sm" onclick="showToast('📤 تم إرسال التقرير لولي الأمر');closeModalDirect()">📤 إرسال لولي الأمر</button>
      <button class="btn btn-green btn-sm" onclick="closeModalDirect();navigateTo('t-plans')">✏️ تعديل الخطة</button>
      <button class="btn btn-sm" style="background:rgba(80,80,80,.12);border:1px solid rgba(80,80,80,.25);color:var(--text)"
        onclick="exportStudentPDF(${s.id})">🖨️ تصدير PDF</button>
    </div>
  `);
};

window.openAddStudentModal = function() {
  const isEn = currentLang==='en';
  openModal(isEn?'Add New Student':'إضافة طالب جديد', `

    <!-- صورة الطالب -->
    <div class="photo-upload-wrap" style="margin-bottom:16px" onclick="document.getElementById('newPhotoInput').click()">
      <input type="file" id="newPhotoInput" accept="image/*" style="display:none" onchange="previewNewPhoto(this)">
      <img id="newPhotoPreview" class="photo-preview" src="" alt="">
      <div class="photo-placeholder" id="newPhotoPlaceholder">📷</div>
      <div class="photo-upload-label">
        <strong>${isEn?'📷 Add Student Photo':'📷 إضافة صورة الطالب'}</strong>
        ${isEn?'Click to choose a photo (optional)':'اضغط لاختيار صورة (اختياري)'}
      </div>
    </div>

    <!-- بيانات الطالب -->
    <div class="field"><label>${isEn?'Full Name *':'الاسم الكامل *'}</label>
      <input placeholder="${isEn?'Student name':'اسم الطالب'}" id="newName">
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div class="field"><label>${isEn?'Age':'العمر'}</label>
        <input type="number" placeholder="${isEn?'Age':'العمر'}" id="newAge" min="5" max="30">
      </div>
      <div class="field"><label>${t('thLevel')}</label>
        <select id="newLevel">
          <option>${t('good')}</option>
          <option>${t('average')}</option>
          <option>${t('excellent')}</option>
          <option>${t('weak')}</option>
        </select>
      </div>
    </div>
    <div class="field"><label>${t('thCircle')}</label>
      <select id="newCircle">
        ${DB.circles.length===0
          ? `<option value="">${isEn?'No Halaqas yet':'لا توجد حلقات بعد'}</option>`
          : DB.circles.map(c=>`<option>${c.name}</option>`).join('')}
      </select>
    </div>

    <!-- حساب ولي الأمر -->
    <div style="background:var(--gold-pale);border:1px solid var(--border-gold);
         border-radius:10px;padding:14px;margin-top:8px">
      <div style="font-size:.82rem;font-weight:700;color:var(--gold-light);margin-bottom:10px">
        👨‍👦 ${isEn?'Parent Account (to view student page)':'حساب ولي الأمر (للدخول لصفحة الطالب)'}
      </div>
      <div class="field" style="margin-bottom:10px">
        <label style="font-size:.78rem">${isEn?'Parent Name':'اسم ولي الأمر'}</label>
        <input id="newParentName" placeholder="${isEn?'Parent full name':'اسم ولي الأمر كاملاً'}">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div class="field" style="margin:0">
          <label style="font-size:.78rem">${isEn?'Username *':'اسم المستخدم *'}</label>
          <input id="newParentUser" placeholder="${isEn?'Username':'اسم المستخدم'}">
        </div>
        <div class="field" style="margin:0">
          <label style="font-size:.78rem">${isEn?'Password *':'كلمة المرور *'}</label>
          <input id="newParentPass" type="text" placeholder="${isEn?'Password':'كلمة مرور'}" value="1234">
        </div>
      </div>
    </div>

    <button class="btn btn-solid" style="width:100%;margin-top:14px" onclick="addStudent()">
      ✅ ${isEn?'Add Student & Create Parent Account':'إضافة الطالب وفتح حساب ولي الأمر'}
    </button>
  `);
};

window.previewNewPhoto = function(input) {
  if (!input.files || !input.files[0]) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const preview     = document.getElementById('newPhotoPreview');
    const placeholder = document.getElementById('newPhotoPlaceholder');
    if (preview) { preview.src = e.target.result; preview.style.display = 'block'; }
    if (placeholder) placeholder.style.display = 'none';
    window._newStudentPhoto = e.target.result;
  };
  reader.readAsDataURL(input.files[0]);
};

window.addStudent = function() {
  const isEn = currentLang==='en';
  const name = document.getElementById('newName').value.trim();
  if (!name) { showToast('⚠️ '+(isEn?'Please enter student name':'يرجى إدخال اسم الطالب')); return; }

  const parentUser = (document.getElementById('newParentUser').value||'').trim().toLowerCase();
  const parentPass  = (document.getElementById('newParentPass').value||'').trim();
  const parentName  = (document.getElementById('newParentName').value||'').trim() ||
                      (isEn?'Parent of ':'ولي أمر ') + name;

  if (!parentUser) { showToast('⚠️ '+(isEn?'Please enter parent username':'يرجى إدخال اسم مستخدم ولي الأمر')); return; }
  if (!parentPass)  { showToast('⚠️ '+(isEn?'Please set a password':'يرجى تعيين كلمة مرور')); return; }
  if (DB.users.find(u=>(u.username||'').toLowerCase()===parentUser || u.email.toLowerCase()===parentUser)) {
    showToast('⚠️ '+(isEn?'Username already in use':'اسم المستخدم مستخدم مسبقاً')); return;
  }

  const circle    = document.getElementById('newCircle').value;
  const circleObj = DB.circles.find(c=>c.name===circle);
  const levelVal  = document.getElementById('newLevel').value;
  const levelMap  = {[t('excellent')]:'متفوق',[t('good')]:'جيد',[t('average')]:'متوسط',[t('weak')]:'ضعيف'};
  const levelAr   = levelMap[levelVal] || levelVal;
  const newId     = DB.students.length > 0 ? Math.max(...DB.students.map(s=>s.id))+1 : 1;

  const newS = {
    id:newId, name,
    age: parseInt(document.getElementById('newAge').value)||10,
    photo: window._newStudentPhoto || null,
    circle, teacher:circleObj?.teacher||null, level:levelAr, pages:0, totalPages:604,
    attendance:100, lastSession:'—',
    status:'active',
    branch: circleObj?.room || '',
    attendanceDays: circleObj?.days || '',
    targetDate: '',
    plan:{dailyAyah:levelAr==='ضعيف'?2:levelAr==='متفوق'?8:5, reviewDays:levelAr==='ضعيف'?3:2, weeklyGoal:'صفحة'},
    memorized:[], currentSurah:'الفاتحة', currentAyah:1, weak:levelAr==='ضعيف',
    juzProgress:Array(30).fill(0), sessions:[], exams:[], certificates:[], messages:[], supportReasons:[]
  };
  if (typeof applySmartPlan === 'function') applySmartPlan(newS);

  DB.students.push(newS);
  if (circleObj) circleObj.students.push(newId);

  // إنشاء حساب ولي الأمر مرتبط بالطالب مع تشفير كلمة المرور
  const parentColors = ['#836128','#6e3f28','#3d6975','#92512c','#a7352a'];
  const parentId = DB.users.length > 0 ? Math.max(...DB.users.map(u=>u.id))+1 : 1;

  hashPassword(parentPass).then(function(hashedParentPass) {
    DB.users.push({
      id: parentId, role: 'parent', name: parentName,
      username: parentUser, email: '', pass: hashedParentPass,
      color: parentColors[parentId % parentColors.length],
      studentId: newId,
      joinDate: new Date().toISOString().split('T')[0],
      status: 'active'
    });
    window._newStudentPhoto = null;
    if (typeof logAudit === 'function') logAudit('student.create', 'إضافة الطالب: ' + name);
    saveDB();
    closeModalDirect();
    showToast('✅ '+(isEn?'Student added & parent account created':'تم إضافة '+name+' وفتح حساب ولي الأمر'));
    navigateTo(currentUser.role==='teacher'?'t-students':'students');
  });
};



// ── Change student photo ──
window.changeStudentPhoto = function(id) {
  const s = DB.students.find(st => st.id === id);
  if (!s) return;

  const input = document.createElement('input');
  input.type = 'file'; input.accept = 'image/*';
  input.onchange = function(e) {
    if (!e.target.files || !e.target.files[0]) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
      s.photo = ev.target.result;
      showToast('✅ تم تحديث صورة ' + s.name);
      // Refresh the modal if open
      openStudentModal(id);
    };
    reader.readAsDataURL(e.target.files[0]);
  };
  input.click();
};

// ==============================
// CIRCLE MODAL
// ==============================
window.openCircleModal = function(circleId) {
  const c = DB.circles.find(x => x.id === circleId);
  if (!c) return;
  const teacher = DB.users.find(u => u.id === c.teacher);
  const students = DB.students.filter(s => c.students.includes(s.id));
  const avgPages = students.length ? Math.round(students.reduce((a,s)=>a+s.pages,0)/students.length) : 0;
  const avgAtt   = students.length ? Math.round(students.reduce((a,s)=>a+s.attendance,0)/students.length) : 0;
  const avgPct   = Math.round(avgPages / 604 * 100);

  const studentsHTML = students.map(s => {
    const pct = Math.round(s.pages / s.totalPages * 100);
    const colors = {متفوق:'#536f5a', جيد:'#3d6975', متوسط:'#836128', ضعيف:'#a7352a'};
    const col = colors[s.level] || '#aaa';
    const lastSes = (s.sessions||[]).length > 0 ? s.sessions[0] : null;
    return `
      <div style="background:var(--surface2);border-radius:10px;padding:14px;margin-bottom:10px;border:1px solid var(--border);transition:border-color .2s;"
           onmouseenter="this.style.borderColor='var(--emerald-mid)'" onmouseleave="this.style.borderColor=''">

        <!-- Student header -->
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
          <div style="width:38px;height:38px;border-radius:50%;background:${col}20;color:${col};border:2px solid ${col}40;
               display:flex;align-items:center;justify-content:center;font-size:.95rem;font-weight:800;flex-shrink:0">${s.name.charAt(0)}</div>
          <div style="flex:1">
            <div style="font-weight:700;font-size:.92rem">${s.name}</div>
            <div style="font-size:.72rem;color:var(--text-muted)">السورة الحالية: <strong style="color:var(--gold-light)">${s.currentSurah}</strong> · آية ${s.currentAyah}</div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
            ${levelBadge(s.level)}
            ${s.weak ? '<span class="badge red" style="font-size:.6rem">يحتاج دعم</span>' : ''}
          </div>
        </div>

        <!-- Progress row -->
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px">
          <div style="text-align:center;background:var(--surface);border-radius:8px;padding:8px 4px">
            <div style="font-size:1.1rem;font-weight:900;color:var(--emerald-light)">${s.pages}</div>
            <div style="font-size:.62rem;color:var(--text-muted)">صفحة محفوظة</div>
          </div>
          <div style="text-align:center;background:var(--surface);border-radius:8px;padding:8px 4px">
            <div style="font-size:1.1rem;font-weight:900;color:${s.attendance>=90?'var(--emerald-light)':s.attendance>=75?'var(--gold-light)':'var(--red)'}">${s.attendance}%</div>
            <div style="font-size:.62rem;color:var(--text-muted)">نسبة الحضور</div>
          </div>
          <div style="text-align:center;background:var(--surface);border-radius:8px;padding:8px 4px">
            <div style="font-size:1.1rem;font-weight:900;color:var(--blue)">${s.plan.dailyAyah}</div>
            <div style="font-size:.62rem;color:var(--text-muted)">آيات يومياً</div>
          </div>
        </div>

        <!-- Progress bar -->
        <div style="margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;font-size:.68rem;color:var(--text-muted);margin-bottom:3px">
            <span>التقدم الكلي</span><span>${pct}%</span>
          </div>
          ${pctBar(s.pages, s.totalPages, s.level==='ضعيف'?'red':'')}
        </div>

        <!-- Last session -->
        ${lastSes ? `
          <div style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:var(--surface);border-radius:7px;font-size:.75rem">
            <span style="color:var(--text-dim)">آخر جلسة:</span>
            <span style="color:var(--text-muted)">${lastSes.date}</span>
            <span>حفظ <strong style="color:var(--emerald-light)">+${lastSes.new}</strong></span>
            <span>مراجعة <strong style="color:var(--blue)">${lastSes.review}</strong></span>
            ${gradeBadge(lastSes.grade)}
          </div>
        ` : `<div style="font-size:.75rem;color:var(--text-dim);padding:4px 0">لا توجد جلسات مسجلة بعد</div>`}

        <!-- Actions -->
        <div style="display:flex;gap:6px;margin-top:8px">
          <button class="btn btn-green btn-sm" onclick="closeModalDirect();openStudentModal(${s.id})">📋 ملف الطالب</button>
          <button class="btn btn-gold btn-sm" onclick="showToast('📤 إرسال إشعار لولي أمر ${s.name}')">📤 إشعار</button>
        </div>
      </div>
    `;
  }).join('');

  openModal('🕌 ' + c.name, `
    <!-- Circle info bar -->
    <div style="background:linear-gradient(135deg,var(--emerald),var(--emerald-mid));border-radius:10px;padding:16px;margin-bottom:16px;position:relative;overflow:hidden">
      <div style="position:absolute;left:-16px;top:-16px;width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,.07)"></div>
      <div style="display:flex;align-items:center;gap:12px;position:relative">
        <div style="font-size:1.8rem">🕌</div>
        <div>
          <div style="font-size:1.05rem;font-weight:800">${c.name}</div>
          <div style="font-size:.78rem;opacity:.9;margin-top:2px">👤 ${teacher?.name || '—'} · 🕐 ${c.time}</div>
          <div style="font-size:.75rem;opacity:.8;margin-top:1px">📅 ${c.days} · 🕌 ${c.room}</div>
        </div>
      </div>
    </div>

    <!-- Summary stats -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px">
      <div style="background:var(--surface2);border-radius:9px;padding:10px;text-align:center;border:1px solid var(--border)">
        <div style="font-size:1.3rem;font-weight:900;color:var(--emerald-light)">${students.length}</div>
        <div style="font-size:.65rem;color:var(--text-muted)">طلاب</div>
      </div>
      <div style="background:var(--surface2);border-radius:9px;padding:10px;text-align:center;border:1px solid var(--border)">
        <div style="font-size:1.3rem;font-weight:900;color:${avgAtt>=90?'var(--emerald-light)':avgAtt>=75?'var(--gold-light)':'var(--red)'}">${avgAtt}%</div>
        <div style="font-size:.65rem;color:var(--text-muted)">متوسط الحضور</div>
      </div>
      <div style="background:var(--surface2);border-radius:9px;padding:10px;text-align:center;border:1px solid var(--border)">
        <div style="font-size:1.3rem;font-weight:900;color:var(--gold-light)">${avgPct}%</div>
        <div style="font-size:.65rem;color:var(--text-muted)">متوسط التقدم</div>
      </div>
    </div>

    <!-- Students list header -->
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
      <div style="font-size:.88rem;font-weight:700;color:var(--gold-light)">👥 طلاب الحلقة (${students.length})</div>
      <button class="btn btn-solid btn-sm" onclick="closeModalDirect();navigateTo('attendance')">✅ تسجيل الحضور</button>
    </div>

    <!-- Students -->
    ${students.length > 0 ? studentsHTML : '<div style="color:var(--text-muted);text-align:center;padding:20px">لا يوجد طلاب في هذه الحلقة</div>'}
  `);
};


// ==============================
// WEAK STUDENTS MODAL
// ==============================
window.openWeakStudentsModal = function() {
  DB.students.forEach(s => typeof refreshStudentLearningState === 'function' && refreshStudentLearningState(s));
  const weakStudents = DB.students.filter(s => s.weak || s.needsSupport);

  if (weakStudents.length === 0) {
    showToast('✅ لا يوجد طلاب يحتاجون دعماً حالياً');
    return;
  }

  const rows = weakStudents.map(s => {
    const circle  = DB.circles.find(c => c.students.includes(s.id));
    const teacher = DB.users.find(u => u.id === s.teacher);
    const pct     = Math.round(s.pages / s.totalPages * 100);
    const lastSes = (s.sessions||[]).length > 0 ? s.sessions[0] : null;
    const colors  = {متفوق:'#536f5a', جيد:'#3d6975', متوسط:'#836128', ضعيف:'#a7352a'};
    const col     = colors[s.level] || '#a7352a';
    const alerts  = typeof getStudentSupportAlerts === 'function' ? getStudentSupportAlerts(s) : [];

    return `
      <div style="background:var(--surface2);border-radius:12px;padding:16px;margin-bottom:12px;
           border:1px solid rgba(224,85,85,.2);transition:border-color .2s"
           onmouseenter="this.style.borderColor='rgba(224,85,85,.5)'"
           onmouseleave="this.style.borderColor='rgba(224,85,85,.2)'">

        <!-- Header -->
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
          <div style="width:44px;height:44px;border-radius:50%;
               background:${col}20;color:${col};border:2px solid ${col}50;
               display:flex;align-items:center;justify-content:center;
               font-size:1.1rem;font-weight:800;flex-shrink:0">${s.name.charAt(0)}</div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:700;font-size:.95rem">${s.name}</div>
            <div style="font-size:.72rem;color:var(--text-muted);margin-top:2px">
              ${circle?.name || s.circle} · 👤 ${teacher?.name || '—'} · العمر: ${s.age} سنة
            </div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
            ${levelBadge(s.level)}
            <span class="badge red" style="font-size:.62rem">يحتاج دعم</span>
          </div>
        </div>

        <!-- Stats row -->
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-bottom:12px">
          <div style="background:var(--surface);border-radius:8px;padding:8px;text-align:center">
            <div style="font-size:1rem;font-weight:900;color:var(--emerald-light)">${s.pages}</div>
            <div style="font-size:.6rem;color:var(--text-muted)">صفحة محفوظة</div>
          </div>
          <div style="background:var(--surface);border-radius:8px;padding:8px;text-align:center">
            <div style="font-size:1rem;font-weight:900;color:${pct<10?'var(--red)':'var(--gold-light)'}">${pct}%</div>
            <div style="font-size:.6rem;color:var(--text-muted)">من القرآن</div>
          </div>
          <div style="background:var(--surface);border-radius:8px;padding:8px;text-align:center">
            <div style="font-size:1rem;font-weight:900;color:${s.attendance>=75?'var(--gold-light)':'var(--red)'}">${s.attendance}%</div>
            <div style="font-size:.6rem;color:var(--text-muted)">الحضور</div>
          </div>
          <div style="background:var(--surface);border-radius:8px;padding:8px;text-align:center">
            <div style="font-size:1rem;font-weight:900;color:var(--blue)">${s.plan.dailyAyah}</div>
            <div style="font-size:.6rem;color:var(--text-muted)">آيات يومياً</div>
          </div>
        </div>

        ${alerts.length ? `
          <div style="background:var(--red-bg);border:1px solid rgba(224,85,85,.25);
               border-radius:8px;padding:8px 12px;margin-bottom:10px;
               font-size:.75rem;color:var(--red);line-height:1.7">
            ${alerts.map(a => `• ${escapeHtml(a)}`).join('<br>')}
          </div>` : ''}

        <!-- Progress bar -->
        <div style="margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;font-size:.68rem;color:var(--text-muted);margin-bottom:3px">
            <span>تقدم الحفظ الكلي</span><span>${s.pages} / ${s.totalPages} صفحة</span>
          </div>
          <div class="progress-bar"><div class="progress-fill red" style="width:${pct}%"></div></div>
        </div>

        <!-- Current position -->
        <div style="display:flex;align-items:center;gap:8px;padding:7px 10px;
             background:var(--surface);border-radius:8px;font-size:.78rem;margin-bottom:10px">
          <span>📖</span>
          <span style="color:var(--text-muted)">السورة الحالية:</span>
          <strong style="color:var(--gold-light)">${s.currentSurah}</strong>
          <span style="color:var(--text-dim)">— آية ${s.currentAyah}</span>
        </div>

        <!-- Last session -->
        ${lastSes ? `
          <div style="display:flex;align-items:center;gap:8px;padding:7px 10px;
               background:var(--surface);border-radius:8px;font-size:.75rem;margin-bottom:10px;flex-wrap:wrap">
            <span style="color:var(--text-muted)">آخر جلسة: ${lastSes.date}</span>
            <span>·</span>
            <span>حفظ <strong style="color:var(--emerald-light)">+${lastSes.new}</strong></span>
            <span>·</span>
            <span>مراجعة <strong style="color:var(--blue)">${lastSes.review}</strong></span>
            <span>·</span>
            ${gradeBadge(lastSes.grade)}
            ${lastSes.notes ? `<span style="color:var(--orange)">📌 ${lastSes.notes}</span>` : ''}
          </div>` :
          `<div style="font-size:.75rem;color:var(--text-dim);margin-bottom:10px">لا توجد جلسات مسجلة بعد</div>`
        }

        <!-- Recommended actions -->
        <div style="background:rgba(224,85,85,.08);border:1px solid rgba(224,85,85,.2);
             border-radius:8px;padding:9px 12px;font-size:.75rem;color:var(--text-muted);
             line-height:1.8;margin-bottom:10px">
          <div style="font-size:.75rem;font-weight:700;color:var(--red);margin-bottom:4px">💡 توصيات المتابعة:</div>
          ${s.attendance < 75 ? '<div>• الحضور منخفض — يرجى التواصل مع ولي الأمر فوراً</div>' : ''}
          ${s.plan.dailyAyah <= 2 ? '<div>• الخطة مخففة — مراجعة أسبوعية مع المعلم ضرورية</div>' : ''}
          ${(s.sessions||[]).length === 0 ? '<div>• لم تُسجَّل أي جلسة — تحقق من وضع الطالب</div>' : ''}
          <div>• جلسات دعم إضافية ${s.attendance < 75 ? 'خاصة' : 'أسبوعية'} مع المعلم</div>
          <div>• تشجيع الطالب ومكافأته على أي تقدم ولو صغير</div>
        </div>

        <!-- Actions -->
        <div style="display:flex;gap:7px;flex-wrap:wrap">
          <button class="btn btn-green btn-sm" onclick="closeModalDirect();openStudentModal(${s.id})">📋 الملف الكامل</button>
          <button class="btn btn-gold btn-sm" onclick="showToast('📤 تم إرسال إشعار لولي أمر ${s.name}')">📤 إشعار ولي الأمر</button>
          <button class="btn btn-red btn-sm" onclick="showToast('📝 تم فتح خطة دعم ${s.name}')">📝 خطة دعم</button>
        </div>
      </div>`;
  }).join('');

  openModal(`⚠️ الطلاب المحتاجون للدعم (${weakStudents.length})`, `
    <div style="background:var(--red-bg);border:1px solid rgba(224,85,85,.25);border-radius:10px;
         padding:10px 14px;margin-bottom:16px;font-size:.82rem;color:var(--red);line-height:1.7">
      <strong>تنبيه:</strong> هؤلاء الطلاب يحتاجون متابعة عاجلة ومكثفة من المعلم وولي الأمر.
      يُنصح بمراجعة خططهم وتخصيص جلسات دعم إضافية لهم.
    </div>
    ${rows}
    <div style="display:flex;gap:8px;margin-top:4px">
      <button class="btn btn-solid btn-sm" onclick="showToast('📤 تم إرسال إشعارات لأولياء أمور جميع الطلاب الضعاف')">
        📤 إشعار جميع أولياء الأمور
      </button>
      <button class="btn btn-gold btn-sm" onclick="closeModalDirect();navigateTo('reports')">
        📋 عرض في التقارير
      </button>
    </div>
  `);
};


// ==============================
// SURAH DROPDOWN
// ==============================
let surahHighlight = -1;

function buildSurahDropdown(filter) {
  const dd = document.getElementById('surahDropdown');
  if (!dd) return;
  const q = (filter||'').trim().toLowerCase();
  const matches = q
    ? QURAN_SURAHS.filter(s =>
        s.name.includes(filter.trim()) ||
        String(s.n).startsWith(q)
      )
    : QURAN_SURAHS;

  dd.innerHTML = matches.map((s, i) => `
    <div class="surah-option ${i===surahHighlight?'highlighted':''}"
         data-name="${s.name}" data-n="${s.n}" data-ayah="${s.ayah}"
         onmousedown="selectSurah('${s.name}',${s.n},${s.ayah})">
      <div class="s-num">${s.n}</div>
      <div class="s-name">${s.name}</div>
      <div class="s-meta">${s.ayah} آية · ج${s.juz}</div>
    </div>`).join('');
}

function openSurahDropdown() {
  surahHighlight = -1;
  buildSurahDropdown(document.getElementById('sessionSurah')?.value || '');
  document.getElementById('surahDropdown')?.classList.add('open');
  // Close on outside click
  setTimeout(() => {
    document.addEventListener('click', closeSurahOnOutside, {once: true});
  }, 0);
}

function closeSurahOnOutside(e) {
  const wrap = document.getElementById('surahWrap');
  if (wrap && !wrap.contains(e.target)) {
    document.getElementById('surahDropdown')?.classList.remove('open');
  } else if (wrap && wrap.contains(e.target)) {
    document.addEventListener('click', closeSurahOnOutside, {once: true});
  }
}

function filterSurahs(val) {
  surahHighlight = -1;
  buildSurahDropdown(val);
  document.getElementById('surahDropdown')?.classList.add('open');
}

function selectSurah(name, n, maxAyah) {
  const input = document.getElementById('sessionSurah');
  const badge = document.getElementById('surahNumBadge');
  if (input) input.value = name;
  if (badge) badge.textContent = n;
  document.getElementById('surahDropdown')?.classList.remove('open');
  // Auto-update max ayah hint
  const toAyah = document.querySelector('input[placeholder]');
  // focus next field
  const fromInput = document.querySelector('#sessionSurah')?.closest('.field')?.nextElementSibling?.querySelector('input');
  if (fromInput) fromInput.focus();
}

function surahKeyNav(e) {
  const dd = document.getElementById('surahDropdown');
  if (!dd || !dd.classList.contains('open')) return;
  const opts = dd.querySelectorAll('.surah-option');
  if (!opts.length) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    surahHighlight = Math.min(surahHighlight + 1, opts.length - 1);
    opts.forEach((o,i) => o.classList.toggle('highlighted', i === surahHighlight));
    opts[surahHighlight]?.scrollIntoView({block:'nearest'});
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    surahHighlight = Math.max(surahHighlight - 1, 0);
    opts.forEach((o,i) => o.classList.toggle('highlighted', i === surahHighlight));
    opts[surahHighlight]?.scrollIntoView({block:'nearest'});
  } else if (e.key === 'Enter' && surahHighlight >= 0) {
    e.preventDefault();
    const opt = opts[surahHighlight];
    if (opt) selectSurah(opt.dataset.name, opt.dataset.n, opt.dataset.ayah);
  } else if (e.key === 'Escape') {
    dd.classList.remove('open');
  }
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
  const teacherPages = ['t-dashboard','t-students','t-session','t-reports','t-plans','t-attendance'];
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
      {icon:'📈', label: currentLang==='en'?'Analytics':'إحصائيات', page:'analytics'},
      {icon:'🏆', label: currentLang==='en'?'Rewards':'مكافآت',     page:'rewards'},
      {icon:'📅', label: currentLang==='en'?'Calendar':'التقويم',   page:'calendar'},
    ],
    teacher: [
      {icon:'🏠', label: currentLang==='en'?'Home':'الرئيسية',    page:'t-dashboard'},
      {icon:'👥', label: currentLang==='en'?'Students':'طلابي',    page:'t-students'},
      {icon:'📖', label: currentLang==='en'?'Session':'جلسة',      page:'t-session'},
      {icon:'✅', label: currentLang==='en'?'Attendance':'الحضور', page:'t-attendance'},
      {icon:'📋', label: currentLang==='en'?'Reports':'التقارير',  page:'t-reports'},
    ],
    parent: [
      {icon:'🏠', label: currentLang==='en'?'Home':'الرئيسية',      page:'p-dashboard'},
      {icon:'🗺️', label: currentLang==='en'?'Map':'خريطة الحفظ',   page:'p-map'},
      {icon:'📝', label: currentLang==='en'?'Exam':'الاختبار',      page:'p-exam'},
      {icon:'📈', label: currentLang==='en'?'Progress':'التقدم',    page:'p-progress'},
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
loadSavedTheme();
loadSavedLang();


