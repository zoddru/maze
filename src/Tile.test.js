import test from 'ava';
import Tile from './Tile';
import Vector from './Vector';

test('create', t => {
    const tile = new Tile({
        index: 0, i: 0, j: 0, x: 100, y: 200, width: 200, height: 200
    });

    t.is(tile.x, 100);
    t.is(tile.y, 200);
    t.is(tile.width, 200);
    t.is(tile.height, 200);

    t.is(tile.center.x, 200);
    t.is(tile.center.y, 300);
});

test('contains', t => {
    const tile = new Tile({
        index: 0, i: 0, j: 0, x: 100, y: 200, width: 200, height: 200
    });

    t.true(tile.contains(new Vector(100, 200)));
    t.false(tile.contains(new Vector(300, 200)));
    t.false(tile.contains(new Vector(300, 400)));
    t.false(tile.contains(new Vector(100, 400)));

    t.true(tile.contains(new Vector(200, 300)));
});

test('isBelow', t => {
    const tile = new Tile({
        index: 0, i: 0, j: 0, x: 100, y: 200, width: 200, height: 200
    });

    t.true(tile.isBelow(new Vector(0, 301)));
    t.false(tile.isBelow(new Vector(0, 300)));
});

test('isAbove', t => {
    const tile = new Tile({
        index: 0, i: 0, j: 0, x: 100, y: 200, width: 200, height: 200
    });

    t.true(tile.isAbove(new Vector(0, 300)));
    t.false(tile.isAbove(new Vector(0, 301)));
});

test('isLeft', t => {
    const tile = new Tile({
        index: 0, i: 0, j: 0, x: 100, y: 200, width: 200, height: 200
    });

    t.true(tile.isLeft(new Vector(199, 0)));
    t.false(tile.isLeft(new Vector(200, 0)));
});

test('isRight', t => {
    const tile = new Tile({
        index: 0, i: 0, j: 0, x: 100, y: 200, width: 200, height: 200
    });

    t.true(tile.isRight(new Vector(200, 0)));
    t.false(tile.isRight(new Vector(199, 0)));
});

test('block', t => {
    const tile = new Tile({
        index: 0, i: 0, j: 0, x: 100, y: 200, width: 200, height: 200
    });

    t.false(tile.block);

    tile.block = true;

    t.true(tile.block);
});