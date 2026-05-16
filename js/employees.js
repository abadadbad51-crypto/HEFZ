// ==============================
// EMPLOYEES MODULE
// ==============================
function ensureEmployeesDefaults() {
  DB.employees = Array.isArray(DB.employees) ? DB.employees : [];
  DB.employees.forEach(emp => {
    emp.id = emp.id || Date.now() + Math.floor(Math.random() * 1000);
    emp.name = emp.name || '';
    emp.department = emp.department || 'administration';
    emp.position = emp.position || '';
    emp.phone = emp.phone || '';
    emp.email = emp.email || '';
    emp.salary = Number(emp.salary) || 0;
    emp.hireDate = emp.hireDate || new Date().toISOString().split('T')[0];
    emp.status = emp.status || 'active';
    emp.notes = emp.notes || '';
  });
}

function nextEmployeeId() {
  ensureEmployeesDefaults();
  return DB.employees.length ? Math.max.apply(null, DB.employees.map(emp => Number(emp.id) || 0)) + 1 : 1;
}

function employeeDepartmentLabel(dept) {
  const ar = {administration:'الإدارة', finance:'المالية', reception:'الاستقبال', services:'الخدمات', transport:'النقل', security:'الأمن', education:'التعليم', other:'أخرى'};
  const en = {administration:'Administration', finance:'Finance', reception:'Reception', services:'Services', transport:'Transport', security:'Security', education:'Education', other:'Other'};
  return (currentLang === 'en' ? en : ar)[dept] || dept || '—';
}

function employeeStatusBadge(status) {
  const active = status !== 'inactive';
  return `<span class="badge ${active ? 'green' : 'red'}">${active ? (currentLang === 'en' ? 'Active' : 'نشط') : (currentLang === 'en' ? 'Inactive' : 'غير نشط')}</span>`;
}

function employeeMoney(amount) {
  if (typeof window.money === 'function') return window.money(amount);
  return (Number(amount) || 0).toLocaleString(currentLang === 'en' ? 'en-US' : 'ar-SY');
}

function employeeOptionsHtml(selected) {
  const departments = ['administration','finance','reception','services','transport','security','education','other'];
  return departments.map(dept => `<option value="${dept}" ${selected === dept ? 'selected' : ''}>${employeeDepartmentLabel(dept)}</option>`).join('');
}

function getEmployeeFormData(id) {
  return {
    id: id || nextEmployeeId(),
    name: (document.getElementById('empName')?.value || '').trim(),
    position: (document.getElementById('empPosition')?.value || '').trim(),
    department: document.getElementById('empDepartment')?.value || 'administration',
    phone: (document.getElementById('empPhone')?.value || '').trim(),
    email: (document.getElementById('empEmail')?.value || '').trim(),
    salary: Number(document.getElementById('empSalary')?.value) || 0,
    hireDate: document.getElementById('empHireDate')?.value || new Date().toISOString().split('T')[0],
    status: document.getElementById('empStatus')?.value || 'active',
    notes: (document.getElementById('empNotes')?.value || '').trim(),
  };
}

