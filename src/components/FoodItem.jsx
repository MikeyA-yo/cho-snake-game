import React from 'react';
import { motion } from 'motion/react';
import { Apple } from 'lucide-react';
import { GRID_SIZE } from '../utils/gameUtils';

const CELL_PERCENT = 100 / GRID_SIZE;

const FoodItem = ({ x, y }) => {
    return (
        <motion.div
            key={`${x}-${y}`}
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            exit={{ scale: 0 }}
            transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
            }}
            style={{
                width: `${CELL_PERCENT}%`,
                height: `${CELL_PERCENT}%`,
                position: 'absolute',
                top: `${(y / GRID_SIZE) * 100}%`,
                left: `${(x / GRID_SIZE) * 100}%`,
                zIndex: 5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <div className="food-icon">
                <Apple size="80%" fill="currentColor" />
            </div>
        </motion.div>
    );
};

export default FoodItem;
