import Utility from './Utility';
import Node from './Node';
import Edge from './Edge';

function getFirstClosest(nodes) {        
    let closest = nodes[0], current;
    
    for (let i = 1; i < nodes.length; i += 1) {
        current = nodes[i];
        if (current.distance < closest.distance) {
            closest = current;
        }
    }
    
    return closest;
}

function getRandomClosest(nodes) {
    
    let closest = nodes[0], current, closestNodes = [closest];
    
    for (let i = 1; i < nodes.length; i += 1) {
        current = nodes[i];
        if (current.distance === closest.distance) {
            closestNodes.push(current);
        }
        else if (current.distance < closest.distance) {
            closest = current;
            closestNodes = [closest];
        }
    }
    
    return Utility.randomItem(closestNodes);
}

function getFirstNode(nodes) {
    let i, j;
    
    for (i = 0; i < nodes.length; i += 1) {
        for (j = 0; j < nodes[i].length; j += 1) {
            if (nodes[i][j])
                return nodes[i][j];
        }
    }
    
    return null;
}

export default class Graph {

    constructor (grid) {
        const nodes = Node.createNodes(grid);
        const root = getFirstNode(nodes);

        Object.defineProperties(this, {
            nodes: { value: nodes },
            root: { value: root, writable: true }
        });

        Object.seal(this);
    }

    
    find (pos) {
        const nodes = this.nodes;
        let i, j, node, tile;
        
        for (i = 0; i < nodes.length; i += 1) {
            if (!nodes[i])
                continue;
                
            for (j = 0; j < nodes[i].length; j += 1) {
                node = nodes[i][j];
                
                if (!node)
                    continue;
                                        
                if (node.tile && node.tile.contains(pos)) {
                    return node;
                }
            }
        }
        return null;
    }
    
    removeNode (i, j) {
        const node = this.nodes[i][j];
        
        if (!node)
            return;
        
        const edges = node.edges;
        let inverseIndex, edge;
        
        for (let k = 0; k < edges.length; k += 1) {
            edge = edges[k];
            
            inverseIndex = edge.node.edges.indexOf(edge.inverse);
            edge.node.edges.splice(inverseIndex, 1);
        }
        
        this.nodes[i][j] = null;
        
        if (this.root === node) {
            this.root = getFirstNode(this.nodes);
        }
        
        return node;
    }
    
    addNode (tile) {
        const i = tile.i;
        const j = tile.j;

        if (this.nodes[i][j])
            return;
        
        const nodes = this.nodes;
        const node = new Node(tile);
                    
        const l = nodes[i - 1] ? nodes[i - 1][j] : null;
        const r = nodes[i + 1] ? nodes[i + 1][j] : null;
        const u = nodes[i][j - 1];
        const d = nodes[i][j + 1];
        
        Edge.createTwoWay(node, l);
        Edge.createTwoWay(node, r);
        Edge.createTwoWay(node, u);
        Edge.createTwoWay(node, d);            
        
        this.nodes[i][j] = node;
        
        return node;
    }
    
    each (fn) {
        const nodes = [];
        let i, j, node;
        
        for (i = 0; i < this.nodes.length; i += 1) {
            if (!this.nodes[i])
                continue;
                
            for (j = 0; j < this.nodes[i].length; j += 1) {
                node = this.nodes[i][j];
                
                if (!node)
                    continue;
                                            
                fn.call(node, this);
                
                nodes.push(node);
            }
        }
        
        return nodes;
    }
    
    unvisit () {
        return this.each(Node.prototype.unvisit);
    }
    
    findPath (start, target) {           
        
        const removeItem = Utility.removeItem;
        const unvisited = this.unvisit();
        
        let current = start;
        current.distance = 0;   
        
        while (unvisited.length) {                
            if (current.distance === Number.POSITIVE_INFINITY) {
                current = null;
                break;
            }
            
            current.visit();
            
            if (current === target)
                break;
            
            removeItem(unvisited, current);
            
            current = getRandomClosest(unvisited);
        }
        
        if (!current) {
            return [start];
        }
        
        let path = current.traverseBackTo(start);
        path.reverse();
        return path;
    }

    randomNode () {
        const columns = this.nodes.filter(c => !!c && !!c.length);
        const column = Utility.randomItem(columns);
        const nodes = column.filter(n => !!n);
        return Utility.randomItem(nodes);
    }

    // draw functions
    
    draw (ctx) {
        if (!this.root)
            return;
        this.root.draw(ctx, []);
    }
}