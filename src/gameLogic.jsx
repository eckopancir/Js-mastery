import React from "react";
import prettier from "prettier/standalone";
import * as parserBabel from "prettier/plugins/babel";
import * as estree from "prettier/plugins/estree";
import { POINT_VALUES } from "./aiTask.jsx";
import { playSound } from "./utils/sounds.js";
import { Trash2, Copy, Zap } from "lucide-react";

export const getLevelReq = (lvl) => {
  if (lvl === 1) return { points: 20, days: 1 };
  if (lvl === 2) return { points: 30, days: 2 };
  if (lvl === 3 || lvl === 4) return { points: 40, days: 4 };
  return { points: 50, days: 8 };
};

export const getCardLevelReq = (lvl) => {
  if (lvl === 1) return { points: 20, days: 1 };
  if (lvl === 2) return { points: 30, days: 2 };
  if (lvl === 3) return { points: 40, days: 4 };
  if (lvl === 4) return { points: 50, days: 8 };
  if (lvl === 5) return { points: 50, days: 16 };
  return { points: 50, days: 32 };
};

export const isCardLocked = (cardName, stats) => {
  const cs = stats.cardStats[cardName];
  return cs && cs.hideUntil && cs.hideUntil > Date.now();
};

export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const resetCardTaskStats = (prevStats, cardName, tasks) => {
  const cardTaskIds = tasks.filter((t) => t.card === cardName).map((t) => t.id);
  const newTaskStats = { ...prevStats.taskStats };
  cardTaskIds.forEach((id) => {
    if (newTaskStats[id]) {
      newTaskStats[id] = { ...newTaskStats[id], passedCount: 0 };
    }
  });
  return newTaskStats;
};

export const spendXp = (stats, setStats, setNotifs) => {
  if (!stats.xp || stats.xp <= 0) {
    alert("У вас нет XP для траты.");
    return;
  }

  const amountToSpend = prompt(
    `Ваш баланс: ${stats.xp} / 10000 XP.\nСколько XP вы хотите потратить?`,
    stats.xp,
  );

  if (amountToSpend !== null) {
    const numericAmount = parseInt(amountToSpend, 10);
    if (
      !isNaN(numericAmount) &&
      numericAmount > 0 &&
      numericAmount <= stats.xp
    ) {
      playSound("click");

      setStats((prev) => ({
        ...prev,
        xp: prev.xp - numericAmount,
      }));

      setNotifs((prev) => [
        ...prev,
        {
          id: "spend-" + Date.now(),
          title: "XP SPENT",
          desc: `Used ${numericAmount} XP from your balance.`,
          icon: <Trash2 size={16} color="#ffcc00" />,
          popupId: Date.now(),
        },
      ]);
    } else {
      alert("Некорректная сумма или недостаточно XP!");
    }
  }
};

export const copyBriefing = (currentTask, code, cssCode, setNotifs) => {
  let text = `AI SOLVER PROMPT:\n\nTASK: ${currentTask.title}\nTOPIC: ${currentTask.topic}\nDIFFICULTY: ${currentTask.difficulty}\n\nDESCRIPTION: ${currentTask.description}\n\n`;

  if (currentTask.options) {
    text += `OPTIONS:\n${currentTask.options
      .map((opt, i) => `${i + 1}. ${opt}`)
      .join("\n")}\n\n`;
  }

  if (currentTask.mode === "code") {
    text += `INITIAL CODE:\n${code}\n\n`;
  } else if (currentTask.mode === "ui-layout") {
    text += `INITIAL HTML:\n${currentTask.initialHtml}\nINITIAL CSS:\n${cssCode}\n\n`;
  }

  text += `QUESTION: Объясните, как решить эту задачу (на русском языке), предоставив логику и оптимальное решение, разбери примеры и какие вопросы могут быть на эту тему на собеседовании.`;

  navigator.clipboard.writeText(text);
  setNotifs((prev) => [
    ...prev,
    {
      id: "copy-brief",
      title: "DATA SECTOR COPIED",
      desc: "Mission briefing and AI prompt uploaded to clipboard.",
      icon: <Copy size={16} />,
      popupId: Date.now(),
    },
  ]);
  playSound("success");
};

