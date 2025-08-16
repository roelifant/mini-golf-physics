import { ICurveablePoint, ICurveablePolygon, IPolygon, Shape } from "../contracts/Shapes";
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

    public static convertCubicBezierToPoints(
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

        return <IPolygon>{
            type: Shape.POLYGON,
            points: newPoints,
        }
    }

    public static convertHexToHSL(hexColor: number) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColor.toString(16));

        if(!result) {
            throw new Error('Failed to convert hex to HSL');
        }

        let r = parseInt(result[1], 16);
        let g = parseInt(result[2], 16);
        let b = parseInt(result[3], 16);

        r /= 255, g /= 255, b /= 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h: number = (max + min) / 2;
        let s: number = (max + min) / 2;
        let l: number = (max + min) / 2;

        if(max == min){
            h = s = 0; // achromatic
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch(max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        s = s*100;
        s = s;
        l = l*100;
        l = l;
        h = Math.round(360*h);

        return {h,s,l};
    }

    public static convertHSLToHex(h: number, s: number, l: number): string {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = (n: number) => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }
}