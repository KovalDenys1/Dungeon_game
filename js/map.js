export default class GameMap {
    constructor(tileSize, scale) {
      this.tileSize = tileSize;
      this.scale = scale;
  
      // Map 16x9 (0 = floor, 1 = wall)
      this.map = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,1,0,1,0,1,0,1,0,1,0,1,0,0,1],
        [1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
        [1,0,0,0,0,0,0,1,1,0,0,0,0,1,0,1],
        [1,0,1,1,1,0,0,0,0,0,1,1,0,0,0,1],
        [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      ];
      
  
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
  