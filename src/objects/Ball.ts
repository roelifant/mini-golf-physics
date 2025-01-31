import { Container, ContainerChild, Graphics } from "pixi.js";
import { ICollisionData, ICollider } from "../contracts/Colliders";
import { IActiveGameObject, ITriggerGameObject } from "../contracts/Objects";
import { Vector } from "../math/vector/Vector";
import { Shape } from "../contracts/Shapes";
import { Scene } from "../pixi/Scene";
import { Collider } from "../game/Collider";
import { GameService } from "../services/GameService";
import { MouseListener } from "../listeners/MouseListener";
import { BreakableWall } from "./BreakableWall";
import { MiniGolfScene } from "../scenes/MinigolfScene";
import { Point } from "./Point";
import { Player } from "../game/Player";
import { Hole } from "./Hole";

export class Ball implements IActiveGameObject, ITriggerGameObject {
    public visuals: Container<ContainerChild> | Graphics;
    public momentum: Vector;
    public collider?: ICollider | undefined;
    public drag: number;
    public collisionDrag: number;
    public angle: number = 0;
    public arrowContainer: Container = new Container();
    public color: number;
    public hit: boolean = false;
    public owner: Player|undefined;
    public inHole: boolean = false;

    private timeToForce = 1200;
    private maxForce: number = 1.5;
    private trail: Container = new Container();
    private arrow: Graphics = new Graphics();
    private hasBeenLaunched: boolean = false;
    private controlling: boolean = false;
    private holeVanishingPoint: Vector = Vector.empty();

    public get position(): Vector {
        return new Vector(this.visuals.position.x, this.visuals.position.y);
    }

    public set position(value: Vector) {
        this.visuals.position.x = value.x;
        this.visuals.position.y = value.y;
        this.collider?.setPosition(value);
    }

    public get x(): number {
        return this.visuals.position.x;
    }

    public set x(value: number) {
        this.visuals.position.x = value;
        this.collider?.setPosition(new Vector(value, this.position.y));
    }

    public get y(): number {
        return this.visuals.position.y;
    }

    public set y(value: number) {
        this.visuals.position.y = value;
        this.collider?.setPosition(new Vector(this.position.x, value));
    }

    public get canLaunch(): boolean {
        return this.momentum.length === 0 && !this.hasBeenLaunched && this.controlling;
    }

    constructor(scene: Scene, position: Vector, radius: number, color: number) {
        this.color = color;

        // make ball
        const ball = (new Graphics())
            .circle(0, 0, radius)
            .fill(this.color);

        // make trail
        const trailSegment1 = (new Graphics())
            .rect(0, 0, radius * 2, radius / 2)
            .fill(this.color);
        this.trail.addChild(trailSegment1);
        const trailSegment2 = (new Graphics())
            .rect(0, 0, radius * 2, radius)
            .fill(this.color);
        trailSegment2.alpha = 0.2;
        this.trail.addChild(trailSegment2);
        const trailSegment3 = (new Graphics())
            .rect(0, 0, radius * 2, (radius / 2) * 3)
            .fill(this.color);
        trailSegment3.alpha = 0.2;
        this.trail.addChild(trailSegment3);
        const trailSegment4 = (new Graphics())
            .rect(0, 0, radius * 2, radius * 2)
            .fill(this.color);
        trailSegment4.alpha = 0.2;
        this.trail.addChild(trailSegment4);
        const trailSegment5 = (new Graphics())
            .rect(0, 0, radius * 2, radius * 3)
            .fill(this.color);
        trailSegment5.alpha = 0.2;
        this.trail.addChild(trailSegment5);
        this.trail.alpha = 0;
        this.trail.pivot.x = radius;
        this.trail.pivot.y = 0;

        // make arrow
        this.arrow
            .poly([
                {x: -10, y: 0},
                {x: 10, y: 0},
                {x: 0, y: -10},
            ])
            .fill(this.color);
        this.arrowContainer.addChild(this.arrow);
        this.arrowContainer.pivot.y = radius + 10;

        // combine visuals
        this.visuals = new Container;
        this.visuals.addChild(ball);
        this.visuals.addChild(this.trail);
        scene.add(this.visuals);

        this.visuals.position.x = position.x;
        this.visuals.position.y = position.y;

        this.momentum = Vector.empty();
        this.drag = 0.00015;
        this.collisionDrag = 0.03;

        const shape = {
            type: Shape.CIRCLE,
            radius
        }
        this.collider = new Collider(this, shape, this.position, 0, ['ball']);
    }

    public isActive(): this is IActiveGameObject {
        return true;
    }

    public isTrigger(): this is ITriggerGameObject
    {
        return true;
    }

    public update(deltaTime: number): void {

        // drag
        if(this.momentum.length !== 0) {
            this.momentum = this.momentum.subtractLength(this.drag * deltaTime);
        }

        if(this.inHole) {
            // get distance from hole center
            this.position = this.position.moveTowards(this.holeVanishingPoint, this.momentum.scale(deltaTime).length);

            if(
                this.position.isNear(this.holeVanishingPoint, 5) &&
                this.hasBeenLaunched &&
                this.controlling
            ) {
                this.visuals.alpha = 0;
                this.endTurn();
                return;
            
            }
            const distance = this.position.distance(this.holeVanishingPoint);
            const maxDistance = 45;
            const scale = (distance / maxDistance) + 0.3;
            const opacity = (distance / maxDistance);
            this.visuals.scale = scale;
            this.visuals.alpha = opacity;

            return;
            
        }

        this.position = this.position.add(this.momentum.scale(deltaTime));

        if (this.canLaunch) {
            this.arrowContainer.position = this.position.copy();
            this.handleArrow();
            this.hideTrail();
            return;
        }
        this.hideArrow();

        // end turn if needed
        if(this.momentum.length == 0){
            this.hit = false;
            if(this.hasBeenLaunched && this.controlling) {
                this.endTurn();
            }
        }

        // trail
        if (this.momentum.length < .2) {
            this.hideTrail();
            return;
        }
        this.handleTrail();
    }

