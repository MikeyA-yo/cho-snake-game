import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DIFFICULTY_MODES } from '../hooks/useSnakeGame';

const modeKeys = Object.keys(DIFFICULTY_MODES);

const GameOverlay = ({ status, startGame, score, currentDifficulty, highScores, isNewHighScore }) => {
    const [selectedMode, setSelectedMode] = useState(currentDifficulty || 'easy');

    useEffect(() => {
        if (status === 'GAME_OVER' && score > 0) {
            confetti({
                particleCount: 150,
                spread: 80,
                origin: { y: 0.6 },
                colors: ['#22c55e', '#d946ef', '#f59e0b'],
            });
        }
    }, [status, score]);

    if (status === 'PLAYING') return null;

    const handleStart = () => {
        startGame(selectedMode);
    };

    return (
        <AnimatePresence>
            {(status === 'IDLE' || status === 'GAME_OVER' || status === 'PAUSED') && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="game-overlay"
                >
                    {status === 'GAME_OVER' && (
                        <motion.div
                            initial={{ scale: 0.8, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            style={{ marginBottom: '1rem' }}
                        >
                            <h2 className="overlay-gameover-title">GAME OVER</h2>
                            <p className="overlay-score-text">
                                Final Score: <span className="overlay-score-value">{score}</span>
                            </p>
                            {isNewHighScore && (
                                <motion.div
                                    initial={{ scale: 0, rotate: -10 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.3 }}
                                    className="new-highscore-badge"
                                >
                                    <Star size={16} fill="currentColor" />
                                    NEW HIGH SCORE!
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {status === 'IDLE' && (
                        <div style={{ marginBottom: '1rem' }}>
                            <h2 className="overlay-idle-title">Ready to Play?</h2>
                            <p className="overlay-idle-subtitle">Use Arrow Keys or Swipe</p>
                        </div>
                    )}

                    {status === 'PAUSED' && (
                        <h2 className="overlay-paused-title">PAUSED</h2>
                    )}

                    {/* Mode Selector — shown on IDLE and GAME_OVER */}
                    {(status === 'IDLE' || status === 'GAME_OVER') && (
                        <div className="mode-selector">
                            <span className="mode-selector-title">Select Difficulty</span>
                            <div className="mode-buttons">
                                {modeKeys.map((key) => (
                                    <button
                                        key={key}
                                        className={`mode-btn ${key} ${selectedMode === key ? 'active' : ''}`}
                                        onClick={() => setSelectedMode(key)}
                                    >
                                        {DIFFICULTY_MODES[key].label}
                                    </button>
                                ))}
                            </div>
                            <span className="mode-description">
                                {DIFFICULTY_MODES[selectedMode].description}
                            </span>
                            {highScores && highScores[selectedMode] > 0 && (
                                <span className="mode-highscore">
                                    Best: {highScores[selectedMode]}
                                </span>
                            )}
                        </div>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleStart}
                        className="overlay-button"
                    >
                        <Play size={20} />
                        {status === 'PAUSED'
                            ? 'Resume Game'
                            : status === 'GAME_OVER'
                                ? 'Try Again'
                                : 'Start Game'}
                    </motion.button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default GameOverlay;
