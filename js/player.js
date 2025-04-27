export default class Player {
  constructor(x, y, scale = 2, mapRef = null) {
    this.x = x;
    this.y = y;
    this.scale = scale;
    this.tileSize = 16; // базовый размер тайла
    this.speed = 1; // скорость движения настроена под scale

    this.frameWidth = 16;
    this.frameHeight = 16;

    this.image = new Image();
    this.image.src = './assets/hero/hero_spritesheet.png';

    this.frameIndex = 0;
    this.frameCount = 4;
    this.frameTimer = 0;
    this.frameInterval = 150;

    this.keys = {};
    this.map = mapRef;

    this.width = 16 * scale;
    this.height = 16 * scale;

    this.facingLeft = false;

    this.hp = 100;
    this.maxHp = 100;

    window.addEventListener('keydown', (e) => this.keys[e.code] = true);
    window.addEventListener('keyup', (e) => this.keys[e.code] = false);
  }

  update(deltaTime) {
    this.frameTimer += deltaTime;
    if (this.frameTimer > this.frameInterval) {
      this.frameIndex = (this.frameIndex + 1) % this.frameCount;
      this.frameTimer = 0;
    }

    let dx = 0;
    let dy = 0;

    if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
      dx = -this.speed;
      this.facingLeft = true;
    }
    if (this.keys['KeyD'] || this.keys['ArrowRight']) {
      dx = this.speed;
      this.facingLeft = false;
    }
    if (this.keys['KeyW'] || this.keys['ArrowUp']) dy = -this.speed;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) dy = this.speed;

    const newX = this.x + dx;
    const newY = this.y + dy;

    if (!this.isColliding(newX, this.y)) this.x = newX;
    if (!this.isColliding(this.x, newY)) this.y = newY;
  }

  isColliding(x, y) {
    const tileSize = 16 * this.scale; // всегда фиксированная база 16 * scale
    const corners = [
      [x, y],
      [x + this.width - 1, y],
      [x, y + this.height - 1],
      [x + this.width - 1, y + this.height - 1]
    ];

    for (const [cx, cy] of corners) {
      const tileX = Math.floor(cx / tileSize);
      const tileY = Math.floor(cy / tileSize);
      if (this.map?.[tileY]?.[tileX] !== 0) return true;
    }

    return false;
  }

  draw(ctx) {
    const flip = this.facingLeft;

    ctx.save();

    if (flip) {
      ctx.translate(this.x + this.width, this.y);
      ctx.scale(-1, 1);
    } else {
      ctx.translate(this.x, this.y);
    }

    ctx.drawImage(
      this.image,
      this.frameIndex * this.frameWidth, 0,
      this.frameWidth, this.frameHeight,
      0, 0,
      this.width,
      this.height
    );

    ctx.restore();
  }
}