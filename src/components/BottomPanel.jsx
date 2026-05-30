import React, { useState, useRef, useEffect } from "react";
import { Play, RotateCcw, Check, X, Palette, Sparkles, Eye, Edit3, Wand2, Trash2, ExternalLink, PlayCircle, GripVertical, Lock, Unlock, ArrowDown, Zap } from "lucide-react";
import { getCardLevelReq } from "../gameLogic";

const STORAGE_KEY = 'bottomPanelState';

const loadState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) { }
  return null;
};

const saveState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) { }
};

const BottomPanel = ({
  displayTask,
  handleQuickRun,
  validateCode,
  aiActiveTask,
  triggerAiTask,
  openLayoutPreview,
  setShowSolution,
  showSolution,
  setShowNotes,
  showNotes,
  formatCode,
  handleClearCard,
  lastPassed,
  aiLimitsAvailable,
  aiLoading,
  currentTask,
  stats,
  onToggleTheme,
  theme,
  isRunning,
  playSound,
  setAiActiveTask,
  setResults,
  visible = true,
  onToggleVisibility,
}) => {
  const savedState = loadState();

  const [position, setPosition] = useState(savedState ? { x: savedState.x, y: savedState.y } : { x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [isVertical, setIsVertical] = useState(savedState ? savedState.isVertical : false);
  const [isLocked, setIsLocked] = useState(savedState ? savedState.isLocked : false);
  const [isAnimating, setIsAnimating] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const panelRef = useRef(null);

  useEffect(() => {
    if (isLocked) {
      saveState({ x: position.x, y: position.y, isVertical, isLocked });
    }
  }, [isLocked, position.x, position.y, isVertical]);

  const PANEL_WIDTH_HORIZONTAL = 624;
  const PANEL_WIDTH_VERTICAL = 56;
  const PANEL_HEIGHT = 56;
  const SNAP_THRESHOLD = 100;

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging && !isLocked) {
        e.preventDefault();

        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        let newX = e.clientX - dragOffset.current.x;
        let newY = e.clientY - dragOffset.current.y;

        const currentWidth = isVertical ? PANEL_WIDTH_VERTICAL : PANEL_WIDTH_HORIZONTAL;

        newX = Math.max(20, Math.min(newX, screenWidth - currentWidth - 20));
        newY = Math.max(20, Math.min(newY, screenHeight - PANEL_HEIGHT - 20));

        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging && !isLocked) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isVertical, isLocked]);

  const handleDragStart = (e) => {
    if (isLocked) return;
    if (e.target.closest('.bottom-btn, .bottom-separator, .lock-btn')) return;

    e.preventDefault();
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    setIsDragging(true);
  };

  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const currentW = isVertical ? PANEL_WIDTH_VERTICAL : PANEL_WIDTH_HORIZONTAL;

      let newX = position.x;
      let newY = position.y;

      if (newX > screenWidth - currentW - 20) {
        newX = screenWidth - currentW - 20;
      }
      if (newY > screenHeight - PANEL_HEIGHT - 20) {
        newY = screenHeight - PANEL_HEIGHT - 20;
      }

      if (newX !== position.x || newY !== position.y) {
        setPosition({ x: Math.max(20, newX), y: Math.max(20, newY) });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position.x, position.y, isVertical]);

  const currentWidth = isVertical ? PANEL_WIDTH_VERTICAL : PANEL_WIDTH_HORIZONTAL;

  if (!visible) return null;

  return (
    <div
      ref={panelRef}
      className={`bottom-panel ${isVertical ? 'vertical' : 'horizontal'} ${isDragging ? 'dragging' : ''} ${isAnimating ? 'animating' : ''}`}
      style={{
        left: position.x,
        top: position.y,
        width: currentWidth,
      }}
      onMouseDown={handleDragStart}
    >
      <div className="bottom-panel-header">
        <button
          className={`lock-btn ${isLocked ? 'locked' : ''}`}
          onClick={() => setIsLocked(!isLocked)}
        >
          {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
        </button>

        <button
          className="vertical-btn"
          onClick={() => {
            setIsVertical(!isVertical);
            if (isLocked) {
              saveState({ x: position.x, y: position.y, isVertical: !isVertical, isLocked: true });
            }
          }}
        >
          <ArrowDown size={14} />
        </button>
      </div>

      <div className={`bottom-panel-inner ${isVertical ? 'vertical' : ''}`}>
        {isVertical ? (
          <>
            {displayTask?.mode === "ui-layout" && (
              <button
                className="bottom-btn"
                onClick={openLayoutPreview}
                title="Preview"
              >
                <ExternalLink size={16} />
              </button>
            )}

            {displayTask?.mode === "code" && !aiActiveTask && (
              <button
                className="bottom-btn"
                onClick={handleQuickRun}
                title="Quick"
              >
                <PlayCircle size={16} />
              </button>
            )}

            <button
              className="bottom-btn solution"
              onClick={() => {
                playSound && playSound("click");
                setShowSolution && setShowSolution(!showSolution);
              }}
            >
              <Eye size={16} />
            </button>

            <button
              className="bottom-btn notes"
              onClick={() => {
                playSound && playSound("click");
                setShowNotes && setShowNotes(!showNotes);
              }}
            >
              <Edit3 size={16} />
            </button>

            {displayTask?.mode === "code" && (
              <button className="bottom-btn" onClick={formatCode}>
                <Wand2 size={16} />
              </button>
            )}

            <button
              className="bottom-btn primary"
              onClick={validateCode}
              disabled={isRunning}
              title={isRunning ? "Running..." : "Run"}
            >
              <Play size={16} />
            </button>

            <button className="bottom-btn danger" onClick={handleClearCard}>
              <Trash2 size={16} />
            </button>

            <div className="bottom-separator" />

            {!aiActiveTask ? (
              <button
                className={`bottom-btn ai ${aiLoading ? "active" : ""} ${!lastPassed || !aiLimitsAvailable ? "disabled" : ""}`}
                onClick={() => lastPassed && aiLimitsAvailable && triggerAiTask(currentTask)}
                disabled={aiLoading || !lastPassed || !aiLimitsAvailable}
                title={aiLoading ? "Loading..." : lastPassed && aiLimitsAvailable ? "AI" : "Locked"}
              >
                {aiLoading ? <RotateCcw size={16} className="spin" /> : <Sparkles size={16} />}
              </button>
            ) : (
              <button
                className="bottom-btn ai active"
                onClick={() => {
                  setAiActiveTask && setAiActiveTask(null);
                  setResults && setResults(null);
                }}
                title="Exit AI"
              >
                <X size={16} />
              </button>
            )}

            <button className="bottom-btn theme" onClick={onToggleTheme}>
              <Palette size={16} />
            </button>

            <div className="vertical-footer">
              <button
                className={`lock-btn ${isLocked ? 'locked' : ''}`}
                onClick={() => setIsLocked(!isLocked)}
              >
                {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
              </button>
              <button
                className="vertical-btn"
                onClick={() => {
                  setIsVertical(!isVertical);
                  if (isLocked) {
                    saveState({ x: position.x, y: position.y, isVertical: !isVertical, isLocked: true });
                  }
                }}
              >
                <ArrowDown size={14} />
              </button>
            </div>
          </>
        ) : (
          <>
            <button className="bottom-btn" onClick={handleQuickRun} disabled={displayTask?.mode !== "code" || aiActiveTask}>
              <PlayCircle size={16} /><span>QUICK</span>
            </button>

            <button className="bottom-btn solution" onClick={() => {
              playSound && playSound("click");
              setShowSolution && setShowSolution(!showSolution);
            }}>
              <Eye size={16} /><span>SOLUTION</span>
            </button>

            <button className="bottom-btn notes" onClick={() => {
              playSound && playSound("click");
              setShowNotes && setShowNotes(!showNotes);
            }}>
              <Edit3 size={16} /><span>NOTES</span>
            </button>

            <button className="bottom-btn" onClick={formatCode} disabled={displayTask?.mode !== "code"}>
              <Wand2 size={16} /><span>FORMAT</span>
            </button>

            <button className="bottom-btn primary" onClick={validateCode} disabled={isRunning}>
              <Play size={16} /><span>{isRunning ? "..." : "RUN"}</span>
            </button>

            <button className="bottom-btn danger" onClick={handleClearCard}>
              <Trash2 size={16} /><span>CLEAR</span>
            </button>

            <div className="bottom-separator" />

            {!aiActiveTask ? (
              <button
                className={`bottom-btn ai ${aiLoading ? "active" : ""} ${!lastPassed || !aiLimitsAvailable ? "disabled" : ""}`}
                onClick={() => lastPassed && aiLimitsAvailable && triggerAiTask(currentTask)}
                disabled={aiLoading || !lastPassed || !aiLimitsAvailable}
              >
                {aiLoading ? <RotateCcw size={16} className="spin" /> : <Sparkles size={16} />}
                <span>{aiLoading ? "..." : lastPassed && aiLimitsAvailable ? "AI" : "LOCKED"}</span>
              </button>
            ) : (
              <button
                className="bottom-btn ai active"
                onClick={() => {
                  setAiActiveTask && setAiActiveTask(null);
                  setResults && setResults(null);
                }}
              >
                <X size={16} /><span>EXIT AI</span>
              </button>
            )}

            <button className="bottom-btn theme" onClick={onToggleTheme}>
              <Palette size={16} /><span>THEME</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default BottomPanel;