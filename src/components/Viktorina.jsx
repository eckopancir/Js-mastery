import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { X, Zap, Clock, CheckCircle, XCircle, Star, Flame } from "lucide-react";
import { quizQuestions, getComboReward, comboRewards, TIMER_DURATION, COMBO_SOUNDS, CATEGORIES } from "../viktorina";
import { playSound } from "../utils/sounds";

const DIFFICULTIES = {
  easy: { name: "easy", time: 10000, xpMult: 0, ticketCost: 0 },
  normal: { name: "normal", time: 5000, xpMult: 1, ticketCost: 2 },
  hard: { name: "hard", time: 3000, xpMult: 3, ticketCost: 3 },
  extreme: { name: "extreme", time: 1500, xpMult: 5, ticketCost: 4 },
};

const Viktorina = ({ isOpen, onClose, setStats, stats, setNotifs, playSound: playUISound }) => {
  const [gameState, setGameState] = useState("idle");
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [usedQuestions, setUsedQuestions] = useState([]);
  const [showDifficulty, setShowDifficulty] = useState(false);
  const [lastWrongAnswer, setLastWrongAnswer] = useState(null);
  const [difficulty, setDifficulty] = useState("easy");
  const [category, setCategory] = useState("js");
  const [showCategory, setShowCategory] = useState(false);
  const [flyingXps, setFlyingXps] = useState([]);
  const uniqueCategories = useMemo(() => {
    const cats = [...new Set(quizQuestions.map(q => q.category))];
    return cats.sort();
  }, []);
  const allCategoriesList = useMemo(() => {
    return [...uniqueCategories, "all"];
  }, [uniqueCategories]);
  const isAllUnlocked = uniqueCategories.length >= 3;
  const timerRef = useRef(null);
  const xpIdCounter = useRef(0);

  const today = new Date().toISOString().split("T")[0];

  const updateViktorinaDailyLog = useCallback((newCombo) => {
    setStats((prev) => {
      const currentLog = prev.viktorinaDailyLog || {};
      const todayLog = currentLog[today] || {
        easy: { achievedAt: null },
        normal: { achievedAt: null },
        hard: { achievedAt: null },
        extreme: { achievedAt: null },
      };
      if (newCombo > 0 && (!todayLog[difficulty]?.achievedAt || newCombo > (todayLog[difficulty]?.achievedAt?.combo || 0))) {
        todayLog[difficulty] = {
          achievedAt: {
            combo: newCombo,
            timestamp: Date.now(),
          },
        };
      }
      return {
        ...prev,
        viktorinaDailyLog: {
          ...currentLog,
          [today]: todayLog,
        },
      };
    });
  }, [today, difficulty]);

  const isAllMode = category === "all";
  const ALL_XP_MULT = 2;

  const getRandomQuestion = useCallback(() => {
    const categoryFilter = category === "all" 
      ? quizQuestions 
      : quizQuestions.filter(q => q.category === category);
    const available = categoryFilter.filter((q) => !usedQuestions.includes(q.id));
    if (available.length === 0) {
      setUsedQuestions([]);
      return categoryFilter[Math.floor(Math.random() * categoryFilter.length)];
    }
    return available[Math.floor(Math.random() * available.length)];
  }, [usedQuestions, category]);

  const startGame = useCallback(() => {
    const inventory = stats?.inventory || [];
    const ticket1Item = inventory.find(item => item.id === "ticket1");
    const ticket1Count = ticket1Item?.count || 0;
    const requiredTickets = isAllMode ? 5 : DIFFICULTIES[difficulty].ticketCost;

    if (ticket1Count < requiredTickets) {
      setNotifs((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "error",
          message: `Нужно ${requiredTickets} билетов для ${isAllMode ? "ALL EXTREME" : DIFFICULTIES[difficulty].name.toUpperCase()}!`,
          color: "#ff4444",
        },
      ]);
      return;
    }

    const newInventory = inventory.map(item =>
      item.id === "ticket1" ? { ...item, count: item.count - requiredTickets } : item
    ).filter(item => item.count > 0);

    setStats((prev) => ({
      ...prev,
      inventory: newInventory,
      ticketsSpent: (prev.ticketsSpent || 0) + requiredTickets,
      viktorinaGamesByDiff: {
        ...prev.viktorinaGamesByDiff,
        [difficulty]: (prev.viktorinaGamesByDiff?.[difficulty] || 0) + 1
      }
    }));

    const q = getRandomQuestion();
    const gameTime = DIFFICULTIES[difficulty].time;
    setCurrentQuestion(q);
    setUsedQuestions([q.id]);
    setGameState("playing");
    setCombo(0);
    setTimeLeft(gameTime);
    setSelectedAnswer(null);
    setShowResult(false);
  }, [getRandomQuestion, difficulty]);

  const endGame = useCallback((wrongAnswer = null) => {
    setLastWrongAnswer(wrongAnswer);
    setGameState("idle");
    if (wrongAnswer) {
      setCurrentQuestion(wrongAnswer);
    }
    setUsedQuestions([]);
    setTimeLeft(DIFFICULTIES[difficulty].time);
    setSelectedAnswer(null);
    setShowResult(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [difficulty]);

  const awardXp = useCallback((xp, fromCombo = false) => {
    const multipliedXp = xp * DIFFICULTIES[difficulty].xpMult * (isAllMode ? ALL_XP_MULT : 1);

    setStats((prev) => {
      const newXp = (prev.xp || 0) + multipliedXp;
      return { ...prev, xp: newXp };
    });
    if (fromCombo) {
      const id = xpIdCounter.current++;
      const startX = Math.random() * 60 + 20;
      const startY = Math.random() * 40 + 30;
      setFlyingXps((prev) => [...prev, { id, xp: multipliedXp, startX, startY }]);
      setTimeout(() => {
        setFlyingXps((prev) => prev.filter((f) => f.id !== id));
      }, 1000);
    }
    setNotifs((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "xp",
        message: `+${multipliedXp} XP`,
        color: "#ffcc00",
      },
    ]);
  }, [setStats, setNotifs, difficulty]);

  const playComboSound = useCallback((comboCount) => {
    if (comboCount % 10 !== 0) return;
    const soundKeys = {
      10: "combo10",
      20: "combo20",
      30: "combo30",
      40: "combo40",
      50: "combo50",
      60: "combo60",
      70: "combo70",
      80: "combo80",
      90: "combo90",
      100: "combo100",
    };
    const soundKey = soundKeys[comboCount];
    if (soundKey && playSound && typeof playSound === "function") {
      playSound(soundKey);
    }
  }, []);

  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0 && !showResult) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 100) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            return 0;
          }
          return prev - 100;
        });
      }, 100);
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [gameState, showResult]);

  useEffect(() => {
    if (gameState === "playing" && timeLeft === 0 && !showResult) {
      setShowResult(true);
      setCombo(0);
      if (playUISound) playUISound("error");
      setTimeout(() => {
        endGame();
      }, 1000);
    }
  }, [timeLeft, gameState, showResult, playUISound, endGame]);

  useEffect(() => {
    if (!isOpen) {
      endGame();
    }
  }, [isOpen]);

  const handleAnswer = useCallback((answer) => {
    if (showResult || !currentQuestion) return;
    
    setSelectedAnswer(answer);
    setShowResult(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const isCorrect = answer === currentQuestion.correct;
    if (isCorrect) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      updateViktorinaDailyLog(newCombo);
      // Обновляем максимальное комбо в статистике
      setStats(prev => ({
        ...prev,
        viktorinaMaxCombo: Math.max(prev.viktorinaMaxCombo || 0, newCombo)
      }));
      const reward = getComboReward(newCombo);
      if (reward > 0) {
        awardXp(reward, true);
      }
      if (COMBO_SOUNDS.includes(newCombo)) {
        playComboSound(newCombo);
      }
      if (playUISound) playUISound("success");
      setTimeout(() => {
        const nextQ = getRandomQuestion();
        setCurrentQuestion(nextQ);
        setUsedQuestions((prev) => [...prev, nextQ.id]);
        setTimeLeft(DIFFICULTIES[difficulty].time);
        setSelectedAnswer(null);
        setShowResult(false);
      }, 800);
    } else {
      setCombo(0);
      updateViktorinaDailyLog(0);
      if (playUISound) playUISound("error");
      setTimeout(() => {
        endGame(currentQuestion);
      }, 1000);
    }
  }, [currentQuestion, combo, showResult, getRandomQuestion, awardXp, playComboSound, playUISound, endGame, updateViktorinaDailyLog]);

  if (!isOpen) return null;

  return (
    <div className="viktorina-overlay" onClick={onClose}>
      <button className="viktorina-close" onClick={onClose}>
        <X size={18} />
      </button>
      
      {gameState === "playing" && currentQuestion && (
        <div className="viktorina-content" onClick={(e) => e.stopPropagation()}>
          <div className="viktorina-combo">
            <Flame size={22} className={`combo-flame ${combo > 0 ? "active" : ""}`} />
            <span className="combo-count">х{combo}</span>
            <span className="combo-label">КОМБО</span>
          </div>
          
          {flyingXps.map((fxp) => (
            <div
              key={fxp.id}
              className="viktorina-flying-xp"
              style={{
                left: `${fxp.startX}%`,
                top: `${fxp.startY}%`,
              }}
            >
              +{fxp.xp}
            </div>
          ))}
          
          <div className="viktorina-timer">
            <Clock size={14} />
            <div className="timer-bar">
              <div 
                className="timer-fill" 
                style={{ 
                  width: `${(timeLeft / DIFFICULTIES[difficulty].time) * 100}%`,
                  backgroundColor: timeLeft < DIFFICULTIES[difficulty].time * 0.3 ? "#ff4444" : "#00ff41"
                }}
              />
            </div>
          </div>
          
          <div className="viktorina-card">
            <div className="viktorina-question">{currentQuestion.question}</div>
            
            <div className="viktorina-answers">
              <button
                className="viktorina-btn true"
                onClick={() => handleAnswer(true)}
                disabled={showResult}
              >
                ПРАВДА
              </button>
              <button
                className="viktorina-btn false"
                onClick={() => handleAnswer(false)}
                disabled={showResult}
              >
                НЕ ПРАВДА
              </button>
            </div>
          </div>
          
          {combo > 0 && combo % 10 === 0 && (
            <div className="viktorina-reward">
              +{getComboReward(combo)} XP
            </div>
          )}
        </div>
      )}
      
      {gameState === "idle" && (
        <div className="viktorina-start" onClick={(e) => e.stopPropagation()}>
          <div className="start-title">ВИКТОРИНА</div>
          <div className="start-desc">
            Отвечай на вопросы за {DIFFICULTIES[difficulty].time / 1000} секунд!<br/>
            Чем больше комбо - тем больше XP!
          </div>
          <div className="difficulty-wrapper">
            <button className="difficulty-toggle" onClick={() => setShowDifficulty(!showDifficulty)}>
              {DIFFICULTIES[difficulty].name.toUpperCase()}
              <Zap size={12} />
            </button>
            {showDifficulty && (
              <div className="difficulty-dropdown">
                {Object.entries(DIFFICULTIES).map(([key, val]) => (
                  <button
                    key={key}
                    className={`difficulty-option ${difficulty === key ? "active" : ""}`}
                    onClick={() => {
                      setDifficulty(key);
                      setShowDifficulty(false);
                    }}
                  >
                    <span className="option-name">{val.name.toUpperCase()}</span>
                    <span className="option-info">{val.time / 1000}s / x{val.xpMult}{val.cost > 0 ? ` / -${val.cost}XP` : ""}</span>
                  </button>
                ))}
              </div>
            )}
            <button className="difficulty-toggle category-toggle" onClick={() => setShowCategory(!showCategory)}>
              {category.toUpperCase()}
              <Zap size={12} />
            </button>
            {showCategory && (
              <div className="difficulty-dropdown category-dropdown">
                {allCategoriesList
                  .filter((cat) => cat === "all" ? isAllUnlocked : true)
                  .map((cat) => (
                    <button
                      key={cat}
                      className={`difficulty-option ${category === cat ? "active" : ""} ${cat === "all" && !isAllUnlocked ? "disabled" : ""}`}
                      onClick={() => {
                        if (cat === "all" && !isAllUnlocked) return;
                        setCategory(cat);
                        setShowCategory(false);
                      }}
                      disabled={cat === "all" && !isAllUnlocked}
                    >
                      <span className="option-name">{cat === "all" ? "ALL" : cat.toUpperCase()}{cat === "all" ? ` (${uniqueCategories.length}+)` : ""}</span>
                    </button>
                  ))}
              </div>
            )}
          </div>
          <button className="start-btn" onClick={startGame}>
            <div className="start-btn-content">
              <Zap size={16} />
              <span>СТАРТ</span>
              <div className="start-btn-ticket">
                <img src="/js-mastery/ticket1.png" alt="ticket" />
                <span>{stats?.inventory?.find(i => i.id === "ticket1")?.count || 0}</span>
              </div>
            </div>
          </button>
          <div className="difficulty-info-bar">
            <span className="diff-name">{isAllMode ? "ALL EXTREME" : DIFFICULTIES[difficulty].name.toUpperCase()}</span>
            <span className="diff-sep">•</span>
            <span className="diff-time">{DIFFICULTIES[difficulty].time / 1000}s</span>
            <span className="diff-sep">•</span>
            <span className="diff-xp">x{Math.round(DIFFICULTIES[difficulty].xpMult * (isAllMode ? ALL_XP_MULT : 1) * 100) / 100} XP</span>
            <span className="diff-sep">•</span>
            <span className="diff-ticket-cost">
              <img src="/js-mastery/ticket1.png" alt="ticket" className="diff-ticket-icon" />
              {isAllMode ? 5 : DIFFICULTIES[difficulty].ticketCost}
            </span>
          </div>
          {lastWrongAnswer && (
            <div className="last-wrong">
              <div className="wrong-label">НЕПРАВИЛЬНО:</div>
              <div className="wrong-question">{lastWrongAnswer.question}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Viktorina;