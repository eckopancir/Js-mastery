import React, { useState, useMemo } from "react";
import {
  Trophy,
  Zap,
  Star,
  Target,
  Crown,
  Flame,
  Shield,
  Award,
  Sparkles,
  Book,
  Code,
  Terminal,
  Clock,
  Activity,
  Heart,
  Rocket,
  Ghost,
  Skull,
  Swords,
  Gem,
  Anchor,
  Battery,
  Biohazard,
  Box,
  Layers,
  ZapOff,
  Coffee,
  Brain,
  Medal,
  TrendingUp,
  Bot,
  Eye,
  Calendar,
  List,
  BarChart2,
  FileJson,
  ExternalLink,
  Search,
  ChevronRight,
  Lock,
  Keyboard,
} from "lucide-react";

export const achievements = [];

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

// Получаем все ID задач, которые были пройдены хотя бы раз
const getPassedIds = (s) =>
  Object.keys(s.taskStats || {}).filter(
    (id) => s.taskStats[id]?.passedCount > 0,
  );

// Функция подсчета задач по сложности
const countByDifficulty = (s, allTasks, targetDiff) => {
  const passedIds = getPassedIds(s);
  const targetLower = targetDiff.toLowerCase();
  const result = passedIds.filter((id) => {
    const staticTask = allTasks.find((t) => t.id === id);
    if (staticTask && staticTask.difficulty) {
      return staticTask.difficulty.toLowerCase() === targetLower;
    }
    const savedDiff = s.taskStats[id]?.difficulty;
    if (savedDiff) return savedDiff.toLowerCase() === targetLower;
    return false;
  }).length;
  return result;
};

// Проверка выполнения ачивки по сложности
const checkDifficulty = (s, allTasks, targetDiff, targetCount) => {
  return countByDifficulty(s, allTasks, targetDiff) >= targetCount;
};

// --- 1. ВЕТКА СЛОЖНОСТИ ---
const difficulties = [
  { key: "Easy", label: "Новичок", icon: <Coffee />, step: 25 },
  { key: "Medium", label: "Профи", icon: <Shield />, step: 15 },
  { key: "Hard", label: "Гуру", icon: <Skull />, step: 10 },
];

difficulties.forEach((diff) => {
  for (let i = 1; i <= 20; i++) {
    const target = i * diff.step;
    achievements.push({
      id: `diff_${diff.key.toLowerCase()}_${target}`,
      title: `${diff.label} Ранг ${i}`,
      desc: `Решить ${target} задач сложности ${diff.key}`,
      reward: Math.min(i * 50, 100),
      icon: diff.icon,
      check: (s, allTasks) => checkDifficulty(s, allTasks, diff.key, target),
    });
  }
});

// --- 2. ВЕТКА ИИ-ЗАДАЧ ---
for (let i = 1; i <= 20; i++) {
  const target = i * 50;
  achievements.push({
    id: `ai_only_${target}`,
    title: `ИИ-Подмастерье ${i}`,
    desc: `Завершить ${target} задач от ИИ`,
    reward: 100,
    icon: <Bot size={18} color="#00f2ff" />,
    check: (s) => {
      return (
        Object.keys(s.taskStats || {}).filter(
          (id) => s.taskStats[id]?.isAiGenerated === true,
        ).length >= target
      );
    },
  });
}

// --- 3. ВЕТКА РЕЖИМОВ ---
const modes = [
  { key: "code", label: "Архитектор", icon: <Code /> },
  { key: "bug-hunter", label: "Охотник", icon: <Biohazard /> },
  { key: "output-predictor", label: "Оракул", icon: <Eye /> },
];

modes.forEach((m) => {
  [10, 50, 100].forEach((target, idx) => {
    achievements.push({
      id: `mode_${m.key}_${target}`,
      title: `${m.label} ур. ${idx + 1}`,
      desc: `Решить ${target} задач в режиме ${m.key}`,
      reward: Math.min(target * 5, 100),
      icon: m.icon,
      check: (s) =>
        Object.keys(s.taskStats || {}).filter(
          (id) =>
            s.taskStats[id]?.mode === m.key && s.taskStats[id]?.passedCount > 0,
        ).length >= target,
    });
  });
});

// --- 4. ВЕТКА ПОСТОЯНСТВА ---
for (let i = 1; i <= 52; i++) {
  const target = i;
  achievements.push({
    id: `streak_weeks_${i}`,
    title: `Недельная работа ${i}`,
    desc: `Активность ${i * 7} разных дней`,
    reward: 100,
    icon: <Calendar />,
    check: (s) => Object.keys(s.dailyLog || {}).length >= i * 7,
  });
}

// --- 5. ВЕТКА XP ---
for (let i = 1; i <= 10; i++) {
  const target = i * 1000;
  achievements.push({
    id: `xp_bank_${target}`,
    title: `Энергоячейка ${i * 10}%`,
    desc: `Накопить ${target.toLocaleString()} XP`,
    reward: 100,
    icon: <Battery />,
    check: (s) => (s.xp || 0) >= target,
  });
}

