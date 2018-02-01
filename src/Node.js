import Utility from './Utility';
import Edge from './Edge';

const radius = 10;

function addRightAndDownEdges(nodes) {    
    let i, j;
    for (i = 0; i < nodes.length; i += 1) {
        for (j = 0; j < nodes[i].length; j += 1) {                
            addRightAndDown(nodes, i, j);
        }
    }
}

function addRightAndDown(nodes, i, j) {
    const n = nodes[i][j];
    
    if (!n)
        return;
    
    const r = nodes[i + 1] ? nodes[i + 1][j] : null;
    const d = nodes[i][j + 1];
    
    Edge.createTwoWay(n, r);
    Edge.createTwoWay(n, d);
}

export default class Node {
    constructor (tile) {
        Object.defineProperties(this, {
            i: { value: tile.i },
            j: { value: tile.j },
            tile: { value: tile },
            edges: { value: [] },
            visited: { value: false, writable: true },
            distance: { value: Number.POSITIVE_INFINITY, writable: true },
            previous: { value: null, writable: true }
        });

        Object.seal(this);
    }

    static createNodes (grid) {
        const tiles = grid.columns;
        const nodes = [];
        let tile, node;
        let i, j;
        
        for (i = 0; i < tiles.length; i += 1) {
            nodes.push([]);            
            
            for (j = 0; j < tiles[i].length; j += 1) {
                tile = tiles[i][j];
                
                if (tile.block) {
                    nodes[i].push(null);
                    continue;
                }
                
                node = new Node(tile);
            
                nodes[i].push(node);
            }
        }
        
        addRightAndDownEdges(nodes);
        
        return nodes;
    }
    
    randomEdge (except) {
        return Utility.randomItem(this.edges, except);
    }

    edgeTo (node) {
        const edges = this.edges;
        for (let i = 0; i < edges.length; i += 1) {
            if (edges[i].node === node) {
                return edges[i]; // useful to find the edge, not just the node
            }
        }
        return null;
    }

    unvisit () {
        this.visited = false;
        this.distance = Number.POSITIVE_INFINITY;
        this.previous = null;
    }
    
    visit () {
        const edges = this.edges;
        let edge, node, dist;
        
        for (let i = 0; i < edges.length; i += 1) {
            edge = edges[i];
            node = edge.node;
            if (node.visited)
                continue;
            dist = this.distance + edge.distance;
            if (dist < node.distance) {
                node.distance = dist;
                node.previous = this;
            }
        }
        
        this.visited = true;
    }

    traverseBackTo (start) {
        const path = [this];
        let current = this;
        while (current.previous && current !== start) {
            current = current.previous;
            path.push(current);
        }
        return path;
    }

    coincidesWith (node) {
        return this.i === node.i && this.j === node.j;
    }

    get isIntersection () {
        return this.edges.length > 2;
    }

    // draw functions

    draw (ctx, drawn) {      
        if (drawn[this.i] && drawn[this.i][this.j])
            return;
            
        ctx.beginPath();
        ctx.arc(this.tile.center.x, this.tile.center.y, radius, 0, 2 * Math.PI, false);
        ctx.fill();
        
        drawn[this.i] = drawn[this.i] || [];
        drawn[this.i][this.j] = true;
       
        for (let i = 0; i < this.edges.length; i += 1) {
            this.edges[i].draw(ctx, this.tile.center, drawn);
        }
    }
}