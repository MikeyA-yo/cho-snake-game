import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import useInterval from './useInterval';
import {
    GRID_SIZE,
    INITIAL_SNAKE,
    INITIAL_DIRECTION,
    FOOD_TYPES,
    POWER_UP_TYPES,
    generateFood,
    generatePowerUp,
    checkCollision,
    getObstaclesForLevel,
} from '../utils/gameUtils';
import SoundManager from '../utils/SoundManager';

// Difficulty presets
export const DIFFICULTY_MODES = {
    easy: { label: 'Easy', baseSpeed: 320, minSpeed: 120, speedDecrease: 6, description: 'Relaxed pace, perfect for beginners' },
    medium: { label: 'Medium', baseSpeed: 220, minSpeed: 90, speedDecrease: 7, description: 'A balanced challenge' },
    hard: { label: 'Hard', baseSpeed: 150, minSpeed: 65, speedDecrease: 8, description: 'Fast reflexes required' },
    crazy: { label: 'Crazy', baseSpeed: 90, minSpeed: 40, speedDecrease: 5, description: 'Pure chaos. Good luck.' },
};

const POINTS_PER_LEVEL = 100;
const COMBO_WINDOW = 2500; // ms
const POWER_UP_SPAWN_INTERVAL = 15000; // ms

// LocalStorage helpers
const getHighScores = () => {
    try {
        const stored = localStorage.getItem('cho-snake-highscores');
        return stored ? JSON.parse(stored) : { easy: 0, medium: 0, hard: 0, crazy: 0 };
    } catch {
        return { easy: 0, medium: 0, hard: 0, crazy: 0 };
    }
};

const saveHighScore = (difficulty, score) => {
    const scores = getHighScores();
    if (score > (scores[difficulty] || 0)) {
        scores[difficulty] = score;
        localStorage.setItem('cho-snake-highscores', JSON.stringify(scores));
        return true;
    }
    return false;
};

