export default class Enemy {
  constructor(x, y, scale, type = 'skeleton') {
    // Initialize enemy position and scale
    this.x = x;
    this.y = y;
    this.scale = scale;

    // Enemy dimensions
    this.width = 16 * scale;
    this.height = 16 * scale;

    // Load the enemy sprite sheet
    this.image = new Image();
    this.image.src = `./assets/enemies/${type}_spritesheet.png`;

    // Animation properties
    this.frameIndex = 0; // Current animation frame index
    this.frameCount = 4; // Total number of animation frames
    this.frameTimer = 0; // Timer to control frame updates
    this.frameInterval = 200; // Interval between frame updates (in ms)

    // Movement and direction
    this.facingLeft = Math.random() > 0.5; // Random initial direction
    this.speed = type === 'vampire' ? 0.8 : 0.5; // Speed depends on enemy type

    // Health properties
    this.hp = type === 'vampire' ? 50 : 30; // Health depends on enemy type
    this.maxHp = this.hp; // Maximum health

    // Aggro and chasing behavior
    this.agroRadius = 40 * scale; // Radius within which the enemy detects the player
    this.isChasing = false; // Whether the enemy is chasing the player
    this.chaseCooldown = 0; // Time since the enemy stopped chasing
    this.chaseCooldownMax = 3000; // Maximum cooldown time before stopping chase

    // Attack properties
    this.attackCooldown = 0; // Time left until the next attack
    this.attackRate = 1000; // Enemy attacks once per second
    this.damage = 10; // Damage dealt to the player per attack
  }

  // Update enemy state
  update(deltaTime, player, map) {
    // Update animation frame timer
    this.frameTimer += deltaTime;
    if (this.frameTimer > this.frameInterval) {
      this.frameIndex = (this.frameIndex + 1) % this.frameCount; // Cycle through animation frames
      this.frameTimer = 0; // Reset the frame timer
    }

    // Decrease attack cooldown
    this.attackCooldown -= deltaTime;

    // Calculate distance to the player
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy);

    // Check if the player is within the aggro radius
    if (dist < this.agroRadius) {
      this.isChasing = true; // Start chasing the player
      this.chaseCooldown = 0; // Reset chase cooldown
    } else if (this.isChasing) {
      // If chasing, increase chase cooldown
      this.chaseCooldown += deltaTime;
      if (this.chaseCooldown > this.chaseCooldownMax) {
        this.isChasing = false; // Stop chasing after cooldown
      }
    }

    if (this.isChasing) {
      // Move towards the player
      this.moveTowards(player.x, player.y, map);

      // Attack the player if close enough and cooldown is over
      if (dist < 20 && this.attackCooldown <= 0) {
        player.hp -= this.damage; // Reduce player's health
        this.attackCooldown = this.attackRate; // Reset attack cooldown
      }
    } else {
      // Patrol movement when not chasing
      this.patrolMove(map);
    }
  }

  // Move towards a target position
  moveTowards(targetX, targetY, map) {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist === 0) return; // Avoid division by zero

    // Calculate movement deltas
    const moveX = (dx / dist) * this.speed;
    const moveY = (dy / dist) * this.speed;

    const nextX = this.x + moveX;
    const nextY = this.y + moveY;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Prioritize movement along the axis with the greater distance
    if (absDx > absDy) {
      if (!this.isColliding(nextX, this.y, map)) {
        this.x = nextX; // Move along X-axis
        this.facingLeft = moveX < 0; // Update facing direction
      } else if (!this.isColliding(this.x, nextY, map)) {
        this.y = nextY; // Move along Y-axis
      }
    } else {
      if (!this.isColliding(this.x, nextY, map)) {
        this.y = nextY; // Move along Y-axis
      } else if (!this.isColliding(nextX, this.y, map)) {
        this.x = nextX; // Move along X-axis
        this.facingLeft = moveX < 0; // Update facing direction
      }
    }
  }

  // Patrol movement when not chasing the player
  patrolMove(map) {
    const moveX = this.speed * (this.facingLeft ? -1 : 1); // Move left or right
    const nextX = this.x + moveX;

    if (!this.isColliding(nextX, this.y, map)) {
      this.x = nextX; // Move if no collision
    } else {
      this.facingLeft = !this.facingLeft; // Change direction on collision
    }
  }

  // Check for collisions with the map
  isColliding(x, y, map) {
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
      if (map?.[tileY]?.[tileX] !== 0) return true;
    }
    return false;
  }  

  // Draw the enemy on the canvas
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

    // Draw the enemy sprite
    ctx.drawImage(
      this.image,
      this.frameIndex * 16, 0, // Source position in the sprite sheet
      16, 16, // Source dimensions
      0, 0, // Destination position on the canvas
      this.width, this.height // Destination dimensions
    );

    ctx.restore(); // Restore the canvas state

    // Draw the health bar above the enemy
    const barWidth = this.width;
    const barHeight = 4;
    const healthRatio = this.hp / this.maxHp;

    ctx.fillStyle = 'red'; // Background of the health bar
    ctx.fillRect(this.x, this.y - 10, barWidth, barHeight);

    ctx.fillStyle = 'lime'; // Foreground of the health bar
    ctx.fillRect(this.x, this.y - 10, barWidth * healthRatio, barHeight);

    ctx.strokeStyle = 'black'; // Border of the health bar
    ctx.strokeRect(this.x, this.y - 10, barWidth, barHeight);
  }
}
