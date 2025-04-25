export default class Player {
  constructor(x, y, scale = 2, mapRef = null) {
    this.x = x;
    this.y = y;
    this.scale = scale;
    this.tileSize = 16;
    this.speed = 1;

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

    window.addEventListener('keydown', (e) => this.keys[e.key] = true);
    window.addEventListener('keyup', (e) => this.keys[e.key] = false);
  }

  update(deltaTime) {
    this.frameTimer += deltaTime;
    if (this.frameTimer > this.frameInterval) {
      this.frameIndex = (this.frameIndex + 1) % this.frameCount;
      this.frameTimer = 0;
    }

    let dx = 0;
    let dy = 0;

    if (this.keys['ArrowLeft'] || this.keys['a']) {
      dx = -this.speed;
      this.facingLeft = true;
    }
    if (this.keys['ArrowRight'] || this.keys['d']) {
      dx = this.speed;
      this.facingLeft = false;
    }
    if (this.keys['ArrowUp'] || this.keys['w']) dy = -this.speed;
    if (this.keys['ArrowDown'] || this.keys['s']) dy = this.speed;

    const newX = this.x + dx;
    const newY = this.y + dy;

    if (!this.isColliding(newX, this.y)) this.x = newX;
    if (!this.isColliding(this.x, newY)) this.y = newY;
  }

  isColliding(x, y) {
    const tileSize = this.tileSize * this.scale;

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
    ctx.drawImage(
      this.image,
      this.frameIndex * this.frameWidth, 0,
      this.frameWidth, this.frameHeight,
      this.x, this.y,
      this.frameWidth * this.scale,
      this.frameHeight * this.scale
    );
  }
}