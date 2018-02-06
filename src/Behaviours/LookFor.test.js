import test from 'ava';
import Grid from '../Grid';
import Graph from '../Graph';
import Robot from '../Robot';
import { Behaviour } from '../Behaviours/Behaviour';
import LookFor from './LookFor';

function buildGraphWithHunterAndHunted(t) {
    const grid = new Grid({ columns: 5, rows: 3 }, { width: 50, height: 30 });
    grid.columns[0][1].block = true;
    grid.columns[1][1].block = true;
    grid.columns[2][1].block = true;
    grid.columns[3][1].block = true;
    const graph = new Graph(grid);
    const nodes = graph.nodes;

    t.is(nodes.length, 5);
    t.is(nodes[0].length, 3);

    t.is(nodes[0][0].edges.length, 1);
    t.false(nodes[0][0].isIntersection);

    const hunted = new Robot(graph, 10, 10, nodes[4][1], { walkSpeed: 3, runSpeed: 6 });
   
    const hunter = new Robot(graph, 10, 10, nodes[0][0], { walkSpeed: 3, runSpeed: 6 });
    hunter.lookFor(hunted);

    return { grid, graph, nodes, hunted, hunter };
}

test('canSee is false', t => {
	const { graph, nodes, hunted, hunter } = buildGraphWithHunterAndHunted(t);

    hunter.update({ diff: 1 });

    t.is(hunter.closestNode, nodes[0][0]);
    t.is(hunter._behaviour.currentBehaviourName, 'strollAround');
    t.false(hunter.canSee(hunted));
});

test('canSee is true', t => {
    const { graph, nodes, hunted, hunter } = buildGraphWithHunterAndHunted(t);

    hunted.runTo(nodes[4][0]);
    hunted.update({ diff: 100 });

    t.is(hunted.closestNode, nodes[4][0]);

    hunter.update({ diff: 1 });
    t.is(hunter._behaviour.currentBehaviourName, 'justSpotted');
    t.true(hunter.canSee(hunted));
});

test('chases visible target', t => {    
    const { graph, nodes, hunted, hunter } = buildGraphWithHunterAndHunted(t);

    hunted.runTo(nodes[4][0]);
    hunted.update({ diff: 100 });

    t.is(hunted.closestNode, nodes[4][0]);

    hunter.update({ diff: 1 });
    t.is(hunter._behaviour.currentBehaviourName, 'justSpotted');
    t.true(hunter.canSee(hunted));

    hunted.runTo(nodes[3][2]);
    hunted.update({ diff: 0.5 });
    t.is(hunted.closestNode, nodes[4][0]);
    t.is(hunted._targetNode, nodes[4][1]);
    hunter.update({ diff: 1000 });
    t.true(hunter.canSee(hunted));
    t.is(hunter._behaviour.currentBehaviourName, 'chaseVisible');
});

test('chases target round corner', t => {    
    const { nodes, hunted, hunter } = buildGraphWithHunterAndHunted(t);

    hunted.runTo(nodes[4][0]);
    hunted.update({ diff: 100 });

    t.is(hunted.closestNode, nodes[4][0]);

    hunter.update({ diff: 1 });
    t.is(hunter._behaviour.currentBehaviourName, 'justSpotted');
    t.true(hunter.canSee(hunted));

    hunted.runTo(nodes[3][2]);
    hunted.update({ diff: 0.5 });
    t.is(hunted.closestNode, nodes[4][0]);
    t.is(hunted._targetNode, nodes[4][1]);
    hunter.update({ diff: 1000 });
    t.true(hunter.canSee(hunted));
    t.is(hunter._behaviour.currentBehaviourName, 'chaseVisible');

    let path = hunter._behaviour._behaviour._path;
    t.truthy(path);
    t.is(path[path.length - 1], nodes[4][1]);
    
    hunted.update({ diff: 1 });
    hunted.update({ diff: 1 });
    hunted.update({ diff: 1 });
    hunted.update({ diff: 1 });
    t.is(hunted.closestNode, nodes[3][2]);
    t.is(hunted._targetNode, nodes[3][2]);

    hunter.update({ diff: 1 });
    t.is(hunter._behaviour.currentBehaviourName, 'chaseAroundCorner');
    path = hunter._behaviour._behaviour._path;
    t.truthy(path);
    t.is(path[path.length - 1], nodes[4][1]);
});