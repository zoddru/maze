const radius = 2;

function getTiles (tile, direction) {
    if (!tile)
        return [];
    
    const tiles = [tile];
    
    while (tile[direction] && !tile[direction].block) {
        tile = tile[direction];
        tiles.push(tile);
    }
    
    return tiles;
}

export default class AxisOfSight {
    constructor (root, direction) {
        Object.defineProperties(this, {
            tiles: { value: getTiles(root, direction) }
        });

        Object.freeze(this);
    }

    canSee (tile) {
        const tiles = this.tiles;
        for (let i = 0; i < tiles.length; i += 1) {
            if (tile === tiles[i])
                return true;
        }
        return false;            
    }

    draw (ctx) {

        const tiles = this.tiles;
        let pos = tiles[0].center;            
        let prev = pos;
                    
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI, false);
        ctx.fill();
        
        for (let i = 1; i < tiles.length; i += 1) {
            pos = tiles[i].center;
            
            ctx.beginPath();      
            ctx.moveTo(prev.x, prev.y);        
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI, false);
            ctx.fill();
            
            prev = pos;
        }
    }
}