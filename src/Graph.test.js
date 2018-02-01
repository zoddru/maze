import test from 'ava';
import Vector from './Vector';
import Grid from './Grid';
import Graph from './Graph';

test('create', t => {
    const grid = new Grid({ columns: 3, rows: 3 }, { width: 30, height: 30 });
    grid.columns[1][1].block = true;
    const graph = new Graph(grid);

    t.not(graph.nodes, null);
});

test('find', t => {
    const grid = new Grid({ columns: 3, rows: 3 }, { width: 30, height: 30 });
    grid.columns[1][1].block = true;
    const graph = new Graph(grid);

    let pos = new Vector(25, 5);
    let found = graph.find(pos);

    t.truthy(found);
    t.is(found.tile, grid.columns[2][0]);

    pos = new Vector(5, 25);
    found = graph.find(pos);

    t.truthy(found);
    t.is(found.tile, grid.columns[0][2]);
    
    pos = new Vector(15, 15);
    found = graph.find(pos);

    t.falsy(found);
});

test('removeNode', t => {
    const grid = new Grid({ columns: 3, rows: 3 }, { width: 30, height: 30 });
    grid.columns[1][1].block = true;
    const graph = new Graph(grid);

    const node = graph.nodes[2][2];
    t.truthy(node);
    t.is(node.edges.length, 2);

    const nodeA = node.edges[0].node;
    t.truthy(nodeA);
    t.is(nodeA.edges.length, 2);

    const nodeB = node.edges[1].node;
    t.truthy(nodeB);
    t.is(nodeB.edges.length, 2);

    let fromA = nodeA.edgeTo(node);
    t.truthy(fromA);

    let fromB = nodeB.edgeTo(node);
    t.truthy(fromB);

    graph.removeNode(2, 2);

    fromA = nodeA.edgeTo(node);
    t.is(fromA, null);
    t.is(nodeA.edges.length, 1);

    fromB = nodeB.edgeTo(node);
    t.is(fromB, null);
    t.is(nodeB.edges.length, 1);
});

test('addNode', t => {
    const grid = new Grid({ columns: 3, rows: 3 }, { width: 30, height: 30 });
    grid.columns[1][1].block = true;
    const graph = new Graph(grid);

    let node = graph.nodes[1][1];
    t.falsy(node);

    const n = graph.nodes[0][1];
    const e = graph.nodes[1][2];
    const s = graph.nodes[2][1];
    const w = graph.nodes[1][0];

    t.is(n.edges.length, 2);
    t.is(e.edges.length, 2);
    t.is(s.edges.length, 2);
    t.is(w.edges.length, 2);

    const tile = grid.columns[1][1];
    graph.addNode(tile);

    node = graph.nodes[1][1];
    t.truthy(node);

    t.is(node.edges.length, 4);

    t.is(n.edges.length, 3);
    t.is(e.edges.length, 3);
    t.is(s.edges.length, 3);
    t.is(w.edges.length, 3);

    t.truthy(node.edgeTo(n));
    t.truthy(node.edgeTo(e));
    t.truthy(node.edgeTo(s));
    t.truthy(node.edgeTo(w));

    t.truthy(n.edgeTo(node));
    t.truthy(e.edgeTo(node));
    t.truthy(s.edgeTo(node));
    t.truthy(w.edgeTo(node));
});

test('findPath 1', t => {
    const grid = new Grid({ columns: 4, rows: 4 }, { width: 40, height: 40 });
    grid.columns[1][0].block = true;
    grid.columns[2][0].block = true;
    grid.columns[3][0].block = true;
    grid.columns[1][2].block = true;
    grid.columns[2][2].block = true;
    const graph = new Graph(grid);

    const start = graph.nodes[0][0];
    
    t.false(start.visited);

    const path = graph.findPath(start, start);

    t.truthy(path);
    t.is(path.length, 1);
    t.is(path[0], start);
});

test('findPath 7', t => {
    const grid = new Grid({ columns: 4, rows: 4 }, { width: 40, height: 40 });
    grid.columns[1][0].block = true;
    grid.columns[2][0].block = true;
    grid.columns[3][0].block = true;
    grid.columns[1][2].block = true;
    grid.columns[2][2].block = true;
    const graph = new Graph(grid);

    const start = graph.nodes[0][0];
    const target = graph.nodes[3][3];
    
    t.false(start.visited);
    t.false(target.visited);

    const path = graph.findPath(start, target);

    t.truthy(path);
    t.is(path.length, 7);
    t.is(path[0], start);
    t.is(path[6], target);

    t.true(start.visited);
    t.true(target.visited);

    graph.unvisit();

    t.false(start.visited);
    t.false(target.visited);
});

test('setMap', t => {
    const g = new Grid({ columns: 4, rows: 4 }, { width: 40, height: 40 });
    const map = [[1,1,1,1],
                 [0,0,0,1],
                 [0,0,0,1],
                 [1,1,1,1]];

    g.setMap(map);

    t.true(g.columns[0][0].block);
    t.true(g.columns[0][1].block);
    t.true(g.columns[0][2].block);
    t.true(g.columns[0][3].block);
    t.false(g.columns[1][0].block);
    t.false(g.columns[1][1].block);
    t.false(g.columns[1][2].block);
    t.true(g.columns[1][3].block);
});

test('simple findPath', t => {
    const grid = new Grid({ columns: 3, rows: 3 }, { width: 30, height: 30 });
    grid.columns[1][1].block = true;
    const graph = new Graph(grid);

    const start = graph.nodes[0][0];
    const target = graph.nodes[0][2];

    const path = graph.findPath(start, target);

    t.is(path.length, 3);
});