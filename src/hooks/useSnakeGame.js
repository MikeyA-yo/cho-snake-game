import { useState, useCallback, useEffect, useMemo } from 'react';
import useInterval from './useInterval';
import {
    GRID_SIZE,
    INITIAL_SNAKE,
    INITIAL_DIRECTION,
    generateFood,
    checkCollision,
} from '../utils/gameUtils';

// Difficulty presets: [baseSpeed, minSpeed, speedDecrease]
export const DIFFICULTY_MODES = {
    easy: { label: 'Easy', baseSpeed: 320, minSpeed: 120, speedDecrease: 6, description: 'Relaxed pace, perfect for beginners' },
    medium: { label: 'Medium', baseSpeed: 220, minSpeed: 90, speedDecrease: 7, description: 'A balanced challenge' },
    hard: { label: 'Hard', baseSpeed: 150, minSpeed: 65, speedDecrease: 8, description: 'Fast reflexes required' },
    crazy: { label: 'Crazy', baseSpeed: 90, minSpeed: 40, speedDecrease: 5, description: 'Pure chaos. Good luck.' },
};

const useSnakeGame = () => {
    const [snake, setSnake] = useState(INITIAL_SNAKE);
    const [food, setFood] = useState({ x: 5, y: 5 });
    const [direction, setDirection] = useState(INITIAL_DIRECTION);
    const [status, setStatus] = useState('IDLE');
    const [score, setScore] = useState(0);
    const [difficulty, setDifficulty] = useState('easy');

    const mode = DIFFICULTY_MODES[difficulty];

    // Dynamic speed: gets faster as the snake grows
    const speed = useMemo(() => {
        const foodsEaten = snake.length - 1;
        const currentSpeed = mode.baseSpeed - (foodsEaten * mode.speedDecrease);
        return Math.max(currentSpeed, mode.minSpeed);
    }, [snake.length, mode]);

    // Initialize food on mount
    useEffect(() => {
        setFood(generateFood(INITIAL_SNAKE));
    }, []);

    const startGame = useCallback((selectedDifficulty) => {
        if (selectedDifficulty) setDifficulty(selectedDifficulty);
        setSnake(INITIAL_SNAKE);
        setDirection(INITIAL_DIRECTION);
        setScore(0);
        setStatus('PLAYING');
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

    // Game Loop — uses dynamic speed
    useInterval(moveSnake, status === 'PLAYING' ? speed : null);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (status !== 'PLAYING') return;

            switch (e.key) {
                case 'ArrowUp':
                    if (direction.y === 0) setDirection({ x: 0, y: -1 });
                    break;
                case 'ArrowDown':
                    if (direction.y === 0) setDirection({ x: 0, y: 1 });
                    break;
                case 'ArrowLeft':
                    if (direction.x === 0) setDirection({ x: -1, y: 0 });
                    break;
                case 'ArrowRight':
                    if (direction.x === 0) setDirection({ x: 1, y: 0 });
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [direction, status]);

    return {
        snake,
        food,
        score,
        speed,
        status,
        difficulty,
        startGame,
        pauseGame,
        resetGame,
        GRID_SIZE,
    };
};

export default useSnakeGame;
