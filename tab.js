// Tab switching
function switchTab(tabIndex) {
    const games = document.querySelectorAll('.game-container');
    games.forEach(game => game.classList.remove('active'));
    games[tabIndex].classList.add('active');
    // Mise à jour de l'URL sans recharger la page
    let jeu;
    switch(tabIndex) {
        case 0: jeu = 'home'; break;
        case 1: jeu = 'pong'; break;
        case 2: jeu = 'football'; break;
        case 3: jeu = 'football2'; break;
        case 4: jeu = 'football3'; break;
        case 5: jeu = 'roulette'; break;
        default: jeu = 'home';
    }
    const url = new URL(window.location);
    url.searchParams.set('jeu', jeu);
    window.history.replaceState({}, '', url);
    if (tabIndex === 1 && typeof resizeCanvas === 'function') {
        resizeCanvas();
    }
}

// Sélection de l'onglet au chargement selon l'URL
window.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const jeu = params.get('jeu');
    let tabIndex = 0;
    switch(jeu) {
        case 'pong': tabIndex = 1; break;
        case 'football': tabIndex = 2; break;
        case 'football2': tabIndex = 3; break;
        case 'football3': tabIndex = 4; break;
        case 'roulette': tabIndex = 5; break;
        default: tabIndex = 0;
    }
    switchTab(tabIndex);
}); 