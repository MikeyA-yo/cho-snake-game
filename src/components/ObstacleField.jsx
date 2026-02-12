import React from 'react';
import { motion } from 'motion/react';
import { GRID_SIZE } from '../utils/gameUtils';

const CELL_PERCENT = 100 / GRID_SIZE;

const Obstacle = ({ x, y }) => {
    return (
        <div
            className="obstacle-cell"
            style={{
                width: `${CELL_PERCENT}%`,
                height: `${CELL_PERCENT}%`,
                position: 'absolute',
                top: `${(y / GRID_SIZE) * 100}%`,
                left: `${(x / GRID_SIZE) * 100}%`,
            }}
        />
    );
};

const ObstacleField = ({ obstacles }) => {
    return obstacles.map((obs, i) => (
        <Obstacle key={`obs-${i}`} x={obs.x} y={obs.y} />
    ));
};

export default ObstacleField;
