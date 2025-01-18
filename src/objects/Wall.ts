import { Container, ContainerChild, Graphics } from "pixi.js";
import { ICollider } from "../contracts/Colliders";
import { IActiveGameObject, IGameObject } from "../contracts/Objects";
import { Vector } from "../math/Vector";
import { Collider } from "../colliders/Collider";
import { ICircle, IEllipse, IPolygon, IRectangle, IShape, Shape } from "../contracts/Shapes";

export class Wall implements IGameObject {
    public visuals: Container<ContainerChild> | Graphics;
    public position: Vector;
    public collider?: ICollider | undefined;
    public angle: number;
    
    constructor (shape: IRectangle|ICircle|IEllipse|IPolygon, position: Vector, angle: number) {
        this.visuals = this.createVisualForShape(shape);

        this.visuals.rotation = angle;
        this.visuals.position.x = position.x;
        this.visuals.position.y = position.y;

        this.position = position.copy();
        this.angle = angle;
        this.collider = new Collider(this, shape, this.position, angle, ['wall']);
    }

    public isActive(): this is IActiveGameObject
    {
        return false;
    }

    private createVisualForShape(shape: IShape): Graphics {
        if(shape.type === Shape.RECTANGLE) {
            const rectangle = <IRectangle>shape;
            const visual = (new Graphics())
            .rect(0, 0, rectangle.width, rectangle.height)
            .fill(0xffffff);
            visual.pivot.x = rectangle.width/2;
            visual.pivot.y = rectangle.height/2;
            return visual;
        }

        if(shape.type === Shape.CIRCLE) {
            const circle = <ICircle>shape;
            const visual = (new Graphics())
            .circle(0, 0, circle.radius)
            .fill(0xffffff);
            // visual.pivot.x = circle.radius/2;
            // visual.pivot.y = circle.radius/2;
            return visual;
        }

        throw new Error('Cannot create wall visual for this shape');
    }
}