import { Container, ContainerChild, Graphics } from "pixi.js";
import { ICollider } from "../contracts/Colliders";
import { IActiveGameObject, IGameObject } from "../contracts/Objects";
import { Vector } from "../math/Vector";
import { DefinedShape, ICircle, IEllipse, IPolygon, IRectangle, IShape, Shape } from "../contracts/Shapes";

export abstract class StaticShapeObject implements IGameObject {
    public visuals: Container<ContainerChild> | Graphics;
    public position: Vector;
    public collider?: ICollider | undefined;
    public angle: number;
    public color: number;
    
    constructor (shape: DefinedShape, position: Vector, angle: number, color: number = 0x000000) {
        this.color = color;
        this.visuals = this.createVisualForShape(shape);

        this.visuals.rotation = angle;
        this.visuals.position.x = position.x;
        this.visuals.position.y = position.y;

        this.position = position.copy();
        this.angle = angle;
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
            .fill(this.color);
            visual.pivot.x = rectangle.width/2;
            visual.pivot.y = rectangle.height/2;
            return visual;
        }

        if(shape.type === Shape.CIRCLE) {
            const circle = <ICircle>shape;
            const visual = (new Graphics())
            .circle(0, 0, circle.radius)
            .fill(this.color);
            return visual;
        }

        if(shape.type === Shape.ELLIPSE) {
            const ellipse = <IEllipse>shape;
            const visual = (new Graphics())
            .ellipse(0, 0, ellipse.radius.x, ellipse.radius.y)
            .fill(this.color);
            return visual;
        }

        if(shape.type === Shape.POLYGON) {
            const polygon = <IPolygon>shape;
            const visual = (new Graphics())
            .poly(polygon.points)
            .fill(this.color);
            return visual;
        }

        throw new Error('Cannot create wall visual for this shape');
    }
}