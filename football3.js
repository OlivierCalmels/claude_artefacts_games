window.addEventListener('DOMContentLoaded', function() {
// --- Paramètres du jeu avec Matter.js ---
const canvas2 = document.getElementById('jeu4Canvas');
const { Engine, Render, World, Bodies, Body, Composite, Vector, Constraint } = Matter;

// Création du moteur physique
const engine = Engine.create();
const world = engine.world;

// Configuration du renderer
const render = Render.create({
    canvas: canvas2,
    engine: engine,
    options: {
        width: 400,
        height: 300,
        wireframes: false,
        background: '#b3e0ff'
    }
});

const GROUND_Y = 270;
const PLAYER_WIDTH = 24;
const PLAYER_HEIGHT = 40;
const BALL_RADIUS = 12;
const GRAVITY = 0.7;
const JUMP_STRENGTH = -3;
const PLAYER_SPEED = 4;
const BALL_SPEED = 2;

let scoreJ1 = 0;
let scoreJ2 = 0;

// Définir la hauteur totale du joueur (corps + jambes)
const LEG_LENGTH = 38; // longueur jambe visuelle
const PLAYER_TOTAL_HEIGHT = PLAYER_HEIGHT + LEG_LENGTH; // 40 + 38 = 78

// Sol (statique)
const ground = Bodies.rectangle(200, GROUND_Y + 15, 400, 30, { 
    isStatic: true,
    render: { fillStyle: '#3cb043' }
});

// Murs (statiques) - seulement le plafond
const ceiling = Bodies.rectangle(200, -15, 400, 30, { isStatic: true });

// Exemple de joueur composite (corps + jambes articulées)
// (décommenter pour tester la structure composite)
/*
const body1 = Bodies.rectangle(60, GROUND_Y - PLAYER_HEIGHT/2, PLAYER_WIDTH, PLAYER_HEIGHT, { render: { fillStyle: '#2196f3' } });
const leg1_left = Bodies.rectangle(60-7, GROUND_Y + 10, 8, 38, { render: { fillStyle: '#1565c0' } });
const leg1_right = Bodies.rectangle(60+7, GROUND_Y + 10, 8, 38, { render: { fillStyle: '#1565c0' } });
const joint_left = Constraint.create({
    bodyA: body1, pointA: { x: -7, y: PLAYER_HEIGHT/2 },
    bodyB: leg1_left, pointB: { x: 0, y: -19 },
    stiffness: 1, length: 0
});
const joint_right = Constraint.create({
    bodyA: body1, pointA: { x: 7, y: PLAYER_HEIGHT/2 },
    bodyB: leg1_right, pointB: { x: 0, y: -19 },
    stiffness: 1, length: 0
});
const player1_composite = Composite.create();
Composite.add(player1_composite, [body1, leg1_left, leg1_right, joint_left, joint_right]);
// Remplacer player1 par player1_composite dans le jeu pour tester
*/

// Joueurs (corps physiques uniques avec rendu personnalisé)
const player1 = Bodies.rectangle(0, 0, PLAYER_WIDTH, 1, {
    render: { 
        fillStyle: '#2196f3',
        sprite: {
            texture: null,
            xScale: 1,
            yScale: 1
        }
    },
    friction: 0.9,
    restitution: 0.1
});

// Ajout uniquement du joueur 1 au monde
Composite.add(world, [ground, ceiling, player1]);

// Variables de contrôle
let player1Controls = { left: false, right: false, jump: false };
let player1Inclinaison = 0;
let oscillationAngle = 0;

// Ajout d'un état d'animation de jambe pour chaque joueur
let player1LegAngle = 0;
let player1LegKick = false;

// Ajout d'un état pour la jambe animée (gauche/droite) pour chaque joueur
let player1LegSide = 'right';

const VERSION = 'v1.0';

function resetPositions() {
    Body.setPosition(player1, { x: 300, y: GROUND_Y - PLAYER_TOTAL_HEIGHT });
    Body.setVelocity(player1, { x: 0, y: 0 });
}

function updatePlayers() {
    // Pas de mouvement, joueur statique
    Body.setAngle(player1, 0);
}

function updateScore() {
    // Rien à faire, pas de score ni de ballon
}

function drawGame2() {
    const ctx = render.context;
    // Dessiner uniquement le joueur 1
    drawPlayer(ctx, player1, '#2196f3', true, false);
    // Pas de ballon, pas de joueur 2
    ctx.save();
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#222';
    ctx.globalAlpha = 0.5;
    ctx.textAlign = 'right';
    ctx.fillText(VERSION, 392, 292);
    ctx.restore();
}

function drawFootball(ctx, ball) {
    const x = ball.position.x;
    const y = ball.position.y;
    const radius = BALL_RADIUS;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ball.angle);
    
    // Fond blanc du ballon
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Bordure noire
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Motif d'hexagones alternés
    const hexRadius = radius * 0.3;
    
    // Hexagone central (noir)
    ctx.fillStyle = '#000000';
    drawHexagon(ctx, 0, 0, hexRadius);
    
    // Hexagones autour du centre (blancs)
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    
    const positions = [
        { x: 0, y: -radius * 0.6 },
        { x: radius * 0.5, y: -radius * 0.3 },
        { x: radius * 0.5, y: radius * 0.3 },
        { x: 0, y: radius * 0.6 },
        { x: -radius * 0.5, y: radius * 0.3 },
        { x: -radius * 0.5, y: -radius * 0.3 }
    ];
    
    positions.forEach(pos => {
        drawHexagon(ctx, pos.x, pos.y, hexRadius);
        ctx.stroke(); // Bordure noire pour les hexagones blancs
    });
    
    ctx.restore();
}

function drawHexagon(ctx, x, y, radius) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const px = x + radius * Math.cos(angle);
        const py = y + radius * Math.sin(angle);
        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }
    ctx.closePath();
    ctx.fill();
}

