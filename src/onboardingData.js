export const ONBOARDING_STEPS = [
  // === 1. INTRO ===
  {
    title: "Добро пожаловать!",
    text: "JS Mastery — твоя платформа для изучения JavaScript. Здесь ты будешь решать задачи, генерировать AI задачи, изучать теорию и получать достижения. Погнали!",
    target: ".logo",
  },

  // === 2. DAILY QUESTS ACCESS ===
  {
    title: "Ежедневные квесты",
    text: "Кликни на иконку молнии (lvl-card) слева вверху чтобы открыть Ежедневные квесты. Там: 4 квеста в день, Streak, награды.",
    target: ".lvl-card",
    requireAction: "open-daily-quests",
  },

  // === 3. TASK MODES ===
  {
    title: "Режимы задач",
    text: "Справа в редакторе — задачи. Они бывают 5 типов: Code (пиши код), Output Predictor (угадай вывод), Single Choice (1 ответ), Multi Choice (несколько ответов), Bug Hunter (найди баг).",
    target: ".briefing-card",
  },

  // === 4. CHOICE TASK ===
  {
    title: "Задача с выбором ответа",
    text: "Сейчас откроется специальная задача-турель. Тебе нужно выбрать правильный ответ.",
    target: ".briefing-card",
    triggerTaskId: 10002,
  },

  // === 5. SELECT ANSWER ===
  {
    title: "Выбор ответа",
    text: "Выбери вариант '3 (Easy, Medium, Hard)' — он будет подсвечен зелёным. Это правильный ответ!",
    target: ".choice-grid",
    autoSolve: { type: "choice", val: "3 (Easy, Medium, Hard)" },
  },

  // === 6. RUN ===
  {
    title: "Запуск",
    text: "Нажми RUN чтобы проверить ответ. XP начисляется автоматически при успешном выполнении!",
    target: ".action-btn.run",
    requireAction: "run",
  },

  // === 7. AI TASK GENERATOR ===
  {
    title: "AI Генератор задач",
    text: "Кнопка AI (со sparkle) генерирует уникальные задачи через нейросеть. Лимит: 3 задачи в день. Нажми её!",
    target: ".action-btn.ai-btn",
  },

  // === 8. AI GENERATION ===
  {
    title: "Генерация задачи",
    text: "Подожди несколько секунд пока AI генерирует задачу. Она появится в редакторе!",
    target: ".editor-area",
    requireAction: "ai-generated",
  },

  // === 9. Карточки & Уровни ===
  {
    title: "Карточки и уровни",
    text: "Кликни на стрелочку рядом с карточкой 'Основы' чтобы раскрыть её и увидеть задачи. Там показывается прогресс AI баллов и уровень карточки.",
    target: ".card-header-btn",
    requireAction: "expand-card",
  },

  // === 9b. LVL UP ===
  {
    title: "Прокачка карточки",
    text: "Когда все задачи в карточке решены и набрано достаточно AI баллов — появляется кнопка LVL UP (стрелка вверх). Нажми её чтобы повысить уровень карточки и открыть новые задачи (Medium, Hard).",
    target: ".card-ctrl-btn",
  },

  // === 9c. COOLDOWN ===
  {
    title: "Cooldown",
    text: "После повышения уровня карточки — запускается Cooldown (время ожидания). В это время карточка заморожена и нельзя повышать уровень. Cooldown указан под прогрессом карточки.",
    target: ".card-cooldown",
  },

  // === 9d. Теория ===
  {
    title: "Теория",
    text: "Внутри раскрытой карточки есть кнопка 'Теория'. Нажми на неё чтобы открыть теоретический материал с вопросами. Нужно 70% правильных ответов.",
    target: ".theory-header-section",
    requireAction: "show-theory",
  },

  // === 10. ACHIEVEMENTS ===
  {
    title: "Достижения",
    text: "Кликни на 'journal' (иконка книги) внизу слева чтобы открыть Journal с достижениями. Там: Сложность (Easy/Medium/Hard), AI задачи, Режимы, Streak, XP Bank.",
    target: ".nav-btn-intelligence",
    requireAction: "switch-journal",
  },

  // === 11. HEATMAP ===
  {
    title: "Heatmap (GitHub)",
    text: "Переключись на вкладку 'Stats' (кнопка справа от Tasks) чтобы увидеть Heatmap — календарь активности как на GitHub. Зелёным подсвечиваются дни когда ты решал задачи.",
    target: ".journal-switcher",
    requireAction: "switch-journal-tab",
  },

  // === 12. COMPLETE ===
  {
    title: "Готово!",
    text: "Ты готов к работе! Решай задачи, генерируй AI задачи, изучай теорию и получай достижения. Удачи, Commander!",
    target: ".logo",
  },
];
