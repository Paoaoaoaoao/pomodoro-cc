// === PomodoroCC - Main Application ===

// ---- State ----
const WORK_TIME = 25 * 60;   // 25 分钟专注
const BREAK_TIME = 5 * 60;   // 5 分钟休息

let currentMode = 'work';           // 'work' | 'break'
let timeLeft = WORK_TIME;          // 剩余秒数
let totalTime = WORK_TIME;         // 当前模式总秒数
let timerInterval = null;          // setInterval ID
let isRunning = false;
let sessionCount = 0;              // 完成的专注轮数
let tasks = [];                    // { id, text, completed, createdAt }

// ---- Sound (使用 Web Audio API 生成提示音) ----
function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    // 简单的三音提示
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.3);
    });
  } catch (_) { /* 忽略音频错误 */ }
}

// ---- Notification (Tauri 桌面通知) ----
async function sendDesktopNotification(title, body) {
  try {
    if (window.__TAURI__ && window.__TAURI__.notification) {
      await window.__TAURI__.notification.sendNotification({ title, body });
    }
  } catch (_) {
    // 回退到浏览器通知
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  }
}

// ---- Timer Logic ----
function updateTimerDisplay() {
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  document.getElementById('timerTime').textContent = timeStr;

  // 更新圆环进度
  const progress = 1 - (timeLeft / totalTime);
  const circumference = 565.49; // 2 * π * 90
  const offset = circumference * (1 - progress);
  const ring = document.getElementById('progressRing');
  ring.style.strokeDashoffset = offset;

  // 根据模式切换颜色
  ring.style.stroke = currentMode === 'work' ? 'var(--work-color)' : 'var(--break-color)';

  // 更新页面标题
  const modeLabel = currentMode === 'work' ? '🔥' : '☕';
  document.title = `${timeStr} ${modeLabel} - PomodoroCC`;
}

function updateTimerLabel() {
  const label = document.getElementById('timerLabel');
  if (isRunning) {
    label.textContent = currentMode === 'work' ? '🔥 专注中...' : '☕ 休息中...';
  } else if (timeLeft !== totalTime) {
    label.textContent = '⏸ 已暂停';
  } else {
    label.textContent = currentMode === 'work' ? '准备开始专注' : '准备开始休息';
  }
}

function updateButtonStates() {
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const resetBtn = document.getElementById('resetBtn');

  if (isRunning) {
    startBtn.disabled = true;
    pauseBtn.disabled = false;
  } else {
    startBtn.disabled = false;
    pauseBtn.disabled = true;
  }
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  updateButtonStates();
  updateTimerLabel();

  timerInterval = setInterval(() => {
    timeLeft--;

    if (timeLeft <= 0) {
      timeLeft = 0;
      updateTimerDisplay();
      timerComplete();
      return;
    }

    updateTimerDisplay();
  }, 1000);
}

function pauseTimer() {
  if (!isRunning) return;
  isRunning = false;
  clearInterval(timerInterval);
  timerInterval = null;
  updateButtonStates();
  updateTimerLabel();
}

function resetTimer() {
  pauseTimer();
  timeLeft = totalTime;
  updateTimerDisplay();
  updateTimerLabel();
}

function skipTimer() {
  pauseTimer();
  timeLeft = 0;
  updateTimerDisplay();
  timerComplete();
}

async function timerComplete() {
  isRunning = false;
  clearInterval(timerInterval);
  timerInterval = null;
  updateButtonStates();

  if (currentMode === 'work') {
    sessionCount++;
    saveSessionCount();
    updateSessionDisplay();
    updateTimerLabel();

    // 通知
    playNotificationSound();
    await sendDesktopNotification(
      '🍅 专注时间结束！',
      `太棒了！你已经完成了 ${sessionCount} 轮专注。该休息一下了~`
    );

    // 切换到休息
    switchMode('break');
  } else {
    playNotificationSound();
    await sendDesktopNotification(
      '☕ 休息时间结束！',
      '休息好了吗？准备开始新一轮专注吧！'
    );

    // 切换到专注
    switchMode('work');
  }

  // 自动开始下一轮
  timeLeft = totalTime;
  updateTimerDisplay();
  startTimer();
}

function switchMode(mode) {
  currentMode = mode;
  timeLeft = mode === 'work' ? WORK_TIME : BREAK_TIME;
  totalTime = timeLeft;

  // 更新标签页
  document.getElementById('workTab').classList.toggle('active', mode === 'work');
  document.getElementById('breakTab').classList.toggle('active', mode === 'break');
  document.getElementById('timerLabel').textContent =
    mode === 'work' ? '准备开始专注' : '准备开始休息';

  updateTimerDisplay();
  updateTimerLabel();
  updateButtonStates();
}

