// Parseur CSV avancé pour Questionnaire CSE (version DOM, sans canvas)

document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('csvInput');
    const tsvInput = document.getElementById('tsvInput');
    const status = document.getElementById('csvStatus');
    let container = document.getElementById('csvTableContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'csvTableContainer';
        container.style.maxWidth = '100%';
        container.style.margin = '32px auto 0 auto';
        container.style.background = '#f7fafd';
        container.style.border = '2px solid #1976d2';
        container.style.borderRadius = '12px';
        container.style.padding = '18px 8px 18px 8px';
        container.style.boxSizing = 'border-box';
        container.style.minHeight = '180px';
        container.style.overflow = 'hidden';
        container.style.display = 'none';
        const parent = document.getElementById('game7') || document.body;
        parent.appendChild(container);
    }

    let headers = [];
    let rows = [];
    let currentCol = 0;

    if (!input || !container) return;

    // Fonction pour mettre à jour l'URL avec la colonne courante
    function updateColInUrl(colIdx) {
        const url = new URL(window.location);
        url.searchParams.set('col', colIdx);
        window.history.replaceState({}, '', url);
    }

    // Fonction pour parser et afficher le CSV/TSV
    function parseAndRender(text, filename, type, colIdx) {
        let lines = text.split(/\r?\n/).filter(Boolean);
        if (lines.length === 0) return;
        let sep = (type === 'tsv') ? '\t' : ',';
        headers = lines[0].split(sep);
        rows = lines.slice(1).map(row => row.split(sep));
        currentCol = (typeof colIdx === 'number' && colIdx >= 0 && colIdx < headers.length) ? colIdx : 0;
        renderTable();
        status.textContent = filename ? `✅ Fichier chargé : ${filename}` : '✅ Fichier chargé depuis le navigateur';
        container.style.display = '';
    }

    // Chargement depuis localStorage au démarrage
    const savedCSV = localStorage.getItem('cse_csv_data');
    const savedType = localStorage.getItem('cse_csv_type') || 'csv';
    // Lecture du paramètre col dans l'URL
    let colFromUrl = 0;
    const params = new URLSearchParams(window.location.search);
    if (params.has('col')) {
        const idx = parseInt(params.get('col'), 10);
        if (!isNaN(idx) && idx >= 0) colFromUrl = idx;
    }
    if (savedCSV) {
        parseAndRender(savedCSV, null, savedType, colFromUrl);
    }

    input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(evt) {
            const text = evt.target.result;
            // Stockage dans le localStorage
            localStorage.setItem('cse_csv_data', text);
            localStorage.setItem('cse_csv_type', 'csv');
            parseAndRender(text, file.name, 'csv', colFromUrl);
        };
        reader.readAsText(file);
    });

    if (tsvInput) {
        tsvInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(evt) {
                const text = evt.target.result;
                // Stockage dans le localStorage
                localStorage.setItem('cse_csv_data', text);
                localStorage.setItem('cse_csv_type', 'tsv');
                parseAndRender(text, file.name, 'tsv', colFromUrl);
            };
            reader.readAsText(file);
        });
    }

    function renderTable(skipAutoAdvance) {
        updateColInUrl(currentCol);
        container.innerHTML = '';
        // Header navigation
        const nav = document.createElement('div');
        nav.style.display = 'flex';
        nav.style.alignItems = 'center';
        nav.style.justifyContent = 'center';
        nav.style.marginBottom = '12px';
        const leftBtn = document.createElement('button');
        leftBtn.textContent = '◀';
        leftBtn.style.fontSize = '1.2rem';
        leftBtn.style.marginRight = '12px';
        leftBtn.disabled = currentCol === 0;
        leftBtn.onclick = () => {
            let newCol = currentCol - 1;
            // Boucle pour sauter toutes les colonnes masquées (celles dont la suivante est une explication)
            while (newCol >= 0 && headers[newCol+1] && (
                headers[newCol+1].toLowerCase().includes('peux-tu expliquer ta note') ||
                headers[newCol+1].toLowerCase().includes('peux-tu expliquer ta réponse')
            )) {
                newCol--;
            }
            if (newCol >= 0) {
                currentCol = newCol;
                updateColInUrl(currentCol);
                renderTable(true);
            }
        };
        const rightBtn = document.createElement('button');
        rightBtn.textContent = '▶';
        rightBtn.style.fontSize = '1.2rem';
        rightBtn.style.marginLeft = '12px';
        rightBtn.disabled = currentCol === headers.length-1;
        rightBtn.onclick = () => {
            let newCol = currentCol + 1;
            // Boucle pour sauter toutes les colonnes masquées (celles dont la suivante est une explication)
            while (newCol < headers.length-1 && headers[newCol+1] && (
                headers[newCol+1].toLowerCase().includes('peux-tu expliquer ta note') ||
                headers[newCol+1].toLowerCase().includes('peux-tu expliquer ta réponse')
            )) {
                newCol++;
            }
            if (newCol < headers.length) {
                currentCol = newCol;
                updateColInUrl(currentCol);
                renderTable(true);
            }
        };
        const headerLabel = document.createElement('div');
        let displayHeader = headers[currentCol] || '';
        const isExplication = headers[currentCol] && (
            headers[currentCol].toLowerCase().includes('peux-tu expliquer ta note') ||
            headers[currentCol].toLowerCase().includes('peux-tu expliquer ta réponse')
        );
        if (isExplication && currentCol > 0) {
            const prevHeader = headers[currentCol-1] || '';
            // Regroupe intelligemment les deux headers, mais affiche les deux questions
            if (prevHeader.toLowerCase().includes('note')) {
                displayHeader = 'Note : ' + prevHeader + '\nExplication : ' + headers[currentCol];
            } else if (prevHeader.toLowerCase().includes('réponse')) {
                displayHeader = 'Réponse : ' + prevHeader + '\nExplication : ' + headers[currentCol];
            } else {
                displayHeader = prevHeader + ' \u2794 ' + headers[currentCol];
            }
        }
        // Affichage multi-ligne pour le header
        headerLabel.innerHTML = displayHeader.replace(/\n/g, '<br>');
        headerLabel.style.fontWeight = 'bold';
        headerLabel.style.fontSize = '1rem';
        headerLabel.style.flex = '1';
        headerLabel.style.textAlign = 'center';
        nav.appendChild(leftBtn);
        nav.appendChild(headerLabel);
        nav.appendChild(rightBtn);
        container.appendChild(nav);
        // Réponses non vides
        const filled = rows
            .map((row, i) => ({val: row[currentCol] ? row[currentCol].trim() : '', idx: i, prev: row[currentCol-1] ? row[currentCol-1].trim() : ''}))
            .filter(obj => obj.val !== '');
        const list = document.createElement('div');
        list.style.maxHeight = '320px';
        list.style.overflowY = 'auto';
        list.style.fontSize = '0.95rem';
        list.style.lineHeight = '1.4';
        list.style.textAlign = 'left';
        list.style.padding = '0 8px';
        // On saute l'affichage de la colonne principale si la suivante est une explication
        const isExplicationNext = headers[currentCol+1] && (
            headers[currentCol+1].toLowerCase().includes('peux-tu expliquer ta note') ||
            headers[currentCol+1].toLowerCase().includes('peux-tu expliquer ta réponse')
        );
        if (isExplicationNext && !skipAutoAdvance) {
            // Avance automatiquement à la colonne d'explication
            currentCol++;
            updateColInUrl(currentCol);
            renderTable();
            return;
        }
        filled.forEach(({val, idx, prev}) => {
            const item = document.createElement('div');
            if (isExplication && currentCol > 0) {
                item.innerHTML = `${idx+1}. Appréciation: ${prev}<br>Explication: ${val}`;
            } else {
                item.textContent = `${idx+1}. ${val}`;
            }
            item.style.marginBottom = '6px';
            list.appendChild(item);
        });
        if (filled.length === 0) {
            const empty = document.createElement('div');
            empty.textContent = 'Aucune réponse.';
            empty.style.opacity = '0.7';
            list.appendChild(empty);
        }
        container.appendChild(list);
        // Ajout du graphique si notes chiffrées ou colonne d'explication
        let chartContainer = document.getElementById('barChartCSE');
        if (!chartContainer) {
            chartContainer = document.createElement('canvas');
            chartContainer.id = 'barChartCSE';
            chartContainer.style.width = '100%';
            chartContainer.style.maxWidth = '100%';
            chartContainer.style.margin = '24px auto 0 auto';
            chartContainer.height = 320;
            chartContainer.style.height = '320px';
            container.appendChild(chartContainer);
        } else {
            // On le déplace sous la liste
            container.appendChild(chartContainer);
            chartContainer.style.width = '100%';
            chartContainer.style.maxWidth = '100%';
            chartContainer.height = 320;
            chartContainer.style.height = '320px';
        }
        // Détection des notes chiffrées (colonne courante OU colonne précédente si explication)
        let notes = [];
        if (isExplication && currentCol > 0) {
            notes = filled.map(obj => obj.prev).filter(v => /^\d+(\.\d+)?$/.test(v));
        } else {
            notes = filled.map(obj => obj.val).filter(v => /^\d+(\.\d+)?$/.test(v));
        }
        if (notes.length === filled.length && notes.length > 0) {
            // Distribution des notes
            const counts = {};
            notes.forEach(n => { counts[n] = (counts[n]||0)+1; });
            const labels = Object.keys(counts).sort((a,b)=>parseFloat(a)-parseFloat(b));
            const data = labels.map(l => counts[l]);
            // Affichage Chart.js
            if (window.barChartCSEInstance) window.barChartCSEInstance.destroy();
            window.barChartCSEInstance = new Chart(chartContainer, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'Nombre de réponses',
                        data,
                        backgroundColor: '#1976d2',
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: { x: { title: { display: true, text: 'Note' } }, y: { beginAtZero: true, title: { display: true, text: 'Nombre' } } }
                }
            });
        } else {
            if (window.barChartCSEInstance) {
                window.barChartCSEInstance.destroy();
                window.barChartCSEInstance = null;
            }
            chartContainer.style.display = 'none';
        }
    }
}); 