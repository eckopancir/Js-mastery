import React, { useState, useEffect } from "react";
import {
  X,
  Flame,
  Star,
  Target,
  Zap,
  Award,
  CheckCircle,
  Lock,
  Crown,
  Gem,
  Sparkles,
  HelpCircle,
} from "lucide-react";

const RARITY = {
  common: {
    chance: 60,
    color: "#8b949e",
    glow: "rgba(139, 148, 158, 0.3)",
    label: "Обычная",
    xpMult: 1,
  },
  rare: {
    chance: 15,
    color: "#58a6ff",
    glow: "rgba(88, 166, 255, 0.3)",
    label: "Редкая",
    xpMult: 1.5,
  },
  epic: {
    chance: 10,
    color: "#a371f7",
    glow: "rgba(163, 113, 247, 0.3)",
    label: "Эпическая",
    xpMult: 2,
  },
  legendary: {
    chance: 5,
    color: "#f0883e",
    glow: "rgba(240, 136, 62, 0.3)",
    label: "Легендарная",
    xpMult: 3,
  },
};

const STREAK_REWARDS = [
  { day: 1, xp: 20, label: "+20 XP" },
  { day: 2, xp: 40, label: "+40 XP" },
  { day: 3, xp: 60, label: "+60 XP" },
  { day: 4, xp: 100, label: "+100 XP" },
  { day: 5, xp: 150, label: "+150 XP" },
  { day: 6, xp: 250, label: "+250 XP" },
  { day: 7, xp: 500, label: "+500 XP" },
];

const QUESTS_POOL = [
  // Easy - больше задач = больше XP
  {
    id: "easy_25",
    type: "task",
    difficulty: "Easy",
    targetMin: 25,
    targetMax: 50,
    baseXp: 50,
  },
  {
    id: "easy_50",
    type: "task",
    difficulty: "Easy",
    targetMin: 50,
    targetMax: 100,
    baseXp: 100,
  },
  {
    id: "easy_100",
    type: "task",
    difficulty: "Easy",
    targetMin: 100,
    targetMax: 150,
    baseXp: 200,
  },
  // Medium
  {
    id: "med_25",
    type: "task",
    difficulty: "Medium",
    targetMin: 25,
    targetMax: 50,
    baseXp: 80,
  },
  {
    id: "med_50",
    type: "task",
    difficulty: "Medium",
    targetMin: 50,
    targetMax: 100,
    baseXp: 150,
  },
  // Hard
  {
    id: "hard_15",
    type: "task",
    difficulty: "Hard",
    targetMin: 15,
    targetMax: 30,
    baseXp: 120,
  },
  {
    id: "hard_30",
    type: "task",
    difficulty: "Hard",
    targetMin: 30,
    targetMax: 60,
    baseXp: 70,
  },
];

const AI_QUESTS_POOL = [
  {
    id: "ai_theory_3",
    type: "ai_theory",
    targetMin: 3,
    targetMax: 8,
    baseXp: 60,
  },
  {
    id: "ai_theory_5",
    type: "ai_theory",
    targetMin: 5,
    targetMax: 10,
    baseXp: 100,
  },
  {
    id: "ai_task_15",
    type: "ai_task",
    targetMin: 15,
    targetMax: 30,
    baseXp: 80,
  },
  {
    id: "ai_task_25",
    type: "ai_task",
    targetMin: 25,
    targetMax: 50,
    baseXp: 150,
  },
];

const VIKTORINA_QUESTS_POOL = [
  {
    id: "vik_combo_10_normal",
    type: "viktorina_combo",
    difficulty: "normal",
    targetMin: 8,
    targetMax: 15,
    baseXp: 40,
  },
  {
    id: "vik_combo_20_easy",
    type: "viktorina_combo",
    difficulty: "easy",
    targetMin: 15,
    targetMax: 25,
    baseXp: 50,
  },
  {
    id: "vik_combo_20_normal",
    type: "viktorina_combo",
    difficulty: "normal",
    targetMin: 15,
    targetMax: 30,
    baseXp: 70,
  },
  {
    id: "vik_combo_30_easy",
    type: "viktorina_combo",
    difficulty: "easy",
    targetMin: 25,
    targetMax: 40,
    baseXp: 80,
  },
  {
    id: "vik_combo_20_hard",
    type: "viktorina_combo",
    difficulty: "hard",
    targetMin: 15,
    targetMax: 30,
    baseXp: 100,
  },
  {
    id: "vik_combo_30_normal",
    type: "viktorina_combo",
    difficulty: "normal",
    targetMin: 25,
    targetMax: 45,
    baseXp: 120,
  },
];

