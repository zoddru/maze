import axios  from 'axios';
import Grid from './src/Grid';
import Color from './src/Color';
import Graph from './src/Graph';
import Robot from './src/Robot';
import Path from './src/Path';
import TimerFactory from './src/TimerFactory';
import TrackerFactory from './src/TrackerFactory';

const url = '/data/map.json';

axios
    .get(url)
    .then(response => {
        RunApp(response.data);
    })
    .catch(error => {
        console.log(error);
    });

function RunApp(map) {
    const canvas = document.getElementsByTagName('canvas')[0];
    const ctx = canvas.getContext('2d');
    const bounds = { width: canvas.offsetWidth, height: canvas.offsetHeight };
    const grid = new Grid({ columns: 16, rows: 12 }, bounds);
    grid.setMap(map);

    const graph = new Graph(grid);

    const player = new Robot(graph, Math.round(grid.tileWidth * 0.8), Math.round(grid.tileHeight * 0.8), graph.randomNode());
    player.color = Color.water;
    player.stayPut();

    const robots = [];

    for (let i = 0; i < 2; i += 1) {
        addRobot(graph.randomNode(), Color.grass);
    }

    const timer = new TimerFactory().create(args => {
        update(args);
        draw();
    }, 500, 32);

    const onClickOrMove = args => {
        if (!args.down)
            return;
        const target = graph.find(args.pos);
        if (!target)
            return;
        player.runTo(target);
    };

    const tracker = new TrackerFactory().create(canvas, {
        move: onClickOrMove,
        down: onClickOrMove
    });

    draw();
    timer.start();

    function addRobot (node, color) {
        const robot = new Robot(graph, Math.round(grid.tileWidth * 0.8), Math.round(grid.tileHeight * 0.8), node, { runSpeed: 0.09 });
        robot.lookFor(player, robots);
        robot.color = color;
        robots.push(robot);
    }

    function draw() {
        ctx.clearRect(0, 0, bounds.width, bounds.height);
        grid.draw(ctx);
        robots.forEach(r => {
            ctx.strokeStyle = r.color;
            ctx.fillStyle = r.color;
            r.draw(ctx);
        });
        ctx.strokeStyle = player.color;
        ctx.fillStyle = player.color;
        player.draw(ctx);
    }

    function update(args) {
        player.update(args);
        robots.forEach(r => {
            r.update(args);
        });
    }
}