// --- Login / User system ---
const loginContainer = document.getElementById('login-container');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

const USER_DB_KEY = "cuteDashboardUserDb"; // holds { username: { password: ..., data: {...} }, ... }
const SESSION_KEY = "cuteDashboardSession";
const MAX_SOUND_SIZE = 2 * 1024 * 1024; // 2MB

// Helper: get DB object from localStorage
function getUserDb() {
  return JSON.parse(localStorage.getItem(USER_DB_KEY) || "{}");
}
// Helper: set DB object to localStorage
function setUserDb(db) {
  localStorage.setItem(USER_DB_KEY, JSON.stringify(db));
}
// Helper: get current session username
function getSessionUser() {
  return localStorage.getItem(SESSION_KEY) || null;
}
// Helper: set session
function setSessionUser(username) {
  if (username) localStorage.setItem(SESSION_KEY, username);
  else localStorage.removeItem(SESSION_KEY);
}
// Helper: get user data object (for todos, soundboard, etc)
function getUserData() {
  const db = getUserDb();
  const username = getSessionUser();
  if (!username || !db[username]) return null;
  if (!db[username].data) db[username].data = {};
  return db[username].data;
}
// Helper: persist user data
function setUserData(newData) {
  const db = getUserDb();
  const username = getSessionUser();
  if (!username || !db[username]) return;
  db[username].data = newData;
  setUserDb(db);
}

// Check session on load
function checkLogin() {
  const username = getSessionUser();
  if (username && getUserDb()[username]) {
    // Show dashboard
    loginContainer.style.display = "none";
    dashboard.style.display = "";
    setUserNameUI(username);
    rerenderAll();
  } else {
    // Show login
    loginContainer.style.display = "";
    dashboard.style.display = "none";
  }
}

// Display user name and avatar
function setUserNameUI(username) {
  document.getElementById('greeting').textContent = `Hello, ${username}! 🧸`;
  document.getElementById('user-avatar').src =
    `https://api.dicebear.com/8.x/bottts/svg?seed=${encodeURIComponent(username)}`;
}

// Login form submit
if (loginForm) {
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    let db = getUserDb();
    // If user exists, check password
    if (db[username]) {
      if (db[username].password !== password) {
        loginError.textContent = "Wrong password!";
        return;
      }
    } else {
      // Create new user
      db[username] = { password, data: {} };
      setUserDb(db);
    }
    setSessionUser(username);
    loginError.textContent = "";
    loginContainer.style.display = "none";
    dashboard.style.display = "";
    setUserNameUI(username);
    rerenderAll();
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', function() {
    setSessionUser(null);
    checkLogin();
  });
}

// --- Theming and Dashboard UI ---
const sidebarItems = document.querySelectorAll('.sidebar nav ul li');
const sections = document.querySelectorAll('.section');
sidebarItems.forEach(item => {
  item.addEventListener('click', () => {
    sidebarItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    sections.forEach(section => section.classList.remove('active'));
    document.getElementById(item.dataset.section).classList.add('active');
  });
});

// Dark mode toggle
const darkToggle = document.getElementById('darkModeToggle');
darkToggle.addEventListener('change', () => {
  document.body.classList.toggle('dark', darkToggle.checked);
});

// --- Greeting ---
function updateGreeting() {
  const hour = new Date().getHours();
  let greet = "Hello";
  if (hour < 12) greet = "Good morning";
  else if (hour < 18) greet = "Good afternoon";
  else greet = "Good evening";
  const username = getSessionUser() || "Cute User";
  document.getElementById('greeting').textContent = `${greet}, ${username}! 🧸`;
}
updateGreeting();

// --- Chart.js ---
function renderChart() {
  const ctx = document.getElementById('myChart')?.getContext('2d');
  if (ctx) {
    // Demo: chart data is global, but could be user-specific if you wish
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Cute Points',
          data: [12, 19, 8, 17, 14, 10, 15],
          backgroundColor: [
            '#ffd6e0', '#e0c3fc', '#b5ead7', '#ffb7b2', '#ffdac1', '#c7ceea', '#ffb7b2'
          ],
          borderRadius: 12
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 2 } } }
      }
    });
  }
}

// --- To-Do List Widget ---
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');