export const formatCode = (code, setCode, setStats, checkAchievements, tasks, setNotifs, playSound, stats) => {
  return (async () => {
    try {
      const formatted = await prettier.format(code, {
        parser: "babel",
        plugins: [parserBabel, estree],
        semi: true,
        singleQuote: true,
      });
      if (typeof formatted === "string") {
        setCode(formatted);
        playSound("click");
        setStats((prev) => ({
          ...prev,
          formatCodeCount: (prev.formatCodeCount || 0) + 1,
        }));
        setTimeout(() => checkAchievements(setStats, tasks, setNotifs, playSound), 100);
      }
    } catch (err) {
      console.error("Format error:", err);
    }
  })();
};

export const handleLvlUp = ({
  currentTask,
  stats,
  showTour,
  tourStep,
  ONBOARDING_STEPS,
  handleTourNext,
  setStats,
  setNotifs,
  setSelectedCard,
  setExpandedCards,
  setFlyers,
  checkAchievements,
  tasks,
  playSound: playSoundFn,
}) => {
  const cardName = currentTask.card;
  if (!cardName) return;

  const cs = stats.cardStats[cardName] || { level: 1, hideUntil: 0 };
  const req = getCardLevelReq(cs.level);
  const currentCardAiPts = stats.cardAiPoints?.[cardName] || 0;

  if (!showTour && currentCardAiPts < req.points) {
    setNotifs((prev) => [
      ...prev,
      {
        id: "ai-pts-needed",
        title: "INSUFFICIENT AI POINTS",
        desc: `Need ${req.points} AI Points. Current: ${currentCardAiPts}/${req.points}`,
        icon: <Zap size={16} />,
        popupId: Date.now(),
      },
    ]);
    return;
  }

  playSoundFn("levelUp");
  const points = req.points || 10;
  const today = new Date().toISOString().split("T")[0];
  const newLvl = cs.level >= 8 ? 8 : cs.level + 1;

  const flyerId = Date.now();
  setFlyers((prev) => [...prev, { id: flyerId, xp: points }]);

  setStats((prev) => {
    const oldXp = prev.xp || 0;
    const newXp = oldXp + points;

    const daily = prev.dailyLog[today] || {
      xp: 0,
      solved: 0,
      failed: 0,
      breakdown: { Easy: 0, Medium: 0, Hard: 0 },
    };
    const currentBreakdown = daily.breakdown || {
      Easy: 0,
      Medium: 0,
      Hard: 0,
    };

    if (showTour && ONBOARDING_STEPS[tourStep]?.requireAction === "lvlup") {
      handleTourNext();
    }

    const resetTaskStats = resetCardTaskStats(prev, cardName, tasks);
    const cooldownMs = req.days * 24 * 60 * 60 * 1000;

    return {
      ...prev,
      xp: newXp,
      cardAiPoints: {
        ...prev.cardAiPoints,
        [cardName]: 0,
      },
      taskStats: resetTaskStats,
      cardStats: {
        ...prev.cardStats,
        [cardName]: {
          level: newLvl,
          hideUntil: Date.now() + cooldownMs,
        },
      },
      dailyLog: {
        ...prev.dailyLog,
        [today]: {
          ...daily,
          xp: daily.xp + points,
          solved: daily.solved + 1,
          breakdown: {
            ...currentBreakdown,
            [currentTask.difficulty]:
              (currentBreakdown[currentTask.difficulty] || 0) + 1,
          },
        },
      },
    };
  });

  setTimeout(() => {
    if (!showTour) {
      setSelectedCard(null);
      setExpandedCards({});
    }
    checkAchievements(setStats, tasks, setNotifs, playSound);
  }, 800);
};

