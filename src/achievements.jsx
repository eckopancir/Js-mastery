import React from 'react';
import {
    Trophy, Zap, Star, Target, Crown, Flame, Shield, Award,
    Sparkles, Book, Code, Terminal, Clock, Activity, Heart, Rocket,
    Ghost, Skull, Swords, Gem, Anchor, Battery, Biohazard, Box,
    Layers, ZapOff, Coffee, Brain, Medal, TrendingUp
} from 'lucide-react';

const icons = [Trophy, Zap, Star, Target, Crown, Flame, Shield, Award, Sparkles, Book, Code, Terminal, Clock, Activity, Heart, Rocket, Ghost, Skull, Swords, Gem, Anchor, Battery, Biohazard, Box];

export const achievements = [];

// --- 1. ВЕТКА СЛОЖНОСТИ (EASY, MEDIUM, HARD) ---
// По 20 ачивок на каждую сложность (60 всего)
const difficulties = [
    { key: 'Easy', label: 'Neophyte', icon: <Coffee />, step: 25 },
    { key: 'Medium', label: 'Professional', icon: <Shield />, step: 15 },
    { key: 'Hard', label: 'Grandmaster', icon: <Skull />, step: 10 }
];

difficulties.forEach(diff => {
    for (let i = 1; i <= 20; i++) {
        const target = i * diff.step;
        achievements.push({
            id: `diff_${diff.key.toLowerCase()}_${target}`,
            title: `${diff.label} Rank ${i}`,
            desc: `Solve ${target} unique ${diff.key} tasks`,
            reward: i * 100,
            icon: diff.icon,
            check: (s, tasks) => {
                const ids = tasks.filter(t => t.difficulty === diff.key).map(t => t.id);
                return ids.filter(id => s.taskStats[id]?.passedCount > 0).length >= target;
            }
        });
    }
});

// --- 2. ВЕТКА ГЛУБИНЫ (LEVELS 1-10) ---
// По 10 ачивок на каждый уровень (100 всего)
// Это заставит тебя не бросать задачи, а делать LVL UP
for (let lvl = 1; lvl <= 10; lvl++) {
    for (let i = 1; i <= 10; i++) {
        const target = i * 5; // 5, 10, 15... 50 задач определенного уровня
        achievements.push({
            id: `lvl_mastery_${lvl}_${target}`,
            title: `Ascension Lvl ${lvl} - Phase ${i}`,
            desc: `Have ${target} tasks promoted to Level ${lvl}`,
            reward: (lvl * 100) + (i * 50),
            icon: <Layers />,
            check: (s) => Object.values(s.taskStats || {}).filter(t => t.level >= lvl).length >= target
        });
    }
}

// --- 3. ВЕТКА СКОРОСТРЕЛНОСТИ (ЗА ДЕНЬ) ---
// От 5 до 300 задач за сутки (25 ачивок)
const dailySpans = [5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 175, 200, 225, 250, 275, 300, 500];
dailySpans.forEach((target, i) => {
    achievements.push({
        id: `daily_volume_${target}`,
        title: `Overclocking ${i + 1}`,
        desc: `Solve ${target} tasks in one day`,
        reward: target * 5,
        icon: <Zap />,
        check: (s) => Object.values(s.dailyLog || {}).some(log => (log.solved || 0) >= target)
    });
});

// --- 4. ВЕТКА ПОСТОЯНСТВА (STREAK / DAYS) ---
// Общее время в системе (40 ачивок)
for (let i = 1; i <= 40; i++) {
    const target = i * 7; // Каждая неделя - новая ачивка
    achievements.push({
        id: `consistency_${target}`,
        title: `Willpower Week ${i}`,
        desc: `Activity recorded on ${target} different days`,
        reward: 1000,
        icon: <Clock />,
        check: (s) => Object.keys(s.dailyLog || {}).length >= target
    });
}

// --- 5. ВЕТКА ПРЕДЕЛА ОПЫТА (XP) ---
// До 2.5 млн опыта (25 ачивок)
for (let i = 1; i <= 25; i++) {
    const target = i * 100000;
    achievements.push({
        id: `xp_god_${target}`,
        title: `Divine Being ${i}`,
        desc: `Accumulate ${target.toLocaleString()} Mastery Points`,
        reward: 5000,
        icon: <Rocket />,
        check: (s) => s.xp >= target
    });
}