const STORAGE_KEY = "dailyQuests_v1";

const getToday = () => new Date().toISOString().split("T")[0];

const getRandomRarity = () => {
  const rand = Math.random() * 100;
  let sum = 0;
  for (const [key, val] of Object.entries(RARITY)) {
    sum += val.chance;
    if (rand <= sum) return key;
  }
  return "common";
};

const getRandomQuests = (pool, count) => {
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
};

const generateQuest = (baseQuest) => {
  const rarity = getRandomRarity();
  const multiplier = RARITY[rarity].xpMult;
  const target = Math.floor(
    Math.random() * (baseQuest.targetMax - baseQuest.targetMin) +
    baseQuest.targetMin,
  );
  const xp = Math.floor(baseQuest.baseXp * multiplier);

  let label = "";
  if (baseQuest.type === "task") {
    label = ` реши ${target} ${baseQuest.difficulty} задач`;
  } else if (baseQuest.type === "ai_theory") {
    label = ` пройди ${target} теории AI`;
  } else if (baseQuest.type === "ai_task") {
    label = ` реши ${target} AI задач`;
  } else if (baseQuest.type === "viktorina_combo") {
    label = ` набери ${target} комбо в Викторине (${baseQuest.difficulty})`;
  }

  return {
    ...baseQuest,
    id: `${baseQuest.id}_${Date.now()}`,
    target,
    xp,
    rarity,
    label,
    current: 0,
    claimed: false,
    createdDate: getToday(),
  };
};


