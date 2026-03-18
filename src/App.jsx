import React, { useState, useEffect, useMemo, useRef } from 'react';
import Editor from '@monaco-editor/react';
import {
    Play, CheckCircle, XCircle, ChevronLeft, ChevronRight,
    Trophy, Code2, Layers, BookOpen, ArrowUpCircle, ArrowDownCircle,
    Tag, Terminal, Clock, Eye, List, BarChart2, Calendar, Lock, Search, Filter,
    Sparkles, Award, Zap, Wand2
} from 'lucide-react';
import { tasks } from './tasks';
import { playSound } from './utils/sounds';
import prettier from 'prettier/standalone';
import * as parserBabel from 'prettier/plugins/babel';
import * as estree from 'prettier/plugins/estree';
import { achievements } from './achievements.jsx';

const ONBOARDING_STEPS = [
    { title: "Welcome Commander!", text: "JS Mastery is your elite training ground. Let's begin the deep dive.", target: ".logo" },
    { title: "Tutorial Path", text: "I've unlocked 6 specialized training missions. They are separate from regular tasks.", target: ".task-sidebar-list" },
    { title: "MISSION 1: Logic", text: "Task ID: -1. In Code Mode, you write pure JavaScript. Your goal is to make the function return 100.", target: ".problem-info", triggerTaskId: -1 },
    { title: "Neural Link", text: "Agent hint: I'm injecting 'return 100;' into the editor now. Watch!", target: ".editor-area", autoSolve: { type: 'code', val: "function getLevel() {\n  return 100;\n}" } },
    { title: "Validation Protocol", text: "Click RUN to send your code to the test runner.", target: ".action-btn.run", requireAction: "run" },
    { title: "System Feedback", text: "Results are ready. All green? Excellent.", target: ".validation-panel" },
    { title: "Commit Phase", text: "Status: All Clear. Now click LVL UP to finalize and gain XP.", target: ".action-btn.up", requireAction: "lvlup" },

    { title: "MISSION 2: Choice", text: "Tutorial 2: Single-choice. Analysis of code usually yields one definitive answer.", target: ".sidebar-nav", triggerTaskId: -2 },
    { title: "Option Selection", text: "I've pre-selected the correct answer for this tutorial. Note the green highlight.", target: ".choice-grid", autoSolve: { type: 'choice', val: "3 (Easy, Medium, Hard)" } },
    { title: "Validation", text: "Confirm the choice with the RUN command.", target: ".action-btn.run", requireAction: "run" },
    { title: "Neural Sync", text: "Synchronize current progress via LVL UP.", target: ".action-btn.up", requireAction: "lvlup" },

    { title: "MISSION 3: Predictor", text: "Tutorial 3: Predicted Output. You must calculate the result of the console.log without execution.", target: ".sidebar-nav", triggerTaskId: -3 },
    { title: "Mental Calculation", text: "Agent calculation complete: Output is 10. Filing data in the input box.", target: ".predictor-ans", autoSolve: { type: 'input', val: "10" } },
    { title: "Verification", text: "Initiate RUN sequence.", target: ".action-btn.run", requireAction: "run" },
    { title: "Evolution", text: "Click LVL UP.", target: ".action-btn.up", requireAction: "lvlup" },

    { title: "MISSION 4: Bug Hunter", text: "Tutorial 4: Scanning for anomalies. Click the line that contains the syntax error.", target: ".sidebar-nav", triggerTaskId: -4 },
    { title: "Target Locked", text: "Scanner detected missing quote on Line 2. Highlighted for you.", target: ".bug-hunter-code", autoSolve: { type: 'bug', val: "2" } },
    { title: "Validation", text: "Press RUN.", target: ".action-btn.run", requireAction: "run" },
    { title: "Promotion", text: "Click LVL UP.", target: ".action-btn.up", requireAction: "lvlup" },

    { title: "MISSION 5: UI Layout", text: "Tutorial 5: Frontend Interface. You can edit CSS styles to match the visual requirement.", target: ".sidebar-nav", triggerTaskId: -5 },
    { title: "Style Override", text: "Watch closely: I'm updating the CSS Stylesheet to set the background to red.", target: ".style-box", autoSolve: { type: 'css', val: ".box { background: red; }" } },
    { title: "Validation", text: "Click RUN.", target: ".action-btn.run", requireAction: "run" },
    { title: "Frontend Pass", text: "Click LVL UP.", target: ".action-btn.up", requireAction: "lvlup" },

    { title: "MISSION 6: Multi-Ops", text: "Final Tutorial: Select all technical features you've just learned.", target: ".sidebar-nav", triggerTaskId: -6 },
    { title: "Full System Check", text: "Checking all operational units: Code, Heatmap, Achievements, Sound.", target: ".choice-grid", autoSolve: { type: 'multi', val: ["Code Editor", "Heatmap", "Achievements", "Sound Effects"] } },
    { title: "Total RUN", text: "Press RUN for the final time.", target: ".action-btn.run", requireAction: "run" },
    { title: "Completion Sync", text: "Press LVL UP to finish your basic training.", target: ".action-btn.up", requireAction: "lvlup" },

    { title: "Intelligence Hub", text: "Excellent, Recruit. Now switch to 'Intelligence' to review your permanent records.", target: ".nav-btn-intelligence", requireAction: "switch-journal" },
    { title: "Tactical Database", text: "Search and filter through historical missions. Your progress is immortalized here.", target: ".db-search" },
    { title: "Analysis Grid", text: "The Heatmap shows your training intensity over the last 30 days.", target: ".heatmap-section" },
    { title: "Global Achievements", text: "Review 100+ legendary milestones. Earn XP by completing them all.", target: ".achievement-section" },
    { title: "Ready for Launch", text: "Basic training concluded. Return to Academy and start your real career. Good luck!", target: ".nav-btn-academy", requireAction: "switch-academy" }
];

