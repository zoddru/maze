export default class Vector {
    constructor (x, y) {
        this.x = x;
        this.y = y;

        Object.freeze(this);
    }

    static zero = new Vector(0, 0);
    static unitX = new Vector(1, 0);
    static unitY = new Vector(0, 1);
    static inverseUnitX = new Vector(-1, 0);
    static inverseUnitY = new Vector(0, -1);

    toString (precision) {
        if (typeof precision !== 'undefined') {
            return '(' + this.x.toFixed(precision) + ', ' + this.y.toFixed(precision) + ')';
        }
        return '(' + this.x + ', ' + this.y + ')';
    }

    equals(v) {
        return this === v || this.x === v.x && this.y === v.y;
    }

    almostEquals (v, tolerance) {
        if (this.equals(v))
            return true;
        return Math.abs(this.x - v.x) <= tolerance && Math.abs(this.y - v.y) <= tolerance;
    }
    
    get length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        let len = this.length;
        if (len === 0) {
            return Vector.zero;
        }
        return new Vector(this.x / len, this.y / len);
    }

    add(v) {
        return new Vector(this.x + v.x, this.y + v.y);
    }

    subtract(v) {
        return new Vector(this.x - v.x, this.y - v.y);
    }

    scale (s) {
        return new Vector(s * this.x, s * this.y);
    }

    invert () {
        return new Vector(-this.x, -this.y);
    }

    rotate (theta) {
        let cosTheta = Math.cos(theta);
        let sinTheta = Math.sin(theta);

        return new Vector(
            this.x * cosTheta - this.y * sinTheta,
            this.x * sinTheta + this.y * cosTheta
        );
    }

    perpendicular () {
        return new Vector(
            -this.y,
            this.x
        );
    }

    dot (v) {
        return this.x * v.x + this.y * v.y;
    }

    cap (max) {
        const len = this.length;
        if (len <= max)
            return this;
        return this.scale(max / len);
    }

    isAcuteWith (v) {
        return this.dot(v) > 0;
    }

    reflection(n) {
        // http://math.stackexchange.com/questions/13261/how-to-get-a-reflection-vector
        // r=d-2(d·n)n                
        n = this.normalize(n);
        return this.subtract(n.scale(2 * this.dot(n)));
    }
}