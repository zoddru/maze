const requestAnimationFrame = window.requestAnimationFrame;
const cancelAnimationFrame = window.cancelAnimationFrame;

const timerProto = {};
Object.freeze(timerProto);

export default class TimerFactory {
    constructor () {
        Object.freeze(this);
    }

    create (callback) {

        let started = false;
        let id = 0;
        let lastTimestap = 0;
        
        if (typeof callback !== 'function') {
            callback = function () {
            };
        }
        
        const firstFrame = function (timestamp) {     
            lastTimestap = timestamp;
            id = requestAnimationFrame(frame);
        };
        
        const frame = function (timestamp) {
            callback({
                diff: (timestamp - lastTimestap)
            });
            
            lastTimestap = timestamp;
            
            id = requestAnimationFrame(frame);
        };

        return Object.create(timerProto, {
            start: {
                value: function () {
                    started = true;                    
                    id = requestAnimationFrame(firstFrame);
                }
            },
            stop: {
                value: function () {
                    started = false;                    
                    cancelAnimationFrame(id);
                }
            },
            toggle: {
                value: function () {
                    if (started) {
                        this.stop();
                    }
                    else {
                        this.start();
                    }
                }
            }
        });
    }

    createInterval (callback, interval, diff) {

        let started = false;
        let id = 0;
        
        if (typeof callback !== 'function') {
            callback = function () {
            };
        }

        const frame = function (timestamp) {
            callback({
                diff: diff
            });
            
            id = setTimeout(frame, interval);
        };
        
        const timer = Object.create(timerProto, {
            start: {
                value: function () {
                    started = true;                    
                    id = setTimeout(frame, interval);
                }
            },
            stop: {
                value: function () {
                    started = false;                    
                    clearTimeout(id);
                }
            },
            toggle: {
                value: function () {
                    if (started) {
                        this.stop();
                    }
                    else {
                        this.start();
                    }
                }
            }
        });

        Object.freeze(timer);

        return timer;
    }
}