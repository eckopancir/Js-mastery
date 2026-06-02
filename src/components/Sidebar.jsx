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
  ArrowUpCircle,
  ArrowDownCircle,
  CheckCircle,
  Layers,
  BookOpen,
  Shield,
  TrendingUp,
  Clock,
  Target,
  Flame,
  Award,
  Brain,
  Hash,
  Globe,
  Server,
  Cpu,
} from "lucide-react";
import TheoryBlock from "./TheoryBlock";
import TheoryHeader from "./TheoryHeader";

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
  isCardLocked,
  getCardLevelReq,
  handleLvlUp,
  handleLvlDown,
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
  const [lvlDownCard, setLvlDownCard] = useState(null);
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

  const getCardProgress = () => {
    const cardNames = Object.keys(stats.cardStats || {});
    const totalLevels = cardNames.reduce((sum, cn) => {
      return sum + (stats.cardStats[cn]?.level || 0);
    }, 0);
    return { cards: cardNames.length, levels: totalLevels };
  };

  const cardProgress = getCardProgress();

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
      stacks: [
        { id: "Go", icon: <Cpu size={16} />, label: "Go" },
      ],
    },
  ];



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
        {activeTab === "editor" && sidebarOpen &&
          (STACK_MODULES[currentStack] || ["Default"]).map((moduleName) => {
            const moduleTasks = tasks.filter((t) => {
              if (stats.deletedTaskIds?.includes(t.id)) return false;
              if (t.id >= 10001 && t.id <= 10006 && !showTour) return false;
              if (currentStack !== "All" && t.id < 10000 && t.stack !== currentStack) return false;
              if (t.module === moduleName) return true;
              return (
                !t.module &&
                moduleName === "Основы" &&
                t.stack === "JavaScript" &&
                t.id < 10000
              );
            });

            const cardNames = [
              ...new Set(moduleTasks.filter((t) => t.card).map((t) => t.card)),
            ];
            const nonCardTasks = moduleTasks.filter((t) => !t.card);

            const activeCards = cardNames.filter((cn) => {
              const cs = stats.cardStats[cn];
              return !cs || !cs.hideUntil || cs.hideUntil <= now;
            }).length;
            const lockedCards = cardNames.length - activeCards;

            const isExpanded = expandedModules[moduleName];

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
                      <span className="mod-stat-label">CARDS</span>
                      <span className="mod-stat-val active">{activeCards}</span>
                    </div>
                    {lockedCards > 0 && (
                      <div className="mod-stat">
                        <span className="mod-stat-label">LOCKED</span>
                        <span className="mod-stat-val locked">
                          {lockedCards}
                        </span>
                      </div>
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className={`module-tasks-container stack-switch-enter`}>
                    {cardNames.length > 0
                      ? cardNames.map((cardName) => {
                          const cs = stats.cardStats[cardName] || {
                            level: 1,
                            hideUntil: 0,
                          };
                          const isCardActive =
                            !cs.hideUntil || cs.hideUntil <= now;
                          const isCardExpanded = expandedCards[cardName];
                          const cardTasks = moduleTasks.filter(
                            (t) => t.card === cardName,
                          );
                          const easyTasks = cardTasks.filter(
                            (t) => t.difficulty === "Easy",
                          );
                          const mediumTasks = cardTasks.filter(
                            (t) => t.difficulty === "Medium",
                          );
                          const hardTasks = cardTasks.filter(
                            (t) => t.difficulty === "Hard",
                          );

                          const mediumUnlocked = cs.level >= 2;
                          const hardUnlocked = cs.level >= 3;

                          const isRandom = cs.level >= 4;
                          let randomTasks = [];
                          if (isRandom) {
                            const all = [...cardTasks];
                            const seed = cardName.length * 31 + cs.level;
                            randomTasks = all
                              .sort((a, b) => {
                                const ha = ((a.id * 2654435761) ^ seed) >>> 0;
                                const hb = ((b.id * 2654435761) ^ seed) >>> 0;
                                return ha - hb;
                              })
                              .slice(0, 5);
                          }

                          const easySolved = easyTasks.filter(
                            (t) =>
                              (stats.taskStats[t.id]?.passedCount || 0) > 0,
                          ).length;
                          const mediumSolved = mediumTasks.filter(
                            (t) =>
                              (stats.taskStats[t.id]?.passedCount || 0) > 0,
                          ).length;
                          const hardSolved = hardTasks.filter(
                            (t) =>
                              (stats.taskStats[t.id]?.passedCount || 0) > 0,
                          ).length;

                          let canLvlUp = false;
                          if (cs.level >= 8) canLvlUp = false;
                          else if (cs.level === 1)
                            canLvlUp = easySolved >= easyTasks.length;
                          else if (cs.level === 2)
                            canLvlUp = mediumSolved >= mediumTasks.length;
                          else if (cs.level === 3)
                            canLvlUp = hardSolved >= hardTasks.length;
                          else canLvlUp = true;

                          const lvlClass = cs.level > 8 ? 8 : cs.level;

                          if (!isCardActive) {
                            const remainMs = cs.hideUntil - now;
                            const remainSec = Math.ceil(remainMs / 1000);
                            const remainStr =
                              remainSec > 86400
                                ? `${Math.ceil(remainSec / 86400)}d`
                                : remainSec > 3600
                                  ? `${Math.ceil(remainSec / 3600)}h`
                                  : remainSec > 60
                                    ? `${Math.ceil(remainSec / 60)}m`
                                    : `${remainSec}s`;
                            return (
                              <div
                                key={cardName}
                                className={`card-item card-lvl-${lvlClass} card-locked`}
                              >
                                <div className="card-header-row">
                                  <Lock size={14} className="card-lock-ico" />
                                  <span className="card-name">{cardName}</span>
                                  <span
                                    className="card-ai-badge"
                                    style={{
                                      color: "#a8b2c1",
                                      fontSize: "0.75rem",
                                      marginLeft: "auto",
                                    }}
                                  >
                                    {stats.cardAiPoints?.[cardName] || 0}/
                                    {getCardLevelReq(cs.level).points} AI
                                  </span>
                                  <span className="card-level-badge">
                                    Lvl {cs.level}
                                  </span>
                                </div>
                                <div className="card-cooldown">
                                  Cooldown: {remainStr}
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={cardName}
                              className={`card-item card-lvl-${lvlClass} 
                                ${isCardExpanded ? "card-expanded" : ""} 
                                ${isCardLocked(cardName) ? "card-frozen" : ""}`}
                            >
                              <button
                                className="card-header-btn"
                                disabled={isCardLocked(cardName)}
                                onClick={() => {
                                  if (isCardLocked(cardName)) return;
                                  playSound("click");
                                  setExpandedCards((prev) => ({
                                    ...prev,
                                    [cardName]: !prev[cardName],
                                  }));
                                  setSelectedCard(
                                    isCardExpanded ? null : cardName,
                                  );
                                }}
                              >
                                <div className="card-header-row">
                                  {isCardLocked(cardName) ? (
                                    <Lock
                                      size={14}
                                      style={{
                                        marginRight: "8px",
                                        color: "#ff4b2b",
                                      }}
                                    />
                                  ) : (
                                    <ChevronRight
                                      size={14}
                                      className={`card-chevron ${isCardExpanded ? "rotated" : ""}`}
                                    />
                                  )}

                                  <span className="card-name">{cardName}</span>

                                  {isCardLocked(cardName) ? (
                                    <span
                                      className="card-timer"
                                      style={{
                                        marginLeft: "auto",
                                        fontSize: "0.7rem",
                                        color: "#ff4b2b",
                                      }}
                                    >
                                      {Math.ceil(
                                        (cs.hideUntil - Date.now()) /
                                          (1000 * 60 * 60 * 24),
                                      )}
                                      d LEFT
                                    </span>
                                  ) : (
                                    <span
                                      className="card-ai-badge"
                                      style={{
                                        color: "#a8b2c1",
                                        fontSize: "0.75rem",
                                        marginLeft: "auto",
                                      }}
                                    >
                                      {stats.cardAiPoints?.[cardName] || 0}/
                                      {getCardLevelReq(cs.level).points} AI
                                    </span>
                                  )}

                                  <span className={`card-level-badge${lvlDownCard === cardName ? ' lvl-down-anim' : ''}`}>
                                    Lvl {cs.level}
                                  </span>
                                </div>

                                <div className="card-progress-bar">
                                  <div
                                    className="card-progress-fill"
                                    style={{
                                      width: `${Math.min(100, ((easySolved + mediumSolved + hardSolved) / cardTasks.length) * 100)}%`,
                                      filter: isCardLocked(cardName)
                                        ? "grayscale(1)"
                                        : "none",
                                    }}
                                  ></div>
                                </div>
                              </button>

                              {isCardExpanded && (
                                <div className="card-tasks-panel">
                                  <div className="card-controls">
                                    <button
                                      className="card-ctrl-btn lvl-down"
                                      onClick={() => {
                                        setCurrentTaskId(cardTasks[0]?.id);
                                        setLvlDownCard(cardName);
                                        setTimeout(() => setLvlDownCard(null), 600);
                                        handleLvlDown();
                                      }}
                                      title="LVL DOWN"
                                    >
                                      <ArrowDownCircle size={16} /> LVL DOWN
                                    </button>

                                    <button
                                      className={`card-ctrl-btn lvl-up ${
                                        canLvlUp &&
                                        (stats.cardAiPoints?.[cardName] || 0) >=
                                          getCardLevelReq(cs.level).points
                                          ? "ready"
                                          : "disabled"
                                      }`}
                                      onClick={(e) => {
                                        if (
                                          canLvlUp &&
                                          (stats.cardAiPoints?.[cardName] ||
                                            0) >=
                                            getCardLevelReq(cs.level).points
                                        ) {
                                          setCurrentTaskId(cardTasks[0]?.id);
                                          handleLvlUp(e);
                                        }
                                      }}
                                      title={
                                        !canLvlUp
                                          ? "❌ Сначала решите все задачи\n✅ Нужно: " +
                                            getCardLevelReq(cs.level).points +
                                            " AI Points"
                                          : (stats.cardAiPoints?.[cardName] ||
                                                0) <
                                              getCardLevelReq(cs.level).points
                                            ? `✅ Решено: ${cardTasks.filter(t => stats.completedTasks?.[t.id]).length}/${cardTasks.length} задач\n❌ Нужно: ${getCardLevelReq(cs.level).points} AI Points (${stats.cardAiPoints?.[cardName] || 0}/${getCardLevelReq(cs.level).points})`
                                            : "LVL UP - Нажмите для повышения уровня!"
                                      }
                                    >
                                      <Lock size={16} className="lock-icon" />
                                      <ArrowUpCircle size={16} className="arrow-icon" />
                                      <span className="lvl-up-text">LVL UP</span>
                                    </button>
                                  </div>

                                  {teoriaTasks && (
                                    <TheoryHeader
                                      teoriaTask={teoriaTasks.find(
                                        (t) =>
                                          t.card.toLowerCase() === cardName.toLowerCase() &&
                                          t.module === moduleName &&
                                          t.stack === currentStack,
                                      )}
                                      isOpen={theoryOpenCard === cardName}
                                      onToggle={() => {
                                        playSound("click");
                                        setTheoryOpenCard(
                                          theoryOpenCard === cardName
                                            ? null
                                            : cardName,
                                        );
                                      }}
                                      results={theoryResults[cardName]}
                                      isSubmitting={theorySubmitting}
                                      isTheoryLocked={isTheoryLocked}
                                      getCooldownRemaining={
                                        getCooldownRemaining
                                      }
                                    />
                                  )}

                                  {!isRandom ? (
                                    <>
                                      <div className="tier-section">
                                        <div className="tier-header easy">
                                          EASY ({easySolved}/{easyTasks.length})
                                        </div>
                                        {easyTasks.map((t) => {
                                          const ts =
                                            stats.taskStats[t.id] || {};
                                          return (
                                            <button
                                              key={t.id}
                                              className={`tier-task-btn ${currentTaskId === t.id ? "active" : ""} ${ts.passedCount > 0 ? "solved" : ""}`}
                                              onClick={() => {
                                                playSound("click");
                                                setCurrentTaskId(t.id);
                                              }}
                                            >
                                              <span>{t.title}</span>
                                              {ts.bestTime && (
                                                <span className="task-best-time">
                                                  {Math.floor(ts.bestTime / 60)}
                                                  :
                                                  {String(
                                                    ts.bestTime % 60,
                                                  ).padStart(2, "0")}
                                                </span>
                                              )}
                                              {ts.passedCount > 0 && (
                                                <CheckCircle
                                                  size={12}
                                                  className="task-check"
                                                />
                                              )}
                                            </button>
                                          );
                                        })}
                                      </div>
                                      <div
                                        className={`tier-section ${!mediumUnlocked ? "tier-locked" : ""}`}
                                      >
                                        <div className="tier-header medium">
                                          MEDIUM ({mediumSolved}/
                                          {mediumTasks.length}){" "}
                                          {!mediumUnlocked && (
                                            <Lock size={12} />
                                          )}
                                        </div>
                                        {mediumUnlocked ? (
                                          mediumTasks.map((t) => {
                                            const ts =
                                              stats.taskStats[t.id] || {};
                                            return (
                                              <button
                                                key={t.id}
                                                className={`tier-task-btn ${currentTaskId === t.id ? "active" : ""} ${ts.passedCount > 0 ? "solved" : ""}`}
                                                onClick={() => {
                                                  playSound("click");
                                                  setCurrentTaskId(t.id);
                                                }}
                                              >
                                                <span>{t.title}</span>
                                                {ts.bestTime && (
                                                  <span className="task-best-time">
                                                    {Math.floor(
                                                      ts.bestTime / 60,
                                                    )}
                                                    :
                                                    {String(
                                                      ts.bestTime % 60,
                                                    ).padStart(2, "0")}
                                                  </span>
                                                )}
                                                {ts.passedCount > 0 && (
                                                  <CheckCircle
                                                    size={12}
                                                    className="task-check"
                                                  />
                                                )}
                                              </button>
                                            );
                                          })
                                        ) : (
                                          <div className="tier-lock-msg">
                                            Unlock at Level 2
                                          </div>
                                        )}
                                      </div>
                                      <div
                                        className={`tier-section ${!hardUnlocked ? "tier-locked" : ""}`}
                                      >
                                        <div className="tier-header hard">
                                          HARD ({hardSolved}/{hardTasks.length}){" "}
                                          {!hardUnlocked && <Lock size={12} />}
                                        </div>
                                        {hardUnlocked ? (
                                          hardTasks.map((t) => {
                                            const ts =
                                              stats.taskStats[t.id] || {};
                                            return (
                                              <button
                                                key={t.id}
                                                className={`tier-task-btn ${currentTaskId === t.id ? "active" : ""} ${ts.passedCount > 0 ? "solved" : ""}`}
                                                onClick={() => {
                                                  playSound("click");
                                                  setCurrentTaskId(t.id);
                                                }}
                                              >
                                                <span>{t.title}</span>
                                                {ts.bestTime && (
                                                  <span className="task-best-time">
                                                    {Math.floor(
                                                      ts.bestTime / 60,
                                                    )}
                                                    :
                                                    {String(
                                                      ts.bestTime % 60,
                                                    ).padStart(2, "0")}
                                                  </span>
                                                )}
                                                {ts.passedCount > 0 && (
                                                  <CheckCircle
                                                    size={12}
                                                    className="task-check"
                                                  />
                                                )}
                                              </button>
                                            );
                                          })
                                        ) : (
                                          <div className="tier-lock-msg">
                                            Unlock at Level 3
                                          </div>
                                        )}
                                      </div>
                                    </>
                                  ) : (
                                    <div className="tier-section">
                                      <div className="tier-header random">
                                        RANDOM MIX (5 tasks)
                                      </div>
                                      {randomTasks.map((t) => {
                                        const ts = stats.taskStats[t.id] || {};
                                        return (
                                          <button
                                            key={t.id}
                                            className={`tier-task-btn ${currentTaskId === t.id ? "active" : ""} ${ts.passedCount > 0 ? "solved" : ""}`}
                                            onClick={() => {
                                              playSound("click");
                                              setCurrentTaskId(t.id);
                                            }}
                                          >
                                            <span>{t.title}</span>
                                            <span
                                              className={`f-badge ${t.difficulty.toLowerCase()}`}
                                            >
                                              {t.difficulty}
                                            </span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      : null}

                    {nonCardTasks.length > 0 &&
                      nonCardTasks.map((task) => (
                        <button
                          key={task.id}
                          className={`sidebar-task-btn ${currentTaskId === task.id ? "active" : ""}`}
                          onClick={() => {
                            playSound("click");
                            setCurrentTaskId(task.id);
                          }}
                        >
                          <span className="sidebar-task-title">
                            {task.title}
                          </span>
                          <div className="sidebar-task-meta">
                            <span
                              className={`f-badge ${task.difficulty.toLowerCase()}`}
                            >
                              {task.difficulty}
                            </span>
                          </div>
                        </button>
                      ))}

                    {cardNames.length === 0 && nonCardTasks.length === 0 && (
                      <div className="empty-module-msg">
                        No active missions in this sector.
                      </div>
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
                <Hash size={14} />
                <span>Today's Breakdown</span>
              </div>
              <div className="breakdown-row">
                <span className="diff-easy">EASY</span>
                <div className="diff-bar">
                  <div
                    className="diff-fill easy"
                    style={{
                      width: `${Math.min(100, (todayStats.easy || 0) * 20)}%`,
                    }}
                  />
                </div>
                <span className="diff-count">{todayStats.easy || 0}</span>
              </div>
              <div className="breakdown-row">
                <span className="diff-medium">MEDIUM</span>
                <div className="diff-bar">
                  <div
                    className="diff-fill medium"
                    style={{
                      width: `${Math.min(100, (todayStats.medium || 0) * 20)}%`,
                    }}
                  />
                </div>
                <span className="diff-count">{todayStats.medium || 0}</span>
              </div>
              <div className="breakdown-row">
                <span className="diff-hard">HARD</span>
                <div className="diff-bar">
                  <div
                    className="diff-fill hard"
                    style={{
                      width: `${Math.min(100, (todayStats.hard || 0) * 20)}%`,
                    }}
                  />
                </div>
                <span className="diff-count">{todayStats.hard || 0}</span>
              </div>
            </div>

            <div className="intel-cards">
              <div className="cards-title">
                <Layers size={14} />
                <span>Card Progress</span>
              </div>
              <div className="cards-stats">
                <span>{cardProgress.cards} Cards</span>
                <span className="separator">•</span>
                <span>{cardProgress.levels} Levels</span>
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
