import { DefinedShape, ICircle, ICurveablePoint, ICurveablePolygon, IEllipse, IPolygon, IPolygonPoint, IRectangle, Shape } from "../contracts/Shapes";
import { Vector } from "../math/vector/Vector";

export type ShapePresetName =
    'circle' |
    'square' |
    'triangle' |
    'pentagon' |
    'hexagon' |
    'heptagon' |
    'octagon' |
    'star'
    ;

export class ShapeFactory {
    public static createRectangle(width: number, height: number, scale: number = 1): IRectangle
    {
        return {
            type: Shape.RECTANGLE,
            width: width * scale,
            height: height * scale,
        };
    }

    public static createCircle(radius: number, scale: number = 1): ICircle
    {
        return {
            type: Shape.CIRCLE,
            radius: radius * scale,
        };
    }

    public static createEllipse(xRadius: number, yRadius: number, scale: number = 1): IEllipse
    {
        return {
            type: Shape.ELLIPSE,
            radius: {
                x: xRadius * scale,
                y: yRadius * scale
            },
        };
    }

    public static createPolygon(points: Array<IPolygonPoint>, scale: number = 1): IPolygon
    {
        const scaledPoints = points.map((point) => {
            return <IPolygonPoint>{
                x: point.x * scale,
                y: point.y * scale
            }
        });

        return {
            type: Shape.POLYGON,
            points: scaledPoints,
        };
    }

    public static createCurvablePolygon(points: Array<ICurveablePoint>, scale: number = 1): ICurveablePolygon
    {
        const scaledPoints = points.map((point) => {
            const copiedPoint = <IPolygonPoint>JSON.parse(JSON.stringify(point));
            copiedPoint.x = point.x * scale;
            copiedPoint.y = point.y * scale;
            return copiedPoint;
        });

        return {
            type: Shape.CURVABLEPOLYGON,
            points: scaledPoints,
        };
    }

    public static createRegularShape(points: number, radius: number, scale: number = 1): IPolygon {
        if(points < 3) {
            throw new Error('Not enough points. Need at least 3');
        }

        const stepSize = 360 / points;

        const polygonPoints: Array<IPolygonPoint> = [];
        let currentStepSize = stepSize;
        for (let i = 0; i < points; i++) {
            const direction = Vector.fromAngle(Vector.utils.degreesToRadians(currentStepSize+180)).normalize();
            let distanceFromCenter = radius;
            const newPoint = <IPolygonPoint>direction.scale(distanceFromCenter).toPoint();
            polygonPoints.push(newPoint);
            currentStepSize += stepSize;
        }
        return ShapeFactory.createPolygon(polygonPoints, scale);
    }

    public static createStar(points: number, radius: number, innerRadius: number, scale: number = 1): IPolygon {
        if(points < 3) {
            throw new Error('Not enough points to create a star. Need at least 3');
        }

        const steps = points * 2;
        const stepSize = 360 / steps;

        const polygonPoints: Array<IPolygonPoint> = [];
        let currentStepSize = stepSize;
        for (let i = 1; i < steps+1; i++) {
            const direction = Vector.fromAngle(Vector.utils.degreesToRadians(currentStepSize)).normalize();
            const even = i % 2 === 0;
            let distanceFromCenter = radius;
            if(even) {
                distanceFromCenter = innerRadius;
            }
            const newPoint = <IPolygonPoint>direction.scale(distanceFromCenter).toPoint();
            polygonPoints.push(newPoint);
            currentStepSize += stepSize;
        }
        return ShapeFactory.createPolygon(polygonPoints, scale);
    }

    public static getPreset(shape: ShapePresetName, scale: number = 1): DefinedShape {
        if(shape === 'circle') {
            return ShapeFactory.getPresetCircle(scale);
        }

        if(shape === 'square') {
            return ShapeFactory.getPresetSquare(scale);
        }

        if(shape === 'star') {
            return ShapeFactory.getPresetStar(scale);
        }

        if(shape === 'triangle') {
            return ShapeFactory.getPresetTriangle(scale);
        }

        if(shape === 'pentagon') {
            return ShapeFactory.getPresetPentagon(scale);
        }

        if(shape === 'hexagon') {
            return ShapeFactory.getPresetHexagon(scale);
        }

        if(shape === 'heptagon') {
            return ShapeFactory.getPresetHeptagon(scale);
        }

        if(shape === 'octagon') {
            return ShapeFactory.getPresetOctagon(scale);
        }

        throw new Error('There is no preset for shape '+ shape);
    }

    private static getPresetCircle(scale: number): ICircle {
        return ShapeFactory.createCircle(40, scale);
    }

    private static getPresetSquare(scale: number): IRectangle {
        return ShapeFactory.createRectangle(75, 75, scale);
    }

    private static getPresetStar(scale: number): IPolygon {
        return ShapeFactory.createStar(5, 50, 25, scale);
    }

    private static getPresetTriangle(scale: number): IPolygon {
        return ShapeFactory.createRegularShape(3, 50, scale);
    }

    private static getPresetPentagon(scale: number): IPolygon {
        return ShapeFactory.createRegularShape(5, 50, scale);
    }

    private static getPresetHexagon(scale: number): IPolygon {
        return ShapeFactory.createRegularShape(6, 50, scale);
    }

    private static getPresetHeptagon(scale: number): IPolygon {
        return ShapeFactory.createRegularShape(7, 50, scale);
    }

    private static getPresetOctagon(scale: number): IPolygon {
        return ShapeFactory.createRegularShape(7, 50, scale);
    }
}