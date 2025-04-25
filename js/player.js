export default class Player {
  constructor(x, y, scale = 2, mapRef = null) {
    // Initialize player position, scale, and reference to the map
    this.x = x;
    this.y = y;
    this.scale = scale;
    this.tileSize = 16; // Base tile size
    this.speed = 1; // Movement speed

    // Sprite frame dimensions
    this.frameWidth = 16;
    this.frameHeight = 16;

    // Load player sprite image
    this.image = new Image();
    this.image.src = './assets/hero/hero_spritesheet.png';

    // Animation frame control
    this.frameIndex = 0; // Current frame index
    this.frameCount = 4; // Total number of frames in the sprite sheet
    this.frameTimer = 0; // Timer to control frame updates
    this.frameInterval = 150; // Time interval between frames (ms)

    // Input keys and map reference
    this.keys = {};
    this.map = mapRef;

    // Player dimensions based on scale
    this.width = 16 * scale;
    this.height = 16 * scale;

    // Direction the player is facing
    this.facingLeft = false;

    // Event listeners for keyboard input
    window.addEventListener('keydown', (e) => this.keys[e.code] = true);
    window.addEventListener('keyup', (e) => this.keys[e.code] = false);
  }

  update(deltaTime) {
    // Update animation frame based on elapsed time
    this.frameTimer += deltaTime;
    if (this.frameTimer > this.frameInterval) {
      this.frameIndex = (this.frameIndex + 1) % this.frameCount; // Loop through frames
      this.frameTimer = 0;
    }

    // Movement deltas
    let dx = 0;
    let dy = 0;

    // Handle horizontal movement
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
      dx = -this.speed;
      this.facingLeft = true; // Face left
    }
    if (this.keys['ArrowRight'] || this.keys['KeyD']) {
      dx = this.speed;
      this.facingLeft = false; // Face right
    }

    // Handle vertical movement
    if (this.keys['ArrowUp'] || this.keys['KeyW']) dy = -this.speed;
    if (this.keys['ArrowDown'] || this.keys['KeyS']) dy = this.speed;

    // Calculate new position
    const newX = this.x + dx;
    const newY = this.y + dy;

    // Check for collisions before updating position
    if (!this.isColliding(newX, this.y)) this.x = newX;
    if (!this.isColliding(this.x, newY)) this.y = newY;
  }

  isColliding(x, y) {
    // Check if the player's position collides with any non-walkable tiles
    const tileSize = this.tileSize * this.scale;

    // Define the four corners of the player's bounding box
    const corners = [
      [x, y], // Top-left corner
      [x + this.width - 1, y], // Top-right corner
      [x, y + this.height - 1], // Bottom-left corner
      [x + this.width - 1, y + this.height - 1] // Bottom-right corner
    ];

    // Check each corner for collision with the map
    for (const [cx, cy] of corners) {
      const tileX = Math.floor(cx / tileSize); // Tile X-coordinate
      const tileY = Math.floor(cy / tileSize); // Tile Y-coordinate
      if (this.map?.[tileY]?.[tileX] !== 0) return true; // Non-walkable tile
    }

    return false; // No collision
  }

  draw(ctx) {
    // Draw the player sprite on the canvas
    const flip = this.facingLeft; // Determine if the sprite should be flipped

    ctx.save(); // Save the current canvas state

    if (flip) {
      // Flip the sprite horizontally
      ctx.translate(this.x + this.frameWidth * this.scale, this.y);
      ctx.scale(-1, 1);
    } else {
      // Draw normally
      ctx.translate(this.x, this.y);
    }

    if (this.image && this.image.naturalWidth > 0) {
      // Draw the sprite from the sprite sheet
      ctx.drawImage(
        this.image,
        this.frameIndex * this.frameWidth, 0, // Source position in the sprite sheet
        this.frameWidth, this.frameHeight, // Source dimensions
        0, 0, // Destination position
        this.frameWidth * this.scale, this.frameHeight * this.scale // Destination dimensions
      );
    } else {
      // Fallback: Draw a placeholder rectangle if the image is not loaded
      ctx.fillStyle = 'cyan';
      ctx.fillRect(0, 0, this.frameWidth * this.scale, this.frameHeight * this.scale);
    }

    ctx.restore(); // Restore the canvas state
  }
}