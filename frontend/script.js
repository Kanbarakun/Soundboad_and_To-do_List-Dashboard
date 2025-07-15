const API = "http://localhost:4000/api";

// --- Auth ---
let jwtToken = localStorage.getItem("cuteDashboardToken") || null;
function setToken(token) {
  jwtToken = token;
  if (token) localStorage.setItem("cuteDashboardToken", token);
  else localStorage.removeItem("cuteDashboardToken");
}

// UI switching
const loginContainer = document.getElementById('login-container');
const dashboard = document.getElementById('dashboard');
function showDashboard(username) {
  loginContainer.style.display = "none";
  dashboard.style.display = "";
  setUserNameUI(username);
  rerenderAll();
}
function showLogin() {
  loginContainer.style.display = "";
  dashboard.style.display = "none";
}

// --- Login/Register/Reset UI logic ---
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const resetForm = document.getElementById('reset-form');
const showRegister = document.getElementById('show-register');
const showReset = document.getElementById('show-reset');
const backLogin1 = document.getElementById('back-login1');
const backLogin2 = document.getElementById('back-login2');

if (showRegister) showRegister.onclick = () => {
  loginForm.style.display = "none";
  registerForm.style.display = "";
  resetForm.style.display = "none";
};
if (showReset) showReset.onclick = () => {
  loginForm.style.display = "none";
  registerForm.style.display = "none";
  resetForm.style.display = "";
};
if (backLogin1) backLogin1.onclick = () => {
  loginForm.style.display = "";
  registerForm.style.display = "none";
  resetForm.style.display = "none";
};
if (backLogin2) backLogin2.onclick = () => {
  loginForm.style.display = "";
  registerForm.style.display = "none";
  resetForm.style.display = "none";
  document.getElementById('reset-token').style.display = "none";
  document.getElementById('reset-new-password').style.display = "none";
  document.getElementById('reset-confirm').style.display = "none";
};

// Login
if (loginForm) {
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const loginError = document.getElementById('login-error');
    loginError.textContent = "";
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) {
        loginError.textContent = data.msg || "Login failed";
        return;
      }
      setToken(data.token);
      showDashboard(data.username);
    } catch (err) {
      loginError.textContent = "Connection error";
    }
  });
}

// Register
if (registerForm) {
  registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const email = document.getElementById('register-email').value.trim();
    const registerError = document.getElementById('register-error');
    registerError.textContent = "";
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ username, password, email })
      });
      const data = await res.json();
      if (!res.ok) {
        registerError.textContent = data.msg || "Registration failed";
        return;
      }
      setToken(data.token);
      showDashboard(data.username);
    } catch (err) {
      registerError.textContent = "Connection error";
    }
  });
}

// Password Reset (demo: token shown after request)
if (resetForm) {
  resetForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('reset-username').value.trim();
    const resetError = document.getElementById('reset-error');
    resetError.textContent = "";
    try {
      const res = await fetch(`${API}/auth/reset/request`, {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      if (!res.ok) {
        resetError.textContent = data.msg || "Reset failed";
        return;
      }
      // Show token input
      document.getElementById('reset-token').style.display = "";
      document.getElementById('reset-new-password').style.display = "";
      document.getElementById('reset-confirm').style.display = "";
      resetError.textContent = "Token: " + data.token + " (demo: copy this)";
    } catch (err) {
      resetError.textContent = "Connection error";
    }
  });
}
const resetConfirm = document.getElementById('reset-confirm');
if (resetConfirm) {
  resetConfirm.onclick = async function() {
    const username = document.getElementById('reset-username').value.trim();
    const token = document.getElementById('reset-token').value.trim();
    const newPassword = document.getElementById('reset-new-password').value;
    const resetError = document.getElementById('reset-error');
    resetError.textContent = "";
    try {
      const res = await fetch(`${API}/auth/reset/confirm`, {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ username, token, newPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        resetError.textContent = data.msg || "Reset failed";
        return;
      }
      resetError.textContent = "Password reset! You can now login.";
    } catch (err) {
      resetError.textContent = "Connection error";
    }
  };
}

// Logout
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) logoutBtn.onclick = () => {
  setToken(null);
  showLogin();
};

// --- Dashboard user display ---
function setUserNameUI(username) {
  document.getElementById('greeting').textContent = `Hello, ${username}! 🧸`;
  document.getElementById('user-avatar').src =
    `https://api.dicebear.com/8.x/bottts/svg?seed=${encodeURIComponent(username)}`;
}

// --- Sidebar, theming, tabs ---
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
const darkToggle = document.getElementById('darkModeToggle');
darkToggle.addEventListener('change', () => {
  document.body.classList.toggle('dark', darkToggle.checked);
});

