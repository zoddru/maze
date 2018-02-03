import AxisOfSight from './AxisOfSight';
import Vector from './Vector';
import Path from './Path';
import { BeStill, RandomPath, FollowPath, ToIntersection, LookAround, Wait, Patrol } from './Behaviours/Behaviour';
import LookFor from './Behaviours/LookFor';

const defaultSettings = {
    walkSpeed: 0.04,
    runSpeed: 0.12,
    lookWait: 500
};

Object.freeze(defaultSettings);

export default class Robot {
    constructor(graph, width, height, startNode, settings) {
                
        settings = Object.assign({}, defaultSettings, settings || {});

        const modes = {
            still: new BeStill(this),
            random: new RandomPath(this),
            path: new FollowPath(this),
            toIntersection: new ToIntersection(this),
            lookAround: new LookAround(this, settings),
            wait: new Wait(this, settings),
            patrol: new Patrol(this, settings),
            lookFor: new LookFor(this)
        };

        Object.freeze(modes);

        let currentMode = modes.still;

        Object.defineProperties(this, {
            pos: { value: null, writable: true },
            speed: { value: settings.walkSpeed, writable: true },

            settings: { value: settings },
            
            _modes: { value: modes },
            _lastMode: { value: modes.still, writable: true },   
            _mode: { 
                get: function () { return currentMode; },
                set: function (value) {
                    this._lastMode = currentMode;
                    currentMode = value;
                }
            },
            
            _lastNode: { value: null, writable: true },
            _edge: { value: null, writable: true },
            _targetNode: { value: null, writable: true },
            _target: { value: null, writable: true }, // point (can be different from _targetNode.tile.center)
            _lastDirection: { value: Vector.zero, writable: true },
            
            width: { value: width },
            height: { value: height },
            hw: { value: Math.round(width / 2) },
            hh: { value: Math.round(height / 2) },
            graph: { value: graph }
        });

        this._setNode(startNode || graph.root);
        this._setTarget(startNode || graph.root);
    }

    get modes() {
        return this._modes;
    }

    walk () {
        this.speed = this.settings.walkSpeed;
    }

    run () {
        this.speed = this.settings.runSpeed;
    }

    update (args) {
        this._mode.update(args);
    }
    
    randomWalk () {
        this._mode = this._modes.random;
        this.speed = this.settings.walkSpeed;
    }
    
    walkTo (node) {
        this.speed = this.settings.walkSpeed;
        this._mode = this._modes.path;
        this._mode.reset(node);
    }

    runTo (node) {
        this.walkTo(node);
        this.speed = this.settings.runSpeed;
    }

    walkToIntersection () {
        this._mode = this._modes.toIntersection;
        this.speed = this.settings.walkSpeed;
    }

    wait () {
        this._mode = this._modes.wait;
    }

    stayPut () {
        this._mode = this._modes.still;
    }

    lookAround () {
        this._mode = this._modes.lookAround;

        let inverse = this._edge && this._edge.inverse;

        this._mode.reset({ visitedEdges: [inverse] });
    }

    patrol () {
        this._mode = this._modes.patrol;
        this.speed = this.settings.runSpeed;
    }

    lookFor (target) {
        this._mode = this._modes.lookFor;
        this._mode.reset(target);
    }

    lookAt (closeNode) {
        const edge = this.closestNode.edges.find(e => e.node === closeNode);

        if (!edge)
            return;

        this._setTarget(closeNode, edge);
    }

    canSee (robot) {
        return this.axisOfSight.canSee(robot.closestTile);
    }
        
    get closestNode () {
        return this.graph.find(this.pos);
    }
    
    get closestTile () {
        let node = this.closestNode;
        return node ? node.tile : null;
    }
    
    get targetVector () {
        return this._target.subtract(this.pos);
    }
    
    get direction () {
        const direction = this.targetVector.normalize();

        if (!Vector.zero.equals(direction)) {
            this._lastDirection = direction;
        }
            
        return this._lastDirection;
    }
    
    get velocity () {
        return this.direction.scale(this.speed);
    }
    
    get directionName () {
        let direction = this.direction;
        if (direction.x < -0.5)
            return 'left';
        if (direction.x > 0.5)
            return 'right';
        if (direction.y < -0.5)
            return 'up';
        if (direction.y > 0.5)
            return 'down';
        return 'none';
    }

    get axisOfSight () {
        let closestTile = this.closestTile;
        if (!closestTile)
            return null;
        return new AxisOfSight(closestTile, this.directionName);
    }
    
    _setNode (node) {
        this.pos = node.tile.center;
        this._lastNode = node;
    }
    
    _setTarget (node, edge) {  
        this._targetNode = node;
        this._target = node.tile.center;          
        this._edge = edge || (!!this._lastNode ? this._lastNode.edgeTo(node) : null);
    }
    
    _move (args) {            
        const iteration = args.iteration || 0;

        if (iteration > 1) {
            console.log('Robot._move - too many iterations');
            args.iteration = 0;
            return;
        }

        let t = args.diff;
        let p = this.pos;
        let v = this.speed;
        let s = this.targetVector.length;
        
        // v = s / t
        let dt = s / v;
        
        if (dt >= t) {
            this.pos = p.add(this.velocity.scale(t));
            return;
        }

        this.pos = p.add(this.velocity.scale(dt));
            
        this._mode.setNewTarget();

        this._mode.update({ diff: (t - dt), iteration: iteration + 1 });
    }
    
    // draw functions     
    
    draw (ctx) {
        let sight = this.axisOfSight;
        if (sight) {
            sight.draw(ctx);
        }
        this._mode.draw(ctx);
        
        ctx.fillRect((this.pos.x - this.hw), (this.pos.y - this.hh), this.width, this.height);
    }
};