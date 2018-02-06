import Color from '../Color';
import { Behaviour, BeStill, RandomPath, FollowPath, Follow, ToIntersection, LookAround, Wait } from './Behaviour';
import LookFor from './LookFor';

const reduceToVisibleAlertFriend = (accumulator, friend) => {
    let robot = accumulator.robot;
    if (robot === friend)
        return accumulator;
    if (!friend._behaviour.isAlert || !robot.canSee(friend))
        return accumulator;
    let dist = friend.pos.subtract(robot.pos).length;
    if (dist > accumulator.closestDist)
        return accumulator;
    accumulator.closestDist = dist;
    accumulator.closest = friend;
    return accumulator;
};

const reduceToSpotter = (accumulator, friend) => {
    let robot = accumulator.robot;
    if (robot === friend)
        return accumulator;
    if (!friend._behaviour.canSeeTarget || !robot.canSee(friend))
        return accumulator;
    let dist = friend.pos.subtract(robot.pos).length;
    if (dist > accumulator.closestDist)
        return accumulator;
    accumulator.closestDist = dist;
    accumulator.closest = friend;
    return accumulator;
};

export default class SearchAsGroup extends Behaviour {
    constructor(robot, settings) {
        super(robot);

        const lookingForTarget = new LookFor(robot);
        const lookingForFriend = new LookFor(robot);

        this._target = null;
        this._friends = [];
        this._behaviour = lookingForTarget;
        this._behaviours = { lookingForTarget, lookingForFriend };
        Object.freeze(this._behaviours);

        Object.seal(this);
    }

    reset(target, friends) {
        this._target = target;
        this._friends = friends || [];
        this._lookForTarget();
        this._behaviour.reset(target);
    }

    update(args) {
        this._setBehaviour(args);

        this._behaviour.update(args);
    }

    _setBehaviour() {
        const behaviour = this._behaviour;
        const behaviours = this._behaviours;

        if (this.canSeeTarget) {
            if (behaviour !== behaviours.lookingForTarget) {
                this._lookForTarget();
            }
            return;
        }

        const friend = this.closestVisibleAlertFriend;
        if (!friend) {
            if (behaviour === behaviours.lookingForFriend
                && this.robot.canSee(behaviour._target)
                && !behaviour._target.isAlert) {
                this._lookForTarget();
            }
            return;
        }

        this._lookForFriend(friend);
    }

    setNewTarget() {
        this._behaviour.setNewTarget();
    }

    draw(ctx) {
        this._behaviour.draw(ctx);
    }

    get isAlert() {
        return this._behaviour.isAlert;
    }

    get canSeeTarget() {
        return this.robot.canSee(this._target);
    }

    get closestVisibleAlertFriend() {
        let accumulator = {
            robot: this.robot,
            closestDist: Number.POSITIVE_INFINITY,
            closest: null
        };

        this._friends.reduce(reduceToVisibleAlertFriend, accumulator);

        return accumulator.closest;
    }

    _lookForTarget() {
        if (this._behaviour === this._behaviours.lookingForTarget)
            return; // do not reset
        this._behaviour = this._behaviours.lookingForTarget;
        this._behaviour.reset(this._target);
    }

    _lookForFriend(friend) {
        if (this._behaviour === this._behaviours.lookingForFriend
            && this._behaviour._target === friend)
            return; // do not reset

        this._behaviour = this._behaviours.lookingForFriend;
        this._behaviour.reset(friend);
    }
}