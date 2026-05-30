// --- Состояние теории ---
let theoryState = {
  level: null,
  currentQuestion: null,
  startTime: null,
  timerInterval: null,
  answered: false
};

let theoryGuideState = { open: false, topic: null };

function playAnswerSound(correct) {
  const src = correct ? 'sound/correct.mp3' : 'sound/error.mp3';
  new Audio(src).play().catch(() => {});
}

function getTheoryCooldowns() {
  return JSON.parse(localStorage.getItem('engwords_theory_cooldowns') || '{}');
}

function saveTheoryCooldowns(data) {
  localStorage.setItem('engwords_theory_cooldowns', JSON.stringify(data));
}

function getTheoryStats() {
  return JSON.parse(localStorage.getItem('engwords_theory_stats') || '{}');
}

function saveTheoryStats(data) {
  localStorage.setItem('engwords_theory_stats', JSON.stringify(data));
}

function getTimerColor(seconds) {
  if (seconds <= 10) return '#4CAF50';
  if (seconds <= 20) return '#FF9800';
  if (seconds <= 45) return '#FFEB3B';
  return '#f44336';
}

function getTimerLabel(seconds) {
  if (seconds <= 10) return 'Быстро (+х2)';
  if (seconds <= 20) return 'Нормально (+х1.5)';
  if (seconds <= 30) return 'Средне (+х1)';
  if (seconds <= 45) return 'Медленно (+х0.5)';
  return 'Очень медленно (+х0.1)';
}

function getTimerCooldownMultiplier(seconds) {
  if (seconds <= 10) return 2;
  if (seconds <= 20) return 1.5;
  if (seconds <= 30) return 1;
  if (seconds <= 45) return 0.5;
  return 0.1;
}

function formatCooldownHours(hours) {
  if (hours < 1) {
    const mins = Math.round(hours * 60);
    return mins + ' мин';
  }
  if (hours < 24) return hours + ' ч';
  const days = Math.floor(hours / 24);
  const rest = Math.round(hours % 24);
  return days + ' д ' + rest + ' ч';
}

function getTimerEffectsLabel(seconds) {
  const mult = getTimerCooldownMultiplier(seconds);
  if (mult >= 1) return '+' + mult + 'x';
  return '+' + mult + 'x';
}

// --- Progress ---
function getTheoryProgress() {
  return JSON.parse(localStorage.getItem('engwords_theory_progress') || '{"A1":{"total":0,"answered":0,"streak":0},"A2":{"total":0,"answered":0,"streak":0},"B1":{"total":0,"answered":0,"streak":0}}');
}

function saveTheoryProgress(level, answeredCount, totalCount) {
  const p = getTheoryProgress();
  if (!p[level]) p[level] = { total: 0, answered: 0, streak: 0 };
  p[level].total = totalCount;
  p[level].answered = answeredCount;
  localStorage.setItem('engwords_theory_progress', JSON.stringify(p));
}

// --- Показать экран теории ---
window.showTheory = function() {
  switchScreen('theory-screen');
  document.querySelectorAll('.nav-header .glass-button').forEach(btn => btn.classList.remove('active'));
  const buttons = document.querySelectorAll('.nav-header .glass-button');
  if (buttons[5]) buttons[5].classList.add('active');
  window.scrollTo(0, 0);
  renderTheoryLevels();
};