export const handleLvlDown = ({
  currentTask,
  stats,
  setStats,
  tasks,
  playSound: playSoundFn,
}) => {
  const cardName = currentTask.card;
  if (!cardName) return;
  playSoundFn("levelDown");
  const cs = stats.cardStats[cardName] || { level: 1, hideUntil: 0 };
  const newLevel = Math.max(1, cs.level - 1);
  setStats((prev) => {
    const resetTaskStats = resetCardTaskStats(prev, cardName, tasks);
    return {
      ...prev,
      taskStats: resetTaskStats,
      cardStats: {
        ...prev.cardStats,
        [cardName]: { level: newLevel, hideUntil: 0 },
      },
    };
  });
};

export const handleClearCard = ({
  currentTask,
  stats,
  setStats,
  tasks,
  playSound: playSoundFn,
}) => {
  const cardName = currentTask.card;
  if (!cardName) return;
  playSoundFn("delete");
  const COOLDOWN_MS = 3 * 60 * 60 * 1000;
  setStats((prev) => {
    const resetTaskStats = resetCardTaskStats(prev, cardName, tasks);
    return {
      ...prev,
      taskStats: resetTaskStats,
      cardStats: {
        ...prev.cardStats,
        [cardName]: {
          ...(prev.cardStats[cardName] || { level: 1 }),
          hideUntil: Date.now() + COOLDOWN_MS,
        },
      },
    };
  });
};

export const validateCode = ({
  displayTask,
  ansInput,
  cssCode,
  code,
  selectedAnswers,
  setResults,
  setIsRunning,
  setAiActiveTask,
  finishValidation,
}) => {
  playSound("run");
  setIsRunning(true);
  let allPassed = false;
  let testResults = [];
  const taskToValidate = displayTask;

  if (taskToValidate.mode === "output-predictor") {
    const cleanInput = ansInput.trim().replace(/\s/g, "");
    const cleanExpected = (
      taskToValidate.expectedOutput ||
      taskToValidate.correctAnswer ||
      ""
    ).replace(/\s/g, "");
    allPassed = cleanInput === cleanExpected;
    testResults = [{ passed: allPassed, actual: ansInput }];
    finishValidation(allPassed, testResults);
  } else if (taskToValidate.mode === "ui-layout") {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument;
    doc.body.innerHTML = taskToValidate.initialHtml;
    const style = doc.createElement("style");
    style.textContent = cssCode;
    doc.head.appendChild(style);

    testResults = taskToValidate.validationSelectors.map((test) => {
      const el = doc.querySelector(test.selector);
      if (!el) return { passed: false, error: "Element missing" };
      const val = window.getComputedStyle(el).getPropertyValue(test.property);
      const passed = test.expected.startsWith("contains:")
        ? val.includes(test.expected.replace("contains:", ""))
        : val === test.expected;
      return { passed, actual: val, expected: test.expected };
    });

    allPassed = testResults.every((r) => r.passed);
    document.body.removeChild(iframe);
    finishValidation(allPassed, testResults);
  } else if (
    taskToValidate.mode === "single-choice" ||
    taskToValidate.mode === "multi-choice" ||
    taskToValidate.mode === "bug-hunter"
  ) {
    const userAns = [...selectedAnswers].sort();
    const correctAns = Array.isArray(taskToValidate.correctAnswer)
      ? [...taskToValidate.correctAnswer].sort()
      : [String(taskToValidate.correctAnswer)];
    allPassed =
      userAns.length === correctAns.length &&
      userAns.every((v, i) => String(v) === String(correctAns[i]));
    testResults = [{ passed: allPassed, actual: selectedAnswers.join(", ") }];
    finishValidation(allPassed, testResults);
  } else if (displayTask.stack === "Go") {
    const normalize = (s) => (s || "").replace(/\s+/g, "").replace(/\/\/.*/g, "");
    const userCode = normalize(code);
    const solCode = normalize(displayTask.solution || "");
    const totalLen = solCode.length;
    const minMatch = Math.max(10, Math.floor(totalLen * 0.8));
    let matches = 0;
    for (let i = 0; i <= solCode.length - minMatch; i++) {
      const sub = solCode.slice(i, i + minMatch);
      if (userCode.includes(sub)) { matches++; break; }
    }
    allPassed = matches > 0;
    testResults = [{ passed: allPassed, actual: "Go code submitted" }];
    finishValidation(allPassed, testResults);
  } else {
    const worker = new Worker(new URL("./runner.worker.js", import.meta.url), {
      type: "module",
    });

    const timeoutId = setTimeout(() => {
      worker.terminate();
      setResults({
        globalError: "TACTICAL TIMEOUT: Mission execution exceeded 5s limit.",
      });
      setIsRunning(false);
    }, 5000);

    worker.postMessage({
      code,
      tests: taskToValidate.tests,
      testTemplate: taskToValidate.testTemplate,
    });
    worker.onmessage = (e) => {
      clearTimeout(timeoutId);
      const payload = e.data;
      if (payload.type === "RESULTS") {
        finishValidation(
          payload.allPassed,
          payload.testResults,
          payload.runtime,
          payload.memory,
          payload.logs,
        );
      } else if (payload.type === "ERROR") {
        setResults({ globalError: payload.message });
        setIsRunning(false);
      }
      worker.terminate();
    };
  }
};

