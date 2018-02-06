import AxisOfSight from './AxisOfSight';
import Vector from './Vector';
import Path from './Path';
import { BeStill, RandomPath, FollowPath, Follow, ToIntersection, LookAround, Wait, Patrol } from './Behaviours/Behaviour';
import LookFor from './Behaviours/LookFor';
import SearchAsGroup from './Behaviours/SearchAsGroup';

const defaultSettings = {
    walkSpeed: 0.04,
    runSpeed: 0.12
};

Object.freeze(defaultSettings);

export default class Robot {
    constructor(graph, width, height, startNode, settings) {
                
        settings = Object.assign({}, defaultSettings, settings || {});

        const behaviours = {
            still: new BeStill(this),
            random: new RandomPath(this),
            path: new FollowPath(this),
            follow: new Follow(this),
            toIntersection: new ToIntersection(this),
            lookAround: new LookAround(this, settings),
            wait: new Wait(this, settings),
            patrol: new Patrol(this, settings),
            lookFor: new LookFor(this),
            searchFor: new SearchAsGroup(this)
        };

        Object.freeze(behaviours);

        let currentbehaviour = behaviours.still;

        Object.defineProperties(this, {
            pos: { value: null, writable: true },
            speed: { value: settings.walkSpeed, writable: true },

            settings: { value: settings },
            
            _behaviours: { value: behaviours },
            _lastbehaviour: { value: behaviours.still, writable: true },   
            _behaviour: { 
                get: function () { return currentbehaviour; },
                set: function (value) {
                    this._lastbehaviour = currentbehaviour;
                    currentbehaviour = value;
                }
            },
            
            _lastNode: { value: null, writable: true },
            _edge: { value: null, writable: true },
            _targetNode: { value: null, writable: true },
            _target: { value: null, writable: true }, // point (can be different from _targetNode.tile.center)
            _direction: { value: null, writable: true },
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

    get behaviours() {
        return this._behaviours;
    }

    walk () {
        this.speed = this.settings.walkSpeed;
    }

    run () {
        this.speed = this.settings.runSpeed;
    }

    update (args) {
        this._behaviour.update(args);
    }
    
    randomWalk () {
        this._behaviour = this._behaviours.random;
        this.speed = this.settings.walkSpeed;
    }
    
    walkTo (node) {
        this.speed = this.settings.walkSpeed;
        this._behaviour = this._behaviours.path;
        this._behaviour.reset(node);
    }

    runTo (node) {
        this.walkTo(node);
        this.speed = this.settings.runSpeed;
    }

    follow (target) {
        this._behaviour = this._behaviours.follow;
        this._behaviour.reset(target);
    }

    walkToIntersection () {
        this._behaviour = this._behaviours.toIntersection;
        this.speed = this.settings.walkSpeed;
    }

    wait () {
        this._behaviour = this._behaviours.wait;
    }

    stayPut () {
        this._behaviour = this._behaviours.still;
    }

    lookAround () {
        this._behaviour = this._behaviours.lookAround;

        let inverse = this._edge && this._edge.inverse;

        this._behaviour.reset({ visitedEdges: [inverse] });
    }

    patrol () {
        this._behaviour = this._behaviours.patrol;
        this.speed = this.settings.runSpeed;
    }

    lookFor (target) {
        this._behaviour = this._behaviours.lookFor;
        this._behaviour.reset(target,);
    }

    searchFor (target, friends) {
        this._behaviour = this._behaviours.searchFor;
        this._behaviour.reset(target, friends);
    }

    lookAt (node) {
        // const edge = this.closestNode.edges.find(e => e.node === closeNode);

        // if (!edge)
        //     return;

        this._direction = node.tile.center.subtract(this.pos);
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
        const direction = this._direction.normalize();

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
        this._direction = this._target.subtract(this.pos);
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
            
        this._behaviour.setNewTarget();

        this._behaviour.update({ diff: (t - dt), iteration: iteration + 1 });
    }
    
    // draw functions     
    
    draw (ctx) {
        let sight = this.axisOfSight;
        if (sight) {
            sight.draw(ctx);
        }
        this._behaviour.draw(ctx);
        
        ctx.fillRect((this.pos.x - this.hw), (this.pos.y - this.hh), this.width, this.height);
    }
};