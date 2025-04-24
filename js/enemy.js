export default class Enemy {
    constructor(x, y, scale, type = 'skeleton') {
      this.x = x;
      this.y = y;
      this.startX = x;
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
      this.tileSize = 16 * scale;
  
      this.patrolRange = 64 * scale;
      this.patrolDirection = 1;
  
      this.agroRadius = 40 * scale;
      this.agro = false;
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
  
      this.agro = dist < this.agroRadius;
  
      if (this.agro) {
        const moveX = (dx / dist) * this.speed;
        const moveY = (dy / dist) * this.speed;
  
        const newX = this.x + moveX;
        const newY = this.y + moveY;
  
        if (!this.isColliding(newX, this.y, map)) this.x = newX;
        if (!this.isColliding(this.x, newY, map)) this.y = newY;
      } else {
        const nextX = this.x + this.patrolDirection * this.speed;
        const minX = this.startX - this.patrolRange;
        const maxX = this.startX + this.patrolRange;
  
        if (!this.isColliding(nextX, this.y, map)) {
          this.x = nextX;
          if (this.x < minX || this.x > maxX) {
            this.patrolDirection *= -1;
          }
        } else {
          this.patrolDirection *= -1;
        }
      }
    }
  
    isColliding(x, y, map) {
      const ts = this.tileSize;
      const corners = [
        [x, y],
        [x + this.width - 1, y],
        [x, y + this.height - 1],
        [x + this.width - 1, y + this.height - 1]
      ];
  
      for (const [cx, cy] of corners) {
        const tileX = Math.floor(cx / ts);
        const tileY = Math.floor(cy / ts);
        if (map?.[tileY]?.[tileX] !== 0) return true;
      }
  
      return false;
    }
  
    draw(ctx) {
      ctx.drawImage(
        this.image,
        this.frameIndex * 16, 0,
        16, 16,
        this.x, this.y,
        this.width, this.height
      );
    }
  }  