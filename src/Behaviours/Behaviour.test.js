import test from 'ava';
import Grid from '../Grid';
import Graph from '../Graph';
import Robot from '../Robot';

function buildGraph(t) {
    const grid = new Grid({ columns: 5, rows: 3 }, { width: 50, height: 30 });
    grid.columns[0][1].block = true;
    grid.columns[1][1].block = true;
    grid.columns[3][1].block = true;
    const graph = new Graph(grid);
    const nodes = graph.nodes;

    t.is(nodes[0][0].edges.length, 1);
    t.false(nodes[0][0].isIntersection);
    t.false(nodes[1][0].isIntersection);
    t.true(nodes[2][0].isIntersection);
    t.false(nodes[3][0].isIntersection);
    t.false(nodes[4][0].isIntersection);
    t.is(graph.root, nodes[0][0]);

    return { grid, graph, nodes };
}

test('toIntersection stops on intersection', t => {
	const { graph, nodes } = buildGraph(t);

    const robot = new Robot(graph, 10, 10, graph.root, { walkSpeed: 3, runSpeed: 20 });
    robot.walkToIntersection();
    
    t.is(robot.pos.x, 5);
    t.is(robot.pos.y, 5);

    robot.update({ diff: 2 });

    t.is(robot.pos.x, 11);
    t.is(robot.pos.y, 5);
    t.is(robot.closestNode, nodes[1][0]);

    robot.update({ diff: 2 });
    
    t.is(robot.pos.x, 17);
    t.is(robot.closestNode, nodes[1][0]);

    robot.update({ diff: 2 });   

    t.is(robot.pos.x, 23);
    t.is(robot.closestNode, nodes[2][0]);

    robot.update({ diff: 2 });   

    t.is(robot.pos.x, 25);
    t.is(robot.closestNode, nodes[2][0]);    
});