function drawPlayer(ctx, player, color, hasBeard, hasHair) {
    const x = player.position.x;
    const y = player.position.y;
    // Affichage du joueur 1 uniquement, sans dépendance au ballon
    const shirtColor = color;
    const shortColor = '#1976d2';
    const sockColor = '#fffde7';
    const shoeColor = '#37474f';
    // Jambes droites, statiques
    const legAngle = 0;
    const legSide = 'right';
    ctx.save();
    ctx.translate(x, y); // (x, y) = position des pieds
    ctx.rotate(0); // Pas d'inclinaison
    // Jambes (gauche et droite, droites)
    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = sockColor;
    ctx.lineWidth = 8;
    // Jambe gauche
    ctx.save();
    ctx.translate(-7, 0);
    ctx.rotate(0);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -LEG_LENGTH);
    ctx.stroke();
    ctx.restore();
    // Jambe droite
    ctx.save();
    ctx.translate(7, 0);
    ctx.rotate(0);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -LEG_LENGTH);
    ctx.stroke();
    ctx.restore();
    ctx.restore();
    // Chaussures
    ctx.save();
    ctx.fillStyle = shoeColor;
    ctx.beginPath();
    ctx.ellipse(-7, 4, 8, 5, 0.1, 0, 2 * Math.PI);
    ctx.ellipse(7, 4, 8, 5, -0.1, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
    // Décaler tout le haut du joueur au-dessus des pieds
    ctx.translate(0, -LEG_LENGTH);
    // Ombre sous le joueur
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#222';
    ctx.ellipse(0, LEG_LENGTH + PLAYER_HEIGHT/2 + 8, 16, 5, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
    // Short
    ctx.fillStyle = shortColor;
    ctx.fillRect(-11, 0, 22, 18);
    // Corps (maillot)
    ctx.save();
    ctx.fillStyle = shirtColor;
    ctx.beginPath();
    ctx.ellipse(0, -10, 18, 22, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
    // Numéro sur le maillot
    ctx.save();
    ctx.font = 'bold 13px Arial';
    ctx.fillStyle = '#fbc02d';
    ctx.textAlign = 'center';
    ctx.fillText('30', 0, -2);
    ctx.restore();
    // Bras
    ctx.save();
    ctx.strokeStyle = shirtColor;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-14, -12);
    ctx.lineTo(-22, 10);
    ctx.moveTo(14, -12);
    ctx.lineTo(22, 10);
    ctx.stroke();
    ctx.restore();
    // Mains
    ctx.save();
    ctx.fillStyle = '#ffe0b2';
    ctx.beginPath();
    ctx.ellipse(-22, 12, 5, 7, 0.2, 0, 2 * Math.PI);
    ctx.ellipse(22, 12, 5, 7, -0.2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
    // Tête (ovale)
    ctx.save();
    ctx.fillStyle = '#ffe0b2';
    ctx.beginPath();
    ctx.ellipse(0, -PLAYER_TOTAL_HEIGHT + LEG_LENGTH, 11, 14, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
    // Cheveux
    ctx.save();
    ctx.fillStyle = '#4e342e';
    ctx.beginPath();
    ctx.ellipse(0, -PLAYER_TOTAL_HEIGHT - 8 + LEG_LENGTH, 10, 6, -0.2, Math.PI, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.fill();
    ctx.restore();
    // Yeux
    ctx.save();
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(-4, -PLAYER_TOTAL_HEIGHT - 2 + LEG_LENGTH, 1.3, 0, 2 * Math.PI);
    ctx.arc(4, -PLAYER_TOTAL_HEIGHT - 2 + LEG_LENGTH, 1.3, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
    // Bouche
    ctx.save();
    ctx.strokeStyle = '#b05a19';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, -PLAYER_TOTAL_HEIGHT + 3 + LEG_LENGTH, 4, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    ctx.restore();
    ctx.restore();
}

function gameLoop2() {
    updatePlayers();
    updateScore();
    Engine.update(engine);
    drawGame2();
    requestAnimationFrame(gameLoop2);
}

// Contrôles clavier
window.addEventListener('keydown', e => {
    switch (e.key.toLowerCase()) {
        case 'a':
        case 'z':
            player1Controls.jump = true;
            break;
        case 'q': player1Controls.left = true; break;
        case 'd': player1Controls.right = true; break;
    }
});

window.addEventListener('keyup', e => {
    switch (e.key.toLowerCase()) {
        case 'a':
        case 'z': player1Controls.jump = false; break;
        case 'q': player1Controls.left = false; break;
        case 'd': player1Controls.right = false; break;
    }
});

// Contrôles tactiles
canvas2.addEventListener('touchstart', function(e) {
    player1Controls.jump = true;
    setTimeout(() => { player1Controls.jump = false; }, 100); // simule un appui court pour le saut
});

canvas2.addEventListener('touchend', function(e) {
    player1Controls.jump = false;
    // On ne relance pas l'animation de jambe ici
});

// Initialisation
resetPositions();
Render.run(render);
gameLoop2();
}); 