// --- Рендер плашек уровней ---
function renderTheoryLevels() {
  const container = document.getElementById('theory-screen');
  const progress = getTheoryProgress();
  const levels = [
    { id: 'A1', label: 'A1', desc: 'Starter / Beginner', color: '#4CAF50' },
    { id: 'A2', label: 'A2', desc: 'Elementary', color: '#2196F3' },
    { id: 'B1', label: 'B1', desc: 'Intermediate', color: '#FF9800' }
  ];

  let html = '<h2 style="color:var(--primary-green);text-shadow:0 0 10px var(--primary-green);margin-bottom:10px;">ТЕОРИЯ АНГЛИЙСКОГО</h2>';
  html += '<p style="color:#888;margin-bottom:25px;">Выбери уровень — вопросы появляются с адаптивным интервалом</p>';
  html += '<div class="theory-levels">';

  levels.forEach(l => {
    const totalQ = theoryData[l.id] ? theoryData[l.id].length : 0;
    const answered = progress[l.id] ? progress[l.id].answered : 0;
    const pct = totalQ > 0 ? Math.round((answered / totalQ) * 100) : 0;

    const cooldowns = getTheoryCooldowns();
    const lvlCooldowns = cooldowns[l.id] || {};
    const now = Date.now();
    const available = theoryData[l.id] ? theoryData[l.id].filter(q => {
      const cd = lvlCooldowns[q.id];
      return !cd || cd.nextAvailable <= now;
    }).length : 0;

    html += `
      <div class="theory-level-card" onclick="startTheory('${l.id}')" style="--card-color:${l.color}">
        <div class="theory-level-badge">${l.id}</div>
        <div class="theory-level-desc">${l.desc}</div>
        <div class="theory-level-progress">
          <div class="theory-level-bar" style="width:${pct}%"></div>
        </div>
        <div class="theory-level-pct">${available} / ${totalQ}</div>
        <div class="theory-level-count">${totalQ} вопросов</div>
      </div>
    `;
  });

  html += '</div>';
  html += '<div style="margin-top:30px;text-align:left;max-width:700px;margin-left:auto;margin-right:auto;">';
  html += '<h3 style="color:var(--primary-green);margin-bottom:15px;">Как это работает:</h3>';
  html += '<ul style="list-style:none;padding:0;color:#aaa;font-size:14px;line-height:1.8;">';
  html += '<li>🎯 <b>Правильный ответ</b> — вопрос уходит в <b>кулдаун</b> на 2 дня</li>';
  html += '<li>⏱ <b>Таймер отсчёта</b> — чем быстрее ответишь, тем дольше кулдаун (×2, ×1.5, ×1, ×0.5, ×0.1)</li>';
  html += '<li>🔄 <b>Неверный ответ</b> — вопрос вернётся через 1 час</li>';
  html += '<li>🏆 <b>Цель</b> — довести кулдаун каждого вопроса до максимума</li>';
  html += '</ul></div>';

  container.innerHTML = html;
}

// --- Запуск (первый вопрос уровня) ---
window.startTheory = function(level) {
  const questions = theoryData[level];
  if (!questions || questions.length === 0) {
    alert('Вопросы для этого уровня пока не добавлены.');
    return;
  }

  theoryState.level = level;
  theoryState.answered = false;
  theoryState.currentQuestion = null;
  if (theoryState.timerInterval) {
    clearInterval(theoryState.timerInterval);
    theoryState.timerInterval = null;
  }

  loadNextTheoryQuestion();
};

// --- Получить следующий доступный вопрос ---
function loadNextTheoryQuestion() {
  const questions = theoryData[theoryState.level];
  if (!questions || questions.length === 0) {
    renderTheoryLevels();
    return;
  }

  const cooldowns = getTheoryCooldowns();
  if (!cooldowns[theoryState.level]) cooldowns[theoryState.level] = {};
  const levelCooldowns = cooldowns[theoryState.level];

  const now = Date.now();

  // Найти вопросы, которые не в кулдауне
  const available = questions.filter(q => {
    const cd = levelCooldowns[q.id];
    return !cd || cd.nextAvailable <= now;
  });

  if (available.length === 0) {
    // Все вопросы в кулдауне — показать когда освободится первый
    const earliest = Math.min(
      ...Object.values(levelCooldowns).map(cd => cd.nextAvailable)
    );
    const waitMs = earliest - now;
    const waitHours = waitMs / (1000 * 60 * 60);
    renderAllCooldown(waitHours);
    return;
  }

  // Случайный доступный вопрос
  const q = available[Math.floor(Math.random() * available.length)];
  theoryState.currentQuestion = q;
  theoryState.startTime = Date.now();
  theoryState.answered = false;
  theoryState.selectedAnswer = undefined;
  theoryState.selectedAnswers = undefined;
  if (theoryGuideState.open && theoryGuideState.topic !== q.topic) {
    theoryGuideState.open = false;
    theoryGuideState.topic = null;
  }
  renderTheoryQuestion(q);
}

