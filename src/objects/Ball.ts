import { Container, ContainerChild, Graphics } from "pixi.js";
import { ICollisionData, ICollider } from "../contracts/Colliders";
import { IActiveGameObject } from "../contracts/Objects";
import { Vector } from "../math/vector/Vector";
import { Shape } from "../contracts/Shapes";
import { Scene } from "../pixi/Scene";
import { Collider } from "../colliders/Collider";

export class Ball implements IActiveGameObject {
    public visuals: Container<ContainerChild> | Graphics;
    public momentum: Vector;
    public collider?: ICollider | undefined;
    public drag: number;
    public collisionDrag: number;
    public angle: number = 0;

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

    constructor (scene: Scene, x: number, y: number, radius: number) {
            this.visuals = (new Graphics())
            .circle(0, 0, radius)
            .fill(0x0000ff);
            scene.add(this.visuals);
    
            this.visuals.position.x = x;
            this.visuals.position.y = y;

            this.momentum = Vector.empty();
            this.drag = 0.0001;
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

    public update(deltaTime: number): void {
        this.position = this.position.add(this.momentum.scale(deltaTime));

        // drag
        if(this.momentum.length !== 0) {
            this.momentum = this.momentum.subtractLength(this.drag * deltaTime);
        }
    }

    public onCollision(collider: ICollider, data: ICollisionData): void {
        if(collider.hasTag('wall')) {
            // touching wall

            // get the overlap into a vector
            const overlapVector = Vector.fromPoint(data.overlapV);
            // calculate the position this object should have to negate the collision
            const negatedPosition = this.position.subtract(overlapVector);

            if(this.momentum.length > 0) {
                // calculate the difference (transformation) from current position to negated position
                const negatedDiff = negatedPosition.subtract(this.position);
                // bounce the momentum off the line of the collision object
                this.momentum = this.momentum.bounceOffLine(negatedDiff.perpendicular2D());

                // add extra drag
                if(this.momentum.length !== 0) {
                    this.momentum = this.momentum.subtractLength(this.collisionDrag);
                }
            }

            // move the ball outside of the wall
            this.position = negatedPosition;
        }
    }

    public launch(target: Vector, magnitude: number) {
        const direction = target.subtract(this.position).normalize();

        this.momentum = direction.scale(magnitude/1500);
    }
}