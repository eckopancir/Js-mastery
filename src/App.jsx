import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Play,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Trophy,
  Code2,
  Layers,
  BookOpen,
  ArrowUpCircle,
  ArrowDownCircle,
  Tag,
  Terminal,
  Clock,
  Eye,
  List,
  BarChart2,
  Calendar,
  Lock,
  Search,
  Filter,
  Sparkles,
  Award,
  Zap,
  Wand2,
  Shield,
  Copy,
  ExternalLink,
  PlayCircle,
  FileJson,
  X,
  Info,
  Trash2,
  Edit3,
  Type,
  Package,
  Palette,
  PanelBottom,
  Globe,
} from "lucide-react";
import { tasks } from "./tasks";
import { teoriaTasks, getTeoriaTaskByCard } from "./tasksTeoria";
import { ONBOARDING_STEPS } from "./onboardingData";
import { playSound } from "./utils/sounds";
import JournalWorkspace, {
  achievements,
  calculateHeatmap,
  checkAchievements,
  claimAchievement,
  AchievementPopup,
} from "./achievements.jsx";
import { generateAiTask, checkTeoriaAnswers, POINT_VALUES } from "./aiTask.jsx";
import Sidebar from "./components/Sidebar";
import EditorWorkspace from "./components/EditorWorkspace";
import PointsFlyer from "./components/PointsFlyer";
import DailyQuestsModal from "./components/DailyQuestsModal";
import Viktorina from "./components/Viktorina";
import TypingChallenge from "./components/TypingChallenge";
import BottomPanel from "./components/BottomPanel";
import "./components/typingChallenge.css";
import "./components/BottomPanel.css";

import {
  getLevelReq,
  getCardLevelReq as gclr,
  isCardLocked as isCardLockedFn,
  resetCardTaskStats as resetCardTaskStatsFn,
  shuffleArray as shuffleArrayFn,
  spendXp,
  copyBriefing,
  formatCode,
  handleLvlUp,
  handleLvlDown,
  handleClearCard,
  validateCode,
  handleQuickRun,
  openLayoutPreview,
  finishValidation,
} from "./gameLogic";

// Animated counter component (Queue 1.3)
function AnimatedCounter({ value, duration = 800, suffix = '' }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(from + (value - from) * eased));
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [value, duration]);
  return <>{display}{suffix}</>;
}

// Confetti component (Queue 3.1)
function Confetti({ x, y }) {
  const colors = ['#4a9eff', '#58a6ff', '#d29922', '#3fb950', '#f85149', '#ffcc00'];
  return (
    <div style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none', zIndex: 9999 }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: Math.random() * 40 - 20 + 'px',
            top: Math.random() * 10 + 'px',
            background: colors[i % colors.length],
            animationDelay: (i * 0.05) + 's',
            animationDuration: (1 + Math.random() * 0.5) + 's',
          }}
        />
      ))}
    </div>
  );
}

const OnboardingTour = ({
  step,
  onNext,
  onSkip,
  onClose,
  tourSkipForever,
  activeTab,
  isResultsOk,
}) => {
  const s = ONBOARDING_STEPS[step];
  if (!s) return null;

  let canGoNext = true;
  let nextLabel = "Next Step";

  if (s.requireAction === "switch-journal" && activeTab !== "journal")
    canGoNext = false;
  if (s.requireAction === "switch-academy" && activeTab !== "editor")
    canGoNext = false;
  if (s.requireAction === "run" && !isResultsOk) canGoNext = false;
  if (s.requireAction === "lvlup") canGoNext = false;

  if (step === ONBOARDING_STEPS.length - 1) nextLabel = "Start My Journey";

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        <button
          className="tour-close-btn"
          onClick={onClose}
          title="Close tutorial"
        >
          <X size={16} />
        </button>
        <div className="onboarding-header">
          <h3>{s.title}</h3>
          <span className="step-counter">
            {step + 1} / {ONBOARDING_STEPS.length}
          </span>
        </div>
        <p>{s.text}</p>
        {s.autoSolve && (
          <div
            className="tour-hint"
            style={{
              color: "var(--blue-color)",
              fontSize: "0.8rem",
              marginTop: "-10px",
              marginBottom: "15px",
            }}
          >
            ⚡ Agent is assisting with neural link data...
          </div>
        )}
        <div className="onboarding-footer">
          <label className="skip-forever">
            <input
              type="checkbox"
              checked={tourSkipForever}
              onChange={(e) => onSkip(e.target.checked)}
            />
            Don't show again
          </label>
          <div className="onboarding-btns">
            <button onClick={() => onSkip(true)} className="skip-btn">
              Finish
            </button>
            {canGoNext && (
              <button onClick={() => onNext()} className="next-btn pulse-anim">
                {nextLabel}
              </button>
            )}
          </div>
        </div>
      </div>
      <div
        className="spotlight-focus"
        id="spotlight"
        style={{ display: "none" }}
      ></div>
    </div>
  );
};

// отвечает за визуальный эффект «вылетающих» цифр опыта (XP)
const XpFlyer = ({ xp, onComplete }) => {
  return (
    <div className="xp-flyer" onAnimationEnd={onComplete}>
      +{xp} XP
    </div>
  );
};

