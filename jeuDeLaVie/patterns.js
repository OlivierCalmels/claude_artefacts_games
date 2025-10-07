// Bibliothèque de formes prédéfinies pour le Jeu de la Vie
const LIFE_PATTERNS = {
  // Planeur (Glider) - se déplace en diagonale
  glider: {
    name: "Planeur",
    width: 3,
    height: 3,
    pattern: [
      [0, 1, 0],
      [0, 0, 1],
      [1, 1, 1],
    ],
  },

  // Canon à planeurs de Gosper
  gosperGliderGun: {
    name: "Canon à planeurs",
    width: 36,
    height: 9,
    pattern: [
      [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
      [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
      [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1,
      ],
      [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1,
      ],
      [
        1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
      [
        1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
      [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
      [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
      [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
    ],
  },

  // Oscillateur - barre (Blinker)
  blinker: {
    name: "Barre clignotante",
    width: 3,
    height: 1,
    pattern: [[1, 1, 1]],
  },

  // Crapaud (Toad)
  toad: {
    name: "Crapaud",
    width: 4,
    height: 2,
    pattern: [
      [0, 1, 1, 1],
      [1, 1, 1, 0],
    ],
  },

  // Balise (Beacon)
  beacon: {
    name: "Balise",
    width: 4,
    height: 4,
    pattern: [
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [0, 0, 1, 1],
      [0, 0, 1, 1],
    ],
  },

  // Pulsar
  pulsar: {
    name: "Pulsar",
    width: 13,
    height: 13,
    pattern: [
      [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
      [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
      [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
    ],
  },

  // Vaisseau spatial léger (LWSS)
  lwss: {
    name: "Vaisseau léger",
    width: 5,
    height: 4,
    pattern: [
      [0, 1, 0, 0, 1],
      [1, 0, 0, 0, 0],
      [1, 0, 0, 0, 1],
      [1, 1, 1, 1, 0],
    ],
  },

  // R-pentomino (forme chaotique)
  rPentomino: {
    name: "R-pentomino",
    width: 3,
    height: 3,
    pattern: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 1, 0],
    ],
  },

  // Diehard (disparaît après 130 générations)
  diehard: {
    name: "Diehard",
    width: 8,
    height: 3,
    pattern: [
      [0, 0, 0, 0, 0, 0, 1, 0],
      [1, 1, 0, 0, 0, 0, 0, 0],
      [0, 1, 0, 0, 0, 1, 1, 1],
    ],
  },

  // Acorn (génère beaucoup d'activité)
  acorn: {
    name: "Gland",
    width: 7,
    height: 3,
    pattern: [
      [0, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0],
      [1, 1, 0, 0, 1, 1, 1],
    ],
  },

  // Pentadecathlon (oscillateur période 15)
  pentadecathlon: {
    name: "Pentadecathlon",
    width: 10,
    height: 3,
    pattern: [
      [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
      [1, 1, 0, 1, 1, 1, 1, 0, 1, 1],
      [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
    ],
  },

  // Block (vie statique)
  block: {
    name: "Bloc",
    width: 2,
    height: 2,
    pattern: [
      [1, 1],
      [1, 1],
    ],
  },

  // Beehive (vie statique)
  beehive: {
    name: "Ruche",
    width: 4,
    height: 3,
    pattern: [
      [0, 1, 1, 0],
      [1, 0, 0, 1],
      [0, 1, 1, 0],
    ],
  },

  // Loaf (vie statique)
  loaf: {
    name: "Pain",
    width: 4,
    height: 4,
    pattern: [
      [0, 1, 1, 0],
      [1, 0, 0, 1],
      [0, 1, 0, 1],
      [0, 0, 1, 0],
    ],
  },

  // Boat (vie statique)
  boat: {
    name: "Bateau",
    width: 3,
    height: 3,
    pattern: [
      [1, 1, 0],
      [1, 0, 1],
      [0, 1, 0],
    ],
  },

  // Galaxy (oscillateur symétrique)
  galaxy: {
    name: "Galaxie",
    width: 13,
    height: 13,
    pattern: [
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
      [1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1],
      [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1],
      [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1],
      [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1],
      [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
    ],
  },

  // Vaisseau spatial moyen (MWSS)
  mwss: {
    name: "Vaisseau moyen",
    width: 6,
    height: 5,
    pattern: [
      [0, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 1, 0],
      [1, 0, 0, 0, 0, 1],
      [0, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0],
    ],
  },

  // Vaisseau spatial lourd (HWSS)
  hwss: {
    name: "Vaisseau lourd",
    width: 7,
    height: 5,
    pattern: [
      [0, 0, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 0],
      [1, 0, 0, 0, 0, 0, 1],
      [0, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0],
    ],
  },

  // Puffer train (locomotive à fumée)
  pufferTrain: {
    name: "Train à fumée",
    width: 5,
    height: 3,
    pattern: [
      [0, 0, 1, 1, 1],
      [1, 1, 1, 0, 1],
      [0, 0, 1, 0, 0],
    ],
  },
};
