import { ICurveablePoint, ICurveablePolygon, IPolygon, IPolygonPoint, Shape } from "../contracts/Shapes";
import { IPoint } from "./vector/VectorInterfaces";

export class MathUtils {
    /**
     * Convert degrees to radians
     * 
     * @param degrees 
     * @returns radians
     */
    public static degreesToRadians(degrees: number): number {
        return degrees * (Math.PI/180);
    }

    /**
     * Convert radians to degrees
     * 
     * @param radians 
     * @returns degrees
     */
    public static radiansToDegrees(radians: number): number {
        return radians * (180/Math.PI);
    }

    /**
     * returns casteljau point depending on position
     *
     * @param points
     * @param position
     */
    public static deCasteljau(points: Array<IPoint>, position: number = .5): IPoint {

        let a: IPoint, b: IPoint;
        let midPoints: Array<IPoint> = [];

        while (points.length > 1) {
            const number = points.length - 1;
            for (let i = 0; i < number; i++) {
                a = points[i];
                b = points[i + 1];
                midPoints.push({
                    x: a.x + ((b.x - a.x) * position),
                    y: a.y + ((b.y - a.y) * position)
                });
            }
            points = midPoints;
            midPoints = [];
        }

        return points[0];
    }

    static convertCubicBezierToPoints(
        start: IPoint,
        control1: IPoint,
        control2: IPoint,
        end: IPoint,
        steps: number = 10
    ): Array<IPoint> {
        let position = 0;
        const points: Array<IPoint> = [start];

        for (let i = 0; i < steps-1; i++) {
            position += (1 / steps);
            points.push(MathUtils.deCasteljau(
                [start, control1, control2, end],
                position
            ));
        }

        points.push(end);

        return points;
    }

    public static convertCurveablePolygonToStraightLinedPolygon(polygon: ICurveablePolygon, stepsPerCurve: number = 10): IPolygon
    {
        const points = <Array<ICurveablePoint>>JSON.parse(JSON.stringify(polygon.points));
        // shift array untill the first point is not control point
        let firstPoint = points.shift();
        if(!firstPoint) {
            throw new Error('polygon needs to have points');
        }
        while(firstPoint.hasOwnProperty('control') && firstPoint.control) {
            points.push(firstPoint);
            firstPoint = points.shift()!;
        }

        const newPoints = [];
        newPoints.push(firstPoint);

        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            let previousPoint = points[i-1];
            let nextPoint = points[i+1];
            if(!nextPoint) {
                nextPoint = firstPoint;
            }
            if(!previousPoint) {
                previousPoint = firstPoint;
            }

            if(
                (point.hasOwnProperty('control') && point.control) &&
                (!nextPoint.hasOwnProperty('control') || !nextPoint.control)
            ){
                MathUtils
                    .convertCubicBezierToPoints(previousPoint, point, point, nextPoint, stepsPerCurve)
                    .forEach(point => newPoints.push(point));
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
                MathUtils
                    .convertCubicBezierToPoints(previousPoint, point, nextPoint, nextPoint2, stepsPerCurve)
                    .forEach(point => newPoints.push(point));
                i+= 2;
                continue;
            }

            newPoints.push(point);
        }

        console.log(newPoints);

        return <IPolygon>{
            type: Shape.POLYGON,
            points: newPoints,
        }
    }
}