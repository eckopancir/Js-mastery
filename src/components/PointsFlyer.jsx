import React from "react";
import { Zap } from "lucide-react";

const PointsFlyer = ({ type, amount, onComplete }) => {
  return (
    <div className={`points-flyer ${type}`} onAnimationEnd={onComplete}>
      <div className="points-flyer-icon">
        {type === "xp" ? "+" : <Zap size={14} />}
      </div>
      <span className="points-flyer-amount">+{amount}</span>
      <span className="points-flyer-label">{type === "xp" ? "XP" : "AI"}</span>
    </div>
  );
};

export default PointsFlyer;
