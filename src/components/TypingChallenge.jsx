import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { X, Zap, CheckCircle, ArrowLeft, Play, Timer, Trophy, AlertCircle } from "lucide-react";
import Editor from "@monaco-editor/react";
import { typingTasks, categories, getRandomTask } from "../typingChallenge";
import "./typingChallenge.css";

const xpSound = new Audio("/js-mastery/src/sound/aliensignal.wav");

const TypingChallenge = ({ isOpen, onClose, setStats, stats, setNotifs, playSound: playUISound }) => {
    const inventory = stats?.inventory || [];
    const ticket2Item = inventory.find(item => item.id === "ticket2");
    const ticket2Count = ticket2Item?.count || 0;

    const [gameState, setGameState] = useState("select");
    const [selectedTask, setSelectedTask] = useState(null);
    const [previewTask, setPreviewTask] = useState(null);
    const [viewTimeLeft, setViewTimeLeft] = useState(0);
    const [typingTimeLeft, setTypingTimeLeft] = useState(0);
    const [totalTime, setTotalTime] = useState(0);
    const [userInput, setUserInput] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [results, setResults] = useState(null);

    // Cooldown helpers
    const getCooldownInfo = useCallback((taskId) => {
        const cooldowns = stats?.typingCooldowns || {};
        const taskCooldown = cooldowns[taskId];
        if (!taskCooldown) return null;

        const cooldownDays = 2 * Math.pow(2, taskCooldown.completedCount - 1); // 2,4,8,16,32
        const cooldownMs = cooldownDays * 24 * 60 * 60 * 1000;
        const now = Date.now();
        const endTime = taskCooldown.lastCompleted + cooldownMs;

        if (now >= endTime) {
            setStats(prev => {
                const newCooldowns = { ...prev.typingCooldowns };
                delete newCooldowns[taskId];
                return { ...prev, typingCooldowns: newCooldowns };
            });
            return null;
        }

        const remaining = endTime - now;
        const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
        const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

        return { days, hours, endTime, cooldownDays };
    }, [stats, setStats]);

    const isTaskInCooldown = useCallback((taskId) => {
        return getCooldownInfo(taskId) !== null;
    }, [getCooldownInfo]);

    const timerRef = useRef(null);
    const editorRef = useRef(null);
    const typingTimeLeftRef = useRef(typingTimeLeft);
    useEffect(() => { typingTimeLeftRef.current = typingTimeLeft; }, [typingTimeLeft]);

    const filteredTasks = useMemo(() => {
        if (categoryFilter === "all") return typingTasks;
        return typingTasks.filter(t => t.category === categoryFilter);
    }, [categoryFilter]);

    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const goToSelect = useCallback(() => {
        stopTimer();
        setGameState("select");
        setSelectedTask(null);
        setPreviewTask(null);
        setUserInput("");
        setResults(null);
        setViewTimeLeft(0);
        setTypingTimeLeft(0);
        setTotalTime(0);
    }, [stopTimer]);

    const startViewPhase = useCallback((task) => {
        if (isTaskInCooldown(task.id)) {
            const info = getCooldownInfo(task.id);
            setNotifs((prev) => [
                ...prev,
                {
                    id: Date.now(),
                    type: "error",
                    message: `Задача в кулдауне: ${info.days}д ${info.hours}ч`,
                    color: "#ff4444",
                },
            ]);
            return;
        }

        const inventory = stats?.inventory || [];
        const ticket2Item = inventory.find(item => item.id === "ticket2");
        const ticket2Count = ticket2Item?.count || 0;

        if (ticket2Count < 1) {
            setNotifs((prev) => [
                ...prev,
                {
                    id: Date.now(),
                    type: "error",
                    message: "Нужен билет Typing Challenge!",
                    color: "#ff4444",
                },
            ]);
            return;
        }

        const newInventory = inventory.map(item =>
            item.id === "ticket2" ? { ...item, count: item.count - 1 } : item
        ).filter(item => item.count > 0);

        setStats((prev) => ({ ...prev, inventory: newInventory }));

        stopTimer();
        setSelectedTask(task);
        setViewTimeLeft(0);
        setUserInput("");
        setResults(null);
        setGameState("viewSolution");
    }, [stopTimer, stats, setStats, setNotifs, isTaskInCooldown, getCooldownInfo]);

    const startTypingPhase = useCallback((task) => {
        stopTimer();

        const codeLength = (task.code || "").length;
        const calculatedTime = Math.max(codeLength, 60);

        setTotalTime(calculatedTime);
        setTypingTimeLeft(calculatedTime);
        setUserInput("");
        setResults(null);
        setGameState("typing");

        setTimeout(() => {
            if (editorRef.current) {
                editorRef.current.focus();
            }
        }, 100);

        const now = Date.now();
        timerRef.current = setInterval(() => {
            setTypingTimeLeft(prev => {
                if (prev <= 1) {
                    stopTimer();
                    finishTyping(task, calculatedTime);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [stopTimer]);

    const finishTyping = useCallback((task, allocatedTime) => {
        const timeUsed = allocatedTime - typingTimeLeftRef.current;

        let allPassed = true;
        const testResults = [];

        try {
            const fn = new Function(userInput + '\nreturn ' + task.code.match(/function\s+(\w+)/)?.[1] || '');
            const userFn = fn();

            for (const test of task.tests || []) {
                try {
                    const result = userFn(...test.params);
                    const passed = JSON.stringify(result) === JSON.stringify(test.expected);
                    testResults.push({ ...test, result, passed });
                    if (!passed) allPassed = false;
                } catch (e) {
                    testResults.push({ ...test, result: 'Error: ' + e.message, passed: false });
                    allPassed = false;
                }
            }
        } catch (e) {
            testResults.push({ error: 'Ошибка выполнения: ' + e.message, passed: false });
            allPassed = false;
        }

        // XP calculation
        const codeLength = (task.code || "").length;
        const diff = (task.difficulty || "").toLowerCase();
        const baseXP = { easy: 10, medium: 20, hard: 30 }[diff] || 10;
        const lengthBonus = Math.floor(codeLength / 100);
        const timeBonus = timeUsed <= allocatedTime ? 5 : 0;
        const speedBonus = timeUsed < allocatedTime
            ? Math.min(9, Math.floor((allocatedTime - timeUsed) / allocatedTime * 10))
            : 0;
        const xpGained = allPassed ? (baseXP + lengthBonus + timeBonus + speedBonus) : 0;

        const taskResults = {
            passed: allPassed,
            timeUsed,
            allocatedTime,
            testResults,
            taskDifficulty: task.difficulty,
            xpGained,
            xpDetails: { baseXP, lengthBonus, timeBonus, speedBonus, codeLength }
        };

        setResults(taskResults);
        setGameState("result");

        if (allPassed) {
            // Play XP sound
            xpSound.currentTime = 0;
            xpSound.play().catch(() => {});

            setStats(prev => {
                const inventory = prev.inventory || [];
                const ticket2Item = inventory.find(item => item.id === "ticket2");
                let newInventory;
                if (!ticket2Item) {
                    newInventory = [...inventory, { id: "ticket2", count: 20, name: "Typing Ticket", image: "ticket2.png" }];
                } else {
                    newInventory = inventory;
                }

                // Update cooldown
                const cooldowns = prev.typingCooldowns || {};
                const existing = cooldowns[task.id];
                const newCooldowns = {
                    ...cooldowns,
                    [task.id]: {
                        lastCompleted: Date.now(),
                        completedCount: existing ? existing.completedCount + 1 : 1,
                    }
                };

                return {
                    ...prev,
                    typingCompleted: (prev.typingCompleted || 0) + 1,
                    typingPerfectCount: (prev.typingPerfectCount || 0) + 1,
                    typingMaxWpm: Math.max(prev.typingMaxWpm || 0, Math.round((userInput.length / 5) / (timeUsed / 60) || 0)),
                    typingMaxAccuracy: Math.max(prev.typingMaxAccuracy || 0, 100),
                    xp: (prev.xp || 0) + xpGained,
                    inventory: newInventory,
                    typingCooldowns: newCooldowns,
                };
            });

            if (playUISound) {
                playUISound("success");
            }
        }
    }, [userInput, typingTimeLeft, setStats, playUISound]);

    const getTimerColor = () => {
        if (typingTimeLeft <= 0) return "#ef4444";
        const ratio = typingTimeLeft / totalTime;
        if (ratio > 0.5) return "#22c55e";
        if (ratio > 0.2) return "#f59e0b";
        return "#ef4444";
    };

    if (!isOpen) return null;

    return (
        <div className="typing-modal-overlay">
            <div className="typing-modal">
                <button className="typing-close-btn" onClick={onClose}>
                    <X size={18} />
                </button>

                {/* SELECT STATE */}
                {gameState === "select" && (
                    <div className="typing-select-view">
                        <div className="typing-header">
                            <h2>Typing Challenge</h2>
                            <div className="typing-ticket-count">
                                <img src="/js-mastery/ticket2.png" alt="ticket" style={{ width: 14, height: 14 }} />
                                <span>Тикеты: {ticket2Count}</span>
                            </div>
                        </div>

                        <div className="typing-filters">
                            <button
                                className={`typing-filter-btn ${categoryFilter === "all" ? "active" : ""}`}
                                onClick={() => setCategoryFilter("all")}
                            >
                                Все ({typingTasks.length})
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    className={`typing-filter-btn ${categoryFilter === cat ? "active" : ""}`}
                                    onClick={() => setCategoryFilter(cat)}
                                >
                                    {cat} ({typingTasks.filter(t => t.category === cat).length})
                                </button>
                            ))}
                        </div>

                        <div className="typing-task-list">
                            {filteredTasks.map(task => {
                                const cooldownInfo = getCooldownInfo(task.id);
                                const inCooldown = cooldownInfo !== null;
                                return (
                                    <div
                                        key={task.id}
                                        className={`typing-task-card ${previewTask?.id === task.id ? 'selected' : ''} ${inCooldown ? 'cooldown' : ''}`}
                                        onClick={() => !inCooldown && setPreviewTask(task)}
                                    >
                                        {inCooldown && (
                                            <div className="typing-cooldown-overlay">
                                                <div className="typing-cooldown-text">
                                                    <Timer size={16} />
                                                    <span>{cooldownInfo.days}д {cooldownInfo.hours}ч</span>
                                                </div>
                                            </div>
                                        )}
                                        <div className="typing-task-header">
                                            <span className="typing-task-title">{task.title}</span>
                                            <span className={`typing-difficulty ${task.difficulty?.toLowerCase()}`}>
                                                {task.difficulty}
                                            </span>
                                        </div>
                                        <div className="typing-task-category">{task.category}</div>
                                        <div className="typing-task-xp">
                                            Base: {task.difficulty === 'easy' ? 10 : task.difficulty === 'medium' ? 20 : 30} XP
                                            +{Math.floor((task.code?.length || 0) / 100)}/100chars
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {previewTask && (
                            <div className="typing-preview-section">
                                <h3>{previewTask.title}</h3>
                                <p className="typing-theory">{previewTask.theory}</p>
                                <div className="typing-preview-buttons">
                                    <button
                                        className="typing-back-btn"
                                        onClick={() => setPreviewTask(null)}
                                    >
                                        <ArrowLeft size={14} />
                                        Назад
                                    </button>
                                    <button
                                        className="ready-btn"
                                        onClick={() => startViewPhase(previewTask)}
                                    >
                                        <Play size={14} />
                                        Начать
                                    </button>
                                </div>
                            </div>
                        )}

                        {!previewTask && (
                            <div className="typing-random-section">
                                <button
                                    className="typing-random-btn"
                                    onClick={() => {
                                        const randomTask = getRandomTask();
                                        if (randomTask) startViewPhase(randomTask);
                                    }}
                                >
                                    <Zap size={16} />
                                    Случайная задача
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* VIEW SOLUTION STATE */}
                {gameState === "viewSolution" && selectedTask && (
                    <div className="typing-view-solution">
                        <div className="typing-header">
                            <h2>{selectedTask.title}</h2>
                            <span className={`typing-difficulty ${selectedTask.difficulty?.toLowerCase()}`}>
                                {selectedTask.difficulty}
                            </span>
                        </div>
                        <p className="typing-theory">{selectedTask.theory}</p>
                        <div className="typing-code-preview">
                            <Editor
                                height="200px"
                                language="javascript"
                                theme="vs-dark"
                                value={selectedTask.code}
                                options={{
                                    readOnly: true,
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    lineNumbers: "on",
                                    scrollBeyondLastLine: false,
                                    wordWrap: "on",
                                    tabSize: 2,
                                    renderLineHighlight: "none",
                                    selectionHighlight: false,
                                    cursorStyle: "none",
                                    hideCursorInOverviewRuler: true,
                                    overviewRulerLanes: 0,
                                    scrollbar: { vertical: "hidden", horizontal: "hidden" },
                                    folding: false,
                                    lineDecorationsWidth: 0,
                                    lineNumbersMinChars: 3,
                                    glyphMargin: false,
                                }}
                            />
                        </div>
                        <div className="typing-preview-buttons">
                            <button className="typing-back-btn" onClick={goToSelect}>
                                <ArrowLeft size={14} />
                                Назад
                            </button>
                            <button
                                className="ready-btn"
                                onClick={() => startTypingPhase(selectedTask)}
                            >
                                <Play size={14} />
                                Я готов, начать ввод!
                            </button>
                        </div>
                    </div>
                )}

                {/* TYPING STATE */}
                {gameState === "typing" && selectedTask && (
                    <div className="typing-typing-view">
                        <div className="typing-typing-header">
                            <h3>{selectedTask.title}</h3>
                            <div className="typing-timer" style={{ color: getTimerColor() }}>
                                <Timer size={14} />
                                <span>{typingTimeLeft}c</span>
                            </div>
                        </div>

                        <div className="typing-editor-container">
                            <Editor
                                height="300px"
                                defaultLanguage="javascript"
                                theme="vs-dark"
                                value={userInput}
                                onChange={(val) => setUserInput(val || "")}
                                onMount={(editor) => { editorRef.current = editor; }}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    lineNumbers: "on",
                                    scrollBeyondLastLine: false,
                                    wordWrap: "on",
                                    tabSize: 2,
                                }}
                            />
                        </div>

                        <div className="typing-tests-section">
                            <h4>Тесты:</h4>
                            <div className="typing-tests-list">
                                {selectedTask.tests?.map((test, idx) => (
                                    <div key={idx} className="typing-test-item">
                                        <span className="typing-test-input">Вход: {JSON.stringify(test.params)}</span>
                                        <span className="typing-test-expected">Выход: {JSON.stringify(test.expected)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="typing-typing-footer">
                            <div className="typing-stats">
                                <span>Time: {typingTimeLeft}c</span>
                            </div>
                            <div className="typing-action-buttons">
                                <button className="typing-back-btn" onClick={goToSelect}>
                                    <ArrowLeft size={14} />
                                    Назад
                                </button>
                                <button className="ready-btn" onClick={() => finishTyping(selectedTask, totalTime)}>
                                    <Play size={14} />
                                    Проверить
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* RESULT STATE */}
                {gameState === "result" && results && (
                    <div className="typing-result-view">
                        <div className="typing-result-header">
                            <h2>{results.passed ? "Challenge Complete!" : "Challenge Failed"}</h2>
                            {results.passed ? (
                                <CheckCircle size={24} color="#22c55e" />
                            ) : (
                                <AlertCircle size={24} color="#ef4444" />
                            )}
                        </div>

                        <div className="typing-result-stats">
                            <div className="result-stat">
                                <span className="stat-label">Time Used</span>
                                <span className="stat-value">{results.timeUsed}s</span>
                            </div>
                            <div className="result-stat">
                                <span className="stat-label">Tests</span>
                                <span className="stat-value">
                                    {results.testResults?.filter(t => t.passed).length || 0}/{results.testResults?.length || 0}
                                </span>
                            </div>
                            {results.passed && (
                                <div className="result-stat">
                                    <span className="stat-label">XP Gained</span>
                                    <span className="stat-value">{results.xpGained || 0}</span>
                                </div>
                            )}
                        </div>

                        {results.passed && results.xpDetails && (
                            <div className="typing-xp-breakdown">
                                <h4>XP Breakdown:</h4>
                                <div className="xp-item">
                                    <span>Base ({results.taskDifficulty})</span>
                                    <span>+{results.xpDetails.baseXP} XP</span>
                                </div>
                                <div className="xp-item">
                                    <span>Length bonus ({results.xpDetails.codeLength} chars)</span>
                                    <span>+{results.xpDetails.lengthBonus} XP</span>
                                </div>
                                {results.xpDetails.timeBonus > 0 && (
                                    <div className="xp-item">
                                        <span>Time bonus (within timer)</span>
                                        <span>+{results.xpDetails.timeBonus} XP</span>
                                    </div>
                                )}
                                {results.xpDetails.speedBonus > 0 && (
                                    <div className="xp-item">
                                        <span>Speed bonus (faster than timer)</span>
                                        <span>+{results.xpDetails.speedBonus} XP</span>
                                    </div>
                                )}
                                <div className="xp-total">
                                    <span>Total</span>
                                    <span>+{results.xpGained} XP</span>
                                </div>
                            </div>
                        )}

                        <div className="typing-test-results">
                            {results.testResults?.map((test, idx) => (
                                <div key={idx} className={`typing-test-result-item ${test.passed ? 'passed' : 'failed'}`}>
                                    <span>Вход: {JSON.stringify(test.params)}</span>
                                    <span>Ожидалось: {JSON.stringify(test.expected)}</span>
                                    <span>Получено: {JSON.stringify(test.result)}</span>
                                    {test.passed ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                                </div>
                            ))}
                        </div>

                        {results.passed && (
                            <div className="typing-result-actions">
                                <button
                                    className="ready-btn"
                                    onClick={() => {
                                        setNotifs(prev => [
                                            ...prev,
                                            {
                                                id: `typing-${Date.now()}`,
                                                title: "TYPING CHALLENGE",
                                                desc: `+${results.xpGained} XP | Task completed`,
                                                icon: <Trophy size={16} color="#ffd700" />,
                                                popupId: Date.now(),
                                            }
                                        ]);
                                        goToSelect();
                                    }}
                                >
                                    <Trophy size={14} />
                                    Continue
                                </button>
                            </div>
                        )}

                        {!results.passed && (
                            <div className="typing-result-actions">
                                <button className="typing-back-btn" onClick={() => startTypingPhase(selectedTask)}>
                                    <ArrowLeft size={14} />
                                    Try Again
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TypingChallenge;
