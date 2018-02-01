import test from 'ava';
import Vector from './Vector';

test('is frozen', t => {
	const v = new Vector(3, 4);	
	t.throws(() => v.x = 120);
	t.throws(() => v.y = 120);
});

test('length', t => {
	const v = new Vector(3, 4);	
	t.is(v.length, 5);
});

test('equals', t => {
	const v1 = new Vector(3, 4);	
	const v2 = new Vector(3, 4);
	const v3 = new Vector(4, 3);	
	t.true(v1.equals(v2));	
	t.false(v2.equals(v3));
});

test('normalize', t => {
	let n = new Vector(0, 4).normalize();
	t.true(n.equals(Vector.unitY));

	n = new Vector(5, 0).normalize();
	t.true(n.equals(Vector.unitX));

	n = new Vector(0, 0).normalize();
	t.true(n.equals(Vector.zero));

	n = Vector.zero.normalize();
	t.true(n.equals(Vector.zero));
});

test('add', t => {
	const v1 = new Vector(3, 4);
	const v2 = new Vector(4, 3);
	const v3 = v1.add(v2);
	
	t.true(v3.equals(new Vector(7, 7)));
});

test('scale', t => {
	const v = new Vector(3, 4);
	const r = v.scale(4);

	t.true(r.equals(new Vector(12, 16)));
});

test('invert', t => {
	const v = new Vector(3, 4);
	const r = v.invert();

	t.true(r.equals(new Vector(-3, -4)));
});

test('rotate', t => {
	const v = new Vector(3, 4);
	const r = v.rotate(Math.PI/2);

	t.true(r.almostEquals(new Vector(-4, 3), 0.00000001));
});

test('perpendicular', t => {
	const v = new Vector(3, 4);
	const r = v.perpendicular();

	t.true(r.equals(new Vector(-4, 3)));
});

test('dot', t => {
	const a = new Vector(3, 4);
	const b = new Vector(-4, 3);
	const actual = a.dot(b);
	const expected = a.length * b.length * Math.cos(Math.PI/2); 

	t.true(Math.abs(actual - expected) < 0.00000001);
});

test('cap', t => {
	const v = new Vector(6, 8);
	const r = v.cap(5);

	t.true(r.equals(new Vector(3, 4)));
});