export const handleQuickRun = ({ code, setResults }) => {
  playSound("run");
  const worker = new Worker(new URL("./runner.worker.js", import.meta.url), {
    type: "module",
  });
  const timeoutId = setTimeout(() => {
    worker.terminate();
    setResults({
      globalError: "Timeout: execution exceeded 5 seconds",
      logs: [],
      allPassed: false,
      testResults: [],
    });
  }, 5000);
  worker.postMessage({
    mode: "QUICK_RUN",
    code,
    tests: [],
    testTemplate: "",
  });
  worker.onmessage = (e) => {
    clearTimeout(timeoutId);
    const payload = e.data;
    if (payload.type === "QUICK_RESULTS") {
      setResults({
        globalError: payload.message,
        logs: payload.logs,
        allPassed: false,
        testResults: [],
      });
    } else if (payload.type === "ERROR") {
      setResults({ globalError: `Runtime Error: ${payload.message}` });
    }
    worker.terminate();
  };
};

export const openLayoutPreview = ({ currentTask, cssCode }) => {
  playSound("click");
  const win = window.open("", "_blank");
  win.document.write(`
            <html>
                <head><style>${cssCode}</style></head>
                <body style="background:#0a0c10; color:white; display:flex; align-items:center; justify-content:center; height:100vh;">
                    ${currentTask.initialHtml}
                </body>
            </html>
        `);
};

