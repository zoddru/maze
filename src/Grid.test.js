import test from 'ava';
import Grid from './Grid';
import Vector from './Vector';

test('create', t => {
    const g = new Grid({ columns: 10, rows: 20 }, { width: 100, height: 200 });

    t.is(g.tileWidth, 10);
    t.is(g.tileHeight, 10);

    t.is(g.columns.length, 10);
    t.is(g.tiles.length, 200);

    t.is(g.columns[0][0].x, 0);
    t.is(g.columns[0][0].y, 0);

    t.is(g.columns[1][0].x, 10);
    t.is(g.columns[1][0].y, 0);
    
    t.is(g.columns[0][1].x, 0);
    t.is(g.columns[0][1].y, 10);

    t.is(g.columns[9][19].x, 90);
    t.is(g.columns[9][19].y, 190);
});

test('find', t => {
    const g = new Grid({ columns: 10, rows: 20 }, { width: 100, height: 200 });

    let tile = g.find(new Vector(5, 5));
    t.is(tile.index, 0);
    t.is(tile.i, 0);
    t.is(tile.j, 0);

    tile = g.find(new Vector(15, 5));
    t.is(tile.index, 20);
    t.is(tile.i, 1);
    t.is(tile.j, 0);

    tile = g.find(new Vector(25, 15));
    t.is(tile.index, 41);
    t.is(tile.i, 2);
    t.is(tile.j, 1);
});

test('deselectAll', t => {
    const g = new Grid({ columns: 10, rows: 20 }, { width: 100, height: 200 });

    g.find(new Vector(5, 5)).selected = true;
    g.find(new Vector(15, 5)).selected = true;
    g.find(new Vector(25, 15)).selected = true;

    t.true(g.tiles.filter(s => s.selected).length > 0);
    g.deselectAll();
    
    t.true(g.tiles.filter(s => s.selected).length === 0);
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