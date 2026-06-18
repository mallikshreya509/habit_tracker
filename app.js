// Bloom Habit Tracker - Core Logic Engine

// Global State
let habits = [];
let activeFilter = 'all';
const todayStr = getLocalDateString(new Date());

// Preset Theme Color Mappings for Habits (values used for CSS styles)
const colorPresets = {
  peach: {
    fill: 'oklch(82% 0.11 45)',
    bg: 'oklch(95% 0.04 45 / 50%)'
  },
  apricot: {
    fill: 'oklch(84% 0.12 65)',
    bg: 'oklch(96% 0.04 65 / 50%)'
  },
  coral: {
    fill: 'oklch(77% 0.14 30)',
    bg: 'oklch(94% 0.04 30 / 50%)'
  },
  rose: {
    fill: 'oklch(81% 0.10 15)',
    bg: 'oklch(95% 0.03 15 / 50%)'
  }
};

// --- DOM ELEMENTS ---
const habitsGrid = document.getElementById('habits-grid');
const emptyState = document.getElementById('empty-state');
const filterButtons = document.querySelectorAll('.filter-btn');
const themeToggle = document.getElementById('theme-toggle');
const newHabitTrigger = document.getElementById('new-habit-trigger');
const emptyStateTrigger = document.getElementById('empty-state-trigger');

// Dialog Elements
const habitDialog = document.getElementById('habit-dialog');
const habitForm = document.getElementById('habit-form');
const dialogTitle = document.getElementById('dialog-title');
const dialogClose = document.getElementById('dialog-close');
const dialogCancel = document.getElementById('dialog-cancel');
const dialogDelete = document.getElementById('dialog-delete');
const dialogSubmit = document.getElementById('dialog-submit');

// Dialog Fields
const habitIdField = document.getElementById('habit-id');
const habitNameField = document.getElementById('habit-name');
const habitCategoryField = document.getElementById('habit-category');
const habitFrequencyField = document.getElementById('habit-frequency');
const emojiField = document.getElementById('habit-emoji');
const emojiButtons = document.querySelectorAll('.emoji-btn');

// Stats Elements
const todayProgressRing = document.getElementById('today-progress-ring');
const todayProgressPercent = document.getElementById('today-progress-percent');
const statsCompleted = document.getElementById('stats-completed');
const statsTotal = document.getElementById('stats-total');
const currentStreakVal = document.getElementById('current-streak-val');
const bestStreakVal = document.getElementById('best-streak-val');
const heatmapGrid = document.getElementById('heatmap-grid');

// Category Stats Elements
const catValElements = {
  mind: document.getElementById('cat-mind-val'),
  body: document.getElementById('cat-body-val'),
  growth: document.getElementById('cat-growth-val'),
  soul: document.getElementById('cat-soul-val')
};
const catBarElements = {
  mind: document.getElementById('cat-mind-bar'),
  body: document.getElementById('cat-body-bar'),
  growth: document.getElementById('cat-growth-bar'),
  soul: document.getElementById('cat-soul-bar')
};

// --- UTILITY FUNCTIONS ---

// Format date as YYYY-MM-DD in local time zone
function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get day of week string from date (e.g. "Mon")
function getDayName(date) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
}

// Generate an array of the last N dates (sorted oldest to newest)
function getLastNDates(n) {
  const dates = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(getLocalDateString(d));
  }
  return dates;
}

// Safe Web Audio API Chime Synth
function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Play a gentle, sweet peachy chime (C5 to G5 major interval)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc1.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.12); // G5
    
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
    osc2.frequency.exponentialRampToValueAtTime(987.77, ctx.currentTime + 0.18); // B5

    gain1.gain.setValueAtTime(0.1, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    
    gain2.gain.setValueAtTime(0.05, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start();
    osc2.start();
    
    osc1.stop(ctx.currentTime + 0.5);
    osc2.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.log("Audio play blocked or unsupported:", e);
  }
}

// --- STATE MANAGEMENT ---

// Load data from LocalStorage
function loadState() {
  const stored = localStorage.getItem('bloom_habits');
  if (stored) {
    habits = JSON.parse(stored);
  } else {
    // Seed initial high-fidelity demo data
    seedDemoData();
  }
}

// Save data to LocalStorage
function saveState() {
  localStorage.setItem('bloom_habits', JSON.stringify(habits));
}

