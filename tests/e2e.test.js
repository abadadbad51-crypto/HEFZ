const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const { TextDecoder, TextEncoder } = require('node:util');
const { webcrypto } = require('node:crypto');

const projectRoot = path.resolve(__dirname, '..');
const adminHash =
  '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4';

class MemoryStorage {
  constructor() {
    this.store = new Map();
  }

  getItem(key) {
    key = String(key);
    return this.store.has(key) ? this.store.get(key) : null;
  }

  setItem(key, value) {
    this.store.set(String(key), String(value));
  }

  removeItem(key) {
    this.store.delete(String(key));
  }

  clear() {
    this.store.clear();
  }
}

function classListFor(element) {
  function read() {
    return new Set(String(element.className || '').split(/\s+/).filter(Boolean));
  }
  function write(values) {
    element.className = Array.from(values).join(' ');
  }
  return {
    add(...names) {
      const values = read();
      names.filter(Boolean).forEach(name => values.add(name));
      write(values);
    },
    remove(...names) {
      const values = read();
      names.filter(Boolean).forEach(name => values.delete(name));
      write(values);
    },
    contains(name) {
      return read().has(name);
    },
    toggle(name, force) {
      const values = read();
      const shouldAdd = force === undefined ? !values.has(name) : Boolean(force);
      if (shouldAdd) values.add(name);
      else values.delete(name);
      write(values);
      return shouldAdd;
    },
  };
}

class FakeElement {
  constructor(ownerDocument, tagName = 'div', id = '') {
    this.ownerDocument = ownerDocument;
    this.tagName = tagName.toUpperCase();
    this.id = id;
    this.value = '';
    this.textContent = '';
    this.innerHTML = '';
    this.className = '';
    this.style = {};
    this.children = [];
    this.parentNode = null;
    this.nextElementSibling = null;
    this.files = [];
    this.disabled = false;
    this.attributes = new Map();
    this.classList = classListFor(this);
  }

  appendChild(child) {
    if (child) {
      child.parentNode = this;
      this.children.push(child);
    }
    return child;
  }

  removeChild(child) {
    this.children = this.children.filter(item => item !== child);
    if (child) child.parentNode = null;
    return child;
  }

  remove() {
    if (this.parentNode) this.parentNode.removeChild(this);
  }

  setAttribute(name, value) {
    this.attributes.set(String(name), String(value));
    if (name === 'id') {
      this.id = String(value);
      this.ownerDocument.elements.set(this.id, this);
    }
  }

  getAttribute(name) {
    return this.attributes.get(String(name)) || null;
  }

  addEventListener() {}
  removeEventListener() {}
  click() {}
  focus() {}
  scrollIntoView() {}

  contains(node) {
    if (node === this) return true;
    return this.children.some(child => child.contains(node));
  }

  closest() {
    return null;
  }

  querySelector(selector) {
    if (selector && selector.startsWith('#')) {
      return this.ownerDocument.getElementById(selector.slice(1));
    }
    return null;
  }

  querySelectorAll() {
    return [];
  }
}

class FakeDocument {
  constructor() {
    this.elements = new Map();
    this.hidden = false;
    this.title = '';
    this.documentElement = new FakeElement(this, 'html', 'documentElement');
    this.body = new FakeElement(this, 'body', 'body');
  }

  createElement(tagName) {
    return new FakeElement(this, tagName);
  }

  getElementById(id) {
    id = String(id);
    if (!this.elements.has(id)) {
      this.elements.set(id, new FakeElement(this, 'div', id));
    }
    return this.elements.get(id);
  }

  querySelector(selector) {
    if (!selector) return null;
    if (selector.startsWith('#') && !selector.includes(' ')) {
      return this.getElementById(selector.slice(1));
    }
    return null;
  }

  querySelectorAll() {
    return [];
  }

  addEventListener() {}
  removeEventListener() {}
}

function createNotificationClass() {
  class FakeNotification {
    constructor(title, options) {
      this.title = title;
      this.options = options;
    }

    close() {}
  }

  FakeNotification.permission = 'denied';
  FakeNotification.requestPermission = () => Promise.resolve('denied');
  return FakeNotification;
}

