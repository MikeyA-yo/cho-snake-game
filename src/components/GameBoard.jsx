import React, { useRef, useCallback } from 'react';
import useSnakeGame from '../hooks/useSnakeGame';
import SnakeSegment from './SnakeSegment';
import FoodItem from './FoodItem';
import GameOverlay from './GameOverlay';
import DPad from './DPad';
import { Trophy, Crown, Pause } from 'lucide-react';
import { DIFFICULTY_MODES } from '../hooks/useSnakeGame';

const SWIPE_THRESHOLD = 30;

const PauseHandler = ({ pauseGame }) => {
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                pauseGame();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [pauseGame]);
    return null;
};

const GameBoard = () => {
    const {
        snake, food, score, speed, status, difficulty,
        highScores, isNewHighScore, changeDirection,
        startGame, pauseGame, GRID_SIZE: gridSize
    } = useSnakeGame();

    const modeLabel = DIFFICULTY_MODES[difficulty]?.label || 'Easy';
    const speedLabel = speed >= 250 ? 'Slow' : speed >= 180 ? 'Normal' : speed >= 120 ? 'Fast' : 'Insane';
    const currentHighScore = highScores[difficulty] || 0;

    // --- Swipe / Touch handling ---
    const touchStart = useRef(null);

    const handleTouchStart = useCallback((e) => {
        const touch = e.touches[0];
        touchStart.current = { x: touch.clientX, y: touch.clientY };
    }, []);

    const handleTouchEnd = useCallback((e) => {
        if (!touchStart.current) return;
        const touch = e.changedTouches[0];
        const dx = touch.clientX - touchStart.current.x;
        const dy = touch.clientY - touchStart.current.y;

        if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return;

        if (Math.abs(dx) > Math.abs(dy)) {
            changeDirection(dx > 0 ? 'RIGHT' : 'LEFT');
        } else {
            changeDirection(dy > 0 ? 'DOWN' : 'UP');
        }
        touchStart.current = null;
    }, [changeDirection]);

    // --- Mouse drag handling ---
    const mouseStart = useRef(null);

    const handleMouseDown = useCallback((e) => {
        mouseStart.current = { x: e.clientX, y: e.clientY };
    }, []);

    const handleMouseUp = useCallback((e) => {
        if (!mouseStart.current) return;
        const dx = e.clientX - mouseStart.current.x;
        const dy = e.clientY - mouseStart.current.y;

        if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return;

        if (Math.abs(dx) > Math.abs(dy)) {
            changeDirection(dx > 0 ? 'RIGHT' : 'LEFT');
        } else {
            changeDirection(dy > 0 ? 'DOWN' : 'UP');
        }
        mouseStart.current = null;
    }, [changeDirection]);

    return (
        <div className="gameboard-wrapper">
            {/* Score HUD */}
            <div className="score-hud">
                <Trophy className="score-icon" size={18} />
                <span className="score-value">{score}</span>
                <span className="hud-divider">|</span>
                <Crown size={14} className="highscore-icon" />
                <span className="highscore-value">{currentHighScore}</span>
                <span className="speed-indicator">⚡ {modeLabel}</span>

                {/* Pause button for mobile */}
                {status === 'PLAYING' && (
                    <button className="pause-btn" onClick={pauseGame} aria-label="Pause">
                        <Pause size={16} />
                    </button>
                )}
            </div>

            {/* Board + D-Pad side by side */}
            <div className="board-row">
                {/* Game Grid */}
                <div
                    className="game-grid"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                >
                    <div
                        className="grid-pattern"
                        style={{
                            backgroundImage:
                                'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)',
                            backgroundSize: `${100 / gridSize}% ${100 / gridSize}%`,
                        }}
                    />

                    {snake.map((segment, index) => (
                        <SnakeSegment
                            key={index}
                            x={segment.x}
                            y={segment.y}
                            isHead={index === 0}
                        />
                    ))}

                    <FoodItem x={food.x} y={food.y} />

                    <GameOverlay
                        status={status}
                        startGame={startGame}
                        score={score}
                        currentDifficulty={difficulty}
                        highScores={highScores}
                        isNewHighScore={isNewHighScore}
                    />
                </div>

                {/* D-Pad beside the board */}
                <DPad onDirection={changeDirection} />
            </div>

            {/* Controls Hint */}
            <div className="controls-hint">
                <b>Arrow Keys</b> · <b>Swipe</b> · <b>D-Pad</b> · <b>Space</b> to Pause
            </div>

            <PauseHandler pauseGame={pauseGame} />
        </div>
    );
};

export default GameBoard;
