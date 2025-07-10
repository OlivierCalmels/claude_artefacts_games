// Parseur CSV avancé pour Questionnaire CSE

document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('csvInput');
    const canvas = document.getElementById('cseCanvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    const status = document.getElementById('csvStatus');

    let headers = [];
    let rows = [];
    let currentCol = 0;
    let scrollOffset = 0;
    const rowHeight = 28;
    const headerHeight = 50;
    const arrowSize = 28;
    const scrollBtnHeight = 30;
    const maxVisibleRows = () => Math.floor((canvas.height - headerHeight - scrollBtnHeight) / rowHeight);

    if (!input || !canvas || !ctx) return;

    input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(evt) {
            const text = evt.target.result;
            const lines = text.split(/\r?\n/).filter(Boolean);
            if (lines.length === 0) return;
            headers = lines[0].split(',');
            rows = lines.slice(1).map(row => row.split(','));
            currentCol = 0;
            scrollOffset = 0;
            draw();
            status.textContent = `✅ Fichier chargé : ${file.name}`;
        };
        reader.readAsText(file);
    });

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Header navigation
        ctx.font = 'bold 20px Roboto, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#1976d2';
        // Flèche gauche
        ctx.beginPath();
        ctx.moveTo(arrowSize, headerHeight/2);
        ctx.lineTo(arrowSize+12, headerHeight/2-12);
        ctx.lineTo(arrowSize+12, headerHeight/2+12);
        ctx.closePath();
        ctx.fillStyle = currentCol > 0 ? '#1976d2' : '#bbb';
        ctx.fill();
        // Flèche droite
        ctx.beginPath();
        ctx.moveTo(canvas.width-arrowSize, headerHeight/2);
        ctx.lineTo(canvas.width-arrowSize-12, headerHeight/2-12);
        ctx.lineTo(canvas.width-arrowSize-12, headerHeight/2+12);
        ctx.closePath();
        ctx.fillStyle = currentCol < headers.length-1 ? '#1976d2' : '#bbb';
        ctx.fill();
        // Header text
        ctx.fillStyle = '#1976d2';
        ctx.fillText(headers[currentCol] || '', canvas.width/2, 18);
        // Affichage des réponses non vides
        ctx.font = '16px Roboto, Arial, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#222';
        // Filtrer les réponses non vides
        const filled = rows
            .map((row, i) => ({val: row[currentCol] ? row[currentCol].trim() : '', idx: i}))
            .filter(obj => obj.val !== '');
        const visibleRows = maxVisibleRows();
        for (let i = 0; i < visibleRows; i++) {
            const filledIdx = i + scrollOffset;
            if (filledIdx >= filled.length) break;
            const {val, idx} = filled[filledIdx];
            ctx.fillText(`${idx+1}. ${val}`, 24, headerHeight + i*rowHeight + 8);
        }
        // Scroll boutons si besoin
        if (filled.length > visibleRows) {
            // Up
            ctx.beginPath();
            ctx.moveTo(canvas.width-40, headerHeight+8);
            ctx.lineTo(canvas.width-28, headerHeight+8);
            ctx.lineTo(canvas.width-34, headerHeight-8);
            ctx.closePath();
            ctx.fillStyle = scrollOffset > 0 ? '#1976d2' : '#bbb';
            ctx.fill();
            // Down
            ctx.beginPath();
            ctx.moveTo(canvas.width-40, canvas.height-8);
            ctx.lineTo(canvas.width-28, canvas.height-8);
            ctx.lineTo(canvas.width-34, canvas.height-8+16);
            ctx.closePath();
            ctx.fillStyle = scrollOffset+visibleRows < filled.length ? '#1976d2' : '#bbb';
            ctx.fill();
        }
    }

    // Gestion clics sur le canvas
    canvas.addEventListener('click', function(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        // Flèche gauche
        if (x > arrowSize && x < arrowSize+24 && y > 10 && y < headerHeight-10) {
            if (currentCol > 0) {
                currentCol--;
                scrollOffset = 0;
                draw();
            }
        }
        // Flèche droite
        if (x > canvas.width-arrowSize-24 && x < canvas.width-arrowSize+8 && y > 10 && y < headerHeight-10) {
            if (currentCol < headers.length-1) {
                currentCol++;
                scrollOffset = 0;
                draw();
            }
        }
        // Scroll up
        if (rows.length > maxVisibleRows()) {
            if (x > canvas.width-40 && x < canvas.width-28 && y > headerHeight+8-10 && y < headerHeight+8+10) {
                if (scrollOffset > 0) {
                    scrollOffset--;
                    draw();
                }
            }
            // Scroll down
            if (x > canvas.width-40 && x < canvas.width-28 && y > canvas.height-8-10 && y < canvas.height-8+16+10) {
                if (scrollOffset+maxVisibleRows() < rows.length) {
                    scrollOffset++;
                    draw();
                }
            }
        }
    });
}); 