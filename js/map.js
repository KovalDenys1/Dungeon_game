export default class GameMap {
  constructor(tileSize, scale) {
    this.tileSize = tileSize;
    this.scale = scale;

    this.mapWidth = 64;
    this.mapHeight = 36;

    // Map generation
    this.map = Array.from({ length: this.mapHeight }, (_, y) =>
      Array.from({ length: this.mapWidth }, (_, x) => {
        if (x === 0 || y === 0 || x === this.mapWidth - 1 || y === this.mapHeight - 1) {
          return 1; // walls
        }

        const rand = Math.random();
        if (rand < 0.05) return 2; // 5% 
        if (rand < 0.10) return 3; // 5% 
        if (rand < 0.12) return 4; // 2% 
        return 0; // earth
      })
    );

    this.image = new Image();
    this.image.src = './assets/map/tileset.png';
  }

  draw(ctx) {
    for (let y = 0; y < this.map.length; y++) {
      for (let x = 0; x < this.map[y].length; x++) {
        const tile = this.map[y][x];
        ctx.drawImage(
          this.image,
          tile * this.tileSize, 0,
          this.tileSize, this.tileSize,
          x * this.tileSize * this.scale,
          y * this.tileSize * this.scale,
          this.tileSize * this.scale,
          this.tileSize * this.scale
        );
      }
    }
  }
}