// --- Chart.js: demo data only ---
function renderChart() {
  const ctx = document.getElementById('myChart')?.getContext('2d');
  if (ctx) {
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

async function renderTodos() {
  if (!jwtToken) return;
  const res = await fetch(`${API}/todo`, {
    headers: { 'Authorization': 'Bearer ' + jwtToken }
  });
  const todos = await res.json();
  todoList.innerHTML = '';
  todos.forEach(todo => {
    const li = document.createElement('li');
    li.className = todo.done ? 'done' : '';
    li.innerHTML = `
      <span class="todo-text" style="flex:1;cursor:pointer;">${todo.text}</span>
      <button class="todo-remove" title="Remove">&times;</button>
    `;
    li.querySelector('.todo-text').addEventListener('click', async () => {
      await fetch(`${API}/todo/${todo._id}`, {
        method: "PATCH",
        headers: { 'Authorization': 'Bearer ' + jwtToken }
      });
      renderTodos();
    });
    li.querySelector('.todo-remove').addEventListener('click', async () => {
      await fetch(`${API}/todo/${todo._id}`, {
        method: "DELETE",
        headers: { 'Authorization': 'Bearer ' + jwtToken }
      });
      renderTodos();
    });
    todoList.appendChild(li);
  });
}
if (todoForm) {
  todoForm.addEventListener('submit', async e => {
    e.preventDefault();
    const value = todoInput.value.trim();
    if (!value) return;
    await fetch(`${API}/todo`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwtToken
      },
      body: JSON.stringify({ text: value })
    });
    todoInput.value = '';
    renderTodos();
  });
}

// --- Soundboard Section with file upload, user-specific via API ---
function base64FileSize(dataUrl) {
  // base64 string length * 3/4 = bytes
  if (!dataUrl.startsWith('data:')) return 0;
  return Math.floor((dataUrl.length - dataUrl.indexOf(',') - 1) * 0.75);
}
async function renderSoundboard() {
  if (!jwtToken) return;
  const container = document.getElementById('soundboard-list');
  if (!container) return;
  const res = await fetch(`${API}/soundboard`, {
    headers: { 'Authorization': 'Bearer ' + jwtToken }
  });
  const sounds = await res.json();
  container.innerHTML = '';
  if (!sounds.length) {
    container.innerHTML = `<p style="color:#bdbdbd">No sounds yet! Add one above!</p>`;
    return;
  }
  sounds.forEach(sound => {
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
    div.querySelector('.play-btn').addEventListener('click', async () => {
      let audio = new Audio(sound.url);
      audio.play();
      await fetch(`${API}/soundboard/${sound._id}/play`, {
        method: "POST",
        headers: { 'Authorization': 'Bearer ' + jwtToken }
      });
      renderSoundboard();
    });
    // Remove sound
    div.querySelector('.remove-btn').addEventListener('click', async () => {
      if (confirm(`Remove "${sound.name}"?`)) {
        await fetch(`${API}/soundboard/${sound._id}`, {
          method: "DELETE",
          headers: { 'Authorization': 'Bearer ' + jwtToken }
        });
        renderSoundboard();
      }
    });
    container.appendChild(div);
  });
}
const addSoundForm = document.getElementById('add-sound-form');
if (addSoundForm) {
  addSoundForm.addEventListener('submit', async e => {
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
      if (file.size > 2 * 1024 * 1024) {
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
      reader.onload = async function(evt) {
        const url = evt.target.result;
        // POST to backend
        const res = await fetch(`${API}/soundboard`, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwtToken
          },
          body: JSON.stringify({ name, url })
        });
        if (res.ok) {
          renderSoundboard();
          addSoundForm.reset();
        } else {
          const errData = await res.json();
          alert(errData.msg || "Failed to upload");
        }
      };
      reader.readAsDataURL(file);
    } else if (urlInput) {
      const res = await fetch(`${API}/soundboard`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + jwtToken
        },
        body: JSON.stringify({ name, url: urlInput })
      });
      if (res.ok) {
        renderSoundboard();
        addSoundForm.reset();
      } else {
        const errData = await res.json();
        alert(errData.msg || "Failed to add");
      }
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
  renderTodos();
  renderSoundboard();
  renderChart();
}

// Initial page load: try auto-login with stored token
(async function() {
  if (jwtToken) {
    // Try fetching username from a protected API (e.g., todos)
    try {
      const res = await fetch(`${API}/todo`, {
        headers: { 'Authorization': 'Bearer ' + jwtToken }
      });
      if (res.ok) {
        // Parse token to get username (not strictly secure, but works for demo)
        const base64Payload = jwtToken.split('.')[1];
        const payload = JSON.parse(atob(base64Payload));
        showDashboard(payload.username || "User");
      } else {
        setToken(null);
        showLogin();
      }
    } catch (e) {
      setToken(null);
      showLogin();
    }
  } else {
    showLogin();
  }
})();