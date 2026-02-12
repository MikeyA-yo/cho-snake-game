import { Cherry, Apple, Star } from 'lucide-react';

export const GRID_SIZE = 20;
export const INITIAL_SNAKE = [{ x: 10, y: 10 }];
export const INITIAL_DIRECTION = { x: 0, y: -1 };

// --- Food Types ---
export const FOOD_TYPES = {
    cherry: { icon: Cherry, label: 'Cherry', points: 10, color: '#ef4444', glowColor: 'rgba(239,68,68,0.8)', probability: 0.55 },
    apple: { icon: Apple, label: 'Apple', points: 20, color: '#d946ef', glowColor: 'rgba(217,70,239,0.8)', probability: 0.35 },
    star: { icon: Star, label: 'Star', points: 50, color: '#facc15', glowColor: 'rgba(250,204,21,0.8)', probability: 0.10 },
};

const foodTypeKeys = Object.keys(FOOD_TYPES);

const pickFoodType = () => {
    const r = Math.random();
    let cumulative = 0;
    for (const key of foodTypeKeys) {
        cumulative += FOOD_TYPES[key].probability;
        if (r <= cumulative) return key;
    }
    return 'cherry';
};

// --- Power-Up Types ---
export const POWER_UP_TYPES = {
    shield: { label: 'Shield', color: '#38bdf8', icon: '🛡️', duration: 1, description: 'Survive 1 wall hit' },
    slowmo: { label: 'Slow-Mo', color: '#a78bfa', icon: '🐌', duration: 8000, description: 'Half speed for 8s' },
    doublePoints: { label: '2x Points', color: '#fbbf24', icon: '✨', duration: 10000, description: 'Double points for 10s' },
};

// --- Obstacle Patterns ---
export const LEVEL_OBSTACLES = [
    [], // Level 1: no obstacles
    // Level 2: small L-shape
    [{ x: 5, y: 5 }, { x: 5, y: 6 }, { x: 6, y: 6 }],
    // Level 3: two blocks
    [{ x: 5, y: 5 }, { x: 5, y: 6 }, { x: 6, y: 6 }, { x: 14, y: 14 }, { x: 14, y: 13 }, { x: 13, y: 13 }],
    // Level 4: corridor walls
    [{ x: 5, y: 5 }, { x: 5, y: 6 }, { x: 5, y: 7 }, { x: 5, y: 8 }, { x: 14, y: 12 }, { x: 14, y: 13 }, { x: 14, y: 14 }, { x: 14, y: 15 }],
    // Level 5: cross center
    [{ x: 10, y: 8 }, { x: 10, y: 9 }, { x: 10, y: 11 }, { x: 10, y: 12 }, { x: 8, y: 10 }, { x: 9, y: 10 }, { x: 11, y: 10 }, { x: 12, y: 10 }],
    // Level 6+: more complex
    [
        { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 4, y: 3 },
        { x: 16, y: 3 }, { x: 16, y: 4 }, { x: 15, y: 3 },
        { x: 3, y: 16 }, { x: 3, y: 15 }, { x: 4, y: 16 },
        { x: 16, y: 16 }, { x: 16, y: 15 }, { x: 15, y: 16 },
        { x: 10, y: 10 },
    ],
];

export const getObstaclesForLevel = (level) => {
    const idx = Math.min(level - 1, LEVEL_OBSTACLES.length - 1);
    return LEVEL_OBSTACLES[idx] || [];
};

// --- Generators ---
export const generateFood = (snake, obstacles = []) => {
    const occupied = new Set([
        ...snake.map(s => `${s.x},${s.y}`),
        ...obstacles.map(o => `${o.x},${o.y}`),
    ]);
    let pos;
    do {
        pos = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
        };
    } while (occupied.has(`${pos.x},${pos.y}`));

    return { ...pos, type: pickFoodType() };
};

export const generatePowerUp = (snake, food, obstacles = []) => {
    const occupied = new Set([
        ...snake.map(s => `${s.x},${s.y}`),
        ...obstacles.map(o => `${o.x},${o.y}`),
        `${food.x},${food.y}`,
    ]);
    let pos;
    do {
        pos = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
        };
    } while (occupied.has(`${pos.x},${pos.y}`));

    const types = Object.keys(POWER_UP_TYPES);
    const type = types[Math.floor(Math.random() * types.length)];
    return { ...pos, type };
};

export const checkCollision = (head, snake, obstacles = [], hasShield = false) => {
    // Wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        return hasShield ? 'shield' : 'dead';
    }
    // Self collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return hasShield ? 'shield' : 'dead';
        }
    }
    // Obstacle collision
    for (const obs of obstacles) {
        if (head.x === obs.x && head.y === obs.y) {
            return hasShield ? 'shield' : 'dead';
        }
    }
    return 'safe';
};
