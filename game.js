// Game constants
const GRID_SIZE = 20;
const CANVAS_SIZE = 400;
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 5;
const MIN_SPEED = 50;

// Game state
let canvas, ctx;
let worm = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let food = { x: 0, y: 0 };
let score = 0;
let highScore = 0;
let gameLoop = null;
let isPaused = false;
let gameSpeed = INITIAL_SPEED;

// Colors
const WORM_COLOR = '#00ff00';
const WORM_HEAD_COLOR = '#00cc00';
const FOOD_COLOR = '#ff0000';
const GRID_COLOR = '#111';

// Initialize game
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Load high score from localStorage
    highScore = parseInt(localStorage.getItem('wormHighScore')) || 0;
    document.getElementById('highScore').textContent = highScore;
    
    // Event listeners
    document.addEventListener('keydown', handleKeyPress);
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('pauseBtn').addEventListener('click', togglePause);
    document.getElementById('restartBtn').addEventListener('click', restartGame);
    
    // Direction button event listeners
    document.getElementById('upBtn').addEventListener('click', () => handleDirectionButton('up'));
    document.getElementById('downBtn').addEventListener('click', () => handleDirectionButton('down'));
    document.getElementById('leftBtn').addEventListener('click', () => handleDirectionButton('left'));
    document.getElementById('rightBtn').addEventListener('click', () => handleDirectionButton('right'));
    
    // Touch event support for mobile - prevent default to avoid scrolling
    document.getElementById('upBtn').addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleDirectionButton('up');
    });
    document.getElementById('downBtn').addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleDirectionButton('down');
    });
    document.getElementById('leftBtn').addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleDirectionButton('left');
    });
    document.getElementById('rightBtn').addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleDirectionButton('right');
    });
    
    // Initialize worm in the center
    resetGame();
    drawGame();
}

function resetGame() {
    worm = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    gameSpeed = INITIAL_SPEED;
    updateScore();
    spawnFood();
    isPaused = false;
    document.getElementById('pauseBtn').textContent = '일시정지';
}

function startGame() {
    if (gameLoop) {
        clearInterval(gameLoop);
    }
    resetGame();
    document.getElementById('gameOver').classList.add('hidden');
    gameLoop = setInterval(update, gameSpeed);
}

function togglePause() {
    if (!gameLoop) return;
    
    isPaused = !isPaused;
    document.getElementById('pauseBtn').textContent = isPaused ? '계속하기' : '일시정지';
}

function restartGame() {
    startGame();
}

function update() {
    if (isPaused) return;
    
    // Update direction
    direction = { ...nextDirection };
    
    // Calculate new head position
    const head = { ...worm[0] };
    head.x += direction.x;
    head.y += direction.y;
    
    // Check wall collision
    if (head.x < 0 || head.x >= CANVAS_SIZE / GRID_SIZE || 
        head.y < 0 || head.y >= CANVAS_SIZE / GRID_SIZE) {
        gameOver();
        return;
    }
    
    // Check self collision
    if (worm.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }
    
    // Add new head
    worm.unshift(head);
    
    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        updateScore();
        spawnFood();
        
        // Increase speed slightly
        if (gameSpeed > MIN_SPEED) {
            gameSpeed -= SPEED_INCREMENT;
            clearInterval(gameLoop);
            gameLoop = setInterval(update, gameSpeed);
        }
    } else {
        // Remove tail if no food eaten
        worm.pop();
    }
    
    drawGame();
}

function drawGame() {
    // Clear canvas
    ctx.fillStyle = GRID_COLOR;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Draw grid
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    for (let i = 0; i <= CANVAS_SIZE; i += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, CANVAS_SIZE);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(CANVAS_SIZE, i);
        ctx.stroke();
    }
    
    // Draw worm
    worm.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? WORM_HEAD_COLOR : WORM_COLOR;
        ctx.fillRect(
            segment.x * GRID_SIZE + 1,
            segment.y * GRID_SIZE + 1,
            GRID_SIZE - 2,
            GRID_SIZE - 2
        );
        
        // Add eyes to head
        if (index === 0) {
            ctx.fillStyle = '#fff';
            const eyeSize = 4;
            const eyeOffset = 5;
            
            if (direction.x === 1) { // Right
                ctx.fillRect(segment.x * GRID_SIZE + GRID_SIZE - eyeOffset, segment.y * GRID_SIZE + 4, eyeSize, eyeSize);
                ctx.fillRect(segment.x * GRID_SIZE + GRID_SIZE - eyeOffset, segment.y * GRID_SIZE + 12, eyeSize, eyeSize);
            } else if (direction.x === -1) { // Left
                ctx.fillRect(segment.x * GRID_SIZE + 3, segment.y * GRID_SIZE + 4, eyeSize, eyeSize);
                ctx.fillRect(segment.x * GRID_SIZE + 3, segment.y * GRID_SIZE + 12, eyeSize, eyeSize);
            } else if (direction.y === -1) { // Up
                ctx.fillRect(segment.x * GRID_SIZE + 4, segment.y * GRID_SIZE + 3, eyeSize, eyeSize);
                ctx.fillRect(segment.x * GRID_SIZE + 12, segment.y * GRID_SIZE + 3, eyeSize, eyeSize);
            } else if (direction.y === 1) { // Down
                ctx.fillRect(segment.x * GRID_SIZE + 4, segment.y * GRID_SIZE + GRID_SIZE - eyeOffset, eyeSize, eyeSize);
                ctx.fillRect(segment.x * GRID_SIZE + 12, segment.y * GRID_SIZE + GRID_SIZE - eyeOffset, eyeSize, eyeSize);
            }
        }
    });
    
    // Draw food
    ctx.fillStyle = FOOD_COLOR;
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

function spawnFood() {
    do {
        food.x = Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE));
        food.y = Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE));
    } while (worm.some(segment => segment.x === food.x && segment.y === food.y));
}

function handleKeyPress(e) {
    const key = e.key;
    
    // Prevent default behavior for arrow keys and space
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(key)) {
        e.preventDefault();
    }
    
    // Change direction
    switch (key) {
        case 'ArrowUp':
            if (direction.y === 0) {
                nextDirection = { x: 0, y: -1 };
            }
            break;
        case 'ArrowDown':
            if (direction.y === 0) {
                nextDirection = { x: 0, y: 1 };
            }
            break;
        case 'ArrowLeft':
            if (direction.x === 0) {
                nextDirection = { x: -1, y: 0 };
            }
            break;
        case 'ArrowRight':
            if (direction.x === 0) {
                nextDirection = { x: 1, y: 0 };
            }
            break;
        case ' ':
            togglePause();
            break;
    }
}

function handleDirectionButton(dir) {
    // Change direction based on button press
    switch (dir) {
        case 'up':
            if (direction.y === 0) {
                nextDirection = { x: 0, y: -1 };
            }
            break;
        case 'down':
            if (direction.y === 0) {
                nextDirection = { x: 0, y: 1 };
            }
            break;
        case 'left':
            if (direction.x === 0) {
                nextDirection = { x: -1, y: 0 };
            }
            break;
        case 'right':
            if (direction.x === 0) {
                nextDirection = { x: 1, y: 0 };
            }
            break;
    }
}

function updateScore() {
    document.getElementById('score').textContent = score;
    
    if (score > highScore) {
        highScore = score;
        document.getElementById('highScore').textContent = highScore;
        localStorage.setItem('wormHighScore', highScore);
    }
}

function gameOver() {
    clearInterval(gameLoop);
    gameLoop = null;
    
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').classList.remove('hidden');
}

// Start the game when page loads
window.addEventListener('load', init);
