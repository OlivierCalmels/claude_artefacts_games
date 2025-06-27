window.addEventListener('DOMContentLoaded', function() {
// --- Paramètres du jeu ---
const canvas2 = document.getElementById('jeu2Canvas');
const ctx2 = canvas2.getContext('2d');

const GROUND_Y = canvas2.height - 30;
const PLAYER_WIDTH = 24;
const PLAYER_HEIGHT = 40;
const BALL_RADIUS = 12;
const GRAVITY = 0.7;
const JUMP_STRENGTH = -10;
const PLAYER_SPEED = 4;
const BALL_SPEED = 5;

let scoreJ1 = 0;
let scoreJ2 = 0;

// Joueurs
const player1 = {
    x: 60,
    y: GROUND_Y - PLAYER_HEIGHT,
    vx: 0,
    vy: 0,
    color: '#2196f3',
    left: false,
    right: false,
    jump: false,
    onGround: true
};
const player2 = {
    x: canvas2.width - 60 - PLAYER_WIDTH,
    y: GROUND_Y - PLAYER_HEIGHT,
    vx: 0,
    vy: 0,
    color: '#e53935',
    left: false,
    right: false,
    jump: false,
    onGround: true
};

// Ballon
const ball = {
    x: canvas2.width / 2,
    y: GROUND_Y - BALL_RADIUS,
    vx: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
    vy: 0
};

function resetPositions() {
    player1.x = 60;
    player1.y = GROUND_Y - PLAYER_HEIGHT;
    player1.vx = 0;
    player1.vy = 0;
    player1.onGround = true;
    player2.x = canvas2.width - 60 - PLAYER_WIDTH;
    player2.y = GROUND_Y - PLAYER_HEIGHT;
    player2.vx = 0;
    player2.vy = 0;
    player2.onGround = true;
    ball.x = canvas2.width / 2;
    ball.y = GROUND_Y - BALL_RADIUS;
    ball.vx = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
    ball.vy = 0;
}

function updatePlayers() {
    // Joueur 1 (ZQSD)
    if (player1.left) player1.vx = -PLAYER_SPEED;
    else if (player1.right) player1.vx = PLAYER_SPEED;
    else player1.vx = 0;
    player1.x += player1.vx;
    if (player1.x < 0) player1.x = 0;
    if (player1.x > canvas2.width / 2 - PLAYER_WIDTH) player1.x = canvas2.width / 2 - PLAYER_WIDTH;
    // Saut
    if (player1.jump && player1.onGround) {
        player1.vy = JUMP_STRENGTH;
        player1.onGround = false;
    }
    player1.y += player1.vy;
    player1.vy += GRAVITY;
    if (player1.y >= GROUND_Y - PLAYER_HEIGHT) {
        player1.y = GROUND_Y - PLAYER_HEIGHT;
        player1.vy = 0;
        player1.onGround = true;
    }
    // Joueur 2 (flèches)
    if (player2.left) player2.vx = -PLAYER_SPEED;
    else if (player2.right) player2.vx = PLAYER_SPEED;
    else player2.vx = 0;
    player2.x += player2.vx;
    if (player2.x < canvas2.width / 2) player2.x = canvas2.width / 2;
    if (player2.x > canvas2.width - PLAYER_WIDTH) player2.x = canvas2.width - PLAYER_WIDTH;
    // Saut
    if (player2.jump && player2.onGround) {
        player2.vy = JUMP_STRENGTH;
        player2.onGround = false;
    }
    player2.y += player2.vy;
    player2.vy += GRAVITY;
    if (player2.y >= GROUND_Y - PLAYER_HEIGHT) {
        player2.y = GROUND_Y - PLAYER_HEIGHT;
        player2.vy = 0;
        player2.onGround = true;
    }
}

function updateBall() {
    ball.x += ball.vx;
    ball.y += ball.vy;
    ball.vy += GRAVITY * 0.7;
    // Rebonds sol
    if (ball.y > GROUND_Y - BALL_RADIUS) {
        ball.y = GROUND_Y - BALL_RADIUS;
        ball.vy *= -0.7;
        if (Math.abs(ball.vy) < 1) ball.vy = 0;
    }
    // Rebonds murs
    if (ball.x < BALL_RADIUS) {
        scoreJ2++;
        updateScore2();
        resetPositions();
    }
    if (ball.x > canvas2.width - BALL_RADIUS) {
        scoreJ1++;
        updateScore2();
        resetPositions();
    }
    // Rebonds plafond
    if (ball.y < BALL_RADIUS) {
        ball.y = BALL_RADIUS;
        ball.vy *= -1;
    }
    // Collision joueurs
    [player1, player2].forEach(player => {
        let dx = (player.x + PLAYER_WIDTH / 2) - ball.x;
        let dy = (player.y + PLAYER_HEIGHT / 2) - ball.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < PLAYER_WIDTH / 2 + BALL_RADIUS) {
            // Repousser le ballon
            let angle = Math.atan2(dy, dx);
            let force = 5;
            ball.vx = -Math.cos(angle) * force;
            ball.vy = -Math.sin(angle) * force;
        }
    });
}

function updateScore2() {
    document.getElementById('scoreJ1').textContent = scoreJ1;
    document.getElementById('scoreJ2').textContent = scoreJ2;
}

function drawPlayers() {
    // Joueur 1
    drawBonhomme(player1.x + PLAYER_WIDTH / 2, player1.y + PLAYER_HEIGHT, player1.color);
    // Joueur 2
    drawBonhomme(player2.x + PLAYER_WIDTH / 2, player2.y + PLAYER_HEIGHT, player2.color);
}

function drawBonhomme(x, y, color) {
    // Corps
    ctx2.save();
    ctx2.strokeStyle = color;
    ctx2.lineWidth = 3;
    // Tête
    ctx2.beginPath();
    ctx2.arc(x, y - 32, 10, 0, 2 * Math.PI);
    ctx2.fillStyle = '#ffe0b2';
    ctx2.fill();
    ctx2.stroke();
    // Corps
    ctx2.beginPath();
    ctx2.moveTo(x, y - 22);
    ctx2.lineTo(x, y - 2);
    ctx2.stroke();
    // Bras
    ctx2.beginPath();
    ctx2.moveTo(x, y - 18);
    ctx2.lineTo(x - 12, y - 8);
    ctx2.moveTo(x, y - 18);
    ctx2.lineTo(x + 12, y - 8);
    ctx2.stroke();
    // Jambes
    ctx2.beginPath();
    ctx2.moveTo(x, y - 2);
    ctx2.lineTo(x - 8, y + 16);
    ctx2.moveTo(x, y - 2);
    ctx2.lineTo(x + 8, y + 16);
    ctx2.stroke();
    ctx2.restore();
}

function drawBall() {
    ctx2.beginPath();
    ctx2.arc(ball.x, ball.y, BALL_RADIUS, 0, 2 * Math.PI);
    ctx2.fillStyle = '#fff200';
    ctx2.fill();
    ctx2.strokeStyle = '#bfa500';
    ctx2.lineWidth = 2;
    ctx2.stroke();
}

function drawGround() {
    ctx2.fillStyle = '#444';
    ctx2.fillRect(0, GROUND_Y, canvas2.width, 30);
    // Ligne centrale
    ctx2.strokeStyle = '#fff';
    ctx2.setLineDash([8, 8]);
    ctx2.beginPath();
    ctx2.moveTo(canvas2.width / 2, 0);
    ctx2.lineTo(canvas2.width / 2, GROUND_Y);
    ctx2.stroke();
    ctx2.setLineDash([]);
}

function drawGame2() {
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    drawGround();
    drawPlayers();
    drawBall();
}

function gameLoop2() {
    updatePlayers();
    updateBall();
    drawGame2();
    requestAnimationFrame(gameLoop2);
}

// Modifie la gestion du saut pour taper dans le ballon si proche
function tryKickBall(player, direction) {
    // direction: -1 pour gauche, 1 pour droite
    let dx = (player.x + PLAYER_WIDTH / 2) - ball.x;
    let dy = (player.y + PLAYER_HEIGHT / 2) - ball.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < PLAYER_WIDTH / 2 + BALL_RADIUS + 8) {
        // Impulsion plus forte vers le haut et sur le côté
        ball.vx = 6 * direction;
        ball.vy = -8;
    }
}

// Contrôles clavier
window.addEventListener('keydown', e => {
    switch (e.key.toLowerCase()) {
        case 'z':
            player1.jump = true;
            if (player1.onGround) tryKickBall(player1, 1); // tape à droite
            break;
        case 'q': player1.left = true; break;
        case 'd': player1.right = true; break;
        case 'arrowup':
            player2.jump = true;
            if (player2.onGround) tryKickBall(player2, -1); // tape à gauche
            break;
        case 'arrowleft': player2.left = true; break;
        case 'arrowright': player2.right = true; break;
    }
});
window.addEventListener('keyup', e => {
    switch (e.key.toLowerCase()) {
        case 'z': player1.jump = false; break;
        case 'q': player1.left = false; break;
        case 'd': player1.right = false; break;
        case 'arrowup': player2.jump = false; break;
        case 'arrowleft': player2.left = false; break;
        case 'arrowright': player2.right = false; break;
    }
});

// Initialisation
resetPositions();
updateScore2();
requestAnimationFrame(gameLoop2);
}); 