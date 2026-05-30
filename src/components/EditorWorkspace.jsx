import React from "react";
import Editor from "@monaco-editor/react";
import TheoryBlock from "./TheoryBlock";
import {
  Play,
  CheckCircle,
  XCircle,
  Sparkles,
  Copy,
  Eye,
  Edit3,
  Wand2,
  ExternalLink,
  PlayCircle,
  X,
  Lock,
  Zap,
  Layers,
  BookOpen,
  Terminal,
  Info,
  Shield,
  Trash2,
  Star,
} from "lucide-react";

const handleEditorWillMount = (monaco) => {
  monaco.editor.defineTheme("vs-tactical", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6a737d", fontStyle: "italic" },
      { token: "keyword", foreground: "ff7b72" },
      { token: "string", foreground: "a5d6ff" },
      { token: "number", foreground: "79c0ff" },
      { token: "function", foreground: "d2a8ff" },
    ],
    colors: {
      "editor.background": "#0d1117",
      "editor.foreground": "#c9d1d9",
      "editor.lineHighlightBackground": "#161b22",
      "editor.selectionBackground": "#264f78",
      "editorCursor.foreground": "#58a6ff",
      "editorIndentGuide.background": "#404040",
    },
  });
};

const EditorWorkspace = ({
  displayTask,
  currentTask,
  code,
  setCode,
  cssCode,
  setCssCode,
  ansInput,
  setAnsInput,
  selectedAnswers,
  setSelectedAnswers,
  results,
  setResults,
  isRunning,
  showSolution,
  setShowSolution,
  showNotes,
  setShowNotes,
  stats,
  setStats,
  formatCode,
  validateCode,
  handleQuickRun,
  copyBriefing,
  triggerAiTask,
  aiLoading,
  aiActiveTask,
  setAiActiveTask,
  handleClearCard,
  panelWidth,
  isResizing,
  startResizing,
  getCardLevelReq,
  openLayoutPreview,
  shuffledOptions,
  lastPassed,
  aiLimitsAvailable,
  choiceTimer,
  triggerAiFlyer,
  triggerXpFlyer,
  teoriaTask,
  theoryAnswers,
  setTheoryAnswers,
  onTheorySubmit,
  theoryResults,
  theorySubmitting,
  theoryOpenCard,
  setTheoryOpenCard,
  playSound,
  onClearTheoryResults,
  isTheoryLocked,
  getCooldownRemaining,
}) => {
  const [activeMode, setActiveMode] = React.useState("practice");

  React.useEffect(() => {
    if (theoryOpenCard && teoriaTask) {
      setActiveMode("theory");
    }
  }, [theoryOpenCard, teoriaTask]);

  return (
    <div className="editor-workspace">
      <header className="problem-header">
        {activeMode === "theory" && teoriaTask && theoryOpenCard ? (
          <div
            className="theory-header-section"
            style={{ width: "100%", flex: 1 }}
          >
            <button
              className="theory-back-btn"
              onClick={() => {
                setActiveMode("practice");
                setTheoryOpenCard(false);
              }}
            >
              <X size={18} />
            </button>
            <div className="theory-title-section">
              <BookOpen size={24} />
              <div>
                <h2 className="theory-main-title">ТЕОРИЯ: {teoriaTask.card}</h2>
                <span className="theory-subtitle">
                  {teoriaTask.module} • {teoriaTask.stack}
                </span>
              </div>
            </div>
            <div className="theory-header-right">
              {teoriaTask &&
                theoryResults &&
                theoryResults[teoriaTask.card] && (
                  <div
                    className={`theory-total-result ${theoryResults[teoriaTask.card].totalPercent >= 70 ? "pass" : "fail"}`}
                  >
                    {theoryResults[teoriaTask.card].totalPercent}%
                  </div>
                )}
              <div className="theory-rewards">
                <span className="xp-reward">+{teoriaTask.xpReward} XP</span>
                <span className="ai-reward">
                  +{teoriaTask.aiPointsReward} AI
                </span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {" "}
            {/* Используем фрагмент, так как внутри два соседних div: info и actions */}
            <div className="problem-info">
              <div className="topic-badge">
                {displayTask.isAiGenerated ? (
                  <>
                    <Sparkles size={14} /> AI TASK:{" "}
                    {displayTask.card || displayTask.topic} /{" "}
                    {displayTask.stack}
                  </>
                ) : (
                  <>
                    {currentTask.card
                      ? `${currentTask.card} / Lvl ${stats.cardStats[currentTask.card]?.level || 1}`
                      : currentTask.topic}{" "}
                    / {currentTask.stack}
                  </>
                )}
              </div>
              <div className="problem-info-bookmark">
                <h1>{displayTask.title}</h1>
                {!displayTask.isAiGenerated && (
                  <button
                    className={`bookmark-btn ${(stats.bookmarks || []).includes(currentTask.id) ? 'bookmarked' : ''}`}
                    onClick={() => {
                      playSound('click');
                      setStats(prev => ({
                        ...prev,
                        bookmarks: prev.bookmarks?.includes(currentTask.id)
                          ? prev.bookmarks.filter(id => id !== currentTask.id)
                          : [...(prev.bookmarks || []), currentTask.id],
                      }));
                    }}
                    title={(stats.bookmarks || []).includes(currentTask.id) ? 'Убрать из избранного' : 'Добавить в избранное'}
                  >
                    <Star
                       size={12}
                       fill={(stats.bookmarks || []).includes(currentTask.id) ? '#ffd700' : 'none'}
                       color={(stats.bookmarks || []).includes(currentTask.id) ? '#ffd700' : '#8b949e'}
                     />
                  </button>
                )}
              </div>
              <div
                className="briefing-card clickable-copy"
                onClick={copyBriefing}
                title="Click to copy AI Prompt"
              >
                <div className="briefing-title">
                  <Info size={14} /> TACTICAL BRIEFING{" "}
                  <Copy size={14} className="copy-icon-briefing" />
                </div>
                <p className="desc-text">{displayTask.description}</p>
              </div>
            </div>
            <div
              className="problem-actions"
              style={{
                flexDirection: "column",
                alignItems: "flex-end",
                gap: "8px",
              }}
            >
              <div
                className="problem-actions-row"
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                }}
              >
                {displayTask.card && (
                  <div
                    key={`ai-pts-${stats.cardAiPoints?.[displayTask.card] || 0}`}
                    className="ai-points-badge flash"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Zap size={14} className="zap-icon" />
                    <span>
                      {stats.cardAiPoints?.[displayTask.card] || 0}/
                      {
                        getCardLevelReq(
                          stats.cardStats[displayTask.card]?.level || 1,
                        ).points
                      }{" "}
                      AI
                    </span>
                    <span
                      style={{
                        color: "#8b949e",
                        fontSize: "0.75rem",
                        marginLeft: "4px",
                      }}
                      title="Remaining AI Point Yields Today"
                    >
                      (
                      {Math.max(
                        0,
                        3 -
                          (stats.aiHistory?.[
                            currentTask.originalId || currentTask.id
                          ]?.date === new Date().toISOString().split("T")[0]
                            ? stats.aiHistory[
                                currentTask.originalId || currentTask.id
                              ].count || 0
                            : 0),
                      )}
                      /3 Limits)
                    </span>
                  </div>
                )}

                {!aiActiveTask ? (
                  <button
                    className={`action-btn ai-btn ${aiLoading ? "active" : ""} ${!lastPassed || !aiLimitsAvailable ? "disabled" : ""}`}
                    onClick={() =>
                      lastPassed &&
                      aiLimitsAvailable &&
                      triggerAiTask(currentTask)
                    }
                    disabled={aiLoading || !lastPassed || !aiLimitsAvailable}
                  >
                    <Sparkles size={18} />
                    <span>
                      {aiLoading
                        ? "..."
                        : lastPassed && aiLimitsAvailable
                          ? "AI"
                          : "LOCKED"}
                    </span>
                  </button>
                ) : (
                  <button
                    className="action-btn ai-btn"
                    onClick={() => {
                      setAiActiveTask(null);
                      setResults(null);
                    }}
                  >
                    <X size={18} /> <span>EXIT AI</span>
                  </button>
                )}
              </div>

              <div
                className="problem-actions-row"
                style={{ display: "flex", gap: "10px" }}
              >
                {displayTask.mode === "ui-layout" && (
                  <button
                    className="action-btn"
                    onClick={openLayoutPreview}
                    title="Open Live Preview"
                  >
                    <ExternalLink size={18} /> <span>PREVIEW</span>
                  </button>
                )}
                {displayTask.mode === "code" && !aiActiveTask && (
                  <button
                    className="action-btn"
                    onClick={handleQuickRun}
                    title="Quick Run"
                  >
                    <PlayCircle size={18} /> <span>QUICK TEST</span>
                  </button>
                )}
                <button
                  className="action-btn solution"
                  onClick={() => {
                    playSound("click");
                    setShowSolution(!showSolution);
                  }}
                >
                  <Eye size={18} /> <span>SOLUTION</span>
                </button>
                {!aiActiveTask && (
                  <button
                    className="action-btn notes"
                    onClick={() => {
                      playSound("click");
                      setShowNotes(!showNotes);
                    }}
                  >
                    <Edit3 size={18} /> <span>NOTES</span>
                  </button>
                )}
                {displayTask.mode === "code" && (
                  <button className="action-btn" onClick={formatCode}>
                    <Wand2 size={18} /> <span>FORMAT</span>
                  </button>
                )}
                <button
                  className="action-btn run ripple-btn"
                  onClick={validateCode}
                  disabled={isRunning}
                >
                  <Play size={18} /> <span>RUN</span>
                </button>
                {!aiActiveTask && currentTask.card && (
                  <button
                    className="action-btn down clear-btn"
                    onClick={handleClearCard}
                  >
                    <Trash2 size={18} /> <span>CLEAR</span>
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </header>

      {activeMode === "theory" && teoriaTask && theoryOpenCard ? (
        <div className="theory-full-container">
          <TheoryBlock
            teoriaTask={teoriaTask}
            userAnswers={
              teoriaTask && teoriaTask.card
                ? theoryAnswers[teoriaTask.card] || {}
                : {}
            }
            setUserAnswers={setTheoryAnswers}
            onSubmit={onTheorySubmit}
            isSubmitting={theorySubmitting}
            results={
              teoriaTask && teoriaTask.card && theoryResults
                ? theoryResults[teoriaTask.card]
                : null
            }
            theme={stats.theme}
            onClearResults={onClearTheoryResults}
            onBack={() => {
              setActiveMode("practice");
              setTheoryOpenCard(false);
            }}
            isTheoryLocked={isTheoryLocked}
            getCooldownRemaining={getCooldownRemaining}
          />
        </div>
      ) : (
        <div className="editor-split">
          <div className="editor-area" style={{ position: "relative" }}>
            {aiLoading && (
              <div className="ai-loading-overlay">
                <div className="ai-scanner"></div>
                <Sparkles
                  size={40}
                  className="zap-spin"
                  style={{ color: "#58a6ff" }}
                />
                <p>GENERATING AI TASK...</p>
              </div>
            )}

            {displayTask.mode === "ui-layout" ? (
              <div className="ui-editor-grid">
                <div className="editor-box">
                  <div className="box-label">HTML (Source)</div>
                  <Editor
                    height="160px"
                    defaultLanguage="html"
                    theme="vs-dark"
                    value={displayTask.initialHtml}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                    }}
                  />
                </div>
                <div className="editor-box style-box">
                  <div className="box-label">CSS Stylesheet</div>
                  <Editor
                    height="100%"
                    language="css"
                    theme="vs-tactical"
                    value={cssCode}
                    onChange={setCssCode}
                    beforeMount={handleEditorWillMount}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                    }}
                  />
                </div>
              </div>
            ) : displayTask.mode === "output-predictor" ? (
              <div className="ui-editor-grid">
                <div className="editor-box">
                  <div className="box-label">Static Code</div>
                  <Editor
                    height="220px"
                    defaultLanguage="javascript"
                    theme="vs-dark"
                    value={displayTask.initialCode}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                    }}
                  />
                </div>
                <div className="editor-box ans-input-box">
                  <div className="box-label">Predict Output Here</div>
                  <textarea
                    className="predictor-ans"
                    placeholder="Enter the output exactly..."
                    value={ansInput}
                    onChange={(e) => setAnsInput(e.target.value)}
                  />
                </div>
              </div>
            ) : displayTask.mode === "single-choice" ||
              displayTask.mode === "multi-choice" ? (
              <div className="choice-container">
                {choiceTimer > 0 && (
                  <div className="choice-timer-overlay">
                    <div className="choice-timer-text">
                      READ THE QUESTION: {choiceTimer}s
                    </div>
                  </div>
                )}
                <div className="choice-grid">
                  {(displayTask.isAiGenerated
                    ? displayTask.options || []
                    : shuffledOptions
                  ).map((opt, i) => (
                    <button
                      key={`${displayTask.id}-${i}`}
                      className={`choice-card ${selectedAnswers.includes(opt) ? "selected" : ""} ${choiceTimer > 0 ? "disabled" : ""}`}
                      onClick={() => {
                        if (choiceTimer > 0) return;
                        playSound("click");
                        if (displayTask.mode === "single-choice")
                          setSelectedAnswers([opt]);
                        else
                          setSelectedAnswers((prev) =>
                            prev.includes(opt)
                              ? prev.filter((v) => v !== opt)
                              : [...prev, opt],
                          );
                      }}
                      disabled={choiceTimer > 0}
                    >
                      <div className="choice-check">
                        {selectedAnswers.includes(opt) && (
                          <CheckCircle size={16} />
                        )}
                      </div>
                      <div className="choice-text">{opt}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : displayTask.mode === "bug-hunter" ? (
              <div className="bug-hunter-container">
                <div className="bug-hunter-code">
                  {(displayTask.initialCode || "")
                    .split("\n")
                    .map((line, i) => {
                      const match = line.match(/^(\d+):\s*(.*)$/);
                      const lineNum = String(match ? match[1] : i + 1);
                      const lineContent = match ? match[2] : line;
                      return (
                        <div
                          key={i}
                          className={`bug-line ${selectedAnswers.includes(lineNum) ? "selected" : ""}`}
                          onClick={() => {
                            playSound("click");
                            setSelectedAnswers((prev) =>
                              prev.includes(lineNum)
                                ? prev.filter((v) => v !== lineNum)
                                : [...prev, lineNum],
                            );
                          }}
                        >
                          <span className="line-num-label">{lineNum}</span>
                          <span className="line-text-content">
                            {lineContent}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            ) : (
              <Editor
                height="100%"
                language={
                  displayTask.stack === "TypeScript"
                    ? "typescript"
                    : "javascript"
                }
                theme="vs-tactical"
                value={code}
                onChange={setCode}
                beforeMount={handleEditorWillMount}
                options={{
                  fontSize: 16,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              />
            )}

            {showSolution && (
              <div className="solution-modal-overlay">
                <div className="solution-modal">
                  <div className="modal-header">
                    <h3>
                      <Lock size={18} /> Solution Explorer
                    </h3>
                    <div className="modal-actions">
                      <button
                        className="copy-btn"
                        onClick={() => {
                          navigator.clipboard.writeText(displayTask.solution);
                          playSound("click");
                          setShowSolution(false);
                        }}
                      >
                        <Copy size={16} /> Copy & Exit
                      </button>
                      <button
                        className="close-x"
                        onClick={() => setShowSolution(false)}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                  <pre className="sol-code">{displayTask.solution}</pre>
                  <button
                    className="sol-close"
                    onClick={() => {
                      playSound("click");
                      setShowSolution(false);
                    }}
                  >
                    Return to Tactical Mission
                  </button>
                </div>
              </div>
            )}
            {showNotes && (
              <div className="solution-modal-overlay">
                <div className="solution-modal notes-modal">
                  <div className="modal-header">
                    <h3>
                      <Edit3 size={18} /> Tactical Notepad
                    </h3>
                    <div className="modal-actions">
                      <button
                        className="close-x"
                        onClick={() => setShowNotes(false)}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                  <div
                    className="notes-editor-container"
                    style={{
                      height: "400px",
                      width: "100%",
                      marginBottom: "15px",
                    }}
                  >
                    <Editor
                      height="100%"
                      language={
                        currentTask.stack === "TypeScript"
                          ? "typescript"
                          : "javascript"
                      }
                      theme="vs-tactical"
                      value={stats.taskNotes[currentTask.id] || ""}
                      onChange={(val) => {
                        setStats((prev) => ({
                          ...prev,
                          taskNotes: {
                            ...prev.taskNotes,
                            [currentTask.id]: val,
                          },
                        }));
                      }}
                      options={{
                        fontSize: 16,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        wordWrap: "on",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    />
                  </div>
                  <button
                    className="sol-close"
                    onClick={() => {
                      playSound("click");
                      setShowNotes(false);
                    }}
                  >
                    Close Notepad
                  </button>
                </div>
              </div>
            )}
          </div>

          <div
            className={`workspace-resizer ${isResizing ? "active" : ""}`}
            onMouseDown={startResizing}
          ></div>

          <div
            className="validation-panel-column"
            style={{ width: panelWidth }}
          >
            <div
              className={`validation-panel ${results?.allPassed ? "success" : results?.allPassed === false ? "fail" : ""}`}
            >
              <div className="panel-title">
                <div className="title-left">
                  <Layers size={16} /> SYSTEM RESPONSE
                </div>
                <Terminal size={14} className="title-icon-right" />
              </div>
              <div className="panel-body">
                {results ? (
                  <>
                    {results.globalError && (
                      <div
                        className="tc-header"
                        style={{
                          color: "#f85149",
                          marginBottom: "15px",
                          padding: "10px",
                          backgroundColor: "rgba(248, 81, 73, 0.1)",
                          borderRadius: "6px",
                          border: "1px solid rgba(248,81,73,0.3)",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "8px",
                          wordBreak: "break-word",
                        }}
                      >
                        <XCircle size={18} style={{ flexShrink: 0 }} />
                        <span className="tc-title">{results.globalError}</span>
                      </div>
                    )}
                    <div className="metrics-row">
                      <div className="metric-card runtime">
                        <div className="m-label">RUNTIME</div>
                        <div className="m-val">
                          {results.runtime || "0.00"}ms
                        </div>
                      </div>
                      <div className="metric-card memory">
                        <div className="m-label">MEMORY</div>
                        <div className="m-val">{results.memory || "4.1"}MB</div>
                      </div>
                    </div>

                    <div className="test-results-list">
                      {results.testResults?.map((t, idx) => {
                        // ЗАЩИТА: Добавляем проверку на существование displayTask и displayTask.tests
                        const originalParams =
                          displayTask?.tests?.[idx]?.params;

                        return (
                          <div
                            key={idx}
                            className={`test-case-row ${t.passed ? "passed" : "failed"}`}
                          >
                            <div className="tc-header">
                              {t.passed ? (
                                <CheckCircle size={18} className="tc-ok" />
                              ) : (
                                <XCircle size={18} className="tc-bad" />
                              )}
                              <span className="tc-title">
                                Test Case {String(idx + 1).padStart(2, "0")}{" "}
                                {t.passed ? "Passed" : "Failed"}
                              </span>
                            </div>
                            <div className="tc-details">
                              Input:{" "}
                              {/* ЗАЩИТА: Проверяем наличие параметров перед stringify */}
                              <code>
                                {originalParams
                                  ? JSON.stringify(originalParams)
                                  : "N/A"}
                              </code>{" "}
                              {" -> "}
                              Output: <code>{JSON.stringify(t.actual)}</code>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="panel-idle-modern">
                    <div className="idle-icon-wrap">
                      <BookOpen size={48} className="idle-book" />
                      <div className="idle-glow"></div>
                      <div className="idle-dot"></div>
                    </div>
                    <h2>Analyze mission results</h2>
                    <p>
                      Run tests to verify your solution and see performance
                      metrics.
                    </p>

                    <div className="idle-meta-list">
                      <div className="meta-item">
                        <div className="meta-icon">
                          <Zap size={16} />
                        </div>
                        <div className="meta-text">
                          <strong>METRIC: RUNTIME</strong>
                          <span>High-precision latency tracking</span>
                        </div>
                      </div>
                      <div className="meta-item">
                        <div className="meta-icon">
                          <Lock size={16} />
                        </div>
                        <div className="meta-text">
                          <strong>RESOURCE: MEMORY</strong>
                          <span>Estimated allocation profiling</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorWorkspace;
