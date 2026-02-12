import React from 'react';
import { motion } from 'motion/react';
import { GRID_SIZE, POWER_UP_TYPES } from '../utils/gameUtils';

const CELL_PERCENT = 100 / GRID_SIZE;

const PowerUpItem = ({ x, y, type }) => {
    const puDef = POWER_UP_TYPES[type];
    if (!puDef) return null;

    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{
                scale: [0.8, 1.1, 0.9, 1],
                opacity: 1,
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatType: 'reverse',
                repeatDelay: 0.8,
            }}
            style={{
                width: `${CELL_PERCENT}%`,
                height: `${CELL_PERCENT}%`,
                position: 'absolute',
                top: `${(y / GRID_SIZE) * 100}%`,
                left: `${(x / GRID_SIZE) * 100}%`,
                zIndex: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <div
                className="powerup-cell"
                style={{
                    borderColor: puDef.color,
                    boxShadow: `0 0 14px ${puDef.color}66, 0 0 28px ${puDef.color}33`,
                }}
            >
                <span style={{ fontSize: '14px', lineHeight: 1 }}>{puDef.icon}</span>
            </div>
        </motion.div>
    );
};

export default PowerUpItem;