const useSnakeGame = () => {
    const [snake, setSnake] = useState(INITIAL_SNAKE);
    const [food, setFood] = useState({ x: 5, y: 5, type: 'cherry' });
    const [direction, setDirection] = useState(INITIAL_DIRECTION);
    const [status, setStatus] = useState('IDLE');
    const [score, setScore] = useState(0);
    const [difficulty, setDifficulty] = useState('easy');
    const [highScores, setHighScores] = useState(getHighScores);
    const [isNewHighScore, setIsNewHighScore] = useState(false);

    // Advanced state
    const [level, setLevel] = useState(1);
    const [obstacles, setObstacles] = useState([]);
    const [combo, setCombo] = useState(0);
    const [activePowerUps, setActivePowerUps] = useState({}); // { shield: true, slowmo: true, doublePoints: true }
    const [powerUpOnGrid, setPowerUpOnGrid] = useState(null); // { x, y, type } or null
    const [screenShake, setScreenShake] = useState(false);
    const [levelUpFlash, setLevelUpFlash] = useState(false);
    const [lastEatTime, setLastEatTime] = useState(0);
    const [totalFoodEaten, setTotalFoodEaten] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);

    // Events for particle system
    const [lastEvent, setLastEvent] = useState(null); // { type: 'eat'|'die'|'powerup'|'levelup', x, y, color }

    const powerUpTimersRef = useRef({});
    const powerUpSpawnTimerRef = useRef(null);

    const mode = DIFFICULTY_MODES[difficulty];

    // Dynamic speed
    const speed = useMemo(() => {
        const foodsEaten = snake.length - 1;
        let currentSpeed = mode.baseSpeed - (foodsEaten * mode.speedDecrease);
        currentSpeed = Math.max(currentSpeed, mode.minSpeed);
        // Slow-Mo power-up doubles the interval
        if (activePowerUps.slowmo) {
            currentSpeed = currentSpeed * 2;
        }
        return currentSpeed;
    }, [snake.length, mode, activePowerUps.slowmo]);

    // Level calculation
    useEffect(() => {
        const newLevel = Math.floor(score / POINTS_PER_LEVEL) + 1;
        if (newLevel > level && status === 'PLAYING') {
            setLevel(newLevel);
            setObstacles(getObstaclesForLevel(newLevel));
            setLevelUpFlash(true);
            SoundManager.levelUp();
            setLastEvent({ type: 'levelup', x: 10, y: 10 });
            setTimeout(() => setLevelUpFlash(false), 600);
        }
    }, [score, level, status]);

    // Power-up spawning
    useEffect(() => {
        if (status === 'PLAYING') {
            powerUpSpawnTimerRef.current = setInterval(() => {
                if (!powerUpOnGrid) {
                    const pu = generatePowerUp(snake, food, obstacles);
                    setPowerUpOnGrid(pu);
                    // Auto-despawn after 8 seconds if not picked up
                    setTimeout(() => {
                        setPowerUpOnGrid((prev) => {
                            if (prev && prev.x === pu.x && prev.y === pu.y) return null;
                            return prev;
                        });
                    }, 8000);
                }
            }, POWER_UP_SPAWN_INTERVAL);
            return () => clearInterval(powerUpSpawnTimerRef.current);
        }
    }, [status, powerUpOnGrid, snake, food, obstacles]);

    // Check for high score on game over
    useEffect(() => {
        if (status === 'GAME_OVER' && score > 0) {
            const isNew = saveHighScore(difficulty, score);
            setIsNewHighScore(isNew);
            if (isNew) setHighScores(getHighScores());
        }
    }, [status, score, difficulty]);

    // Cleanup power-up timers on unmount
    useEffect(() => {
        return () => {
            Object.values(powerUpTimersRef.current).forEach(clearTimeout);
        };
    }, []);

    const activatePowerUp = useCallback((type) => {
        SoundManager.powerUp();
        setLastEvent((prev) => ({ type: 'powerup', x: 0, y: 0 }));

        if (type === 'shield') {
            setActivePowerUps((prev) => ({ ...prev, shield: true }));
            // Shield doesn't expire on time — it expires on use
        } else {
            setActivePowerUps((prev) => ({ ...prev, [type]: true }));
            // Clear existing timer for this type
            if (powerUpTimersRef.current[type]) {
                clearTimeout(powerUpTimersRef.current[type]);
            }
            const duration = POWER_UP_TYPES[type].duration;
            powerUpTimersRef.current[type] = setTimeout(() => {
                setActivePowerUps((prev) => {
                    const next = { ...prev };
                    delete next[type];
                    return next;
                });
            }, duration);
        }
    }, []);

    const startGame = useCallback((selectedDifficulty) => {
        if (selectedDifficulty) setDifficulty(selectedDifficulty);
        setSnake(INITIAL_SNAKE);
        setDirection(INITIAL_DIRECTION);
        setScore(0);
        setLevel(1);
        setObstacles([]);
        setCombo(0);
        setMaxCombo(0);
        setTotalFoodEaten(0);
        setActivePowerUps({});
        setPowerUpOnGrid(null);
        setIsNewHighScore(false);
        setScreenShake(false);
        setLevelUpFlash(false);
        setLastEvent(null);
        setStatus('PLAYING');
        setFood(generateFood(INITIAL_SNAKE, []));
        Object.values(powerUpTimersRef.current).forEach(clearTimeout);
        powerUpTimersRef.current = {};
    }, []);

    const pauseGame = useCallback(() => {
        setStatus((prev) => (prev === 'PLAYING' ? 'PAUSED' : 'PLAYING'));
    }, []);

    const resetGame = useCallback(() => {
        setStatus('IDLE');
        setSnake(INITIAL_SNAKE);
        setScore(0);
    }, []);

    const moveSnake = useCallback(() => {
        if (status !== 'PLAYING') return;

        const head = snake[0];
        const newHead = {
            x: head.x + direction.x,
            y: head.y + direction.y,
        };

        const collisionResult = checkCollision(newHead, snake, obstacles, !!activePowerUps.shield);

        if (collisionResult === 'dead') {
            SoundManager.die();
            setScreenShake(true);
            setLastEvent({ type: 'die', x: head.x, y: head.y });
            setTimeout(() => setScreenShake(false), 400);
            setStatus('GAME_OVER');
            return;
        }

        if (collisionResult === 'shield') {
            // Shield absorbed the hit — wrap around walls or push back
            SoundManager.eat();
            setActivePowerUps((prev) => {
                const next = { ...prev };
                delete next.shield;
                return next;
            });
            // Wrap position for wall collision
            const wrapped = {
                x: (newHead.x + GRID_SIZE) % GRID_SIZE,
                y: (newHead.y + GRID_SIZE) % GRID_SIZE,
            };
            const newSnake = [wrapped, ...snake];
            newSnake.pop();
            setSnake(newSnake);
            return;
        }

        const newSnake = [newHead, ...snake];

        // Check food
        if (newHead.x === food.x && newHead.y === food.y) {
            const foodType = FOOD_TYPES[food.type] || FOOD_TYPES.cherry;
            const now = Date.now();

            // Combo logic
            let newCombo = 0;
            if (now - lastEatTime < COMBO_WINDOW) {
                newCombo = combo + 1;
                SoundManager.combo(newCombo);
            }
            setCombo(newCombo);
            setLastEatTime(now);
            setMaxCombo((prev) => Math.max(prev, newCombo));

            // Calculate points
            const comboMultiplier = 1 + (newCombo * 0.5); // 1x, 1.5x, 2x, 2.5x...
            const doubleMultiplier = activePowerUps.doublePoints ? 2 : 1;
            const points = Math.round(foodType.points * comboMultiplier * doubleMultiplier);

            setScore((s) => s + points);
            setTotalFoodEaten((t) => t + 1);
            setLastEvent({ type: 'eat', x: food.x, y: food.y, color: foodType.color, points });

            if (food.type === 'star') {
                SoundManager.eatStar();
            } else {
                SoundManager.eat();
            }

            setFood(generateFood(newSnake, obstacles));
            setSnake(newSnake);
        } else {
            // Check power-up pickup
            if (powerUpOnGrid && newHead.x === powerUpOnGrid.x && newHead.y === powerUpOnGrid.y) {
                activatePowerUp(powerUpOnGrid.type);
                setPowerUpOnGrid(null);
            }

            newSnake.pop();
            setSnake(newSnake);
        }
    }, [snake, direction, status, food, obstacles, activePowerUps, combo, lastEatTime, powerUpOnGrid, activatePowerUp]);

    useInterval(moveSnake, status === 'PLAYING' ? speed : null);

    // Shared direction change
    const changeDirection = useCallback((newDir) => {
        if (status !== 'PLAYING') return;
        if (newDir === 'UP' && direction.y === 0) setDirection({ x: 0, y: -1 });
        if (newDir === 'DOWN' && direction.y === 0) setDirection({ x: 0, y: 1 });
        if (newDir === 'LEFT' && direction.x === 0) setDirection({ x: -1, y: 0 });
        if (newDir === 'RIGHT' && direction.x === 0) setDirection({ x: 1, y: 0 });
    }, [direction, status]);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e) => {
            switch (e.key) {
                case 'ArrowUp': changeDirection('UP'); break;
                case 'ArrowDown': changeDirection('DOWN'); break;
                case 'ArrowLeft': changeDirection('LEFT'); break;
                case 'ArrowRight': changeDirection('RIGHT'); break;
                default: break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [changeDirection]);

    return {
        snake,
        food,
        score,
        speed,
        status,
        difficulty,
        highScores,
        isNewHighScore,
        level,
        obstacles,
        combo,
        maxCombo,
        totalFoodEaten,
        activePowerUps,
        powerUpOnGrid,
        screenShake,
        levelUpFlash,
        lastEvent,
        changeDirection,
        startGame,
        pauseGame,
        resetGame,
        GRID_SIZE,
    };
};

export default useSnakeGame;
