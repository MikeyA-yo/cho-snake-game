import { useState, useCallback, useEffect, useMemo } from 'react';
import useInterval from './useInterval';
import {
    GRID_SIZE,
    INITIAL_SNAKE,
    INITIAL_DIRECTION,
    generateFood,
    checkCollision,
} from '../utils/gameUtils';

// Difficulty presets
export const DIFFICULTY_MODES = {
    easy: { label: 'Easy', baseSpeed: 320, minSpeed: 120, speedDecrease: 6, description: 'Relaxed pace, perfect for beginners' },
    medium: { label: 'Medium', baseSpeed: 220, minSpeed: 90, speedDecrease: 7, description: 'A balanced challenge' },
    hard: { label: 'Hard', baseSpeed: 150, minSpeed: 65, speedDecrease: 8, description: 'Fast reflexes required' },
    crazy: { label: 'Crazy', baseSpeed: 90, minSpeed: 40, speedDecrease: 5, description: 'Pure chaos. Good luck.' },
};

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
        return true; // new high score!
    }
    return false;
};

const useSnakeGame = () => {
    const [snake, setSnake] = useState(INITIAL_SNAKE);
    const [food, setFood] = useState({ x: 5, y: 5 });
    const [direction, setDirection] = useState(INITIAL_DIRECTION);
    const [status, setStatus] = useState('IDLE');
    const [score, setScore] = useState(0);
    const [difficulty, setDifficulty] = useState('easy');
    const [highScores, setHighScores] = useState(getHighScores);
    const [isNewHighScore, setIsNewHighScore] = useState(false);

    const mode = DIFFICULTY_MODES[difficulty];

    // Dynamic speed
    const speed = useMemo(() => {
        const foodsEaten = snake.length - 1;
        const currentSpeed = mode.baseSpeed - (foodsEaten * mode.speedDecrease);
        return Math.max(currentSpeed, mode.minSpeed);
    }, [snake.length, mode]);

    useEffect(() => {
        setFood(generateFood(INITIAL_SNAKE));
    }, []);

    // Check for high score on game over
    useEffect(() => {
        if (status === 'GAME_OVER' && score > 0) {
            const isNew = saveHighScore(difficulty, score);
            setIsNewHighScore(isNew);
            if (isNew) setHighScores(getHighScores());
        }
    }, [status, score, difficulty]);

    const startGame = useCallback((selectedDifficulty) => {
        if (selectedDifficulty) setDifficulty(selectedDifficulty);
        setSnake(INITIAL_SNAKE);
        setDirection(INITIAL_DIRECTION);
        setScore(0);
        setStatus('PLAYING');
        setIsNewHighScore(false);
        setFood(generateFood(INITIAL_SNAKE));
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

        if (checkCollision(newHead, snake)) {
            setStatus('GAME_OVER');
            return;
        }

        const newSnake = [newHead, ...snake];

        if (newHead.x === food.x && newHead.y === food.y) {
            setScore((s) => s + 10);
            setFood(generateFood(newSnake));
            setSnake(newSnake);
        } else {
            newSnake.pop();
            setSnake(newSnake);
        }
    }, [snake, direction, status, food]);

    useInterval(moveSnake, status === 'PLAYING' ? speed : null);

    // Shared direction change logic
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
        changeDirection,
        startGame,
        pauseGame,
        resetGame,
        GRID_SIZE,
    };
};

export default useSnakeGame;