const OnboardingTour = ({ step, onNext, onSkip, tourSkipForever, activeTab, isResultsOk }) => {
    const s = ONBOARDING_STEPS[step];
    if (!s) return null;

    let canGoNext = true;
    let nextLabel = "Next Step";

    if (s.requireAction === "switch-journal" && activeTab !== "journal") canGoNext = false;
    if (s.requireAction === "switch-academy" && activeTab !== "editor") canGoNext = false;
    if (s.requireAction === "run" && !isResultsOk) canGoNext = false;
    if (s.requireAction === "lvlup") canGoNext = false;

    if (step === ONBOARDING_STEPS.length - 1) nextLabel = "Start My Journey";

    return (
        <div className="onboarding-overlay">
            <div className="onboarding-card">
                <div className="onboarding-header">
                    <h3>{s.title}</h3>
                    <span className="step-counter">{step + 1} / {ONBOARDING_STEPS.length}</span>
                </div>
                <p>{s.text}</p>
                {s.autoSolve && <div className="tour-hint" style={{ color: 'var(--blue-color)', fontSize: '0.8rem', marginTop: '-10px', marginBottom: '15px' }}>⚡ Agent is assisting with neural link data...</div>}
                <div className="onboarding-footer">
                    <label className="skip-forever">
                        <input type="checkbox" checked={tourSkipForever} onChange={(e) => onSkip(e.target.checked)} />
                        Don't show again
                    </label>
                    {canGoNext && (
                        <button onClick={() => onNext()} className="next-btn pulse-anim">
                            {nextLabel}
                        </button>
                    )}
                </div>
            </div>
            <div className="spotlight-focus" id="spotlight" style={{ display: 'none' }}></div>
        </div>
    );
};

// Animation Component for flying XP numbers
const XpFlyer = ({ xp, onComplete }) => {
    return (
        <div className="xp-flyer" onAnimationEnd={onComplete}>
            +{xp} XP
        </div>
    );
};

const AchievementPopup = ({ achievement, onComplete }) => {
    return (
        <div className="achievement-popup" onAnimationEnd={onComplete}>
            <div className="pop-icon"><Sparkles size={24} /></div>
            <div className="pop-info">
                <strong>Achievement Unlocked!</strong>
                <span>{achievement.title} (+{achievement.reward} XP)</span>
            </div>
        </div>
    );
};