// --- 6. ВЕТКА TYPING CHALLENGE --- (перенесено в расширенную ветку 8)

// WPM рекорды (перенесено в расширенную ветку 8)

// Точность (перенесено в расширенную ветку 8)

// Максимальный combo (перенесено в расширенную ветку 8)

// --- 7. ВЕТКА ВИКТОРИНА ---
// Комбо (Масштабный ряд)
[5, 10, 20, 50, 100, 200, 500].forEach(combo => {
  achievements.push({
    id: `vik_combo_${combo}`,
    title: `Викторина: Комбо ${combo}`,
    desc: `Достичь серии ${combo} правильных ответов подряд`,
    reward: 100,
    icon: <Flame size={18} />,
    check: (s) => (s.viktorinaMaxCombo || 0) >= combo
  });
});

// Сложности (игра на определенной сложности N раз)
const vikDiffs = [
  { key: 'easy', label: 'Новичок' },
  { key: 'normal', label: 'Боец' },
  { key: 'hard', label: 'Герой' },
  { key: 'extreme', label: 'Легенда' }
];
vikDiffs.forEach(d => {
  [10, 25, 50].forEach(target => {
    achievements.push({
      id: `vik_diff_${d.key}_${target}`,
      title: `Викторина: ${d.label} ${target}`,
      desc: `Сыграть ${target} игр на сложности ${d.key}`,
      reward: 100,
      icon: <Target size={18} />,
      check: (s) => (s.viktorinaGamesByDiff?.[d.key] || 0) >= target
    });
  });
});

// Потраченные билеты
[50, 100, 500, 1000].forEach(tickets => {
  achievements.push({
    id: `vik_tickets_${tickets}`,
    title: `Викторина: Меценат ${tickets}`,
    desc: `Потратить ${tickets} билетов`,
    reward: 100,
    icon: <Gem size={18} />,
    check: (s) => (s.ticketsSpent || 0) >= tickets
  });
});

// --- 8. ВЕТКА TYPING (РАСШИРЕННАЯ) ---
// Расширенный WPM (шаг 10)
[20, 30, 40, 50, 60, 70, 80, 90, 100, 120].forEach(wpm => {
  achievements.push({
    id: `typing_wpm_${wpm}`,
    title: `Печать: ${wpm} WPM`,
    desc: `Достичь скорости ${wpm} слов в минуту`,
    reward: 100,
    icon: <Rocket size={18} />,
    check: (s) => (s.typingMaxWpm || 0) >= wpm
  });
});

// Расширенная Accuracy (каждый процент от 80 до 100)
[80, 85, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99].forEach(acc => {
  achievements.push({
    id: `typing_acc_${acc}`,
    title: `Точность: ${acc}%`,
    desc: `Достичь точности ${acc}%`,
    reward: 100,
    icon: <Target size={18} />,
    check: (s) => (s.typingMaxAccuracy || 0) >= acc
  });
});

// Расширенный Combo
[5, 10, 15, 20, 25, 30, 40, 50, 75, 100].forEach(combo => {
  achievements.push({
    id: `typing_combo_${combo}`,
    title: `Комбо: ${combo} символов`,
    desc: `Набрать комбо ${combo} правильных символов`,
    reward: 100,
    icon: <Flame size={18} />,
    check: (s) => (s.typingMaxCombo || 0) >= combo
  });
});

// Расширенный Completed (густая сетка)
[5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100].forEach(count => {
  achievements.push({
    id: `typing_complete_${count}`,
    title: `Марафонец ${count}`,
    desc: `Завершить ${count} задач Typing`,
    reward: 100,
    icon: <Keyboard size={18} />,
    check: (s) => (s.typingCompleted || 0) >= count
  });
});

// Идеальные задачи (100% точность)
[1, 5, 10, 20].forEach(count => {
  achievements.push({
    id: `typing_perfect_${count}`,
    title: `Идеальный ${count}`,
    desc: `Завершить ${count} задач с 100% точностью`,
    reward: 100,
    icon: <Medal size={18} />,
    check: (s) => (s.typingPerfectCount || 0) >= count
  });
});

// --- 9. ВЕТКА ENGLISH WORDS ---
// Количество слов (масштабирование)
[10, 25, 50, 100, 200, 300, 500, 750, 1000].forEach(count => {
  achievements.push({
    id: `eng_words_${count}`,
    title: `Словарный запас: ${count}`,
    desc: `Выучить ${count} слов`,
    reward: 100,
    icon: <Book size={18} />,
    check: (s) => {
      try {
        const learned = JSON.parse(localStorage.getItem('oxford_learned') || '[]');
        return learned.length >= count;
      } catch(e) { return false; }
    }
  });
});

