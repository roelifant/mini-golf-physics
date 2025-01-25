import { Container, ContainerChild, Graphics } from "pixi.js";
import { ICollider } from "../contracts/Colliders";
import { IActiveGameObject, IGameObject, ITriggerGameObject } from "../contracts/Objects";
import { Vector } from "../math/vector/Vector";
import { DefinedShape, ICircle, ICurveablePolygon, IEllipse, IPolygon, IRectangle, IShape, Shape } from "../contracts/Shapes";

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

    public isTrigger(): this is ITriggerGameObject
    {
        return false;
    }

    private createVisualForShape(shape: IShape): Graphics {
        // copy shape to avoid issues with shared references
        shape = JSON.parse(JSON.stringify(shape));

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

        if(shape.type === Shape.CURVABLEPOLYGON) {
            const polygon = <ICurveablePolygon>shape;
            return this.createCurveablePolygonVisual(polygon);
        }

        throw new Error('Cannot create wall visual for this shape');
    }

    private createCurveablePolygonVisual(shape: ICurveablePolygon): Graphics
    {
        const visual = (new Graphics());
            const points = shape.points;
            let firstPoint = points.shift();

            if(!firstPoint) {
                throw new Error('Cannot create curveable polygon');
            }

            // shift array untill the first point is not control point
            while(firstPoint.hasOwnProperty('control') && firstPoint.control) {
                points.push(firstPoint);
                firstPoint = points.shift()!;
            }
            
            visual.moveTo(firstPoint.x, firstPoint.y);

            for (let i = 0; i < points.length; i++) {
                const point = points[i];
                let nextPoint = points[i+1];
                if(!nextPoint) {
                    nextPoint = firstPoint;
                }

                if(
                    (point.hasOwnProperty('control') && point.control) &&
                    (!nextPoint.hasOwnProperty('control') || !nextPoint.control)
                    
                ){
                    visual.bezierCurveTo(point.x, point.y, point.x, point.y, nextPoint.x, nextPoint.y);
                    i++;
                    continue;
                }

                let nextPoint2 = points[i+2];
                if(!nextPoint2) {
                    nextPoint2 = firstPoint;
                }

                if(
                    (point.hasOwnProperty('control') && point.control) &&
                    (nextPoint.hasOwnProperty('control') && nextPoint.control) &&
                    (!nextPoint2.hasOwnProperty('control') || !nextPoint2.control)
                    
                ){
                    visual.bezierCurveTo(point.x, point.y, nextPoint.x, nextPoint.y, nextPoint2.x, nextPoint2.y);
                    i+= 2;
                    continue;
                }

                visual.lineTo(point.x, point.y);
            }

            visual.fill(this.color);
            return visual;
    }
}