function employeeFormHtml(emp) {
  const isEn = currentLang === 'en';
  const data = emp || {
    name: '', position: '', department: 'administration', phone: '', email: '',
    salary: 0, hireDate: new Date().toISOString().split('T')[0], status: 'active', notes: '',
  };
  return `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div class="field" style="grid-column:1/-1"><label>${isEn ? 'Full name *' : 'الاسم الكامل *'}</label><input id="empName" value="${escapeHtml(data.name)}" placeholder="${isEn ? 'Employee name' : 'اسم الموظف'}"></div>
      <div class="field"><label>${isEn ? 'Position' : 'المسمى الوظيفي'}</label><input id="empPosition" value="${escapeHtml(data.position)}" placeholder="${isEn ? 'Position' : 'مثال: محاسب'}"></div>
      <div class="field"><label>${isEn ? 'Department' : 'القسم'}</label><select id="empDepartment">${employeeOptionsHtml(data.department)}</select></div>
      <div class="field"><label>${isEn ? 'Phone' : 'الجوال'}</label><input id="empPhone" value="${escapeHtml(data.phone)}" placeholder="05xxxxxxxx"></div>
      <div class="field"><label>${isEn ? 'Email' : 'البريد الإلكتروني'}</label><input id="empEmail" type="email" value="${escapeHtml(data.email)}" placeholder="employee@example.com"></div>
      <div class="field"><label>${isEn ? 'Monthly salary' : 'الراتب الشهري'}</label><input id="empSalary" type="number" min="0" value="${Number(data.salary) || 0}"></div>
      <div class="field"><label>${isEn ? 'Hire date' : 'تاريخ التعيين'}</label><input id="empHireDate" type="date" value="${escapeHtml(data.hireDate)}"></div>
      <div class="field"><label>${isEn ? 'Status' : 'الحالة'}</label><select id="empStatus"><option value="active" ${data.status !== 'inactive' ? 'selected' : ''}>${isEn ? 'Active' : 'نشط'}</option><option value="inactive" ${data.status === 'inactive' ? 'selected' : ''}>${isEn ? 'Inactive' : 'غير نشط'}</option></select></div>
      <div class="field" style="grid-column:1/-1"><label>${isEn ? 'Notes' : 'ملاحظات'}</label><input id="empNotes" value="${escapeHtml(data.notes)}"></div>
    </div>`;
}

function renderEmployeeCard(emp) {
  const isEn = currentLang === 'en';
  const initial = escapeHtml((emp.name || '?').charAt(0));
  const salaryPaid = (DB.transactions || [])
    .filter(tx => tx.type === 'expense' && tx.category === 'salary' && Number(tx.employeeId) === Number(emp.id))
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  return `
    <div class="card" style="position:relative;overflow:hidden">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px">
        <div style="width:52px;height:52px;border-radius:50%;background:var(--emerald-glow);color:var(--emerald-light);border:2px solid var(--emerald-mid);display:flex;align-items:center;justify-content:center;font-size:1.3rem;font-weight:900;flex-shrink:0">${initial}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:1rem;font-weight:900">${escapeHtml(emp.name)}</div>
          <div style="font-size:.74rem;color:var(--text-muted);margin-top:2px">${escapeHtml(emp.position || '—')} · ${employeeDepartmentLabel(emp.department)}</div>
        </div>
        ${employeeStatusBadge(emp.status)}
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px">
        <div style="background:var(--surface2);border-radius:8px;padding:9px;text-align:center"><div style="font-weight:900;color:var(--gold-light)">${employeeMoney(emp.salary)}</div><div style="font-size:.62rem;color:var(--text-muted)">${isEn ? 'Salary' : 'الراتب'}</div></div>
        <div style="background:var(--surface2);border-radius:8px;padding:9px;text-align:center"><div style="font-weight:900;color:var(--emerald-light)">${employeeMoney(salaryPaid)}</div><div style="font-size:.62rem;color:var(--text-muted)">${isEn ? 'Paid' : 'مصروف'}</div></div>
        <div style="background:var(--surface2);border-radius:8px;padding:9px;text-align:center"><div style="font-weight:900;color:var(--blue)">${escapeHtml(emp.hireDate || '—')}</div><div style="font-size:.62rem;color:var(--text-muted)">${isEn ? 'Hire date' : 'التعيين'}</div></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:14px">
        <div class="plan-row" style="margin:0"><span class="plan-icon">📞</span><div class="plan-text" style="font-size:.8rem;color:var(--text-muted)">${escapeHtml(emp.phone || '—')}</div></div>
        <div class="plan-row" style="margin:0"><span class="plan-icon">📧</span><div class="plan-text" style="font-size:.8rem;color:var(--text-muted)">${escapeHtml(emp.email || '—')}</div></div>
      </div>
      ${emp.notes ? `<div style="font-size:.78rem;color:var(--text-muted);line-height:1.7;background:var(--surface2);border-radius:8px;padding:10px;margin-bottom:12px">${escapeHtml(emp.notes)}</div>` : ''}
      <div style="display:flex;gap:7px;flex-wrap:wrap">
        <button class="btn btn-green btn-sm" onclick="openEmployeeProfile(${emp.id})">📋 ${isEn ? 'Profile' : 'الملف'}</button>
        <button class="btn btn-gold btn-sm" onclick="openEditEmployeeModal(${emp.id})">✏️ ${t('edit')}</button>
        <button class="btn btn-solid btn-sm" onclick="openEmployeeSalaryModal(${emp.id})">💰 ${isEn ? 'Salary' : 'راتب'}</button>
        <button class="btn btn-red btn-sm" onclick="toggleEmployeeStatus(${emp.id})">${emp.status === 'inactive' ? '↻' : '⏸'}</button>
      </div>
    </div>`;
}

