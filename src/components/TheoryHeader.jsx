import React from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Lock,
} from "lucide-react";

const TheoryHeader = ({
  teoriaTask,
  isOpen,
  onToggle,
  results,
  isSubmitting,
  theme,
  isTheoryLocked,
  getCooldownRemaining,
}) => {
  if (!teoriaTask) return null;

  const passed = results?.totalPercent >= 70;
  const isLocked = isTheoryLocked ? isTheoryLocked(teoriaTask.card) : false;
  const cooldownRemaining = getCooldownRemaining
    ? getCooldownRemaining(teoriaTask.card)
    : null;

  return (
    <div className="theory-header-minimal">
      <button
        type="button"
        className={`theory-header-btn ${isLocked ? "locked" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggle?.();
        }}
        disabled={isLocked}
      >
        {isLocked ? <Lock size={16} /> : <BookOpen size={16} />}
        <span className="theory-header-label">
          {isLocked ? "Теория (заблокирована)" : "Теория"}
        </span>
        {passed && <CheckCircle size={14} className="theory-passed-icon" />}
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {isOpen && (
        <div className="theory-header-info">
          <span className="theory-info-reward">
            +{teoriaTask.xpReward} XP / +{teoriaTask.aiPointsReward} AI
          </span>
          {passed && (
            <span className="theory-info-passed">
              ✓ {results.totalPercent}%
            </span>
          )}
        </div>
      )}
      {isLocked && cooldownRemaining && !isOpen && (
        <div className="theory-header-locked">🔒 {cooldownRemaining}</div>
      )}
    </div>
  );
};

export default TheoryHeader;
