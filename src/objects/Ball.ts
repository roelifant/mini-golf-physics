import { Container, ContainerChild, Graphics } from "pixi.js";
import { ICollisionData, ICollider } from "../contracts/Colliders";
import { IActiveGameObject, ITriggerGameObject } from "../contracts/Objects";
import { Vector } from "../math/vector/Vector";
import { Shape } from "../contracts/Shapes";
import { Scene } from "../pixi/Scene";
import { Collider } from "../colliders/Collider";
import { GameService } from "../services/GameService";
import { MouseListener } from "../listeners/MouseListener";
import { BreakableWall } from "./BreakableWall";

export class Ball implements IActiveGameObject, ITriggerGameObject {
    public visuals: Container<ContainerChild> | Graphics;
    public momentum: Vector;
    public collider?: ICollider | undefined;
    public drag: number;
    public collisionDrag: number;
    public angle: number = 0;
    public arrowContainer: Container = new Container();

    private timeToForce = 1200;
    private maxForce: number = 1.5;
    private trail: Container = new Container();
    private arrow: Graphics = new Graphics();

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
        return this.momentum.length === 0;
    }

    constructor(scene: Scene, position: Vector, radius: number) {
        // make ball
        const ball = (new Graphics())
            .circle(0, 0, radius)
            .fill(0x0000ff);

        // make trail
        const trailSegment1 = (new Graphics())
            .rect(0, 0, radius * 2, radius / 2)
            .fill(0x0000ff);
        this.trail.addChild(trailSegment1);
        const trailSegment2 = (new Graphics())
            .rect(0, 0, radius * 2, radius)
            .fill(0x0000ff);
        trailSegment2.alpha = 0.2;
        this.trail.addChild(trailSegment2);
        const trailSegment3 = (new Graphics())
            .rect(0, 0, radius * 2, (radius / 2) * 3)
            .fill(0x0000ff);
        trailSegment3.alpha = 0.2;
        this.trail.addChild(trailSegment3);
        const trailSegment4 = (new Graphics())
            .rect(0, 0, radius * 2, radius * 2)
            .fill(0x0000ff);
        trailSegment4.alpha = 0.2;
        this.trail.addChild(trailSegment4);
        const trailSegment5 = (new Graphics())
            .rect(0, 0, radius * 2, radius * 3)
            .fill(0x0000ff);
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
            .fill(0x0000ff);
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

        this.trail.angle += 1;

        this.position = this.position.add(this.momentum.scale(deltaTime));

        if (this.canLaunch) {
            this.arrowContainer.position = this.position.copy();
            this.handleArrow();
            this.hideTrail();
            return;
        }
        this.hideArrow();

        // drag
        this.momentum = this.momentum.subtractLength(this.drag * deltaTime);

        // trail
        if (this.momentum.length < .2) {
            this.hideTrail();
            return;
        }
        this.handleTrail();
    }

    public onCollision(collider: ICollider, data: ICollisionData): void {
        if (collider.hasTag('wall')) {
            // touching wall

            // get the overlap into a vector
            const overlapVector = Vector.fromPoint(data.overlapV);
            // calculate the position this object should have to negate the collision
            const negatedPosition = this.position.subtract(overlapVector);

            if (this.momentum.length > 0) {
                // calculate the difference (transformation) from current position to negated position
                const negatedDiff = negatedPosition.subtract(this.position);
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
    }

    public launch(target: Vector, magnitude: number) {
        let force = magnitude / this.timeToForce;
        if (force > this.maxForce) {
            force = this.maxForce;
        }
        const direction = target.subtract(this.position).normalize();

        this.momentum = direction.scale(force);
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
}