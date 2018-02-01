import test from 'ava';
import Tile from './Tile';
import Node from './Node';
import Edge from './Edge';

test('createTwoWay', t => {
    const tile1 = new Tile({ index: 0, i: 0, j: 0, x: 0, y: 0, width: 10, height: 10 });
    const node1 = new Node(tile1);
    const tile2 = new Tile({ index: 1, i: 0, j: 1, x: 0, y: 10, width: 10, height: 10 });
    const node2 = new Node(tile2);
    
    t.is(node1.edges.length, 0);
    t.is(node2.edges.length, 0);
    
    Edge.createTwoWay(node1, node2);

    t.is(node1.edges.length, 1);
    t.is(node2.edges.length, 1);

    t.is(node1.edges[0].node, node2);
    t.is(node2.edges[0].node, node1);

    t.is(node1.edges[0].inverse, node2.edges[0]);
    t.is(node2.edges[0].inverse, node1.edges[0]);
});