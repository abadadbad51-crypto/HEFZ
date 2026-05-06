function getParentStudent() {
  if (!currentUser || !currentUser.studentId) return null;
  return DB.students.find(st => st.id === currentUser.studentId) || null;
}

function renderParentNoStudent(el) {
  el.innerHTML = `
    <div style="text-align:center;padding:60px;color:var(--text-muted)">
      <div style="font-size:3rem;margin-bottom:12px">👨‍👦</div>
      <div style="font-size:1rem;font-weight:700;margin-bottom:6px">
        ${tt('لا يوجد طالب مرتبط بحساب ولي الأمر','No student linked to this parent account')}
      </div>
      <div style="font-size:.85rem">
        ${tt('يرجى التواصل مع الإدارة لربط الطالب الصحيح.','Please contact administration to link the correct student.')}
      </div>
    </div>`;
}

// ---- PARENT DASHBOARD ----
pages['p-dashboard'] = function(el) {
  const s         = getParentStudent();
  if (!s) { renderParentNoStudent(el); return; }
  if (typeof refreshStudentLearningState === 'function') refreshStudentLearningState(s);
  const pct       = Math.round(s.pages/s.totalPages*100);
  const teacher   = DB.users.find(u=>u.id===s.teacher);
  const lastSession = (s.sessions || [])[0] || null;
  const supportAlerts = typeof getStudentSupportAlerts === 'function' ? getStudentSupportAlerts(s) : [];

  // Plan calculations
  const weeklyAyah  = s.plan.dailyAyah * (7 - s.plan.reviewDays);
  const weeklyPages = Math.round(weeklyAyah / 15 * 10) / 10;
  const daysLeft    = s.pages < s.totalPages ? Math.ceil((s.totalPages - s.pages) / (s.plan.dailyAyah / 15)) : 0;
  const monthsLeft  = Math.ceil(daysLeft / 30);
  const timeLabel   = daysLeft === 0
    ? tt('✅ مكتمل','✅ Complete')
    : monthsLeft > 12 ? Math.ceil(monthsLeft/12)+tt(' سنة تقريباً',' yr approx')
    : monthsLeft+tt(' شهر تقريباً',' mo approx');

  el.innerHTML = `
    <div style="background:linear-gradient(135deg,var(--emerald),var(--emerald-mid));
         border-radius:14px;padding:22px 24px;margin-bottom:20px;
         position:relative;overflow:hidden">
      <div style="position:absolute;left:-20px;top:-20px;width:120px;height:120px;
           border-radius:50%;background:rgba(255,255,255,.06)"></div>
      <div style="display:flex;align-items:center;gap:14px;position:relative;flex-wrap:wrap">
        ${s.photo
          ? `<img src="${s.photo}" alt="${s.name}"
                 style="width:64px;height:64px;border-radius:50%;object-fit:cover;
                        border:3px solid rgba(255,255,255,.5);flex-shrink:0;display:block">`
          : `<div style="width:64px;height:64px;border-radius:50%;
                  background:rgba(255,255,255,.22);border:3px solid rgba(255,255,255,.35);
                  display:flex;align-items:center;justify-content:center;
                  font-size:1.6rem;font-weight:800;flex-shrink:0">${(s.name||'?').charAt(0)}</div>`}
        <div style="flex:1">
          <div style="font-size:1.2rem;font-weight:800">${s.name}</div>
          <div style="font-size:.78rem;opacity:.9;margin-top:3px">
            ${s.circle} · ${tt('المعلم:','Teacher:')} ${teacher?.name||'—'}
          </div>
          <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">
            ${levelBadge(s.level)}
            <span class="badge" style="background:rgba(255,255,255,.18);color:#fff;font-size:.68rem">
              📖 ${s.currentSurah} · ${tt('آية','v.')} ${s.currentAyah}
            </span>
          </div>
        </div>
        <div style="text-align:center;flex-shrink:0">
          <div style="font-size:2rem;font-weight:900;line-height:1">${pct}%</div>
          <div style="font-size:.65rem;opacity:.8;margin-top:2px">${tt('من القرآن','of Quran')}</div>
        </div>
      </div>
    </div>

    ${supportAlerts.length ? `
      <div style="background:var(--red-bg);border:1px solid rgba(204,53,53,.25);
           border-radius:12px;padding:12px 16px;margin-bottom:16px;
           color:var(--red);font-size:.82rem;line-height:1.7">
        ⚠️ <strong>${tt('تنبيه متابعة','Follow-up Alert')}:</strong>
        ${supportAlerts.map(a => `<span style="display:inline-block;margin-inline-end:8px">• ${a}</span>`).join('')}
      </div>` : ''}

    ${lastSession ? `
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;
           padding:14px 16px;margin-bottom:16px">
        <div style="font-size:.86rem;font-weight:800;color:var(--gold-light);margin-bottom:8px">
          🗓 ${tt('آخر جلسة مسجلة','Latest Recorded Session')}
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
          <div><div style="font-size:.68rem;color:var(--text-muted)">${t('thDate')}</div><strong>${lastSession.date}</strong></div>
          <div><div style="font-size:.68rem;color:var(--text-muted)">${tt('السورة','Surah')}</div><strong>${lastSession.surah || '—'}</strong></div>
          <div><div style="font-size:.68rem;color:var(--text-muted)">${tt('الأخطاء','Errors')}</div><strong>${lastSession.errors ?? '—'}</strong></div>
          <div><div style="font-size:.68rem;color:var(--text-muted)">${tt('التجويد','Tajweed')}</div><strong>${lastSession.tajweed ?? '—'}%</strong></div>
        </div>
        ${lastSession.notes ? `<div style="font-size:.76rem;color:var(--orange);margin-top:8px">📌 ${lastSession.notes}</div>` : ''}
      </div>` : ''}

    ${(s.certificates || []).length ? `
      <div style="background:var(--surface);border:1px solid var(--border-gold);border-radius:12px;
           padding:14px 16px;margin-bottom:16px">
        <div style="font-size:.86rem;font-weight:800;color:var(--gold-light);margin-bottom:8px">
          🏅 ${tt('آخر الشهادات','Latest Certificates')}
        </div>
        ${(s.certificates || []).slice(0,2).map(cert => `
          <div style="display:flex;align-items:center;justify-content:space-between;
               padding:8px 0;border-bottom:1px solid var(--border)">
            <span style="font-weight:700">${cert.title}</span>
            <span class="badge gold">${cert.score || ''}%</span>
          </div>`).join('')}
      </div>` : ''}

    <!-- Quick stats -->
    <div class="grid-3" style="margin-bottom:20px">
      <div class="stat-box">
        <div class="stat-icon green">📖</div>
        <div>
          <div class="stat-val">${s.pages}</div>
          <div class="stat-lbl">${tt('صفحة محفوظة','Pages Memorized')}</div>
          <div class="stat-change up">${tt('من ٦٠٤ صفحة','of 604 pages')}</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-icon blue">✅</div>
        <div>
          <div class="stat-val" style="color:${s.attendance>=90?'var(--emerald-light)':s.attendance>=75?'var(--gold-light)':'var(--red)'}">${s.attendance}%</div>
          <div class="stat-lbl">${t('attendanceRate')}</div>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-icon gold">⭐</div>
        <div>
          <div class="stat-val">${(s.memorized||[]).length}</div>
          <div class="stat-lbl">${tt('سورة محفوظة','Surahs Memorized')}</div>
        </div>
      </div>
    </div>

    <div style="margin-bottom:20px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        <div style="width:4px;height:28px;background:linear-gradient(180deg,var(--gold),var(--gold-light));
             border-radius:2px;flex-shrink:0"></div>
        <div style="font-size:1.1rem;font-weight:800;color:var(--text)">📝 ${tt('خطة حفظ ابنك',"Your child's memorization plan")}</div>
      </div>

      ${buildTodayTask(s)}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
        <div style="background:var(--surface);border-radius:14px;padding:20px;
             border:2px solid var(--emerald-mid);position:relative;overflow:hidden">
          <div style="position:absolute;left:-10px;top:-10px;width:60px;height:60px;
               border-radius:50%;background:var(--emerald-glow)"></div>
          <div style="position:relative">
            <div style="font-size:2.8rem;font-weight:900;color:var(--emerald-light);
                 line-height:1;margin-bottom:4px">${s.plan.dailyAyah}</div>
            <div style="font-size:.9rem;font-weight:700;color:var(--text)">${tt('آيات جديدة','New Verses')}</div>
            <div style="font-size:.75rem;color:var(--text-muted)">${tt('يحفظها يومياً','memorized daily')}</div>
            <div style="margin-top:10px;display:flex;align-items:center;gap:6px">
              <div style="font-size:1.3rem">📖</div>
              <div style="font-size:.72rem;color:var(--text-muted)">
                ~${Math.round(s.plan.dailyAyah/15*10)/10} ${tt('صفحة/يوم','pg/day')}
              </div>
            </div>
          </div>
        </div>

        <!-- أيام المراجعة -->
        <div style="background:var(--surface);border-radius:14px;padding:20px;
             border:2px solid var(--blue);position:relative;overflow:hidden">
          <div style="position:absolute;left:-10px;top:-10px;width:60px;height:60px;
               border-radius:50%;background:rgba(32,104,184,.1)"></div>
          <div style="position:relative">
            <div style="font-size:2.8rem;font-weight:900;color:var(--blue);
                 line-height:1;margin-bottom:4px">${s.plan.reviewDays}</div>
            <div style="font-size:.9rem;font-weight:700;color:var(--text)">${tt('أيام مراجعة','Review Days')}</div>
            <div style="font-size:.75rem;color:var(--text-muted)">${tt('في الأسبوع','per week')}</div>
            <div style="margin-top:10px;display:flex;align-items:center;gap:6px">
              <div style="font-size:1.3rem">🔁</div>
              <div style="font-size:.72rem;color:var(--text-muted)">
                ${7 - s.plan.reviewDays} ${tt('أيام حفظ جديد','new memorization days')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
        <div style="background:var(--surface);border-radius:14px;padding:18px;
             border:2px solid var(--gold);display:flex;align-items:center;gap:14px">
          <div style="width:48px;height:48px;border-radius:12px;background:var(--gold-pale);
               display:flex;align-items:center;justify-content:center;font-size:1.6rem;flex-shrink:0">🎯</div>
          <div>
            <div style="font-size:.75rem;color:var(--text-muted);margin-bottom:2px">${tt('الهدف الأسبوعي','Weekly Goal')}</div>
            <div style="font-size:1.1rem;font-weight:800;color:var(--gold-light)">${s.plan.weeklyGoal}</div>
            <div style="font-size:.68rem;color:var(--text-dim);margin-top:2px">
              ~${weeklyAyah} ${tt('آية','verses')} · ${weeklyPages} ${tt('صفحة','pg/wk')}
            </div>
          </div>
        </div>
        <div style="background:var(--surface);border-radius:14px;padding:18px;
             border:2px solid var(--orange);display:flex;align-items:center;gap:14px">
          <div style="width:48px;height:48px;border-radius:12px;background:rgba(192,94,24,.1);
               display:flex;align-items:center;justify-content:center;font-size:1.6rem;flex-shrink:0">⏳</div>
          <div>
            <div style="font-size:.75rem;color:var(--text-muted);margin-bottom:2px">${tt('الوقت المتوقع للختم','Est. Completion')}</div>
            <div style="font-size:1.1rem;font-weight:800;color:var(--orange)">${timeLabel}</div>
            <div style="font-size:.68rem;color:var(--text-dim);margin-top:2px">
              ${daysLeft > 0 ? daysLeft+tt(' يوم متبقٍّ',' days left') : tt('بارك الله فيه','May God bless him')}
            </div>
          </div>
        </div>
      </div>

      <div style="background:var(--surface);border-radius:14px;padding:16px 18px;border:1px solid var(--border)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <div style="font-size:.85rem;font-weight:700;color:var(--text)">${tt('التقدم الأسبوعي المتوقع','Expected Weekly Progress')}</div>
          <div style="font-size:.82rem;font-weight:700;color:var(--emerald-light)">
            ${weeklyAyah} ${tt('آية','verses')} · ${weeklyPages} ${tt('صفحة/أسبوع','pg/wk')}
          </div>
        </div>
        <div style="height:10px;background:var(--surface2);border-radius:5px;overflow:hidden;margin-bottom:8px">
          <div style="height:100%;width:${Math.min(100,Math.round(weeklyPages/20*100))}%;
               background:linear-gradient(90deg,var(--emerald),var(--emerald-light));
               border-radius:5px;transition:width .8s ease"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:.7rem;color:var(--text-dim)">
          <span>${tt('بناءً على','Based on')} ${s.plan.dailyAyah} ${tt('آيات ×','verses ×')} ${7-s.plan.reviewDays} ${tt('أيام حفظ','memorization days')}</span>
          <span>${tt('من ٢٠ صفحة أسبوعياً','of 20 pg/wk')}</span>
        </div>
      </div>

      ${s.weak ? `
        <div style="background:var(--red-bg);border:1px solid rgba(204,53,53,.25);border-radius:10px;
             padding:10px 14px;margin-top:10px;font-size:.82rem;color:var(--red);line-height:1.7">
          ⚠️ <strong>${tt('ملاحظة:','Note:')}</strong> ${tt('تم تخفيف خطة ابنك بناءً على مستواه الحالي — يُنصح بتشجيعه على المراجعة المنزلية اليومية',"Your child's plan has been lightened based on their current level — encourage daily home review.")}
        </div>` : ''}
    </div>

    <div class="card" style="margin-bottom:16px">
      <div class="card-title"><span class="ct-icon">📈</span> ${tt('تقدم الحفظ بالأجزاء','Memorization Progress by Juz')}</div>
      ${juzsWidget(s)}
      <div style="font-size:.8rem;color:var(--text-muted);margin-top:8px">
        ${tt('المتبقي:','Remaining:')} <strong style="color:var(--text)">${s.totalPages-s.pages} ${tt('صفحة','pages')}</strong> ${tt('لختم القرآن الكريم كاملاً','to complete the Quran')}
      </div>
    </div>

    <div class="card" style="margin-bottom:16px">
      <div class="card-title"><span class="ct-icon">📝</span> ${tt('آخر الجلسات','Recent Sessions')}</div>
      ${(s.sessions||[]).length > 0 ? (s.sessions||[]).slice(0,3).map(ses=>`
        <div style="display:flex;align-items:center;justify-content:space-between;
             padding:10px 0;border-bottom:1px solid var(--border)">
          <div>
            <div style="font-size:.88rem;font-weight:600">${ses.date}</div>
            <div style="font-size:.75rem;color:var(--text-muted)">
              ${tt('حفظ','New:')} ${ses.new} ${tt('آيات','verses')} · ${tt('مراجعة','Review:')} ${ses.review} ${tt('آيات','verses')}
              ${ses.surah ? ` · ${ses.surah}` : ''}
            </div>
            ${ses.notes?`<div style="font-size:.72rem;color:var(--orange);margin-top:2px">📌 ${ses.notes}</div>`:''}
          </div>
          ${gradeBadge(ses.grade)}
        </div>
      `).join('') : `<div style="color:var(--text-muted);font-size:.85rem;padding:12px 0;text-align:center">${t('noSessions')}</div>`}
    </div>

    <div class="card">
      <div class="card-title"><span class="ct-icon">📚</span> ${tt('السور المحفوظة','Memorized Surahs')}</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        ${(s.memorized||[]).length > 0
          ? (s.memorized||[]).map(surah=>`<span class="badge green" style="font-size:.75rem">${surah}</span>`).join('')
          : `<span style="color:var(--text-muted);font-size:.82rem">${tt('لم يُسجَّل حفظ بعد','No memorization recorded yet')}</span>`}
      </div>
    </div>
  `;
};

pages['p-progress'] = function(el) {
  const s = getParentStudent();
  if (!s) { renderParentNoStudent(el); return; }
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;background:var(--surface);
         border:1px solid var(--border);border-radius:12px;padding:14px 18px;margin-bottom:16px">
      ${s.photo
        ? `<img src="${s.photo}" alt="${s.name}" style="width:48px;height:48px;border-radius:50%;object-fit:cover;border:2px solid var(--emerald-mid);flex-shrink:0">`
        : `<div style="width:48px;height:48px;border-radius:50%;background:var(--emerald-glow);color:var(--emerald-light);border:2px solid var(--emerald-mid);display:flex;align-items:center;justify-content:center;font-size:1.2rem;font-weight:800;flex-shrink:0">${(s.name||'?').charAt(0)}</div>`}
      <div>
        <div style="font-weight:700;font-size:.95rem">${s.name}</div>
        <div style="font-size:.72rem;color:var(--text-muted)">${s.circle} · ${levelBadge(s.level)}</div>
      </div>
    </div>
    <div class="card" style="margin-bottom:16px">
      <div class="card-title"><span class="ct-icon">🗺️</span> ${tt('تقدم الحفظ — الأجزاء الثلاثون','Memorization Progress — 30 Juz')}</div>
      ${juzsWidget(s)}
    </div>
    <div class="card">
      <div class="card-title"><span class="ct-icon">📊</span> ${tt('تطور الأداء الأسبوعي','Weekly Performance')}</div>
      <div class="chart-bars" id="parentChart" style="height:100px"></div>
      <div class="chart-labels">
        ${[1,2,3,4,5,6,7].map(n=>`<div class="chart-label">${tt('أسبوع','Wk')} ${n}</div>`).join('')}
      </div>
    </div>
  `;
  const ch = el.querySelector('#parentChart');
  const weekly=[30,45,38,52,60,48,65];
  const mx=Math.max(...weekly);
  weekly.forEach((v,i)=>{
    const b=document.createElement('div'); b.className='chart-bar';
    b.setAttribute('data-val', v+tt(' آية',' verses'));
    setTimeout(()=>{b.style.height=(v/mx*100)+'%';},100+i*60);
    ch.appendChild(b);
  });
};

