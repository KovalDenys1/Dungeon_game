export default class Player {
  constructor(x, y, scale = 2, mapRef = null) {
    // Initialize player position
    this.x = x;
    this.y = y;

    // Scaling and movement properties
    this.scale = scale;
    this.tileSize = 16; // Base tile size
    this.speed = 1.5; // Movement speed adjusted for scale

    // Animation frame properties
    this.frameWidth = 16; // Width of a single animation frame
    this.frameHeight = 16; // Height of a single animation frame

    // Load the player sprite sheet
    this.image = new Image();
    this.image.src = './assets/hero/hero_spritesheet.png';

    // Animation state
    this.frameIndex = 0; // Current animation frame index
    this.frameCount = 4; // Total number of animation frames
    this.frameTimer = 0; // Timer to control frame updates
    this.frameInterval = 150; // Interval between frame updates (in ms)

    // Input keys and map reference
    this.keys = {}; // Object to track pressed keys
    this.map = mapRef; // Reference to the game map

    // Player dimensions
    this.width = 16 * scale; // Player width based on scale
    this.height = 16 * scale; // Player height based on scale

    // Player state
    this.facingLeft = false; // Direction the player is facing
    this.hp = 100; // Current health points
    this.maxHp = 100; // Maximum health points

    // Add event listeners for keyboard input
    window.addEventListener('keydown', (e) => this.keys[e.code] = true);
    window.addEventListener('keyup', (e) => this.keys[e.code] = false);
  }

  // Update player state
  update(deltaTime) {
    // Обновляем анимацию
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
  
    // Сначала пытаемся двигаться по оси X
    if (!this.isColliding(this.x + dx, this.y)) {
      this.x += dx;
    }
  
    // Потом по оси Y
    if (!this.isColliding(this.x, this.y + dy)) {
      this.y += dy;
    }
  }  

  // Check for collisions with the map
  isColliding(x, y) {
    const tileSize = 16 * this.scale;
    const checkPoints = [
      [x + 1, y + 1],
      [x + this.width - 2, y + 1],
      [x + 1, y + this.height - 2],
      [x + this.width - 2, y + this.height - 2],
      [x + this.width / 2, y + 1],
      [x + this.width / 2, y + this.height - 2],
      [x + 1, y + this.height / 2],
      [x + this.width - 2, y + this.height / 2],
    ];
  
    for (const [cx, cy] of checkPoints) {
      const tileX = Math.floor(cx / tileSize);
      const tileY = Math.floor(cy / tileSize);
      if (this.map?.[tileY]?.[tileX] !== 0) return true;
    }
    return false;
  }  

  // Draw the player on the canvas
  draw(ctx) {
    const flip = this.facingLeft; // Determine if the sprite should be flipped

    ctx.save(); // Save the current canvas state

    if (flip) {
      // Flip the sprite horizontally
      ctx.translate(this.x + this.width, this.y);
      ctx.scale(-1, 1);
    } else {
      // Draw the sprite normally
      ctx.translate(this.x, this.y);
    }

    // Draw the player sprite
    ctx.drawImage(
      this.image,
      this.frameIndex * this.frameWidth, 0, // Source position in the sprite sheet
      this.frameWidth, this.frameHeight, // Source dimensions
      0, 0, // Destination position on the canvas
      this.width, this.height // Destination dimensions
    );

    ctx.restore(); // Restore the canvas state
  }
}