// --- Все вопросы на кулдауне ---
function renderAllCooldown(waitHours) {
  const container = document.getElementById('theory-screen');
  const progress = getTheoryProgress();
  const totalQ = theoryData[theoryState.level] ? theoryData[theoryState.level].length : 0;
  const answered = progress[theoryState.level] ? progress[theoryState.level].answered : 0;

  let html = '<div class="theory-quiz-container" style="text-align:center;">';
  html += '<div class="theory-quiz-header">';
  html += '<button class="glass-button" onclick="renderTheoryLevels()" style="background:transparent;border-color:#555;color:#aaa;padding:6px 14px;font-size:12px;">← Назад</button>';
  html += '<span style="color:var(--primary-green);font-size:14px;">' + theoryState.level + '</span>';
  html += '</div>';

  html += '<div style="margin-top:60px;">';
  html += '<div style="font-size:60px;margin-bottom:20px;">✅</div>';
  html += '<h2 style="color:var(--primary-green);text-shadow:0 0 10px var(--primary-green);">ВСЕ ВОПРОСЫ ОТВЕЧЕНЫ!</h2>';
  html += '<p style="color:#888;font-size:16px;margin:15px 0;">' + answered + ' / ' + totalQ + ' вопросов пройдено</p>';
  html += '<p style="color:#aaa;font-size:14px;">Следующий вопрос будет доступен через:</p>';
  html += '<div style="font-size:28px;color:var(--primary-blue);font-weight:600;margin:15px 0;">' + formatCooldownHours(waitHours) + '</div>';
  html += '<button class="glass-button" onclick="renderTheoryLevels()" style="margin-top:20px;background:transparent;border-color:#555;color:#aaa;">К ВЫБОРУ УРОВНЯ</button>';
  html += '</div></div>';

  container.innerHTML = html;
}

// --- Форматирование вопроса ---
function formatTheoryQuestion(text) {
  return text.replace(/_{3,}/g, '<span class="theory-blank">______</span>');
}