export const finishValidation = ({
  allPassed,
  testResults,
  runtime,
  memory,
  logs,
  displayTask,
  currentTask,
  stats,
  setResults,
  setIsRunning,
  taskStartTime,
  setAiActiveTask,
  setStats,
  checkAchievements,
  tasks,
  setNotifs,
  playSound,
}) => {
  setResults({ allPassed, testResults, runtime, memory, logs });
  setIsRunning(false);
  const totalSeconds = Math.floor((Date.now() - taskStartTime) / 1000);

  if (allPassed) {
    if (displayTask.isAiGenerated) {
      setTimeout(() => setAiActiveTask(null), 1800);
    }

    setStats((prev) => {
      const taskId = displayTask.id;
      const originalId = displayTask.originalId || currentTask.id;
      const cardName = displayTask.card;
      const prevTask = prev.taskStats[taskId] || {};
      const today = new Date().toISOString().split("T")[0];

      const isAi = !!displayTask.isAiGenerated;

      const basePoints = POINT_VALUES[displayTask.mode] || 1;
      const diffMult =
        { Easy: 1, Medium: 2, Hard: 3 }[displayTask.difficulty] || 1;
      const aiXpMult = isAi ? 2 : 1;

      const isFirstPass = (prevTask.passedCount || 0) === 0;

      let earnedXp = 0;
      if (isFirstPass) {
        earnedXp = basePoints * diffMult * aiXpMult;
      }

      let earnedAiPoints = 0;
      if (isAi && isFirstPass) {
        earnedAiPoints = POINT_VALUES[displayTask.mode] || 1;
      }

      const addTicketsToInventory = (inventory, ticketsToAdd) => {
        let inv = inventory ? [...inventory] : [];
        ticketsToAdd.forEach(({ id, count }) => {
          const existingIdx = inv.findIndex(item => item.id === id);
          if (existingIdx >= 0) {
            inv = inv.map((item, idx) =>
              idx === existingIdx ? { ...item, count: item.count + count } : item
            );
          } else {
            const name = id === "ticket1" ? "Viktorina Ticket" : "Typing Ticket";
            const image = id + ".png";
            inv.push({ id, count, name, image });
          }
        });
        return inv;
      };

      let ticketsToAdd = [];

      // Теория: ID 10001–10006 — 100% три случайных тикета
      const isTheory = displayTask.id >= 10001 && displayTask.id <= 10006;
      if (isTheory) {
        const ticketTypes = ["ticket1", "ticket2"];
        for (let i = 0; i < 3; i++) {
          const randId = ticketTypes[Math.floor(Math.random() * ticketTypes.length)];
          ticketsToAdd.push({ id: randId, count: 1 });
        }
      } else if (isFirstPass) {
        // Обычные задачи: шансы зависят от сложности
        const diff = displayTask.difficulty || "Easy";
        const chances = {
          Easy:   { ticket1: 0.05, ticket2: 0.01 },
          Medium: { ticket1: 0.15, ticket2: 0.03 },
          Hard:   { ticket1: 0.30, ticket2: 0.05 },
        };
        const c = chances[diff] || chances.Easy;
        if (Math.random() < c.ticket1) ticketsToAdd.push({ id: "ticket1", count: 1 });
        if (Math.random() < c.ticket2) ticketsToAdd.push({ id: "ticket2", count: 1 });
      }

      const newInventory = ticketsToAdd.length > 0
        ? addTicketsToInventory(prev.inventory || [], ticketsToAdd)
        : prev.inventory;

      const currentHistory = prev.aiHistory?.[originalId] || {
        date: today,
        count: 0,
      };
      // AI history only tracks AI task generations, not regular task completions
      const newCount = currentHistory.count || 0;
      
      const daily = prev.dailyLog[today] || {
        xp: 0,
        solved: 0,
        failed: 0,
        breakdown: { Easy: 0, Medium: 0, Hard: 0 },
      };
      const diffKey = displayTask.difficulty || "Easy";
      const newBreakdown = {
        ...(daily.breakdown || { Easy: 0, Medium: 0, Hard: 0 }),
        [diffKey]: (daily.breakdown?.[diffKey] || 0) + (isFirstPass ? 1 : 0),
      };

      return {
        ...prev,
        xp: Math.min(100000, (prev.xp || 0) + earnedXp),
        aiPoints: (prev.aiPoints || 0) + earnedAiPoints,
        cardAiPoints: {
          ...prev.cardAiPoints,
          [cardName]: (prev.cardAiPoints?.[cardName] || 0) + earnedAiPoints,
        },
        aiHistory: {
          ...prev.aiHistory,
          [originalId]: { date: today, count: newCount },
        },
        inventory: newInventory,
        taskStats: {
          ...prev.taskStats,
          [taskId]: {
            ...prevTask,
            passedCount: (prevTask.passedCount || 0) + 1,
            difficulty: displayTask.difficulty,
            mode: displayTask.mode,
            isAiGenerated: isAi,
            bestTime: Math.min(prevTask.bestTime || Infinity, totalSeconds),
            lastPassedDate: today,
          },
        },
        dailyLog: {
          ...prev.dailyLog,
          [today]: {
            ...daily,
            solved: (daily.solved || 0) + (isFirstPass ? 1 : 0),
            xp: (daily.xp || 0) + (isFirstPass ? earnedXp : 0),
            breakdown: newBreakdown,
          },
        },
      };
    });
    
    setTimeout(() => {
      checkAchievements(setStats, tasks, setNotifs, playSound);
    }, 100);
  } else {
    setStats((prev) => ({
      ...prev,
      taskStats: {
        ...prev.taskStats,
        [displayTask.id]: {
          ...prev.taskStats[displayTask.id],
          failedCount: (prev.taskStats[displayTask.id]?.failedCount || 0) + 1,
        },
      },
    }));
  }
};
