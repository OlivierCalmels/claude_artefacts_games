// Jeu de la Vie de Conway - Namespace pour éviter les conflits
(function () {
  const GRID_SIZE = 20;
  let canvas = null;
  let ctx = null;
  let CELL_SIZE = 20;

  let grid = [];
  let isPlaying = false;
  let intervalId = null;
  let isInitialized = false;

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

  // Dessiner la grille
  function drawGrid() {
    if (!ctx || !canvas) {
      console.log("drawGrid: ctx ou canvas manquant");
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dessiner les cellules
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        ctx.fillStyle = grid[i][j] ? "#1976d2" : "#ffffff";
        ctx.fillRect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);

        // Bordure des cellules
        ctx.strokeStyle = "#e0e0e0";
        ctx.lineWidth = 1;
        ctx.strokeRect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);
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

  // Calculer la prochaine génération
  function nextGeneration() {
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

    grid = newGrid;
    drawGrid();
  }

  // Démarrer le jeu
  window.playGameOfLife = function () {
    if (isPlaying) return;

    isPlaying = true;
    intervalId = setInterval(() => {
      nextGeneration();
    }, 200);
  };

  // Mettre en pause
  window.pauseGameOfLife = function () {
    isPlaying = false;
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  // Réinitialiser
  window.resetGameOfLife = function () {
    window.pauseGameOfLife();
    initGrid();
    drawGrid();
  };

  // Générer une configuration aléatoire
  window.randomizeGameOfLife = function () {
    window.pauseGameOfLife();
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        grid[i][j] = Math.random() > 0.7;
      }
    }
    drawGrid();
  };

  // Gérer les clics sur le canvas
  function handleCanvasClick(e) {
    if (!canvas || isPlaying) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);

    if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
      grid[row][col] = !grid[row][col];
      drawGrid();
    }
  }

  // Gérer les événements tactiles
  function handleCanvasTouchStart(e) {
    e.preventDefault();
    if (!canvas || isPlaying) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);

    if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
      grid[row][col] = !grid[row][col];
      drawGrid();
    }
  }

  // Initialiser le jeu de la vie
  window.initGameOfLife = function () {
    canvas = document.getElementById("jeuDeLaVieCanvas");
    if (!canvas) {
      return;
    }

    ctx = canvas.getContext("2d");
    CELL_SIZE = canvas.width / GRID_SIZE;

    // Retirer les anciens listeners s'ils existent
    canvas.removeEventListener("click", handleCanvasClick);
    canvas.removeEventListener("touchstart", handleCanvasTouchStart);

    // Ajouter les nouveaux listeners
    canvas.addEventListener("click", handleCanvasClick);
    canvas.addEventListener("touchstart", handleCanvasTouchStart);

    if (!isInitialized) {
      initGrid();
      isInitialized = true;
    }

    drawGrid();
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
