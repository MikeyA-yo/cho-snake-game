export const GRID_SIZE = 20; // 20x20 grid
export const INITIAL_SNAKE = [{ x: 10, y: 10 }];
export const INITIAL_DIRECTION = { x: 0, y: -1 }; // Moving Up initially
export const GAME_SPEED = 150; // ms per tick

export const CAMERAS = {
    xy: { rotX: 0, rotY: 0, rotZ: 0 },
};

// Helper to generate a random position not occupied by the snake
export const generateFood = (snake) => {
    let newFood;
    while (true) {
        newFood = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
        };
        const isOnSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
        if (!isOnSnake) break;
    }
    return newFood;
};

// Check for collisions with walls or self
export const checkCollision = (head, snake) => {
    // Wall collision
    if (
        head.x < 0 ||
        head.x >= GRID_SIZE ||
        head.y < 0 ||
        head.y >= GRID_SIZE
    ) {
        return true;
    }

    // Self collision (ignore head which is index 0, so start loop from 1)
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }

    return false;
};