pages['p-reports'] = function(el) {
  const s = getParentStudent();
  if (!s) { renderParentNoStudent(el); return; }
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;background:var(--surface);
         border:1px solid var(--border);border-radius:12px;padding:14px 18px;margin-bottom:16px">
      ${s.photo
        ? `<img src="${s.photo}" alt="${s.name}" style="width:48px;height:48px;border-radius:50%;object-fit:cover;border:2px solid var(--emerald-mid);flex-shrink:0">`
        : `<div style="width:48px;height:48px;border-radius:50%;background:var(--emerald-glow);color:var(--emerald-light);border:2px solid var(--emerald-mid);display:flex;align-items:center;justify-content:center;font-size:1.2rem;font-weight:800;flex-shrink:0">${(s.name||'?').charAt(0)}</div>`}
      <div>
        <div style="font-weight:700;font-size:.95rem">${s.name}</div>
        <div style="font-size:.72rem;color:var(--text-muted)">${s.circle} · ${levelBadge(s.level)}</div>
      </div>
    </div>
    <div class="report-section" style="margin-bottom:14px">
      <h3>📋 ${tt('التقرير الشهري','Monthly Report')}</h3>
      <div class="grid-2" style="gap:10px;margin-bottom:14px">
        ${[
          [tt('آيات محفوظة','Verses Memorized'), tt('٣٨ آية','38 verses'), 'green'],
          [tt('أيام الحضور','Days Attended'), tt('١٠ من ١٢','10 of 12'), 'blue'],
          [tt('تقييم الشهر','Overall Grade'), t('gradeVGood'), 'gold'],
          [tt('السور المكتملة','Completed Surahs'), tt('سورتان','2 surahs'), 'green'],
        ].map(([l,v,c])=>`
          <div style="background:var(--surface2);border-radius:10px;padding:12px;text-align:center">
            <div class="badge ${c}" style="font-size:.88rem;margin-bottom:6px">${v}</div>
            <div style="font-size:.72rem;color:var(--text-muted)">${l}</div>
          </div>
        `).join('')}
      </div>
      <div style="font-size:.82rem;color:var(--text-muted);line-height:1.8">
        <strong style="color:var(--gold-light)">${tt('ملاحظات المعلم:',"Teacher's Notes:")}</strong><br>
        ${currentLang === 'en'
          ? `${s.name} is a ${s.level==='ضعيف'||s.level==='Weak'?'student who needs extra support and encouragement':'dedicated student showing continuous improvement'}. It is recommended to maintain daily home revision and encourage recitation in prayers.`
          : `${s.name} طالب ${s.level==='ضعيف'?'يحتاج لدعم إضافي وتشجيع مستمر':'مجتهد ويُبدي تحسناً مستمراً'}. يُنصح بالمواظبة على المراجعة اليومية في المنزل.`}
      </div>
    </div>
    <div class="card">
      <div class="card-title"><span class="ct-icon">📅</span> ${tt('سجل كامل الجلسات','Full Sessions Record')}</div>
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th>${t('thDate')}</th><th>${t('thNew')}</th>
            <th>${t('thReview')}</th><th>${t('thGrade')}</th><th>${t('thNotes')}</th>
          </tr></thead>
          <tbody>
            ${(s.sessions||[]).length > 0 ? (s.sessions||[]).map(ses=>`
              <tr>
                <td>${ses.date}</td>
                <td style="color:var(--emerald-light);font-weight:700">+${ses.new}</td>
                <td>${ses.review}</td>
                <td>${gradeBadge(ses.grade)}</td>
                <td style="color:var(--text-muted);font-size:.78rem">${ses.notes||'—'}</td>
              </tr>
            `).join('') : `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:20px">${t('noSessions')}</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;
};

// ---- PARENT / TEACHER MESSAGES ----
pages['p-messages'] = function(el) {
  const s = getParentStudent();
  if (!s) { renderParentNoStudent(el); return; }
  const teacher = DB.users.find(u=>u.id===s.teacher);
  const messages = (DB.messages || []).filter(m => m.studentId === s.id);
  el.innerHTML = `
    <div class="card" style="margin-bottom:16px">
      <div class="card-title"><span class="ct-icon">💬</span> ${tt('رسائل مع المعلم','Messages with Teacher')}</div>
      <div style="font-size:.8rem;color:var(--text-muted);margin-bottom:12px">
        ${tt('المعلم:','Teacher:')} <strong style="color:var(--gold-light)">${teacher?.name || '—'}</strong>
      </div>
      <div class="field">
        <label>${tt('رسالة جديدة','New Message')}</label>
        <input id="parentMsgText" placeholder="${tt('اكتب ملاحظة مختصرة للمعلم...','Write a short note to the teacher...')}">
      </div>
      <button class="btn btn-solid" onclick="sendParentMessage()">📤 ${tt('إرسال الرسالة','Send Message')}</button>
    </div>
    <div class="card">
      <div class="card-title"><span class="ct-icon">🗂️</span> ${tt('سجل الرسائل','Message History')}</div>
      ${messages.length === 0 ? `<div style="text-align:center;padding:24px;color:var(--text-muted)">${tt('لا توجد رسائل بعد','No messages yet')}</div>` :
        messages.map(m => `
          <div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;
               padding:10px 12px;margin-bottom:8px">
            <div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:4px">
              <strong>${m.fromRole === 'parent' ? tt('ولي الأمر','Parent') : tt('المعلم','Teacher')}</strong>
              <span style="font-size:.7rem;color:var(--text-muted)">${new Date(m.at).toLocaleString(currentLang==='en'?'en-US':'ar-SA')}</span>
            </div>
            <div style="font-size:.82rem;color:var(--text-muted);line-height:1.7">${escapeHtml(m.text)}</div>
          </div>`).join('')}
    </div>
  `;
};

window.sendParentMessage = function() {
  const s = getParentStudent();
  const text = (document.getElementById('parentMsgText')?.value || '').trim();
  if (!s || !text) { showToast('⚠️ اكتب الرسالة أولاً'); return; }
  if (!Array.isArray(DB.messages)) DB.messages = [];
  DB.messages.unshift({
    id: Date.now(),
    studentId: s.id,
    teacherId: s.teacher,
    parentId: currentUser.id,
    fromRole: 'parent',
    text,
    at: new Date().toISOString(),
    status: 'new'
  });
  if (typeof logAudit === 'function') logAudit('message.parent', 'رسالة من ولي الأمر للطالب: ' + s.name);
  saveDB();
  showToast('✅ تم إرسال الرسالة للمعلم');
  navigateTo('p-messages');
};

// =============================================
// 🗺️ INTERACTIVE MEMORIZATION MAP
// =============================================
pages['p-map'] = function(el) {
  const s = getParentStudent();
  if (!s) { renderParentNoStudent(el); return; }

  const juz = s.juzProgress || Array(30).fill(0);
  const pagesPerJuz = s.totalPages / 30;
  const done    = juz.filter(v=>v>=20).length;
  const partial = juz.filter(v=>v>0&&v<20).length;
  const pct     = Math.round(s.pages/s.totalPages*100);

  // Surah data mapped to juz
  const JUZ_SURAHS = {
    1:['الفاتحة','البقرة(1-141)'],2:['البقرة(142-286)'],3:['آل عمران'],
    4:['النساء'],5:['النساء(ج)','المائدة'],6:['المائدة(ج)','الأنعام'],
    7:['الأنعام(ج)','الأعراف'],8:['الأنعام(ج)','الأنفال'],9:['الأنفال(ج)','التوبة'],
    10:['يونس','هود','يوسف(ج)'],11:['يوسف','الرعد','إبراهيم','الحجر'],
    12:['النحل','الإسراء'],13:['الكهف','مريم','طه(ج)'],14:['طه','الأنبياء'],
    15:['الحج','المؤمنون','النور(ج)'],16:['النور','الفرقان','الشعراء','النمل(ج)'],
    17:['النمل','القصص','العنكبوت(ج)'],18:['المؤمن','فصلت(ج)'],
    19:['الشورى','الزخرف','الدخان','الجاثية'],20:['الأحقاف','محمد','الفتح','الحجرات'],
    21:['الذاريات','الطور','النجم','القمر','الرحمن','الواقعة','الحديد'],
    22:['المجادلة','الحشر','الممتحنة','الصف','الجمعة','المنافقون','التغابن','الطلاق','التحريم'],
    23:['الملك','القلم','الحاقة','المعارج','نوح','الجن','المزمل','المدثر','القيامة','الإنسان','المرسلات'],
    24:['النبأ','النازعات','عبس','التكوير','الانفطار','المطففين','الانشقاق','البروج','الطارق','الأعلى','الغاشية'],
    25:['الفجر','البلد','الشمس','الليل','الضحى','الشرح','التين','العلق','القدر','البينة','الزلزلة'],
    26:['العاديات','القارعة','التكاثر','العصر','الهمزة','الفيل','قريش','الماعون','الكوثر','الكافرون','النصر','المسد','الإخلاص','الفلق','الناس'],
    27:['الفجر'],28:['المجادلة(ج)'],29:['الملك(ج)'],30:['النبأ(ج)'],
  };

  el.innerHTML = `
    <!-- Student banner -->
    <div style="display:flex;align-items:center;gap:12px;background:var(--surface);
         border:1px solid var(--border);border-radius:12px;padding:14px 18px;margin-bottom:16px">
      <div style="width:48px;height:48px;border-radius:50%;background:var(--emerald-glow);
           color:var(--emerald-light);border:2px solid var(--emerald-mid);
           display:flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:800">
        ${s.name.charAt(0)}</div>
      <div style="flex:1">
        <div style="font-weight:700;font-size:.95rem">${s.name}</div>
        <div style="font-size:.72rem;color:var(--text-muted)">${tt('خريطة الحفظ','Memorization Map')} · ${pct}% ${tt('مكتمل','complete')}</div>
      </div>
      <div style="text-align:center">
        <div style="font-size:1.6rem;font-weight:900;color:var(--emerald-light)">${pct}%</div>
        <div style="font-size:.65rem;color:var(--text-muted)">${s.pages}/${s.totalPages}</div>
      </div>
    </div>

    <!-- Summary pills -->
    <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">
      ${[
        ['✅', done, tt('مكتمل','Complete'), 'var(--emerald)'],
        ['🔶', partial, tt('جزئي','Partial'), 'var(--gold-light)'],
        ['⬜', 30-done-partial, tt('متبقي','Remaining'), 'var(--text-muted)'],
      ].map(([ic,cnt,lbl,col])=>`
        <div style="flex:1;min-width:80px;background:var(--surface);border:1px solid var(--border);
             border-radius:10px;padding:10px;text-align:center">
          <div style="font-size:.9rem">${ic}</div>
          <div style="font-size:1.2rem;font-weight:900;color:${col}">${cnt}</div>
          <div style="font-size:.68rem;color:var(--text-muted)">${lbl}</div>
        </div>`).join('')}
    </div>

    <!-- Interactive juz grid -->
    <div class="card" style="margin-bottom:16px">
      <div class="card-title"><span class="ct-icon">🗺️</span> ${tt('خريطة الأجزاء التفاعلية — اضغط على أي جزء للتفاصيل','Interactive Juz Map — tap any juz for details')}</div>
      <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:6px;margin-bottom:12px" id="juzMapGrid"></div>
      <div style="display:flex;gap:12px;font-size:.72rem;color:var(--text-muted)">
        <span>✅ ${tt('مكتمل (٢٠+ صفحة)','Complete (≥20 pages)')}</span>
        <span>🔶 ${tt('جزئي','Partial')}</span>
        <span>⬜ ${tt('لم يبدأ','Not started')}</span>
      </div>
    </div>

    <!-- Selected juz detail -->
    <div id="juzDetail" class="card" style="display:none"></div>

    <!-- Progress by quarter -->
    <div class="card">
      <div class="card-title"><span class="ct-icon">📊</span> ${tt('التقدم بالأرباع','Progress by Quarter')}</div>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px">
        ${['الربع الأول (١-٧)','الربع الثاني (٨-١٥)','الربع الثالث (١٦-٢٢)','الربع الرابع (٢٣-٣٠)'].map((qLabel,qi)=>{
          const qJuz = juz.slice(qi*7+1, qi*7+8);
          const qDone = qJuz.filter(v=>v>=20).length;
          const qPct  = Math.round(qDone/7*100);
          const labels = currentLang === 'en' ? ['Q1 (1-7)','Q2 (8-15)','Q3 (16-22)','Q4 (23-30)'] : ['الربع الأول','الربع الثاني','الربع الثالث','الربع الرابع'];
          return `
          <div style="background:var(--surface2);border-radius:10px;padding:12px;border:1px solid var(--border)">
            <div style="font-size:.76rem;font-weight:700;margin-bottom:8px;color:var(--text)">${labels[qi]}</div>
            <div style="display:flex;justify-content:space-between;font-size:.72rem;color:var(--text-muted);margin-bottom:4px">
              <span>${qDone}/7 ${tt('جزء','juz')}</span>
              <span style="color:var(--emerald-light);font-weight:700">${qPct}%</span>
            </div>
            <div class="progress-bar"><div class="progress-fill ${qPct<30?'red':''}" style="width:${qPct}%"></div></div>
          </div>`;
        }).join('')}
      </div>
    </div>
  `;

  // Build interactive juz grid
  const grid = document.getElementById('juzMapGrid');
  if (!grid) return;
  juz.forEach((pages,i)=>{
    const juzNum = i+1;
    const pct2   = Math.round(pages/pagesPerJuz*100);
    const isDone = pages>=20;
    const isPartial = pages>0&&pages<20;
    const cell = document.createElement('div');
    cell.style.cssText = [
      'aspect-ratio:1','border-radius:10px','cursor:pointer','display:flex',
      'flex-direction:column','align-items:center','justify-content:center',
      'font-size:.7rem','font-weight:800','transition:all .2s','position:relative',
      `background:${isDone?'var(--emerald)':isPartial?'var(--gold-pale)':'var(--surface2)'}`,
      `border:2px solid ${isDone?'var(--emerald-mid)':isPartial?'var(--gold-light)':'var(--border)'}`,
      `color:${isDone?'#fff':isPartial?'var(--gold-light)':'var(--text-muted)'}`,
    ].join(';');
    cell.innerHTML = `
      <div style="font-size:.95rem;font-weight:900">${juzNum}</div>
      ${isDone?`<div style="font-size:.55rem;opacity:.85">✓ ${tt('مكتمل','done')}</div>`
       :isPartial?`<div style="font-size:.55rem">${pct2}%</div>`
       :`<div style="font-size:.55rem">${tt('لم يبدأ','not started')}</div>`}
    `;
    cell.addEventListener('mouseenter',()=>{ cell.style.transform='scale(1.08)'; cell.style.zIndex='2'; });
    cell.addEventListener('mouseleave',()=>{ cell.style.transform='scale(1)'; cell.style.zIndex='1'; });
    cell.addEventListener('click',()=>{
      // Highlight selected
      grid.querySelectorAll('div').forEach(c=>c.style.outline='none');
      cell.style.outline='3px solid var(--gold-light)';
      // Show detail
      showJuzDetail(juzNum, pages, pct2, JUZ_SURAHS[juzNum]||[]);
    });
    grid.appendChild(cell);
  });
};

function showJuzDetail(juzNum, pages, pct, surahs) {
  const det = document.getElementById('juzDetail');
  if (!det) return;
  det.style.display = 'block';
  const isDone = pages>=20;
  const isPartial = pages>0&&pages<20;
  det.innerHTML = `
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px">
      <div style="width:56px;height:56px;border-radius:14px;flex-shrink:0;
           background:${isDone?'var(--emerald)':isPartial?'var(--gold-pale)':'var(--surface2)'};
           border:2px solid ${isDone?'var(--emerald-mid)':isPartial?'var(--gold-light)':'var(--border)'};
           display:flex;align-items:center;justify-content:center;
           font-size:1.5rem;font-weight:900;color:${isDone?'#fff':isPartial?'var(--gold-light)':'var(--text-muted)'}">
        ${juzNum}
      </div>
      <div style="flex:1">
        <div style="font-size:1rem;font-weight:800">${tt('الجزء ','Juz ')}${juzNum}</div>
        <div style="font-size:.75rem;color:var(--text-muted);margin-top:3px">
          ${pages} / 20 ${tt('صفحة','pages')} · ${pct}%
        </div>
        <div style="margin-top:6px">
          <span class="badge ${isDone?'green':isPartial?'gold':'gray'}">
            ${isDone?tt('✅ مكتمل','✅ Complete'):isPartial?tt('🔶 جزئي','🔶 Partial'):tt('⬜ لم يبدأ','⬜ Not Started')}
          </span>
        </div>
      </div>
    </div>
    <div class="progress-bar" style="margin-bottom:10px">
      <div class="progress-fill ${pages<5&&!isDone?'red':''}" style="width:${Math.min(100,pct)}%;transition:width 0.6s ease"></div>
    </div>
    <div style="font-size:.78rem;color:var(--text-muted);margin-bottom:8px;font-weight:600">
      ${tt('السور في هذا الجزء:','Surahs in this Juz:')}
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:5px">
      ${(surahs||[]).map(s=>`
        <span style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;
             padding:3px 10px;font-size:.72rem;font-weight:600">${s}</span>`).join('')}
    </div>
    ${!isDone&&pages>0?`
      <div style="margin-top:10px;font-size:.76rem;color:var(--gold-light);background:var(--gold-pale);
           border-radius:8px;padding:8px 12px;line-height:1.7">
        💡 ${currentLang === 'en'
          ? `Keep going! ${20-pages} more pages to complete this Juz.`
          : `واصل المراجعة! ${20-pages} صفحات متبقية لإتمام هذا الجزء.`}
      </div>`:''
    }
    ${isDone?`
      <div style="margin-top:10px;font-size:.76rem;color:var(--emerald-light);background:var(--emerald-glow);
           border-radius:8px;padding:8px 12px">
        🎉 ${tt('تم حفظ هذا الجزء بالكامل! أحسنت!','This Juz is fully memorized! Excellent!')}
      </div>`:''
    }
  `;
  det.scrollIntoView({behavior:'smooth', block:'nearest'});
}

// =============================================
// 📝 MEMORIZATION EXAM
// =============================================
pages['p-exam'] = function(el) {
  const s = getParentStudent();
  if (!s) { renderParentNoStudent(el); return; }

  // Get memorized surahs + current surah
  const availableSurahs = (s.memorized||[]).length > 0
    ? [...s.memorized, s.currentSurah].filter((v,i,a)=>a.indexOf(v)===i)
    : [s.currentSurah];

  el.innerHTML = `
    <!-- Header -->
    <div style="background:linear-gradient(135deg,var(--emerald),var(--emerald-mid));
         border-radius:14px;padding:20px 24px;margin-bottom:20px;color:#fff;position:relative;overflow:hidden">
      <div style="position:absolute;left:-20px;bottom:-20px;width:100px;height:100px;
           border-radius:50%;background:rgba(255,255,255,.07)"></div>
      <div style="position:relative">
        <div style="font-size:1.15rem;font-weight:900;margin-bottom:4px">📝 ${tt('اختبار الحفظ','Memorization Exam')}</div>
        <div style="font-size:.8rem;opacity:.88">${tt('اختبر حفظ ابنك — اختر السورة وابدأ',"Test your child's memorization — select surah and start")}</div>
        <div style="margin-top:8px;font-size:.76rem;opacity:.8">👤 ${s.name}</div>
      </div>
    </div>

    <!-- Exam setup card -->
    <div class="card" id="examSetup" style="margin-bottom:16px">
      <div class="card-title"><span class="ct-icon">⚙️</span> ${tt('إعدادات الاختبار','Exam Settings')}</div>

      <div class="field">
        <label>${tt('اختر السورة *','Select Surah *')}</label>
        <select id="examSurah" style="width:100%">
          <option value="">${tt('— اختر سورة —','— Choose surah —')}</option>
          ${availableSurahs.map(sur=>`<option value="${sur}">${sur}</option>`).join('')}
          <option value="custom">${tt('سورة أخرى...','Other surah...')}</option>
        </select>
      </div>

      <div class="field">
        <label>${tt('نوع الاختبار','Exam Type')}</label>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(140px, 1fr));gap:10px">
          ${[
            ['recite', '🎙️', tt('اختبار التلاوة','Recitation Test'), tt('الطالب يتلو من حفظه','Child recites by memory')],
            ['complete', '✍️', tt('اختبار الإكمال','Completion Test'), tt('ولي الأمر يبدأ والطالب يكمل','Parent reads start, child completes')],
          ].map(([v,ic,lbl,desc])=>`
            <label id="examType-${v}" style="display:flex;align-items:flex-start;gap:10px;padding:14px;
                   border-radius:14px;border:2px solid var(--border);cursor:pointer;
                   background:var(--surface2);transition:all .25s;position:relative;
                   box-shadow:0 2px 8px rgba(0,0,0,0.05)"
                   onclick="selectExamType('${v}')">
              <input type="radio" name="examType" value="${v}" style="margin-top:4px;flex-shrink:0;accent-color:var(--emerald-mid)">
              <div style="flex:1;min-width:0">
                <div style="font-size:.88rem;font-weight:800;color:var(--text);line-height:1.2">${ic} ${lbl}</div>
                <div style="font-size:.72rem;color:var(--text-muted);margin-top:6px;line-height:1.5;word-break:break-word">${desc}</div>
              </div>
            </label>`).join('')}
        </div>
      </div>

      <div class="field">
        <label>${tt('مستوى الصعوبة','Difficulty Level')}</label>
        <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:8px">
          ${[['easy','🟢',tt('سهل','Easy')],['medium','🟡',tt('متوسط','Medium')],['hard','🔴',tt('صعب','Hard')]].map(([v,ic,lbl])=>`
            <button id="diff-${v}" class="btn" style="flex:1;justify-content:center;padding:10px;
                    border-radius:10px;transition:all .2s;font-size:.82rem"
                    onclick="selectDifficulty('${v}')">${ic} ${lbl}</button>`).join('')}
        </div>
      </div>

      <button class="btn btn-solid" style="width:100%;margin-top:4px"
              onclick="startExam()">🚀 ${tt('بدء الاختبار','Start Exam')}</button>
    </div>

    <!-- Exam area (hidden initially) -->
    <div id="examArea" style="display:none"></div>

    <!-- Past results -->
    <div class="card">
      <div class="card-title"><span class="ct-icon">📊</span> ${tt('نتائج الاختبارات السابقة','Past Exam Results')}</div>
      ${(DB.rewards[s.id]?.exams||[]).length===0
        ? `<div style="text-align:center;padding:24px;color:var(--text-muted)">
             <div style="font-size:2rem;margin-bottom:6px">📝</div>
             <div>${tt('لا اختبارات بعد — ابدأ أول اختبار!','No exams yet — start the first one!')}</div>
           </div>`
        : (DB.rewards[s.id]?.exams||[]).slice(0,5).map(ex=>`
            <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
              <div style="width:40px;height:40px;border-radius:50%;flex-shrink:0;
                   background:${ex.score>=80?'var(--emerald-glow)':ex.score>=60?'var(--gold-pale)':'var(--red-bg)'};
                   border:2px solid ${ex.score>=80?'var(--emerald-mid)':ex.score>=60?'var(--border-gold)':'rgba(204,53,53,.3)'};
                   display:flex;align-items:center;justify-content:center;
                   font-size:.9rem;font-weight:900;
                   color:${ex.score>=80?'var(--emerald-light)':ex.score>=60?'var(--gold-light)':'var(--red)'}">
                ${ex.score}%
              </div>
              <div style="flex:1">
                <div style="font-weight:700;font-size:.88rem">${ex.surah}</div>
                <div style="font-size:.72rem;color:var(--text-muted)">${ex.date} · ${ex.type==='recite'?tt('تلاوة','Recitation'):tt('إكمال','Completion')}</div>
              </div>
              <span class="badge ${ex.score>=80?'green':ex.score>=60?'gold':'red'}">
                ${ex.score>=80?tt('ممتاز','Excellent'):ex.score>=60?tt('جيد','Good'):tt('يحتاج مراجعة','Needs Work')}
              </span>
            </div>`).join('')}
    </div>
  `;

  // Init selections
  selectDifficulty('medium');
  selectExamType('recite');
};

window.selectExamType = function(v) {
  ['recite','complete'].forEach(t=>{
    const el=document.getElementById('examType-'+t);
    if(el){ el.style.borderColor = t===v?'var(--emerald-mid)':'var(--border)'; el.style.background = t===v?'var(--emerald-glow)':'var(--surface2)'; }
  });
  window._examType = v;
};

window.selectDifficulty = function(v) {
  const colors={easy:'var(--emerald)',medium:'var(--gold-light)',hard:'var(--red)'};
  ['easy','medium','hard'].forEach(d=>{
    const el=document.getElementById('diff-'+d);
    if(el){ el.style.background = d===v?colors[d]:'var(--surface2)'; el.style.color = d===v?'#fff':'var(--text)'; el.style.border = `1px solid ${d===v?colors[d]:'var(--border)'}`; }
  });
  window._examDiff = v;
};

window._examState = null;

window.startExam = function() {
  const surah = document.getElementById('examSurah')?.value;
  if (!surah) { showToast('⚠️ '+tt('اختر السورة أولاً','Please select a surah')); return; }

  const surahObj = QURAN_SURAHS.find(q=>q.name===surah);
  const totalAyah = surahObj?.ayah || 7;
  const diff = window._examDiff || 'medium';
  const type = window._examType || 'recite';

  // Generate questions based on difficulty
  const numQ = diff==='easy'?3:diff==='medium'?5:8;
  const questions = [];

  if (type==='recite') {
    // Ask to recite specific ayah ranges
    for(let i=0;i<numQ;i++){
      const from = Math.floor(Math.random()*(totalAyah-1))+1;
      const len  = diff==='easy'?2:diff==='medium'?3:5;
      const to   = Math.min(from+len-1, totalAyah);
      questions.push({ q: `اتلُ من سورة ${surah} من آية ${from} إلى آية ${to}`, from, to, surah, type:'recite' });
    }
  } else {
    // Completion: parent reads first 3 words, child completes
    const starterAyahs = ['بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ','قُلْ هُوَ اللَّهُ أَحَدٌ','الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ','إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ','قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ'];
    for(let i=0;i<numQ;i++){
      const ayah = Math.floor(Math.random()*totalAyah)+1;
      const starter = starterAyahs[i%starterAyahs.length];
      questions.push({ q:`${tt('من سورة','From surah')} ${surah} ${tt('آية','verse')} ${ayah}: "${starter}..."`, ayah, surah, type:'complete', starter });
    }
  }

  window._examState = { surah, type, diff, questions, current:0, scores:[], startTime:Date.now() };
  document.getElementById('examSetup').style.display='none';
  showExamQuestion();
};

function showExamQuestion() {
  const state = window._examState;
  if (!state) return;
  const area = document.getElementById('examArea');
  if (!area) return;
  area.style.display='block';

  if (state.current >= state.questions.length) {
    // Show results
    showExamResults();
    return;
  }

  const q = state.questions[state.current];
  const qNum = state.current+1;
  const totalQ = state.questions.length;
  const progPct = Math.round((state.current/totalQ)*100);

  area.innerHTML = `
    <!-- Progress -->
    <div class="card" style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;font-size:.82rem;margin-bottom:8px">
        <span style="font-weight:700">${tt('السؤال','Question')} ${qNum} ${tt('من','of')} ${totalQ}</span>
        <span style="color:var(--emerald-light);font-weight:700">${progPct}%</span>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${progPct}%"></div></div>
    </div>

    <!-- Question card -->
    <div class="card" style="margin-bottom:16px;border:2px solid var(--emerald-mid)">
      <div style="text-align:center;padding:8px 0 16px">
        <div style="font-size:2.5rem;margin-bottom:8px">📖</div>
        <div style="font-size:1rem;font-weight:800;color:var(--text);line-height:1.7;
             font-family:'Amiri',serif;direction:rtl">${q.q}</div>
      </div>
      ${q.type==='recite'?`
        <div style="background:var(--emerald-glow);border-radius:10px;padding:12px;text-align:center;
             font-size:.82rem;color:var(--emerald-light);line-height:1.7">
          🎙️ ${currentLang === 'en'
            ? `Ask your child to recite Surah ${q.surah} from verse ${q.from} to verse ${q.to} by memory`
            : `اطلب من ابنك أن يتلو سورة ${q.surah} من آية ${q.from} إلى آية ${q.to} عن ظهر قلب`}
        </div>`:
        `<div style="background:var(--gold-pale);border-radius:10px;padding:12px;text-align:center;
             font-size:.82rem;color:var(--gold-light);line-height:1.7">
          ✍️ ${tt('اقرأ البداية لابنك واطلب منه إكمالها','Read the beginning to your child and ask them to complete it')}
        </div>`}
    </div>

    <!-- Rating -->
    <div class="card" style="margin-bottom:16px">
      <div class="card-title"><span class="ct-icon">⭐</span> ${tt('قيّم الأداء','Rate the performance')}</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
        ${[
          [100,'🌟',tt('ممتاز','Excellent'),'green'],
          [80,'✅',tt('جيد','Good'),'blue'],
          [60,'🟡',tt('متوسط','Average'),'gold'],
          [30,'❌',tt('يحتاج مراجعة','Needs Review'),'red'],
        ].map(([score,ic,lbl,c])=>`
          <button class="btn btn-sm" onclick="rateAnswer(${score})"
                  style="flex-direction:column;gap:4px;padding:12px 4px;height:auto;
                         transition:all .2s;font-size:.78rem"
                  onmouseenter="this.style.transform='scale(1.05)'"
                  onmouseleave="this.style.transform='scale(1)'">
            <span style="font-size:1.6rem">${ic}</span>
            <span style="font-weight:700">${lbl}</span>
          </button>`).join('')}
      </div>
    </div>
  `;
}

window.rateAnswer = function(score) {
  const state = window._examState;
  if (!state) return;
  state.scores.push(score);
  state.current++;
  showExamQuestion();
};

function showExamResults() {
  const state = window._examState;
  const s = getParentStudent();
  if (!s) return;
  const avgScore = Math.round(state.scores.reduce((a,v)=>a+v,0)/state.scores.length);
  const duration = Math.round((Date.now()-state.startTime)/1000);
  const area = document.getElementById('examArea');
  if (!area) return;

  const medal = avgScore>=90?'🥇':avgScore>=75?'🥈':avgScore>=60?'🥉':'📚';
  const grade = avgScore>=90?tt('ممتاز','Excellent'):avgScore>=75?tt('جيد جداً','Very Good'):avgScore>=60?tt('جيد','Good'):tt('يحتاج مراجعة','Needs Review');
  const color = avgScore>=75?'var(--emerald-light)':avgScore>=60?'var(--gold-light)':'var(--red)';

  // Save result
  if (!DB.rewards[s.id]) DB.rewards[s.id] = {bonus:0,exams:[]};
  if (!DB.rewards[s.id].exams) DB.rewards[s.id].exams = [];
  DB.rewards[s.id].exams.unshift({
    surah: state.surah,
    type: state.type,
    score: avgScore,
    date: new Date().toLocaleDateString('ar-SA'),
    diff: state.diff
  });
  if (!Array.isArray(s.exams)) s.exams = [];
  s.exams.unshift({
    surah: state.surah,
    type: state.type,
    score: avgScore,
    date: new Date().toISOString().split('T')[0],
    diff: state.diff
  });
  if (avgScore >= 90) {
    if (!Array.isArray(s.certificates)) s.certificates = [];
    s.certificates.unshift({
      id: Date.now(),
      type: 'surah-exam',
      title: 'شهادة إتقان سورة ' + state.surah,
      date: new Date().toISOString().split('T')[0],
      score: avgScore
    });
  }
  // Add points for exam
  DB.rewards[s.id].bonus = (DB.rewards[s.id].bonus||0) + Math.round(avgScore/10);
  if (typeof logAudit === 'function') logAudit('exam.parent', 'اختبار ولي الأمر للطالب: ' + s.name + ' - ' + avgScore + '%');
  saveDB();

  area.innerHTML = `
    <div class="card" style="text-align:center;margin-bottom:16px">
      <div style="font-size:4rem;margin-bottom:12px">${medal}</div>
      <div style="font-size:2rem;font-weight:900;color:${color}">${avgScore}%</div>
      <div style="font-size:1rem;font-weight:700;color:var(--text);margin-top:4px">${grade}</div>
      <div style="font-size:.78rem;color:var(--text-muted);margin-top:6px">
        ${tt('سورة','Surah')} ${state.surah} · ${state.scores.length} ${tt('أسئلة','questions')} · ${duration}${tt('ث','s')}
      </div>
      <div style="margin:16px 0">
        ${state.scores.map((sc,i)=>`
          <span style="display:inline-block;width:32px;height:32px;border-radius:50%;margin:3px;
               background:${sc>=80?'var(--emerald-glow)':sc>=60?'var(--gold-pale)':'var(--red-bg)'};
               border:2px solid ${sc>=80?'var(--emerald-mid)':sc>=60?'var(--border-gold)':'rgba(204,53,53,.3)'};
               color:${sc>=80?'var(--emerald-light)':sc>=60?'var(--gold-light)':'var(--red)'};
               font-size:.65rem;font-weight:800;line-height:28px">${sc}%</span>`).join('')}
      </div>
      <div style="background:${avgScore>=75?'var(--emerald-glow)':'var(--gold-pale)'};border-radius:10px;padding:10px;
           font-size:.82rem;color:${avgScore>=75?'var(--emerald-light)':'var(--gold-light)'};line-height:1.7;margin-bottom:16px">
        ${avgScore>=90
          ? tt('🌟 ممتاز! ابنك حفظ هذه السورة بشكل رائع!','🌟 Excellent! Your child has mastered this surah brilliantly!')
          : avgScore>=75
          ? tt('✅ أداء جيد جداً! قليل من المراجعة ويصبح مثالياً.','✅ Very good performance! A little more practice and it will be perfect.')
          : avgScore>=60
          ? tt('📚 جهد جيد! ركّز على الأجزاء الضعيفة وراجعها يومياً.','📚 Good effort! Focus on the weak parts and review them daily.')
          : tt('💪 واصل المراجعة! التكرار اليومي هو مفتاح الحفظ القوي.','💪 Keep practicing! Daily review is the key to strong memorization.')}
      </div>
      <div style="font-size:.78rem;color:var(--emerald-light);font-weight:700;margin-bottom:14px">
        +${Math.round(avgScore/10)} ⭐ ${tt('نقاط أُضيفت للمكافآت!','points added to rewards!')}
      </div>
      <div style="display:flex;gap:10px">
        <button class="btn btn-solid" style="flex:1" onclick="window._examState=null;document.getElementById('examSetup').style.display='block';document.getElementById('examArea').style.display='none';navigateTo('p-exam')">
          🔄 ${tt('اختبار جديد','New Exam')}
        </button>
        <button class="btn btn-gold" style="flex:1" onclick="navigateTo('rewards')">
          🏆 ${tt('عرض المكافآت','View Rewards')}
        </button>
      </div>
    </div>
  `;
}

pages['p-notifications'] = function(el) {
  const s = getParentStudent();
  const teacher = s ? DB.users.find(u=>u.id===s.teacher) : null;
  if (!s) { renderParentNoStudent(el); return; }

  const recLabels = currentLang === 'en'
    ? [['teacher','Teacher','📚', teacher?.name||'Circle Teacher'],['admin','Admin','👑','Memorization Center Admin']]
    : [['teacher','المعلم','📚', teacher?.name||'معلم الحلقة'],['admin','الإدارة','👑','إدارة مركز التحفيظ']];
  const typeOptions = currentLang === 'en' ? [
    ['question','Inquiry about student level'],['absence','Report a prior absence'],
    ['meeting','Request a meeting'],['concern','Concern about student progress'],
    ['thanks','Appreciation'],['suggestion','Suggestion'],
  ] : [
    ['question','استفسار عن مستوى الطالب'],['absence','إبلاغ عن غياب مسبق'],
    ['meeting','طلب موعد اجتماع'],['concern','قلق بشأن تقدم الطالب'],
    ['thanks','شكر وتقدير'],['suggestion','اقتراح'],
  ];
  const priorityOpts = currentLang === 'en'
    ? [['Normal','normal','green'],['Important','important','gold'],['Urgent','urgent','red']]
    : [['عادي','normal','green'],['مهم','important','gold'],['عاجل','urgent','red']];

  el.innerHTML = `
    <div class="grid-2" style="margin-bottom:20px">
      <div class="card">
        <div class="card-title"><span class="ct-icon">📤</span> ${tt('تواصل مع الحلقة','Contact the Circle')}</div>
        <div style="margin-bottom:12px">
          <div style="font-size:.82rem;font-weight:700;color:var(--gold-light);margin-bottom:8px">📬 ${tt('إلى','To')}</div>
          ${recLabels.map(([v,l,ic,sub])=>`
            <label id="p-rec-${v}" style="display:flex;align-items:center;gap:10px;padding:9px 12px;
                   border-radius:8px;border:1px solid var(--border);cursor:pointer;
                   background:var(--surface2);transition:all .2s;margin-bottom:6px"
                   onclick="parentToggleRec('${v}',this)">
              <div style="width:30px;height:30px;border-radius:50%;background:var(--emerald-glow);
                   display:flex;align-items:center;justify-content:center;font-size:.95rem">${ic}</div>
              <div style="flex:1">
                <div style="font-size:.83rem;font-weight:600">${l}</div>
                <div style="font-size:.68rem;color:var(--text-muted)">${sub}</div>
              </div>
              <div id="p-chk-${v}" style="width:18px;height:18px;border-radius:50%;
                   border:2px solid var(--border);display:flex;align-items:center;
                   justify-content:center;font-size:.6rem;transition:all .2s;flex-shrink:0"></div>
            </label>`).join('')}
        </div>
        <div class="field">
          <label>${tt('موضوع الرسالة','Message Subject')}</label>
          <select id="pNotifType">
            ${typeOptions.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label>${tt('الأولوية','Priority')}</label>
          <div style="display:flex;gap:8px;margin-top:4px">
            ${priorityOpts.map(([l,v,c])=>`
              <label style="display:flex;align-items:center;gap:5px;cursor:pointer;font-size:.8rem">
                <input type="radio" name="pPriority" value="${v}" ${v==='normal'?'checked':''}>
                <span class="badge ${c}" style="font-size:.7rem">${l}</span>
              </label>`).join('')}
          </div>
        </div>
        <div class="field">
          <label>${tt('نص الرسالة','Message')}</label>
          <textarea id="pNotifMsg" rows="3" placeholder="${tt('اكتب رسالتك...','Write your message...')}"
            style="width:100%;background:var(--surface2);border:1px solid var(--border);
                   border-radius:8px;padding:10px;color:var(--text);font-family:'Tajawal',sans-serif;
                   font-size:.9rem;resize:vertical;outline:none;line-height:1.6"
            onfocus="this.style.borderColor='var(--emerald-mid)'"
            onblur="this.style.borderColor=''"></textarea>
        </div>
        <button class="btn btn-solid" style="width:100%" onclick="parentSendNotif()">📤 ${tt('إرسال الرسالة','Send Message')}</button>
      </div>

      <div class="card">
        <div class="card-title"><span class="ct-icon">🔔</span> ${tt('إشعاراتي الواردة','My Notifications')} — ${s.name}</div>
        ${DB.notifications.length === 0 ? `<div style="color:var(--text-muted);font-size:.85rem;padding:12px 0;text-align:center">${t('noNotifs')}</div>` :
          DB.notifications.slice(0,5).map(n=>`
            <div class="notif-item ${n.type==='alert'?'alert':n.type==='warn'?'warn':''}">
              ${n.msg}<div class="notif-time">⏰ ${n.time}</div>
            </div>`).join('')}
      </div>
    </div>
  `;
};

window._pNotifRecs = new Set();
window.parentToggleRec = function(val, label) {
  const chk = document.getElementById('p-chk-'+val);
  if (window._pNotifRecs.has(val)) {
    window._pNotifRecs.delete(val);
    label.style.background='var(--surface2)'; label.style.borderColor='var(--border)';
    if(chk){chk.style.background='';chk.style.borderColor='var(--border)';chk.textContent='';}
  } else {
    window._pNotifRecs.add(val);
    label.style.background='var(--emerald-glow)'; label.style.borderColor='var(--emerald-mid)';
    if(chk){chk.style.background='var(--emerald-mid)';chk.style.borderColor='var(--emerald-mid)';chk.textContent='✓';chk.style.color='#fff';}
  }
};

window.parentSendNotif = function() {
  const recs = [...(window._pNotifRecs||[])];
  const msg  = document.getElementById('pNotifMsg')?.value?.trim();
  const priority = document.querySelector('input[name="pPriority"]:checked')?.value||'normal';

  if (recs.length === 0) { showToast('⚠️ يرجى اختيار جهة الإرسال (المعلم أو الإدارة)'); return; }
  if (!msg) { showToast('⚠️ يرجى كتابة نص الرسالة'); return; }

  const recMap = {teacher:'المعلم', admin:'الإدارة'};
  const recLabels = recs.map(v=>recMap[v]||v).join(' و');
  const nType = priority==='urgent'?'alert':priority==='important'?'warn':'info';
  const pIcon = priority==='urgent'?'🚨':priority==='important'?'⚠️':'📤';

  DB.notifications.unshift({id:Date.now(), type:nType, msg:`[رسالة ولي أمر] ${msg}`, time:'الآن'});
  saveDB();
  window._pNotifRecs = new Set();
  document.getElementById('pNotifMsg').value = '';
  ['teacher','admin'].forEach(v=>{
    const lbl=document.getElementById('p-rec-'+v);
    const chk=document.getElementById('p-chk-'+v);
    if(lbl){lbl.style.background='var(--surface2)';lbl.style.borderColor='var(--border)';}
    if(chk){chk.style.background='';chk.style.borderColor='var(--border)';chk.textContent='';}
  });
  showToast(pIcon + ' تم إرسال الرسالة إلى: ' + recLabels);
};

