class Edge {
    constructor (distance, node, inverse) {
        this.distance = distance;
        this.node = node;
        this.inverse = inverse;
    }

    draw (ctx, origin, drawn) {
        const node = this.node;
        
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(node.tile.center.x, node.tile.center.y);
        ctx.stroke();
        
        node.draw(ctx, drawn);
    }
}

export default class EdgeFactory {    
    static createTwoWay(nodeA, nodeB) {
        if (!nodeA || !nodeB)
            return;
    
        const toB = new Edge(1, nodeB);        
        const toA = new Edge(1, nodeA, toB, true);
        toB.inverse = toA;
    
        Object.freeze(toB);
        Object.freeze(toA);
    
        nodeA.edges.push(toB);
        nodeB.edges.push(toA);
    }
}