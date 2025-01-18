import { Box, Circle, Ellipse, Polygon } from "detect-collisions";
import { ICollider, ICollisionData } from "../contracts/Colliders";
import { IActiveGameObject, IGameObject,  } from "../contracts/Objects";
import {ICircle, ICurveablePolygon, IEllipse, IPolygon, IRectangle, IShape, Shape} from "../contracts/Shapes";
import { Vector } from "../math/vector/Vector";
import { CollisionService } from "../services/CollisionService";
import { MathUtils } from "../math/MathUtils";

export class Collider implements ICollider {
    public isStatic: boolean;
    public shape: IShape;
    public owner: IGameObject|IActiveGameObject;
    public tags: string[];
    private body: Box|Circle|Ellipse|Polygon|undefined;

    constructor(owner: IGameObject, shape: IShape, position: Vector, angle: number, tags: Array<string> = [], isStatic: boolean = false) {
        this.owner = owner;
        this.shape = shape;
        this.tags = tags;
        this.isStatic = isStatic;
        this.register(shape, position, angle);
    }
    
    public hasTag(tag: string): boolean {
        return this.tags.includes(tag);
    }

    public setPosition(position: Vector): void {
        this.body?.setPosition(position.x, position.y);
    }

    public setAngle(angle: number): void {
        this.body?.setAngle(angle);
        this.body?.updateBody();
    }

    public destroy(): void {
        if(!this.body) {
            console.warn('body was already destroyed');
            return;
        }
        CollisionService.instance.removeBody(this.body);
    }

    private register(shape: IShape, position: Vector, angle: number): void {
        const options = {
            angle: angle,
            isCentered: false,
            isStatic: this.isStatic,
            userData: {
                collider: this,
            }
        }

        if(shape.type === Shape.CIRCLE) {
            const circle = <ICircle>shape;
            this.body = new Circle(position.toPoint(), circle.radius, options)
        }

        if(shape.type === Shape.ELLIPSE) {
            const ellipse = <IEllipse>shape;
            this.body = new Ellipse(position.toPoint(), ellipse.radius.x, ellipse.radius.y, 10, options);
        }

        if(shape.type === Shape.RECTANGLE) {
            options.isCentered = true;
            const rectangle = <IRectangle>shape;
            this.body = new Box(position.toPoint(), rectangle.width, rectangle.height, options);
        }

        if(shape.type === Shape.POLYGON) {
            const polygon = <IPolygon>shape;
            this.body = new Polygon(position.toPoint(), polygon.points, options);
        }

        if(shape.type === Shape.CURVABLEPOLYGON) {
            const polygon = MathUtils.convertCurveablePolygonToStraightLinedPolygon(<ICurveablePolygon>shape);
            this.body = new Polygon(position.toPoint(), polygon.points, options);
        }

        if(!this.body) {
            throw new Error('Failed to register collider');
        }

        CollisionService.instance.registerBody(this.body);
    }

    public handleCollision(collider: ICollider, data: ICollisionData): void {
        if(this.owner.isActive()) {
            this.owner.onCollision(collider, data);
        }
    }
}