function createBrowserContext() {
  const document = new FakeDocument();
  const localStorage = new MemoryStorage();
  const context = {
    console,
    document,
    localStorage,
    crypto: webcrypto,
    TextDecoder,
    TextEncoder,
    location: { protocol: 'http:', href: 'http://localhost:8090/' },
    navigator: { userAgent: 'node-test' },
    Notification: createNotificationClass(),
    FileReader: class {},
    fetch: async () => ({ ok: true, status: 200, json: async () => null }),
    requestAnimationFrame: callback => setTimeout(callback, 0),
    cancelAnimationFrame: clearTimeout,
    setTimeout,
    clearTimeout,
    setInterval: () => 0,
    clearInterval: () => {},
    alert: () => {},
    confirm: () => true,
    print: () => {},
    innerWidth: 1200,
    __toasts: [],
    __pushes: [],
    __lastPage: null,
  };

  context.window = context;
  context.self = context;
  document.defaultView = context;
  return vm.createContext(context);
}

function loadScript(context, relativePath) {
  const filename = path.join(projectRoot, relativePath);
  const code = fs.readFileSync(filename, 'utf8');
  vm.runInContext(code, context, { filename });
}

function read(context, expression) {
  return vm.runInContext(expression, context);
}

function resetApp(context) {
  vm.runInContext(
    `
      localStorage.clear();
      currentLang = 'ar';
      currentUser = null;
      currentRole = 'admin';
      currentPage = '';
      DB.users = [{
        id: 1,
        role: 'admin',
        name: 'المدير',
        email: 'admin@hifz.com',
        pass: '${adminHash}',
        color: '#22a86f'
      }];
      DB.students = [];
      DB.circles = [];
      DB.notifications = [];
      DB.weeklyData = [0,0,0,0,0,0,0];
      DB.attendance = {};
      DB.rewards = {};
      DB.calendar = [];
      window.__toasts = [];
      window.__pushes = [];
      window.__lastPage = null;

      showToast = function(message) { window.__toasts.push(String(message)); };
      navigateTo = function(page) { currentPage = page; window.__lastPage = page; };
      initApp = function() {};
      buildBottomNav = function() {};
      updateBottomNav = function() {};
      startSessionWatcher = function() {};
      stopSessionWatcher = function() {};
      updateSessionIndicator = function() {};
      closeSidebar = function() {};
      closeFab = function() {};
      closeModalDirect = function() {};
      openModal = function(title, html) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = html;
      };
      PUSH.init = function() {};
      PUSH.updateBadge = function() {};
      PUSH.send = function(title, body, opts) {
        window.__pushes.push({ title: title, body: body, opts: opts || {} });
      };
    `,
    context
  );
}

function createApp() {
  const context = createBrowserContext();
  [
    'js/db.js',
    'js/lang.js',
    'js/security.js',
    'js/notifications.js',
    'js/helpers.js',
    'js/app.js',
    'js/auth.js',
    'js/pages-admin.js',
    'js/pages-teacher.js',
    'js/pages-parent.js',
  ].forEach(script => loadScript(context, script));
  resetApp(context);
  return context;
}

function setInput(context, id, value) {
  context.document.getElementById(id).value = String(value);
}

async function waitFor(predicate, message, timeout = 15000) {
  const started = Date.now();
  let lastError;

  while (Date.now() - started < timeout) {
    try {
      const value = predicate();
      if (value) return value;
    } catch (error) {
      lastError = error;
    }
    await new Promise(resolve => setTimeout(resolve, 25));
  }

  if (lastError) throw lastError;
  assert.fail(message);
}

async function loginAs(context, login, password, role) {
  setInput(context, 'loginEmail', login);
  setInput(context, 'loginPass', password);
  context.doLogin();
  await waitFor(
    () => read(context, 'currentUser && currentUser.role') === role,
    `Expected ${login} to log in as ${role}`
  );
  return read(context, 'currentUser');
}

