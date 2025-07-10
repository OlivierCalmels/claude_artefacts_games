// Fichier principal pour la roulette Catman

window.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('rouletteCatmanCanvas');
    if (!canvas) return;

    function resizeCanvas() {
        const size = Math.min(window.innerWidth * 0.9, 400);
        canvas.width = size;
        canvas.height = size;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;

    // Liste des acronymes (modifiable)
    const acronyms = (window.rouletteCatmanQuestions || []).map(q => q.acronyme);
    const colors = generateColorPalette(acronyms.length);
    let angle = 0;
    let spinning = false;
    let spinVelocity = 0;
    let selectedIndex = null;

    let resultDiv = document.getElementById('rouletteCatmanResult');
    if (!resultDiv) {
        resultDiv = document.createElement('div');
        resultDiv.id = 'rouletteCatmanResult';
        resultDiv.style.fontFamily = 'Montserrat, Arial, sans-serif';
        resultDiv.style.fontWeight = 'bold';
        resultDiv.style.fontSize = '2rem';
        resultDiv.style.textAlign = 'center';
        resultDiv.style.margin = '18px 0 0 0';
        canvas.parentNode.insertBefore(resultDiv, canvas.nextSibling);
    }

    function mod(a, n) {
        return ((a % n) + n) % n;
    }

    function drawWheel() {
        ctx.clearRect(0, 0, width, height);
        const n = acronyms.length;
        const arc = 2 * Math.PI / n;
        for (let i = 0; i < n; i++) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, angle + i * arc, angle + (i + 1) * arc);
            ctx.closePath();
            ctx.fillStyle = colors[i % colors.length];
            ctx.fill();
            ctx.restore();

            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(angle + (i + 0.5) * arc);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = 'bold 16px Montserrat, Arial';
            ctx.fillStyle = '#fff';
            ctx.strokeStyle = '#222';
            ctx.lineWidth = 1;
            ctx.strokeText(acronyms[i], radius * 0.7, 0);
            ctx.fillText(acronyms[i], radius * 0.7, 0);
            ctx.restore();
        }
        ctx.save();
        ctx.translate(centerX, centerY - radius - 10);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-18, -30);
        ctx.lineTo(0, -10);
        ctx.lineTo(18, -30);
        ctx.closePath();
        ctx.fillStyle = '#e53935';
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 3;
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    function animate() {
        let currentAcronym = '';
        const n = acronyms.length;
        const arc = 2 * Math.PI / n;
        let pointerAngle = -Math.PI / 2;
        let relative = (pointerAngle - angle + 2 * Math.PI) % (2 * Math.PI);
        let idx = mod(Math.floor(relative / arc), n);
        currentAcronym = acronyms[idx];
        resultDiv.textContent = currentAcronym;
        if (spinning) {
            angle += spinVelocity;
            spinVelocity *= 0.985;
            if (spinVelocity < 0.01) {
                spinning = false;
                selectedIndex = idx;
                setTimeout(() => {
                    showCatmanResultModal(acronyms[selectedIndex]);
                }, 400);
            }
        }
        drawWheel();
        requestAnimationFrame(animate);
    }

    canvas.addEventListener('click', spin);
    canvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        spin();
    }, { passive: false });

    function spin() {
        if (!spinning) {
            spinVelocity = 0.25 + Math.random() * 0.15;
            spinning = true;
            selectedIndex = null;
        }
    }

    drawWheel();
    animate();
});

function generateColorPalette(n) {
    const colors = [];
    for (let i = 0; i < n; i++) {
        colors.push(hslToHex((i * 360) / n, 80, 50));
    }
    return colors;
}