pages['employees'] = function(el) {
  ensureEmployeesDefaults();
  const isEn = currentLang === 'en';
  const employees = DB.employees.slice();
  const activeCount = employees.filter(emp => emp.status !== 'inactive').length;
  const totalSalary = employees.filter(emp => emp.status !== 'inactive').reduce((sum, emp) => sum + Number(emp.salary || 0), 0);
  const departments = new Set(employees.map(emp => emp.department).filter(Boolean)).size;
  el.innerHTML = `
    <div class="grid-3" style="margin-bottom:18px">
      <div class="stat-box"><div class="stat-icon green">🧑‍💼</div><div><div class="stat-val">${employees.length}</div><div class="stat-lbl">${isEn ? 'Employees' : 'إجمالي الموظفين'}</div></div></div>
      <div class="stat-box"><div class="stat-icon blue">✅</div><div><div class="stat-val">${activeCount}</div><div class="stat-lbl">${isEn ? 'Active' : 'نشط'}</div></div></div>
      <div class="stat-box"><div class="stat-icon gold">💰</div><div><div class="stat-val" style="font-size:1.05rem">${employeeMoney(totalSalary)}</div><div class="stat-lbl">${isEn ? 'Monthly payroll' : 'إجمالي الرواتب الشهرية'}</div></div></div>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:10px">
      <div style="font-size:.85rem;color:var(--text-muted)">${departments} ${isEn ? 'department(s)' : 'قسم'} · ${activeCount} ${isEn ? 'active employee(s)' : 'موظف نشط'}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-green" onclick="navigateTo('finance')">💰 ${isEn ? 'Finance' : 'المالية'}</button>
        <button class="btn btn-solid" onclick="openAddEmployeeModal()">➕ ${isEn ? 'Add Employee' : 'إضافة موظف'}</button>
      </div>
    </div>
    ${employees.length === 0 ? `
      <div style="text-align:center;padding:60px 20px;color:var(--text-muted)">
        <div style="font-size:3rem;margin-bottom:12px">🧑‍💼</div>
        <div style="font-size:1rem;font-weight:700;margin-bottom:8px">${isEn ? 'No employees yet' : 'لا يوجد موظفون بعد'}</div>
        <button class="btn btn-solid" onclick="openAddEmployeeModal()">➕ ${isEn ? 'Add first employee' : 'إضافة أول موظف'}</button>
      </div>` : `<div class="grid-2">${employees.map(renderEmployeeCard).join('')}</div>`}
  `;
};

window.openAddEmployeeModal = function() {
  const isEn = currentLang === 'en';
  openModal('🧑‍💼 ' + (isEn ? 'Add Employee' : 'إضافة موظف'), `
    ${employeeFormHtml()}
    <button class="btn btn-solid" style="width:100%;margin-top:12px" onclick="saveNewEmployee()">✅ ${isEn ? 'Save employee' : 'حفظ الموظف'}</button>
  `);
};

window.saveNewEmployee = function() {
  const isEn = currentLang === 'en';
  const emp = getEmployeeFormData();
  if (!emp.name) { showToast('⚠️ ' + (isEn ? 'Enter employee name' : 'أدخل اسم الموظف')); return; }
  DB.employees.push(emp);
  if (typeof logAudit === 'function') logAudit('employee.create', 'إضافة موظف: ' + emp.name);
  saveDB();
  closeModalDirect();
  showToast('✅ ' + (isEn ? 'Employee saved' : 'تم حفظ الموظف'));
  navigateTo('employees');
};

