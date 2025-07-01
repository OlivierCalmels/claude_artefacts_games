// Génère une palette de 'n' couleurs harmonieuses en HEX
function generateColorPalette(n) {
  const colors = [];
  const saturation = 70; // % pour garder une belle saturation
  const lightness = 50;  // % pour une bonne visibilité

  for (let i = 0; i < n; i++) {
    const hue = Math.round((360 / n) * i); // Espacement régulier
    colors.push(hslToHex(hue, saturation, lightness));
  }

  return colors;
}

// Convertit HSL en HEX
function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;

  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n =>
    Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));

  return `#${[f(0), f(8), f(4)].map(x => x.toString(16).padStart(2, '0')).join('')}`;
}

// // Exemple d'utilisation
// const palette = generateColorPalette(5);

window.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('rouletteCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;

    // Liste des acronymes (modifiable)
    const acronyms = ['CHSCT', 'CSE', 'SSCT', 'PAPRIPACT', 'BDESE', "CARSAT"];
    const colors = generateColorPalette(acronyms.length);
    // const colors = [
    //     '#ff5252', '#ffd600', '#43a047', '#1976d2',
    //     '#ff4081', '#00bcd4', '#ff9800', '#8bc34a'
    // ];
    let angle = 0;
    let spinning = false;
    let spinVelocity = 0;
    let selectedIndex = null;

    // Ajout d'un élément pour afficher le résultat en continu
    let resultDiv = document.getElementById('rouletteResult');
    if (!resultDiv) {
        resultDiv = document.createElement('div');
        resultDiv.id = 'rouletteResult';
        resultDiv.style.fontFamily = 'Montserrat, Arial, sans-serif';
        resultDiv.style.fontWeight = 'bold';
        resultDiv.style.fontSize = '2rem';
        resultDiv.style.textAlign = 'center';
        resultDiv.style.margin = '18px 0 0 0';
        canvas.parentNode.insertBefore(resultDiv, canvas.nextSibling);
    }

    // Ajout d'un élément pour debug
    let debugDiv = document.getElementById('rouletteDebug');
    if (!debugDiv) {
        debugDiv = document.createElement('div');
        debugDiv.id = 'rouletteDebug';
        debugDiv.style.fontFamily = 'monospace';
        debugDiv.style.fontSize = '1rem';
        debugDiv.style.textAlign = 'center';
        debugDiv.style.margin = '8px 0 0 0';
        canvas.parentNode.insertBefore(debugDiv, resultDiv.nextSibling);
    }

    // Fonction modulo robuste pour index positif
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

            // Texte de l'acronyme
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
        // Flèche
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
        // Calcul précis de l'acronyme sous la flèche (alignement parfait)
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
                    alert('Résultat : ' + acronyms[selectedIndex]);
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