function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n =>
        Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));
    return `#${[f(0), f(8), f(4)].map(x => x.toString(16).padStart(2, '0')).join('')}`;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function showCatmanResultModal(acronym) {
    let modal = document.getElementById('rouletteCatmanModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'rouletteCatmanModal';
        modal.innerHTML = `
            <div class="roulette-modal-backdrop"></div>
            <div class="roulette-modal-content">
                <div class="roulette-modal-title">Question</div>
                <div class="roulette-modal-question" id="rouletteCatmanModalQuestion"></div>
                <div class="roulette-modal-choices">
                    <button class="roulette-modal-choice" id="catmanChoice0"></button>
                    <button class="roulette-modal-choice" id="catmanChoice1"></button>
                    <button class="roulette-modal-choice" id="catmanChoice2"></button>
                    <button class="roulette-modal-choice" id="catmanChoice3"></button>
                </div>
                <div class="roulette-modal-feedback" id="rouletteCatmanModalFeedback" style="min-height:32px;margin-bottom:12px;"></div>
                <button class="roulette-modal-close">Fermer</button>
            </div>
        `;
        document.body.appendChild(modal);
        const style = document.createElement('style');
        style.textContent = `
            #rouletteCatmanModal { position: fixed; z-index: 9999; left: 0; top: 0; width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; }
            .roulette-modal-backdrop { position: absolute; left: 0; top: 0; width: 100vw; height: 100vh; background: rgba(30,40,60,0.35); backdrop-filter: blur(2px); }
            .roulette-modal-content { position: relative; background: #fff; border-radius: 18px; box-shadow: 0 8px 32px rgba(30,60,120,0.18); padding: 36px 32px 24px 32px; min-width: 260px; max-width: 90vw; text-align: center; z-index: 1; animation: popin 0.25s; }
            .roulette-modal-title { font-family: 'Montserrat', Arial, sans-serif; font-size: 1.5rem; font-weight: bold; color: #1976d2; margin-bottom: 12px; }
            .roulette-modal-question { font-family: 'Montserrat', Arial, sans-serif; font-size: 1.2rem; font-weight: 500; color: #222; margin-bottom: 18px; }
            .roulette-modal-choices { display: flex; flex-direction: column; gap: 12px; margin-bottom: 18px; }
            .roulette-modal-choice { background: #f7fafd; color: #1976d2; border: 2px solid #1976d2; border-radius: 18px; padding: 10px 0; font-size: 1.1rem; font-family: 'Montserrat', Arial, sans-serif; font-weight: 700; cursor: pointer; transition: background 0.2s, color 0.2s; }
            .roulette-modal-choice:hover { background: #1976d2; color: #fff; }
            .roulette-modal-choice.good { background: #43a047 !important; color: #fff !important; border-color: #43a047 !important; }
            .roulette-modal-choice.bad { background: #e53935 !important; color: #fff !important; border-color: #e53935 !important; }
            .roulette-modal-feedback { font-family: 'Montserrat', Arial, sans-serif; font-size: 1.1rem; font-weight: 600; color: #1976d2; min-height: 32px; margin-bottom: 12px; }
            .roulette-modal-feedback.bad { color: #e53935; }
            .roulette-modal-close { background: #1976d2; color: #fff; border: none; border-radius: 25px; padding: 10px 32px; font-size: 1.1rem; font-family: 'Montserrat', Arial, sans-serif; font-weight: 700; cursor: pointer; transition: background 0.2s; }
            .roulette-modal-close:hover { background: #1251a3; }
            @keyframes popin { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        `;
        document.head.appendChild(style);
        modal.querySelector('.roulette-modal-close').onclick = () => { modal.style.display = 'none'; };
        modal.querySelector('.roulette-modal-backdrop').onclick = () => { modal.style.display = 'none'; };
    }
    const questions = window.rouletteCatmanQuestions || [];
    const q = questions.find(q => q.acronyme === acronym);
    const feedbackDiv = document.getElementById('rouletteCatmanModalFeedback');
    if (!q) {
        document.getElementById('rouletteCatmanModalQuestion').textContent = `Aucune question trouvée pour ${acronym}`;
        [0,1,2,3].forEach(i => {
            document.getElementById('catmanChoice'+i).textContent = '';
            document.getElementById('catmanChoice'+i).disabled = true;
        });
        feedbackDiv.textContent = '';
    }
    document.getElementById('rouletteCatmanModalQuestion').textContent = `Que signifie ${acronym} ?`;
    const allAnswers = shuffle([q.answer, ...q.wrongAnswers]);
    allAnswers.forEach((ans, i) => {
        const btn = document.getElementById('catmanChoice'+i);
        btn.textContent = ans;
        btn.disabled = false;
        btn.classList.remove('good', 'bad');
        btn.onclick = () => {
            for (let j = 0; j < 4; j++) {
                document.getElementById('catmanChoice'+j).disabled = true;
            }
            if (ans === q.answer) {
                btn.classList.add('good');
                feedbackDiv.classList.remove('bad');
                feedbackDiv.textContent = `Félicitation, tu as trouvé la bonne réponse. ${acronym} signifie bien : ${q.answer}`;
            } else {
                btn.classList.add('bad');
                feedbackDiv.classList.add('bad');
                feedbackDiv.textContent = `Tu es mauvais Jack. ${acronym} signifie en fait : ${q.answer}`;
            }
        };
    });
    feedbackDiv.textContent = '';
    feedbackDiv.classList.remove('bad');
    modal.style.display = 'flex';
} 