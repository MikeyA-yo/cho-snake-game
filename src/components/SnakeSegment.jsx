import React from 'react';
import { motion } from 'motion/react';
import { GRID_SIZE } from '../utils/gameUtils';

const CELL_PERCENT = 100 / GRID_SIZE;

const SnakeSegment = ({ x, y, isHead }) => {
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
            }}
            className="snake-segment"
        >
            <div className={isHead ? 'snake-body snake-head' : 'snake-body'}>
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
