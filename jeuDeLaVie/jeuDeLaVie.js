// Jeu de la Vie de Conway - Namespace pour éviter les conflits
(function () {
  let GRID_SIZE = 30; // Taille totale de la grille
  let VISIBLE_SIZE = 15; // Taille de la zone visible
  let canvas = null;
  let ctx = null;
  let CELL_SIZE = 20;

  let grid = [];
  let isPlaying = false;
  let intervalId = null;
  let isInitialized = false;
  let generation = 0;
  let offsetX = 0; // Décalage horizontal de la vue
  let offsetY = 0; // Décalage vertical de la vue
  let animationSpeed = 200; // Vitesse en ms (200ms par défaut)

  // Initialiser la grille
  function initGrid() {
    grid = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      grid[i] = [];
      for (let j = 0; j < GRID_SIZE; j++) {
        grid[i][j] = false;
      }
    }
  }

  // Dessiner la grille (seulement la partie visible)
  function drawGrid() {
    if (!ctx || !canvas) {
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dessiner seulement les cellules visibles
    for (let i = 0; i < VISIBLE_SIZE; i++) {
      for (let j = 0; j < VISIBLE_SIZE; j++) {
        const gridRow = offsetY + i;
        const gridCol = offsetX + j;

        if (
          gridRow >= 0 &&
          gridRow < GRID_SIZE &&
          gridCol >= 0 &&
          gridCol < GRID_SIZE
        ) {
          ctx.fillStyle = grid[gridRow][gridCol] ? "#1976d2" : "#ffffff";
          ctx.fillRect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);

          // Bordure des cellules
          ctx.strokeStyle = "#e0e0e0";
          ctx.lineWidth = 1;
          ctx.strokeRect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }
  }

  // Compter les voisins vivants
  function countNeighbors(x, y) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;

        const newX = x + i;
        const newY = y + j;

        if (newX >= 0 && newX < GRID_SIZE && newY >= 0 && newY < GRID_SIZE) {
          if (grid[newX][newY]) count++;
        }
      }
    }
    return count;
  }

  // Mettre à jour le compteur
  function updateGenerationCounter() {
    const counter = document.getElementById("generationCounter");
    if (counter) {
      counter.textContent = generation;
    }
  }

  // Vérifier si la grille a changé
  function hasGridChanged(oldGrid, newGrid) {
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (oldGrid[i][j] !== newGrid[i][j]) {
          return true;
        }
      }
    }
    return false;
  }

  // Calculer la prochaine génération
  function nextGeneration() {
    const oldGrid = JSON.parse(JSON.stringify(grid));
    const newGrid = [];

    for (let i = 0; i < GRID_SIZE; i++) {
      newGrid[i] = [];
      for (let j = 0; j < GRID_SIZE; j++) {
        const neighbors = countNeighbors(i, j);

        if (grid[i][j]) {
          // Cellule vivante
          newGrid[i][j] = neighbors === 2 || neighbors === 3;
        } else {
          // Cellule morte
          newGrid[i][j] = neighbors === 3;
        }
      }
    }

    // Si la grille n'a pas changé, arrêter l'animation
    if (!hasGridChanged(oldGrid, newGrid)) {
      window.pauseGameOfLife();
      return;
    }

    grid = newGrid;
    generation++;
    drawGrid();
    updateGenerationCounter();
  }

  // Basculer entre lecture et pause
  window.togglePlayPauseGameOfLife = function () {
    if (isPlaying) {
      // Mettre en pause
      isPlaying = false;
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      // Mettre à jour le bouton
      const btn = document.getElementById("playPauseBtn");
      if (btn) {
        btn.innerHTML = "▶️ Lecture";
      }
    } else {
      // Démarrer
      isPlaying = true;
      intervalId = setInterval(() => {
        nextGeneration();
      }, animationSpeed);
      // Mettre à jour le bouton
      const btn = document.getElementById("playPauseBtn");
      if (btn) {
        btn.innerHTML = "⏸️ Pause";
      }
    }
  };

  // Changer la vitesse d'animation
  window.changeAnimationSpeed = function (speed) {
    animationSpeed = speed;

    // Si l'animation est en cours, la redémarrer avec la nouvelle vitesse
    if (isPlaying) {
      clearInterval(intervalId);
      intervalId = setInterval(() => {
        nextGeneration();
      }, animationSpeed);
    }
  };

  // Compatibilité avec les anciens appels
  window.playGameOfLife = window.togglePlayPauseGameOfLife;
  window.pauseGameOfLife = function () {
    if (isPlaying) {
      window.togglePlayPauseGameOfLife();
    }
  };

  // Réinitialiser
  window.resetGameOfLife = function () {
    window.pauseGameOfLife();
    generation = 0;
    initGrid();
    centerView();
    drawGrid();
    updateGenerationCounter();
  };

  // Générer une configuration aléatoire
  window.randomizeGameOfLife = function () {
    window.pauseGameOfLife();
    generation = 0;
    centerView();
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        grid[i][j] = Math.random() > 0.7;
      }
    }
    drawGrid();
    updateGenerationCounter();
  };

  // Placer une forme prédéfinie
  window.placePattern = function (patternKey) {
    if (!LIFE_PATTERNS || !LIFE_PATTERNS[patternKey]) {
      console.error("Pattern non trouvé:", patternKey);
      return;
    }

    window.pauseGameOfLife();
    generation = 0;
    initGrid();

    const pattern = LIFE_PATTERNS[patternKey];
    const startRow = Math.floor((GRID_SIZE - pattern.height) / 2);
    const startCol = Math.floor((GRID_SIZE - pattern.width) / 2);

    for (let i = 0; i < pattern.pattern.length; i++) {
      for (let j = 0; j < pattern.pattern[i].length; j++) {
        const row = startRow + i;
        const col = startCol + j;
        if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
          grid[row][col] = pattern.pattern[i][j] === 1;
        }
      }
    }

    drawGrid();
    updateGenerationCounter();
  };

  // Gérer les clics sur le canvas
  function handleCanvasClick(e) {
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);

    // Convertir en coordonnées de la grille complète
    const gridRow = offsetY + row;
    const gridCol = offsetX + col;

    if (
      gridRow >= 0 &&
      gridRow < GRID_SIZE &&
      gridCol >= 0 &&
      gridCol < GRID_SIZE
    ) {
      grid[gridRow][gridCol] = !grid[gridRow][gridCol];
      drawGrid();
    }
  }

  // Gérer les événements tactiles
  function handleCanvasTouchStart(e) {
    e.preventDefault();
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);

    // Convertir en coordonnées de la grille complète
    const gridRow = offsetY + row;
    const gridCol = offsetX + col;

    if (
      gridRow >= 0 &&
      gridRow < GRID_SIZE &&
      gridCol >= 0 &&
      gridCol < GRID_SIZE
    ) {
      grid[gridRow][gridCol] = !grid[gridRow][gridCol];
      drawGrid();
    }
  }

  // Centrer la vue sur la grille
  function centerView() {
    offsetX = Math.floor((GRID_SIZE - VISIBLE_SIZE) / 2);
    offsetY = Math.floor((GRID_SIZE - VISIBLE_SIZE) / 2);
  }

  // Changer la taille de la grille visible
  window.changeGridSize = function (newVisibleSize) {
    window.pauseGameOfLife();

    VISIBLE_SIZE = newVisibleSize;
    GRID_SIZE = VISIBLE_SIZE * 2;

    // Recalculer la taille des cellules
    if (canvas) {
      CELL_SIZE = canvas.width / VISIBLE_SIZE;
    }

    // Réinitialiser la grille
    generation = 0;
    initGrid();
    centerView();
    drawGrid();
    updateGenerationCounter();

    // Mettre à jour le sélecteur visuellement
    const select = document.getElementById("gridSizeSelect");
    if (select) {
      select.value = newVisibleSize;
    }
  };

  // Initialiser le jeu de la vie
  window.initGameOfLife = function () {
    canvas = document.getElementById("jeuDeLaVieCanvas");
    if (!canvas) {
      return;
    }

    ctx = canvas.getContext("2d");
    CELL_SIZE = canvas.width / VISIBLE_SIZE;

    // Retirer les anciens listeners s'ils existent
    canvas.removeEventListener("click", handleCanvasClick);
    canvas.removeEventListener("touchstart", handleCanvasTouchStart);

    // Ajouter les nouveaux listeners
    canvas.addEventListener("click", handleCanvasClick);
    canvas.addEventListener("touchstart", handleCanvasTouchStart);

    if (!isInitialized) {
      initGrid();
      centerView();
      isInitialized = true;
    }

    drawGrid();
    updateGenerationCounter();
  };

  // Initialiser au chargement de la page
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(window.initGameOfLife, 100);
    });
  } else {
    setTimeout(window.initGameOfLife, 100);
  }
})();