function updateSessionDisplay() {
  document.getElementById('sessionCount').textContent = sessionCount;
}

function saveSessionCount() {
  localStorage.setItem('pomodoro-session-count', sessionCount);
}

function loadSessionCount() {
  const saved = localStorage.getItem('pomodoro-session-count');
  if (saved) sessionCount = parseInt(saved, 10) || 0;
  updateSessionDisplay();
}

function resetSessionCount() {
  sessionCount = 0;
  saveSessionCount();
  updateSessionDisplay();
}

// ==== Task Management ====

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function saveTasks() {
  localStorage.setItem('pomodoro-tasks', JSON.stringify(tasks));
}

function loadTasks() {
  const saved = localStorage.getItem('pomodoro-tasks');
  if (saved) {
    try {
      tasks = JSON.parse(saved);
    } catch (_) {
      tasks = [];
    }
  }
}

function addTask(text) {
  const task = {
    id: generateId(),
    text: text.trim(),
    completed: false,
    createdAt: Date.now(),
  };
  tasks.unshift(task); // 新任务放在最前面
  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
  }
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

function clearDoneTasks() {
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  renderTasks();
}

function renderTasks() {
  const list = document.getElementById('taskList');
  const actions = document.getElementById('taskActions');

  if (tasks.length === 0) {
    list.innerHTML = '<div class="empty-state">✨ 还没有任务，添加一个吧！</div>';
    actions.style.display = 'none';
  } else {
    list.innerHTML = tasks
      .map(
        task => `
          <li class="task-item ${task.completed ? 'completed' : ''}">
            <input
              type="checkbox"
              class="task-checkbox"
              ${task.completed ? 'checked' : ''}
              data-id="${task.id}"
            />
            <span class="task-text">${escapeHtml(task.text)}</span>
            <button class="task-delete" data-id="${task.id}" title="删除任务">×</button>
          </li>
        `
      )
      .join('');

    // 绑定 checkbox 事件
    list.querySelectorAll('.task-checkbox').forEach(cb => {
      cb.addEventListener('change', () => toggleTask(cb.dataset.id));
    });

    // 绑定删除按钮事件
    list.querySelectorAll('.task-delete').forEach(btn => {
      btn.addEventListener('click', () => deleteTask(btn.dataset.id));
    });

    // 显示或隐藏"清除已完成"按钮
    const hasDone = tasks.some(t => t.completed);
    actions.style.display = hasDone ? 'flex' : 'none';
  }

  updateTaskProgress();
}

function updateTaskProgress() {
  const total = tasks.length;
  const done = tasks.filter(t => t.completed).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  document.getElementById('taskProgressBar').style.width = `${pct}%`;
  document.getElementById('taskProgressText').textContent = `${done}/${total}`;
}

function escapeHtml(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return str.replace(/[&<>"']/g, c => map[c]);
}

// ==== Event Bindings ====

document.addEventListener('DOMContentLoaded', () => {
  // 加载持久化数据
  loadSessionCount();
  loadTasks();

  // 初始化显示
  updateTimerDisplay();
  updateTimerLabel();
  updateButtonStates();
  renderTasks();

  // 模式切换
  document.getElementById('workTab').addEventListener('click', () => {
    if (currentMode === 'work') return;
    pauseTimer();
    switchMode('work');
  });
  document.getElementById('breakTab').addEventListener('click', () => {
    if (currentMode === 'break') return;
    pauseTimer();
    switchMode('break');
  });

  // 计时器控制
  document.getElementById('startBtn').addEventListener('click', startTimer);
  document.getElementById('pauseBtn').addEventListener('click', pauseTimer);
  document.getElementById('resetBtn').addEventListener('click', resetTimer);
  document.getElementById('skipBtn').addEventListener('click', skipTimer);

  // 重置计数
  document.getElementById('resetSessionBtn').addEventListener('click', resetSessionCount);

  // 任务操作
  document.getElementById('addTaskBtn').addEventListener('click', () => {
    const input = document.getElementById('taskInput');
    const text = input.value.trim();
    if (text) {
      addTask(text);
      input.value = '';
      input.focus();
    }
  });
  document.getElementById('taskInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      document.getElementById('addTaskBtn').click();
    }
  });
  document.getElementById('clearDoneBtn').addEventListener('click', clearDoneTasks);

  // 请求浏览器通知权限（作为 Tauri 通知的回退）
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }

  // 键盘快捷键
  document.addEventListener('keydown', e => {
    if (e.code === 'Space' && e.target === document.body) {
      e.preventDefault();
      isRunning ? pauseTimer() : startTimer();
    }
  });

  console.log('🍅 PomodoroCC 已就绪！');
});
