import React, { useRef, useCallback, useState, useEffect } from 'react';
import useSnakeGame from '../hooks/useSnakeGame';
import SnakeSegment from './SnakeSegment';
import FoodItem from './FoodItem';
import PowerUpItem from './PowerUpItem';
import ObstacleField from './ObstacleField';
import ParticleCanvas from './ParticleCanvas';
import GameOverlay from './GameOverlay';
import DPad from './DPad';
import { Trophy, Crown, Pause, Zap } from 'lucide-react';
import { DIFFICULTY_MODES } from '../hooks/useSnakeGame';
import { POWER_UP_TYPES } from '../utils/gameUtils';

const SWIPE_THRESHOLD = 30;

const PauseHandler = ({ pauseGame }) => {
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space') { e.preventDefault(); pauseGame(); }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [pauseGame]);
    return null;
};

const GameBoard = () => {
    const {
        snake, food, score, status, difficulty,
        highScores, isNewHighScore, level, obstacles,
        combo, maxCombo, totalFoodEaten, activePowerUps,
        powerUpOnGrid, screenShake, levelUpFlash, lastEvent,
        changeDirection, startGame, pauseGame, GRID_SIZE: gridSize,
    } = useSnakeGame();

    const particleRef = useRef(null);
    const boardRef = useRef(null);
    const [boardSize, setBoardSize] = useState(420);

    // Measure board for particle canvas
    useEffect(() => {
        const measure = () => {
            if (boardRef.current) setBoardSize(Math.round(boardRef.current.getBoundingClientRect().width));
        };
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, []);

    // Particle reactions
    useEffect(() => {
        if (!lastEvent || !particleRef.current) return;
        const p = particleRef.current;
        if (lastEvent.type === 'eat') p.burst(lastEvent.x, lastEvent.y, lastEvent.color, 15, 3.5);
        else if (lastEvent.type === 'die') p.explode(lastEvent.x, lastEvent.y);
        else if (lastEvent.type === 'levelup') p.burst(10, 10, '#facc15', 25, 5);
        else if (lastEvent.type === 'powerup') p.burst(10, 10, '#38bdf8', 20, 4);
    }, [lastEvent]);

    // Snake head trail
    useEffect(() => {
        if (status === 'PLAYING' && particleRef.current && snake.length > 0) {
            particleRef.current.trail(snake[0].x, snake[0].y, '#10b981');
        }
    }, [snake, status]);

    const modeLabel = DIFFICULTY_MODES[difficulty]?.label || 'Easy';
    const currentHighScore = highScores[difficulty] || 0;

    // --- Touch swipe — only preventDefault during PLAYING ---
    const touchStart = useRef(null);
    const statusRef = useRef(status);
    statusRef.current = status;

    useEffect(() => {
        const el = boardRef.current;
        if (!el) return;

        const onTouchStart = (e) => {
            if (statusRef.current === 'PLAYING') e.preventDefault();
            touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        };
        const onTouchMove = (e) => {
            if (statusRef.current === 'PLAYING') e.preventDefault();
        };
        const onTouchEnd = (e) => {
            if (statusRef.current !== 'PLAYING') return; // let taps through on overlay
            e.preventDefault();
            if (!touchStart.current) return;
            const dx = e.changedTouches[0].clientX - touchStart.current.x;
            const dy = e.changedTouches[0].clientY - touchStart.current.y;
            if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return;
            if (Math.abs(dx) > Math.abs(dy)) changeDirection(dx > 0 ? 'RIGHT' : 'LEFT');
            else changeDirection(dy > 0 ? 'DOWN' : 'UP');
            touchStart.current = null;
        };

        el.addEventListener('touchstart', onTouchStart, { passive: false });
        el.addEventListener('touchmove', onTouchMove, { passive: false });
        el.addEventListener('touchend', onTouchEnd, { passive: false });
        return () => {
            el.removeEventListener('touchstart', onTouchStart);
            el.removeEventListener('touchmove', onTouchMove);
            el.removeEventListener('touchend', onTouchEnd);
        };
    }, [changeDirection]);

    // --- Mouse drag ---
    const mouseStart = useRef(null);
    const handleMouseDown = useCallback((e) => { mouseStart.current = { x: e.clientX, y: e.clientY }; }, []);
    const handleMouseUp = useCallback((e) => {
        if (!mouseStart.current) return;
        const dx = e.clientX - mouseStart.current.x;
        const dy = e.clientY - mouseStart.current.y;
        if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return;
        if (Math.abs(dx) > Math.abs(dy)) changeDirection(dx > 0 ? 'RIGHT' : 'LEFT');
        else changeDirection(dy > 0 ? 'DOWN' : 'UP');
        mouseStart.current = null;
    }, [changeDirection]);

    return (
        <div className="gameboard-wrapper">
            {/* HUD */}
            <div className="score-hud">
                <Trophy className="score-icon" size={18} />
                <span className="score-value">{score}</span>
                <span className="hud-divider">|</span>
                <Crown size={14} className="highscore-icon" />
                <span className="highscore-value">{currentHighScore}</span>
                <span className="hud-divider">|</span>
                <span className="level-badge">Lv.{level}</span>
                <span className="speed-indicator">⚡ {modeLabel}</span>
                {combo > 0 && <span className="combo-badge"><Zap size={12} /> {combo}x</span>}
                {Object.keys(activePowerUps).map((key) => (
                    <span key={key} className={`powerup-badge powerup-${key}`}>{POWER_UP_TYPES[key]?.icon}</span>
                ))}
                {status === 'PLAYING' && (
                    <button className="pause-btn" onClick={pauseGame} aria-label="Pause"><Pause size={16} /></button>
                )}
            </div>

            {/* Board + D-Pad */}
            <div className="board-row">
                <div
                    ref={boardRef}
                    className={`game-grid ${screenShake ? 'shake' : ''} ${levelUpFlash ? 'level-flash' : ''}`}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                >
                    <div className="grid-pattern" style={{
                        backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)',
                        backgroundSize: `${100 / gridSize}% ${100 / gridSize}%`,
                    }} />
                    <ParticleCanvas ref={particleRef} width={boardSize} height={boardSize} />
                    <ObstacleField obstacles={obstacles} />
                    {snake.map((seg, i) => (
                        <SnakeSegment key={i} x={seg.x} y={seg.y} isHead={i === 0} index={i} total={snake.length} hasShield={!!activePowerUps.shield} />
                    ))}
                    <FoodItem x={food.x} y={food.y} type={food.type} />
                    {powerUpOnGrid && <PowerUpItem x={powerUpOnGrid.x} y={powerUpOnGrid.y} type={powerUpOnGrid.type} />}
                    <GameOverlay
                        status={status} startGame={startGame} score={score}
                        currentDifficulty={difficulty} highScores={highScores}
                        isNewHighScore={isNewHighScore} level={level}
                        maxCombo={maxCombo} totalFoodEaten={totalFoodEaten}
                    />
                </div>
                <DPad onDirection={changeDirection} />
            </div>

            <div className="controls-hint">
                <b>Arrow Keys</b> · <b>Swipe</b> · <b>D-Pad</b> · <b>Space</b> to Pause
            </div>
            <PauseHandler pauseGame={pauseGame} />
        </div>
    );
};

export default GameBoard;