// --- Рендер вопроса ---
function renderTheoryQuestion(q) {
  const container = document.getElementById('theory-screen');
  const guideData = theoryGuideState.open && theoryGuides[theoryGuideState.topic] ? theoryGuides[theoryGuideState.topic] : null;

  let html = '';
  if (guideData) html += '<div class="theory-split-layout">';
  html += '<div class="theory-quiz-container">';
  html += '<div class="theory-quiz-header">';
  html += '<button class="glass-button" onclick="exitTheory()" style="background:transparent;border-color:#555;color:#aaa;padding:6px 14px;font-size:12px;">← Назад</button>';
  html += '<span class="theory-topic-btn" onclick="toggleTheoryGuide(\'' + q.topic.replace(/'/g, "\\'") + '\')" title="Открыть гайд по теме">📖 ' + theoryState.level + ' · ' + q.topic + ' ▸</span>';
  html += '</div>';

  // Таймер
  html += '<div class="theory-timer-container">';
  html += '<div id="theory-timer-bar" class="theory-timer-bar" style="background:#4CAF50;width:0%;"></div>';
  html += '</div>';
  html += '<div class="theory-timer-info">';
  html += '<span id="theory-timer-text" style="color:#4CAF50;font-weight:600;">00:00</span>';
  html += '<span id="theory-timer-effect" style="color:#4CAF50;font-size:12px;">Быстро (+х2)</span>';
  html += '</div>';

  // Вопрос
  html += '<div class="theory-question">' + formatTheoryQuestion(q.question) + '</div>';

  // Опции
  if (q.type === 'single') {
    html += '<div class="theory-options single">';
    q.options.forEach((opt, i) => {
      const selected = theoryState.selectedAnswer === i ? ' selected' : '';
      html += '<div class="theory-option' + selected + '" data-index="' + i + '" onclick="selectTheoryOption(' + i + ')">';
      html += '<span class="theory-radio"></span>';
      html += '<span>' + opt + '</span>';
      html += '</div>';
    });
    html += '</div>';
  } else if (q.type === 'multiple') {
    html += '<p style="color:#888;font-size:13px;margin-bottom:5px;">Выберите все подходящие варианты:</p>';
    html += '<div class="theory-options multiple">';
    const selectedArr = theoryState.selectedAnswers || [];
    q.options.forEach((opt, i) => {
      const checked = selectedArr.includes(i) ? ' selected' : '';
      html += '<div class="theory-option' + checked + '" data-index="' + i + '" onclick="toggleTheoryOption(' + i + ')">';
      html += '<span class="theory-checkbox">' + (selectedArr.includes(i) ? '✓' : '') + '</span>';
      html += '<span>' + opt + '</span>';
      html += '</div>';
    });
    html += '</div>';
  } else if (q.type === 'fill') {
    html += '<div class="theory-fill-container">';
    html += '<input type="text" id="theory-fill-input" class="theory-fill-input" placeholder="Введите ответ..." autocomplete="off">';
    html += '</div>';
  }

  // Кнопки
  html += '<div class="theory-actions">';
  html += '<button id="theory-check-btn" class="glass-button start-btn" onclick="checkTheoryAnswer()">ПРОВЕРИТЬ</button>';
  html += '<button class="glass-button" onclick="skipTheoryQuestion()" style="background:transparent;border-color:#555;color:#888;margin-left:8px;">ПРОПУСТИТЬ →</button>';
  html += '</div>';

  // Объяснение (если уже ответили)
  if (theoryState.answered) {
    const isCorrect = theoryState.lastCorrect;
    const seconds = theoryState.answerSeconds || 0;
    html += renderTheoryExplanation(q, isCorrect, seconds);
  }

  html += '</div>'; // close theory-quiz-container
  if (guideData) {
    html += '<div class="theory-guide-panel">';
    html += '<div class="theory-guide-header">';
    html += '<span class="theory-guide-title">' + theoryGuideState.topic + '</span>';
    html += '<button class="glass-button" onclick="toggleTheoryGuide(\'' + theoryGuideState.topic.replace(/'/g, "\\'") + '\')" style="background:transparent;border-color:#555;color:#aaa;padding:4px 10px;font-size:11px;">✕</button>';
    html += '</div>';
    html += '<div class="theory-guide-content">';
    html += renderTheoryGuideText(guideData.content);
    html += '</div>';
    html += '</div>';
    html += '</div>'; // close theory-split-layout
  }
  container.innerHTML = html;

  // Запускаем таймер
  if (!theoryState.answered) {
    startTheoryTimer();
  }

  // Фокус на fill input
  if (q.type === 'fill') {
    setTimeout(() => {
      const inp = document.getElementById('theory-fill-input');
      if (inp) inp.focus();
    }, 100);
  }
}

// --- Объяснение ---
function renderTheoryExplanation(q, isCorrect, seconds) {
  const cdHours = theoryState.lastNewHours || 48;

  let html = '<div class="theory-explanation ' + (isCorrect ? 'correct' : 'incorrect') + '">';
  html += '<div class="theory-result-label">' + (isCorrect ? '✅ ПРАВИЛЬНО!' : '❌ НЕПРАВИЛЬНО') + '</div>';
  html += '<div style="color:#888;font-size:13px;margin-bottom:8px;">⏱ ' + seconds + ' сек</div>';
  html += '<div class="theory-explain-text">' + q.explanation + '</div>';
  if (!isCorrect && q.type === 'single') {
    const correctAnswer = q.options[q.correct];
    html += '<div class="theory-correct-answer">Правильный ответ: <b>' + correctAnswer + '</b></div>';
  }
  html += '<div class="theory-cooldown-info">';
  html += 'Кулдаун: <b>' + formatCooldownHours(cdHours) + '</b>';
  if (isCorrect) html += ' (' + getTimerEffectsLabel(seconds) + ')';
  else html += ' (неверный ответ)';
  html += '</div>';
  html += '<button class="glass-button" onclick="loadNextTheoryQuestion()" style="margin-top:15px;background:var(--primary-green);border-color:var(--primary-green);color:#fff;">СЛЕДУЮЩИЙ ВОПРОС →</button>';
  html += '</div>';

  return html;
}

// --- Таймер ---
function startTheoryTimer() {
  if (theoryState.timerInterval) clearInterval(theoryState.timerInterval);
  theoryState.timerInterval = setInterval(updateTheoryTimer, 100);
}

function updateTheoryTimer() {
  if (theoryState.answered) {
    clearInterval(theoryState.timerInterval);
    theoryState.timerInterval = null;
    return;
  }

  const seconds = (Date.now() - theoryState.startTime) / 1000;
  const clamped = Math.min(seconds, 60);
  const pct = (clamped / 60) * 100;
  const color = getTimerColor(clamped);
  const label = getTimerLabel(clamped);

  const bar = document.getElementById('theory-timer-bar');
  const text = document.getElementById('theory-timer-text');
  const effect = document.getElementById('theory-timer-effect');

  if (bar) {
    bar.style.width = pct + '%';
    bar.style.background = color;
  }
  if (text) {
    text.textContent = formatTime(seconds);
    text.style.color = color;
  }
  if (effect) {
    effect.textContent = label;
    effect.style.color = color;
  }
}

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
}

// --- Выбор ответов ---
window.selectTheoryOption = function(index) {
  theoryState.selectedAnswer = index;
  document.querySelectorAll('.theory-option').forEach(el => {
    el.classList.remove('selected');
    if (parseInt(el.dataset.index) === index) el.classList.add('selected');
  });
};

window.toggleTheoryOption = function(index) {
  if (!theoryState.selectedAnswers) theoryState.selectedAnswers = [];
  const idx = theoryState.selectedAnswers.indexOf(index);
  if (idx === -1) {
    theoryState.selectedAnswers.push(index);
  } else {
    theoryState.selectedAnswers.splice(idx, 1);
  }
  document.querySelectorAll('.theory-option').forEach(el => {
    const i = parseInt(el.dataset.index);
    if (theoryState.selectedAnswers.includes(i)) {
      el.classList.add('selected');
      el.querySelector('.theory-checkbox').textContent = '✓';
    } else {
      el.classList.remove('selected');
      el.querySelector('.theory-checkbox').textContent = '';
    }
  });
};

// --- Получить текущие часы кулдауна для вопроса ---
function getQuestionCooldownHours(qId) {
  const cooldowns = getTheoryCooldowns();
  const level = theoryState.level;
  if (cooldowns[level] && cooldowns[level][qId]) {
    return cooldowns[level][qId].currentHours;
  }
  return 24; // начальный кулдаун 1 день
}

// --- Рассчитать новый кулдаун ---
function calculateNewCooldown(currentHours, seconds, isCorrect) {
  if (!isCorrect) return 1; // 1 час при ошибке
  const mult = getTimerCooldownMultiplier(seconds);
  return Math.max(1, currentHours * mult);
}

// --- Проверка ответа ---
window.checkTheoryAnswer = function() {
  if (theoryState.answered) return;

  const q = theoryState.currentQuestion;
  if (!q) return;

  const seconds = (Date.now() - theoryState.startTime) / 1000;
  let isCorrect = false;

  if (q.type === 'single') {
    const selected = theoryState.selectedAnswer;
    if (selected === undefined) {
      alert('Выберите вариант ответа!');
      return;
    }
    isCorrect = selected === q.correct;
  } else if (q.type === 'multiple') {
    const selected = theoryState.selectedAnswers || [];
    if (selected.length === 0) {
      alert('Выберите хотя бы один вариант!');
      return;
    }
    const correct = q.correct;
    isCorrect = selected.length === correct.length && selected.every(s => correct.includes(s));
  } else if (q.type === 'fill') {
    const inp = document.getElementById('theory-fill-input');
    if (!inp || !inp.value.trim()) {
      alert('Введите ответ!');
      return;
    }
    const answer = inp.value.trim().toLowerCase();
    isCorrect = q.correct.some(c => c.toLowerCase() === answer);
  }

  theoryState.answered = true;
  theoryState.lastCorrect = isCorrect;
  theoryState.answerSeconds = seconds;

  if (theoryState.timerInterval) {
    clearInterval(theoryState.timerInterval);
    theoryState.timerInterval = null;
  }

  // Сохраняем кулдаун
  const currentHours = getQuestionCooldownHours(q.id);
  const cooldowns = getTheoryCooldowns();
  const hasExistingCooldown = cooldowns[theoryState.level] && cooldowns[theoryState.level][q.id];
  let newHours;
  if (isCorrect && !hasExistingCooldown) {
    newHours = 24; // первый правильный ответ — всегда 1 день, без множителя
  } else if (isCorrect) {
    newHours = calculateNewCooldown(currentHours, seconds, true);
  } else {
    // Неправильный ответ: не сбрасываем прогрессию кулдауна, просто ставим 1ч
    newHours = 1;
  }
  theoryState.lastCooldownHours = currentHours;
  theoryState.lastNewHours = newHours;
  const nextAvailable = Date.now() + newHours * 60 * 60 * 1000;

  if (!cooldowns[theoryState.level]) cooldowns[theoryState.level] = {};
  cooldowns[theoryState.level][q.id] = {
    nextAvailable: nextAvailable,
    currentHours: isCorrect ? newHours : currentHours
  };
  saveTheoryCooldowns(cooldowns);

  // Обновляем статистику
  if (isCorrect) {
    const totalQ = theoryData[theoryState.level].length;

    // Считаем количество уникальных отвеченных вопросов
    const answeredCount = Object.keys(cooldowns[theoryState.level]).length;
    saveTheoryProgress(theoryState.level, answeredCount, totalQ);

    // Начисляем XP (по таймеру, как score 0-4 в SRS)
    const levelMult = { 'A1': 1.0, 'A2': 1.5, 'B1': 2.0 };
    const mult = levelMult[theoryState.level] || 1.0;
    let score;
    if (seconds <= 10) score = 4;
    else if (seconds <= 20) score = 3;
    else if (seconds <= 30) score = 2;
    else score = 1;
    const earned = score > 1 ? ({ 4: 0.3, 3: 0.2, 2: 0.1 }[score] * mult) : 0;
    const pending = Number(localStorage.getItem('engwords_xp_pending') || '0');
    localStorage.setItem('engwords_xp_pending', (pending + earned).toString());
    if (typeof updateXPDisplay === 'function') updateXPDisplay();
  }

  playAnswerSound(isCorrect);
  renderTheoryQuestion(q);
};

// --- Пропустить ---
window.skipTheoryQuestion = function() {
  if (theoryState.answered) return;
  if (theoryState.timerInterval) {
    clearInterval(theoryState.timerInterval);
    theoryState.timerInterval = null;
  }
  loadNextTheoryQuestion();
};

// --- Toggle theory guide panel ---
window.toggleTheoryGuide = function(topic) {
  if (theoryGuideState.open && theoryGuideState.topic === topic) {
    theoryGuideState.open = false;
    theoryGuideState.topic = null;
    if (theoryState.currentQuestion) renderTheoryQuestion(theoryState.currentQuestion);
    return;
  }

  const wasClosed = !theoryGuideState.open;
  theoryGuideState.open = true;
  theoryGuideState.topic = topic;

  if (!theoryState.answered && theoryState.currentQuestion && wasClosed) {
    const q = theoryState.currentQuestion;
    const seconds = (Date.now() - theoryState.startTime) / 1000;
    theoryState.answered = true;
    theoryState.lastCorrect = false;
    theoryState.answerSeconds = seconds;

    if (theoryState.timerInterval) {
      clearInterval(theoryState.timerInterval);
      theoryState.timerInterval = null;
    }

    const currentHours = getQuestionCooldownHours(q.id);
    theoryState.lastCooldownHours = currentHours;
    theoryState.lastNewHours = 1;
    const nextAvailable = Date.now() + 60 * 60 * 1000;
    const cooldowns = getTheoryCooldowns();
    if (!cooldowns[theoryState.level]) cooldowns[theoryState.level] = {};
    cooldowns[theoryState.level][q.id] = { nextAvailable, currentHours: 1 };
    saveTheoryCooldowns(cooldowns);
    playAnswerSound(false);
  }

  if (theoryState.currentQuestion) renderTheoryQuestion(theoryState.currentQuestion);
};

// --- Render guide text (markdown-like to HTML) ---
function renderTheoryGuideText(text) {
  let html = '';
  const lines = text.split('\n');
  let inCodeBlock = false, codeLines = [], inTable = false, tableHeaders = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    if (line.trim() === '```') {
      if (inCodeBlock) {
        html += '<pre class="theory-guide-code">' + escapeHtml(codeLines.join('\n')) + '</pre>';
        codeLines = [];
      }
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) { codeLines.push(line); continue; }

    if (line.startsWith('|') && line.endsWith('|')) {
      const cells = line.split('|').filter(c => c.trim() !== '').map(c => c.trim());
      if (cells.every(c => /^:?-+:?$/.test(c))) continue;
      if (!inTable) {
        inTable = true; tableHeaders = cells;
        html += '<table class="theory-guide-table"><thead><tr>';
        tableHeaders.forEach(h => html += '<th>' + parseInline(h) + '</th>');
        html += '</tr></thead><tbody>';
      } else {
        html += '<tr>';
        cells.forEach(c => html += '<td>' + parseInline(c) + '</td>');
        html += '</tr>';
      }
      continue;
    }
    if (inTable && !line.startsWith('|')) { html += '</tbody></table>'; inTable = false; }

    if (line.startsWith('### ')) { html += '<h3 class="theory-guide-h3">' + parseInline(line.slice(4)) + '</h3>'; continue; }
    if (line.startsWith('## ')) { html += '<h2 class="theory-guide-h2">' + parseInline(line.slice(3)) + '</h2>'; continue; }
    if (line.startsWith('- ')) { html += '<li class="theory-guide-li">' + parseInline(line.slice(2)) + '</li>'; continue; }
    if (line.trim() === '') { continue; }

    html += '<p class="theory-guide-p">' + parseInline(line.trim()) + '</p>';
  }

  if (inCodeBlock) html += '<pre class="theory-guide-code">' + escapeHtml(codeLines.join('\n')) + '</pre>';
  if (inTable) html += '</tbody></table>';
  return html;
}

function parseInline(text) {
  text = text.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  return text;
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// --- Выйти на выбор уровня ---
window.exitTheory = function() {
  if (theoryState.timerInterval) {
    clearInterval(theoryState.timerInterval);
    theoryState.timerInterval = null;
  }
  theoryGuideState.open = false;
  theoryGuideState.topic = null;
  renderTheoryLevels();
};
