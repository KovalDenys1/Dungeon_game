import Player from './player.js';
import GameMap from './map.js';
import Enemy from './enemy.js';
import { spells } from './spells.js';

let projectiles = []; // Array to store active projectiles

// DOM elements for the game menu and canvas
const menu = document.getElementById('menu');
const canvas = document.getElementById('gameCanvas');
const gameContainer = document.getElementById('game-container');
const buttons = document.querySelectorAll('#menu-buttons button');
const authButtons = document.querySelectorAll('#auth-buttons button');

// Game constants
const GAME_WIDTH = 512; // Width of the game canvas
const GAME_HEIGHT = 288; // Height of the game canvas
const SCALE = 2; // Scale factor for rendering

// Camera position
let cameraX = 0;
let cameraY = 0;

// Set canvas dimensions
canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

// Scale the canvas for display
canvas.style.width = `${GAME_WIDTH * SCALE}px`;
canvas.style.height = `${GAME_HEIGHT * SCALE}px`;

// Game variables
let player; // Player instance
let currentSpell = 'fireball'; // Default spell
let map; // Game map instance
let enemies = []; // Array to store enemies

// Add event listeners to menu buttons
buttons.forEach(button => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;

    switch (action) {
      case 'start':
        // Start the game
        menu.style.display = 'none';
        gameContainer.style.display = 'flex';
        startGame();
        break;
      case 'character':
        // Placeholder for character menu
        alert('Character menu (coming soon)');
        break;
      case 'shop':
        // Placeholder for shop menu
        alert('Shop menu (coming soon)');
        break;
      case 'exit':
        // Exit the game
        alert('Thanks for playing!');
        break;
    }
  });
});

// Add event listener for casting spells
document.getElementById('castButton').addEventListener('click', () => {
  spells[currentSpell](player, canvas.getContext('2d'), projectiles);
});

// Add keyboard shortcut for casting spells
window.addEventListener('keydown', (e) => {
  if (e.key === 'f') {
    spells[currentSpell](player, canvas.getContext('2d'), projectiles);
  }
});

// Function to find a free tile on the map
function getFreeTile(map) {
  const height = map.length;
  const width = map[0].length;

  while (true) {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);

    if (map[y][x] === 0) {
      return { x, y }; // Return coordinates of a free tile
    }
  }
}

// Add event listeners for authentication buttons
authButtons.forEach(button => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;
    alert(`${action.charAt(0).toUpperCase() + action.slice(1)} is under development.`);
  });
});

// Function to start the game
function startGame() {
  const ctx = canvas.getContext('2d'); // Get canvas rendering context

  map = new GameMap(16, SCALE); // Create a new game map

  const tileSize = 16;

  // Spawn the player in the center of the map
  let centerX = Math.floor(map.map[0].length / 2);
  let centerY = Math.floor(map.map.length / 2);

  // If the center tile is occupied, find the nearest free tile
  if (map.map[centerY][centerX] !== 0) {
    const spawn = getFreeTile(map.map);
    centerX = spawn.x;
    centerY = spawn.y;
  }

  player = new Player(
    centerX * tileSize * SCALE,
    centerY * tileSize * SCALE,
    SCALE,
    map.map
  );

  // Spawn enemies (6 to 10)
  enemies = [];
  const enemyCount = 6 + Math.floor(Math.random() * 5); // Random number of enemies

  for (let i = 0; i < enemyCount; i++) {
    const spawn = getFreeTile(map.map);
    const type = Math.random() < 0.5 ? 'skeleton' : 'vampire'; // Random enemy type
    enemies.push(new Enemy(
      spawn.x * tileSize * SCALE,
      spawn.y * tileSize * SCALE,
      SCALE,
      type
    ));
  }

  let lastTime = 0; // Track the last frame time

  // Main game loop
  function gameLoop(timeStamp) {
    const deltaTime = timeStamp - lastTime; // Calculate time difference
    lastTime = timeStamp;

    // Update camera position to follow the player
    cameraX = player.x + player.width / 2 - canvas.width / 2;
    cameraY = player.y + player.height / 2 - canvas.height / 2;

    const mapWidthPx = map.map[0].length * tileSize * SCALE;
    const mapHeightPx = map.map.length * tileSize * SCALE;

    // Clamp camera position to map boundaries
    cameraX = Math.max(0, Math.min(cameraX, mapWidthPx - canvas.width));
    cameraY = Math.max(0, Math.min(cameraY, mapHeightPx - canvas.height));

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    ctx.save();
    ctx.translate(-cameraX, -cameraY); // Apply camera translation

    map.draw(ctx); // Draw the map
    player.update(deltaTime); // Update the player
    player.draw(ctx); // Draw the player

    // Update and draw enemies
    enemies.forEach(enemy => {
      enemy.update(deltaTime, player, map.map);
      enemy.draw(ctx);
    });

    // Update and draw projectiles
    projectiles.forEach(p => {
      p.update(deltaTime);
      p.draw(ctx);
    });
    projectiles = projectiles.filter(p => !p.markedForDeletion); // Remove deleted projectiles

    ctx.restore();

    requestAnimationFrame(gameLoop); // Request the next frame
  }

  requestAnimationFrame(gameLoop); // Start the game loop
}