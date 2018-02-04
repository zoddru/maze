import test from 'ava';
import Grid from './Grid';
import Tile from './Tile';
import Node from './Node';

test('create', t => {
    const tile = new Tile({
        index: 0, i: 0, j: 0, x: 100, y: 200, width: 200, height: 200
    });

    const node = new Node(tile);

    t.is(node.i, tile.i);
    t.is(node.j, tile.j);
    t.is(node.tile, tile);
    t.is(node.edges.length, 0);
});

test('create nodes', t => {
    const grid = new Grid({ columns: 10, rows: 10 }, { width: 100, height: 100 });
    const nodes = Node.createNodes(grid);

    t.is(nodes.length, 10);
    t.is(nodes[0].length, 10);

    t.is(nodes[0][0].edges.length, 2);
});

function create3x3Grid() {    
    const grid = new Grid({ columns: 3, rows: 3 }, { width: 30, height: 30 });
    grid.columns[1][1].block = true;
    return Node.createNodes(grid);
}

test('create with block', t => {
    const nodes = create3x3Grid();

    t.is(nodes.length, 3);
    t.is(nodes[0].length, 3);

    t.is(nodes[1][1], null);
});

test('edgeTo', t => {
    const nodes = create3x3Grid();

    t.is(nodes[0][0].edges.length, 2);
    t.is(nodes[0][1].edges.length, 2);

    let edgeTo = nodes[0][0].edgeTo(nodes[0][1]);
    t.not(edgeTo, null);
    t.is(edgeTo.node, nodes[0][1]);
    t.is(edgeTo.distance, 1);
    t.is(edgeTo.inverse.distance, 1);
    t.is(edgeTo.inverse.node, nodes[0][0]);

    edgeTo = nodes[0][1].edgeTo(nodes[2][1]);
    t.is(edgeTo, null);
});

test('visit', t => {
    const nodes = create3x3Grid();

    const first = nodes[0][0];
    t.is(first.edges.length, 2);
    const a = first.edges[0].node;
    const b = first.edges[1].node;

    t.false(first.visited);
    t.is(first.distance, Number.POSITIVE_INFINITY);
    t.is(a.distance, Number.POSITIVE_INFINITY);
    t.falsy(a.previous);
    t.is(b.distance, Number.POSITIVE_INFINITY);
    t.falsy(b.previous);

    first.distance = 0;
    first.visit();

    t.true(first.visited);
    t.is(first.distance, 0);
    t.is(a.distance, 1);
    t.is(a.previous, first);
    t.is(b.distance, 1);
    t.is(b.previous, first);
});

test('unvisit', t => {
    const nodes = create3x3Grid();

    const first = nodes[0][0];
    t.is(first.edges.length, 2);
    const a = first.edges[0].node;
    const b = first.edges[1].node;

    first.distance = 0;
    first.visit();

    t.true(first.visited);
    t.is(first.distance, 0);
    t.is(a.distance, 1);
    t.is(a.previous, first);
    t.is(b.distance, 1);
    t.is(b.previous, first);

    first.unvisit();

    t.false(first.visited);
    t.is(first.distance, Number.POSITIVE_INFINITY);
});

test('traverseBackTo', t => {
    const tile = new Tile(0, 0, 0, 0);
    const [a, b, c] = [new Node(tile), new Node(tile), new Node(tile)];

    c.previous = b;
    b.previous = a;

    const path = c.traverseBackTo(a);

    t.is(path.length, 3);
    t.is(path[0], c);
    t.is(path[1], b);
    t.is(path[2], a);
});

test('isIntersection', t => {
    const grid = new Grid({ columns: 3, rows: 3 }, { width: 30, height: 30 });
    grid.columns[1][0].block = true;
    const nodes = Node.createNodes(grid);

    t.false(nodes[0][0].isIntersection);
    t.true(nodes[0][1].isIntersection);
});

test('randomEdge except', t => {
    const grid = new Grid({ columns: 3, rows: 3 }, { width: 30, height: 30 });
    const nodes = Node.createNodes(grid);
    const node = nodes[1][1];
    const edges = node.edges;

    t.is(edges.length, 4);

    const except = [edges[0]];

    let edge;

    for (let i = 0; i < 100; i++) {
        edge = node.randomEdge(except);

        t.true(edge !== edges[0]);
        t.true(edge === edges[1] || edge === edges[2] || edge === edges[3]);
    }
});