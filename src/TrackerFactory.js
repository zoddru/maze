const document = window.document;

const trackerProto = {};
Object.freeze(trackerProto);

const defaultHandlers = {
    move: function () {},
    down: function () {},
    up: function () {},
    over: function () {},
    out: function () {}
};
Object.freeze(defaultHandlers);


export default class TrackerFactory {
    constructor () {
        Object.freeze(this);
    }

    create (el, handlers) {

        let _inside = false;
        let _down = false;
        let _pos = { x: NaN, y: NaN };

        const getArgs = function (e) {
            _pos.x = e.offsetX;
            _pos.y = e.offsetY;
            
            return {
                pos: _pos,
                down: _down,
                inside: _inside
            };
        };
        
        handlers = Object.assign({}, defaultHandlers, handlers || {});
                
        el.addEventListener('mousedown', function (e) {
            _inside = true;
            _down = true;
            handlers.down(getArgs(e));
        });
        
        document.addEventListener('mouseup', function (e) {
            if (!_down) 
                return;
            _down = false;
            handlers.up(getArgs(e));
        });
        
        el.addEventListener('mousemove', function (e) {
            handlers.move(getArgs(e));
        });
        
        el.addEventListener('mouseout', function (e) {
            _inside = false;
            handlers.out(getArgs({ offsetX: NaN, offsetY: NaN }));
        });
        
        el.addEventListener('mouseover', function (e) {
            _inside = true;
            handlers.over(getArgs({ offsetX: NaN, offsetY: NaN }));
        });
        
        document.addEventListener('mouseout', function (e) {
            _inside = false;
            handlers.out(getArgs({ offsetX: NaN, offsetY: NaN }));
        });
        
        const tracker = Object.create(trackerProto, {
            pos: { value: _pos },
            down: { get: function () { return _down; } },
            inside: { get: function () { return _inside; } }
        });

        Object.freeze(tracker);
        
        return tracker;
    }
}