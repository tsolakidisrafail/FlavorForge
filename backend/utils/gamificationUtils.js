// backend/utils/gamificationUtils.js
const calculateLevel = (points) => {
    if (points >= 300) return 4;
    if (points >= 150) return 3;
    if (points >= 50) return 2;
    return 1; // Default level for points < 50
};
const getLevelName = (level) => {
    const names = { 1: "Novice Cook", 2: "Apprentice Chef", 3: "Sous Chef", 4: "Head Chef" };
    return names[level] || "Unknown Level";
};
const getPointsForNextLevel = (level) => {
    const thresholds = { 1: 50, 2: 150, 3: 300 };
    return thresholds[level] || Infinity; // No next level for level 4
};
const getPointsForLevel = (level) => {
    const basePoints = { 1: 0, 2: 50, 3: 150, 4: 300 };
    return basePoints[level] !== undefined ? basePoints[level] : 0;
};

module.exports = {
    calculateLevel,
    getLevelName,
    getPointsForNextLevel,
    getPointsForLevel
};