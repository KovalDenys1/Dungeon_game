import Player from './player.js';
import GameMap from './map.js';
import Enemy from './enemy.js';
import { spells } from './spells.js';

let projectiles = [];


const menu = document.getElementById('menu');
const canvas = document.getElementById('gameCanvas');
const gameContainer = document.getElementById('game-container');
const buttons = document.querySelectorAll('#menu-buttons button');
const authButtons = document.querySelectorAll('#auth-buttons button');

const GAME_WIDTH = 512;
const GAME_HEIGHT = 288;
const SCALE = 2;

let cameraX = 0;
let cameraY = 0;

canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

canvas.style.width = `${GAME_WIDTH * SCALE}px`;
canvas.style.height = `${GAME_HEIGHT * SCALE}px`;

let player;
let currentSpell = 'fireball';
let map;
let enemies = [];

buttons.forEach(button => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;

    switch (action) {
      case 'start':
        menu.style.display = 'none';
        gameContainer.style.display = 'flex';
        startGame();
        break;
      case 'character':
        alert('Character menu (coming soon)');
        break;
      case 'shop':
        alert('Shop menu (coming soon)');
        break;
      case 'exit':
        alert('Thanks for playing!');
        break;
    }
  });
});

document.getElementById('castButton').addEventListener('click', () => {
  spells[currentSpell](player, canvas.getContext('2d'), projectiles);
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'f') {
    spells[currentSpell](player, canvas.getContext('2d'), projectiles);
  }
});

function getFreeTile(map) {
    const height = map.length;
    const width = map[0].length;
  
    while (true) {
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);
  
      if (map[y][x] === 0) {
        return { x, y };
      }
    }
  }
  
authButtons.forEach(button => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;
    alert(`${action.charAt(0).toUpperCase() + action.slice(1)} is under development.`);
  });
});

function startGame() {
  const ctx = canvas.getContext('2d');

  map = new GameMap(16, SCALE);

  const spawnTileX = 1;
  const spawnTileY = 1;
  const tileSize = 16;

  player = new Player(
    spawnTileX * tileSize * SCALE,
    spawnTileY * tileSize * SCALE,
    SCALE,
    map.map
  );

  const e1 = getFreeTile(map.map);
  const e2 = getFreeTile(map.map);

  enemies = [
    new Enemy(e1.x * 16 * SCALE, e1.y * 16 * SCALE, SCALE, 'skeleton'),
    new Enemy(e2.x * 16 * SCALE, e2.y * 16 * SCALE, SCALE, 'vampire')
  ];

  let lastTime = 0;

  function gameLoop(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;

    // 📍 Update camera position
    cameraX = player.x + player.width / 2 - canvas.width / 2;
    cameraY = player.y + player.height / 2 - canvas.height / 2;

    // 📍 Clamp camera to map bounds
    const mapWidthPx = map.map[0].length * 16 * SCALE;
    const mapHeightPx = map.map.length * 16 * SCALE;

    cameraX = Math.max(0, Math.min(cameraX, mapWidthPx - canvas.width));
    cameraY = Math.max(0, Math.min(cameraY, mapHeightPx - canvas.height));

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save(); // 📍 Start camera transform
    ctx.translate(-cameraX, -cameraY);

    // 📍 Draw world relative to camera
    map.draw(ctx);
    player.update(deltaTime);
    player.draw(ctx);

    enemies.forEach(enemy => {
      enemy.update(deltaTime, player, map.map);
      enemy.draw(ctx);
    });

    projectiles.forEach(p => {
      p.update(deltaTime);
      p.draw(ctx);
    });
    projectiles = projectiles.filter(p => !p.markedForDeletion);

    ctx.restore(); // 📍 End camera transform

    requestAnimationFrame(gameLoop);
  }

  requestAnimationFrame(gameLoop);
}