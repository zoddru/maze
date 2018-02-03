import Color from './Color';
import { Behaviour, BeStill, RandomPath, FollowPath, ToIntersection, LookAround, Wait, Patrol } from './Robot.Behaviour';

export default class LookFor extends Behaviour {
    constructor(robot, settings) {
        super(robot);

        const self = this;
        const strollAround = new RandomPath(robot);
        const lookAround = new LookAround(robot, settings, r => {
            this._giveUp();
        });
        const chaseToIntersection = new ToIntersection(robot, r => {
            this._lookAround();
        });
        const chaseVisible = new FollowPath(robot, r => {        
            this._chaseToIntersection();
        });
        const chaseAroundCorner = new FollowPath(robot, r => {        
            this._chaseToIntersection();
        });
        const justSpotted = new Wait(robot, settings, r => {
            this._chase();
        });
        const giveUp = new Wait(robot, settings, r => {
            this._beCool();
        });

        this._target = null;
        this._lastSeen = { node: null };
        Object.seal(this._lastSeen);

        //this._mode = new BeStill(robot);
        let _mode = new BeStill(robot);
        Object.defineProperty(this, '_mode', {
            get: () => { return _mode; },
            set: (_m) => { 
                const key = Object.keys(self._modes).filter((k) => {return self._modes[k] === _m;})[0];
                console.log(key);
                _mode = _m; 
            }
        });

        this._modes = { strollAround, justSpotted, chaseVisible, chaseAroundCorner, chaseToIntersection, lookAround, giveUp };
        Object.freeze(this._modes);

        Object.seal(this);
    }

    reset(target) {
        this._target = target;        
        this._beCool();
    }

    update(args) {        
        this.robot.color = this.isAlert ? Color.fire : Color.electric;

        if (!this.canSeeTarget) {
            this._updateCannotSee(args);
        }
        else {
            this._updateCanSee(args);
        }
    }

    _updateCannotSee(args) {
        const mode = this._mode;
        const modes = this._modes;

        if (mode === modes.chaseVisible) {
            this._chaseAroundCorner();
        }

        this._mode.update(args);
    }

    _updateCanSee(args) {
        const mode = this._mode;
        const modes = this._modes;

        if (mode === modes.strollAround || mode === modes.giveUp) {
            this._justSpotted();
        }
        else if (this.isChasing) {
            this._chase();
        }

        this._mode.update(args);
    }

    setNewTarget() {
        this._mode.setNewTarget();
    }

    draw (ctx) {
        this._mode.draw(ctx);
    }

    get hasTarget() {
        return !!this._target;
    }

    get isAlert() {
        return this._mode !== this._modes.strollAround;
    }

    get isChasing() {
        const mode = this._mode;
        const modes = this._modes;
        return mode === modes.chaseVisible || mode === modes.chaseAroundCorner || mode === modes.chaseToIntersection || mode === modes.lookAround;
    }

    get canSeeTarget() {
        const canSee = this.robot.canSee(this._target);
        if (!canSee)
            return false;

        this._lastSeen.node = this._target._targetNode || this._target.closestNode;

        return true;
    }

    _beCool () {
        this.robot.walk();
        this._mode = this._modes.strollAround;
        this._mode.reset();
    }

    _justSpotted () {
        this._mode = this._modes.justSpotted;
        this._mode.reset();
    }

    _chase () {
        this.robot.run();
        this._mode = this._modes.chaseVisible;
        this._mode.reset(this._lastSeen.node);
    }

    _chaseAroundCorner () {
        this.robot.run();
        this._mode = this._modes.chaseAroundCorner
        this._mode.reset(this._lastSeen.node);
    }

    _chaseToIntersection () {
        this.robot.run();
        this._mode = this._modes.chaseToIntersection
        this._mode.reset();
    }

    _lookAround () {
        const robot = this.robot;
        const inverse = robot._edge && robot._edge.inverse;
        robot.run();
        this._mode = this._modes.lookAround
        this._mode.reset({ visitedEdges: [inverse] });
    }

    _giveUp () {
        this.robot.walk();
        this._mode = this._modes.giveUp;
        this._mode.reset();
    }
}