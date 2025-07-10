// Parseur CSV avancé pour Questionnaire CSE (version DOM, sans canvas)

document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('csvInput');
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

    // Fonction pour parser et afficher le CSV
    function parseAndRender(text, filename) {
        const lines = text.split(/\r?\n/).filter(Boolean);
        if (lines.length === 0) return;
        headers = lines[0].split(',');
        rows = lines.slice(1).map(row => row.split(','));
        currentCol = 0;
        renderTable();
        status.textContent = filename ? `✅ Fichier chargé : ${filename}` : '✅ CSV chargé depuis le navigateur';
        container.style.display = '';
    }

    // Chargement depuis localStorage au démarrage
    const savedCSV = localStorage.getItem('cse_csv_data');
    if (savedCSV) {
        parseAndRender(savedCSV, null);
    }

    input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(evt) {
            const text = evt.target.result;
            // Stockage dans le localStorage
            localStorage.setItem('cse_csv_data', text);
            parseAndRender(text, file.name);
        };
        reader.readAsText(file);
    });

    function renderTable() {
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
        leftBtn.onclick = () => { currentCol--; renderTable(); };
        const rightBtn = document.createElement('button');
        rightBtn.textContent = '▶';
        rightBtn.style.fontSize = '1.2rem';
        rightBtn.style.marginLeft = '12px';
        rightBtn.disabled = currentCol === headers.length-1;
        rightBtn.onclick = () => { currentCol++; renderTable(); };
        const headerLabel = document.createElement('div');
        headerLabel.textContent = headers[currentCol] || '';
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
            .map((row, i) => ({val: row[currentCol] ? row[currentCol].trim() : '', idx: i}))
            .filter(obj => obj.val !== '');
        const list = document.createElement('div');
        list.style.maxHeight = '320px';
        list.style.overflowY = 'auto';
        list.style.fontSize = '0.95rem';
        list.style.lineHeight = '1.4';
        list.style.textAlign = 'left';
        list.style.padding = '0 8px';
        filled.forEach(({val, idx}) => {
            const item = document.createElement('div');
            item.textContent = `${idx+1}. ${val}`;
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
    }
}); 