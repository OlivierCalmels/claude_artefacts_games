// Tab switching
function switchTab(tabIndex) {
    const tabs = document.querySelectorAll('.tab');
    const games = document.querySelectorAll('.game-container');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    games.forEach(game => game.classList.remove('active'));
    
    tabs[tabIndex].classList.add('active');
    games[tabIndex].classList.add('active');
    
    // Mise à jour de l'URL sans recharger la page
    const jeu = tabIndex === 0 ? 'pong' : 'football';
    const url = new URL(window.location);
    url.searchParams.set('jeu', jeu);
    window.history.replaceState({}, '', url);

    if (tabIndex === 0) {
        resizeCanvas();
    }
}

// Sélection de l'onglet au chargement selon l'URL
window.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const jeu = params.get('jeu');
    if (jeu === 'football') {
        switchTab(1);
    } else {
        switchTab(0);
    }
});

// Pong Game
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

let gameRunning = false;
let gameLoop;

// Game objects
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    speedX: 3,
    speedY: 2
};

const player = {
    x: 10,
    y: canvas.height / 2 - 40,
    width: 8,
    height: 80,
    speed: 5
};

const ai = {
    x: canvas.width - 18,
    y: canvas.height / 2 - 40,
    width: 8,
    height: 80,
    speed: 3
};

let playerScore = 0;
let aiScore = 0;

let touchY = 0;
let isTouching = false;

// Touch controls
canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

// Mouse controls for desktop
canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseup', handleMouseUp);

let isMouseDown = false;

// Add button event listeners for iOS compatibility
function addTouchListeners() {
    const buttons = document.querySelectorAll('.control-btn, .tab');
    buttons.forEach(button => {
        button.addEventListener('touchend', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.click();
        }, { passive: false });
    });
}

function handleTouchStart(e) {
    e.preventDefault();
    isTouching = true;
    const rect = canvas.getBoundingClientRect();
    touchY = e.touches[0].clientY - rect.top;
}

function handleTouchMove(e) {
    e.preventDefault();
    if (isTouching) {
        const rect = canvas.getBoundingClientRect();
        touchY = e.touches[0].clientY - rect.top;
        const canvasHeight = canvas.offsetHeight;
        const scaleFactor = canvas.height / canvasHeight;
        player.y = (touchY * scaleFactor) - player.height / 2;
        
        if (player.y < 0) player.y = 0;
        if (player.y > canvas.height - player.height) {
            player.y = canvas.height - player.height;
        }
    }
}

function handleTouchEnd(e) {
    e.preventDefault();
    isTouching = false;
}

function handleMouseDown(e) {
    isMouseDown = true;
    handleMouseMove(e);
}

function handleMouseMove(e) {
    if (isMouseDown) {
        const rect = canvas.getBoundingClientRect();
        const mouseY = e.clientY - rect.top;
        const canvasHeight = canvas.offsetHeight;
        const scaleFactor = canvas.height / canvasHeight;
        player.y = (mouseY * scaleFactor) - player.height / 2;
        
        if (player.y < 0) player.y = 0;
        if (player.y > canvas.height - player.height) {
            player.y = canvas.height - player.height;
        }
    }
}

function handleMouseUp() {
    isMouseDown = false;
}

function resizeCanvas() {
    const container = canvas.parentElement;
    const maxWidth = Math.min(container.offsetWidth - 40, 400);
    canvas.style.width = maxWidth + 'px';
    canvas.style.height = (maxWidth * 0.75) + 'px';
}

function updateGame() {
    // Move ball
    ball.x += ball.speedX;
    ball.y += ball.speedY;
    
    // Ball collision with top/bottom walls
    if (ball.y <= ball.radius || ball.y >= canvas.height - ball.radius) {
        ball.speedY = -ball.speedY;
    }
    
    // Ball collision with paddles
    if (ball.x <= player.x + player.width && 
        ball.y >= player.y && 
        ball.y <= player.y + player.height &&
        ball.speedX < 0) {
        ball.speedX = -ball.speedX;
        ball.speedX *= 1.05; // Increase speed slightly
    }
    
    if (ball.x >= ai.x && 
        ball.y >= ai.y && 
        ball.y <= ai.y + ai.height &&
        ball.speedX > 0) {
        ball.speedX = -ball.speedX;
        ball.speedX *= 1.05;
    }
    
    // Scoring
    if (ball.x < 0) {
        aiScore++;
        updateScore();
        resetBall();
    }
    
    if (ball.x > canvas.width) {
        playerScore++;
        updateScore();
        resetBall();
    }
    
    // AI movement
    const aiCenter = ai.y + ai.height / 2;
    if (aiCenter < ball.y - 10) {
        ai.y += ai.speed;
    } else if (aiCenter > ball.y + 10) {
        ai.y -= ai.speed;
    }
    
    // Keep AI paddle in bounds
    if (ai.y < 0) ai.y = 0;
    if (ai.y > canvas.height - ai.height) {
        ai.y = canvas.height - ai.height;
    }
}

function drawGame() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw center line
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw paddles
    ctx.fillStyle = '#2196f3'; // Bleu pour le joueur
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.fillStyle = '#e53935'; // Rouge pour l'IA
    ctx.fillRect(ai.x, ai.y, ai.width, ai.height);
    
    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
}

function gameStep() {
    updateGame();
    drawGame();
}

function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gameLoop = setInterval(gameStep, 1000 / 60); // 60 FPS
    }
}

function pauseGame() {
    gameRunning = false;
    clearInterval(gameLoop);
}

function resetGame() {
    pauseGame();
    playerScore = 0;
    aiScore = 0;
    updateScore();
    resetBall();
    resetPaddles();
    drawGame();
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speedX = (Math.random() > 0.5 ? 1 : -1) * 3;
    ball.speedY = (Math.random() - 0.5) * 4;
}

function resetPaddles() {
    player.y = canvas.height / 2 - player.height / 2;
    ai.y = canvas.height / 2 - ai.height / 2;
}

function updateScore() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('aiScore').textContent = aiScore;
}

// Initialize
window.addEventListener('load', () => {
    resizeCanvas();
    resetGame();
    addTouchListeners(); // Add touch listeners for iOS
});

window.addEventListener('resize', resizeCanvas); 