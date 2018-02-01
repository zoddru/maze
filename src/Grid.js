import Color from './Color';
import Tile from './Tile';

const blockColour = new Color(104, 180, 108, 1);
const selectedColour =new Color(80, 120, 229, 1);
const selectedBlockColour = blockColour.merge(selectedColour);
const defRadius = 20;

export default class Grid {
    constructor (dimensions, bounds) {
        const tileWidth = Math.floor(bounds.width / dimensions.columns);
        const tileHeight = Math.floor(bounds.height / dimensions.rows);

        const columns = [];
        const tiles = [];

        let x = 0;
        let index = 0;

        for (let i = 0; i < dimensions.columns; i += 1) {
            const column = [];            
            columns.push(column);
            
            let y = 0;

            for (let j = 0; j < dimensions.rows; j += 1) {
                const left = columns[i-1] ? columns[i-1][j] : null;
                const up = columns[i][j-1];

                const tile = new Tile({
                    index, i, j, x, y, width: tileWidth, height: tileHeight,
                    left, up,
                    blockColour, selectedColour, selectedBlockColour
                });

                column.push(tile);                
                tiles.push(tile);

                y += tileHeight;
                index += 1;
            }

            x += tileWidth;
        }

        Object.defineProperties(this, {
            tiles: { value: tiles },
            columns: { value: columns },
            tileWidth: { value: tileWidth }, 
            tileHeight: { value: tileHeight }
        });
    }

    
    setMap (map) {
        // map.forEach((a, i) => {
        //     a.forEach((b, j) => {
        //         if (b === 1) {
        //             this.columns[i][j].block = true;
        //         }
        //     });
        // });
        for (let i = 0; i < map.length; i += 1) {
            for (let j = 0; j < map[0].length; j += 1) {
                if (map[i][j] === 1) {
                    this.columns[i][j].block = true;
                }
            }
        }
    }

    find (pos) {
        for (let i = 0; i < this.columns.length; i += 1) {
            for (let j = 0; j < this.columns[i].length; j += 1) {
                const tile = this.columns[i][j];
                if (tile.contains(pos)) {
                    return tile;
                }
            }
        }
        return null;
    }

    getRandomTile () {
        const tiles = this.freeTiles;
        if (!tiles.length)
            return null;                
        return tiles[Math.floor(Math.random() * tiles.length)];
    }

    deselectAll () {
        for (let i = 0; i < this.columns.length; i += 1) {
            for (let j = 0; j < this.columns[i].length; j += 1) {
                this.columns[i][j].selected = false;
            }
        }
        return null;
    }

    setOpacityFromDistance (pos) {        
        if (isNaN(pos.x) || isNaN(pos.y)) {
            this.setDefaultColours();
            return;
        }
        
        for (let i = 0; i < this.columns.length; i += 1) {
            for (let j = 0; j < this.columns[i].length; j += 1) {
                const tile = this.columns[i][j];
                
                const l = Math.max(createVector(tile.center).subtract(p).length, defRadius);
                const a = Math.pow(defRadius, 0.8) / Math.pow(l, 0.8);
                tile.blockColour = blockColour.newAlpha(a);
            }
        }
    }

    setDefaultColours () {
        for (let i = 0; i < this.columns.length; i += 1) {
            for (let j = 0; j < this.columns[i].length; j += 1) {
                this.columns[i][j].blockColour = blockColour;
            }
        }
    }

    get freeTiles () {
        const tiles = [];
        for (let i = 0; i < this.columns.length; i += 1) {
            for (let j = 0; j < this.columns[i].length; j += 1) {
                const tile = this.columns[i][j];
                if (!tile.block) {
                    tiles.push(tile);
                }
            }
        }
        return tiles;
    }

    // draw functions
        
    draw (ctx) {
        let i, j;
        for (i = 0; i < this.columns.length; i += 1) {
            for (j = 0; j < this.columns[i].length; j += 1) {
                this.columns[i][j].draw(ctx);
            }
        }
    }
}
