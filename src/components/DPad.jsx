import React from 'react';
import { motion } from 'motion/react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const DPad = ({ onDirection }) => {
    return (
        <div className="dpad-container">
            <div className="dpad-row">
                <motion.button
                    whileTap={{ scale: 0.85 }}
                    className="dpad-btn"
                    onClick={() => onDirection('UP')}
                    aria-label="Move Up"
                >
                    <ChevronUp size={22} />
                </motion.button>
            </div>
            <div className="dpad-row">
                <motion.button
                    whileTap={{ scale: 0.85 }}
                    className="dpad-btn"
                    onClick={() => onDirection('LEFT')}
                    aria-label="Move Left"
                >
                    <ChevronLeft size={22} />
                </motion.button>
                <div className="dpad-center" />
                <motion.button
                    whileTap={{ scale: 0.85 }}
                    className="dpad-btn"
                    onClick={() => onDirection('RIGHT')}
                    aria-label="Move Right"
                >
                    <ChevronRight size={22} />
                </motion.button>
            </div>
            <div className="dpad-row">
                <motion.button
                    whileTap={{ scale: 0.85 }}
                    className="dpad-btn"
                    onClick={() => onDirection('DOWN')}
                    aria-label="Move Down"
                >
                    <ChevronDown size={22} />
                </motion.button>
            </div>
        </div>
    );
};

export default DPad;
