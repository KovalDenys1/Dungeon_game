export default class FireballProjectile {
    constructor(x, y, directionX, directionY, scale = 2) {
      this.x = x;
      this.y = y;
      this.dirX = directionX;
      this.dirY = directionY;
      this.speed = 3;
  
      this.scale = scale;
      this.frameWidth = 16;
      this.frameHeight = 16;
      this.frameIndex = 0;
      this.frameCount = 6;
      this.frameTimer = 0;
      this.frameInterval = 60;
  
      this.image = new Image();
      this.image.src = './assets/spells/fireball_strip.png';
  
      this.markedForDeletion = false;
    }
  
    update(deltaTime) {
      this.x += this.dirX * this.speed;
      this.y += this.dirY * this.speed;
  
      this.frameTimer += deltaTime;
      if (this.frameTimer > this.frameInterval) {
        this.frameIndex++;
        this.frameTimer = 0;
      }
  
      if (this.frameIndex >= this.frameCount) {
        this.markedForDeletion = true;
      }
    }
  
    draw(ctx) {
        const flip = this.dirX > 0; // ⬅️ ВНИМАНИЕ: теперь flip при движении ВПРАВО
      
        ctx.save();
      
        if (flip) {
          ctx.translate(this.x + this.frameWidth * this.scale, this.y);
          ctx.scale(-1, 1);
        } else {
          ctx.translate(this.x, this.y);
        }
      
        if (this.image && this.image.naturalWidth > 0) {
          ctx.drawImage(
            this.image,
            this.frameIndex * this.frameWidth, 0,
            this.frameWidth, this.frameHeight,
            0, 0,
            this.frameWidth * this.scale,
            this.frameHeight * this.scale
          );
        } else {
          ctx.fillStyle = 'orange';
          ctx.fillRect(0, 0, this.frameWidth * this.scale, this.frameHeight * this.scale);
        }
      
        ctx.restore();
      }
      
      
               
  }  