function App() {
    const [stats, setStats] = useState(() => {
        const saved = localStorage.getItem("js_mastery_stats_v3");
        const base = saved
            ? JSON.parse(saved)
            : {
                xp: 0,
                level: 1,
                unclaimedPoints: 0, // Накопленные баллы, которые ждут клика
                claimedPoints: 0,
                spentPoints: 0, // Баллы, которые ты уже потратил на что-то
                taskStats: {},
                cardStats: {},
                dailyLog: {},
                unlockedAchievements: [],
                claimedAchievementIds: [],
                formatCount: 0,
                viktorinaMaxCombo: 0,
                viktorinaGamesByDiff: {},
                ticketsSpent: 0,
                typingPerfectCount: 0,
                dailyQuestStreak: 0,
                formatCodeCount: 0,
                xpSentToExtension: false,
            };

        // Initialize inventory if not present
        if (!base.inventory) {
            base.inventory = [
                { id: "ticket1", count: 20, name: "Viktorina Ticket", image: "ticket1.png" },
                { id: "ticket2", count: 20, name: "Typing Ticket", image: "ticket2.png" },
            ];
        } else {
            const ticket1 = base.inventory.find(i => i.id === "ticket1");
            const ticket2 = base.inventory.find(i => i.id === "ticket2");
            if (!ticket1) base.inventory.push({ id: "ticket1", count: 20, name: "Viktorina Ticket", image: "ticket1.png" });
            if (!ticket2) base.inventory.push({ id: "ticket2", count: 20, name: "Typing Ticket", image: "ticket2.png" });
        }
    if (!base.deletedTaskIds) base.deletedTaskIds = [];
    if (!base.cardStats) base.cardStats = {};
    if (!base.claimedAchievementIds) base.claimedAchievementIds = [];
    if (base.formatCount !== undefined && base.formatCodeCount === undefined) {
      base.formatCodeCount = base.formatCount;
      delete base.formatCount;
    }
    if (base.viktorinaMaxCombo === undefined) base.viktorinaMaxCombo = 0;
    if (base.viktorinaGamesByDiff === undefined) base.viktorinaGamesByDiff = {};
    if (base.ticketsSpent === undefined) base.ticketsSpent = 0;
    if (base.typingPerfectCount === undefined) base.typingPerfectCount = 0;
    if (base.dailyQuestStreak === undefined) base.dailyQuestStreak = 0;
    if (base.formatCodeCount === undefined) base.formatCodeCount = 0;
    if (base.xpSentToExtension === undefined) base.xpSentToExtension = false;
    if (!base.customOrder) {
      base.customOrder = tasks.map((t) => t.id);
    } else {
      const tutIds = [10001, 10002, 10003, 10004, 10005, 10006];
      const missingTut = tutIds.filter((id) => !base.customOrder.includes(id));
      if (missingTut.length > 0)
        base.customOrder = [...missingTut, ...base.customOrder];
    }
    if (!base.unlockedAchievements) base.unlockedAchievements = [];
    if (base.formatCount === undefined) base.formatCount = 0;
    if (!base.taskNotes) base.taskNotes = {};
    if (base.aiPoints === undefined) base.aiPoints = 0;
    if (!base.aiHistory) base.aiHistory = {};
    if (!base.cardAiPoints) base.cardAiPoints = {};
    if (!base.viktorinaDailyLog) base.viktorinaDailyLog = {};
    if (!base.bookmarks) base.bookmarks = [];
    if (!base.weeklyRecapShown) base.weeklyRecapShown = null;
    const defaultInventory = [
      { id: "ticket1", count: 20, name: "Viktorina Ticket", image: "ticket1.png" },
      { id: "ticket2", count: 20, name: "Typing Ticket", image: "ticket2.png" },
    ];
    if (!base.inventory) {
      base.inventory = defaultInventory;
    } else {
      const ticket1 = base.inventory.find(i => i.id === "ticket1");
      const ticket2 = base.inventory.find(i => i.id === "ticket2");
      if (!ticket1) base.inventory.push({ id: "ticket1", count: 20, name: "Viktorina Ticket", image: "ticket1.png" });
      if (!ticket2) {
        base.inventory.push({ id: "ticket2", count: 20, name: "Typing Ticket", image: "ticket2.png" });
      } else if (ticket2.count > 100) {
        // Fix bug: too many tickets accumulated from previous bugs
        ticket2.count = 20;
      }
    }
    Object.values(base.viktorinaDailyLog).forEach((day) => {
      if (!day.easy) {
        day.easy = { achievedAt: day.maxCombo ? { combo: day.maxCombo, timestamp: Date.now() } : null };
        day.normal = { achievedAt: day.maxCombo ? { combo: day.maxCombo, timestamp: Date.now() } : null };
        day.hard = { achievedAt: day.maxCombo ? { combo: day.maxCombo, timestamp: Date.now() } : null };
        day.extreme = { achievedAt: day.maxCombo ? { combo: day.maxCombo, timestamp: Date.now() } : null };
      }
    });
    return base;
  });

  const [currentTaskId, setCurrentTaskId] = useState(() => {
    return !localStorage.getItem("js_mastery_onboarding_hide") ? 10001 : 1;
  });
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("js-mastery_theme") || "default";
  });

  useEffect(() => {
    localStorage.setItem("js-mastery_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const ticket1 = stats?.inventory?.find(i => i.id === "ticket1");
    const ticket2 = stats?.inventory?.find(i => i.id === "ticket2");
    if (!ticket1 || !ticket2) {
      setStats(prev => {
        const inv = prev.inventory || [];
        const newInv = [...inv];
        if (!newInv.find(i => i.id === "ticket1")) newInv.push({ id: "ticket1", count: 20, name: "Viktorina Ticket", image: "ticket1.png" });
        if (!newInv.find(i => i.id === "ticket2")) newInv.push({ id: "ticket2", count: 20, name: "Typing Ticket", image: "ticket2.png" });
        return { ...prev, inventory: newInv };
      });
    }
  }, []);

  // XP from engwords
  useEffect(() => {
    const checkPendingXP = () => {
      const pending = Number(localStorage.getItem('engwords_xp_pending')) || 0;
      if (pending > 0) {
        setStats(prev => ({ ...prev, xp: (prev.xp || 0) + pending }));
        localStorage.removeItem('engwords_xp_pending');
        setNotifs(prev => [...prev, {
          id: Date.now(),
          title: 'XP EARNED!',
          desc: `+${pending.toFixed(1)} XP from English words`,
          icon: <Zap size={16} color="#4a9eff" />,
          popupId: `engwords-xp-${Date.now()}`
        }]);
      }
    };

    checkPendingXP();

    const handler = (e) => {
      if (e.key === 'engwords_xp_pending') checkPendingXP();
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  // ===== WEEKLY RECAP =====
  const [showWeeklyRecap, setShowWeeklyRecap] = useState(false);
  const [weeklyRecapData, setWeeklyRecapData] = useState(null);

  useEffect(() => {
    const today = new Date();
    const isMonday = today.getDay() === 1;
    if (!isMonday) return;
    const thisMonday = today.toISOString().split('T')[0];
    if (stats.weeklyRecapShown === thisMonday) return;

    // Calculate last week stats (Mon-Sun)
    const lastWeekDays = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      lastWeekDays.push(d.toISOString().split('T')[0]);
    }
    const weekLog = lastWeekDays
      .map(d => stats.dailyLog?.[d])
      .filter(Boolean);
    if (weekLog.length === 0) return;

    const totalXp = weekLog.reduce((s, d) => s + (d.xp || 0), 0);
    const totalSolved = weekLog.reduce((s, d) => s + (d.solved || 0), 0);
    const activeDays = weekLog.length;
    const bestDay = lastWeekDays.reduce((best, d) => {
      const solved = stats.dailyLog?.[d]?.solved || 0;
      return solved > (stats.dailyLog?.[best]?.solved || 0) ? d : best;
    }, lastWeekDays[0]);

    setWeeklyRecapData({ totalXp, totalSolved, activeDays, bestDay });
    setShowWeeklyRecap(true);
    setStats(prev => ({ ...prev, weeklyRecapShown: thisMonday }));
  }, []);
  // ========================

  const [activeTab, setActiveTab] = useState("editor"); // editor | journal
  const [journalTab, setJournalTab] = useState("tasks"); // tasks | stats
  const [code, setCode] = useState("");
  const [results, setResults] = useState(null);
  //настраивает внешний вид редактора кода (Monaco Editor)
  // handleEditorWillMount определён локально в EditorWorkspace.jsx — не дублируем

  const currentTask = tasks.find((t) => t.id === currentTaskId) || tasks[0];
  const taskProgress = (stats.taskStats && stats.taskStats[currentTask.id]) || {
    level: 0,
    passedCount: 0,
    failedCount: 0,
    hideUntil: 0,
  };
  const lastPassed = results?.allPassed || taskProgress.passedCount > 0;
  const aiLimitsAvailable =
    Math.max(
      0,
      3 -
      (stats.aiHistory?.[currentTask.id]?.date ===
        new Date().toISOString().split("T")[0]
        ? stats.aiHistory[currentTask.id].count || 0
        : 0),
    ) > 0;

  // Theory cooldown functions
  const saveTheoryCooldown = (cardName) => {
    const passCountKey = `theoryPassCount_${cardName}`;
    const passCount = parseInt(localStorage.getItem(passCountKey) || "0", 10);
    const cooldownHours = 24 * Math.pow(2, passCount);
    const cooldownTime = Date.now() + cooldownHours * 60 * 60 * 1000;
    localStorage.setItem(`theoryCooldown_${cardName}`, cooldownTime.toString());
    localStorage.setItem(passCountKey, (passCount + 1).toString());
  };

  const getTheoryCooldown = (cardName) => {
    const stored = localStorage.getItem(`theoryCooldown_${cardName}`);
    return stored ? parseInt(stored, 10) : 0;
  };

  const isTheoryLocked = (cardName) => {
    const cooldownTime = getTheoryCooldown(cardName);
    return cooldownTime > Date.now();
  };

  const getCooldownRemaining = (cardName) => {
    const cooldownTime = getTheoryCooldown(cardName);
    const remaining = cooldownTime - Date.now();
    if (remaining <= 0) return null;

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}ч ${minutes}м`;
    }
    return `${minutes}м`;
  };

  const [cooldownRefresh, setCooldownRefresh] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCooldownRefresh((prev) => prev + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const [cssCode, setCssCode] = useState("");
  const [ansInput, setAnsInput] = useState(""); // Separate input for predictor mode
  const [selectedAnswers, setSelectedAnswers] = useState([]); // For choice/bug modes
  const [choiceTimer, setChoiceTimer] = useState(0); // Таймер блокировки для choice режимов
  // Таймер обратного отсчета для choice режимов
  useEffect(() => {
    if (choiceTimer === 0) return;
    const timer = setTimeout(() => setChoiceTimer(choiceTimer - 1), 1000);
    return () => clearTimeout(timer);
  }, [choiceTimer]);

  // AI Limits - отдельная система через aiHistory, не трогаем

  const [isRunning, setIsRunning] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSolution, setShowSolution] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  // XP Flyers state
  const [flyers, setFlyers] = useState([]);
  const [aiFlyers, setAiFlyers] = useState([]); // AI points flyers

  // Onboarding Tour state
  const [showTour, setShowTour] = useState(
    () => !localStorage.getItem("js_mastery_onboarding_hide"),
  );
  const [tourStep, setTourStep] = useState(0);
  const [tourSkipForever, setTourSkipForever] = useState(true);

  // Viktorina state
  const [showViktorina, setShowViktorina] = useState(false);

  // Typing Challenge state
  const [showTypingChallenge, setShowTypingChallenge] = useState(false);

  // Inventory state
  const [showInventory, setShowInventory] = useState(false);

  // Achievement Notification state
  const [notifs, setNotifs] = useState([]);

  // Theory Block state
  const [theoryOpenCard, setTheoryOpenCard] = useState(null);
  const [theoryAnswers, setTheoryAnswers] = useState({});
  const [theoryResults, setTheoryResults] = useState({});
  const [theorySubmitting, setTheorySubmitting] = useState(false);

  // Journal Sorting & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "level",
    direction: "desc",
  });

  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverZone, setDragOverZone] = useState(null);
  const [currentStack, setCurrentStack] = useState("JavaScript");
  const [showStackMenu, setShowStackMenu] = useState(false);
  const [expandedModules, setExpandedModules] = useState({ Основы: true });
  const [selectedCard, setSelectedCard] = useState(null); // card name currently open
  const [expandedCards, setExpandedCards] = useState({}); // which cards show their task lists
  const [expandedJournalCards, setExpandedJournalCards] = useState({});
  const [bottomPanelVisible, setBottomPanelVisible] = useState(() => {
    try {
      const saved = localStorage.getItem("bottomPanelVisible");
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {}
    return true;
  });

  useEffect(() => {
    try {
      localStorage.setItem("bottomPanelVisible", JSON.stringify(bottomPanelVisible));
    } catch (e) {}
  }, [bottomPanelVisible]);

  // Theory task - use theoryOpenCard if set, otherwise use currentTask
  const teoriaTask = (theoryOpenCard
    ? getTeoriaTaskByCard(theoryOpenCard, "Основы", currentStack)
    : currentTask?.card
      ? getTeoriaTaskByCard(
        currentTask.card,
        currentTask.module,
        currentTask.stack,
      )
      : null) || null;

  // AI TASK STATE
  const [aiActiveTask, setAiActiveTask] = useState(null);
  const displayTask = aiActiveTask || currentTask;
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRewardFlyer, setAiRewardFlyer] = useState(null);
  const [showDailyQuests, setShowDailyQuests] = useState(false);
  //асинхронно запрашивает новое задание у ИИ:
  const triggerAiTask = async (task) => {
    if (aiLoading) return;
    playSound("click");
    
    // Check if we have enough AI generations for today
    const today = new Date().toISOString().split("T")[0];
    const taskHistory = stats.aiHistory?.[task.id] || { date: "", count: 0 };
    const todayCount = taskHistory.date === today ? taskHistory.count || 0 : 0;
    const remaining = 3 - todayCount;
    
    if (remaining <= 0) {
      setNotifs((prev) => [
        ...prev,
        {
          id: "ai-limit-reached",
          title: "AI LIMIT REACHED",
          desc: "Maximum 3 AI tasks per day reached. Come back tomorrow!",
          icon: <Zap size={16} />,
          popupId: Date.now(),
        },
      ]);
      return;
    }

    setAiLoading(true);
    
    // First decrement the limit BEFORE generating
    setStats((prev) => ({
      ...prev,
      aiHistory: {
        ...prev.aiHistory,
        [task.id]: { date: today, count: todayCount + 1 },
      },
    }));
    
    try {
      const newTask = await generateAiTask(task);
      setAiActiveTask(newTask);

      // Sync editors for AI task
      if (newTask.mode === "code") setCode(newTask.initialCode || "");
      if (newTask.mode === "ui-layout") setCssCode(newTask.initialCss || "");
      setAnsInput("");
      setSelectedAnswers([]);
      setResults(null);
    } catch (err) {
      setNotifs((prev) => [
        ...prev,
        {
          id: "ai-err",
          title: "NEURAL ERROR",
          desc: err.message,
          icon: <XCircle size={16} />,
          popupId: `ai-err-${Date.now()}-${Math.random()}`,
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const STACK_MODULES = {
    All: [
      "Основы",
      "Объекты: основы",
      "Типы данных",
      "Продвинутая работа с функциями",
      "Basic Types",
      "Generics",
      "Advanced Types",
      "Hooks",
      "Components",
      "Context",
      "Flexbox",
      "Grid",
      "Animations",
      "Basics",
      "Collaboration",
    ],
    JavaScript: [
      "Основы",
      "Объекты: основы",
      "Типы данных",
      "Продвинутая работа с функциями",
    ],
    TypeScript: ["Basic Types", "Generics", "Advanced Types"],
    React: ["Hooks", "Components", "Context"],
    Layout: ["Flexbox", "Grid", "Animations"],
    Git: ["Basics", "Collaboration"],
  };

  const [heatmapHoverDate, setHeatmapHoverDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [confettiPos, setConfettiPos] = useState(null);
  const [justPurchased, setJustPurchased] = useState(null);
  useEffect(() => {
    if (!confettiPos) return;
    const t = setTimeout(() => setConfettiPos(null), 2000);
    return () => clearTimeout(t);
  }, [confettiPos]);

  const [xpAnimKey, setXpAnimKey] = useState(0);
  const prevXpRef = useRef(stats.xp);
  useEffect(() => {
    if (prevXpRef.current !== stats.xp) {
      prevXpRef.current = stats.xp;
      setXpAnimKey((k) => k + 1);
    }
  }, [stats.xp]);

  // Time Tracking
  // Space Rebalancing & Splitter logic
  const [panelWidth, setPanelWidth] = useState(
    () => Number(localStorage.getItem("validationPanelWidth")) || 580,
  );
  const [isResizing, setIsResizing] = useState(false);
  //инициализирует процесс изменения ширины боковой панели при нажатии пользователем на разделитель
  const startResizing = (e) => {
    setIsResizing(true);
    document.body.style.cursor = "col-resize";
  };
  //отслеживает движение мыши для динамического изменения ширины панели
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 350 && newWidth < 1000) {
        setPanelWidth(newWidth);
        localStorage.setItem("validationPanelWidth", newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "default";
    };

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const [taskStartTime, setTaskStartTime] = useState(Date.now());
  const taskStartTimeRef = useRef(taskStartTime);
  const currentTaskRef = useRef(currentTask);
  const statsRef = useRef(stats);
  // Синхронизируем рефы при каждом изменении
  useEffect(() => { taskStartTimeRef.current = taskStartTime; }, [taskStartTime]);
  useEffect(() => { currentTaskRef.current = currentTask; }, [currentTask]);
  useEffect(() => { statsRef.current = stats; }, [stats]);
  const [elapsedTime, setElapsedTime] = useState(0);

  const currentLevel = stats.level || 1;
  const currentReq = getLevelReq(currentLevel).points;
  const currentAiPts = stats.aiPoints || 0;
  // Прогресс теперь считается от AI-баллов (не от XP)
  const progressPercent = Math.min(100, (currentAiPts / currentReq) * 100);
  const xpProgressPercent = Math.min(100, ((stats.xp || 0) / 100000) * 100);

  // вызывает модальное окно для списания (траты) очков опыта
  const spendXpHandler = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    spendXp(stats, setStats, setNotifs);
  };
  // Build unique cards per stack for counting
  const taskCounts = useMemo(() => {
    const counts = {};
    const now = Date.now();
    ["JavaScript", "TypeScript", "React", "Layout", "Git"].forEach((stack) => {
      const stackTasks = tasks.filter(
        (t) => t.stack === stack && t.id < 10000 && t.card,
      );
      const cardNames = [...new Set(stackTasks.map((t) => t.card))];
      let active = 0,
        locked = 0;
      cardNames.forEach((cardName) => {
        const cs = stats.cardStats[cardName];
        if (!cs || !cs.hideUntil || cs.hideUntil <= now) active++;
        else locked++;
      });
      counts[stack] = { active, locked };
    });
    return counts;
  }, [tasks, stats.cardStats]);
  //запускает секундный интервал для обновления счетчика времени, затраченного на выполнение текущего задания
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - taskStartTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [taskStartTime]);

  //вычисляет общее количество решенных задач за всё время
  const totalContributions = useMemo(() => {
    return Object.values(stats.dailyLog).reduce(
      (acc, curr) => acc + (curr.solved || 0),
      0,
    );
  }, [stats.dailyLog]);

  //формирует подробный текстовый промпт для ИИ
  const copyBriefingHandler = () => {
    copyBriefing(currentTask, code, cssCode, setNotifs);
  };
  //автоматически сохраняет все изменения состояния игрока (stats) в локальное хранилище браузер
  useEffect(() => {
    localStorage.setItem("js_mastery_stats_v3", JSON.stringify(stats));
  }, [stats]);
  //сбрасывает состояние редактора при переключении задачи: очищает ввод, подставляет начальный код,
  useEffect(() => {
    setAiActiveTask(null); // dismiss AI task when switching
    let initialCode = currentTask.initialCode || "";
    if (currentTask.mode === "code" && currentTask.tests) {
      const comments = currentTask.tests
        .map(
          (t) =>
            `// { params: ${JSON.stringify(t.params)}, expected: ${JSON.stringify(t.expected)} }`,
        )
        .join("\n");
      initialCode = `${initialCode}\n\n${comments}`;
    }
    setCode(initialCode);
    setCssCode(currentTask.initialCss || "");
    setAnsInput("");
    setSelectedAnswers([]);
    setResults(null);
    setShowSolution(false);
    setTaskStartTime(Date.now());
    setElapsedTime(0);
    // Запуск таймера блокировки для choice режимов (3 секунды)
    if (
      currentTask.mode === "single-choice" ||
      currentTask.mode === "multi-choice"
    ) {
      setChoiceTimer(3);
    }
  }, [currentTaskId]);

  const [shuffledOptions, setShuffledOptions] = useState([]);
  //перемешивает варианты ответов в задачах с выбором (квизах
  useEffect(() => {
    if (currentTask.options) {
      setShuffledOptions(shuffleArrayFn(currentTask.options));
    }
  }, [currentTask.id]); // Предположим, у задачи есть уникальный id

  //фильтрует и сортирует список задач: скрывает удаленные или «заблокированные» по времени задачи
  const visibleTasks = useMemo(() => {
    const ordered = [...tasks].sort((a, b) => {
      const idxA = stats.customOrder.indexOf(a.id);
      const idxB = stats.customOrder.indexOf(b.id);
      return (idxA === -1 ? 9999 : idxA) - (idxB === -1 ? 9999 : idxB);
    });

    // Hide tutorial tasks when tour is off
    return ordered.filter((t) => {
      // Stack Filtering
      // Stack Filtering
      if (currentStack !== "All" && t.stack !== currentStack && t.id < 10000) return false;

      // Tutorial tasks (10001 to 10006) are ALWAYS visible if tour is ON
      if (t.id >= 10001 && t.id <= 10006) return showTour;

      if (stats.deletedTaskIds?.includes(t.id)) return false;
      const prog = stats.taskStats[t.id];
      return !prog?.hideUntil || Date.now() > prog.hideUntil;
    });
  }, [stats, showTour, currentStack]);
  //управляет поведением интерактивного обучения: автоматически подставляет правильные ответы на шагах тутора,
  useEffect(() => {
    if (!showTour) return;
    const s = ONBOARDING_STEPS[tourStep];

    // Auto-solve logic for tutorial modes
    if (s.autoSolve) {
      const { type, val } = s.autoSolve;
      if (type === "code") setCode(val);
      if (type === "css") setCssCode(val);
      if (type === "input") setAnsInput(val);
      if (type === "choice") setSelectedAnswers([val]);
      if (type === "multi") setSelectedAnswers(val);
      if (type === "bug") setSelectedAnswers([val]);
    }

    // Monitoring for step progression via actions
    if (s.requireAction === "switch-journal" && activeTab === "journal")
      handleTourNext();
    if (s.requireAction === "switch-academy" && activeTab === "editor")
      handleTourNext();
    if (s.requireAction === "run" && results?.allPassed) handleTourNext();

    const el = document.querySelector(s.target);
    const spotlight = document.getElementById("spotlight");
    if (el && spotlight) {
      const rect = el.getBoundingClientRect();
      spotlight.style.display = "block";
      spotlight.style.width = `${rect.width + 10}px`;
      spotlight.style.height = `${rect.height + 10}px`;
      spotlight.style.top = `${rect.top - 5 + window.scrollY}px`;
      spotlight.style.left = `${rect.left - 5 + window.scrollX}px`;

      // Pulse the element if it requires action
      if (s.requireAction) el.classList.add("pulse-anim");
      else
        document
          .querySelectorAll(".pulse-anim")
          .forEach(
            (node) => node !== el && node.classList.remove("pulse-anim"),
          );

      el.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (spotlight) {
      spotlight.style.display = "none";
    }

    return () => {
      if (el) el.classList.remove("pulse-anim");
    };
  }, [tourStep, showTour, activeTab, results, currentTaskId]);

  // Keyboard shortcuts for Viktorina and Typing Challenge
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Escape" && (showViktorina || showTypingChallenge)) {
        setShowViktorina(false);
        setShowTypingChallenge(false);
      }
      if (e.ctrlKey && e.shiftKey && (e.key === "T" || e.key === "Е")) {
        e.preventDefault();
        setShowTypingChallenge(true);
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [showViktorina, showTypingChallenge]);

  //переключает шаги обучающего тура
  const handleTourNext = () => {
    if (tourStep === ONBOARDING_STEPS.length - 1) {
      if (tourSkipForever)
        localStorage.setItem("js_mastery_onboarding_hide", "true");
      setShowTour(false);
    } else {
      const nextStep = tourStep + 1;
      const nextS = ONBOARDING_STEPS[nextStep];
      if (nextS.triggerTaskId) setCurrentTaskId(nextS.triggerTaskId);
      setTourStep(nextStep);
      playSound("click");
    }
  };

  // вспомогательная функция: сбрасывает счетчик прохождений (passedCount) для всех задач, принадлежащих определенной карточке (используется при повышении или понижении уровня).
  // обёртки над импортированными функциями для передачи как пропсы
  const isCardLocked = (cardName) => isCardLockedFn(cardName, stats);
  //масштабная логика повышения уровня карточки
  const handleLvlUpHandler = (e) => {
    handleLvlUp({
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
      playSound,
    });
    // Confetti at click position
    const rect = e?.currentTarget?.getBoundingClientRect();
    if (rect) setConfettiPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  };

  const handleLvlDownHandler = () => {
    handleLvlDown({
      currentTask,
      stats,
      setStats,
      tasks,
      playSound,
    });
  };

  const handleClearCardHandler = () => {
    handleClearCard({
      currentTask,
      stats,
      setStats,
      tasks,
      playSound,
    });
  };

  const handleTheorySubmit = async (cardName, module, stack) => {
    console.log("handleTheorySubmit called", { cardName, module, stack });
    const targetCard = cardName || currentTask?.card;
    const targetModule = module || currentTask?.module;
    const targetStack = stack || currentTask?.stack;

    console.log("target:", { targetCard, targetModule, targetStack });
    if (!targetCard) {
      console.log("No targetCard, returning");
      return;
    }

    // Check cooldown
    if (isTheoryLocked(targetCard)) {
      const remaining = getCooldownRemaining(targetCard);
      setNotifs((prev) => [
        ...prev,
        {
          id: `theory-cooldown-${Date.now()}`,
          title: "ТЕОРИЯ ЗАБЛОКИРОВАНА",
          desc: `Подожди ${remaining} перед следующей попыткой`,
          icon: <Lock size={16} />,
          popupId: `theory-cooldown-${Date.now()}-${Math.random()}`,
        },
      ]);
      return;
    }

    const teoriaTask = getTeoriaTaskByCard(
      targetCard,
      targetModule,
      targetStack,
    );
    console.log("teoriaTask found:", teoriaTask);
    if (!teoriaTask) return;

    const answers = theoryAnswers[targetCard] || {};
    console.log("answers:", answers);

    // Log each answer
    Object.entries(answers).forEach(([qId, ans]) => {
      console.log(`Question ${qId}: "${ans}"`);
    });

    if (Object.keys(answers).length === 0) {
      console.log("WARNING: No answers found!");
    }

    setTheorySubmitting(true);

    try {
      console.log("Calling checkTeoriaAnswers...");
      const result = await checkTeoriaAnswers({
        card: targetCard,
        module: targetModule,
        stack: targetStack,
        answers,
        questions: teoriaTask.questions,
      });

      console.log("Theory check result:", result);
      setTheoryResults((prev) => ({
        ...prev,
        [targetCard]: {
          ...result,
          date: new Date().toISOString().split("T")[0],
        },
      }));
      setTheorySubmitting(false);

      if (result.totalPercent >= 70) {
        // Save cooldown on successful completion (1-2-4-8-16-32-64-128 дней)
        saveTheoryCooldown(targetCard);

        setStats((prev) => ({
          ...prev,
          xp: (prev.xp || 0) + teoriaTask.xpReward,
          cardAiPoints: {
            ...prev.cardAiPoints,
            [targetCard]: Math.min(
              20,
              (prev.cardAiPoints?.[targetCard] || 0) +
              teoriaTask.aiPointsReward,
            ),
          },
        }));
        setNotifs((prev) => [
          ...prev,
          {
            id: `theory-pass-${Date.now()}`,
            title: "ТЕОРИЯ УСВОЕНА!",
            desc: `${result.totalPercent}% - +${teoriaTask.xpReward} XP / +${teoriaTask.aiPointsReward} AI`,
            icon: <CheckCircle size={16} />,
            popupId: `theory-${Date.now()}-${Math.random()}`,
          },
        ]);
      } else {
        setNotifs((prev) => [
          ...prev,
          {
            id: `theory-fail-${Date.now()}`,
            title: "ТЕОРИЯ НЕ УСВОЕНА",
            desc: `${result.totalPercent}% - нужно 70%`,
            icon: <XCircle size={16} />,
            popupId: `theory-${Date.now()}-${Math.random()}`,
          },
        ]);
      }

      setTheorySubmitting(false);
    } catch (error) {
      console.error("Theory check error:", error);
      setTheorySubmitting(false);
    }
  };

  const handleClearTheoryResults = (cardName) => {
    setTheoryResults((prev) => {
      const newResults = { ...prev };
      delete newResults[cardName];
      return newResults;
    });
  };

  //использует библиотеку Prettier для автоматического форматирования кода в редакторе
  const formatCodeHandler = async () => {
    await formatCode(
      code,
      setCode,
      setStats,
      checkAchievements,
      tasks,
      setNotifs,
      playSound,
      stats,
    );
  };
  //Запускает проверку решения в зависимости от режима:
  const validateCodeHandler = () => {
    const triggerAiFlyerFn = (amount) => {
      const id = Date.now();
      setAiFlyers((prev) => [...prev, { id, amount }]);
    };
    const triggerXpFlyerFn = (amount) => {
      const id = Date.now();
      setFlyers((prev) => [...prev, { id, xp: amount }]);
    };
    validateCode({
      displayTask,
      ansInput,
      cssCode,
      code,
      selectedAnswers,
      setResults,
      setIsRunning,
      setAiActiveTask,
      triggerAiFlyer: triggerAiFlyerFn,
      triggerXpFlyer: triggerXpFlyerFn,
      finishValidation: (
        allPassed,
        testResults,
        runtime,
        memory,
        logs,
        aiFlyer,
        xpFlyer,
      ) =>
        finishValidation({
          allPassed,
          testResults,
          runtime,
          memory,
          logs,
          displayTask,
          currentTask: currentTaskRef.current,
          stats,
          setResults,
          setIsRunning,
          taskStartTime: taskStartTimeRef.current,
          setAiActiveTask,
          setStats,
          triggerAiFlyer: aiFlyer,
          triggerXpFlyer: xpFlyer,
          checkAchievements,
          tasks,
          setNotifs,
          playSound,
          currentStack,
        }),
    });
  };
  //запускает текущий код в воркере "просто так"
  const handleQuickRunHandler = () => {
    handleQuickRun({ code, setResults });
  };
  //открывает результат верстки (HTML + текущий CSS)
  const openLayoutPreviewHandler = () => {
    openLayoutPreview({ currentTask, cssCode });
  };

  /*   const handleDragOver = (e) => {
    e.preventDefault();
  };
  
  const handleDropOnTrash = (e) => {
    e.preventDefault();
    if (!draggedTaskId) return;
    playSound('delete');
    setStats((prev) => ({
      ...prev,
      deletedTaskIds: [...(prev.deletedTaskIds || []), draggedTaskId],
    }));
    if (currentTaskId === draggedTaskId) {
      const next = visibleTasks.find((t) => t.id !== draggedTaskId);
      if (next) setCurrentTaskId(next.id);
    }
    setIsDragging(false);
    setDraggedTaskId(null);
    setDragOverZone(null);
  }; */

  /*   const handleDropOnEnd = (e) => {
    e.preventDefault();
    if (!draggedTaskId) return;
    playSound('moveEnd');
    setStats((prev) => {
      const filteredOrder = prev.customOrder.filter((id) => id !== draggedTaskId);
      return {
        ...prev,
        customOrder: [...filteredOrder, draggedTaskId],
      };
    });
    setIsDragging(false);
    setDraggedTaskId(null);
    setDragOverZone(null);
  }; */
  //комплексная фильтрация и сортировка основного списка заданий:
  const sortedTasks = useMemo(() => {
    let list = tasks.filter((t) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // Stack Filtering
    list = currentStack === "All" 
      ? list 
      : list.filter((t) => t.stack === currentStack);

    // Hide tutorial tasks from intelligence when tour is complete
    if (!showTour) {
      list = list.filter((t) => t.id < 10001 || t.id > 10006);
    }

    return list.sort((a, b) => {
      const stA = stats.taskStats[a.id] || { level: 0, hideUntil: 0 };
      const stB = stats.taskStats[b.id] || { level: 0, hideUntil: 0 };

      let valA = a[sortConfig.key] ?? stA[sortConfig.key];
      let valB = b[sortConfig.key] ?? stB[sortConfig.key];

      if (sortConfig.key === "level") {
        valA = stA.level;
        valB = stB.level;
      }
      if (sortConfig.key === "success") {
        valA = stA.passedCount;
        valB = stB.passedCount;
      }
      if (sortConfig.key === "status") {
        const getStatus = (id, p) => {
          if (stats.deletedTaskIds?.includes(id)) return 2;
          if (p.hideUntil > Date.now()) return 1;
          return 0;
        };
        valA = getStatus(a.id, stA);
        valB = getStatus(b.id, stB);
      }

      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [tasks, stats, searchTerm, sortConfig, currentStack]);
  //управляет состоянием сортировки: если нажать на тот же заголовок повторно, меняет направление (asc на desc)
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });
  };
  // 1. ЭКСПОРТ: Сохранение прогресса в файл
  const exportProgress = () => {
    const dataStr = JSON.stringify(stats, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `js-mastery-backup-${new Date().toISOString().split("T")[0]}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    setNotifs((prev) => [
      ...prev,
      {
        id: `backup-${Date.now()}-${Math.random()}`,
        title: "BACKUP CREATED",
        desc: "Progress saved to file.",
        icon: <Award size={16} color="#4ade80" />,
        popupId: `backup-${Date.now()}-${Math.random()}`,
      },
    ]);
  };

  // 2. ИМПОРТ: Загрузка прогресса из файла
  const importProgress = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedStats = JSON.parse(e.target.result);

        // Базовая проверка на валидность
        if (importedStats && typeof importedStats.xp === "number") {
          if (
            window.confirm(
              "Вы уверены? Это полностью заменит ваш текущий прогресс!",
            )
          ) {
            setStats(importedStats);
            localStorage.setItem(
              "js_mastery_stats_v3",
              JSON.stringify(importedStats),
            );
            window.location.reload(); // Перезагружаем для чистоты стейта
          }
        } else {
          alert("Ошибка: Неверный формат файла.");
        }
      } catch (err) {
        alert("Ошибка при чтении файла.");
      }
    };
    reader.readAsText(file);
  };
  return (
    <div className="app-container v3-polished">
      {/* Рендерится массив "летающих" очков XP */}
      {flyers.map((f) => (
        <XpFlyer
          key={f.id}
          xp={f.xp}
          onComplete={() =>
            setFlyers((prev) => prev.filter((x) => x.id !== f.id))
          }
        />
      ))}

      {/* Рендерится массив "летающих" очков AI */}
      {aiFlyers.map((f) => (
        <PointsFlyer
          key={f.id}
          type="ai"
          amount={f.amount}
          onComplete={() =>
            setAiFlyers((prev) => prev.filter((x) => x.id !== f.id))
          }
        />
      ))}

      {/* Контейнер в верхней части экрана, который выводит всплывающие плашки достижений */}
      <div className="notif-container">
        {notifs.map((n) => (
          <AchievementPopup
            key={n.popupId}
            achievement={n}
            onComplete={() =>
              setNotifs((prev) => prev.filter((x) => x.popupId !== n.popupId))
            }
          />
        ))}
      </div>

      {/* Daily Quests Modal */}
      <DailyQuestsModal
        isOpen={showDailyQuests}
        onClose={() => setShowDailyQuests(false)}
        stats={stats}
        setStats={setStats}
        playSound={playSound}
        taskStats={stats.taskStats}
        theoryResults={theoryResults}
      />

      {/* Viktorina Modal */}
      <Viktorina
        isOpen={showViktorina}
        onClose={() => setShowViktorina(false)}
        stats={stats}
        setStats={setStats}
        setNotifs={setNotifs}
        playSound={playSound}
      />

      {/* Typing Challenge Modal */}
      <TypingChallenge
        isOpen={showTypingChallenge}
        onClose={() => setShowTypingChallenge(false)}
        stats={stats}
        setStats={setStats}
        setNotifs={setNotifs}
        playSound={playSound}
      />

      {/* Inventory Modal */}
      {showInventory && (
        <div className="inventory-modal-overlay" onClick={() => setShowInventory(false)}>
          <div className="inventory-modal" onClick={e => e.stopPropagation()}>
            <div className="inventory-header">
              <Package size={24} />
              <h2>ИНВЕНТАРЬ</h2>
              <button className="inventory-close-btn" onClick={() => setShowInventory(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="inventory-grid">
              {(stats.inventory || []).map((item, index) => (
                <div key={`${item.id}-${item.count}`} className={`inventory-slot${justPurchased === item.id ? ' just-purchased' : ''}`} title={`${item.name}\n${item.count} шт.`}>
                  <div className="slot-image">
                    <img src={`/js-mastery/${item.image}`} alt={item.name} />
                  </div>
                  <span className="slot-count">{item.count}</span>
                </div>
              ))}
              {Array.from({ length: Math.max(0, 24 - (stats.inventory?.length || 0)) }).map((_, i) => (
                <div key={`empty-${i}`} className="inventory-slot empty"></div>
              ))}
            </div>

            {/* === SHOP === */}
             <div className="inventory-shop">
               <h3 className="shop-title">🛒 SHOP</h3>
               <div className="shop-items">
                  {(() => {
                    const today = new Date().toISOString().split('T')[0];
                    const shopKey = 'shop_purchases_' + today;
                    let purchases = {};
                    try { purchases = JSON.parse(localStorage.getItem(shopKey) || '{}'); } catch(e) {}
                    const costKey = 'shop_costs_' + today;
                    let costs = null;
                    try { costs = JSON.parse(localStorage.getItem(costKey) || 'null'); } catch(e) {}
                    if (!costs) {
                     costs = {
                       ticket1: 5 + Math.floor(Math.random() * 16),
                       ticket2: 10 + Math.floor(Math.random() * 21),
                     };
                     localStorage.setItem(costKey, JSON.stringify(costs));
                   }
                   const items = [
                     { id: "ticket1", name: "Viktorina Ticket", img: "ticket1.png",
                       cost: costs.ticket1, maxPerDay: 5 },
                     { id: "ticket2", name: "Typing Ticket", img: "ticket2.png",
                       cost: costs.ticket2, maxPerDay: 5 },
                   ];
                   return items.map(shopItem => {
                     const boughtToday = purchases[shopItem.id] || 0;
                     const canBuy = (stats.xp || 0) >= shopItem.cost && boughtToday < shopItem.maxPerDay;
                     return (
                       <div key={shopItem.id} className={`shop-item ${!canBuy ? 'shop-item-locked' : ''}`}>
                         <img src={`/js-mastery/${shopItem.img}`} alt={shopItem.name} className="shop-item-img" />
                         <div className="shop-item-info">
                           <span className="shop-item-name">{shopItem.name}</span>
                           <span className="shop-item-cost">⚡ {shopItem.cost} XP</span>
                           <span style={{fontSize:'11px', color:'#8b949e'}}>
                             {boughtToday}/{shopItem.maxPerDay} сегодня
                           </span>
                         </div>
                         <button
                           className="shop-buy-btn"
                           disabled={!canBuy}
                           onClick={() => {
                             if (!canBuy) return;
                             playSound('success');
                             const newPurchases = { ...purchases, [shopItem.id]: (purchases[shopItem.id] || 0) + 1 };
                             localStorage.setItem(shopKey, JSON.stringify(newPurchases));
                             setStats(prev => ({
                               ...prev,
                               xp: Math.max(0, (prev.xp || 0) - shopItem.cost),
                               inventory: prev.inventory.map(i =>
                                 i.id === shopItem.id ? { ...i, count: i.count + 1 } : i
                               ),
                             }));
                              setJustPurchased(shopItem.id);
                              setTimeout(() => setJustPurchased(null), 600);
                              setNotifs(prev => [...prev, {
                                id: `shop-${Date.now()}`,
                                title: 'КУПЛЕНО!',
                                desc: `${shopItem.name} -${shopItem.cost} XP`,
                                icon: <Package size={16} color="#ffd700" />,
                               popupId: `shop-${Date.now()}-${Math.random()}`,
                             }]);
                           }}
                         >
                           КУПИТЬ
                         </button>
                       </div>
                     );
                   });
                 })()}
               </div>
             </div>
            {/* =========== */}

            <div className="inventory-footer">
              <p>Слоты: {stats.inventory?.length || 0}/24</p>
              <p style={{ color: '#ffcc00', fontSize: '0.8rem' }}>
                Баланс: {Number(stats.xp || 0).toFixed(0)} XP
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Recap Modal */}
      {showWeeklyRecap && weeklyRecapData && (
        <div className="weekly-recap-overlay" onClick={() => setShowWeeklyRecap(false)}>
          <div className="weekly-recap-modal" onClick={e => e.stopPropagation()}>
            <button className="weekly-recap-close" onClick={() => setShowWeeklyRecap(false)}>
              <X size={18} />
            </button>
            <div className="weekly-recap-header">
              <Zap size={32} color="#ffcc00" fill="#ffcc00" />
              <h2>ИТОГИ НЕДЕЛИ</h2>
              <p>Отличная работа, боец!</p>
            </div>
            <div className="weekly-recap-stats">
              <div className="wr-stat">
                <span className="wr-val">{weeklyRecapData.totalXp}</span>
                <span className="wr-label">XP за неделю</span>
              </div>
              <div className="wr-stat">
                <span className="wr-val">{weeklyRecapData.totalSolved}</span>
                <span className="wr-label">Задач решено</span>
              </div>
              <div className="wr-stat">
                <span className="wr-val">{weeklyRecapData.activeDays}/7</span>
                <span className="wr-label">Активных дней</span>
              </div>
              <div className="wr-stat">
                <span className="wr-val" style={{ fontSize: '0.75rem' }}>
                  {new Date(weeklyRecapData.bestDay).toLocaleDateString('ru', { weekday: 'short', day: 'numeric', month: 'short' })}
                </span>
                <span className="wr-label">Лучший день</span>
              </div>
            </div>
            <button className="weekly-recap-close-btn" onClick={() => setShowWeeklyRecap(false)}>
              ПОНЯЛ, ПРОДОЛЖАЕМ
            </button>
          </div>
        </div>
      )}

      {/* отрисовывается обучающее окно */}
      {showTour && (
        <OnboardingTour
          step={tourStep}
          onNext={handleTourNext}
          onSkip={setTourSkipForever}
          onClose={() => setShowTour(false)}
          tourSkipForever={tourSkipForever}
          activeTab={activeTab}
          isResultsOk={results?.allPassed}
        />
      )}

      {/* Dynamic Header Redesign (Shield Style) */}
      <div className="xp-sticky-header">
        <div className="mission-status-deck">
          <div className="ms-group active">
            <Play size={12} fill="currentColor" />
            <div className="ms-val">
              <strong>{taskCounts[currentStack]?.active || 0}</strong>
              <span>ACTIVE</span>
            </div>
          </div>
          <div className="ms-group locked">
            <Lock size={12} />
            <div className="ms-val">
              <strong>{taskCounts[currentStack]?.locked || 0}</strong>
              <span>LOCKED</span>
            </div>
          </div>
          <button
            className="theme-toggle-header viktorina-btn"
            onClick={() => setShowViktorina(true)}
            title="Викторина"
          >
            <Zap size={14} />
            <span>ВИКТОРИНА</span>
          </button>
          <button
            className="theme-toggle-header typing-btn"
            onClick={() => setShowTypingChallenge(true)}
            title="Typing Challenge (Ctrl+Shift+T)"
          >
            <Type size={14} />
            <span>TYPING</span>
          </button>
          <button
            className="theme-toggle-header english-btn"
            onClick={() => window.open('/js-mastery/engwords/index.html', '_blank')}
            title="Open English Words"
          >
            <Globe size={14} />
            <span>ENGLISH</span>
          </button>
          <button
            className="theme-toggle-header"
            onClick={() => setBottomPanelVisible(!bottomPanelVisible)}
            title={bottomPanelVisible ? "Hide Bottom Panel" : "Show Bottom Panel"}
          >
            <PanelBottom size={14} />
            <span style={{
              textShadow: bottomPanelVisible ? "0 0 8px #4ade80" : "0 0 8px #f87171",
              color: bottomPanelVisible ? "#4ade80" : "#f87171",
              fontWeight: 900,
              fontSize: "9px",
              letterSpacing: "0.5px"
            }}>
              {bottomPanelVisible ? "●ON" : "●OFF"}
            </span>
          </button>
          <button
            className="theme-toggle-header"
            onClick={() => setTheme(theme === "default" ? "hacker" : "default")}
            title={`Switch to ${theme === "default" ? "hacker" : "default"} theme`}
          >
            <Palette size={14} />
            <span>{theme === "default" ? "DEFAULT" : "HACKER"}</span>
          </button>
        </div>

        <div className="xp-counter left-align">
          <Clock size={16} />
          <div className="timer-stack">
            <span>
              Mission Clock:{" "}
              <strong>
                {Math.floor(elapsedTime / 60)}:
                {String(elapsedTime % 60).padStart(2, "0")}
              </strong>
            </span>
            {stats.taskStats[currentTask.id]?.bestTime && (
              <span className="record-txt">
                Personal Best:{" "}
                {Math.floor(stats.taskStats[currentTask.id].bestTime / 60)}:
                {String(stats.taskStats[currentTask.id].bestTime % 60).padStart(
                  2,
                  "0",
                )}
              </span>
            )}
          </div>
        </div>

        <div
          className="lvl-card"
          onClick={() => setShowDailyQuests(true)}
          onContextMenu={(e) => {
            e.preventDefault();
            const currentXp = stats.xp || 0;
            if (currentXp <= 0) {
              setNotifs((prev) => [
                ...prev,
                {
                  id: Date.now(),
                  type: "error",
                  message: "Нет XP для отправки в расширение",
                  color: "#ff4444",
                },
              ]);
              return;
            }
            if (!window.confirm(`Отправить ${currentXp} XP в расширение?\nXP на сайте обнулятся!`)) {
              return;
            }
            // Отправляем XP в расширение
            window.postMessage({
              type: 'SEND_XP_TO_EXTENSION',
              xp: currentXp,
              source: 'js-mastery-site'
            }, '*');
              // Слушаем подтверждение от расширения
             const handler = (event) => {
                if (event.source !== window) return;
                if (event.data.type === 'XP_RECEIVED_BY_EXTENSION') {
                  window.removeEventListener('message', handler);
                  setStats((prev) => ({ ...prev, xp: 0, xpSentToExtension: true }));
                 setNotifs((prev) => [
                   ...prev,
                   {
                     id: Date.now(),
                     type: "xp",
                     message: `${currentXp} XP отправлено в расширение!`,
                     color: "#4CAF50",
                   },
                 ]);
               }
             };
             window.addEventListener('message', handler);
             // Авто-очистка listener через 5 секунд, если расширение не ответило
             setTimeout(() => window.removeEventListener('message', handler), 5000);
          }}
          title="Ежедневные квесты (Q), правый клик - списать XP"
          style={{
            cursor: "pointer",
            transition: "0.2s",
            border: "1px solid #ffcc0040",
          }}
          onMouseEnter={(e) =>
          (e.currentTarget.style.boxShadow =
            "0 0 10px rgba(255, 204, 0, 0.2)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
        >
          <div className="lvl-shield-wrap">
            {/* Убрали щит с уровнем, поставили батарею/молнию */}
            <Zap size={30} color="#ffcc00" fill="#ffcc00" />
          </div>

          <div className="xp-info-mini">
            <div className="xp-text-row">
              <span
                 key={`xp-${xpAnimKey}`}
                 className="xp-count-val xp-animate"
                 style={{ color: "#ffcc00", fontSize: "1rem" }}
                >
                 {Number((stats.xp || 0) + (Number(localStorage.getItem('engwords_xp_pending')) || 0)).toFixed(2).replace(/\.?0+$/, "")} XP
               </span>
              <span
                className="wallet-val"
                style={{ color: "#8b949e", fontSize: "0.75rem" }}
              >
                MAX 100k
              </span>
            </div>

            <div className="xp-track" style={{ backgroundColor: "#1a1a20" }}>
              <div
                className="xp-progress"
                style={{
                  width: `${xpProgressPercent}%`,
                  backgroundColor: "#ffcc00",
                  boxShadow: "0 0 5px #ffcc00",
                }}
              ></div>
            </div>
          </div>
        </div>

        <button
          className="theme-toggle-header inventory-btn"
          onClick={() => setShowInventory(true)}
          title="Инвентарь"
          style={{ marginLeft: '8px' }}
        >
          <img src="/js-mastery/backpack.png" alt="Инвентарь" />
        </button>

      </div>

      <div className="layout-content">
        <Sidebar
          stats={stats}
          currentStack={currentStack}
          setCurrentStack={setCurrentStack}
          showStackMenu={showStackMenu}
          setShowStackMenu={setShowStackMenu}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          expandedModules={expandedModules}
          setExpandedModules={setExpandedModules}
          expandedCards={expandedCards}
          setExpandedCards={setExpandedCards}
          selectedCard={selectedCard}
          setSelectedCard={setSelectedCard}
          showTour={showTour}
          currentTaskId={currentTaskId}
          setCurrentTaskId={setCurrentTaskId}
          tasks={tasks}
          playSound={playSound}
          isCardLocked={isCardLocked}
          getCardLevelReq={gclr}
          handleLvlUp={handleLvlUpHandler}
          handleLvlDown={handleLvlDownHandler}
          STACK_MODULES={STACK_MODULES}
          taskResults={results}
          teoriaTasks={teoriaTasks}
          onTheorySubmit={handleTheorySubmit}
          theoryOpenCard={theoryOpenCard}
          setTheoryOpenCard={setTheoryOpenCard}
          theoryAnswers={theoryAnswers}
          setTheoryAnswers={setTheoryAnswers}
          theoryResults={theoryResults}
          theorySubmitting={theorySubmitting}
          isTheoryLocked={isTheoryLocked}
          getCooldownRemaining={getCooldownRemaining}
        />

        <main className="main-workspace">
          {activeTab === "editor" ? (
            <EditorWorkspace
              displayTask={displayTask}
              currentTask={currentTask}
              code={code}
              setCode={setCode}
              cssCode={cssCode}
              setCssCode={setCssCode}
              ansInput={ansInput}
              setAnsInput={setAnsInput}
              selectedAnswers={selectedAnswers}
              setSelectedAnswers={setSelectedAnswers}
              results={results}
              setResults={setResults}
              isRunning={isRunning}
              showSolution={showSolution}
              setShowSolution={setShowSolution}
              showNotes={showNotes}
              setShowNotes={setShowNotes}
              stats={stats}
              setStats={setStats}
              playSound={playSound}
              formatCode={formatCodeHandler}
              validateCode={validateCodeHandler}
              handleQuickRun={handleQuickRunHandler}
              copyBriefing={copyBriefingHandler}
              triggerAiTask={triggerAiTask}
              aiLoading={aiLoading}
              aiActiveTask={aiActiveTask}
              setAiActiveTask={setAiActiveTask}
              handleClearCard={handleClearCardHandler}
              panelWidth={panelWidth}
              isResizing={isResizing}
              startResizing={startResizing}
          getCardLevelReq={gclr}
              openLayoutPreview={openLayoutPreviewHandler}
              shuffledOptions={shuffledOptions}
              lastPassed={lastPassed}
              aiLimitsAvailable={aiLimitsAvailable}
              choiceTimer={choiceTimer}
              triggerAiFlyer={(amount) => {
                const id = Date.now();
                setAiFlyers((prev) => [...prev, { id, amount }]);
              }}
              triggerXpFlyer={(amount) => {
                const id = Date.now();
                setFlyers((prev) => [...prev, { id, xp: amount }]);
              }}
              teoriaTask={teoriaTask}
              theoryAnswers={
                teoriaTask ? theoryAnswers[teoriaTask.card] || {} : {}
              }
              setTheoryAnswers={setTheoryAnswers}
              onTheorySubmit={handleTheorySubmit}
              theoryResults={theoryResults}
              theorySubmitting={theorySubmitting}
              theoryOpenCard={theoryOpenCard}
              setTheoryOpenCard={setTheoryOpenCard}
              onClearTheoryResults={handleClearTheoryResults}
              isTheoryLocked={isTheoryLocked}
              getCooldownRemaining={getCooldownRemaining}
            />
          ) : (
            <JournalWorkspace
              journalTab={journalTab}
              setJournalTab={setJournalTab}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              sortConfig={sortConfig}
              expandedJournalCards={expandedJournalCards}
              setExpandedJournalCards={setExpandedJournalCards}
              heatmapHoverDate={heatmapHoverDate}
              setHeatmapHoverDate={setHeatmapHoverDate}
              sortedTasks={sortedTasks}
              stats={stats}
              setStats={setStats}
              tasks={tasks}
              achievements={achievements}
              playSound={playSound}
              exportProgress={exportProgress}
              importProgress={importProgress}
              requestSort={requestSort}
              claimAchievement={(ach) =>
                claimAchievement(ach, statsRef.current, setStats, setFlyers, playSound)
              }
              onGoToTask={(taskId) => {
                setCurrentTaskId(taskId);
                setActiveTab("editor");
                playSound("click");
              }}
            />
          )}
        </main>

        <BottomPanel
          displayTask={displayTask}
          handleQuickRun={handleQuickRunHandler}
          validateCode={validateCodeHandler}
          aiActiveTask={aiActiveTask}
          triggerAiTask={triggerAiTask}
          openLayoutPreview={openLayoutPreviewHandler}
          setShowSolution={setShowSolution}
          showSolution={showSolution}
          setShowNotes={setShowNotes}
          showNotes={showNotes}
          formatCode={formatCodeHandler}
          handleClearCardHandler={handleClearCardHandler}
          lastPassed={lastPassed}
          aiLimitsAvailable={aiLimitsAvailable}
          aiLoading={aiLoading}
          currentTask={currentTask}
          stats={stats}
          onToggleTheme={() => setTheme(theme === "default" ? "hacker" : "default")}
          theme={theme}
          isRunning={isRunning}
          playSound={playSound}
          setAiActiveTask={setAiActiveTask}
          setResults={setResults}
          visible={bottomPanelVisible}
          onToggleVisibility={() => setBottomPanelVisible(!bottomPanelVisible)}
        />
      </div>
      {confettiPos && <Confetti x={confettiPos.x} y={confettiPos.y} />}
    </div>
  );
}
export default App;
