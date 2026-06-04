import React, { useState, useEffect, useRef } from "react";
import {
  Code2,
  Zap,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Terminal,
  List,
  Lock,
  CheckCircle,
  Layers,
  BookOpen,
  Shield,
  Target,
  Flame,
  Award,
  Brain,
  Globe,
  Server,
  Cpu,
  PlayCircle,
  Puzzle,
  Eye,
  Layout,
  Bug,
} from "lucide-react";
import TheoryBlock from "./TheoryBlock";
import TheoryHeader from "./TheoryHeader";

const MODE_CONFIG = {
  code: { label: "CODE", icon: <Code2 size={14} /> },
  "output-predictor": { label: "OUTPUT", icon: <Eye size={14} /> },
  "single-choice": { label: "QUIZ", icon: <Puzzle size={14} /> },
  "multi-choice": { label: "MULTI", icon: <Puzzle size={14} /> },
  "ui-layout": { label: "LAYOUT", icon: <Layout size={14} /> },
  "bug-hunter": { label: "BUGS", icon: <Bug size={14} /> },
};

const DIFF_COLORS = {
  Easy: "#3fb950",
  Medium: "#d29922",
  Hard: "#f85149",
};

const Sidebar = ({
  stats,
  currentStack,
  setCurrentStack,
  showStackMenu,
  setShowStackMenu,
  sidebarOpen,
  setSidebarOpen,
  activeTab,
  setActiveTab,
  expandedModules,
  setExpandedModules,
  expandedCards,
  setExpandedCards,
  selectedCard,
  setSelectedCard,
  showTour,
  currentTaskId,
  setCurrentTaskId,
  tasks,
  playSound,
  STACK_MODULES,
  taskResults,
  teoriaTasks,
  onTheorySubmit,
  theoryOpenCard,
  setTheoryOpenCard,
  theoryAnswers,
  setTheoryAnswers,
  theoryResults,
  theorySubmitting,
  isTheoryLocked,
  getCooldownRemaining,
}) => {
  const [stackAnimKey, setStackAnimKey] = useState(0);
  const prevStackRef = useRef(currentStack);
  useEffect(() => {
    if (prevStackRef.current !== currentStack) {
      prevStackRef.current = currentStack;
      setStackAnimKey((k) => k + 1);
    }
  }, [currentStack]);
  const now = Date.now();

  const getTodayStats = () => {
    const today = new Date().toISOString().split("T")[0];
    const log = stats.dailyLog?.[today];
    if (!log) return { solved: 0, easy: 0, medium: 0, hard: 0, xp: 0 };
    return {
      solved: log.solved || 0,
      easy: log.breakdown?.Easy || log.breakdown?.easy || 0,
      medium: log.breakdown?.Medium || log.breakdown?.medium || 0,
      hard: log.breakdown?.Hard || log.breakdown?.hard || 0,
      xp: log.xp || 0,
    };
  };

  const todayStats = getTodayStats();

  const getStreak = () => {
    const days = Object.keys(stats.dailyLog || {})
      .sort()
      .reverse();
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < days.length; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split("T")[0];
      if (days.includes(dateStr) && stats.dailyLog[dateStr]?.solved > 0) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  };

  const streak = getStreak();

  const getTotalSolved = () => {
    return Object.values(stats.taskStats || {}).filter((t) => t.passedCount > 0)
      .length;
  };

  const totalSolved = getTotalSolved();

  const CHAPTER_STACKS = [
    {
      name: "Frontend",
      icon: <Globe size={16} />,
      stacks: [
        { id: "JavaScript", icon: <Code2 size={16} />, label: "JavaScript" },
        { id: "TypeScript", icon: <Shield size={16} />, label: "TypeScript" },
        { id: "React", icon: <Layers size={16} />, label: "React.js" },
        { id: "Layout", icon: <BookOpen size={16} />, label: "Layout & CSS" },
        { id: "Git", icon: <Zap size={16} />, label: "Git & DevOps" },
      ],
    },
    {
      name: "Backend",
      icon: <Server size={16} />,
      stacks: [{ id: "Go", icon: <Cpu size={16} />, label: "Go" }],
    },
  ];

  const isTaskSolved = (t) => (stats.taskStats?.[t.id]?.passedCount || 0) > 0;
  const isTaskCooldown = (t) => {
    const ts = stats.taskStats?.[t.id];
    if (!ts || !ts.passedCount) return false;
    if (ts.cooldownUntil && ts.cooldownUntil > now) return true;
    return false;
  };

  const renderTaskItem = (t) => {
    const solved = isTaskSolved(t);
    const cooldown = isTaskCooldown(t);
    const isActive = currentTaskId === t.id;
    const diffColor = DIFF_COLORS[t.difficulty] || DIFF_COLORS.Easy;

    return (
      <button
        key={t.id}
        className={`mode-task-item ${isActive ? "active" : ""} ${solved ? "solved" : ""} ${cooldown ? "cooldown" : ""}`}
        onClick={() => {
          if (cooldown) return;
          playSound("click");
          setCurrentTaskId(t.id);
        }}
        disabled={cooldown}
      >
        <div className="task-diff-vert" style={{ color: diffColor }}>
          {(t.difficulty || "E").charAt(0)}
        </div>
        <div className="task-info-col">
          <span className="task-title-text">{t.title}</span>
        </div>
        <div className="task-status-col">
          {cooldown && <Lock size={12} className="task-lock-ico" />}
          {solved && !cooldown && (
            <CheckCircle size={12} className="task-check-ico" />
          )}
        </div>
      </button>
    );
  };

  return (
    <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        {sidebarOpen && (
          <div
            className="logo-wrap"
            onClick={() => setShowStackMenu(!showStackMenu)}
          >
            <div className="logo">
              <Code2 strokeWidth={3} />
              <span>{currentStack}</span>{" "}
              <Zap size={14} className="logo-spark" />
            </div>
            {showStackMenu && (
              <div className="stack-selector-menu">
                {CHAPTER_STACKS.map((chapter) => (
                  <div key={chapter.name} className="chapter-group">
                    <div className="chapter-group-header">
                      {chapter.icon}
                      <span>{chapter.name}</span>
                    </div>
                    {chapter.stacks.map((s) => (
                      <div
                        key={s.id}
                        className={`stack-opt ${currentStack === s.id ? "active" : ""}`}
                        onClick={() => {
                          setCurrentStack(s.id);
                          setShowStackMenu(false);
                          playSound("click");
                        }}
                      >
                        {s.icon} <span>{s.label}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <button
          className="collapse-btn"
          onClick={() => {
            playSound("click");
            setSidebarOpen(!sidebarOpen);
          }}
        >
          {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
        </button>
      </div>

      <div className="sidebar-nav">
        <button
          className={`nav-btn-academy ${activeTab === "editor" ? "active" : ""}`}
          onClick={() => {
            playSound("click");
            setActiveTab("editor");
          }}
        >
          <Terminal size={18} />
          <span>Academy</span>
        </button>
        <button
          className={`nav-btn-intelligence ${activeTab === "journal" ? "active" : ""}`}
          onClick={() => {
            playSound("click");
            setActiveTab("journal");
          }}
        >
          <List size={18} />
          <span>Intelligence</span>
        </button>
      </div>

      <div className="task-sidebar-list">
        {activeTab === "editor" &&
          sidebarOpen &&
          (STACK_MODULES[currentStack] || ["Default"]).map((moduleName) => {
            const moduleTasks = tasks.filter((t) => {
              if (stats.deletedTaskIds?.includes(t.id)) return false;
              if (t.id >= 10001 && t.id <= 10006 && !showTour) return false;
              if (currentStack !== "All" && t.id < 10000 && t.stack !== currentStack)
                return false;
              if (t.module === moduleName) return true;
              return (
                !t.module &&
                moduleName === "Основы" &&
                t.stack === "JavaScript" &&
                t.id < 10000
              );
            });

            if (moduleTasks.length === 0) return null;

            const isExpanded = expandedModules[moduleName];

            const solvedInModule = moduleTasks.filter((t) => isTaskSolved(t)).length;

            return (
              <div key={moduleName} className="module-group">
                <button
                  className={`module-header ${isExpanded ? "expanded" : ""}`}
                  onClick={() => {
                    playSound("click");
                    setExpandedModules((prev) => ({
                      ...prev,
                      [moduleName]: !prev[moduleName],
                    }));
                  }}
                >
                  <div className="module-title-wrap">
                    <ChevronRight size={16} className="module-chevron" />
                    <h4>{moduleName}</h4>
                  </div>
                  <div className="module-stats">
                    <div className="mod-stat">
                      <span className="mod-stat-val">{solvedInModule}/{moduleTasks.length}</span>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="module-tasks-container stack-switch-enter">
                    {(() => {
                      const modeGroups = {};
                      moduleTasks.forEach((t) => {
                        const mode = t.mode || "code";
                        if (!modeGroups[mode]) modeGroups[mode] = [];
                        modeGroups[mode].push(t);
                      });

                      const sortedModes = Object.keys(modeGroups).sort((a, b) => {
                        const order = ["code", "single-choice", "multi-choice", "output-predictor", "ui-layout", "bug-hunter"];
                        return order.indexOf(a) - order.indexOf(b);
                      });

                      return sortedModes.map((mode) => {
                        const modeTasks = modeGroups[mode];
                        const cfg = MODE_CONFIG[mode] || { label: mode.toUpperCase(), icon: <Code2 size={14} /> };
                        const modeSolved = modeTasks.filter((t) => isTaskSolved(t)).length;
                        const modeCooldown = modeTasks.filter((t) => isTaskCooldown(t)).length;
                        const modeAvailable = modeTasks.length - modeCooldown;
                        const modeKey = `${moduleName}-mode-${mode}`;
                        const modeExpanded = expandedCards[modeKey];

                        return (
                          <div key={mode} className="mode-group">
                            <button
                              className={`mode-group-header ${modeExpanded ? "expanded" : ""}`}
                              onClick={() => {
                                playSound("click");
                                setExpandedCards((prev) => ({
                                  ...prev,
                                  [modeKey]: !prev[modeKey],
                                }));
                              }}
                            >
                              <div className="mode-header-left">
                                <ChevronRight size={14} className={`mode-chevron ${modeExpanded ? "rotated" : ""}`} />
                                {cfg.icon}
                                <span className="mode-label">{cfg.label}</span>
                              </div>
                              <div className="mode-header-right">
                                <span className="mode-count available">{modeAvailable}</span>
                                {modeCooldown > 0 && (
                                  <span className="mode-count cooldown">
                                    <Lock size={10} /> {modeCooldown}
                                  </span>
                                )}
                                <span className="mode-count solved">{modeSolved}/{modeTasks.length}</span>
                              </div>
                            </button>

                            {modeExpanded && (
                              <div className="mode-tasks-list">
                                {modeTasks.map((t) => renderTaskItem(t))}
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}

                    {teoriaTasks && (
                      <TheoryHeader
                        teoriaTask={teoriaTasks.find(
                          (t) =>
                            t.module === moduleName && t.stack === currentStack,
                        )}
                        isOpen={theoryOpenCard === moduleName}
                        onToggle={() => {
                          playSound("click");
                          setTheoryOpenCard(
                            theoryOpenCard === moduleName ? null : moduleName,
                          );
                        }}
                        results={theoryResults[moduleName]}
                        isSubmitting={theorySubmitting}
                        isTheoryLocked={isTheoryLocked}
                        getCooldownRemaining={getCooldownRemaining}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}

        {activeTab === "journal" && (
          <div className="intelligence-panel">
            <div className="intel-header">
              <Brain size={20} />
              <span>MISSION CONTROL</span>
            </div>

            <div className="intel-grid">
              <div className="intel-card today">
                <div className="intel-card-icon">
                  <Target size={18} />
                </div>
                <div className="intel-card-content">
                  <span className="intel-value">{todayStats.solved}</span>
                  <span className="intel-label">Solved Today</span>
                </div>
              </div>

              <div className="intel-card streak">
                <div className="intel-card-icon">
                  <Flame size={18} />
                </div>
                <div className="intel-card-content">
                  <span className="intel-value">{streak}</span>
                  <span className="intel-label">Day Streak</span>
                </div>
              </div>

              <div className="intel-card total">
                <div className="intel-card-icon">
                  <CheckCircle size={18} />
                </div>
                <div className="intel-card-content">
                  <span className="intel-value">{totalSolved}</span>
                  <span className="intel-label">Total Solved</span>
                </div>
              </div>

              <div className="intel-card xp">
                <div className="intel-card-icon">
                  <Zap size={18} />
                </div>
                <div className="intel-card-content">
                  <span className="intel-value">{stats.xp || 0}</span>
                  <span className="intel-label">Total XP</span>
                </div>
              </div>
            </div>

            <div className="intel-breakdown">
              <div className="breakdown-title">
                <span>Today's Breakdown</span>
              </div>
              <div className="breakdown-row">
                <span className="diff-easy">EASY</span>
                <div className="diff-bar">
                  <div
                    className="diff-fill easy"
                    style={{ width: `${Math.min(100, (todayStats.easy || 0) * 20)}%` }}
                  />
                </div>
                <span className="diff-count">{todayStats.easy || 0}</span>
              </div>
              <div className="breakdown-row">
                <span className="diff-medium">MEDIUM</span>
                <div className="diff-bar">
                  <div
                    className="diff-fill medium"
                    style={{ width: `${Math.min(100, (todayStats.medium || 0) * 20)}%` }}
                  />
                </div>
                <span className="diff-count">{todayStats.medium || 0}</span>
              </div>
              <div className="breakdown-row">
                <span className="diff-hard">HARD</span>
                <div className="diff-bar">
                  <div
                    className="diff-fill hard"
                    style={{ width: `${Math.min(100, (todayStats.hard || 0) * 20)}%` }}
                  />
                </div>
                <span className="diff-count">{todayStats.hard || 0}</span>
              </div>
            </div>

            {streak >= 7 && (
              <div className="intel-badge achievement">
                <Award size={16} />
                <span>🔥 {streak} DAY STREAK!</span>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