window.openEditEmployeeModal = function(id) {
  const emp = DB.employees.find(item => Number(item.id) === Number(id));
  if (!emp) return;
  const isEn = currentLang === 'en';
  openModal('✏️ ' + (isEn ? 'Edit Employee' : 'تعديل موظف'), `
    ${employeeFormHtml(emp)}
    <button class="btn btn-solid" style="width:100%;margin-top:12px" onclick="saveEditedEmployee(${emp.id})">💾 ${isEn ? 'Save changes' : 'حفظ التعديلات'}</button>
  `);
};

window.saveEditedEmployee = function(id) {
  const emp = DB.employees.find(item => Number(item.id) === Number(id));
  if (!emp) return;
  const updated = getEmployeeFormData(id);
  if (!updated.name) { showToast('⚠️ ' + (currentLang === 'en' ? 'Enter employee name' : 'أدخل اسم الموظف')); return; }
  Object.assign(emp, updated);
  if (typeof logAudit === 'function') logAudit('employee.update', 'تعديل موظف: ' + emp.name);
  saveDB();
  closeModalDirect();
  showToast('✅ ' + (currentLang === 'en' ? 'Employee updated' : 'تم تحديث الموظف'));
  navigateTo('employees');
};

window.toggleEmployeeStatus = function(id) {
  const emp = DB.employees.find(item => Number(item.id) === Number(id));
  if (!emp) return;
  emp.status = emp.status === 'inactive' ? 'active' : 'inactive';
  if (typeof logAudit === 'function') logAudit('employee.status', 'تغيير حالة الموظف: ' + emp.name);
  saveDB();
  showToast('✅ ' + (currentLang === 'en' ? 'Employee status updated' : 'تم تحديث حالة الموظف'));
  navigateTo('employees');
};

window.openEmployeeProfile = function(id) {
  const emp = DB.employees.find(item => Number(item.id) === Number(id));
  if (!emp) return;
  const isEn = currentLang === 'en';
  const salaryTxs = (DB.transactions || []).filter(tx => tx.type === 'expense' && tx.category === 'salary' && Number(tx.employeeId) === Number(emp.id));
  openModal('📋 ' + emp.name, `
    <div style="background:linear-gradient(135deg,var(--emerald),var(--emerald-mid));border-radius:12px;padding:18px;margin-bottom:16px;color:#fff">
      <div style="font-size:1.15rem;font-weight:900">${escapeHtml(emp.name)}</div>
      <div style="font-size:.8rem;opacity:.9;margin-top:4px">${escapeHtml(emp.position || '—')} · ${employeeDepartmentLabel(emp.department)}</div>
    </div>
    <div class="grid-3" style="margin-bottom:14px">
      <div class="stat-box"><div class="stat-icon gold">💰</div><div><div class="stat-val">${employeeMoney(emp.salary)}</div><div class="stat-lbl">${isEn ? 'Monthly salary' : 'الراتب الشهري'}</div></div></div>
      <div class="stat-box"><div class="stat-icon green">📤</div><div><div class="stat-val">${employeeMoney(salaryTxs.reduce((sum, tx) => sum + Number(tx.amount || 0), 0))}</div><div class="stat-lbl">${isEn ? 'Total paid' : 'إجمالي المصروف'}</div></div></div>
      <div class="stat-box"><div class="stat-icon blue">📅</div><div><div class="stat-val">${escapeHtml(emp.hireDate || '—')}</div><div class="stat-lbl">${isEn ? 'Hire date' : 'تاريخ التعيين'}</div></div></div>
    </div>
    <div style="background:var(--surface2);border-radius:10px;padding:12px;margin-bottom:14px;line-height:1.9">
      <div>📞 ${escapeHtml(emp.phone || '—')}</div>
      <div>📧 ${escapeHtml(emp.email || '—')}</div>
      <div>✅ ${employeeStatusBadge(emp.status)}</div>
      ${emp.notes ? `<div style="color:var(--text-muted);margin-top:8px">${escapeHtml(emp.notes)}</div>` : ''}
    </div>
    <div class="card-title"><span class="ct-icon">💰</span> ${isEn ? 'Salary Payments' : 'صرف الرواتب'}</div>
    ${salaryTxs.length ? `
      <div class="table-wrap"><table><thead><tr><th>${t('thDate')}</th><th>${isEn ? 'Amount' : 'المبلغ'}</th><th>${isEn ? 'Method' : 'الطريقة'}</th><th>${t('thNotes')}</th></tr></thead><tbody>
        ${salaryTxs.map(tx => `<tr><td>${escapeHtml(tx.date)}</td><td>${employeeMoney(tx.amount)}</td><td>${escapeHtml(tx.method || '—')}</td><td>${escapeHtml(tx.notes || '—')}</td></tr>`).join('')}
      </tbody></table></div>` : `<div style="text-align:center;padding:18px;color:var(--text-muted)">${isEn ? 'No salary payments yet' : 'لا توجد عمليات صرف راتب بعد'}</div>`}
  `);
};

