import FireballProjectile from './projectile.js';

// Object containing different spells
export const spells = {
  // Fireball spell
  fireball(player, ctx, projectiles) {
    // Determine the direction of the fireball based on the player's facing direction
    const dirX = player.facingLeft ? -1 : 1; // -1 for left, 1 for right
    const dirY = 0; // Fireball moves horizontally

    const fireballWidth = 16; // Width of the fireball sprite
    const fireballHeight = 16; // Height of the fireball sprite

    // Offset to position the fireball at the correct side of the player
    const offsetX = dirX === 1 ? player.width : -fireballWidth;

    // Create a new fireball projectile
    const fireball = new FireballProjectile(
      player.x + offsetX, // X position of the fireball
      player.y + player.height / 2 - fireballHeight / 2, // Y position of the fireball
      dirX, // Direction X
      dirY // Direction Y
    );

    // Add the fireball to the projectiles array
    projectiles.push(fireball);
  },

  // Heal spell
  heal(player) {
    // Increase the player's HP by 20, but do not exceed the maximum HP
    player.hp = Math.min(player.maxHp, player.hp + 20);
    console.log('Heal used! HP:', player.hp); // Log the player's new HP
  }
};