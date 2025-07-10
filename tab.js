// Tab switching
function switchTab(tabIndex) {
    const games = document.querySelectorAll('.game-container');
    games.forEach(game => game.classList.remove('active'));
    games[tabIndex].classList.add('active');
    // Mise à jour de l'URL sans recharger la page
    let app;
    switch(tabIndex) {
        case 0: app = 'home'; break;
        case 1: app = 'pong'; break;
        case 2: app = 'football'; break;
        case 3: app = 'football2'; break;
        case 4: app = 'football3'; break;
        case 5: app = 'roulette'; break;
        case 6: app = 'rouletteCatman'; break;
        case 7: app = 'questionnaireCSE'; break;
        default: app = 'home';
    }
    const url = new URL(window.location);
    url.searchParams.set('app', app);
    window.history.replaceState({}, '', url);
    if (tabIndex === 1 && typeof resizeCanvas === 'function') {
        resizeCanvas();
    }
}

// Sélection de l'onglet au chargement selon l'URL
window.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const app = params.get('app');
    let tabIndex = 0;
    switch(app) {
        case 'pong': tabIndex = 1; break;
        case 'football': tabIndex = 2; break;
        case 'football2': tabIndex = 3; break;
        case 'football3': tabIndex = 4; break;
        case 'roulette': tabIndex = 5; break;
        case 'rouletteCatman': tabIndex = 6; break;
        case 'questionnaireCSE': tabIndex = 7; break;
        default: tabIndex = 0;
    }
    switchTab(tabIndex);
}); 