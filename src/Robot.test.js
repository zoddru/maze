import test from 'ava';
import Vector from './Vector';
import Grid from './Grid';
import Graph from './Graph';
import Node from './Node';
import Robot from './Robot';

function createSetup() {
    const grid = new Grid({ columns: 3, rows: 3 }, { width: 30, height: 30 });
    grid.columns[1][1].block = true;
    const graph = new Graph(grid);

    const robot = new Robot(graph, 20, 20, graph.nodes[0][0], { walkSpeed: 10, runSpeed: 20 });

    return { grid, graph, robot };
}

test('create', t => {
    const { robot } = createSetup();

    t.is(robot.pos.x, 5);
    t.is(robot.pos.y, 5);
    t.is(robot.settings.walkSpeed, 10);
    t.is(robot.settings.runSpeed, 20);

    t.truthy(robot);
});

function randomWalkTestIteration(t) {
    const { robot } = createSetup();

    t.is(robot.pos.x, 5);
    t.is(robot.pos.y, 5);

    t.is(robot.closestNode.edges.length, 2);

    robot.randomWalk();
    robot.update({ diff: 1 });

    const directionName = robot.directionName;
    t.true(directionName === 'right' || directionName === 'down');

    t.is(robot.directionName, directionName);

    if (robot.directionName === 'right') {
        randomWalkTestRight(t, robot);
    }
    else {
        randomWalkTestDown(t, robot);
    }
}

function randomWalkTestDown(t, robot) {
    t.is(robot.pos.x, 5);
    t.is(robot.pos.y, 15);

    robot.update({ diff: 1 });

    t.is(robot.pos.x, 5);
    t.is(robot.pos.y, 25);

    robot.update({ diff: 1 });

    t.is(robot.directionName, 'right');
    t.is(robot.pos.x, 15);
    t.is(robot.pos.y, 25);
}

function randomWalkTestRight(t, robot) {
    t.is(robot.pos.x, 15);
    t.is(robot.pos.y, 5);

    robot.update({ diff: 1 });

    t.is(robot.pos.x, 25);
    t.is(robot.pos.y, 5);

    robot.update({ diff: 1 });

    t.is(robot.directionName, 'down');
    t.is(robot.pos.x, 25);
    t.is(robot.pos.y, 15);
}

test('randomWalk', t => {
    for (let i = 0; i < 100; i++) {
        randomWalkTestIteration(t);
    }
});

test('walkTo', t => {

    const { robot, graph } = createSetup();

    t.is(robot._behaviour, robot.behaviours.still);
    t.is(robot.pos.x, 5);
    t.is(robot.pos.y, 5);

    robot.update({ diff: 1 });

    t.is(robot._behaviour, robot.behaviours.still);
    t.is(robot.pos.x, 5);
    t.is(robot.pos.y, 5);

    robot.walkTo(graph.nodes[2][0]);

    t.is(robot._behaviour, robot.behaviours.path);

    robot.update({ diff: 1 });

    t.is(robot.pos.x, 15);
    t.is(robot.pos.y, 5);
    
    robot.update({ diff: 1 });

    t.is(robot.pos.x, 25);
    t.is(robot.pos.y, 5);

    t.is(robot._behaviour, robot.behaviours.path);
    
    robot.update({ diff: 1 });
});

test('lookAt looks at the correct node', t => {
    const { robot, graph } = createSetup();

    t.is(robot.directionName, 'none');

    robot.lookAt(graph.nodes[2][2]);

    robot.lookAt(graph.nodes[0][1]);
    t.is(robot.directionName, 'down');

    robot.lookAt(graph.nodes[1][0]);
    t.is(robot.directionName, 'right');

    robot.lookAt(graph.nodes[2][2]);
    t.is(robot.directionName, 'right');
});

test('canSee false when out of sight', t => {
    const { robot, graph } = createSetup();
    const robot2 = new Robot(graph, 20, 20, graph.nodes[2][2], { walkSpeed: 10, runSpeed: 20 });

    t.false(robot.canSee(robot2));
    robot.lookAt(graph.nodes[0][1]);
    t.false(robot.canSee(robot2));
    robot.lookAt(graph.nodes[1][0]);
    t.false(robot.canSee(robot2));
});

test('canSee false when not facing', t => {
    const { robot, graph } = createSetup();
    const robot2 = new Robot(graph, 20, 20, graph.nodes[1][0], { walkSpeed: 10, runSpeed: 20 });

    robot.lookAt(graph.nodes[0][1]);
    t.false(robot.canSee(robot2));
});

test('canSee when facing', t => {
    const { robot, graph } = createSetup();
    const robot2 = new Robot(graph, 20, 20, graph.nodes[2][0], { walkSpeed: 10, runSpeed: 20 });
    const robot3 = new Robot(graph, 20, 20, graph.nodes[0][2], { walkSpeed: 10, runSpeed: 20 });

    robot.lookAt(graph.nodes[1][0]);
    t.true(robot.canSee(robot2));
    t.false(robot.canSee(robot3));

    robot.lookAt(graph.nodes[0][1]);
    t.false(robot.canSee(robot2));
    t.true(robot.canSee(robot3));
});

test('canSee false when blocked', t => {
    const grid = new Grid({ columns: 4, rows: 4 }, { width: 10, height: 10 });
    grid.columns[2][0].block = true;
    const graph = new Graph(grid);

    const robot1 = new Robot(graph, 10, 10, graph.nodes[0][0], { walkSpeed: 10, runSpeed: 20 });
    const robot2 = new Robot(graph, 10, 10, graph.nodes[1][0], { walkSpeed: 10, runSpeed: 20 });
    const robot3 = new Robot(graph, 10, 10, graph.nodes[3][0], { walkSpeed: 10, runSpeed: 20 });

    robot1.lookAt(graph.nodes[1][0]);
    t.true(robot1.canSee(robot2));
    t.false(robot1.canSee(robot3));
});