window.openEmployeeSalaryModal = function(id) {
  const emp = DB.employees.find(item => Number(item.id) === Number(id));
  if (!emp) return;
  const isEn = currentLang === 'en';
  openModal('💰 ' + (isEn ? 'Pay Salary: ' : 'صرف راتب: ') + emp.name, `
    <div class="field"><label>${isEn ? 'Amount' : 'المبلغ'}</label><input id="empSalaryPayAmount" type="number" min="0" value="${Number(emp.salary) || 0}"></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div class="field"><label>${isEn ? 'Date' : 'التاريخ'}</label><input id="empSalaryPayDate" type="date" value="${new Date().toISOString().split('T')[0]}"></div>
      <div class="field"><label>${isEn ? 'Method' : 'طريقة الصرف'}</label><select id="empSalaryPayMethod"><option value="cash">${isEn ? 'Cash' : 'نقداً'}</option><option value="transfer">${isEn ? 'Transfer' : 'تحويل'}</option><option value="card">${isEn ? 'Card' : 'بطاقة'}</option><option value="other">${isEn ? 'Other' : 'أخرى'}</option></select></div>
    </div>
    <div class="field"><label>${isEn ? 'Notes' : 'ملاحظات'}</label><input id="empSalaryPayNotes" value="${isEn ? 'Salary payment' : 'صرف راتب'} - ${escapeHtml(emp.name)}"></div>
    <button class="btn btn-solid" style="width:100%" onclick="payEmployeeSalary(${emp.id})">✅ ${isEn ? 'Record salary expense' : 'تسجيل صرف الراتب'}</button>
  `);
};

window.payEmployeeSalary = function(id) {
  const emp = DB.employees.find(item => Number(item.id) === Number(id));
  if (!emp) return;
  const amount = Number(document.getElementById('empSalaryPayAmount')?.value) || 0;
  if (!amount || amount <= 0) { showToast('⚠️ ' + (currentLang === 'en' ? 'Enter a valid amount' : 'أدخل مبلغاً صحيحاً')); return; }
  if (typeof window.addFinanceTransaction !== 'function') {
    showToast('⚠️ ' + (currentLang === 'en' ? 'Finance module is unavailable' : 'النظام المالي غير متاح'));
    return;
  }
  window.addFinanceTransaction({
    type: 'expense',
    category: 'salary',
    employeeId: emp.id,
    amount,
    date: document.getElementById('empSalaryPayDate')?.value || new Date().toISOString().split('T')[0],
    method: document.getElementById('empSalaryPayMethod')?.value || 'cash',
    notes: document.getElementById('empSalaryPayNotes')?.value || ('صرف راتب - ' + emp.name),
  });
  closeModalDirect();
  showToast('✅ ' + (currentLang === 'en' ? 'Salary recorded in finance' : 'تم تسجيل الراتب في المالية'));
  navigateTo('employees');
};