test('key admin, parent, teacher, session, attendance, and student filter flows work', async () => {
  const context = createApp();
  const db = () => read(context, 'DB');

  await loginAs(context, 'admin@hifz.com', '1234', 'admin');

  setInput(context, 'cName', 'حلقة الاختبار');
  setInput(context, 'cTime', 'بعد المغرب');
  setInput(context, 'cRoom', 'قاعة الاختبار');
  setInput(context, 'cDays', 'الأحد والثلاثاء');
  setInput(context, 'cTeacherSelect', '__new__');
  setInput(context, 'cNewTeacherName', 'معلم الاختبار');
  setInput(context, 'cNewTeacherEmail', 'teacher-e2e@example.com');
  context.saveNewCircle();

  await waitFor(
    () => db().circles.length === 1 && db().users.some(user => user.role === 'teacher'),
    'Expected a circle and teacher account to be created'
  );

  const teacher = db().users.find(user => user.role === 'teacher');
  assert.equal(db().circles[0].teacher, teacher.id);
  assert.match(teacher.pass, /^pbkdf2\$/);

  setInput(context, 'newName', 'طالب الاختبار');
  setInput(context, 'newAge', '11');
  setInput(context, 'newLevel', 'جيد');
  setInput(context, 'newCircle', 'حلقة الاختبار');
  setInput(context, 'newParentName', 'ولي الاختبار');
  setInput(context, 'newParentUser', 'parent-e2e');
  setInput(context, 'newParentPass', '1234');
  context.addStudent();

  await waitFor(
    () => db().students.length === 1 && db().users.some(user => user.role === 'parent'),
    'Expected a student and linked parent account to be created'
  );

  const student = db().students[0];
  const parent = db().users.find(user => user.role === 'parent');
  assert.equal(student.teacher, teacher.id);
  assert.equal(parent.studentId, student.id);
  assert.match(parent.pass, /^pbkdf2\$/);

  vm.runInContext(
    "pages['students'](document.getElementById('studentsPage'))",
    context
  );

  setInput(context, 'studentSearch', 'طالب الاختبار');
  setInput(context, 'studentCircleFilter', 'حلقة الاختبار');
  setInput(context, 'studentLevelFilter', 'جيد');
  context.filterStudents();
  assert.match(context.document.getElementById('studentsGrid').innerHTML, /طالب الاختبار/);
  assert.match(context.document.getElementById('studentResultsCount').textContent, /1/);

  setInput(context, 'studentLevelFilter', 'ضعيف');
  context.filterStudents();
  assert.equal(context.document.getElementById('studentsGrid').innerHTML, '');
  assert.match(context.document.getElementById('studentsEmpty').innerHTML, /لا توجد نتائج/);

  context.clearStudentFilters();
  assert.equal(context.document.getElementById('studentSearch').value, '');
  assert.match(context.document.getElementById('studentsGrid').innerHTML, /طالب الاختبار/);

  vm.runInContext('currentUser = null', context);
  await loginAs(context, 'parent-e2e', '1234', 'parent');
  assert.equal(read(context, 'getParentStudent().name'), 'طالب الاختبار');

  vm.runInContext('currentUser = null', context);
  await loginAs(context, 'teacher-e2e@example.com', '1234', 'teacher');

  setInput(context, 'sessionStudent', student.id);
  setInput(context, 'sessionDate', '2026-05-02');
  setInput(context, 'sessionFrom', '1');
  setInput(context, 'sessionTo', '3');
  setInput(context, 'sessionNew', '3');
  setInput(context, 'sessionReview', '2');
  setInput(context, 'sessionGrade', 'ممتاز');
  setInput(context, 'sessionNotes', 'اختبار آلي');
  context.selectSurah('الفاتحة', 1, 7);
  context.saveSession();

  assert.equal(student.sessions.length, 1);
  assert.equal(student.currentSurah, 'الفاتحة');
  assert.equal(student.currentAyah, 4);
  assert.equal(student.sessions[0].new, 3);
  assert.equal(context.__pushes.length, 1);

  context.teacherMarkAll('present');
  assert.equal(db().attendance[student.id], 'present');
  context.saveTeacherAtt();
  assert.equal(student.attendance, 100);

  const persisted = JSON.parse(context.localStorage.getItem('hifz_db_v1'));
  assert.equal(persisted.students[0].sessions.length, 1);
  assert.equal(persisted.attendance[String(student.id)], 'present');
});