// Уровни (A1-C1) по отдельности
['A1', 'A2', 'B1', 'B2', 'C1'].forEach(level => {
  [10, 25, 50, 100].forEach(count => {
    achievements.push({
      id: `eng_level_${level}_${count}`,
      title: `${level}: ${count} слов`,
      desc: `Выучить ${count} слов уровня ${level}`,
      reward: 100,
      icon: <Star size={18} />,
      check: (s) => {
        try {
          const learned = JSON.parse(localStorage.getItem('oxford_learned') || '[]');
          return learned.filter(w => w.level.includes(level)).length >= count;
        } catch(e) { return false; }
      }
    });
  });
});

// Серия дней (Streak)
[3, 7, 14, 30, 60, 90, 180, 365].forEach(days => {
  achievements.push({
    id: `eng_streak_${days}`,
    title: `Стрик: ${days} дней`,
    desc: `Заниматься английским ${days} дней подряд`,
    reward: 100,
    icon: <Flame size={18} />,
    check: (s) => {
      try {
        const streak = JSON.parse(localStorage.getItem('user_streak') || '{"count": 0}');
        return (streak.count || 0) >= days;
      } catch(e) { return false; }
    }
  });
});

// Заработанный XP
[100, 500, 1000, 2000, 5000].forEach(xp => {
  achievements.push({
    id: `eng_xp_${xp}`,
    title: `Лингвист: ${xp} XP`,
    desc: `Заработать ${xp} XP в английских словах`,
    reward: 100,
    icon: <Zap size={18} />,
    check: (s) => {
      const pending = Number(localStorage.getItem('engwords_xp_pending') || 0);
      let mainXP = 0;
      try {
        const stats = JSON.parse(localStorage.getItem('js_mastery_stats_v3') || '{}');
        mainXP = Number(stats.xp) || 0;
      } catch(e) {}
      return (mainXP + pending) >= xp;
    }
  });
});

// Повторения (Reviews)
[100, 500, 1000, 2000].forEach(count => {
  achievements.push({
    id: `eng_reviews_${count}`,
    title: `Повторение: ${count}`,
    desc: `Сделать ${count} повторений слов`,
    reward: 100,
    icon: <Clock size={18} />,
    check: (s) => {
      try {
        const learned = JSON.parse(localStorage.getItem('oxford_learned') || '[]');
        return learned.reduce((sum, w) => {
          const engViews = (w.progress && w.progress.eng && w.progress.eng.views) || 0;
          const rusViews = (w.progress && w.progress.rus && w.progress.rus.views) || 0;
          return sum + engViews + rusViews;
        }, 0) >= count;
      } catch(e) { return false; }
    }
  });
});

//проверяет массив всех достижений на выполнение условий
export const checkAchievements = (setStats, tasks, setNotifs, playSound) => {
  // Используем функциональное обновление, чтобы всегда иметь актуальный state
  setStats((prev) => {
    const newUnlocks = [];

    achievements.forEach((ach) => {
      if (prev.unlockedAchievements.includes(ach.id)) return;
      
      let isComplete = false;
      
      if (ach.id.startsWith("diff_")) {
        const diffKey = ach.id.replace("diff_", "").replace(/_\d+$/, "");
        const targetMatch = ach.id.match(/_(\d+)$/);
        const target = targetMatch ? parseInt(targetMatch[1], 10) : 0;
        const count = countByDifficulty(prev, tasks, diffKey);
        isComplete = count >= target;
      } else if (ach.id.startsWith("ai_only_")) {
        const targetMatch = ach.id.match(/_(\d+)$/);
        const target = targetMatch ? parseInt(targetMatch[1], 10) : 0;
        const count = Object.keys(prev.taskStats || {}).filter(
          (id) => prev.taskStats[id]?.isAiGenerated && prev.taskStats[id]?.passedCount > 0,
        ).length;
        isComplete = count >= target;
      } else if (ach.id.startsWith("mode_")) {
        const modeKey = ach.id.replace("mode_", "").replace(/_\d+$/, "");
        const targetMatch = ach.id.match(/_(\d+)$/);
        const target = targetMatch ? parseInt(targetMatch[1], 10) : 0;
        const count = Object.keys(prev.taskStats || {}).filter(
          (id) => prev.taskStats[id]?.mode === modeKey && prev.taskStats[id]?.passedCount > 0,
        ).length;
        isComplete = count >= target;
      } else if (ach.id.startsWith("streak_weeks_")) {
        const weekNum = parseInt(ach.id.replace("streak_weeks_", ""), 10);
        const target = weekNum * 7;
        isComplete = Object.keys(prev.dailyLog || {}).length >= target;
      } else if (ach.id.startsWith("xp_bank_")) {
        const targetMatch = ach.id.match(/_(\d+)$/);
        const target = targetMatch ? parseInt(targetMatch[1], 10) : 0;
        isComplete = (prev.xp || 0) >= target;
      } else if (ach.id.startsWith("typing_complete_")) {
        const targetMatch = ach.id.match(/_(\d+)$/);
        const target = targetMatch ? parseInt(targetMatch[1], 10) : 0;
        isComplete = (prev.typingCompleted || 0) >= target;
      } else if (ach.id.startsWith("typing_wpm_")) {
        const targetMatch = ach.id.match(/_(\d+)$/);
        const target = targetMatch ? parseInt(targetMatch[1], 10) : 0;
        isComplete = (prev.typingMaxWpm || 0) >= target;
      } else if (ach.id.startsWith("typing_combo_")) {
        const targetMatch = ach.id.match(/_(\d+)$/);
        const target = targetMatch ? parseInt(targetMatch[1], 10) : 0;
        isComplete = (prev.typingMaxCombo || 0) >= target;
      } else if (ach.id.startsWith("vik_combo_")) {
        const target = parseInt(ach.id.replace("vik_combo_", ""), 10);
        isComplete = (prev.viktorinaMaxCombo || 0) >= target;
      } else if (ach.id.startsWith("vik_diff_")) {
        const diffKey = ach.id.replace("vik_diff_", "").replace(/_\d+$/, "");
        const targetMatch = ach.id.match(/_(\d+)$/);
        const target = targetMatch ? parseInt(targetMatch[1], 10) : 0;
        isComplete = (prev.viktorinaGamesByDiff?.[diffKey] || 0) >= target;
      } else if (ach.id.startsWith("vik_tickets_")) {
        const target = parseInt(ach.id.replace("vik_tickets_", ""), 10);
        isComplete = (prev.ticketsSpent || 0) >= target;
      } else if (ach.id.startsWith("typing_acc_")) {
        const target = parseInt(ach.id.replace("typing_acc_", ""), 10);
        isComplete = (prev.typingMaxAccuracy || 0) >= target;
      } else if (ach.id.startsWith("typing_perfect_")) {
        const target = parseInt(ach.id.replace("typing_perfect_", ""), 10);
        isComplete = (prev.typingPerfectCount || 0) >= target;
      } else if (ach.id.startsWith("eng_")) {
        if (ach.check) {
          isComplete = ach.check(prev, tasks);
        }
      }

      if (isComplete) {
        newUnlocks.push(ach);
      }
    });

    if (newUnlocks.length === 0) return prev;

    setNotifs((n) => [
      ...n,
      ...newUnlocks.map((a) => ({
        ...a,
        popupId: `${a.id}-${Date.now()}-${Math.random()}`,
      })),
    ]);
    playSound("levelUp");

    return {
      ...prev,
      unlockedAchievements: [
        ...prev.unlockedAchievements,
        ...newUnlocks.map((a) => a.id),
      ],
    };
  });
};

