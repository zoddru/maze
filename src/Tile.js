import Vector from './Vector';
import Color from './Color';

export default class Tile {
    constructor({
        index, i, j, x, y, width, height,
        left = null, up = null, 
        blockColor = Color.grass,
        selectedColor = Color.water,
        selectedBlockColor = Color.electric
    }) {

        Object.defineProperties(this, {
            index: { value: index },
            i: { value: i },
            j: { value: j },
            x: { value: x },
            y: { value: y },
            width: { value: width },
            height: { value: height },

            center: { value: new Vector(x + width / 2, y + height / 2) },
            directions: { value: [] },
            neighbours: { value: [] }
        });

        this.block = false;
        this.selected = false;

        this.blockColor = blockColor;
        this.selectedColor = selectedColor;
        this.selectedBlockColor = selectedBlockColor;

        if (left) {
            Object.defineProperty(this, 'left', { value: left });
            Object.defineProperty(left, 'right', { value: this });
            this.directions.push('left');
            left.directions.push('right');
            this.neighbours.push(left);
            left.neighbours.push(this);
        }

        if (up) {
            Object.defineProperty(this, 'up', { value: up });
            Object.defineProperty(up, 'down', { value: this });
            this.directions.push('up');
            up.directions.push('down');
            this.neighbours.push(up);
            up.neighbours.push(this);
        }
    }

    contains (pos) {
        if (!pos || isNaN(pos.x) || isNaN(pos.y))
            return false;
        if (pos.x < this.x)
            return false;
        if (pos.x >= (this.x + this.width))
            return false;
        if (pos.y < this.y)
            return false;
        if (pos.y >= (this.y + this.height))
            return false;
        return true;
    }

    isBelow (pos) {
        return this.center.y < pos.y;
    }
    
    isAbove (pos) {
        return !this.isBelow(pos);
    }
    
    isLeft (pos) {
        return this.center.x > pos.x;
    }
    
    isRight (pos) {
        return !this.isLeft(pos);
    }
    
    randomDirection () {
        let directions = this.directions;
        if (!directions.length)
            return null;            
        return directions[Math.floor(Math.random() * directions.length)];            
    }
    
    get isIntersection() {
        let count = 0;
        for (let i = 0; i < this.neighbours.length; i += 1) { 
            if (!this.neighbours[i].block) {
                count += 1;
            }
            
            if (count > 2) {
                return true;
            }
        }
        return false;
    }

    // draw functions

    draw (ctx) {
        if (this.block && this.selected) {
            this.drawRect(ctx, this.selectedBlockColor);
        }
        else if (this.block) {
            this.drawRect(ctx, this.blockColor);
        }
        else if (this.selected) {
            this.drawRect(ctx, this.selectedColor);
        }
        else {
            this.drawBorder(ctx, this.blockColor);
        }
    }

    drawBorder (ctx, colour) {
        if (colour.a === 0)
            return;
        ctx.strokeStyle = colour;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.stroke();
    }
    
    drawRect (ctx, colour) {
        if (colour.a === 0)
            return;
        ctx.fillStyle = colour;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
