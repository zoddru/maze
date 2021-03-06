import Path from '../Path';

const defaultSettings = {
    lookWait: 500,
    alertWait: 1000
};

Object.freeze(defaultSettings);


export class Behaviour {
    constructor(robot) {
        this.robot = robot;
    }

    reset() { }

    update() { }

    setNewTarget() { }

    draw() { }

    static get DefaultSettings() {
        return defaultSettings;
    }
}

export class BeStill extends Behaviour {
    constructor(robot) {
        super(robot);
        Object.freeze(this);
    }
}

export class FollowPath extends Behaviour {
    constructor(robot, onDone) {
        super(robot);
        this._onDone = onDone || (r => r.stayPut());
        this._path = null;
        Object.seal(this);
    }

    reset(node) {
        const robot = this.robot;
        this._path = robot.graph.findPath(robot._targetNode, node);

        if (this._path.length < 2)
            return;

        if (robot._lastNode === this._path[1]) {
            robot._lastNode = this._path.shift();
            robot._setTarget(this._path[0]);
        }

        if (this._path.length < 2)
            return;

        if (robot.targetVector.length === 0) {
            robot._lastNode = this._path.shift();
            robot._setTarget(this._path[0]);
        }
    }

    update(args) {
        this.robot._move(args);
    }

    setNewTarget() {
        const robot = this.robot;
        let last = this._path.shift(); // this should === this._targetNode
        let next = this._path[0];

        if (!next) {
            next = last;
            this._done(); // done
        }

        robot._setTarget(next);
        robot._setNode(last);
    }

    draw(ctx) {
        if (this._path) {
            new Path(this._path).draw(ctx);
        }
    }

    _done() {
        if (this._onDone)
            this._onDone(this.robot);
    }
}

export class Follow extends Behaviour {
    constructor(robot, onDone) {
        super(robot);

        const self = this;
        onDone = onDone || (r => self.reset(self._target));

        this._target = null;
        this._targetNode = null;
        this._followPath = new FollowPath(robot, onDone);
        Object.seal(this);
    }

    reset(target) {
        this._target = target;
        this._targetNode = target.closestNode;

        this._followPath.reset(this._targetNode);
    }

    update(args) {
        const targetNode = this._target.closestNode;
        if (targetNode !== this._targetNode) {
            this._targetNode = targetNode;
            this._followPath.reset(targetNode);
        }
        
        this._followPath.update(args);
    }

    setNewTarget() {
        this._followPath.setNewTarget();
    }

    draw(ctx) {
        this._followPath.draw(ctx);
    }
}

export class RandomPath extends Behaviour {
    constructor(robot) {
        super(robot);
        Object.freeze(this);
    }

    update(args) {
        this.robot._move(args);
    }

    setNewTarget() {
        const robot = this.robot;

        let inverse = robot._edge && robot._edge.inverse;
        let newEdge = robot._targetNode.randomEdge([inverse]) || inverse; // ignore the reverse of the previous edge, if there was one (unless we have no choice)

        if (!newEdge)
            return; // done, nowhere to go

        let lastNode = robot._targetNode;
        robot._setTarget(newEdge.node, newEdge);
        robot._setNode(lastNode);
    }
}

export class ToIntersection extends Behaviour {
    constructor(robot, onDone) {
        super(robot);
        this._onDone = onDone || (r => r.lookAround());
        Object.freeze(this);
    }

    update(args) {
        this.robot._move(args);
    }

    setNewTarget() {
        if (this.robot.closestNode.isIntersection) {
            this._done();
        }
        else {
            RandomPath.prototype.setNewTarget.apply(this, arguments); // extend random path
        }
    }

    _done() {
        this._onDone(this.robot);
    }
}

export class LookAround extends Behaviour {
    constructor(robot, settings, onDone) {
        super(robot);

        settings = Object.assign({}, defaultSettings, settings || {});

        Object.defineProperties(this, {
            settings: { value: settings }
        });

        this._onDone = onDone || (r => r.walkToIntersection());
        this._node = null;
        this._time = 0;
        this._edgesToVisit = 0;
        this._visitedEdges = [];
        Object.seal(this);
    }

    reset({ node = null, visitedEdges = [] }) {
        this._node = node || this.robot.closestNode;
        this._visitedEdges = visitedEdges;
        this._edgesToVisit = (this._node.edges.length - visitedEdges.length);
        this._lookElsewhere();
    }

    update(args) {
        const iteration = args.iteration || 0;

        if (iteration > 1) {
            console.log('LookAround.update - too many iterations');
            args.iteration = 0;
            return;
        }

        const robot = this.robot;
        const closestEdges = this._node.edges;

        if (!closestEdges.length)
            return;

        const lookWait = this.settings.lookWait;
        this._time += args.diff;

        if (this._time <= lookWait)
            return;

        const over = this._time - lookWait;

        if (over < 0)
            return; // still have to wait

        if (this._visitedEdges.length > this._edgesToVisit) {
            this._done();
        }
        else {
            this._lookElsewhere();
        }

        robot.update({ diff: over, iteration: iteration + 1 });
    }

    _lookElsewhere() {
        this._time = 0;
        const nextEdge = this._node.randomEdge(this._visitedEdges);
        this._visitedEdges.push(nextEdge);
        this.robot.lookAt(nextEdge.node);
    }

    _done() {
        this._onDone(this.robot);
    }
}

export class Wait extends Behaviour {
    constructor(robot, settings, onDone) {
        super(robot);

        settings = Object.assign({}, defaultSettings, settings || {});

        Object.defineProperties(this, {
            settings: { value: settings }
        });

        this._onDone = onDone || (r => r.randomWalk());
        this._time = 0;
        Object.seal(this);
    }

    reset() {
        this._time = 0;
    }

    update(args) {
        const iteration = args.iteration || 0;

        if (iteration > 1) {
            console.log('Waiting.update - too many iterations');
            args.iteration = 0;
            return;
        }

        this._time += args.diff;

        const alertWait = this.settings.alertWait;

        if (this._time <= alertWait)
            return;

        const over = this._time - alertWait;

        if (over < 0)
            return; // still have to wait

        this._done();

        this.robot.update({ diff: over, iteration: iteration + 1 });
    }

    _done() {
        this._onDone(this.robot);
    }
}

export class Patrol extends Behaviour {
    constructor(robot, settings) {
        super(robot);

        const self = this;
        const lookAround = new LookAround(robot, settings, r => {
            self._behaviour = toIntersection;
        });
        const toIntersection = new ToIntersection(robot, r => {
            self._behaviour = lookAround;
            let inverse = r._edge && r._edge.inverse;
            lookAround.reset({ visitedEdges: [inverse] });
        });
        this._behaviour = toIntersection;

        Object.seal(this);
    }

    update(args) {
        this._behaviour.update(args);
    }

    setNewTarget() {
        this._behaviour.setNewTarget();
    }
}