function cap(component) {
    if (typeof component !== 'number')
        return 0;
    component = Math.round(component);
    if (component < 0)
        return 0;
    if (component > 255)
        return 255;
    return component;
};

function capAlpha(alpha) {
    if (typeof alpha !== 'number')
        return 1;
    if (alpha < 0)
        return 0;
    if (alpha > 1)
        return 1;
    return alpha;
};


export default class Color {
    constructor (r, g, b, a) {
        this.r = cap(r);
        this.g = cap(g);
        this.b = cap(b);
        this.a = capAlpha(a);

        Object.freeze(this);
    }

    toString () {
        const a = Number(this.a.toFixed(5));
        if (a === 1)
            return 'rgb(' + this.r + ', ' + this.g + ', ' + this.b + ')';
        return 'rgba(' + this.r + ', ' + this.g + ', ' + this.b + ', ' + a + ')';
    }

    newAlpha (a) {
        return new Color(this.r, this.g, this.b, a);
    }

    merge (color) {
        return new Color(
            Math.round((this.r + color.r) / 2), 
            Math.round((this.g + color.g) / 2), 
            Math.round((this.b + color.b) / 2),
            (this.a + color.a) / 2
        );
    }

    static black = new Color(0, 0, 0);
    static white = new Color(255, 255, 255);
    static red = new Color(255, 0, 0);
    static green = new Color(0, 255, 0);
    static blue = new Color(0, 0, 255);
    
    static fire = new Color(211, 86, 92);
    static grass = new Color(104, 180, 108);
    static water = new Color(80, 120, 229);
    static electric = new Color(232, 201, 57);
}