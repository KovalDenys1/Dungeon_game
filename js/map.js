export default class GameMap {
  constructor(tileSize, scale) {
    // Initialize tile size and scale for the map
    this.tileSize = tileSize;
    this.scale = scale;

    // Define the map dimensions (width and height in tiles)
    this.mapWidth = 64;
    this.mapHeight = 36;

    // Generate the map as a 2D array
    this.map = Array.from({ length: this.mapHeight }, (_, y) =>
      Array.from({ length: this.mapWidth }, (_, x) => {
        // Create walls around the edges of the map
        if (x === 0 || y === 0 || x === this.mapWidth - 1 || y === this.mapHeight - 1) {
          return 1; // Wall tile
        }

        // Randomly generate other types of tiles
        const rand = Math.random();
        if (rand < 0.05) return 2; // 5% chance for tile type 2
        if (rand < 0.10) return 3; // 5% chance for tile type 3
        if (rand < 0.12) return 4; // 2% chance for tile type 4
        return 0; // Default tile (earth)
      })
    );

    // Load the tileset image
    this.image = new Image();
    this.image.src = 'Assets/map/tileset.png';
  }

  draw(ctx) {
    // Draw the map on the canvas
    for (let y = 0; y < this.map.length; y++) {
      for (let x = 0; x < this.map[y].length; x++) {
        const tile = this.map[y][x]; // Get the tile type at the current position
        ctx.drawImage(
          this.image, // Source image (tileset)
          tile * this.tileSize, 0, // Source position in the tileset
          this.tileSize, this.tileSize, // Source dimensions
          x * this.tileSize * this.scale, // Destination X position
          y * this.tileSize * this.scale, // Destination Y position
          this.tileSize * this.scale, // Destination width
          this.tileSize * this.scale // Destination height
        );
      }
    }
  }
}