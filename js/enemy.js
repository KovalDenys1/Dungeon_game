export default class Enemy {
  constructor(x, y, scale, type = 'skeleton') {
    this.x = x;
    this.y = y;
    this.scale = scale;

    this.width = 16 * scale;
    this.height = 16 * scale;

    this.image = new Image();
    this.image.src = `./assets/enemies/${type}_spritesheet.png`;

    this.frameIndex = 0;
    this.frameCount = 4;
    this.frameTimer = 0;
    this.frameInterval = 200;

    this.speed = type === 'vampire' ? 0.8 : 0.5;

    this.facingLeft = false;

    this.hp = type === 'vampire' ? 50 : 30;
    this.maxHp = this.hp;

    this.agroRadius = 40 * scale;
    this.isChasing = false;
    this.chaseCooldown = 0;
    this.chaseCooldownMax = 3000;

    this.patrolStartX = x;
    this.patrolDistance = 96 * scale;
    this.patrolDirection = Math.random() > 0.5 ? 1 : -1;
    this.targetX = this.patrolStartX + this.patrolDistance * this.patrolDirection;
  }

  update(deltaTime, player, map) {
    this.frameTimer += deltaTime;
    if (this.frameTimer > this.frameInterval) {
      this.frameIndex = (this.frameIndex + 1) % this.frameCount;
      this.frameTimer = 0;
    }

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist < this.agroRadius) {
      this.isChasing = true;
      this.chaseCooldown = 0;
    } else if (this.isChasing) {
      this.chaseCooldown += deltaTime;
      if (this.chaseCooldown > this.chaseCooldownMax) {
        this.isChasing = false;
      }
    }

    if (this.isChasing) {
      this.moveTowards(player.x, player.y, map);
    } else {
      this.patrolMove(map);
    }
  }

  moveTowards(targetX, targetY, map) {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist === 0) return;

    const moveX = (dx / dist) * this.speed;
    const moveY = (dy / dist) * this.speed;

    const nextX = this.x + moveX;
    const nextY = this.y + moveY;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDx > absDy) {
      if (!this.isColliding(nextX, this.y, map)) {
        this.x = nextX;
        this.facingLeft = moveX < 0;
      } else if (!this.isColliding(this.x, nextY, map)) {
        this.y = nextY;
      }
    } else {
      if (!this.isColliding(this.x, nextY, map)) {
        this.y = nextY;
      } else if (!this.isColliding(nextX, this.y, map)) {
        this.x = nextX;
        this.facingLeft = moveX < 0;
      }
    }
  }

  patrolMove(map) {
    const moveX = this.patrolDirection * this.speed;
    const nextX = this.x + moveX;

    if (!this.isColliding(nextX, this.y, map)) {
      this.x = nextX;
      this.facingLeft = moveX < 0;

      if ((this.patrolDirection === 1 && this.x >= this.targetX) ||
          (this.patrolDirection === -1 && this.x <= this.targetX)) {
        this.patrolDirection *= -1;
        this.targetX = this.patrolStartX + this.patrolDistance * this.patrolDirection;
      }
    } else {
      this.patrolDirection *= -1;
      this.targetX = this.patrolStartX + this.patrolDistance * this.patrolDirection;
    }
  }

  isColliding(x, y, map) {
    const tileSize = 16 * this.scale;
    const corners = [
      [x, y],
      [x + this.width - 1, y],
      [x, y + this.height - 1],
      [x + this.width - 1, y + this.height - 1]
    ];

    for (const [cx, cy] of corners) {
      const tileX = Math.floor(cx / tileSize);
      const tileY = Math.floor(cy / tileSize);
      if (map?.[tileY]?.[tileX] !== 0) return true;
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
  
    if (this.image && this.image.naturalWidth > 0) {
      ctx.drawImage(
        this.image,
        this.frameIndex * 16, 0,
        16, 16,
        0, 0,
        this.width,
        this.height
      );
    } else {
      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, this.width, this.height);
    }
  
    ctx.restore();
  
    // ➡️ HP bar above enemy
    const barWidth = this.width;
    const barHeight = 4;
    const healthRatio = this.hp / this.maxHp;
  
    ctx.fillStyle = 'red';
    ctx.fillRect(this.x, this.y - 10, barWidth, barHeight);
  
    ctx.fillStyle = 'lime';
    ctx.fillRect(this.x, this.y - 10, barWidth * healthRatio, barHeight);
  
    ctx.strokeStyle = 'black';
    ctx.strokeRect(this.x, this.y - 10, barWidth, barHeight);
  }  
}