function renderTodos() {
  const userData = getUserData();
  const todos = userData?.todos || [];
  todoList.innerHTML = '';
  todos.forEach((todo, idx) => {
    const li = document.createElement('li');
    li.className = todo.done ? 'done' : '';
    li.innerHTML = `
      <span class="todo-text" style="flex:1;cursor:pointer;">${todo.text}</span>
      <button class="todo-remove" title="Remove">&times;</button>
    `;
    li.querySelector('.todo-text').addEventListener('click', () => {
      todos[idx].done = !todos[idx].done;
      userData.todos = todos;
      setUserData(userData);
      renderTodos();
    });
    li.querySelector('.todo-remove').addEventListener('click', () => {
      todos.splice(idx, 1);
      userData.todos = todos;
      setUserData(userData);
      renderTodos();
    });
    todoList.appendChild(li);
  });
}

if (todoForm) {
  todoForm.addEventListener('submit', e => {
    e.preventDefault();
    const value = todoInput.value.trim();
    if (!value) return;
    const userData = getUserData();
    if (!userData.todos) userData.todos = [];
    userData.todos.push({ text: value, done: false });
    setUserData(userData);
    todoInput.value = '';
    renderTodos();
  });
}

// --- Soundboard Section with local file upload support and user database ---
function getSounds() {
  const userData = getUserData();
  if (!userData.sounds) userData.sounds = [];
  return userData.sounds;
}
function setSounds(sounds) {
  const userData = getUserData();
  userData.sounds = sounds;
  setUserData(userData);
}
function renderSoundboard() {
  const container = document.getElementById('soundboard-list');
  if (!container) return;
  const sounds = getSounds();
  container.innerHTML = '';
  if (!sounds.length) {
    container.innerHTML = `<p style="color:#bdbdbd">No sounds yet! Add one above!</p>`;
    return;
  }
  sounds.forEach((sound, idx) => {
    const div = document.createElement('div');
    div.className = 'soundboard-sound';
    div.innerHTML = `
      <h4 title="${sound.url}">${sound.name}</h4>
      <button class="play-btn" title="Play">
        ▶️ Play <span class="count">${sound.count || 0}</span>
      </button>
      <button class="remove-btn" title="Remove">&times;</button>
    `;
    // Play sound
    div.querySelector('.play-btn').addEventListener('click', () => {
      let audio = new Audio(sound.url);
      audio.play();
      sounds[idx].count = (sounds[idx].count || 0) + 1;
      setSounds(sounds);
      renderSoundboard();
    });
    // Remove sound
    div.querySelector('.remove-btn').addEventListener('click', () => {
      if (confirm(`Remove "${sound.name}"?`)) {
        sounds.splice(idx, 1);
        setSounds(sounds);
        renderSoundboard();
      }
    });
    container.appendChild(div);
  });
}

const addSoundForm = document.getElementById('add-sound-form');
if (addSoundForm) {
  addSoundForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('sound-name').value.trim();
    const urlInput = document.getElementById('sound-url').value.trim();
    const fileInput = document.getElementById('sound-file');
    const file = fileInput.files && fileInput.files[0];

    // Remove any existing error message
    let err = document.getElementById('sound-error');
    if (err) err.remove();

    if (!name) return;

    // Prefer file if provided
    if (file) {
      if (file.size > MAX_SOUND_SIZE) {
        // Show a clear error message in the form
        const errorMsg = document.createElement('div');
        errorMsg.id = 'sound-error';
        errorMsg.style.color = '#ff69b4';
        errorMsg.style.fontSize = '0.95em';
        errorMsg.style.marginTop = '5px';
        errorMsg.textContent = `File too large! Please select a file under 2MB.`;
        addSoundForm.appendChild(errorMsg);
        return;
      }
      const reader = new FileReader();
      reader.onload = function(evt) {
        const sounds = getSounds();
        sounds.push({ name, url: evt.target.result, count: 0 });
        setSounds(sounds);
        renderSoundboard();
        addSoundForm.reset();
      };
      reader.readAsDataURL(file);
    } else if (urlInput) {
      const sounds = getSounds();
      sounds.push({ name, url: urlInput, count: 0 });
      setSounds(sounds);
      renderSoundboard();
      addSoundForm.reset();
    } else {
      const errorMsg = document.createElement('div');
      errorMsg.id = 'sound-error';
      errorMsg.style.color = '#ff69b4';
      errorMsg.style.fontSize = '0.95em';
      errorMsg.style.marginTop = '5px';
      errorMsg.textContent = `Please enter a URL or upload a file.`;
      addSoundForm.appendChild(errorMsg);
    }
  });
}

// -- Utility to rerender all user-dependent UI
function rerenderAll() {
  updateGreeting();
  renderTodos();
  renderSoundboard();
  renderChart();
}

// Initial page load
checkLogin();