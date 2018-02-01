export default class Ray {
    constructor (origin, direction) {
        this.origin = origin;
        this.direction = direction;

        Object.freeze(this);
    }

    findIntersection (ray) {
        // http://stackoverflow.com/questions/2931573/determining-if-two-rays-intersect
        // p = as + ad * u
        // p = bs + bd * v
        // u := (as.y*bd.x + bd.y*bs.x - bs.y*bd.x - bd.y*as.x ) / (ad.x*bd.y - ad.y*bd.x)

        const as = this.origin;
        const ad = this.direction;
        const bs = ray.origin;
        const bd = ray.direction;
        const denominator = (ad.x * bd.y - ad.y * bd.x);

        if (denominator === 0) {
            return false;
        }

        const u = (as.y * bd.x + bd.y * bs.x - bs.y * bd.x - bd.y * as.x) / denominator;

        return ad.scale(u).add(as);
    }

    toString() {
        return '(' + this.origin.toString() + ',' + this.direction.toString() + ')';
    }
}
