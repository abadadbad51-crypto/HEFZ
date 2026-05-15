// ==============================
// FINANCE MODULE
// ==============================
var financeLedgerFilters = { q: '', type: '', month: '' };

function ensureFinanceDefaults() {
  DB.financeSettings = Object.assign({
    currency: 'SYP',
    defaultFee: 0,
    dueDay: 1,
    lateAfterDays: 10,
  }, DB.financeSettings || {});
  DB.transactions = Array.isArray(DB.transactions) ? DB.transactions : [];
  DB.transactions.forEach(tx => {
    tx.id = tx.id || Date.now() + Math.floor(Math.random() * 1000);
    tx.date = tx.date || new Date().toISOString().split('T')[0];
    tx.type = tx.type || 'charge';
    tx.category = tx.category || 'tuition';
    tx.amount = Number(tx.amount) || 0;
    tx.status = tx.status || (tx.type === 'charge' ? 'due' : 'completed');
  });
}

function financeCurrency() {
  ensureFinanceDefaults();
  return DB.financeSettings.currency || 'SYP';
}

function money(amount) {
  const value = Math.round((Number(amount) || 0) * 100) / 100;
  return value.toLocaleString(currentLang === 'en' ? 'en-US' : 'ar-SY') + ' ' + financeCurrency();
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function monthKey(date) {
  return String(date || todayISO()).slice(0, 7);
}

function nextFinanceId() {
  ensureFinanceDefaults();
  return DB.transactions.length ? Math.max.apply(null, DB.transactions.map(tx => Number(tx.id) || 0)) + 1 : 1;
}

function financeStudentName(id) {
  const s = DB.students.find(st => Number(st.id) === Number(id));
  return s ? s.name : (currentLang === 'en' ? 'General' : 'عام');
}

function financeParentForStudent(studentId) {
  return DB.users.find(u => u.role === 'parent' && Number(u.studentId) === Number(studentId)) || null;
}

function txSign(tx) {
  if (tx.type === 'charge' || tx.type === 'refund') return 1;
  if (tx.type === 'payment' || tx.type === 'discount') return -1;
  return 0;
}

function studentFinanceSummary(studentId) {
  ensureFinanceDefaults();
  const txs = DB.transactions.filter(tx => Number(tx.studentId) === Number(studentId) && tx.type !== 'expense');
  const charges = txs.filter(tx => tx.type === 'charge').reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  const payments = txs.filter(tx => tx.type === 'payment').reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  const discounts = txs.filter(tx => tx.type === 'discount').reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  const refunds = txs.filter(tx => tx.type === 'refund').reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  const balance = charges + refunds - payments - discounts;
  const lastPayment = txs.filter(tx => tx.type === 'payment').sort((a, b) => String(b.date).localeCompare(String(a.date)))[0] || null;
  const nextDue = txs.filter(tx => tx.type === 'charge').sort((a, b) => String(a.dueDate || a.date).localeCompare(String(b.dueDate || b.date)))[0] || null;
  return { txs, charges, payments, discounts, refunds, balance, lastPayment, nextDue };
}

function financeTotals() {
  ensureFinanceDefaults();
  const charges = DB.transactions.filter(tx => tx.type === 'charge').reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  const payments = DB.transactions.filter(tx => tx.type === 'payment').reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  const discounts = DB.transactions.filter(tx => tx.type === 'discount').reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  const refunds = DB.transactions.filter(tx => tx.type === 'refund').reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  const expenses = DB.transactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  return {
    charges,
    payments,
    discounts,
    refunds,
    expenses,
    outstanding: charges + refunds - payments - discounts,
    netCash: payments - refunds - expenses,
  };
}

function financeStatusBadge(balance) {
  if (balance <= 0) return `<span class="badge green">${currentLang === 'en' ? 'Paid' : 'مسدد'}</span>`;
  return `<span class="badge red">${currentLang === 'en' ? 'Due' : 'مستحق'}</span>`;
}

function financeTypeLabel(type) {
  const ar = {charge:'استحقاق', payment:'دفعة', discount:'خصم', refund:'استرداد', expense:'مصروف'};
  const en = {charge:'Charge', payment:'Payment', discount:'Discount', refund:'Refund', expense:'Expense'};
  return (currentLang === 'en' ? en : ar)[type] || type;
}

function financeCategoryLabel(category) {
  const ar = {tuition:'رسوم شهرية', registration:'تسجيل', books:'كتب ومستلزمات', transport:'نقل', activity:'نشاط', salary:'رواتب', rent:'إيجار', utilities:'خدمات', maintenance:'صيانة', other:'أخرى'};
  const en = {tuition:'Monthly fee', registration:'Registration', books:'Books & supplies', transport:'Transport', activity:'Activity', salary:'Salaries', rent:'Rent', utilities:'Utilities', maintenance:'Maintenance', other:'Other'};
  return (currentLang === 'en' ? en : ar)[category] || category || '—';
}

function addFinanceTransaction(data) {
  ensureFinanceDefaults();
  const amount = Number(data.amount);
  if (!amount || amount <= 0) {
    showToast('⚠️ ' + (currentLang === 'en' ? 'Enter a valid amount' : 'أدخل مبلغاً صحيحاً'));
    return null;
  }
  const studentId = data.type === 'expense' ? null : Number(data.studentId);
  if (data.type !== 'expense' && !DB.students.some(s => Number(s.id) === studentId)) {
    showToast('⚠️ ' + (currentLang === 'en' ? 'Select a student' : 'اختر الطالب'));
    return null;
  }
  const parent = studentId ? financeParentForStudent(studentId) : null;
  const tx = {
    id: nextFinanceId(),
    type: data.type,
    category: data.category || 'tuition',
    studentId,
    parentId: parent ? parent.id : null,
    amount,
    date: data.date || todayISO(),
    dueDate: data.dueDate || data.date || todayISO(),
    method: data.method || '',
    reference: data.reference || ('FIN-' + Date.now().toString(36).toUpperCase()),
    notes: data.notes || '',
    status: data.type === 'charge' ? 'due' : 'completed',
    createdBy: currentUser ? currentUser.id : null,
    createdAt: new Date().toISOString(),
  };
  DB.transactions.unshift(tx);
  if (typeof logAudit === 'function') logAudit('finance.' + tx.type, financeTypeLabel(tx.type) + ': ' + money(tx.amount) + ' - ' + financeStudentName(tx.studentId));
  saveDB();
  return tx;
}

function dueDateForMonth(month) {
  ensureFinanceDefaults();
  const day = Math.max(1, Math.min(28, Number(DB.financeSettings.dueDay) || 1));
  return month + '-' + String(day).padStart(2, '0');
}

function monthHasTuitionCharge(studentId, month) {
  return DB.transactions.some(tx =>
    tx.type === 'charge' &&
    tx.category === 'tuition' &&
    Number(tx.studentId) === Number(studentId) &&
    monthKey(tx.dueDate || tx.date) === month
  );
}

window.generateMonthlyFees = function() {
  ensureFinanceDefaults();
  const month = document.getElementById('financeMonth')?.value || monthKey(todayISO());
  const amount = Number(document.getElementById('financeMonthlyAmount')?.value || DB.financeSettings.defaultFee);
  const onlyActive = document.getElementById('financeOnlyActive')?.checked !== false;
  if (!amount || amount <= 0) {
    showToast('⚠️ ' + (currentLang === 'en' ? 'Set the monthly fee first' : 'حدد قيمة الرسوم الشهرية أولاً'));
    return;
  }
  let created = 0;
  DB.students.forEach(s => {
    if (onlyActive && s.status && s.status !== 'active') return;
    if (monthHasTuitionCharge(s.id, month)) return;
    addFinanceTransaction({
      type: 'charge',
      category: 'tuition',
      studentId: s.id,
      amount,
      date: todayISO(),
      dueDate: dueDateForMonth(month),
      notes: (currentLang === 'en' ? 'Monthly fee for ' : 'رسوم شهر ') + month,
    });
    created += 1;
  });
  showToast('✅ ' + (currentLang === 'en' ? 'Generated fees for ' : 'تم إنشاء رسوم لـ ') + created + (currentLang === 'en' ? ' student(s)' : ' طالب'));
  navigateTo('finance');
};

window.saveFinanceSettings = function() {
  ensureFinanceDefaults();
  DB.financeSettings.currency = (document.getElementById('financeCurrency')?.value || 'SYP').trim() || 'SYP';
  DB.financeSettings.defaultFee = Number(document.getElementById('financeDefaultFee')?.value) || 0;
  DB.financeSettings.dueDay = Math.max(1, Math.min(28, Number(document.getElementById('financeDueDay')?.value) || 1));
  DB.financeSettings.lateAfterDays = Math.max(0, Number(document.getElementById('financeLateAfter')?.value) || 0);
  if (typeof logAudit === 'function') logAudit('finance.settings', 'تحديث إعدادات النظام المالي');
  saveDB();
  showToast('✅ ' + (currentLang === 'en' ? 'Finance settings saved' : 'تم حفظ إعدادات النظام المالي'));
  navigateTo('finance');
};

window.recordFinancePayment = function() {
  const tx = addFinanceTransaction({
    type: document.getElementById('financeTxType')?.value || 'payment',
    category: document.getElementById('financeTxCategory')?.value || 'tuition',
    studentId: document.getElementById('financeTxStudent')?.value,
    amount: document.getElementById('financeTxAmount')?.value,
    date: document.getElementById('financeTxDate')?.value || todayISO(),
    dueDate: document.getElementById('financeTxDueDate')?.value || todayISO(),
    method: document.getElementById('financeTxMethod')?.value || '',
    notes: document.getElementById('financeTxNotes')?.value || '',
  });
  if (tx) {
    showToast('✅ ' + (currentLang === 'en' ? 'Transaction saved' : 'تم حفظ العملية المالية'));
    navigateTo('finance');
  }
};

window.recordFinanceExpense = function() {
  const tx = addFinanceTransaction({
    type: 'expense',
    category: document.getElementById('financeExpenseCategory')?.value || 'other',
    amount: document.getElementById('financeExpenseAmount')?.value,
    date: document.getElementById('financeExpenseDate')?.value || todayISO(),
    method: document.getElementById('financeExpenseMethod')?.value || '',
    notes: document.getElementById('financeExpenseNotes')?.value || '',
  });
  if (tx) {
    showToast('✅ ' + (currentLang === 'en' ? 'Expense saved' : 'تم حفظ المصروف'));
    navigateTo('finance');
  }
};

window.deleteFinanceTransaction = function(id) {
  const tx = DB.transactions.find(item => Number(item.id) === Number(id));
  if (!tx) return;
  if (!confirm(currentLang === 'en' ? 'Delete this financial transaction?' : 'حذف هذه العملية المالية؟')) return;
  DB.transactions = DB.transactions.filter(item => Number(item.id) !== Number(id));
  if (typeof logAudit === 'function') logAudit('finance.delete', 'حذف عملية مالية: ' + tx.reference);
  saveDB();
  showToast('✅ ' + (currentLang === 'en' ? 'Transaction deleted' : 'تم حذف العملية'));
  navigateTo(currentPage || 'finance');
};

window.openFinanceReceipt = function(id) {
  const tx = DB.transactions.find(item => Number(item.id) === Number(id));
  if (!tx) return;
  const s = DB.students.find(st => Number(st.id) === Number(tx.studentId));
  const parent = s ? financeParentForStudent(s.id) : null;
  openModal(currentLang === 'en' ? 'Receipt' : 'إيصال مالي', `
    <div id="financeReceipt" style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:18px;line-height:1.9">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:14px">
        <div>
          <div style="font-weight:900;font-size:1.05rem">${escapeHtml(INSTITUTE.name)}</div>
          <div style="font-size:.78rem;color:var(--text-muted)">${escapeHtml(INSTITUTE.subtitle)} - ${escapeHtml(INSTITUTE.city)}</div>
        </div>
        <div style="text-align:end">
          <div style="font-weight:900;color:var(--gold-light)">${escapeHtml(tx.reference || '')}</div>
          <div style="font-size:.78rem;color:var(--text-muted)">${escapeHtml(tx.date)}</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
        <div><strong>${currentLang === 'en' ? 'Student' : 'الطالب'}:</strong> ${escapeHtml(s?.name || '—')}</div>
        <div><strong>${currentLang === 'en' ? 'Parent' : 'ولي الأمر'}:</strong> ${escapeHtml(parent?.name || '—')}</div>
        <div><strong>${currentLang === 'en' ? 'Type' : 'النوع'}:</strong> ${financeTypeLabel(tx.type)}</div>
        <div><strong>${currentLang === 'en' ? 'Category' : 'البند'}:</strong> ${financeCategoryLabel(tx.category)}</div>
        <div><strong>${currentLang === 'en' ? 'Method' : 'طريقة الدفع'}:</strong> ${escapeHtml(tx.method || '—')}</div>
        <div><strong>${currentLang === 'en' ? 'Amount' : 'المبلغ'}:</strong> <span style="font-weight:900;color:var(--emerald-light)">${money(tx.amount)}</span></div>
      </div>
      ${tx.notes ? `<div style="border-top:1px solid var(--border);padding-top:10px;color:var(--text-muted)">${escapeHtml(tx.notes)}</div>` : ''}
    </div>
    <button class="btn btn-solid" style="width:100%;margin-top:14px" onclick="window.print()">🖨️ ${currentLang === 'en' ? 'Print' : 'طباعة'}</button>
  `);
};

function financeStudentOptions(selectedId) {
  return DB.students.map(s => `<option value="${s.id}" ${Number(selectedId) === Number(s.id) ? 'selected' : ''}>${escapeHtml(s.name)} - ${escapeHtml(s.circle || '')}</option>`).join('');
}

function renderFinanceTransactions(limit) {
  ensureFinanceDefaults();
  const q = String(financeLedgerFilters.q || '').trim().toLowerCase();
  const type = financeLedgerFilters.type || '';
  const month = financeLedgerFilters.month || '';
  let txs = DB.transactions.slice();
  if (type) txs = txs.filter(tx => tx.type === type);
  if (month) txs = txs.filter(tx => monthKey(tx.date) === month || monthKey(tx.dueDate) === month);
  if (q) {
    txs = txs.filter(tx => [financeStudentName(tx.studentId), tx.reference, tx.notes, financeCategoryLabel(tx.category), financeTypeLabel(tx.type)]
      .join(' ').toLowerCase().includes(q));
  }
  txs.sort((a, b) => String(b.date).localeCompare(String(a.date)) || Number(b.id) - Number(a.id));
  if (limit) txs = txs.slice(0, limit);
  return txs.length ? `
    <div class="table-wrap">
      <table>
        <thead><tr>
          <th>${currentLang === 'en' ? 'Date' : 'التاريخ'}</th>
          <th>${currentLang === 'en' ? 'Type' : 'النوع'}</th>
          <th>${currentLang === 'en' ? 'Student' : 'الطالب'}</th>
          <th>${currentLang === 'en' ? 'Category' : 'البند'}</th>
          <th>${currentLang === 'en' ? 'Amount' : 'المبلغ'}</th>
          <th>${currentLang === 'en' ? 'Method' : 'الطريقة'}</th>
          <th>${currentLang === 'en' ? 'Action' : 'إجراء'}</th>
        </tr></thead>
        <tbody>
          ${txs.map(tx => `
            <tr>
              <td style="color:var(--text-muted)">${escapeHtml(tx.date || '')}</td>
              <td><span class="badge ${tx.type === 'payment' ? 'green' : tx.type === 'charge' ? 'gold' : tx.type === 'expense' ? 'red' : 'blue'}">${financeTypeLabel(tx.type)}</span></td>
              <td>${escapeHtml(financeStudentName(tx.studentId))}</td>
              <td>${financeCategoryLabel(tx.category)}</td>
              <td style="font-weight:900;color:${tx.type === 'expense' ? 'var(--red)' : txSign(tx) < 0 ? 'var(--emerald-light)' : 'var(--gold-light)'}">${money(tx.amount)}</td>
              <td>${escapeHtml(tx.method || '—')}</td>
              <td style="white-space:nowrap">
                <button class="btn btn-green btn-sm" onclick="openFinanceReceipt(${tx.id})">🧾</button>
                <button class="btn btn-sm" style="background:var(--red-bg);color:var(--red);border:none" onclick="deleteFinanceTransaction(${tx.id})">🗑</button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>` : `<div style="text-align:center;padding:28px;color:var(--text-muted)">${currentLang === 'en' ? 'No financial transactions yet' : 'لا توجد عمليات مالية بعد'}</div>`;
}

window.financeApplyFilters = function() {
  financeLedgerFilters = {
    q: document.getElementById('financeSearch')?.value || '',
    type: document.getElementById('financeFilterType')?.value || '',
    month: document.getElementById('financeFilterMonth')?.value || '',
  };
  const ledger = document.getElementById('financeLedgerTable');
  if (ledger) ledger.innerHTML = renderFinanceTransactions();
};

function renderFinanceBalances() {
  if (!DB.students.length) {
    return `<div style="text-align:center;padding:28px;color:var(--text-muted)">${currentLang === 'en' ? 'Add students first' : 'أضف الطلاب أولاً'}</div>`;
  }
  return `
    <div class="table-wrap">
      <table>
        <thead><tr>
          <th>${currentLang === 'en' ? 'Student' : 'الطالب'}</th>
          <th>${currentLang === 'en' ? 'Circle' : 'الحلقة'}</th>
          <th>${currentLang === 'en' ? 'Charges' : 'المستحقات'}</th>
          <th>${currentLang === 'en' ? 'Paid' : 'المدفوع'}</th>
          <th>${currentLang === 'en' ? 'Discounts' : 'الخصومات'}</th>
          <th>${currentLang === 'en' ? 'Balance' : 'الرصيد'}</th>
          <th>${currentLang === 'en' ? 'Status' : 'الحالة'}</th>
          <th>${currentLang === 'en' ? 'Action' : 'إجراء'}</th>
        </tr></thead>
        <tbody>
          ${DB.students.map(s => {
            const sum = studentFinanceSummary(s.id);
            return `
              <tr>
                <td>${escapeHtml(s.name)}</td>
                <td>${escapeHtml(s.circle || '—')}</td>
                <td>${money(sum.charges + sum.refunds)}</td>
                <td style="color:var(--emerald-light);font-weight:800">${money(sum.payments)}</td>
                <td>${money(sum.discounts)}</td>
                <td style="font-weight:900;color:${sum.balance > 0 ? 'var(--red)' : 'var(--emerald-light)'}">${money(sum.balance)}</td>
                <td>${financeStatusBadge(sum.balance)}</td>
                <td><button class="btn btn-solid btn-sm" onclick="openStudentFinance(${s.id})">${currentLang === 'en' ? 'Open' : 'فتح'}</button></td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

window.openStudentFinance = function(studentId) {
  const s = DB.students.find(st => Number(st.id) === Number(studentId));
  if (!s) return;
  const sum = studentFinanceSummary(studentId);
  openModal((currentLang === 'en' ? 'Financial account: ' : 'الحساب المالي: ') + s.name, `
    <div class="grid-3" style="margin-bottom:14px">
      <div class="stat-box"><div class="stat-icon gold">📌</div><div><div class="stat-val">${money(sum.charges + sum.refunds)}</div><div class="stat-lbl">${currentLang === 'en' ? 'Total due' : 'إجمالي المستحق'}</div></div></div>
      <div class="stat-box"><div class="stat-icon green">✅</div><div><div class="stat-val">${money(sum.payments + sum.discounts)}</div><div class="stat-lbl">${currentLang === 'en' ? 'Paid/discounted' : 'مدفوع/مخصوم'}</div></div></div>
      <div class="stat-box"><div class="stat-icon red">⚠️</div><div><div class="stat-val">${money(sum.balance)}</div><div class="stat-lbl">${currentLang === 'en' ? 'Balance' : 'الرصيد'}</div></div></div>
    </div>
    ${sum.txs.length ? `
      <div class="table-wrap">
        <table>
          <thead><tr><th>${t('thDate')}</th><th>${currentLang === 'en' ? 'Type' : 'النوع'}</th><th>${currentLang === 'en' ? 'Category' : 'البند'}</th><th>${currentLang === 'en' ? 'Amount' : 'المبلغ'}</th><th>${t('thNotes')}</th></tr></thead>
          <tbody>${sum.txs.map(tx => `<tr><td>${escapeHtml(tx.date)}</td><td>${financeTypeLabel(tx.type)}</td><td>${financeCategoryLabel(tx.category)}</td><td>${money(tx.amount)}</td><td>${escapeHtml(tx.notes || '—')}</td></tr>`).join('')}</tbody>
        </table>
      </div>` : `<div style="text-align:center;padding:22px;color:var(--text-muted)">${currentLang === 'en' ? 'No transactions for this student' : 'لا توجد عمليات لهذا الطالب'}</div>`}
  `);
};

pages['finance'] = function(el) {
  ensureFinanceDefaults();
  const isEn = currentLang === 'en';
  const totals = financeTotals();
  const currentMonth = monthKey(todayISO());
  el.innerHTML = `
    <div class="grid-4" style="margin-bottom:18px">
      ${[
        ['💵', isEn ? 'Collected' : 'المقبوضات', money(totals.payments), 'var(--emerald-light)'],
        ['📌', isEn ? 'Outstanding' : 'المستحقات', money(totals.outstanding), 'var(--red)'],
        ['🎟️', isEn ? 'Discounts' : 'الخصومات', money(totals.discounts), 'var(--gold-light)'],
        ['📤', isEn ? 'Expenses' : 'المصروفات', money(totals.expenses), 'var(--blue)'],
      ].map(([ic, label, value, color]) => `
        <div class="stat-box">
          <div class="stat-icon" style="background:${color}18">${ic}</div>
          <div><div class="stat-val" style="color:${color};font-size:1.05rem">${value}</div><div class="stat-lbl">${label}</div></div>
        </div>`).join('')}
    </div>

    <div class="grid-2" style="margin-bottom:18px">
      <div class="card">
        <div class="card-title"><span class="ct-icon">⚙️</span> ${isEn ? 'Finance Settings' : 'إعدادات المالية'}</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">
          <div class="field"><label>${isEn ? 'Currency' : 'العملة'}</label><input id="financeCurrency" value="${escapeHtml(DB.financeSettings.currency)}"></div>
          <div class="field"><label>${isEn ? 'Default monthly fee' : 'الرسوم الشهرية الافتراضية'}</label><input id="financeDefaultFee" type="number" min="0" value="${Number(DB.financeSettings.defaultFee) || 0}"></div>
          <div class="field"><label>${isEn ? 'Due day' : 'يوم الاستحقاق'}</label><input id="financeDueDay" type="number" min="1" max="28" value="${Number(DB.financeSettings.dueDay) || 1}"></div>
          <div class="field"><label>${isEn ? 'Late after days' : 'تأخير بعد أيام'}</label><input id="financeLateAfter" type="number" min="0" value="${Number(DB.financeSettings.lateAfterDays) || 0}"></div>
        </div>
        <button class="btn btn-solid" style="width:100%" onclick="saveFinanceSettings()">💾 ${isEn ? 'Save settings' : 'حفظ الإعدادات'}</button>
      </div>

      <div class="card">
        <div class="card-title"><span class="ct-icon">📆</span> ${isEn ? 'Generate Monthly Fees' : 'إنشاء الرسوم الشهرية'}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div class="field"><label>${isEn ? 'Month' : 'الشهر'}</label><input id="financeMonth" type="month" value="${currentMonth}"></div>
          <div class="field"><label>${isEn ? 'Amount' : 'المبلغ'}</label><input id="financeMonthlyAmount" type="number" min="0" value="${Number(DB.financeSettings.defaultFee) || 0}"></div>
        </div>
        <label style="display:flex;gap:8px;align-items:center;margin-bottom:12px;font-size:.82rem;color:var(--text-muted)">
          <input id="financeOnlyActive" type="checkbox" checked> ${isEn ? 'Only active students' : 'للطلاب النشطين فقط'}
        </label>
        <button class="btn btn-gold" style="width:100%" onclick="generateMonthlyFees()">➕ ${isEn ? 'Create due charges' : 'إنشاء المستحقات'}</button>
      </div>
    </div>

    <div class="grid-2" style="margin-bottom:18px">
      <div class="card">
        <div class="card-title"><span class="ct-icon">🧾</span> ${isEn ? 'Student Transaction' : 'عملية مالية للطالب'}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div class="field"><label>${isEn ? 'Student' : 'الطالب'}</label><select id="financeTxStudent">${financeStudentOptions()}</select></div>
          <div class="field"><label>${isEn ? 'Type' : 'النوع'}</label><select id="financeTxType"><option value="payment">${isEn ? 'Payment' : 'دفعة'}</option><option value="charge">${isEn ? 'Charge' : 'استحقاق'}</option><option value="discount">${isEn ? 'Discount' : 'خصم'}</option><option value="refund">${isEn ? 'Refund' : 'استرداد'}</option></select></div>
          <div class="field"><label>${isEn ? 'Category' : 'البند'}</label><select id="financeTxCategory"><option value="tuition">${financeCategoryLabel('tuition')}</option><option value="registration">${financeCategoryLabel('registration')}</option><option value="books">${financeCategoryLabel('books')}</option><option value="transport">${financeCategoryLabel('transport')}</option><option value="activity">${financeCategoryLabel('activity')}</option><option value="other">${financeCategoryLabel('other')}</option></select></div>
          <div class="field"><label>${isEn ? 'Amount' : 'المبلغ'}</label><input id="financeTxAmount" type="number" min="0"></div>
          <div class="field"><label>${isEn ? 'Date' : 'التاريخ'}</label><input id="financeTxDate" type="date" value="${todayISO()}"></div>
          <div class="field"><label>${isEn ? 'Due date' : 'تاريخ الاستحقاق'}</label><input id="financeTxDueDate" type="date" value="${todayISO()}"></div>
          <div class="field"><label>${isEn ? 'Method' : 'طريقة الدفع'}</label><select id="financeTxMethod"><option value="cash">${isEn ? 'Cash' : 'نقداً'}</option><option value="transfer">${isEn ? 'Transfer' : 'تحويل'}</option><option value="card">${isEn ? 'Card' : 'بطاقة'}</option><option value="other">${isEn ? 'Other' : 'أخرى'}</option></select></div>
          <div class="field"><label>${isEn ? 'Notes' : 'ملاحظات'}</label><input id="financeTxNotes"></div>
        </div>
        <button class="btn btn-solid" style="width:100%" onclick="recordFinancePayment()">✅ ${isEn ? 'Save transaction' : 'حفظ العملية'}</button>
      </div>

      <div class="card">
        <div class="card-title"><span class="ct-icon">📤</span> ${isEn ? 'Institute Expense' : 'مصروف للمعهد'}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div class="field"><label>${isEn ? 'Category' : 'البند'}</label><select id="financeExpenseCategory"><option value="salary">${financeCategoryLabel('salary')}</option><option value="rent">${financeCategoryLabel('rent')}</option><option value="utilities">${financeCategoryLabel('utilities')}</option><option value="maintenance">${financeCategoryLabel('maintenance')}</option><option value="books">${financeCategoryLabel('books')}</option><option value="other">${financeCategoryLabel('other')}</option></select></div>
          <div class="field"><label>${isEn ? 'Amount' : 'المبلغ'}</label><input id="financeExpenseAmount" type="number" min="0"></div>
          <div class="field"><label>${isEn ? 'Date' : 'التاريخ'}</label><input id="financeExpenseDate" type="date" value="${todayISO()}"></div>
          <div class="field"><label>${isEn ? 'Method' : 'طريقة الدفع'}</label><select id="financeExpenseMethod"><option value="cash">${isEn ? 'Cash' : 'نقداً'}</option><option value="transfer">${isEn ? 'Transfer' : 'تحويل'}</option><option value="card">${isEn ? 'Card' : 'بطاقة'}</option><option value="other">${isEn ? 'Other' : 'أخرى'}</option></select></div>
          <div class="field" style="grid-column:1/-1"><label>${isEn ? 'Notes' : 'ملاحظات'}</label><input id="financeExpenseNotes"></div>
        </div>
        <button class="btn btn-gold" style="width:100%" onclick="recordFinanceExpense()">📤 ${isEn ? 'Save expense' : 'حفظ المصروف'}</button>
      </div>
    </div>

    <div class="card" style="margin-bottom:18px">
      <div class="section-hdr">
        <h2 class="card-title" style="margin:0"><span class="ct-icon">👥</span> ${isEn ? 'Student Balances' : 'أرصدة الطلاب'}</h2>
        <button class="btn btn-green btn-sm" onclick="window.print()">🖨️ ${isEn ? 'Print' : 'طباعة'}</button>
      </div>
      ${renderFinanceBalances()}
    </div>

    <div class="card">
      <div class="section-hdr">
        <h2 class="card-title" style="margin:0"><span class="ct-icon">📚</span> ${isEn ? 'Transactions Ledger' : 'سجل العمليات المالية'}</h2>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
        <input id="financeSearch" value="${escapeHtml(financeLedgerFilters.q)}" oninput="financeApplyFilters()" placeholder="🔍 ${isEn ? 'Search' : 'بحث'}" style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:8px 12px;color:var(--text);font-family:'Tajawal',sans-serif;flex:1;min-width:180px">
        <select id="financeFilterType" onchange="financeApplyFilters()" style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:8px 12px;color:var(--text);font-family:'Tajawal',sans-serif"><option value="">${isEn ? 'All types' : 'كل الأنواع'}</option><option value="charge" ${financeLedgerFilters.type === 'charge' ? 'selected' : ''}>${financeTypeLabel('charge')}</option><option value="payment" ${financeLedgerFilters.type === 'payment' ? 'selected' : ''}>${financeTypeLabel('payment')}</option><option value="discount" ${financeLedgerFilters.type === 'discount' ? 'selected' : ''}>${financeTypeLabel('discount')}</option><option value="refund" ${financeLedgerFilters.type === 'refund' ? 'selected' : ''}>${financeTypeLabel('refund')}</option><option value="expense" ${financeLedgerFilters.type === 'expense' ? 'selected' : ''}>${financeTypeLabel('expense')}</option></select>
        <input id="financeFilterMonth" type="month" value="${escapeHtml(financeLedgerFilters.month)}" onchange="financeApplyFilters()" style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:8px 12px;color:var(--text);font-family:'Tajawal',sans-serif">
      </div>
      <div id="financeLedgerTable">${renderFinanceTransactions()}</div>
    </div>
  `;
};

pages['p-finance'] = function(el) {
  ensureFinanceDefaults();
  const s = typeof getParentStudent === 'function' ? getParentStudent() : null;
  if (!s) { renderParentNoStudent(el); return; }
  const sum = studentFinanceSummary(s.id);
  const isEn = currentLang === 'en';
  el.innerHTML = `
    <div class="grid-3" style="margin-bottom:18px">
      <div class="stat-box"><div class="stat-icon gold">📌</div><div><div class="stat-val">${money(sum.charges + sum.refunds)}</div><div class="stat-lbl">${isEn ? 'Total due' : 'إجمالي المستحق'}</div></div></div>
      <div class="stat-box"><div class="stat-icon green">✅</div><div><div class="stat-val">${money(sum.payments + sum.discounts)}</div><div class="stat-lbl">${isEn ? 'Paid/discounted' : 'مدفوع/مخصوم'}</div></div></div>
      <div class="stat-box"><div class="stat-icon red">⚠️</div><div><div class="stat-val">${money(sum.balance)}</div><div class="stat-lbl">${isEn ? 'Remaining' : 'المتبقي'}</div></div></div>
    </div>
    <div class="card" style="margin-bottom:18px">
      <div class="card-title"><span class="ct-icon">👦</span> ${escapeHtml(s.name)}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <span class="badge blue">${escapeHtml(s.circle || '—')}</span>
        ${financeStatusBadge(sum.balance)}
        ${sum.lastPayment ? `<span class="badge green">${isEn ? 'Last payment' : 'آخر دفعة'}: ${escapeHtml(sum.lastPayment.date)} - ${money(sum.lastPayment.amount)}</span>` : ''}
      </div>
    </div>
    <div class="card">
      <div class="card-title"><span class="ct-icon">🧾</span> ${isEn ? 'Financial Statement' : 'كشف الحساب المالي'}</div>
      ${sum.txs.length ? `
        <div class="table-wrap">
          <table>
            <thead><tr><th>${t('thDate')}</th><th>${isEn ? 'Type' : 'النوع'}</th><th>${isEn ? 'Category' : 'البند'}</th><th>${isEn ? 'Amount' : 'المبلغ'}</th><th>${t('thNotes')}</th><th>${isEn ? 'Receipt' : 'إيصال'}</th></tr></thead>
            <tbody>
              ${sum.txs.map(tx => `<tr><td>${escapeHtml(tx.date)}</td><td>${financeTypeLabel(tx.type)}</td><td>${financeCategoryLabel(tx.category)}</td><td style="font-weight:900">${money(tx.amount)}</td><td>${escapeHtml(tx.notes || '—')}</td><td><button class="btn btn-green btn-sm" onclick="openFinanceReceipt(${tx.id})">🧾</button></td></tr>`).join('')}
            </tbody>
          </table>
        </div>` : `<div style="text-align:center;padding:32px;color:var(--text-muted)">${isEn ? 'No financial transactions yet' : 'لا توجد عمليات مالية بعد'}</div>`}
    </div>
  `;
};