// обрабатывает «забор» награды за выполненную ачивку: начисляет XP игроку и запускает визуальный эффект вылетающих цифр
export const claimAchievement = (
  ach,
  stats,
  setStats,
  setFlyers,
  playSound,
) => {
  if (stats.claimedAchievementIds?.includes(ach.id)) return;
  playSound("success");
  setFlyers((prev) => [
    ...prev,
    { id: `flyer-${Date.now()}-${Math.random()}`, xp: ach.reward },
  ]);
  setStats((prev) => ({
    ...prev,
    xp: prev.xp + ach.reward,
    claimedAchievementIds: [...(prev.claimedAchievementIds || []), ach.id],
  }));
};

//генерирует массив данных для календаря активности (как на GitHub)
export const calculateHeatmap = (dailyLog, year) => {
  const days = [];
  const targetYear = year || new Date().getFullYear();

  // Start from January 1st of the target year
  const jan1 = new Date(targetYear, 0, 1);
  const startDayOfWeek = jan1.getDay();
  const startDate = new Date(targetYear, 0, 1 - startDayOfWeek);

  // Show the full 53 weeks of the calendar year
  const TOTAL_DAYS = 371;

  for (let i = 0; i < TOTAL_DAYS; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const data = dailyLog[dateStr] || { solved: 0, xp: 0 };

    let intensity = 0;
    const count = data.solved || 0;

    if (count >= 100) intensity = 4;
    else if (count >= 50) intensity = 3;
    else if (count >= 25) intensity = 2;
    else if (count >= 1) intensity = 1;

    days.push({
      date: dateStr,
      intensity,
      count: count,
      xp: data.xp,
      dayOfWeek: d.getDay(),
    });
  }
  return days;
};
//показывает всплывающее уведомление о разблокированном достижении
export const AchievementPopup = ({ achievement, onComplete }) => {
  return (
    <div className="achievement-popup" onAnimationEnd={onComplete}>
      <div className="pop-icon">
        <Sparkles size={24} />
      </div>
      <div className="pop-info">
        <strong>Achievement Unlocked!</strong>
        <span>
          {achievement.title} (+{achievement.reward} XP)
        </span>
      </div>
    </div>
  );
};
const JournalWorkspace = ({
  // Состояния
  journalTab,
  setJournalTab,
  searchTerm,
  setSearchTerm,
  sortConfig,
  expandedJournalCards,
  setExpandedJournalCards,
  heatmapHoverDate,
  setHeatmapHoverDate,

  // Данные
  sortedTasks,
  stats,
  setStats,
  achievements,
  tasks,

  // Функции
  playSound,
  exportProgress,
  importProgress,
  requestSort,
  claimAchievement,
  AchievementPopup,
  onGoToTask,
}) => {
  const allTasks = sortedTasks || [];
  const [heatmapYear, setHeatmapYear] = useState(new Date().getFullYear());
  const [flippingAch, setFlippingAch] = useState(null);

  // Bookmarks
  const bookmarks = stats.bookmarks || [];
  const toggleBookmark = (taskId) => {
    if (!setStats) return;
    playSound && playSound("click");
    setStats(prev => ({
      ...prev,
      bookmarks: prev.bookmarks?.includes(taskId)
        ? prev.bookmarks.filter(id => id !== taskId)
        : [...(prev.bookmarks || []), taskId],
    }));
  };

  // Dark Review: задачи с failedCount > 2
  const darkReviewTasks = (tasks || []).filter(t => {
    const ts = stats.taskStats?.[t.id];
    return ts && (ts.failedCount || 0) > 2 && (ts.passedCount || 0) === 0;
  }).sort((a, b) => (stats.taskStats?.[b.id]?.failedCount || 0) - (stats.taskStats?.[a.id]?.failedCount || 0));

  const bookmarkedTasks = (tasks || []).filter(t => bookmarks.includes(t.id));

  const heatmapData = useMemo(
    () => calculateHeatmap(stats.dailyLog || {}, heatmapYear),
    [stats.dailyLog, heatmapYear]
  );

  return (
    <div className="journal-workspace">
      <div className="journal-header">
        <div>
          <h1>Training Intelligence</h1>
          <p>Comprehensive task database and historical logs</p>
        </div>
        <div className="journal-switcher">
          <button
            className={journalTab === "tasks" ? "on" : ""}
            onClick={() => { playSound("click"); setJournalTab("tasks"); }}
          >
            <List size={18} /> Database
          </button>
          <button
            className={journalTab === "stats" ? "on" : ""}
            onClick={() => { playSound("click"); setJournalTab("stats"); }}
          >
            <BarChart2 size={18} /> Analysis
          </button>
          <button
            className={journalTab === "darkReview" ? "on" : ""}
            onClick={() => { playSound("click"); setJournalTab("darkReview"); }}
            title="Задачи с >2 провалами"
          >
            <Skull size={18} /> Dark Review
            {darkReviewTasks.length > 0 && (
              <span className="journal-tab-badge">{darkReviewTasks.length}</span>
            )}
          </button>
          <button
            className={journalTab === "bookmarks" ? "on" : ""}
            onClick={() => { playSound("click"); setJournalTab("bookmarks"); }}
            title="Избранные задачи"
          >
            <Star size={18} /> Bookmarks
            {bookmarkedTasks.length > 0 && (
              <span className="journal-tab-badge bookmark">{bookmarkedTasks.length}</span>
            )}
          </button>
        </div>
      </div>
      <div
        className="backup-controls"
        style={{
          padding: "15px",
          borderTop: "1px solid #2d4a7c",
          marginTop: "auto",
          background: "transparent",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            color: "#8cb4d8",
            marginBottom: "10px",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          Data Management
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          {/* Кнопка Экспорта */}
          <button
            onClick={exportProgress}
            className="card-ctrl-btn"
            style={{
              flex: 1,
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              justifyContent: "center",
            }}
            title="Save progress to file"
          >
            <FileJson size={14} /> Export
          </button>

          {/* Кнопка Импорта (хитрая, через скрытый input) */}
          <label
            className="card-ctrl-btn"
            style={{
              flex: 1,
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              justifyContent: "center",
              cursor: "pointer",
            }}
            title="Restore progress from file"
          >
            <ExternalLink size={14} /> Import
            <input
              type="file"
              accept=".json"
              onChange={importProgress}
              style={{ display: "none" }}
            />
          </label>
        </div>
      </div>
      {journalTab === "tasks" ? (
        <div className="journal-db">
          <div className="db-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Global search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="db-scroll-body">
            <table className="f-table">
              <thead>
                <tr>
                  <th onClick={() => requestSort("title")}>
                    Assignment{" "}
                    {sortConfig.key === "title" &&
                      (sortConfig.direction === "asc" ? "▲" : "▼")}
                  </th>
                  <th onClick={() => requestSort("topic")}>Module</th>
                  <th>Record</th>
                  <th onClick={() => requestSort("level")}>Level</th>
                  <th onClick={() => requestSort("success")}>Score</th>
                  <th onClick={() => requestSort("status")}>
                    Status{" "}
                    {sortConfig.key === "status" &&
                      (sortConfig.direction === "asc" ? "▲" : "▼")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  // Group sortedTasks by card
                  const cardMap = {};
                  sortedTasks
                    .filter((t) => t.card)
                    .forEach((t) => {
                      if (!cardMap[t.card])
                        cardMap[t.card] = { module: t.module, tasks: [] };
                      cardMap[t.card].tasks.push(t);
                    });
                  const now = Date.now();

                  return Object.entries(cardMap).map(([cardName, data]) => {
                    const cs = stats.cardStats[cardName] || {
                      level: 1,
                      hideUntil: 0,
                    };
                    const hidden = cs.hideUntil > now;
                    const totalPassed = data.tasks.reduce(
                      (s, t) => s + (stats.taskStats[t.id]?.passedCount || 0),
                      0,
                    );
                    const totalFailed = data.tasks.reduce(
                      (s, t) => s + (stats.taskStats[t.id]?.failedCount || 0),
                      0,
                    );
                    const allBestTimes = data.tasks
                      .map((t) => stats.taskStats[t.id]?.bestTime)
                      .filter(Boolean);
                    const totalTime = allBestTimes.reduce((s, t) => s + t, 0);
                    const isJournalExpanded = expandedJournalCards[cardName];

                    return (
                      <React.Fragment key={cardName}>
                        <tr
                          className={`card-row clickable-card-row ${isJournalExpanded ? "card-row-expanded" : ""}`}
                          onClick={() => {
                            playSound("click");
                            setExpandedJournalCards((prev) => ({
                              ...prev,
                              [cardName]: !prev[cardName],
                            }));
                          }}
                        >
                          <td>
                            <div className="t-name">
                              <strong>📂 {cardName}</strong>
                              <span className="card-marker">CARD</span>
                              <ChevronRight
                                size={14}
                                className={`journal-card-chevron ${isJournalExpanded ? "rotated" : ""}`}
                              />
                            </div>
                          </td>
                          <td>
                            <span className="m-tag">{data.module}</span>
                          </td>
                          <td>
                            <div className="record-txt-db">
                              {totalTime > 0
                                ? `${Math.floor(totalTime / 60)}:${String(totalTime % 60).padStart(2, "0")}`
                                : "—"}
                            </div>
                          </td>
                          <td>
                            <div className="l-pill">Lvl {cs.level}</div>
                          </td>
                          <td>
                            <div className="score-wrap">
                              <span className="g">{totalPassed}</span>/
                              <span className="r">{totalFailed}</span>
                            </div>
                          </td>
                          <td>
                            {hidden ? (
                              <span className="s-tag hidden">
                                Locked ({Math.ceil((cs.hideUntil - now) / 1000)}
                                s)
                              </span>
                            ) : (
                              <span className="s-tag ready">Active</span>
                            )}
                          </td>
                        </tr>
                        {isJournalExpanded &&
                          data.tasks.map((t) => {
                            const p = stats.taskStats[t.id] || {};
                            return (
                              <tr key={t.id} className="task-sub-row">
                                <td>
                                  <div className="t-name sub">
                                    <span className="sub-indent">↳</span>
                                    {t.title}
                                    <span
                                      className={t.difficulty.toLowerCase()}
                                    >
                                      {t.difficulty}
                                    </span>
                                  </div>
                                </td>
                                <td></td>
                                <td>
                                  <div className="record-txt-db">
                                    {p.bestTime
                                      ? `${Math.floor(p.bestTime / 60)}:${String(p.bestTime % 60).padStart(2, "0")}`
                                      : "—"}
                                  </div>
                                </td>
                                <td></td>
                                <td>
                                  <div className="score-wrap">
                                    <span className="g">
                                      {p.passedCount || 0}
                                    </span>
                                    /
                                    <span className="r">
                                      {p.failedCount || 0}
                                    </span>
                                  </div>
                                </td>
                                <td></td>
                              </tr>
                            );
                          })}
                      </React.Fragment>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>
      ) : journalTab === "darkReview" ? (
        <div className="journal-dark-review">
          <div className="dark-review-header">
            <Skull size={20} />
            <h3>Dark Review</h3>
            <p>Задачи с более чем 2 провалами — твои слабые места</p>
          </div>
          {darkReviewTasks.length === 0 ? (
            <div className="dark-review-empty">
              <Shield size={48} style={{ color: "#4ade80", opacity: 0.5 }} />
              <p>Нет задач с &gt;2 провалами. Отличная работа!</p>
            </div>
          ) : (
            <div className="dark-review-list">
              {darkReviewTasks.map(t => {
                const ts = stats.taskStats?.[t.id] || {};
                return (
                  <div
                    key={t.id}
                    className="dark-review-item"
                    onClick={() => onGoToTask && onGoToTask(t.id)}
                    title="Нажмите для перехода к задаче"
                  >
                    <div className="dr-left">
                      <span className={`dr-diff ${t.difficulty?.toLowerCase()}`}>{t.difficulty}</span>
                      <span className="dr-title">{t.title}</span>
                      <span className="dr-topic">{t.card || t.topic}</span>
                    </div>
                    <div className="dr-right">
                      <span className="dr-fails">❌ {ts.failedCount} провалов</span>
                      {ts.bestTime && (
                        <span className="dr-time">
                          ⏱ {Math.floor(ts.bestTime / 60)}:{String(ts.bestTime % 60).padStart(2, "0")}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : journalTab === "bookmarks" ? (
        <div className="journal-bookmarks">
          <div className="bookmarks-header">
            <Star size={20} />
            <h3>Bookmarks</h3>
            <p>Избранные задачи для повторения</p>
          </div>
          {bookmarkedTasks.length === 0 ? (
            <div className="dark-review-empty">
              <Star size={48} style={{ color: "#ffd700", opacity: 0.3 }} />
              <p>Нет избранных задач. Нажмите ⭐ на задаче в редакторе.</p>
            </div>
          ) : (
            <div className="dark-review-list">
              {bookmarkedTasks.map(t => {
                const ts = stats.taskStats?.[t.id] || {};
                return (
                  <div
                    key={t.id}
                    className="dark-review-item bookmark-item"
                    onClick={() => onGoToTask && onGoToTask(t.id)}
                  >
                    <div className="dr-left">
                      <span className={`dr-diff ${t.difficulty?.toLowerCase()}`}>{t.difficulty}</span>
                      <span className="dr-title">{t.title}</span>
                      <span className="dr-topic">{t.card || t.topic}</span>
                    </div>
                    <div className="dr-right">
                      {ts.passedCount > 0 && <span className="dr-solved">✅ Решено</span>}
                      <button
                        className="dr-unbookmark"
                        onClick={e => { e.stopPropagation(); toggleBookmark(t.id); }}
                        title="Убрать из избранного"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="journal-stats">
          <div className="github-heatmap-container">
            <div className="gh-heatmap-main">
              {(() => {
                const hoverData = stats.dailyLog[heatmapHoverDate] || {
                  xp: 0,
                  solved: 0,
                  breakdown: { Easy: 0, Medium: 0, Hard: 0 },
                };
                const dObj = new Date(heatmapHoverDate);
                const dateTitle = dObj.toDateString();

                return (
                  <div className="gh-header custom-stats-header">
                    <div className="gh-header-left">
                      <div className="gh-date-title">{dateTitle}</div>
                      <div className="gh-total-solved">
                        Solved: <strong>{hoverData.solved} total</strong>
                      </div>
                    </div>
                    <div className="gh-header-center">
                      <div className="gh-xp-gain">
                        +{hoverData.xp} <span>XP Gained</span>
                      </div>
                    </div>
                    <div className="gh-header-right">
                      <div className="gh-breakdown">
                        <div className="br-item easy">
                          Easy <strong>{hoverData.breakdown?.Easy || 0}</strong>
                        </div>
                        <div className="br-item medium">
                          Medium{" "}
                          <strong>{hoverData.breakdown?.Medium || 0}</strong>
                        </div>
                        <div className="br-item hard">
                          Hard <strong>{hoverData.breakdown?.Hard || 0}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
              {/* GitHub-style календарь активности */}
              <div className="gh-grid-wrapper">
                <div className="gh-grid-content">
                  <div className="heatmap-grid github-style fluid-grid">
                    {heatmapData.map((day, i) => (
                      <div
                        key={i}
                        className={`heat-cell level-${day.intensity} ${heatmapHoverDate === day.date ? "hover-active" : ""}`}
                        onMouseEnter={() => setHeatmapHoverDate(day.date)}
                      ></div>
                    ))}
                  </div>
                  <div className="gh-footer">
                    <div className="gh-legend">
                      <span>Less</span>
                      <div className="heat-cell level-0"></div>
                      <div className="heat-cell level-1"></div>
                      <div className="heat-cell level-2"></div>
                      <div className="heat-cell level-3"></div>
                      <div className="heat-cell level-4"></div>
                      <span>More</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="gh-year-selector">
              {[2026, 2025, 2024, 2023, 2022].map((year) => (
                <button
                  key={year}
                  className={year === heatmapYear ? "active" : ""}
                  onClick={() => {
                    setHeatmapYear(year);
                    setHeatmapHoverDate(`${year}-01-01`);
                    playSound && playSound("click");
                  }}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          <div className="achievement-section">
            {(() => {
              const claimed = stats.claimedAchievementIds?.length || 0;
              const total = achievements.length;
              const progress = total > 0 ? claimed / total : 0;
              const glowIntensity = Math.min(progress * 100, 100);
              const whiteGlow = `rgba(255, 255, 255, ${0.3 + progress * 0.7})`;

              return (
                <h3
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    fontSize: "1.5rem",
                    margin: "40px 0 20px",
                    color: "white",
                    textShadow: `0 0 ${10 + progress * 20}px ${whiteGlow}`,
                    transition: "all 0.3s ease",
                  }}
                >
                  <Award size={18} /> Достижения ({claimed} / {total})
                </h3>
              );
            })()}
            <div className="achievement-grid-scroll">
              {achievements.map((ach) => {
                const isUnlocked = stats.unlockedAchievements.includes(ach.id);
                const isClaimed = stats.claimedAchievementIds?.includes(ach.id);
                const canClaim = isUnlocked && !isClaimed;

                const targetMatch = ach.id.match(/_(\d+)$/);
                const baseTarget = targetMatch ? parseInt(targetMatch[1], 10) : 0;
                
                let target = baseTarget;
                
                let current = 0;
                
                // Вычисляем актуальное количество для каждого типа ачивки
                if (ach.id.startsWith("diff_")) {
                  const diffKey = ach.id.replace("diff_", "").replace(/_\d+$/, "");
                  current = countByDifficulty(stats, allTasks, diffKey);
                } else if (ach.id.startsWith("ai_only_")) {
                  current = Object.keys(stats.taskStats || {}).filter(
                    (id) => stats.taskStats[id]?.isAiGenerated && stats.taskStats[id]?.passedCount > 0,
                  ).length;
                } else if (ach.id.startsWith("mode_")) {
                  const modeKey = ach.id.replace("mode_", "").replace(/_\d+$/, "");
                  current = Object.keys(stats.taskStats || {}).filter(
                    (id) => stats.taskStats[id]?.mode === modeKey && stats.taskStats[id]?.passedCount > 0,
                  ).length;
                } else if (ach.id.startsWith("streak_weeks_")) {
                  const weekNum = parseInt(ach.id.replace("streak_weeks_", ""), 10);
                  target = weekNum * 7;
                  current = Object.keys(stats.dailyLog || {}).length;
                } else if (ach.id.startsWith("xp_bank_")) {
                  current = stats.xp || 0;
                } else if (ach.id.startsWith("typing_complete_")) {
                  current = stats.typingCompleted || 0;
                } else if (ach.id.startsWith("typing_wpm_")) {
                  current = stats.typingMaxWpm || 0;
                } else if (ach.id.startsWith("typing_combo_")) {
                  current = stats.typingMaxCombo || 0;
                }

                const progress =
                  target > 0 ? Math.min((current / target) * 100, 100) : 0;

                const cardStyle = !isClaimed
                  ? {
                      opacity: 0.3 + (progress / 100) * 0.7,
                      filter:
                        progress >= 100
                          ? "none"
                          : `grayscale(${100 - progress}%)`,
                      transition: "all 0.3s ease",
                    }
                  : {};

                return (
                  <div
                    key={ach.id}
                    className={`ach-card ${isClaimed ? "unlocked" : "locked"} ${canClaim ? "unclaimed-shake" : ""} ${flippingAch === ach.id ? "unlocking" : ""}`}
                    style={cardStyle}
                    onClick={() => {
                      if (!canClaim) return;
                      setFlippingAch(ach.id);
                      setTimeout(() => setFlippingAch(null), 600);
                      claimAchievement(ach);
                    }}
                    title={canClaim ? "Click to claim reward!" : ""}
                  >
                    <div
                      className={`ach-icon ${isClaimed ? "sparkle-anim" : ""}`}
                    >
                      {isClaimed ? <Award size={20} /> : <Lock size={20} />}
                    </div>
                    <div className="ach-info">
                      <strong>{ach.title}</strong>
                      <p>{ach.desc}</p>
                      {!isClaimed && (
                        <div className="ach-progress-bar">
                          <div
                            className="ach-progress-fill"
                            style={{ width: `${progress}%` }}
                          />
                          <span className="ach-progress-text">
                            {current} / {target}
                          </span>
                        </div>
                      )}
                      {canClaim && (
                        <span className="ach-reward-pulse">
                          CLICK TO CLAIM +{ach.reward} XP
                        </span>
                      )}
                      {isClaimed && (
                        <span className="ach-reward">
                          + {ach.reward} XP Claimed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <h3 className="section-title">
            <Clock size={18} /> Mission Logs
          </h3>
          <div className="stats-row">
            {Object.entries(stats.dailyLog)
              .sort((a, b) => (b[1]?.xp || 0) - (a[1]?.xp || 0))
              .slice(0, 4)
              .map(([date, d]) => (
                <div key={date} className="day-insight">
                  <div className="dt-row">
                    <Calendar size={18} /> {new Date(date).toDateString()}
                  </div>
                  <div className="dt-body">
                    <div className="gain">
                      +{d.xp} <span>XP</span>
                    </div>
                    <div className="br-grid">
                      <div className="br-dot">
                        <span>Easy</span>
                        <strong>{d.breakdown?.Easy || 0}</strong>
                      </div>
                      <div className="br-dot">
                        <span>Medium</span>
                        <strong>{d.breakdown?.Medium || 0}</strong>
                      </div>
                      <div className="br-dot">
                        <span>Hard</span>
                        <strong>{d.breakdown?.Hard || 0}</strong>
                      </div>
                    </div>
                    <div className="total-ok">Solved: {d.solved} total</div>
                  </div>
                </div>
              ))}
            {Object.keys(stats.dailyLog).length === 0 && (
              <div className="no-intel">
                Intelligence gathering in progress. Solve tasks to see logs.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalWorkspace;
