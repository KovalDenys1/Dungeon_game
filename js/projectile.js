export default class FireballProjectile {
    constructor(x, y, directionX, directionY, scale = 2) {
        // Initialize position
        this.x = x;
        this.y = y;

        // Direction of movement
        this.dirX = directionX;
        this.dirY = directionY;

        // Speed of the projectile
        this.speed = 3;

        // Scaling and animation properties
        this.scale = scale;
        this.frameWidth = 16; // Width of a single animation frame
        this.frameHeight = 16; // Height of a single animation frame
        this.frameIndex = 0; // Current animation frame index
        this.frameCount = 6; // Total number of animation frames
        this.frameTimer = 0; // Timer to control frame updates
        this.frameInterval = 60; // Interval between frame updates (in ms)

        // Load the fireball sprite image
        this.image = new Image();
        this.image.src = './assets/spells/fireball_strip.png';

        // Flag to mark the projectile for deletion
        this.markedForDeletion = false;
    }

    // Update the projectile's position and animation
    update(deltaTime) {
        // Move the projectile based on its direction and speed
        this.x += this.dirX * this.speed;
        this.y += this.dirY * this.speed;

        // Update the animation frame timer
        this.frameTimer += deltaTime;
        if (this.frameTimer > this.frameInterval) {
            this.frameIndex++; // Move to the next animation frame
            this.frameTimer = 0; // Reset the frame timer
        }

        // Mark the projectile for deletion if the animation is complete
        if (this.frameIndex >= this.frameCount) {
            this.markedForDeletion = true;
        }
    }

    // Draw the projectile on the canvas
    draw(ctx) {
        // Determine if the sprite should be flipped horizontally
        const flip = this.dirX > 0; // Flip when moving to the right

        ctx.save(); // Save the current canvas state

        if (flip) {
            // Flip the sprite horizontally
            ctx.translate(this.x + this.frameWidth * this.scale, this.y);
            ctx.scale(-1, 1);
        } else {
            // Draw the sprite normally
            ctx.translate(this.x, this.y);
        }

        // Draw the fireball sprite if the image is loaded
        if (this.image && this.image.naturalWidth > 0) {
            ctx.drawImage(
                this.image,
                this.frameIndex * this.frameWidth, 0, // Source position in the sprite sheet
                this.frameWidth, this.frameHeight, // Source dimensions
                0, 0, // Destination position on the canvas
                this.frameWidth * this.scale, this.frameHeight * this.scale // Destination dimensions
            );
        } else {
            // Fallback: Draw a placeholder rectangle if the image is not loaded
            ctx.fillStyle = 'orange';
            ctx.fillRect(0, 0, this.frameWidth * this.scale, this.frameHeight * this.scale);
        }

        ctx.restore(); // Restore the canvas state
    }
}