function App() {
    const [stats, setStats] = useState(() => {
        const saved = localStorage.getItem('js_mastery_stats_v3');
        const base = saved ? JSON.parse(saved) : { xp: 0, taskStats: {}, dailyLog: {}, unlockedAchievements: [], formatCount: 0 };
        if (!base.deletedTaskIds) base.deletedTaskIds = [];
        if (!base.customOrder) {
            base.customOrder = tasks.map(t => t.id);
        } else {
            // Ensure tutorial tasks (-1 to -6) are present if the user had previous stats
            const tutIds = tasks.filter(t => t.id < 0).map(t => t.id);
            const missingTut = tutIds.filter(id => !base.customOrder.includes(id));
            if (missingTut.length > 0) base.customOrder = [...missingTut, ...base.customOrder];
        }
        if (!base.unlockedAchievements) base.unlockedAchievements = [];
        if (base.formatCount === undefined) base.formatCount = 0;
        return base;
    });

    const [currentTaskId, setCurrentTaskId] = useState(() => {
        return !localStorage.getItem('js_mastery_onboarding_hide') ? -1 : 1;
    });

    const [activeTab, setActiveTab] = useState('editor'); // editor | journal
    const [journalTab, setJournalTab] = useState('tasks'); // tasks | stats
    const [code, setCode] = useState('');
    const [results, setResults] = useState(null);

    const currentTask = tasks.find(t => t.id === currentTaskId) || tasks[0];
    const taskProgress = (stats.taskStats && stats.taskStats[currentTask.id]) || { level: 0, passedCount: 0, failedCount: 0, hideUntil: 0 };
    const lastPassed = results?.allPassed || taskProgress.passedCount > 0;

    const [cssCode, setCssCode] = useState('');
    const [ansInput, setAnsInput] = useState(''); // Separate input for predictor mode
    const [selectedAnswers, setSelectedAnswers] = useState([]); // For choice/bug modes
    const [isRunning, setIsRunning] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showSolution, setShowSolution] = useState(false);

    // XP Flyers state
    const [flyers, setFlyers] = useState([]);

    // Onboarding Tour state
    const [showTour, setShowTour] = useState(() => !localStorage.getItem('js_mastery_onboarding_hide'));
    const [tourStep, setTourStep] = useState(0);
    const [tourSkipForever, setTourSkipForever] = useState(true);

    // Achievement Notification state
    const [notifs, setNotifs] = useState([]);

    // Journal Sorting & Search
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'level', direction: 'desc' });

    const [draggedTaskId, setDraggedTaskId] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOverZone, setDragOverZone] = useState(null); // 'trash' | 'move-end' | null

    const xpConfig = { Easy: 10, Medium: 25, Hard: 50 };
    const currentLevel = Math.floor(stats.xp / 100);
    const progressPercent = stats.xp % 100;

    const checkAchievements = () => {
        // Используем функциональное обновление, чтобы всегда иметь актуальный state
        setStats(prev => {
            const newUnlocks = [];
            let xpGain = 0;

            achievements.forEach(ach => {
                // Проверяем, не разблокировано ли уже и проходит ли условие
                if (!prev.unlockedAchievements.includes(ach.id) && ach.check(prev, tasks)) {
                    newUnlocks.push(ach);
                    xpGain += ach.reward;
                }
            });

            if (newUnlocks.length === 0) return prev; // Ничего не меняем

            // Если есть новые ачивки:
            setNotifs(n => [...n, ...newUnlocks.map(a => ({ ...a, popupId: Date.now() + Math.random() }))]);
            playSound('levelUp');

            return {
                ...prev,
                xp: prev.xp + xpGain,
                unlockedAchievements: [...prev.unlockedAchievements, ...newUnlocks.map(a => a.id)]
            };
        });
    };

    const calculateHeatmap = () => {
        const days = [];
        for (let i = 0; i < 35; i++) {
            const d = new Date();
            d.setDate(d.getDate() - (34 - i));
            const iso = d.toISOString().split('T')[0];
            const activity = stats.dailyLog[iso]?.xp || 0;
            days.push({ date: iso, intensity: activity > 100 ? 4 : activity > 50 ? 3 : activity > 20 ? 2 : activity > 0 ? 1 : 0 });
        }
        return days;
    };

    useEffect(() => {
        localStorage.setItem('js_mastery_stats_v3', JSON.stringify(stats));
    }, [stats]);

    useEffect(() => {
        setCode(currentTask.initialCode || '');
        setCssCode(currentTask.initialCss || '');
        setAnsInput('');
        setSelectedAnswers([]);
        setResults(null);
        setShowSolution(false);
    }, [currentTaskId]);

    const visibleTasks = useMemo(() => {
        const ordered = [...tasks].sort((a, b) => {
            const idxA = stats.customOrder.indexOf(a.id);
            const idxB = stats.customOrder.indexOf(b.id);
            return (idxA === -1 ? 9999 : idxA) - (idxB === -1 ? 9999 : idxB);
        });

        // Hide tutorial tasks when tour is off
        return ordered
            .filter(t => {
                // Tutorial tasks (-1 to -6) are ALWAYS visible if tour is ON
                if (t.id < 0) return showTour;

                if (stats.deletedTaskIds?.includes(t.id)) return false;
                const prog = stats.taskStats[t.id];
                return !prog?.hideUntil || Date.now() > prog.hideUntil;
            })
            .slice(0, 10);
    }, [stats, showTour]);

    useEffect(() => {
        if (!showTour) return;
        const s = ONBOARDING_STEPS[tourStep];

        // Auto-solve logic for tutorial modes
        if (s.autoSolve) {
            const { type, val } = s.autoSolve;
            if (type === 'code') setCode(val);
            if (type === 'css') setCssCode(val);
            if (type === 'input') setAnsInput(val);
            if (type === 'choice') setSelectedAnswers([val]);
            if (type === 'multi') setSelectedAnswers(val);
            if (type === 'bug') setSelectedAnswers([val]);
        }

        // Monitoring for step progression via actions
        if (s.requireAction === "switch-journal" && activeTab === "journal") handleTourNext();
        if (s.requireAction === "switch-academy" && activeTab === "editor") handleTourNext();
        if (s.requireAction === "run" && results?.allPassed) handleTourNext();

        const el = document.querySelector(s.target);
        const spotlight = document.getElementById('spotlight');
        if (el && spotlight) {
            const rect = el.getBoundingClientRect();
            spotlight.style.display = 'block';
            spotlight.style.width = `${rect.width + 10}px`;
            spotlight.style.height = `${rect.height + 10}px`;
            spotlight.style.top = `${rect.top - 5 + window.scrollY}px`;
            spotlight.style.left = `${rect.left - 5 + window.scrollX}px`;

            // Pulse the element if it requires action
            if (s.requireAction) el.classList.add('pulse-anim');
            else document.querySelectorAll('.pulse-anim').forEach(node => node !== el && node.classList.remove('pulse-anim'));

            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (spotlight) {
            spotlight.style.display = 'none';
        }

        return () => {
            if (el) el.classList.remove('pulse-anim');
        };
    }, [tourStep, showTour, activeTab, results, currentTaskId]);

    const handleTourNext = () => {
        if (tourStep === ONBOARDING_STEPS.length - 1) {
            if (tourSkipForever) localStorage.setItem('js_mastery_onboarding_hide', 'true');
            setShowTour(false);
        } else {
            const nextStep = tourStep + 1;
            const nextS = ONBOARDING_STEPS[nextStep];
            if (nextS.triggerTaskId) setCurrentTaskId(nextS.triggerTaskId);
            setTourStep(nextStep);
            playSound('click');
        }
    };

    const handleLvlUp = () => {
        playSound('levelUp');
        const points = xpConfig[currentTask.difficulty];
        const today = new Date().toISOString().split('T')[0];
        const newLvl = taskProgress.level + 1;
        const hideDays = Math.pow(2, newLvl - 1);
        const hideUntil = Date.now() + hideDays * 86400000;

        // Trigger Flying XP Animation
        const flyerId = Date.now();
        setFlyers(prev => [...prev, { id: flyerId, xp: points }]);

        setStats(prev => {
            const daily = prev.dailyLog[today] || { xp: 0, solved: 0, failed: 0, breakdown: { Easy: 0, Medium: 0, Hard: 0 } };
            const currentBreakdown = daily.breakdown || { Easy: 0, Medium: 0, Hard: 0 };

            // Progress tour if locked on LVL UP
            if (showTour && ONBOARDING_STEPS[tourStep]?.requireAction === "lvlup") {
                handleTourNext();
            }

            return {
                ...prev,
                xp: prev.xp + points,
                taskStats: {
                    ...prev.taskStats,
                    [currentTask.id]: { ...taskProgress, level: newLvl, hideUntil, passedCount: (taskProgress.passedCount || 0) + 1 }
                },
                dailyLog: {
                    ...prev.dailyLog,
                    [today]: {
                        ...daily,
                        xp: daily.xp + points,
                        solved: daily.solved + 1,
                        breakdown: {
                            ...currentBreakdown,
                            [currentTask.difficulty]: (currentBreakdown[currentTask.difficulty] || 0) + 1
                        }
                    }
                }
            };
        });

        // Auto-switch to next task after slight delay
        setTimeout(() => {
            if (!showTour) {
                const next = visibleTasks.find(t => t.id !== currentTask.id);
                if (next) setCurrentTaskId(next.id);
            }
            checkAchievements();
        }, 800);
    };

    const handleLvlDown = () => {
        playSound('levelDown');
        setStats(prev => ({
            ...prev,
            taskStats: {
                ...prev.taskStats,
                [currentTask.id]: { ...taskProgress, level: Math.max(0, taskProgress.level - 1), hideUntil: 0 }
            }
        }));
    };

    const formatCode = async () => {
        try {
            const formatted = await prettier.format(code, {
                parser: "babel",
                plugins: [parserBabel, estree],
                semi: true,
                singleQuote: true
            });
            if (typeof formatted === 'string') {
                setCode(formatted);
                playSound('click');
                setStats(prev => ({ ...prev, formatCount: (prev.formatCount || 0) + 1 }));
                setTimeout(checkAchievements, 100);
            }
        } catch (err) {
            console.error("Format error:", err);
        }
    };

    const validateCode = () => {
        playSound('run');
        setIsRunning(true);
        let allPassed = false;
        let testResults = [];

        if (currentTask.mode === 'output-predictor') {
            const cleanInput = ansInput.trim().replace(/\s/g, '');
            const cleanExpected = (currentTask.expectedOutput || '').replace(/\s/g, '');
            allPassed = cleanInput === cleanExpected;
            testResults = [{ passed: allPassed, actual: ansInput }];
            finishValidation(allPassed, testResults);
        } else if (currentTask.mode === 'ui-layout') {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            const doc = iframe.contentDocument;
            doc.body.innerHTML = currentTask.initialHtml;
            const style = doc.createElement('style');
            style.textContent = cssCode;
            doc.head.appendChild(style);

            testResults = currentTask.validationSelectors.map(test => {
                const el = doc.querySelector(test.selector);
                if (!el) return { passed: false, error: 'Element missing' };
                const val = window.getComputedStyle(el).getPropertyValue(test.property);
                const passed = test.expected.startsWith('contains:')
                    ? val.includes(test.expected.replace('contains:', ''))
                    : val === test.expected;
                return { passed, actual: val, expected: test.expected };
            });

            allPassed = testResults.every(r => r.passed);
            document.body.removeChild(iframe);
            finishValidation(allPassed, testResults);
        } else if (currentTask.mode === 'single-choice' || currentTask.mode === 'multi-choice' || currentTask.mode === 'bug-hunter') {
            const userAns = [...selectedAnswers].sort();
            const correctAns = Array.isArray(currentTask.correctAnswer)
                ? [...currentTask.correctAnswer].sort()
                : [currentTask.correctAnswer];
            allPassed = userAns.length === correctAns.length && userAns.every((v, i) => String(v) === String(correctAns[i]));
            testResults = [{ passed: allPassed, actual: selectedAnswers.join(', ') }];
            finishValidation(allPassed, testResults);
        } else {
            const worker = new Worker(new URL('./runner.worker.js', import.meta.url), { type: 'module' });
            worker.postMessage({ code, tests: currentTask.tests, testTemplate: currentTask.testTemplate });
            worker.onmessage = (e) => {
                const payload = e.data;
                if (payload.type === 'RESULTS') {
                    finishValidation(payload.allPassed, payload.testResults);
                } else if (payload.type === 'ERROR') {
                    setResults({ globalError: payload.message });
                    setIsRunning(false);
                }
                worker.terminate();
            };
        }
    };

    const finishValidation = (allPassed, testResults) => {
        setResults({ allPassed, testResults });
        setIsRunning(false);
        // Log success/fail count but DON'T award XP yet
        setStats(prev => ({
            ...prev,
            taskStats: {
                ...prev.taskStats,
                [currentTask.id]: {
                    ...taskProgress,
                    passedCount: (taskProgress.passedCount || 0) + (allPassed ? 1 : 0),
                    failedCount: (taskProgress.failedCount || 0) + (allPassed ? 0 : 1)
                }
            }
        }));
    };

    const handleDragStart = (id) => {
        setDraggedTaskId(id);
        setIsDragging(true);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDropOnTrash = (e) => {
        e.preventDefault();
        if (!draggedTaskId) return;
        playSound('delete');
        setStats(prev => ({
            ...prev,
            deletedTaskIds: [...(prev.deletedTaskIds || []), draggedTaskId]
        }));
        if (currentTaskId === draggedTaskId) {
            const next = visibleTasks.find(t => t.id !== draggedTaskId);
            if (next) setCurrentTaskId(next.id);
        }
        setIsDragging(false);
        setDraggedTaskId(null);
        setDragOverZone(null);
    };

    const handleDropOnEnd = (e) => {
        e.preventDefault();
        if (!draggedTaskId) return;
        playSound('moveEnd');
        setStats(prev => {
            const filteredOrder = prev.customOrder.filter(id => id !== draggedTaskId);
            return {
                ...prev,
                customOrder: [...filteredOrder, draggedTaskId]
            };
        });
        setIsDragging(false);
        setDraggedTaskId(null);
        setDragOverZone(null);
    };

    const sortedTasks = useMemo(() => {
        let list = tasks.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));

        return list.sort((a, b) => {
            const stA = stats.taskStats[a.id] || { level: 0 };
            const stB = stats.taskStats[b.id] || { level: 0 };

            let valA = a[sortConfig.key] ?? stA[sortConfig.key];
            let valB = b[sortConfig.key] ?? stB[sortConfig.key];

            if (sortConfig.key === 'level') { valA = stA.level; valB = stB.level; }
            if (sortConfig.key === 'success') { valA = stA.passedCount; valB = stB.passedCount; }

            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [tasks, stats, searchTerm, sortConfig]);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    return (
        <div className="app-container v3-polished">
            {/* Flight XP Layer */}
            {flyers.map(f => (
                <XpFlyer key={f.id} xp={f.xp} onComplete={() => setFlyers(prev => prev.filter(x => x.id !== f.id))} />
            ))}

            {/* Achievement Notifications */}
            <div className="notif-container">
                {notifs.map(n => (
                    <AchievementPopup key={n.popupId} achievement={n} onComplete={() => setNotifs(prev => prev.filter(x => x.popupId !== n.popupId))} />
                ))}
            </div>

            {/* Onboarding Tour */}
            {showTour && <OnboardingTour
                step={tourStep}
                onNext={handleTourNext}
                onSkip={setTourSkipForever}
                tourSkipForever={tourSkipForever}
                activeTab={activeTab}
                isResultsOk={results?.allPassed}
            />}

            {/* Dynamic Header XP Bar */}
            <div className="xp-sticky-header">
                <div className="lvl-shield">Lvl {currentLevel}</div>
                <div className="xp-track">
                    <div className="xp-progress" style={{ width: `${progressPercent}%` }}>
                        <div className="xp-glow-line"></div>
                    </div>
                </div>
                <div className="xp-counter"><strong>{stats.xp}</strong> Total Mastery Points</div>
            </div>

            <div className="layout-content">
                <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                    <div className="sidebar-header">
                        {sidebarOpen && <div className="logo"><Code2 strokeWidth={3} /><span>JS Mastery</span></div>}
                        <button className="collapse-btn" onClick={() => { playSound('click'); setSidebarOpen(!sidebarOpen); }}>
                            {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
                        </button>
                    </div>

                    <div className="sidebar-nav">
                        <button className={`nav-btn-academy ${activeTab === 'editor' ? 'active' : ''}`} onClick={() => { playSound('click'); setActiveTab('editor'); }}><Terminal size={18} /><span>Academy</span></button>
                        <button className={`nav-btn-intelligence ${activeTab === 'journal' ? 'active' : ''}`} onClick={() => { playSound('click'); setActiveTab('journal'); }}><List size={18} /><span>Intelligence</span></button>
                    </div>

                    <div className="task-sidebar-list">
                        {activeTab === 'editor' && visibleTasks.map(task => {
                            const taskLvl = stats.taskStats[task.id]?.level || 0;
                            return (
                                <button
                                    key={task.id}
                                    className={`sidebar-task-btn ${currentTaskId === task.id ? 'active' : ''}`}
                                    onClick={() => { playSound('click'); setCurrentTaskId(task.id); }}
                                    draggable="true"
                                    onDragStart={() => handleDragStart(task.id)}
                                    onDragEnd={() => { setIsDragging(false); setDragOverZone(null); }}
                                >
                                    <span className="sidebar-task-title">{task.title}</span>
                                    <div className="sidebar-task-meta">
                                        <span className={`f-badge ${task.difficulty.toLowerCase()}`}>{task.difficulty}</span>
                                        <span className="f-lvl">Lvl {taskLvl}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {isDragging && (
                        <div className="drag-zones">
                            <div
                                className={`drag-zone trash ${dragOverZone === 'trash' ? 'hovered' : ''}`}
                                onDragOver={(e) => { handleDragOver(e); setDragOverZone('trash'); }}
                                onDragLeave={() => setDragOverZone(null)}
                                onDrop={handleDropOnTrash}
                            >
                                <XCircle size={20} /> Trash Bin
                            </div>
                            <div
                                className={`drag-zone move-end ${dragOverZone === 'move-end' ? 'hovered' : ''}`}
                                onDragOver={(e) => { handleDragOver(e); setDragOverZone('move-end'); }}
                                onDragLeave={() => setDragOverZone(null)}
                                onDrop={handleDropOnEnd}
                            >
                                <ArrowDownCircle size={20} /> Move to End
                            </div>
                        </div>
                    )}
                </aside>

                <main className="main-workspace">
                    {activeTab === 'editor' ? (
                        <div className="editor-workspace">
                            <header className="problem-header">
                                <div className="problem-info">
                                    <div className="problem-headers"><span className="p-tag">{currentTask.topic}</span><span className="p-tag stack">{currentTask.stack}</span></div>
                                    <h1>{currentTask.title}</h1>
                                    <p className="desc-text">{currentTask.description}</p>
                                </div>
                                <div className="problem-actions">
                                    <button className="action-btn solution" onClick={() => { playSound('click'); setShowSolution(!showSolution); }}><Eye size={18} /> Solution</button>
                                    <button className="action-btn down" onClick={handleLvlDown}><ArrowDownCircle size={18} /> LVL DOWN</button>
                                    {currentTask.mode === 'code' && (
                                        <button className="action-btn" onClick={formatCode} title="Format Code"><Wand2 size={18} /></button>
                                    )}
                                    <button className="action-btn run" onClick={validateCode} disabled={isRunning}>{isRunning ? 'Checking' : <Play size={18} />}</button>
                                    <button className="action-btn up highlight" onClick={handleLvlUp} disabled={!results?.allPassed && !lastPassed}><ArrowUpCircle size={18} /> LVL UP</button>
                                </div>
                            </header>

                            <div className="editor-split">
                                <div className="editor-area">
                                    {currentTask.mode === 'ui-layout' ? (
                                        <div className="ui-editor-grid">
                                            <div className="editor-box">
                                                <div className="box-label">HTML (Source)</div>
                                                <Editor height="160px" defaultLanguage="html" theme="vs-dark" value={currentTask.initialHtml} options={{ readOnly: true, minimap: { enabled: false } }} />
                                            </div>
                                            <div className="editor-box style-box">
                                                <div className="box-label">CSS Stylesheet</div>
                                                <Editor height="100%" defaultLanguage="css" theme="vs-dark" value={cssCode} onChange={setCssCode} options={{ minimap: { enabled: false } }} />
                                            </div>
                                        </div>
                                    ) : currentTask.mode === 'output-predictor' ? (
                                        <div className="ui-editor-grid">
                                            <div className="editor-box">
                                                <div className="box-label">Static Code</div>
                                                <Editor height="220px" defaultLanguage="javascript" theme="vs-dark" value={currentTask.initialCode} options={{ readOnly: true, minimap: { enabled: false } }} />
                                            </div>
                                            <div className="editor-box ans-input-box">
                                                <div className="box-label">Predict Output Here</div>
                                                <textarea className="predictor-ans" placeholder='Enter the output exactly...' value={ansInput} onChange={e => setAnsInput(e.target.value)} />
                                            </div>
                                        </div>
                                    ) : (currentTask.mode === 'single-choice' || currentTask.mode === 'multi-choice') ? (
                                        <div className="choice-container">
                                            <div className="choice-grid">
                                                {currentTask.options.map((opt, i) => (
                                                    <button
                                                        key={i}
                                                        className={`choice-card ${selectedAnswers.includes(opt) ? 'selected' : ''}`}
                                                        onClick={() => {
                                                            playSound('click');
                                                            if (currentTask.mode === 'single-choice') setSelectedAnswers([opt]);
                                                            else setSelectedAnswers(prev => prev.includes(opt) ? prev.filter(v => v !== opt) : [...prev, opt]);
                                                        }}
                                                    >
                                                        <div className="choice-check">{selectedAnswers.includes(opt) && <CheckCircle size={16} />}</div>
                                                        <div className="choice-text">{opt}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ) : currentTask.mode === 'bug-hunter' ? (
                                        <div className="bug-hunter-container">
                                            <div className="bug-hunter-code">
                                                {currentTask.initialCode.split('\n').map((line, i) => {
                                                    const parts = line.split(':');
                                                    const lineNum = parts[0].trim();
                                                    const lineContent = parts.slice(1).join(':');
                                                    return (
                                                        <div
                                                            key={i}
                                                            className={`bug-line ${selectedAnswers.includes(lineNum) ? 'selected' : ''}`}
                                                            onClick={() => {
                                                                playSound('click');
                                                                setSelectedAnswers(prev => prev.includes(lineNum) ? prev.filter(v => v !== lineNum) : [...prev, lineNum]);
                                                            }}
                                                        >
                                                            <span className="line-num-label">{lineNum}</span>
                                                            <span className="line-text-content">{lineContent}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        <Editor height="100%" defaultLanguage="javascript" theme="vs-dark" value={code} onChange={setCode} options={{ fontSize: 15, minimap: { enabled: false } }} />
                                    )}

                                    {showSolution && (
                                        <div className="solution-modal-overlay">
                                            <div className="solution-modal">
                                                <h3><Lock size={18} /> Solution Explorer</h3>
                                                <pre className="sol-code">{currentTask.solution}</pre>
                                                <button className="sol-close" onClick={() => { playSound('click'); setShowSolution(false); }}>Return to Task</button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="validation-panel">
                                    <div className="panel-title"><Layers size={16} /> System Response</div>
                                    <div className="panel-body">
                                        {results ? (
                                            <div className={`status-summary ${results.allPassed ? 'ok' : 'err'}`}>
                                                {results.allPassed ? <Trophy className="pop" /> : <XCircle />}
                                                <div>
                                                    <strong>{results.allPassed ? 'Validation Passed' : 'Validation Failed'}</strong>
                                                    <p>{results.allPassed ? 'Click LVL UP to collect XP' : 'Mismatch detected in output/logic'}</p>
                                                </div>
                                            </div>
                                        ) : <div className="panel-idle"><BookOpen size={64} /><p>Run script to analyze results</p></div>}

                                        {results?.testResults?.map((t, idx) => (
                                            <div key={idx} className={`test-entry ${t.passed ? 'yes' : 'no'}`}>
                                                <div className="test-v-line"></div>
                                                <div className="test-content">
                                                    <span>Test Case #{idx + 1}</span>
                                                    <code>Output: {JSON.stringify(t.actual)}</code>
                                                </div>
                                            </div>
                                        ))}
                                        {results?.globalError && <div className="runtime-err">{results.globalError}</div>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="journal-workspace">
                            <div className="journal-header">
                                <div>
                                    <h1>Training Intelligence</h1>
                                    <p>Comprehensive task database and historical logs</p>
                                </div>
                                <div className="journal-switcher">
                                    <button className={journalTab === 'tasks' ? 'on' : ''} onClick={() => { playSound('click'); setJournalTab('tasks'); }}><List size={18} /> Database</button>
                                    <button className={journalTab === 'stats' ? 'on' : ''} onClick={() => { playSound('click'); setJournalTab('stats'); }}><BarChart2 size={18} /> Analysis</button>
                                </div>
                            </div>

                            {journalTab === 'tasks' ? (
                                <div className="journal-db">
                                    <div className="db-search">
                                        <Search size={18} />
                                        <input type="text" placeholder="Global search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                                    </div>
                                    <div className="db-scroll-body">
                                        <table className="f-table">
                                            <thead>
                                                <tr>
                                                    <th onClick={() => requestSort('title')}>Product {sortConfig.key === 'title' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
                                                    <th onClick={() => requestSort('topic')}>Module</th>
                                                    <th onClick={() => requestSort('level')}>Level</th>
                                                    <th onClick={() => requestSort('success')}>Score</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sortedTasks.map(t => {
                                                    const p = stats.taskStats[t.id] || { level: 0, passedCount: 0, failedCount: 0, hideUntil: 0 };
                                                    const hidden = p.hideUntil > Date.now();
                                                    return (
                                                        <tr key={t.id}>
                                                            <td><div className="t-name"><strong>{t.title}</strong><span className={t.difficulty.toLowerCase()}>{t.difficulty}</span></div></td>
                                                            <td><span className="m-tag">{t.topic}</span></td>
                                                            <td><div className="l-pill">Lvl {p.level}</div></td>
                                                            <td><div className="score-wrap"><span className="g">{p.passedCount}</span>/<span className="r">{p.failedCount}</span></div></td>
                                                            <td>{hidden ? <span className="s-tag hidden">Locked ({Math.round((p.hideUntil - Date.now()) / 3600000)}h)</span> : <span className="s-tag ready">Active</span>}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="journal-stats">
                                    <div className="stats-header">
                                        <div className="heatmap-section">
                                            <h3><Calendar size={18} /> Activity Intensity</h3>
                                            <div className="heatmap-grid">
                                                {calculateHeatmap().map((day, i) => (
                                                    <div key={i} className={`heat-cell level-${day.intensity}`} title={`${day.date}: ${day.intensity} intensity`}></div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="achievement-section">
                                            <h3><Award size={18} /> Mastery Milestones ({stats.unlockedAchievements.length} / {achievements.length})</h3>
                                            <div className="achievement-grid-scroll">
                                                {achievements.map(ach => {
                                                    const unlocked = stats.unlockedAchievements.includes(ach.id);
                                                    return (
                                                        <div key={ach.id} className={`ach-card ${unlocked ? 'unlocked' : 'locked'}`}>
                                                            <div className="ach-icon">{unlocked ? <Sparkles className="sparkle-anim" /> : ach.icon}</div>
                                                            <div className="ach-info">
                                                                <strong>{ach.title}</strong>
                                                                <p>{ach.desc}</p>
                                                                {unlocked && <span className="ach-reward">+{ach.reward} XP Awarded</span>}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    <h3 className="section-title"><Clock size={18} /> Mission Logs</h3>
                                    <div className="stats-row">
                                        {Object.entries(stats.dailyLog).reverse().map(([date, d]) => (
                                            <div key={date} className="day-insight">
                                                <div className="dt-row"><Calendar size={18} /> {new Date(date).toDateString()}</div>
                                                <div className="dt-body">
                                                    <div className="gain">+{d.xp} <span>XP</span></div>
                                                    <div className="br-grid">
                                                        <div className="br-dot"><span>Easy</span><strong>{d.breakdown?.Easy || 0}</strong></div>
                                                        <div className="br-dot"><span>Medium</span><strong>{d.breakdown?.Medium || 0}</strong></div>
                                                        <div className="br-dot"><span>Hard</span><strong>{d.breakdown?.Hard || 0}</strong></div>
                                                    </div>
                                                    <div className="total-ok">Solved: {d.solved} total</div>
                                                </div>
                                            </div>
                                        ))}
                                        {Object.keys(stats.dailyLog).length === 0 && <div className="no-intel">Intelligence gathering in progress. Solve tasks to see logs.</div>}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default App;
