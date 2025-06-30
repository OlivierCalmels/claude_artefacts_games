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
const player1 = Bodies.rectangle(60, GROUND_Y - PLAYER_HEIGHT/2, PLAYER_WIDTH, PLAYER_HEIGHT, {
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

const player2 = Bodies.rectangle(340, GROUND_Y - PLAYER_HEIGHT/2, PLAYER_WIDTH, PLAYER_HEIGHT, {
    render: { 
        fillStyle: '#e53935',
        sprite: {
            texture: null,
            xScale: 1,
            yScale: 1
        }
    },
    friction: 0.9,
    restitution: 0.1
});

// Ballon (corps physique)
const ball = Bodies.circle(200, GROUND_Y - BALL_RADIUS, BALL_RADIUS, {
    render: { 
        visible: false // Masquer le rendu automatique de Matter.js
    },
    friction: 0.01, // Friction très faible pour rouler plus loin
    restitution: 0.9 // Rebond plus important
});

// Ajout des objets au monde
Composite.add(world, [ground, ceiling, player1, player2, ball]);

// Variables de contrôle
let player1Controls = { left: false, right: false, jump: false };
let player2Controls = { left: false, right: false, jump: false };
let player1Inclinaison = 0;
let player2Inclinaison = 0;
let oscillationAngle = 0;

// Ajout d'un état d'animation de jambe pour chaque joueur
let player1LegAngle = 0;
let player2LegAngle = 0;
let player1LegKick = false;
let player2LegKick = false;

// Ajout d'un état pour la jambe animée (gauche/droite) pour chaque joueur
let player1LegSide = 'right';
let player2LegSide = 'left';

const VERSION = 'v1.0';

function resetPositions() {
    Body.setPosition(player1, { x: 60, y: GROUND_Y - PLAYER_TOTAL_HEIGHT/2 });
    Body.setVelocity(player1, { x: 0, y: 0 });
    Body.setPosition(player2, { x: 340, y: GROUND_Y - PLAYER_TOTAL_HEIGHT/2 });
    Body.setVelocity(player2, { x: 0, y: 0 });
    Body.setPosition(ball, { x: 200, y: GROUND_Y - BALL_RADIUS });
    Body.setVelocity(ball, { x: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1), y: 0 });
}

function updatePlayers() {
    // Oscillation automatique (culbuto) - pivot autour des pieds
    oscillationAngle += 0.04;
    const maxAngle = Math.PI / 6; // 30 degrés
    player1Inclinaison = Math.sin(oscillationAngle) * maxAngle;
    player2Inclinaison = Math.cos(oscillationAngle) * maxAngle;

    // Déterminer la jambe la plus proche du ballon pour chaque joueur
    player1LegSide = (ball.position.x < player1.position.x) ? 'right' : 'left';
    player2LegSide = (ball.position.x < player2.position.x) ? 'right' : 'left';

    // Animation de la jambe lors du saut
    if (player1Controls.jump && Math.abs(player1.velocity.y) > 0.1) {
        player1LegKick = true;
    }
    if (player2Controls.jump && Math.abs(player2.velocity.y) > 0.1) {
        player2LegKick = true;
    }
    // Animation de la jambe (avance puis revient)
    if (player1LegKick) {
        player1LegAngle += 0.15;
        if (player1LegAngle > Math.PI/3) player1LegKick = false;
    } else if (player1LegAngle > 0) {
        player1LegAngle -= 0.1;
        if (player1LegAngle < 0) player1LegAngle = 0;
    }
    if (player2LegKick) {
        player2LegAngle += 0.15;
        if (player2LegAngle > Math.PI/3) player2LegKick = false;
    } else if (player2LegAngle > 0) {
        player2LegAngle -= 0.1;
        if (player2LegAngle < 0) player2LegAngle = 0;
    }

    // Vérifier si les joueurs touchent le sol
    const player1OnGround = Math.abs(player1.position.y - (GROUND_Y - PLAYER_TOTAL_HEIGHT/2)) < 5;
    const player2OnGround = Math.abs(player2.position.y - (GROUND_Y - PLAYER_TOTAL_HEIGHT/2)) < 5;

    // Contrôles joueur 1
    let player1Force = { x: 0, y: 0 };
    if (player1Controls.left) player1Force.x = -PLAYER_SPEED * 0.01;
    if (player1Controls.right) player1Force.x = PLAYER_SPEED * 0.01;
    if (player1Controls.jump && player1OnGround) {
        player1Force.y = JUMP_STRENGTH * 0.01;
    }
    // Appliquer la force au joueur 1
    Body.applyForce(player1, player1.position, player1Force);
    
    // Limiter la position du joueur 1 (ne pas sortir de l'écran)
    if (player1.position.x < 20) {
        Body.setPosition(player1, { x: 20, y: player1.position.y });
    }
    if (player1.position.x > 380) {
        Body.setPosition(player1, { x: 380, y: player1.position.y });
    }
    
    // Inclinaison oscillante du joueur 1
    Body.setAngle(player1, player1Inclinaison);

    // Contrôles joueur 2
    let player2Force = { x: 0, y: 0 };
    if (player2Controls.left) player2Force.x = -PLAYER_SPEED * 0.01;
    if (player2Controls.right) player2Force.x = PLAYER_SPEED * 0.01;
    if (player2Controls.jump && player2OnGround) {
        player2Force.y = JUMP_STRENGTH * 0.01;
    }
    // Appliquer la force au joueur 2
    Body.applyForce(player2, player2.position, player2Force);
    
    // Limiter la position du joueur 2 (ne pas sortir de l'écran)
    if (player2.position.x < 20) {
        Body.setPosition(player2, { x: 20, y: player2.position.y });
    }
    if (player2.position.x > 380) {
        Body.setPosition(player2, { x: 380, y: player2.position.y });
    }
    
    // Inclinaison oscillante du joueur 2
    Body.setAngle(player2, player2Inclinaison);
}

function updateScore() {
    // Vérification des buts
    if (ball.position.x < 0) {
        scoreJ2++;
        updateScore2();
        resetPositions();
    }
    if (ball.position.x > 400) {
        scoreJ1++;
        updateScore2();
        resetPositions();
    }
    
    // Vérifier les coups de pied dans le ballon
    checkKickBall(player1, player1Inclinaison);
    checkKickBall(player2, player2Inclinaison);
}

function checkKickBall(player, inclinaison) {
    // Position du pied animé
    const isRed = player === player2;
    const legAngle = isRed ? player2LegAngle : player1LegAngle;
    const legSide = isRed ? player2LegSide : player1LegSide;
    
    // Utiliser la même logique de direction que dans le rendu visuel
    const ballDirection = (ball.position.x < player.position.x) ? 1 : -1;
    const animatedLegAngle = legAngle * ballDirection;
    
    const baseX = player.position.x + (legSide === 'right' ? 7 : -7) * Math.cos(player.angle);
    const baseY = player.position.y + 18 * Math.sin(player.angle);
    const LEG_LENGTH = 38;
    const px = baseX + LEG_LENGTH * Math.sin(animatedLegAngle + player.angle);
    const py = baseY + LEG_LENGTH * Math.cos(animatedLegAngle + player.angle);
    
    // Distance entre le pied et le ballon
    const dx = px - ball.position.x;
    const dy = py - ball.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Si le joueur saute, que la jambe est en mouvement, et que le pied touche le ballon
    if (distance < BALL_RADIUS + 8 && (legAngle > 0.1)) {
        // Force plus importante pour que le ballon bouge visiblement
        const kickForce = 0.08;
        // Direction du tir selon la position du ballon par rapport au joueur
        const kickDirection = (ball.position.x < player.position.x) ? -1 : 1;
        const kickX = kickDirection * kickForce;
        const kickY = -0.03; // Force vers le haut
        Body.applyForce(ball, ball.position, { x: kickX, y: kickY });
    }
}

function updateScore2() {
    document.getElementById('scoreJ1').textContent = scoreJ1;
    document.getElementById('scoreJ2').textContent = scoreJ2;
}

function drawGame2() {
    // Le rendu est géré automatiquement par Matter.js
    // Rendu personnalisé pour les joueurs et le ballon
    const ctx = render.context;
    
    // Dessiner le joueur 1 avec tête, corps, pieds
    drawPlayer(ctx, player1, '#2196f3', true, false);
    
    // Dessiner le joueur 2 avec tête, corps, pieds
    drawPlayer(ctx, player2, '#e53935', false, true);
    
    // Dessiner le ballon de football
    drawFootball(ctx, ball);
    
    // Affichage du score et version
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
    const isRed = color === '#e53935';
    const number = isRed ? '26' : '30';
    const shirtColor = color;
    const shortColor = isRed ? '#e57373' : '#1976d2';
    const sockColor = '#fffde7';
    const shoeColor = '#37474f';
    // Variables d'animation de jambe spécifiques à chaque joueur
    const legAngle = isRed ? player2LegAngle : player1LegAngle;
    const legSide = isRed ? player2LegSide : player1LegSide;
    ctx.save();
    ctx.translate(x, y); // (x, y) = position des pieds
    ctx.rotate(player.angle);
    // Jambes (partent de (0,0) vers le haut)
    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = sockColor;
    ctx.lineWidth = 8;
    const ballDirection = (ball.position.x < player.position.x) ? 1 : -1;
    const animatedLegAngle = legAngle * ballDirection;
    // Jambe gauche
    ctx.save();
    ctx.translate(-7, 0); // pieds gauche
    ctx.rotate(legSide === 'left' ? animatedLegAngle : 0);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -LEG_LENGTH);
    ctx.stroke();
    ctx.restore();
    // Jambe droite
    ctx.save();
    ctx.translate(7, 0); // pieds droit
    ctx.rotate(legSide === 'right' ? animatedLegAngle : 0);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -LEG_LENGTH);
    ctx.stroke();
    ctx.restore();
    ctx.restore();
    // Chaussures (crampons)
    ctx.save();
    ctx.fillStyle = shoeColor;
    ctx.beginPath();
    ctx.ellipse(-7, -4, 8, 5, 0.1, 0, 2 * Math.PI);
    ctx.ellipse(7, -4, 8, 5, -0.1, 0, 2 * Math.PI);
    ctx.fill();
    // Crampons
    ctx.fillStyle = '#222';
    for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.arc(-7 + i*3, 1, 1.2, 0, 2 * Math.PI);
        ctx.arc(7 + i*3, 1, 1.2, 0, 2 * Math.PI);
        ctx.fill();
    }
    ctx.restore();
    // Décaler tout le haut du joueur au-dessus des pieds
    ctx.translate(0, -LEG_LENGTH);
    // Ombre sous le joueur (optionnel, sinon à déplacer ailleurs)
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
    ctx.fillText(number, 0, -2);
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
    ctx.ellipse(0, -PLAYER_TOTAL_HEIGHT/2 - 7 + LEG_LENGTH, 11, 14, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
    // Cheveux (dessinés pour les deux joueurs)
    ctx.save();
    ctx.fillStyle = '#4e342e';
    ctx.beginPath();
    ctx.ellipse(0, -PLAYER_TOTAL_HEIGHT/2 - 8 + LEG_LENGTH, 10, 6, -0.2, Math.PI, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-4, -PLAYER_TOTAL_HEIGHT/2 - 3 + LEG_LENGTH, 4, 2, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
    // Yeux
    ctx.save();
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(-4, -PLAYER_TOTAL_HEIGHT/2 - 2 + LEG_LENGTH, 1.3, 0, 2 * Math.PI);
    ctx.arc(4, -PLAYER_TOTAL_HEIGHT/2 - 2 + LEG_LENGTH, 1.3, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
    // Bouche
    ctx.save();
    ctx.strokeStyle = '#b05a19';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, -PLAYER_TOTAL_HEIGHT/2 + 3 + LEG_LENGTH, 4, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    ctx.restore();
    // Nom "Claire" sous le joueur 2
    if (isRed) {
        ctx.save();
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = '#e53935';
        ctx.textAlign = 'center';
        ctx.fillText('Claire', 0, 40);
        ctx.restore();
    }
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
        case 'arrowup':
            player2Controls.jump = true;
            break;
        case 'arrowleft': player2Controls.left = true; break;
        case 'arrowright': player2Controls.right = true; break;
    }
});

window.addEventListener('keyup', e => {
    switch (e.key.toLowerCase()) {
        case 'a':
        case 'z': player1Controls.jump = false; break;
        case 'q': player1Controls.left = false; break;
        case 'd': player1Controls.right = false; break;
        case 'arrowup': player2Controls.jump = false; break;
        case 'arrowleft': player2Controls.left = false; break;
        case 'arrowright': player2Controls.right = false; break;
    }
});

// Contrôles tactiles
canvas2.addEventListener('touchstart', function(e) {
    const rect = canvas2.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    if (x < 200) {
        player1Controls.jump = true;
        player1LegKick = true;
    } else {
        player2Controls.jump = true;
        player2LegKick = true;
    }
});

canvas2.addEventListener('touchend', function(e) {
    player1Controls.jump = false;
    player2Controls.jump = false;
    // On ne relance pas l'animation de jambe ici
});

// Initialisation
resetPositions();
updateScore2();
Render.run(render);
gameLoop2();
}); 