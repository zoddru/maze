import test from 'ava';
import Vector from './Vector';
import Ray from './Ray';

test('finds intersection', t => {
	const p1 = new Vector(0, 1);
	const v1 = new Vector(1, 1);
	const r1 = new Ray(p1, v1);
	// 1,2; 2,3; 3,4

	const p2 = new Vector(9,7);
	const v2 = new Vector(-2, -1);
	const r2 = new Ray(p2, v2);
	// 9,7; 7,6; 5,5; 3,4

	const poi = r1.findIntersection(r2);

	t.true(poi.equals(new Vector(3, 4)));
});