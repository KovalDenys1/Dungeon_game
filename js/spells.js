import FireballProjectile from './projectile.js';

export const spells = {
  fireball(player, ctx, projectiles) {
    const dirX = player.facingLeft ? -1 : 1;
    const dirY = 0;
  
    const fireballWidth = 16;
    const fireballHeight = 16;
  
    const offsetX = dirX === 1 ? player.width : -fireballWidth;
  
    const fireball = new FireballProjectile(
      player.x + offsetX,
      player.y + player.height / 2 - fireballHeight / 2,
      dirX,
      dirY
    );
  
    projectiles.push(fireball);
  }
,

  heal(player) {
    player.hp = Math.min(player.maxHp, player.hp + 20);
    console.log('Heal used! HP:', player.hp);
  }
};