export default function DailyQuestsModal({
  isOpen,
  onClose,
  stats,
  setStats,
  playSound,
  taskStats,
  theoryResults = {},
}) {
  const [data, setData] = useState(null);
  const today = getToday();

  useEffect(() => {
    if (!isOpen) return;

    const saved = localStorage.getItem(STORAGE_KEY);
    let stored = saved ? JSON.parse(saved) : null;

    if (!stored || stored.date !== today) {
      const lastLogin = stored?.lastLogin || null;
      const prevStreak = stored?.streak || 0;
      let newStreak = 1;

      if (lastLogin) {
        const lastDate = new Date(lastLogin);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
          // Сегодня уже заходил, оставляем старый стрик
          newStreak = prevStreak > 0 ? prevStreak : 1;
        } else if (diffDays === 1) {
          // Вчера заходил, продолжаем серию
          newStreak = Math.min(prevStreak + 1, 7);
        } else {
          // Пропуск дня, начинаем с 1
          newStreak = 1;
        }
      }

      stored = {
        date: today,
        lastLogin: today,
        streak: newStreak,
        streakClaimed:
          stored?.lastLogin === today ? stored.streakClaimed : false,
        quests:
          stored?.date === today
            ? stored.quests
            : getRandomQuests(QUESTS_POOL, 4).map((q) => generateQuest(q)),
        aiQuests:
          stored?.date === today
            ? stored.aiQuests
            : getRandomQuests(AI_QUESTS_POOL, 2).map((q) => generateQuest(q)),
        viktorinaQuests:
          stored?.date === today && stored?.viktorinaQuests?.length > 0
            ? stored.viktorinaQuests
            : getRandomQuests(VIKTORINA_QUESTS_POOL, 2).map((q) => generateQuest(q)),
        completed: stored?.date === today ? stored.completed : [],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    }

    setData(stored);
  }, [isOpen, today]);

  const [flyer, setFlyer] = useState(null);

  // Таймер до полуночи (до сброса квестов)
  const [timeUntilReset, setTimeUntilReset] = useState("");
  useEffect(() => {
    const calcReset = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diffMs = midnight - now;
      const h = Math.floor(diffMs / 3600000);
      const m = Math.floor((diffMs % 3600000) / 60000);
      const s = Math.floor((diffMs % 60000) / 1000);
      setTimeUntilReset(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      );
    };
    calcReset();
    const interval = setInterval(calcReset, 1000);
    return () => clearInterval(interval);
  }, []);

  const resetQuests = () => {
    // Проверяем достаточно ли XP
    const currentXp = stats?.xp || 0;
    if (currentXp < 100) {
      playSound("error");
      return;
    }

    // Списываем 100 XP
    setStats((prev) => ({
      ...prev,
      xp: Math.max(0, (prev.xp || 0) - 100),
    }));

    const newData = {
      date: today,
      lastLogin: today,
      streak: data?.streak || 1,
      streakClaimed: data?.streakClaimed || false,
      quests: getRandomQuests(QUESTS_POOL, 4).map((q) => generateQuest(q)),
      aiQuests: getRandomQuests(AI_QUESTS_POOL, 2).map((q) => generateQuest(q)),
      viktorinaQuests: getRandomQuests(VIKTORINA_QUESTS_POOL, 2).map((q) => generateQuest(q)),
      completed: [],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    setData(newData);
    playSound("success");
  };

  const claimStreak = () => {
    if (!data || data.streakClaimed) return;
    const reward = STREAK_REWARDS.find((r) => r.day === data.streak)?.xp || 5;

    setStats((prev) => ({
      ...prev,
      xp: Math.min(100000, (prev.xp || 0) + reward),
    }));

    // Show flyer
    setFlyer({ xp: reward, type: "streak" });
    setTimeout(() => setFlyer(null), 2000);

    const newData = { ...data, streakClaimed: true };
    setData(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    playSound("success");
  };

  const getTaskProgress = (difficulty) => {
    // Считаем УНИКАЛЬНЫЕ задачи за сегодня (которые были пройдены сегодня)
    const todayKey = getToday();
    let count = 0;
    Object.values(taskStats || {}).forEach((task) => {
      // Если задача хоть раз пройдена сегодня - считаем за 1
      if (task.lastPassedDate === todayKey && task.passedCount > 0) {
        if (difficulty === "any" || task.difficulty === difficulty) {
          count += 1;
        }
      }
    });
    return count;
  };

  const getAiProgress = () => {
    // Считаем УНИКАЛЬНЫЕ AI задачи за сегодня
    const todayKey = getToday();
    let count = 0;
    Object.values(taskStats || {}).forEach((task) => {
      if (
        task.lastPassedDate === todayKey &&
        task.passedCount > 0 &&
        task.isAiGenerated
      ) {
        count += 1;
      }
    });
    return count;
  };

  const getTheoryProgress = () => {
    // Считаем УНИКАЛЬНЫЕ пройденные теории ТОЛЬКО за сегодня
    let count = 0;
    const todayKey = getToday();
    Object.entries(theoryResults || {}).forEach(([card, result]) => {
      if (result.totalPercent >= 70 && result.date === todayKey) {
        count += 1;
      }
    });
    return count;
  };

  const getViktorinaProgress = (questDifficulty, questCreatedDate) => {
    if (!questCreatedDate) return 0;
    const todayKey = getToday();
    const questCreatedTimestamp = new Date(questCreatedDate).getTime();
    const allLogs = stats?.viktorinaDailyLog || {};
    let totalCombo = 0;
    Object.entries(allLogs).forEach(([date, dayData]) => {
      if (date >= questCreatedDate && date <= todayKey) {
        const difficultyData = dayData[questDifficulty];
        if (difficultyData?.achievedAt && difficultyData.achievedAt.timestamp >= questCreatedTimestamp) {
          totalCombo = Math.max(totalCombo, difficultyData.achievedAt.combo);
        }
      }
    });
    return totalCombo;
  };

  const claimQuest = (quest, isAi = false, isViktorina = false) => {
    if (!data || quest.claimed) return;

    const current =
      quest.type === "ai_theory"
        ? getTheoryProgress()
        : isViktorina
          ? getViktorinaProgress(quest.difficulty, quest.createdDate)
          : isAi
            ? getAiProgress()
            : getTaskProgress(quest.difficulty);
    if (current < quest.target) return;

    setStats((prev) => ({
      ...prev,
      xp: Math.min(100000, (prev.xp || 0) + quest.xp),
    }));

    // Show flyer
    setFlyer({ xp: quest.xp, type: "quest" });
    setTimeout(() => setFlyer(null), 2000);

    const key = isViktorina ? "viktorinaQuests" : isAi ? "aiQuests" : "quests";
    const newQuests = [...(data[key] || [])];
    const idx = newQuests.findIndex((q) => q.id === quest.id);
    if (idx >= 0) {
      newQuests[idx] = { ...newQuests[idx], claimed: true };
    }

    const newData = { ...data, [key]: newQuests };
    setData(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    playSound("success");
  };

  if (!isOpen || !data) return null;

  const getRarityStyle = (rarity) => RARITY[rarity] || RARITY.common;

  return (
    <div className="dq-overlay" onClick={onClose}>
      <div className="dq-modal" onClick={(e) => e.stopPropagation()}>
        <button className="dq-close" onClick={onClose}>
          <X size={24} />
        </button>

        <button className="dq-reset-btn" onClick={resetQuests}>
          🔄 Обновить (100 XP)
        </button>

        <div className="dq-header">
          <Flame className="dq-flame" size={32} data-streak={data.streak} />
          <h2>ЕЖЕДНЕВНЫЕ КВЕСТЫ</h2>
          <p className="dq-subtitle">Заходи каждый день - получай награды!</p>
          <div className="dq-reset-timer">
            <span className="dq-reset-label">⏱ До сброса:</span>
            <span className="dq-reset-value"> {timeUntilReset}</span>
          </div>
        </div>

        {/* Flyer animation */}
        {flyer && (
          <div className="dq-flyer">
            <div className="dq-flyer-content">
              <Star size={24} />
              <span>+{flyer.xp} XP</span>
            </div>
          </div>
        )}

        {/* Streak */}
        <div className="dq-section dq-streak-section">
          <h3>
            <Flame size={18} /> STREAK {data.streak}/7
          </h3>
          <div className="dq-streak-days">
            {STREAK_REWARDS.map((s) => (
              <div
                key={s.day}
                className={`dq-streak-day ${s.day <= data.streak ? "active" : ""} ${s.day < data.streak ? "completed" : ""}`}
              >
                <span className="dq-streak-num">{s.day}</span>
                <span className="dq-streak-xp">+{s.xp}</span>
              </div>
            ))}
          </div>
          <button
            className={`dq-claim-btn ${data.streakClaimed ? "claimed" : ""}`}
            onClick={claimStreak}
            disabled={data.streakClaimed}
          >
            {data.streakClaimed ? (
              <>
                <CheckCircle size={18} /> ПОЛУЧЕНО
              </>
            ) : (
              <>
                <Star size={18} /> ПОЛУЧИТЬ +
                {STREAK_REWARDS.find((r) => r.day === data.streak)?.xp} XP
              </>
            )}
          </button>
        </div>

        {/* Quests */}
        <div className="dq-section">
          <h3>
            <Target size={18} /> ЗАДАНИЯ
          </h3>
          <div className="dq-quests-grid">
            {data.quests?.map((quest, idx) => {
              const progress = getTaskProgress(quest.difficulty);
              const percent = Math.min(100, (progress / quest.target) * 100);
              const rarityStyle = getRarityStyle(quest.rarity);
              const completed = progress >= quest.target;

              return (
                <div
                  key={quest.id}
                  className={`dq-quest-card ${completed ? "completed" : ""}`}
                  data-rarity={quest.rarity}
                  style={{
                    borderColor: completed ? "#238636" : rarityStyle.color,
                    boxShadow: completed
                      ? "none"
                      : `0 0 15px ${rarityStyle.glow}`,
                  }}
                  onClick={() => claimQuest(quest, false)}
                >
                  <div
                    className="dq-quest-rarity"
                    style={{ color: rarityStyle.color }}
                  >
                    {quest.rarity === "legendary" && <Crown size={14} />}
                    {quest.rarity === "epic" && <Gem size={14} />}
                    {quest.rarity === "rare" && <Star size={14} />}
                    {quest.rarity === "common" && <Sparkles size={14} />}
                    <span>{RARITY[quest.rarity].label}</span>
                  </div>
                  <div className="dq-quest-label">{quest.label}</div>
                  <div className="dq-quest-progress">
                    <div
                      className="dq-quest-progress-fill"
                      style={{
                        width: `${percent}%`,
                        background: rarityStyle.color,
                      }}
                    />
                  </div>
                  <div className="dq-quest-info">
                    <span>
                      {progress}/{quest.target}
                    </span>
                    <span className="dq-quest-reward">+{quest.xp} XP</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Quests */}
        <div className="dq-section">
          <h3>
            <Zap size={18} /> AI+
          </h3>
          <div className="dq-quests-grid">
            {data.aiQuests?.map((quest) => {
              const progress =
                quest.type === "ai_theory"
                  ? getTheoryProgress()
                  : getAiProgress();
              const percent = Math.min(100, (progress / quest.target) * 100);
              const rarityStyle = getRarityStyle(quest.rarity);
              const completed = progress >= quest.target;

              return (
                <div
                  key={quest.id}
                  className={`dq-quest-card ${completed ? "completed" : ""}`}
                  style={{
                    borderColor: completed ? "#238636" : rarityStyle.color,
                    boxShadow: completed
                      ? "none"
                      : `0 0 15px ${rarityStyle.glow}`,
                  }}
                  onClick={() => claimQuest(quest, true)}
                >
                  <div
                    className="dq-quest-rarity"
                    style={{ color: rarityStyle.color }}
                  >
                    {quest.rarity === "legendary" && <Crown size={14} />}
                    {quest.rarity === "epic" && <Gem size={14} />}
                    {quest.rarity === "rare" && <Star size={14} />}
                    {quest.rarity === "common" && <Sparkles size={14} />}
                    <span>{RARITY[quest.rarity].label}</span>
                  </div>
                  <div className="dq-quest-label">{quest.label}</div>
                  <div className="dq-quest-progress">
                    <div
                      className="dq-quest-progress-fill"
                      style={{
                        width: `${percent}%`,
                        background: rarityStyle.color,
                      }}
                    />
                  </div>
                  <div className="dq-quest-info">
                    <span>
                      {progress}/{quest.target}
                    </span>
                    <span className="dq-quest-reward">+{quest.xp} XP</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Viktorina Quests */}
        <div className="dq-section">
          <h3>
            <HelpCircle size={18} /> ВИКТОРИНА
          </h3>
          <div className="dq-quests-grid">
            {data.viktorinaQuests?.map((quest) => {
              const progress = getViktorinaProgress(quest.difficulty, quest.createdDate);
              const percent = Math.min(100, (progress / quest.target) * 100);
              const rarityStyle = getRarityStyle(quest.rarity);
              const completed = progress >= quest.target;

              return (
                <div
                  key={quest.id}
                  className={`dq-quest-card ${completed ? "completed" : ""}`}
                  style={{
                    borderColor: completed ? "#238636" : rarityStyle.color,
                    boxShadow: completed
                      ? "none"
                      : `0 0 15px ${rarityStyle.glow}`,
                  }}
                  onClick={() => claimQuest(quest, false, true)}
                >
                  <div
                    className="dq-quest-rarity"
                    style={{ color: rarityStyle.color }}
                  >
                    {quest.rarity === "legendary" && <Crown size={14} />}
                    {quest.rarity === "epic" && <Gem size={14} />}
                    {quest.rarity === "rare" && <Star size={14} />}
                    {quest.rarity === "common" && <Sparkles size={14} />}
                    <span>{RARITY[quest.rarity].label}</span>
                  </div>
                  <div className="dq-quest-label">{quest.label}</div>
                  <div className="dq-quest-progress">
                    <div
                      className="dq-quest-progress-fill"
                      style={{
                        width: `${percent}%`,
                        background: rarityStyle.color,
                      }}
                    />
                  </div>
                  <div className="dq-quest-info">
                    <span>
                      {progress}/{quest.target}
                    </span>
                    <span className="dq-quest-reward">+{quest.xp} XP</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