// Seed Demo Habits with historical logs
function seedDemoData() {
  const demoHabits = [
    {
      id: 'demo-meditation',
      name: 'Morning Meditation',
      category: 'mind',
      frequency: 'daily',
      color: 'rose',
      emoji: '🧘',
      createdAt: getLocalDateString(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
      history: []
    },
    {
      id: 'demo-water',
      name: 'Hydrate 2L Water',
      category: 'body',
      frequency: 'daily',
      color: 'apricot',
      emoji: '💧',
      createdAt: getLocalDateString(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
      history: []
    },
    {
      id: 'demo-reading',
      name: 'Read 15 Pages',
      category: 'growth',
      frequency: 'daily',
      color: 'peach',
      emoji: '📚',
      createdAt: getLocalDateString(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
      history: []
    },
    {
      id: 'demo-tea',
      name: 'Tea & Journal',
      category: 'soul',
      frequency: 'daily',
      color: 'coral',
      emoji: '🍵',
      createdAt: getLocalDateString(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
      history: []
    }
  ];

  // Populate history randomly over the past 30 days to build a beautiful visual starting state
  const dates = getLastNDates(30);
  
  // Custom probabilities of completion for realistic habits
  const completionProb = {
    'demo-meditation': 0.65,
    'demo-water': 0.82,
    'demo-reading': 0.50,
    'demo-tea': 0.40
  };

  dates.forEach(dateStr => {
    // Skip today for seeding demo so the user can interactively complete them today
    if (dateStr === todayStr) return;

    demoHabits.forEach(habit => {
      if (Math.random() < completionProb[habit.id]) {
        habit.history.push(dateStr);
      }
    });
  });

  habits = demoHabits;
  saveState();
}

// --- RENDER FUNCTIONS ---

// Render active habits
function renderHabits() {
  const filtered = habits.filter(habit => {
    if (activeFilter === 'all') return true;
    return habit.category === activeFilter;
  });

  // Toggle empty state
  if (filtered.length === 0) {
    habitsGrid.style.display = 'block';
    emptyState.classList.remove('hidden');
    // Hide habit-specific elements inside empty grid but keep message
    Array.from(habitsGrid.children).forEach(child => {
      if (child.id !== 'empty-state') child.remove();
    });
    return;
  }

  habitsGrid.style.display = 'grid';
  emptyState.classList.add('hidden');

  // Clear existing items (except empty-state placeholder)
  Array.from(habitsGrid.children).forEach(child => {
    if (child.id !== 'empty-state') child.remove();
  });

  filtered.forEach(habit => {
    const isCompletedToday = habit.history.includes(todayStr);
    const preset = colorPresets[habit.color] || colorPresets.peach;
    
    const card = document.createElement('div');
    card.className = `glass-card habit-card ${isCompletedToday ? 'completed' : ''}`;
    card.setAttribute('style', `
      --habit-color-fill: ${preset.fill}; 
      --habit-color-bg: ${preset.bg};
    `);
    
    // Calculate streak
    const streak = calculateActiveStreak(habit);

    // Build history dots for the last 7 days (including today)
    const last7Days = getLastNDates(7);
    const historyDotsHTML = last7Days.map(dateStr => {
      const d = new Date(dateStr);
      const label = getDayName(d).substring(0, 1);
      const isCompleted = habit.history.includes(dateStr);
      const isCurrentDay = dateStr === todayStr;
      
      return `
        <div class="history-day" title="${dateStr}">
          <span class="history-dot ${isCompleted ? 'completed' : ''}" style="${isCurrentDay ? 'border: 1px solid var(--text-main);' : ''}"></span>
          <span class="history-label">${label}</span>
        </div>
      `;
    }).join('');

    card.innerHTML = `
      <div class="habit-card-header">
        <div class="habit-meta">
          <div class="habit-icon-circle" style="background-color: var(--habit-color-bg);">
            ${habit.emoji || '🌸'}
          </div>
          <div class="habit-title-container">
            <h3 class="habit-title">${habit.name}</h3>
            <span class="habit-cat-badge">${habit.category} • ${habit.frequency === 'daily' ? 'daily' : habit.frequency === 'weekdays' ? 'weekdays' : 'weekends'}</span>
          </div>
        </div>
        <button class="habit-options-btn" data-id="${habit.id}" aria-label="Edit habit options">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
          </svg>
        </button>
      </div>

      <div class="habit-history">
        ${historyDotsHTML}
      </div>

      <div class="habit-card-footer">
        <div class="habit-streak-display">
          <span>${streak}</span> day streak
        </div>
        <button class="habit-check-btn" data-id="${habit.id}" aria-label="Mark completed today">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
          </svg>
        </button>
      </div>
    `;

    // Hook listeners
    card.querySelector('.habit-check-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleHabitCompletion(habit.id);
    });

    card.querySelector('.habit-options-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      openEditDialog(habit);
    });

    habitsGrid.appendChild(card);
  });
}

// Render overall stats
function renderStats() {
  if (habits.length === 0) {
    updateProgressRing(0);
    statsCompleted.textContent = '0';
    statsTotal.textContent = '0';
    currentStreakVal.textContent = '0';
    bestStreakVal.textContent = '0';
    renderHeatmap();
    renderCategoryBreakdown();
    return;
  }

  // Habits applicable for today based on frequency
  const dayOfWeek = new Date().getDay(); // 0 is Sun, 6 is Sat
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const todayHabits = habits.filter(habit => {
    if (habit.frequency === 'daily') return true;
    if (habit.frequency === 'weekdays' && !isWeekend) return true;
    if (habit.frequency === 'weekends' && isWeekend) return true;
    return false;
  });

  const activeTodayHabits = todayHabits.length > 0 ? todayHabits : habits;
  const completedToday = activeTodayHabits.filter(h => h.history.includes(todayStr)).length;
  const totalToday = activeTodayHabits.length;
  
  const progressPercent = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;
  
  // Update UI stats
  updateProgressRing(progressPercent);
  statsCompleted.textContent = completedToday;
  statsTotal.textContent = habits.length;

  // Streak calculations
  const globalStreak = calculateGlobalStreak();
  currentStreakVal.textContent = globalStreak.current;
  bestStreakVal.textContent = globalStreak.best;

  // Render heatmap and category charts
  renderHeatmap();
  renderCategoryBreakdown();
}

// Render dynamic 30-day heatmap grid
function renderHeatmap() {
  heatmapGrid.innerHTML = '';
  
  // Calculate completion records for last 30 days
  const last30Days = getLastNDates(30);
  
  last30Days.forEach(dateStr => {
    // Count how many habits were completed on this specific day
    const completedCount = habits.filter(h => h.history.includes(dateStr)).length;
    
    // Assign color intensity levels (0: none, 1: 1-2, 2: 3, 3: 4+)
    let level = 0;
    if (completedCount > 0) {
      if (completedCount <= 1) level = 1;
      else if (completedCount <= 2) level = 2;
      else level = 3;
    }
    
    const cell = document.createElement('div');
    cell.className = `heatmap-cell level-${level}`;
    
    // Format friendly date string (e.g. "Jun 17")
    const d = new Date(dateStr);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const friendlyDate = `${monthNames[d.getMonth()]} ${d.getDate()}`;
    
    cell.setAttribute('data-date', friendlyDate);
    cell.setAttribute('data-count', completedCount);
    
    heatmapGrid.appendChild(cell);
  });
}

// Render focus area/category completion percentage
function renderCategoryBreakdown() {
  const categories = ['mind', 'body', 'growth', 'soul'];
  
  categories.forEach(cat => {
    const catHabits = habits.filter(h => h.category === cat);
    if (catHabits.length === 0) {
      catValElements[cat].textContent = '0%';
      catBarElements[cat].style.width = '0%';
      return;
    }
    
    // Calculate completion rate over the last 14 days
    const last14Days = getLastNDates(14);
    let totalPossible = 0;
    let totalCompleted = 0;
    
    catHabits.forEach(habit => {
      last14Days.forEach(dateStr => {
        const d = new Date(dateStr);
        const dayOfWeek = d.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        // Filter frequency compatibility
        let isApplicable = true;
        if (habit.frequency === 'weekdays' && isWeekend) isApplicable = false;
        if (habit.frequency === 'weekends' && !isWeekend) isApplicable = false;
        
        if (isApplicable) {
          totalPossible++;
          if (habit.history.includes(dateStr)) {
            totalCompleted++;
          }
        }
      });
    });

    const completionRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
    
    catValElements[cat].textContent = `${completionRate}%`;
    catBarElements[cat].style.width = `${completionRate}%`;
  });
}

// Update circular progress SVG
function updateProgressRing(percent) {
  const radius = todayProgressRing.r.baseVal.value;
  const circumference = radius * 2 * Math.PI;
  
  todayProgressRing.style.strokeDasharray = `${circumference} ${circumference}`;
  
  const offset = circumference - (percent / 100) * circumference;
  todayProgressRing.style.strokeDashoffset = offset;
  todayProgressPercent.textContent = `${percent}%`;
}

// --- LOGIC CALCULATIONS ---

// Toggle completed status for a habit
function toggleHabitCompletion(id) {
  const habit = habits.find(h => h.id === id);
  if (!habit) return;

  const index = habit.history.indexOf(todayStr);
  if (index > -1) {
    // Undo completion
    habit.history.splice(index, 1);
  } else {
    // Complete
    habit.history.push(todayStr);
    playChime();
  }

  saveState();
  renderHabits();
  renderStats();
}

// Calculate active consecutive streak for a single habit
function calculateActiveStreak(habit) {
  if (habit.history.length === 0) return 0;
  
  const historySet = new Set(habit.history);
  let streak = 0;
  let checkDate = new Date();
  
  // If not completed today, start checking from yesterday.
  // If it was completed today, start checking from today.
  const completedToday = historySet.has(todayStr);
  if (!completedToday) {
    checkDate.setDate(checkDate.getDate() - 1);
  }
  
  while (true) {
    const dateStr = getLocalDateString(checkDate);
    
    // Check if the habit should have been done on this day based on frequency
    const dayOfWeek = checkDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    let isRequired = true;
    
    if (habit.frequency === 'weekdays' && isWeekend) isRequired = false;
    if (habit.frequency === 'weekends' && !isWeekend) isRequired = false;
    
    if (isRequired) {
      if (historySet.has(dateStr)) {
        streak++;
      } else {
        // Streak broken
        break;
      }
    }
    
    checkDate.setDate(checkDate.getDate() - 1);
    
    // Hard break safety check (prevent infinite loop for old habits)
    if (streak > 365) break;
  }
  
  return streak;
}

// Calculate global dedication streak across the entire app
function calculateGlobalStreak() {
  if (habits.length === 0) return { current: 0, best: 0 };
  
  // Collect all unique completion dates across all habits
  const allCompletions = new Set();
  habits.forEach(h => {
    h.history.forEach(date => allCompletions.add(date));
  });
  
  if (allCompletions.size === 0) return { current: 0, best: 0 };
  
  // Calculate active current streak
  let currentStreak = 0;
  let checkDate = new Date();
  let completedToday = allCompletions.has(todayStr);
  
  if (!completedToday) {
    checkDate.setDate(checkDate.getDate() - 1);
  }
  
  while (true) {
    const dateStr = getLocalDateString(checkDate);
    if (allCompletions.has(dateStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
    if (currentStreak > 365) break;
  }
  
  // Calculate best historic streak
  // 1. Sort all unique completion dates chronologically
  const sortedDates = Array.from(allCompletions).map(d => new Date(d)).sort((a, b) => a - b);
  
  let bestStreak = 0;
  let tempStreak = 0;
  let prevDate = null;
  
  sortedDates.forEach(date => {
    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diffTime = Math.abs(date - prevDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        if (tempStreak > bestStreak) {
          bestStreak = tempStreak;
        }
        tempStreak = 1;
      }
    }
    prevDate = date;
  });
  
  if (tempStreak > bestStreak) {
    bestStreak = tempStreak;
  }
  
  // Ensure best streak is at least the current streak
  if (currentStreak > bestStreak) {
    bestStreak = currentStreak;
  }
  
  return {
    current: currentStreak,
    best: bestStreak
  };
}

// --- DIALOG / MODAL ACTIONS ---

// Open dialog to create a new habit
function openNewHabitDialog() {
  habitForm.reset();
  habitIdField.value = '';
  dialogTitle.textContent = 'plant a habit';
  dialogSubmit.textContent = 'Plant Habit';
  dialogDelete.classList.add('hidden');
  
  // Set default emoji
  emojiField.value = '🌸';
  selectPresetEmoji('🌸');
  
  // Select default color peach
  document.querySelector('.theme-peach input').checked = true;

  habitDialog.showModal();
}

// Open dialog to edit an existing habit
function openEditDialog(habit) {
  habitIdField.value = habit.id;
  habitNameField.value = habit.name;
  habitCategoryField.value = habit.category;
  habitFrequencyField.value = habit.frequency;
  emojiField.value = habit.emoji || '🌸';
  
  selectPresetEmoji(habit.emoji || '🌸');
  
  // Set color option check
  const colorInput = document.querySelector(`.theme-option input[value="${habit.color}"]`);
  if (colorInput) colorInput.checked = true;
  
  dialogTitle.textContent = 'nurture habit details';
  dialogSubmit.textContent = 'Save Changes';
  dialogDelete.classList.remove('hidden');
  
  habitDialog.showModal();
}

// Update emoji picker selection visual
function selectPresetEmoji(emoji) {
  emojiButtons.forEach(btn => {
    if (btn.textContent.trim() === emoji) {
      btn.classList.add('selected');
    } else {
      btn.classList.remove('selected');
    }
  });
}

// Save dialog form
function saveHabitFromForm() {
  const name = habitNameField.value.trim();
  const category = habitCategoryField.value;
  const frequency = habitFrequencyField.value;
  const emoji = emojiField.value;
  const color = document.querySelector('input[name="habit-color"]:checked').value;
  const id = habitIdField.value;

  if (!name) return;

  if (id) {
    // Update existing
    const habitIndex = habits.findIndex(h => h.id === id);
    if (habitIndex > -1) {
      habits[habitIndex] = {
        ...habits[habitIndex],
        name,
        category,
        frequency,
        emoji,
        color
      };
    }
  } else {
    // Add new
    const newHabit = {
      id: 'habit-' + Date.now(),
      name,
      category,
      frequency,
      color,
      emoji,
      createdAt: todayStr,
      history: []
    };
    habits.push(newHabit);
  }

  saveState();
  renderHabits();
  renderStats();
  habitDialog.close();
}

// Delete habit
function deleteHabit() {
  const id = habitIdField.value;
  if (!id) return;
  
  if (confirm("Are you sure you want to remove this habit and all its history?")) {
    habits = habits.filter(h => h.id !== id);
    saveState();
    renderHabits();
    renderStats();
    habitDialog.close();
  }
}

// --- THEME / DARK MODE TOGGLE ---

function initTheme() {
  const currentTheme = localStorage.getItem('bloom_theme') || 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
  
  const sunIcon = themeToggle.querySelector('.sun-icon');
  const moonIcon = themeToggle.querySelector('.moon-icon');
  
  if (currentTheme === 'dark') {
    sunIcon.classList.add('hidden');
    moonIcon.classList.remove('hidden');
  } else {
    sunIcon.classList.remove('hidden');
    moonIcon.classList.add('hidden');
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('bloom_theme', newTheme);
  
  const sunIcon = themeToggle.querySelector('.sun-icon');
  const moonIcon = themeToggle.querySelector('.moon-icon');
  
  if (newTheme === 'dark') {
    sunIcon.classList.add('hidden');
    moonIcon.classList.remove('hidden');
  } else {
    sunIcon.classList.remove('hidden');
    moonIcon.classList.add('hidden');
  }
}

// --- INITIALIZE & EVENT LISTENERS ---

function init() {
  loadState();
  initTheme();
  renderHabits();
  renderStats();
  
  // Set up Event Listeners
  newHabitTrigger.addEventListener('click', openNewHabitDialog);
  emptyStateTrigger.addEventListener('click', openNewHabitDialog);
  themeToggle.addEventListener('click', toggleTheme);
  dialogClose.addEventListener('click', () => habitDialog.close());
  dialogCancel.addEventListener('click', () => habitDialog.close());
  dialogDelete.addEventListener('click', deleteHabit);
  
  // Handle Category Filter click
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.getAttribute('data-filter');
      renderHabits();
    });
  });

  // Handle Form Submit
  habitForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveHabitFromForm();
  });

  // Emoji preset picker listeners
  emojiButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      emojiField.value = btn.textContent.trim();
      selectPresetEmoji(btn.textContent.trim());
    });
  });
}

// Start the app when content is loaded
document.addEventListener('DOMContentLoaded', init);
