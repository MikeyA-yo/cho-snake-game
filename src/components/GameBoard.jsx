import React from 'react';
import useSnakeGame from '../hooks/useSnakeGame';
import SnakeSegment from './SnakeSegment';
import FoodItem from './FoodItem';
import GameOverlay from './GameOverlay';
import { Trophy } from 'lucide-react';
import { DIFFICULTY_MODES } from '../hooks/useSnakeGame';

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
    const { snake, food, score, speed, status, difficulty, startGame, pauseGame, GRID_SIZE: gridSize } = useSnakeGame();

    const modeLabel = DIFFICULTY_MODES[difficulty]?.label || 'Easy';
    const speedLabel = speed >= 250 ? 'Slow' : speed >= 180 ? 'Normal' : speed >= 120 ? 'Fast' : 'Insane';

    return (
        <div className="gameboard-wrapper">
            {/* Score HUD */}
            <div className="score-hud">
                <Trophy className="score-icon" size={22} />
                <span className="score-value">{score}</span>
                <span className="speed-indicator">⚡ {modeLabel} · {speedLabel}</span>
            </div>

            {/* Game Grid */}
            <div className="game-grid">
                {/* Grid Background Pattern */}
                <div
                    className="grid-pattern"
                    style={{
                        backgroundImage:
                            'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)',
                        backgroundSize: `${100 / gridSize}% ${100 / gridSize}%`,
                    }}
                />

                {/* Snake */}
                {snake.map((segment, index) => (
                    <SnakeSegment
                        key={index}
                        x={segment.x}
                        y={segment.y}
                        isHead={index === 0}
                    />
                ))}

                {/* Food */}
                <FoodItem x={food.x} y={food.y} />

                {/* Overlay */}
                <GameOverlay status={status} startGame={startGame} score={score} currentDifficulty={difficulty} />
            </div>

            {/* Controls Hint */}
            <div className="controls-hint">
                Press <b>Space</b> to Pause · <b>Arrow Keys</b> to Move
            </div>

            <PauseHandler pauseGame={pauseGame} />
        </div>
    );
};

export default GameBoard;