    public onCollision(collider: ICollider, data: ICollisionData): void {
        if (collider.hasTag('wall')) {
            this.handleWallCollision(collider, data);
            return;
        }

        if(collider.hasTag('ball') && (this.controlling || this.hit)) {
            this.handleBallCollision(collider, data);
            return;
        }

        if(collider.hasTag('point') && this.momentum.length > 0) {
            this.handlePointCollision(collider);
        }

        if(collider.hasTag('hole') && (data.insideOther || data.overlap > 25) && !this.inHole) {
            const hole = <Hole>collider.owner;
            this.handleHole(hole);
        }
    }

    public launch(target: Vector, magnitude: number) {
        let force = magnitude / this.timeToForce;
        if (force > this.maxForce) {
            force = this.maxForce;
        }
        const direction = target.subtract(this.position).normalize();

        this.momentum = direction.scale(force);
        this.hasBeenLaunched = true;
    }

    public control() {
        this.controlling = true;
    }

    private hideTrail() {
        this.trail.alpha = 0;
    }

    private handleTrail() {
        const maxLength = 15;
        const maxVisibility = 15;
        let length = this.momentum.length * 2.5;
        if (length > maxLength) {
            length = maxLength;
        }

        const angle = this.momentum.toAngle();
        this.trail.rotation = angle;
        this.trail.alpha = length / maxVisibility;
        this.trail.scale.y = length / 2;
    }

    private hideArrow() {
        this.arrow.alpha = 0;
    }

    private handleArrow() {
        // angle
        const mousePosition = GameService.instance.worldMousePosition;
        const direction = mousePosition.subtract(this.position).normalize();
        const angle = direction.toAngle();
        this.arrowContainer.rotation = angle;
        
        const mouseDownSince = MouseListener.downSince;
        if(mouseDownSince === null) {
            this.arrow.scale.x = 1;
            this.arrow.scale.y = 1;
            this.arrow.alpha = 0.3;
            return;
        }

        const downFor = Date.now() - mouseDownSince;
        let force = (downFor / this.timeToForce);
        if(force > this.maxForce) {
            force = this.maxForce;
        }
        const forceScale = force / this.maxForce;
        const alphaRest = (((forceScale)/10)*4);
        this.arrow.alpha = .3 + alphaRest;
        this.arrow.scale.x = 1 + (forceScale*.5);
        this.arrow.scale.y = 1 + (forceScale * 15);
    }

    private handleWallCollision(collider: ICollider, data: ICollisionData) {
        // touching wall

        // get the overlap into a vector
        const overlapVector = Vector.fromPoint(data.overlapV);
        // calculate the position this object should have to negate the collision
        const negatedPosition = this.position.subtract(overlapVector);
        // calculate the difference (transformation) from current position to negated position
        const negatedDiff = negatedPosition.subtract(this.position);

        if (this.momentum.length > 0 && negatedDiff.length > 0) {
            // bounce the momentum off the line of the collision object
            this.momentum = this.momentum.bounceOffLine(negatedDiff.perpendicular2D());

            // add extra drag
            if (this.momentum.length !== 0) {
                this.momentum = this.momentum.subtractLength(this.collisionDrag);
            }
        }

        // move the ball outside of the wall
        this.position = negatedPosition;

        if(collider.hasTag('breakable')) {
            const wall = <BreakableWall>collider.owner;
            wall.hit();
        }
    }

    private handleBallCollision(collider: ICollider, data: ICollisionData) {
        // get the overlap into a vector
        const overlapVector = Vector.fromPoint(data.overlapV);
        // calculate the position this object should have to negate the collision
        const negatedPosition = this.position.subtract(overlapVector);
        // calculate the difference (transformation) from current position to negated position
        const negatedDiff = negatedPosition.subtract(this.position);

        if (this.momentum.length > 0 && negatedDiff.length > 0) {
            const startSpeed = this.momentum.length;
            // bounce the momentum off the line of the collision object
            let bounceOffVector = this.momentum.bounceOffLine(negatedDiff.perpendicular2D());

            // add extra drag
            if (this.momentum.length !== 0) {
                this.momentum = this.momentum.divide(2).subtractLength(this.collisionDrag);
                bounceOffVector = bounceOffVector.divide(2).subtractLength(this.collisionDrag);
            }
            // divide by two
            this.momentum = this.momentum.add(bounceOffVector);
            // add momentum to other ball
            const otherBall = <Ball>collider.owner;
            const otherBallExtraMomentum = negatedDiff.opposite().setLength(1).scale(startSpeed).subtractLength(this.collisionDrag);
            otherBall.momentum = otherBall.momentum.add(otherBallExtraMomentum);
            otherBall.hit = true;
        }

        // move the ball outside of the wall
        this.position = negatedPosition;
    }

    private handlePointCollision(collider: ICollider) {
        const point = <Point>collider.owner;
        point.hit(this.owner!);
    }

    private handleHole(hole: Hole) {
        hole.claim(this.owner!);
        this.inHole = true;
        this.holeVanishingPoint = this.position.reflectOverPoint(hole.position);
        this.momentum = hole.position.subtract(this.holeVanishingPoint).setLength(this.momentum.length);
    }

    private endTurn() {
        this.momentum = Vector.empty();
        this.controlling = false;
        this.hasBeenLaunched = false;
        (<MiniGolfScene>GameService.instance.scene).waitForTurnToEnd();
    }
}