import React from 'react';
import { motion } from 'motion/react';
import { GRID_SIZE } from '../utils/gameUtils';

const CELL_PERCENT = 100 / GRID_SIZE;

const SnakeSegment = ({ x, y, isHead, index, total, hasShield }) => {
    // Gradient opacity: head = 1.0, tail fades to 0.45
    const opacity = total > 1 ? 1 - (index / total) * 0.55 : 1;

    return (
        <motion.div
            layout
            initial={false}
            transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
            }}
            style={{
                width: `${CELL_PERCENT}%`,
                height: `${CELL_PERCENT}%`,
                position: 'absolute',
                top: `${(y / GRID_SIZE) * 100}%`,
                left: `${(x / GRID_SIZE) * 100}%`,
                zIndex: isHead ? 20 : 10,
                opacity,
            }}
            className="snake-segment"
        >
            <div className={`snake-body ${isHead ? 'snake-head' : ''} ${isHead && hasShield ? 'snake-shielded' : ''}`}>
                {isHead && (
                    <div className="snake-eyes">
                        <div className="snake-eye" />
                        <div className="snake-eye" />
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default SnakeSegment;
