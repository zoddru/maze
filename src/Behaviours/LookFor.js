import Color from '../Color';
import { Behaviour, BeStill, RandomPath, FollowPath, Follow, ToIntersection, LookAround, Wait } from './Behaviour';

export default class LookFor extends Behaviour {
    constructor(robot, settings) {
        super(robot);

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

        this._behaviour = new BeStill(robot);
        this._behaviours = { strollAround, justSpotted, chaseVisible, chaseAroundCorner, chaseToIntersection, lookAround, giveUp };
        Object.freeze(this._behaviours);

        Object.seal(this);
    }

    reset(target) {
        this._target = target;
        this._beCool();
    }

    chase() {
        if (!this.canSeeTarget)
            return;
        this._chase();
    }

    update(args) {
        this.robot.color = this.isAlert ? Color.fire : Color.grass;

        this._setBehaviour();

        this._behaviour.update(args);
    }

    _setBehaviour() {
        const behaviour = this._behaviour;
        const behaviours = this._behaviours;

        if (!this.canSeeTarget) {
            if (behaviour === behaviours.chaseVisible) {
                this._chaseAroundCorner();
            }
            return;
        }
        
        if (!this.isAlert) {
            this._justSpotted();
        }
        else if (this.isChasing) {
            this._chase();
        }
    }

    setNewTarget() {
        this._behaviour.setNewTarget();
    }

    draw(ctx) {
        this._behaviour.draw(ctx);
    }

    get hasTarget() {
        return !!this._target;
    }

    get isAlert() {
        const behaviour = this._behaviour;
        const behaviours = this._behaviours;
        return behaviour !== behaviours.strollAround && behaviour !== behaviours.giveUp;
    }

    get isChasing() {
        const behaviour = this._behaviour;
        const behaviours = this._behaviours;
        return behaviour === behaviours.chaseVisible 
            || behaviour === behaviours.chaseAroundCorner 
            || behaviour === behaviours.chaseToIntersection
            || behaviour === behaviours.lookAround;
    }

    get canSeeTarget() {
        const canSee = this.robot.canSee(this._target);
        if (!canSee)
            return false;

        this._lastSeen.node = this._target._targetNode || this._target.closestNode;

        return true;
    }

    get currentBehaviourName() {
        const behaviour = this._behaviour;
        const behaviours = this._behaviours;
        return Object.keys(behaviours).filter((k) => { return behaviours[k] === behaviour; })[0];
    }

    _beCool() {
        this.robot.walk();
        this._behaviour = this._behaviours.strollAround;
        this._behaviour.reset();
    }

    _justSpotted() {
        this._behaviour = this._behaviours.justSpotted;
        this._behaviour.reset();
    }

    _chase() {
        this.robot.run();
        this._behaviour = this._behaviours.chaseVisible;
        this._behaviour.reset(this._lastSeen.node);
    }

    _chaseAroundCorner() {
        this.robot.run();
        this._behaviour = this._behaviours.chaseAroundCorner
        this._behaviour.reset(this._lastSeen.node);
    }

    _chaseToIntersection() {
        this.robot.run();
        this._behaviour = this._behaviours.chaseToIntersection
        this._behaviour.reset();
    }

    _lookAround() {
        const robot = this.robot;
        const inverse = robot._edge && robot._edge.inverse;
        robot.run();
        this._behaviour = this._behaviours.lookAround
        this._behaviour.reset({ visitedEdges: [inverse] });
    }

    _giveUp() {
        this.robot.walk();
        this._behaviour = this._behaviours.giveUp;
        this._behaviour.reset();
    }
}