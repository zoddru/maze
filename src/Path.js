const radius = 6;

function drawNodes (ctx, nodes) {
        
    if (!nodes || !nodes.length)
        return;
    
    let pos = nodes[0].tile.center;
                
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI, false);
    ctx.fill();
    
    let prev = pos;
    
    for (let i = 1; i < nodes.length; i += 1) {
        pos = nodes[i].tile.center;
        
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

export default class Path {

    constructor (nodes) {
        this.nodes = nodes;
        Object.freeze(this);
    }

    add (node) {
        this.nodes.push(node);
    }
    
    addRange (nodes) {
        this.nodes.push.apply(this.nodes, nodes);
    }
    
    first () {
        return this.nodes.length ? this.nodes[0] : null;
    }
    
    last () {
        return this.nodes.length ? this.nodes[this.nodes.length - 1] : null;
    }
    
    clear () {
        this.nodes = [];
    }
    
    shift () {
        this.nodes.shift;
    }
    
    length () {
        return this.nodes.length;
    }
    
    isEmpty () {
        return !this.nodes.length;
    }
    
    draw (ctx) {
        drawNodes(ctx, this.nodes);
    }
}