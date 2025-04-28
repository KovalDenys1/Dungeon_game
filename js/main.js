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

canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;
canvas.style.width = `${GAME_WIDTH * SCALE}px`;
canvas.style.height = `${GAME_HEIGHT * SCALE}px`;

let player;
let currentSpell = 'fireball';
let map;
let enemies = [];

let cameraX = 0;
let cameraY = 0;
let lastTime = 0;
let gameStarted = false;
let isGameOver = false;

// === UI buttons
buttons.forEach(button => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;
    if (action === 'start' && !gameStarted) {
      gameStarted = true;
      menu.style.display = 'none';
      gameContainer.style.display = 'flex';
      startGame();
    }
  });
});

authButtons.forEach(button => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;
    alert(`${action.charAt(0).toUpperCase() + action.slice(1)} is under development.`);
  });
});

// === Setup controls ONCE
window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyF' && player && !isGameOver) {
    spells[currentSpell](player, canvas.getContext('2d'), projectiles);
  }
  if (e.code === 'KeyE' && player && !isGameOver) {
    meleeAttack();
  }
});

// === Melee attack function
function meleeAttack() {
  const meleeRange = 30;

  enemies.forEach(enemy => {
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const dist = Math.hypot(dx, dy);

    if (dist < meleeRange) {
      enemy.hp -= 20;
    }
  });
}

// === Find a free tile
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

// === Start game
function startGame() {
  const ctx = canvas.getContext('2d');
  map = new GameMap(16, SCALE);

  const tileSize = 16;

  let centerX = Math.floor(map.map[0].length / 2);
  let centerY = Math.floor(map.map.length / 2);

  if (map.map[centerY][centerX] !== 0) {
    const spawn = getFreeTile(map.map);
    centerX = spawn.x;
    centerY = spawn.y;
  }

  player = new Player(centerX * tileSize * SCALE, centerY * tileSize * SCALE, SCALE, map.map);

  enemies = [];
  const enemyCount = 6 + Math.floor(Math.random() * 5);

  for (let i = 0; i < enemyCount; i++) {
    const spawn = getFreeTile(map.map);
    const type = Math.random() < 0.5 ? 'skeleton' : 'vampire';
    enemies.push(new Enemy(spawn.x * tileSize * SCALE, spawn.y * tileSize * SCALE, SCALE, type));
  }

  lastTime = performance.now();
  isGameOver = false;
  requestAnimationFrame(gameLoop);
}

// === Main game loop
function gameLoop(timeStamp) {
  if (!player) {
    requestAnimationFrame(gameLoop);
    return;
  }

  const deltaTime = timeStamp - lastTime;
  lastTime = timeStamp;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  cameraX = player.x + player.width / 2 - canvas.width / 2;
  cameraY = player.y + player.height / 2 - canvas.height / 2;

  const mapWidthPx = map.map[0].length * 16 * SCALE;
  const mapHeightPx = map.map.length * 16 * SCALE;

  cameraX = Math.max(0, Math.min(cameraX, mapWidthPx - canvas.width));
  cameraY = Math.max(0, Math.min(cameraY, mapHeightPx - canvas.height));

  ctx.save();
  ctx.translate(-cameraX, -cameraY);

  if (!isGameOver) {
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

    // Fireball collisions
    projectiles.forEach(projectile => {
      enemies.forEach(enemy => {
        const dx = (enemy.x + enemy.width / 2) - (projectile.x + 8);
        const dy = (enemy.y + enemy.height / 2) - (projectile.y + 8);
        const dist = Math.hypot(dx, dy);

        if (dist < 20) {
          enemy.hp -= projectile.damage || 10;
          projectile.markedForDeletion = true;
        }
      });
    });

    enemies = enemies.filter(enemy => enemy.hp > 0);

    // === Проверка смерти игрока
    if (player.hp <= 0 && !isGameOver) {
      isGameOver = true;
      showGameOverScreen();
    }
  }

  ctx.restore();

  drawPlayerHpBar(ctx);

  if (isGameOver) {
    drawGameOverScreen(ctx);
  }

  requestAnimationFrame(gameLoop);
}

// === Draw player's HP bar (UI)
function drawPlayerHpBar(ctx) {
  if (!player || isGameOver) return;

  const barX = 20;
  const barY = 20;
  const barWidth = 100;
  const barHeight = 10;
  const healthRatio = player.hp / player.maxHp;

  ctx.fillStyle = 'red';
  ctx.fillRect(barX, barY, barWidth, barHeight);

  ctx.fillStyle = 'lime';
  ctx.fillRect(barX, barY, barWidth * Math.max(healthRatio, 0), barHeight);

  ctx.strokeStyle = 'black';
  ctx.strokeRect(barX, barY, barWidth, barHeight);
}

// === Show "Game Over" screen and button
function showGameOverScreen() {
  const gameOverButton = document.createElement('button');
  gameOverButton.innerText = 'Back to Menu';
  gameOverButton.style.position = 'absolute';
  gameOverButton.style.top = '60%';
  gameOverButton.style.left = '50%';
  gameOverButton.style.transform = 'translate(-50%, -50%)';
  gameOverButton.style.fontSize = '24px';
  gameOverButton.style.padding = '10px 20px';
  gameOverButton.style.zIndex = '1000';
  gameOverButton.id = 'gameOverButton';

  document.body.appendChild(gameOverButton);

  gameOverButton.addEventListener('click', () => {
    document.getElementById('gameOverButton').remove();
    menu.style.display = 'flex';
    gameContainer.style.display = 'none';
    isGameOver = false;
    player = null;
    enemies = [];
    projectiles = [];
  });
}

// === Draw "Game Over" text
function drawGameOverScreen(ctx) {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'white';
  ctx.font = '48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
  ctx.restore();
}
